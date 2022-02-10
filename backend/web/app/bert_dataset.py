import torch


class BERTDataSet(Dataset):
    def __init__(self, sentences, tokenizer):
        self.sentences = sentences
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.sentences)

    def __getitem__(self, idx):
        sentence = self.sentences[idx]
        bert_sens = self.tokenizer.encode_plus(
            sentence,
            # [CLS],[SEP]
            add_special_tokens=True,
            max_length=512,
            # add padding to blank
            pad_to_max_length=True,
            return_attention_mask=True,
            padding='max_length')

        ids = torch.tensor(bert_sens['input_ids'], dtype=torch.long)
        mask = torch.tensor(bert_sens['attention_mask'], dtype=torch.long)
        token_type_ids = torch.tensor(
            bert_sens['token_type_ids'], dtype=torch.long)

        return {
            'ids': ids,
            'mask': mask,
            'token_type_ids': token_type_ids
        }
