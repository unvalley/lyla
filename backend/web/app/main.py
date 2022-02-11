from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict
from score_regression_model import get_models, ScoreRegressionModel
import pandas as pd

app = FastAPI()


class AllScoringRequest(BaseModel):
    text: str


class AllScoringResponse(BaseModel):
    all_scores: Dict[str, float]


@app.get("/health")
def test():
    return {"res": "ok"}


@app.post("/predict/scores", response_model=AllScoringResponse)
async def predict_scores(request: AllScoringRequest):
    models = get_models()

    # TODO: 並列・並行処理化
    text_df = pd.DataFrame({'answer': [request.text]})
    logicality_result = models["logicality"].predict(text_df)

    # writing_result = models["writing"].predict(request.text)
    # validness_result = models["validness"].predict(request.text)
    # understanding_result = models["understanding"].predict(request.text)

    return AllScoringResponse(
        all_scores=dict(
            writing=0.0,
            understanding=0.0,
            validness=0.0,
            logicality=to_score(logicality_result["all_preds"])
        )
    )


def to_score(all_preds: list) -> float:
    score = pd.DataFrame(all_preds).transpose().mean(axis=1)
    return score
