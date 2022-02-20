from pydantic import BaseModel
from typing import Dict, Union, List, Any


class AllScoringRequest(BaseModel):
    text: str


class ScoringResponse(BaseModel):
    measurement: str
    score: float
    highlightIndex: int
    # attentions: Any


class ExampleTextResponse(BaseModel):
    exampleTexts: List[str]


class ExampleTextRequest(BaseModel):
    text:  str
