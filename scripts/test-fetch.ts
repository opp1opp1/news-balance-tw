import { fetchAllNews } from '../lib/fetcher';

(async () => {
  console.log('Starting news fetch...');
  const news = await fetchAllNews();
  console.log('------------------------------------------------');
  console.log(`Successfully fetched ${news.length} news items.`);
  if (news.length > 0) {
    console.log('Latest Item Sample:');
    console.log(`Title: ${news[0].title}`);
    console.log(`Source: ${news[0].source}`);
    console.log(`Date: ${news[0].pubDate}`);
  }
  console.log('------------------------------------------------');
})();
