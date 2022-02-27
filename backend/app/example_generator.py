from transformers import T5Tokenizer, AutoModelForCausalLM

#################################################
# ExampleGenerator
#################################################


class ExampleGeneratorModel:
    def __init__(self, measurement_name: str):
        model_name = "rinna/japanese-gpt2-medium"
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.tokenizer.do_lower_case = True

        # TODO: example_generatorにモデルを置く
        pretrained_model_path = f"./assets/example_generator/global/processed/{measurement_name}/"
        self.model = AutoModelForCausalLM.from_pretrained(
            pretrained_model_path)

    def predict(self, text: str):
        # TODO: textに対して特殊トークンを入れる処理
        text = text.strip()
        text_len = len(text)
        inputText = self.tokenizer.encode(
            text, add_special_tokens=False, return_tensors="pt")

        print(text_len)
        output = self.model.generate(
            inputText,  do_sample=True, top_k=50, repetition_penalty=2.0, temperature=0.7, min_length=text_len+30, max_length=200)
        decoded_output = self.tokenizer.batch_decode(
            output, skip_spetial_tokens=True)
        print("ExampleGenerator predict", decoded_output)
        return decoded_output


logicality_model = ExampleGeneratorModel("logicality")
validness_model = ExampleGeneratorModel("validness")
understanding_model = ExampleGeneratorModel("understanding")
writing_model = ExampleGeneratorModel("writing")


def get_example_generator_models():
    return {
        "logicality": logicality_model,
        "validness": validness_model,
        "writing": writing_model,
        "understanding": understanding_model
    }
