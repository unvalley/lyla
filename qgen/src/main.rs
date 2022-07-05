use std::{collections::HashMap, env, error};

mod bing_api;
mod document_processor;

#[tokio::main]
async fn main() -> Result<(), Box<dyn error::Error>> {
    dotenv::from_filename(".env").ok();
    let document_content = "木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた".to_string();

    let document_processor = document_processor::DocumentProcessor::new(document_content.clone());
    let important_words = document_processor
        .find_important_words()
        .await?
        .into_iter()
        .flatten()
        .collect::<Vec<String>>();

    let bing_api_wrapper = bing_api::BingAPIWrapper::new(env::var("BING_SEARCH_API_KEY").unwrap());

    let mut query_to_search_actions: HashMap<String, Vec<bing_api::SearchAction>> = HashMap::new();

    for word in important_words {
        let search_results = bing_api_wrapper.find_search_results(word.clone()).await?;
        query_to_search_actions
            .entry(word.clone())
            .or_insert(search_results);
    }

    dbg!(query_to_search_actions);
    Ok(())
}
