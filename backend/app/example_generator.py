from transformers import T5Tokenizer, AutoModelForCausalLM

#################################################
# ExampleGenerator
#################################################


class ExampleGeneratorModel:
    def __init__(self):
        model_name = "rinna/japanese-gpt2-medium"
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.tokenizer.do_lower_case = True

        # TODO: example_generatorにモデルを置く
        pretrained_model_path = "../assets/example_generator/"
        self.model = AutoModelForCausalLM.from_pretrained(model_name)

    def predict(self, text: str):
        # TODO: textに対して特殊トークンを入れる処理
        inputText = self.tokenizer.encode(
            text, add_special_tokens=False, return_tensors="pt")

        output = self.model.generate(
            inputText, do_sample=True, num_return_sequences=3)
        return self.tokenizer.batch_decode(output)


example_generator_model = ExampleGeneratorModel()


def get_example_generator_model():
    return example_generator_model
