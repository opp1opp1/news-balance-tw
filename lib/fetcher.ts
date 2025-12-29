import Parser from 'rss-parser';
import { NewsItem, NewsSource } from './types';

const parser = new Parser();

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'pts',
    name: '公視新聞',
    url: 'https://news.pts.org.tw',
    rssUrl: 'https://news.pts.org.tw/xml/newsfeed.xml',
  },
  {
    id: 'udn',
    name: '聯合報',
    url: 'https://udn.com',
    rssUrl: 'https://udn.com/rssfeed/news/2/6638?ch=news', // 要聞
  },
  {
    id: 'ltn',
    name: '自由時報',
    url: 'https://news.ltn.com.tw',
    rssUrl: 'https://news.ltn.com.tw/rss/all.xml',
  },
];

export async function fetchNewsFromSource(source: NewsSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    return feed.items.map((item) => ({
      title: item.title || 'No Title',
      link: item.link || '',
      pubDate: item.pubDate || '',
      content: item.contentSnippet || item.content || '',
      source: source.name,
      guid: item.guid,
    }));
  } catch (error) {
    console.error(`Error fetching news from ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const promises = NEWS_SOURCES.map((source) => fetchNewsFromSource(source));
  const results = await Promise.all(promises);
  // Flatten the array
  return results.flat().sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}
