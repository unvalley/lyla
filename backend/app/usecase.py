import torch
import numpy as np
from collections import defaultdict
from typing import Dict, Union, List, Any


class AttentionHandler():
    def __init__(self, all_preds: list, all_attentions: list, batch, tokenizer):
        self.predictions = all_preds
        self.attention_weight = all_attentions[0][-1]
        self.batch = batch
        self.tokenizer = tokenizer

    def create_word_to_attention(self):
        word_to_attention = defaultdict(float)

        for i in range(len(self.predictions[0])):
            first_sentence_ids = self.batch['ids'][i].numpy()
            sentence = self.tokenizer.convert_ids_to_tokens(first_sentence_ids)
            pred = self.predictions[0][i]

            seq_len = self.attention_weight.size()[2]
            all_attens = create_all_attens(i, self.attention_weight, seq_len)
            new_sentence = _filter_by_list(
                sentence, ["[CLS]", "[SEP]", "[PAD]"])

            # NOTE: 現状，シンプルに各文章のattentionのsumをとっている
            # → 変更案としては，attentionのsumを単語数で割るなど
            # sentences_attentions[n]は，sentenceのn文目のattentionの合計値
            # = sentences_attentions[0] = 0文目に出てくる単語のattentionの合計値
            sentences_attentions = []
            sum_of_attention = 0.0
            for idx, (word, attn) in enumerate(zip(sentence, all_attens)):
                word = word.replace("#", "")
                if word == "[SEP]":
                    break
                if word == "[CLS]":
                    continue
                # 。 以外の場合も対処
                if word in "。":
                    sentences_attentions.append(sum_of_attention)
                    sum_of_attention = 0.0
                    continue

                sum_of_attention += attn.item()
                word_to_attention[word] = attn.item()

            max_value = max(sentences_attentions)
            fixable_sentence_index = sentences_attentions.index(max_value)
            # TODO: fixable_sentence_indexをハイライトすべきsentenceとする
            # - フロントでは，このsentenceをハイライトするようにすればいい
            # - 文章の区切りは上のforループの。と同じ
        return dict(word_to_attention)

    def calc_highlight_target_index(self):
        for i in range(len(self.predictions[0])):
            first_sentence_ids = self.batch['ids'][i].numpy()
            sentence = self.tokenizer.convert_ids_to_tokens(first_sentence_ids)
            pred = self.predictions[0][i]

            seq_len = self.attention_weight.size()[2]
            all_attens = self._create_all_attens(
                i, self.attention_weight, seq_len)
            new_sentence = self._filter_by_list(
                sentence, ["[CLS]", "[SEP]", "[PAD]"])

            # sentenceごとに回せたら一番いい…
            # NOTE: 現状，シンプルに各文章のattentionのsumをとっている
            # → 変更案としては，attentionのsumを単語数で割るなど
            # sentences_attentions[n]は，sentenceのn文目のattentionの合計値
            # = sentences_attentions[0] = 0文目に出てくる単語のattentionの合計値
            sentences_attentions = []
            current_sentence_word_count = 0  # 現在のsentenceに含まれるwordの数を保持
            sum_of_attention = 0.0
            for idx, (word, attn) in enumerate(zip(sentence, all_attens)):
                word = word.replace("#", "")
                if word == "[SEP]":
                    break
                if word == "[CLS]":
                    continue
                # 。 以外の場合も対処
                if word in "。" or word in "．":
                    attention_by_word_count = sum_of_attention/current_sentence_word_count
                    sentences_attentions.append(attention_by_word_count)
                    sum_of_attention = 0.0
                    current_sentence_word_count = 0
                    continue
                sum_of_attention += attn.item()
                current_sentence_word_count += 1

            # TODO: fixable_sentence_indexをハイライトすべきsentenceとする
            # - フロントでは，このsentenceをハイライトするようにすればいい
            # - 文章の区切りは上のforループの。と同じ
            max_value = max(sentences_attentions)
            fixable_sentence_index = sentences_attentions.index(max_value)
        return fixable_sentence_index

    def _filter_by_list(self, sentence, filter_list: List[str]):
        return [s for s in sentence if s not in filter_list]

    def _create_all_attens(self, i: int, attention_weight, seq_len):
        all_attens = torch.zeros(seq_len)
        for j in range(12):
            all_attens += attention_weight[i, j, 0, :]
        return all_attens
