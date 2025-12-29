import 'dotenv/config';
import { synthesizeNews } from '../lib/llm';
import { fetchAllNews } from '../lib/fetcher';

(async () => {
  console.log('Fetching news for LLM test...');
  const news = await fetchAllNews();
  
  if (news.length === 0) {
    console.log('No news fetched.');
    return;
  }

  // Take top 3 articles for testing
  const topStories = news.slice(0, 3);
  console.log('Selected articles:', topStories.map(a => a.title));
  
  console.log('------------------------------------------------');
  console.log('Calling Gemini API to synthesize...');
  
  const result = await synthesizeNews("今日焦點新聞", topStories);
  
  if (result) {
    console.log('------------------------------------------------');
    console.log('✅ Synthesis Successful!');
    console.log('Title:', result.title);
    console.log('Summary:', result.summary);
    console.log('Viewpoints:', JSON.stringify(result.viewpointDifferences, null, 2));
    console.log('------------------------------------------------');
  } else {
    console.error('❌ Synthesis Failed. Please check if GOOGLE_GENERATIVE_AI_API_KEY is set in .env or .env.local');
  }
})();
