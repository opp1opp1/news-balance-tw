import fetch from 'node-fetch';

(async () => {
  try {
    const response = await fetch('https://udn.com/rssfeed/news/2/6638?ch=news');
    const text = await response.text();
    console.log('--- UDN RSS Start ---');
    console.log(text.substring(0, 1000)); // Print first 1000 chars
    console.log('--- UDN RSS End ---');
  } catch (error) {
    console.error('Fetch error:', error);
  }
})();
