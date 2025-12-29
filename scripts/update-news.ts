import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fetchAllNews } from '../lib/fetcher';
import { clusterNews, synthesizeNews } from '../lib/llm';
import { NewsItem, NewsCluster } from '../lib/types';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const DATA_FILE = path.join(process.cwd(), 'data', 'latest-report.json');

interface ReportData {
  updatedAt: string;
  clusteredTopics: {
    topic: string;
    synthesis: any;
    originalArticles: NewsItem[];
  }[];
  unclusteredNews: NewsItem[];
}

async function runUpdate() {
  console.log('🚀 Starting news update process...');
  const startTime = Date.now();

  // 1. Fetch News (Larger batch)
  console.log('📥 Fetching news sources...');
  const allNews = await fetchAllNews();
  console.log(`✅ Fetched ${allNews.length} articles.`);

  if (allNews.length === 0) {
    console.error('❌ No news fetched. Aborting update.');
    return;
  }

  // 2. Cluster News (Use 200 articles for deep clustering)
  console.log('🧩 Clustering news topics...');
  const newsToCluster = allNews.slice(0, 200);
  const clusters = await clusterNews(newsToCluster);
  console.log(`✅ Found ${clusters.length} topics.`);

  // 3. Synthesize Top Topics (Analyze Top 10)
  console.log('🤖 Synthesizing top topics...');
  const topClusters = clusters.slice(0, 10);
  const clusteredIndices = new Set<number>();
  const clusteredTopics = [];

  for (const cluster of topClusters) {
    console.log(`   - Analyzing topic: ${cluster.topic} (${cluster.articleIndices.length} articles)...`);
    
    // Mark indices
    cluster.articleIndices.forEach(idx => clusteredIndices.add(idx));
    
    const clusterArticles = cluster.articleIndices
      .map(index => newsToCluster[index])
      .filter(Boolean);

    if (clusterArticles.length > 0) {
      // Small delay to be nice to API even with paid plan
      await new Promise(r => setTimeout(r, 1000));
      
      const result = await synthesizeNews(cluster.topic, clusterArticles);
      if (result) {
        clusteredTopics.push({
          topic: cluster.topic,
          synthesis: result,
          originalArticles: clusterArticles
        });
        console.log(`     ✅ Done.`);
      } else {
        console.log(`     ❌ Failed.`);
      }
    }
  }

  // 4. Prepare Unclustered News
  const unclusteredNews = allNews.filter((_, idx) => !clusteredIndices.has(idx));

  // 5. Save Report
  const report: ReportData = {
    updatedAt: new Date().toISOString(),
    clusteredTopics,
    unclusteredNews
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(report, null, 2));
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`🎉 Update complete in ${duration}s! Saved to ${DATA_FILE}`);
}

// Execute
runUpdate();
