import numpy as np
import transformers
import os
import torch
import pandas as pd
import concurrent.futures as confu
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict, Union, List, Any
from transformers import T5Tokenizer, AutoModelForCausalLM
from torch.utils.data import Dataset, DataLoader
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,   # 追記により追加
    allow_methods=["*"],      # 追記により追加
    allow_headers=["*"]       # 追記により追加
)


class AllScoringRequest(BaseModel):
    text: str


class ScoringResponse(BaseModel):
    measurement: str
    score: float
    attentions: Any


@app.get("/health")
def test():
    return {"res": "ok"}


def to_score(all_preds: list) -> float:
    pred = pd.DataFrame(all_preds).transpose().mean(axis=1)
    score = pred * 2 * 10
    return score


def create_word_to_attention(all_preds: list, all_attentions: list, batch, tokenizer):
    target_batch_attentions = all_attentions[0]
    attention_weight = target_batch_attentions[-1]
    word_to_attention = defaultdict(float)

    for i in range(len(all_preds[0])):
        first_sentence_ids = batch['ids'][i].numpy()
        sentence = tokenizer.convert_ids_to_tokens(first_sentence_ids)
        pred = all_preds[0][i]
        seq_len = attention_weight.size()[2]

        all_attens = torch.zeros(seq_len)
        for j in range(12):
            all_attens += attention_weight[i, j, 0, :]

        for word, attn in zip(sentence, all_attens):
            if word == "[SEP]":
                break
            word_to_attention[word] = attn.item()
    return dict(word_to_attention)


@app.post("/predict/scores", response_model=List[ScoringResponse])
async def predict_scores(request: AllScoringRequest):
    models = get_score_regression_models()

    # TODO: パフォーマンス改善
    text_df = pd.DataFrame({'answer': [request.text]})
    BERT_MODEL = "cl-tohoku/bert-base-japanese-whole-word-masking"
    tokenizer = transformers.BertJapaneseTokenizer.from_pretrained(
        BERT_MODEL, output_attentions=True)

    with confu.ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
        logicality_future = executor.submit(
            models["logicality"].predict, text_df)
        validness_future = executor.submit(
            models["validness"].predict, text_df)
        understanding_future = executor.submit(
            models["understanding"].predict, text_df)
        writing_future = executor.submit(models["writing"].predict, text_df)

        l_res = logicality_future.result()
        v_res = validness_future.result()
        u_res = understanding_future.result()
        w_res = writing_future.result()

        # attentionの追加
        result = [
            ScoringResponse(
                measurement='論理性',
                score=to_score(l_res["all_preds"]),
                attentions=create_word_to_attention(
                    l_res["all_preds"], l_res["all_attentions"], next(iter(l_res["data_loader"])), tokenizer)
            ),
            ScoringResponse(
                measurement='妥当性',
                score=to_score(v_res["all_preds"]),
                attentions=create_word_to_attention(
                    v_res["all_preds"], v_res["all_attentions"], next(iter(v_res["data_loader"])), tokenizer)
            ),
            ScoringResponse(
                measurement='理解力',
                score=to_score(u_res["all_preds"]),
                attentions=create_word_to_attention(
                    u_res["all_preds"], u_res["all_attentions"], next(iter(u_res["data_loader"])), tokenizer)
            ),
            ScoringResponse(
                measurement='文章力',
                score=to_score(w_res["all_preds"]),
                attentions=create_word_to_attention(
                    w_res["all_preds"], w_res["all_attentions"], next(iter(w_res["data_loader"])), tokenizer)
            ),
        ]

        return result


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
# ScoringRegressor
#################################################


BERT_MODEL = "cl-tohoku/bert-base-japanese-whole-word-masking"

# fold=0を評価データにして作成したモデルを，訓練済みモデルとしている
# - 学習データは，グローバルの小論文課題の回答・スコアデータ
measurementToPreTrainedModel = {
    "logicality": "./assets/scoring/scoring_regressor_logicality_model.pth",
    "validness": "./assets/scoring/scoring_regressor_validness_model.pth",
    "understanding": "./assets/scoring/scoring_regressor_understanding_model.pth",
    "writing": "./assets/scoring/scoring_regressor_writing_model.pth",
}


class ScoreRegressionModel:
    def __init__(self, measurement: str, tokenizer):
        self.device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = tokenizer

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

        result = {"all_preds": all_preds,
                  "all_attentions": all_attentions, "data_loader": data_loader}
        return result


tokenizer = transformers.BertJapaneseTokenizer.from_pretrained(
    BERT_MODEL, output_attentions=True)
logicality_model = ScoreRegressionModel("logicality", tokenizer)
validness_model = ScoreRegressionModel("validness", tokenizer)
understanding_model = ScoreRegressionModel("understanding", tokenizer)
writing_model = ScoreRegressionModel("writing", tokenizer)


# singleton
def get_score_regression_models():
    return {
        "logicality": logicality_model,
        "validness": validness_model,
        "writing": writing_model,
        "understanding": understanding_model
    }
