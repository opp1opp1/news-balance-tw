import { fetchAllNews } from '../lib/fetcher';
import fs from 'fs';
import path from 'path';

(async () => {
  const news = await fetchAllNews();
  const outputPath = path.join(process.cwd(), 'debug-news.json');
  fs.writeFileSync(outputPath, JSON.stringify(news.slice(0, 3), null, 2), 'utf-8');
  console.log('Saved to debug-news.json');
})();
