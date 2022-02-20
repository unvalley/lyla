import numpy as np
import transformers
import os
import torch
import pandas as pd
import concurrent.futures as confu
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict, Union, List, Any
from torch.utils.data import Dataset, DataLoader
from fastapi.middleware.cors import CORSMiddleware
# --
from app.example_generator import *
from app.schema import *
from app.score_regression import *
from app.bert_dataset import *
from app.usecase import *


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


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

        l_atten_handler = AttentionHandler(l_res["all_preds"], l_res["all_attentions"], next(
            iter(l_res["data_loader"])), tokenizer)
        v_atten_handler = AttentionHandler(v_res["all_preds"], v_res["all_attentions"], next(
            iter(v_res["data_loader"])), tokenizer)
        u_atten_handler = AttentionHandler(u_res["all_preds"], u_res["all_attentions"], next(
            iter(u_res["data_loader"])), tokenizer)
        w_atten_handler = AttentionHandler(w_res["all_preds"], w_res["all_attentions"], next(
            iter(w_res["data_loader"])), tokenizer)

        # attentionの追加
        result = [
            ScoringResponse(
                measurement='論理性',
                score=to_score(l_res["all_preds"]),
                highlightIndex=l_atten_handler.calc_highlight_target_index()),
            ScoringResponse(
                measurement='妥当性',
                score=to_score(v_res["all_preds"]),
                highlightIndex=v_atten_handler.calc_highlight_target_index()),
            ScoringResponse(
                measurement='理解力',
                score=to_score(u_res["all_preds"]),
                highlightIndex=u_atten_handler.calc_highlight_target_index()),
            ScoringResponse(
                measurement='文章力',
                score=to_score(w_res["all_preds"]),
                highlightIndex=w_atten_handler.calc_highlight_target_index()),
        ]
        return result


@app.post("/predict/example_text", response_model=ExampleTextResponse)
async def predict_example_text(request: ExampleTextRequest):
    # 入力をどうするかとか考える必要あるけど，とりあえずtextを受け取ってtextのリストを返せればOK
    # input: Attentionの重いテキストを入力とする
    model = get_example_generator_model()
    result = model.predict(request.text)
    return {"exampleTexts": result}


def to_score(all_preds: list) -> float:
    pred = pd.DataFrame(all_preds).transpose().mean(axis=1)
    score = pred * 2 * 10
    return score
