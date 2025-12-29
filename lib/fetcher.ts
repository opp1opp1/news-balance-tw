import Parser from 'rss-parser';
import { NewsItem, NewsSource } from './types';

const parser = new Parser({
    customFields: {
        item: [
            ['image', 'image'],
        ]
    }
});

// Helper to encode Google News URLs properly
function getGoogleNewsUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `https://news.google.com/rss/search?q=${encodedQuery}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
}

export const NEWS_SOURCES: NewsSource[] = [
  // --- 台灣本土媒體 ---
  {
    id: 'pts',
    name: '公視新聞',
    url: 'https://news.pts.org.tw',
    rssUrl: 'https://news.pts.org.tw/xml/newsfeed.xml',
  },
  {
    id: 'ltn',
    name: '自由時報',
    url: 'https://news.ltn.com.tw',
    rssUrl: 'https://news.ltn.com.tw/rss/all.xml',
  },
  {
    id: 'udn',
    name: '聯合報', 
    url: 'https://udn.com',
    rssUrl: getGoogleNewsUrl('site:udn.com when:1d'),
  },
  {
    id: 'chinatimes',
    name: '中時新聞網', 
    url: 'https://www.chinatimes.com',
    rssUrl: getGoogleNewsUrl('site:chinatimes.com when:1d'),
  },
  {
    id: 'tvbs',
    name: 'TVBS', 
    url: 'https://news.tvbs.com.tw',
    rssUrl: getGoogleNewsUrl('site:news.tvbs.com.tw when:1d'),
  },
  {
    id: 'ettoday',
    name: 'ETtoday', 
    url: 'https://www.ettoday.net',
    rssUrl: getGoogleNewsUrl('site:ettoday.net when:1d'),
  },

  // --- 國際媒體 (International) ---
  {
    id: 'bbc-zw',
    name: 'BBC中文',
    url: 'https://www.bbc.com/zhongwen/trad',
    rssUrl: 'https://feeds.bbci.co.uk/zhongwen/trad/rss.xml',
  },
  {
    id: 'cnn',
    name: 'CNN', // English Source (LLM will translate/synthesize)
    url: 'https://edition.cnn.com',
    rssUrl: 'http://rss.cnn.com/rss/edition_asia.rss',
  },

  // --- 綜合聚合 ---
  {
    id: 'google-top',
    name: 'Google焦點',
    url: 'https://news.google.com',
    rssUrl: getGoogleNewsUrl('台灣'),
  }
];

export async function fetchNewsFromSource(source: NewsSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    return feed.items.map((item) => {
      // Clean up title for Google News items
      let title = item.title || 'No Title';
      // For Google News sources, strip the suffix
      if (source.rssUrl.includes('news.google.com')) { 
         const parts = title.split(' - ');
         if (parts.length > 1) {
             title = parts.slice(0, -1).join(' - ');
         }
      }

      // Determine source name
      let itemSource = source.name;
      if (source.id === 'google-top' && item.title) {
          const parts = item.title.split(' - ');
          if (parts.length > 1) {
              itemSource = parts[parts.length - 1]; 
          }
      }

      return {
        title: title,
        link: item.link || '',
        pubDate: item.pubDate || '',
        content: item.contentSnippet || item.content || '',
        source: itemSource,
        guid: item.guid || item.link,
      };
    });
  } catch (error) {
    console.error(`Error fetching news from ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const promises = NEWS_SOURCES.map((source) => fetchNewsFromSource(source));
  const results = await Promise.all(promises);
  
  const allItems = results.flat();
  
  // Deduplication
  const uniqueItems = new Map();
  allItems.forEach(item => {
      // Key: Title (first 20 chars) + Source
      const key = item.title.substring(0, 20) + item.source;
      if (!uniqueItems.has(key)) {
          uniqueItems.set(key, item);
      }
  });

  return Array.from(uniqueItems.values()).sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}