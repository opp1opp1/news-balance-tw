import Parser from 'rss-parser';

const parser = new Parser();

const UDN_RSS = 'https://udn.com/rssfeed/news/2/6638?ch=news'; // 目前使用的連結
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search?q=台灣&hl=zh-TW&gl=TW&ceid=TW:zh-Hant'; // Google News 台灣搜尋

(async () => {
  console.log('Testing UDN RSS...');
  try {
    const feed = await parser.parseURL(UDN_RSS);
    console.log(`✅ UDN Success! Found ${feed.items.length} items.`);
    console.log('Sample Title:', feed.items[0]?.title);
  } catch (error) {
    console.error('❌ UDN Failed:', error);
  }

  console.log('\nTesting Google News RSS...');
  try {
    const feed = await parser.parseURL(GOOGLE_NEWS_RSS);
    console.log(`✅ Google News Success! Found ${feed.items.length} items.`);
    console.log('Sample Title:', feed.items[0]?.title);
    console.log('Sample Source:', feed.items[0]?.source); // Google News items often have source info in title or metadata
  } catch (error) {
    console.error('❌ Google News Failed:', error);
  }
})();

