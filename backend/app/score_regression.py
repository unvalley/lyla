import numpy as np
import transformers
import os
import torch
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from app.bert_dataset import *

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
