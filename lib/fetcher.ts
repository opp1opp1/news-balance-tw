import Parser from 'rss-parser';
import { NewsItem, NewsSource } from './types';

const parser = new Parser({
    customFields: {
        item: [
            ['image', 'image'], // Try to extract image if available
        ]
    }
});

// Helper to encode Google News URLs properly
function getGoogleNewsUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `https://news.google.com/rss/search?q=${encodedQuery}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
}

export const NEWS_SOURCES: NewsSource[] = [
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
    name: '聯合報', // Using Google News as proxy
    url: 'https://udn.com',
    rssUrl: getGoogleNewsUrl('site:udn.com when:1d'),
  },
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
      // Clean up title for Google News items (remove " - Media Name")
      let title = item.title || 'No Title';
      if (source.id === 'udn' || source.id === 'google-top') {
         const parts = title.split(' - ');
         if (parts.length > 1) {
             // Keep the title part, discard the source part at the end
             title = parts.slice(0, -1).join(' - ');
         }
      }

      // Determine source name for Google Top items (which come from various sources)
      let itemSource = source.name;
      if (source.id === 'google-top' && item.title) {
          const parts = item.title.split(' - ');
          if (parts.length > 1) {
              itemSource = parts[parts.length - 1]; // Last part is usually the source name
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
  
  // Flatten and deduplicate by link or title (simple check)
  const allItems = results.flat();
  
  // Simple deduplication based on normalized title
  const uniqueItems = new Map();
  allItems.forEach(item => {
      // Create a key for deduping: first 20 chars of title + source
      const key = item.title.substring(0, 30) + item.source;
      if (!uniqueItems.has(key)) {
          uniqueItems.set(key, item);
      }
  });

  return Array.from(uniqueItems.values()).sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}