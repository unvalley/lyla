use lindera::tokenizer::Tokenizer;
use std::error;

pub struct DocumentProcessor {
    input: String,
    tokenizer: Tokenizer,
}

impl DocumentProcessor {
    pub fn new(input: String) -> DocumentProcessor {
        let tokenizer = Tokenizer::new().unwrap();
        DocumentProcessor { input, tokenizer }
    }

    pub fn tfidf(&self) -> Result<(), Box<dyn error::Error>> {
        Ok(())
    }

    pub fn find_important_words(&self, tfidf_lambda_api_url: String) -> Vec<String> {
        self.tfidf();
        return vec![self.input.to_string()];
    }
}
