use lindera::tokenizer::{Token, Tokenizer};
use serde::Deserialize;
use std::{collections::HashMap, env, error};

pub struct DocumentProcessor {
    input: String,
    tokenizer: Tokenizer,
}

#[derive(Debug, Deserialize)]
struct TfidfResponse {
    status: usize,
    body: Vec<Vec<String>>,
}

impl DocumentProcessor {
    pub fn new(input: String) -> DocumentProcessor {
        let tokenizer = Tokenizer::new().unwrap();
        DocumentProcessor { input, tokenizer }
    }

    async fn tokenize_input(&self) -> Result<Vec<Token>, Box<dyn error::Error>> {
        let tokens = self.tokenizer.tokenize(&self.input)?;
        Ok(tokens)
    }

    pub async fn tfidf(
        &self,
        tokens: Vec<Token<'_>>,
    ) -> Result<TfidfResponse, Box<dyn error::Error>> {
        let client = reqwest::Client::new();
        let mut map = HashMap::new();
        map.insert("tokens", tokens);

        let res = client
            .post("http//localhost:8000/tfidf")
            .json(&map)
            .send()
            .await?
            .json::<TfidfResponse>()
            .await?;
        Ok(res)
    }

    pub async fn find_important_words(&self) -> Result<Vec<Vec<String>>, Box<dyn error::Error>> {
        let tokens = self.tokenize_input().await?;
        let tfidf_result = self.tfidf(tokens).await?;
        Ok(tfidf_result.body)
    }
}
