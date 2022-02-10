from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict
from score_regression_model import get_model, ScoreRegressionModel


app = FastAPI()


class AllScoringRequest(BaseModel):
    text: str


class AllScoringResponse(BaseModel):
    all_scores: Dict[str, float]


@app.get("/predict/scores", response_model=AllScoringResponse)
async def predict_scores(request: AllScoringRequest):
    models = get_models()

    # TODO: 並列・並行処理化
    writing_result = models["writing"].predict(request.text)
    validness_result = models["validness"].predict(request.text)
    logicality_result = models["logicality"].predict(request.text)
    understanding_result = models["understanding"].predict(request.text)

    return AllScoringResponse(
        all_scores=dict(
            writing=writing_result,
            understanding=understanding_result,
            validness=validness_result,
            logicality=logicality_result
        )
    )
