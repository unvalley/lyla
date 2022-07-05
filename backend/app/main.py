import numpy as np
import os
import pandas as pd
import concurrent.futures as confu
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Dict, Union, List, Any
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer

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



class TfidfRequest(BaseModel):
    text: str

class TfidfResponse(BaseModel):
    text: str


def get_tfidf(all_entities: list[str]):
    """ TFIDFを計算し，その値を返す
        all_enttiesは，spaceで分けた観点の文章のリスト
        all_enttiites(文書群) = [
            "部屋 スタッフ 景色",               <= ホテル1の全エンティティ
            "城　ホテル　見晴らし　温泉",        <= ホテル2の全エンティティ
            "トイレ　浴槽　駅　駐車場",          <= ホテル3の全エンティティ
            ...
        ]
    """
    # normとsmooothをオフにするには，norm=None, smooth_idf=Falseを加える
    vectorizer = TfidfVectorizer(
        token_pattern=u'(?u)\S+', lowercase=False, stop_words=None, max_df=0.5, min_df=0.05)
    # 文書内の全単語のTF-IDF値を取得
    tfidf = vectorizer.fit_transform(all_entities)

    # 単語毎のTFIDF値配列: TF-IDF行列: [1つめの文書に対する各単語のベクトル値, ...]
    tfidf_matrix = tfidf.toarray()
    # index順の単語リスト
    words = vectorizer.get_feature_names()
    all_tfidfs = []

    for doc_idx, vec in zip(range(len(all_entities)), tfidf_matrix):
        tfudfs = []
        # 全文書にて，TFIDF値を単語順にソートして統一する
        for word_idx, tfidf_value in sorted(enumerate(vec), key=lambda x: x[1], reverse=True):
            word = words[word_idx]
            tfudfs.append([word, float(tfidf_value)])
        all_tfidfs.append(tfudfs)
    return all_tfidfs

@app.post("/tfidf", response_model=TfidfResponse)
async def calculate_tfidf(request: TfidfRequest):
    text = request.text
    # TODO: 観点リストに変換
    tfidfs = get_tfidf([text])
    print(tfidfs)
    return 
