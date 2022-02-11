from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict, Union, List
from score_regression_model import get_score_regression_models, ScoreRegressionModel
import pandas as pd

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

    # writing_result = models["writing"].predict(request.text)
    # validness_result = models["validness"].predict(request.text)
    # understanding_result = models["understanding"].predict(request.text)

    # attentionの追加
    result = [
        dict(measurement='論理性', score=to_score(
            logicality_result["all_preds"])),
        dict(measurement='妥当性', score=to_score(
            logicality_result["all_preds"])),
        dict(measurement='理解力', score=to_score(
            logicality_result["all_preds"])),
        dict(measurement='文章力', score=to_score(
            logicality_result["all_preds"])),
    ]

    return AllScoringResponse(all_scores=result)


class ExampleTextResponse(BaseModel):
    text: str


@ app.post("/predict/example_text", response_model=ExampleTextResponse)
async def predict_example_text(request):
    # input: Attentionの重いテキストを入力とする
    return None
