import fetch from 'node-fetch';

(async () => {
  try {
    const response = await fetch('https://udn.com/rssfeed/news/1');
    const text = await response.text();
    console.log('--- UDN Realtime RSS Start ---');
    console.log(text.substring(0, 500)); 
    console.log('--- UDN RSS End ---');
  } catch (error) {
    console.error('Fetch error:', error);
  }
})();
