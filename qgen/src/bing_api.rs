use serde::Deserialize;
use std::{collections::HashMap, error};

pub struct BingAPIWrapper {
    api_url: String,
    api_key: String,
}

#[derive(Deserialize, Debug, PartialEq, Eq, Hash, Clone)]
pub struct SearchAction {
    displayText: String,
    query: String,
    searchKind: String,
    url: String,
}

#[derive(Deserialize, Debug)]
struct SuggestionGroups {
    name: String,
    searchSuggestions: Vec<SearchAction>,
}

#[derive(Deserialize, Debug)]
struct BingSuggestionAPIResponse {
    _type: String,
    queryContext: HashMap<String, String>,
    suggestionGroups: Vec<SuggestionGroups>,
}

impl BingAPIWrapper {
    pub fn new(api_key: String) -> BingAPIWrapper {
        BingAPIWrapper {
            api_url: "https://api.bing.microsoft.com/v7.0".to_string(),
            api_key,
        }
    }

    pub async fn find_search_results(
        &self,
        query: String,
    ) -> Result<Vec<SearchAction>, Box<dyn error::Error>> {
        let client = reqwest::Client::new();
        let bing_suggestions_api_url = format!("{}{}", self.api_url, "/suggestions");

        let resp = client
            .get(&bing_suggestions_api_url)
            .header("Ocp-Apim-Subscription-Key", &self.api_key)
            .query(&[("q", query), ("cc", "JP".to_string())])
            .send()
            .await?
            .json::<BingSuggestionAPIResponse>()
            .await?;

        let search_actions = resp.suggestionGroups[0].searchSuggestions.clone();
        Ok(search_actions)
    }
}
