import torch
import transformers


BASE_MODEL = "cl-tohoku/bert-base-japanese-whole-word-masking"
PRE_TRAINED_MODEL_LOGICALITY =


measurementToModel = {
    "logicality": "assets/model_all_logicality.pth",
    "validness": "assets/model_all_validness.pth",
    "understanding": "assets/model_all_understanding.pth",
    "writing": "assets/model_all_writing.pth",
}


class ScoreRegressionModel:
    def __init__(self, measurement: str):
        self.device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu')

        self.tokenizer = transformers.BertJapaneseTokenizer.from_pretrained(
            BERT_MODEL, output_attentions=True)

        regressor = transformers.BertForSequenceClassification.from_pretrained(
            BERT_MODEL, num_labels=1)
        state = torch.load(measurementToModel[measurement],
                           map_location=self.device)
        regressor.load_state_dict(state["state_dict"])

        # 順番ok?
        regressor = regressor.eval()
        self.regressor = regressor.to(self.device)

    def _prepare_data_loader(text: str):
        """ BERTモデルの入力用データに変換
        """
        data_set = BERTDataSet(text, self.tokenizetest["answer"])
        data_loader = DataLoader(
            data_set, batch_size=4, shuffle=False, num_workers=1, pin_memory=True)
        return data_loader

    def predict(self, text: str):
        """ 推論
        """
        all_preds, all_attentions = [], []
        # もしかして不要
        preds, attentions = [], []

        data_loader = self._prepare_data_loader(text)

        with torch.no_grad():
            for batch in data_loader:
                ids = batch["ids"].to(device)
                mask = batch["mask"].to(device)
                tokentype = batch["token_type_ids"].to(device)

                output = model(ids, mask, output_attentions=True)
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
validness_model = ScoreRegressionModel("validness")
understanding_model = ScoreRegressionModel("understanding")
writing_model = ScoreRegressionModel("writing")


# singleton
def get_models():
    return {
        "logicality": logicality_model,
        "validness": validness_model,
        "writing": writing_model,
        "understanding": understanding_model
    }
