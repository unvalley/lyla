import numpy as np
import transformers
import torch
import pandas as pd
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict, Union, List
from transformers import T5Tokenizer, AutoModelForCausalLM
from torch.utils.data import Dataset, DataLoader


app = FastAPI()


class AllScoringRequest(BaseModel):
    text: str


class AllScoringResponse(BaseModel):
    all_scores: List[Dict[str, Union[str, int]]]


@app.get("/health")
def test():
    return {"res": "ok"}


def to_score(all_preds: list) -> float:
    pred = pd.DataFrame(all_preds).transpose().mean(axis=1)
    score = pred * 2 * 10
    return score


@app.post("/predict/scores", response_model=AllScoringResponse)
async def predict_scores(request: AllScoringRequest):
    models = get_score_regression_models()

    # TODO: 並列・並行処理化
    text_df = pd.DataFrame({'answer': [request.text]})
    logicality_result = models["logicality"].predict(text_df)
    validness_result = models["validness"].predict(text_df)
    understanding_result = models["understanding"].predict(text_df)
    writing_result = models["writing"].predict(text_df)

    # attentionの追加
    # 多分attentionは圧縮しないと乗らない気がする
    result = [
        dict(measurement='論理性',
             score=to_score(logicality_result["all_preds"]),
             attentions=logicality_result["all_attentions"]),
        dict(measurement='妥当性',
             score=to_score(validness_result["all_preds"]),
             attentions=validness_result["all_attentions"]),
        dict(measurement='理解力',
             score=to_score(understanding_result["all_preds"]),
             attentions=understanding_result["all_attentions"]),
        dict(measurement='文章力',
             score=to_score(writing_result["all_preds"]),
             attentions=writing_result["all_attentions"]),
    ]

    return AllScoringResponse(all_scores=result)


class ExampleTextResponse(BaseModel):
    example_texts: List[str]


class ExampleTextRequest(BaseModel):
    text:  str


@ app.post("/predict/example_text", response_model=ExampleTextResponse)
async def predict_example_text(request: ExampleTextRequest):
    # 入力をどうするかとか考える必要あるけど，とりあえずtextを受け取ってtextのリストを返せればOK
    # input: Attentionの重いテキストを入力とする
    model = get_example_generator_model()
    result = model.predict(request.text)
    return {"example_texts": result}

#################################################
# BERTDataSet
#################################################


class BERTDataSet(Dataset):
    def __init__(self, sentences, tokenizer):
        self.sentences = sentences
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.sentences)

    def __getitem__(self, idx):
        sentence = self.sentences[idx]
        bert_sens = self.tokenizer.encode_plus(
            sentence,
            # [CLS],[SEP]
            add_special_tokens=True,
            max_length=512,
            # add padding to blank
            pad_to_max_length=True,
            return_attention_mask=True,
            padding='max_length')

        ids = torch.tensor(bert_sens['input_ids'], dtype=torch.long)
        mask = torch.tensor(bert_sens['attention_mask'], dtype=torch.long)
        token_type_ids = torch.tensor(
            bert_sens['token_type_ids'], dtype=torch.long)

        return {
            'ids': ids,
            'mask': mask,
            'token_type_ids': token_type_ids
        }

#################################################
# ExampleGenerator
#################################################


class ExampleGeneratorModel:
    def __init__(self):
        model_name = "rinna/japanese-gpt2-medium"
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.tokenizer.do_lower_case = True

        # TODO: example_generatorにモデルを置く
        pretrained_model_path = "../assets/example_generator/"
        self.model = AutoModelForCausalLM.from_pretrained(model_name)

    def predict(self, text: str):
        # TODO: textに対して特殊トークンを入れる処理
        inputText = self.tokenizer.encode(
            text, add_special_tokens=False, return_tensors="pt")

        output = self.model.generate(
            inputText, do_sample=True, num_return_sequences=3)
        return self.tokenizer.batch_decode(output)


example_generator_model = ExampleGeneratorModel()


def get_example_generator_model():
    return example_generator_model


#################################################
#
#################################################


BERT_MODEL = "cl-tohoku/bert-base-japanese-whole-word-masking"

# fold=0を評価データにして作成したモデルを，訓練済みモデルとしている
# - 学習データは，グローバルの小論文課題の回答・スコアデータ
measurementToPreTrainedModel = {
    "logicality": "./assets/scoring/model_all_logicality.pth",
    "validness": "assets/scoring/model_all_validness.pth",
    "understanding": "assets/scoring/model_all_understanding.pth",
    "writing": "assets/scoring/model_all_writing.pth",
}


class ScoreRegressionModel:
    def __init__(self, measurement: str):
        self.device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu')

        self.tokenizer = transformers.BertJapaneseTokenizer.from_pretrained(
            BERT_MODEL, output_attentions=True)

        regressor = transformers.BertForSequenceClassification.from_pretrained(
            BERT_MODEL, num_labels=1)
        state = torch.load(measurementToPreTrainedModel[measurement],
                           map_location=self.device)
        regressor.load_state_dict(state["state_dict"])

        regressor = regressor.eval()
        self.regressor = regressor.to(self.device)

    def _prepare_data_loader(self, text_df: pd.DataFrame):
        """ BERTモデルの入力用データに変換
        """
        data_set = BERTDataSet(text_df["answer"], self.tokenizer)
        data_loader = DataLoader(
            data_set, batch_size=4, shuffle=False, num_workers=1, pin_memory=True)
        return data_loader

    def predict(self, text_df: pd.DataFrame):
        """ 推論
        """
        all_preds, all_attentions = [], []
        # もしかして不要
        preds, attentions = [], []

        data_loader = self._prepare_data_loader(text_df)

        with torch.no_grad():
            for batch in data_loader:
                ids = batch["ids"].to(self.device)
                mask = batch["mask"].to(self.device)
                tokentype = batch["token_type_ids"].to(self.device)

                output = self.regressor(ids, mask, output_attentions=True)
                logits = output["logits"].squeeze(-1)
                preds.append(logits.cpu().numpy())
                attentions.append(output["attentions"])

            preds = np.concatenate(preds)
            attentions = np.concatenate(attentions)

            all_preds.append(preds)
            all_attentions.append(attentions)

        result = {"all_preds": all_preds, "all_attentions": all_attentions}
        return result


logicality_model = ScoreRegressionModel("logicality")
validness_model = ScoreRegressionModel("logicality")
understanding_model = ScoreRegressionModel("logicality")
writing_model = ScoreRegressionModel("logicality")


# singleton
def get_score_regression_models():
    return {
        "logicality": logicality_model,
        "validness": validness_model,
        "writing": writing_model,
        "understanding": understanding_model
    }
