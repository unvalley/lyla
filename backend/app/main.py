import pandas as pd
import example_generator_model
import score_regression_model
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict, Union, List


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
