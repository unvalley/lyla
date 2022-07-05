use std::{env,error, collections::HashMap};
use lindera::{tokenizer::Tokenizer};
use serde::Deserialize;


struct SentenceProcessor {
    input: String,
    tokenizer: Tokenizer
}

impl SentenceProcessor {
    pub fn new(input: String) -> SentenceProcessor {
        let tokenizer = Tokenizer::new().unwrap();
        SentenceProcessor { input, tokenizer }
    }
    
    pub fn find_important_words(&self) -> Vec<String> {
        return vec![self.input.to_string()];
    }
}

struct BingAPIWrapper {
    api_url: String,
    api_key: String,
}

#[derive(Deserialize, Debug)]
struct SuggestionGroups {
    name: String,
    searchSuggestions: Vec<HashMap<String, String>>
}

#[derive(Deserialize, Debug)]
struct BingSuggestionAPIResponse {
    _type: String,
    queryContext: HashMap<String, String>,
    suggestionGroups: Vec<SuggestionGroups>
}

impl BingAPIWrapper {
    pub fn new(api_url:String, api_key: String) -> BingAPIWrapper {
        BingAPIWrapper {api_url, api_key}
    }

    pub async fn find_search_results(&self, query: String) -> Result<BingSuggestionAPIResponse, Box<dyn error::Error>> {
        let client = reqwest::Client::new();
        let resp = client.get(&self.api_url)
            .header("Ocp-Apim-Subscription-Key", &self.api_key)
            .query(&[("q", query)])
            .send()
            .await?
            .json::<BingSuggestionAPIResponse>()
            .await?;
        
        dbg!(&resp);
        Ok(resp)
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn error::Error>> {
    dotenv::from_filename(".env").ok();
    let input = String::new();
    let sentence_processor = SentenceProcessor::new(input);
    let important_words = sentence_processor.find_important_words();
    
    let bing_suggestions_api_url = "https://api.bing.microsoft.com/v7.0/suggestions".to_string();
    let bing_search_api_key = env::var("BING_SEARCH_API_KEY").unwrap();

    let bing_api_wrapper = BingAPIWrapper::new(bing_suggestions_api_url, bing_search_api_key);
    let search_results = bing_api_wrapper.find_search_results("Rust".to_string()).await?;
    println!("{:?}", search_results);
    
    Ok(())
}
