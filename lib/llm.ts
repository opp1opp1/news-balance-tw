import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, SynthesisResult, NewsCluster } from './types';
import { generateCacheKey, getFromCache, saveToCache } from './cache';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

// Strict Fallback Chain as requested by user
const MODELS_TO_TRY = [
  'gemini-3-flash',        
  'gemini-2.5-flash',      
  'gemini-2.5-flash-lite', 
  'gemma-3-27b'            
];

async function generateWithFallback(prompt: string, jsonMode: boolean = true): Promise<string | null> {
  if (!apiKey) {
    console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[LLM] Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`[LLM] ✅ Success with ${modelName}`);
        return text;
      }
    } catch (error: any) {
      const msg = error.message || '';
      console.warn(`[LLM] ⚠️ Failed with ${modelName}: ${msg.split('\n')[0]}`);
      
      if (msg.includes('404') || msg.includes('not found') || msg.includes('429') || msg.includes('400')) {
        continue; // Try next model
      }
      break;
    }
  }

  console.error('[LLM] ❌ All models failed.');
  return null;
}

function getStableSignature(articles: NewsItem[]): string {
  const sorted = [...articles].sort((a, b) => a.title.localeCompare(b.title));
  return sorted.map(a => `${a.title}|${a.source}`).join('||');
}

export async function clusterNews(articles: NewsItem[]): Promise<NewsCluster[]> {
  const signature = getStableSignature(articles);
  const cacheKey = generateCacheKey('clustering', signature);
  
  const cached = getFromCache<NewsCluster[]>(cacheKey, 1800);
  if (cached) {
    console.log('[Cache] 🎯 Clustering cache HIT');
    return cached;
  }
  console.log('[Cache] 💨 Clustering cache MISS');

  const inputList = articles.map((a, i) => `ID: ${i} | Title: ${a.title} | Source: ${a.source}`).join('\n');

  const prompt = `
    You are a professional news editor. Your task is to group the following news articles into distinct topics (clusters).
    
    Rules:
    1. Group articles that report on the EXACT SAME event or issue.
    2. Ignore generic or standalone articles that don't have related coverage.
    3. Each cluster must have at least 2 articles.
    4. Limit to top 15 most significant topics.
    5. Output MUST be in Traditional Chinese (Taiwan).
    6. Return the result in this JSON format:
    [
      {
        "topic": "Concise Topic Name (Traditional Chinese)",
        "mainCategory": "Politics/Economy/Society/International/Sports",
        "articleIndices": [0, 5, 8]
      }
    ]

    Articles List:
    ${inputList}
  `;

  const jsonText = await generateWithFallback(prompt, true);
  
  if (jsonText) {
    try {
      const result = JSON.parse(jsonText) as NewsCluster[];
      saveToCache(cacheKey, result);
      return result;
    } catch (e) {
      console.error('[LLM] Error parsing clustering JSON', e);
    }
  }
  return [];
}

export async function synthesizeNews(topic: string, articles: NewsItem[]): Promise<SynthesisResult | null> {
  const signature = getStableSignature(articles);
  const cacheKey = generateCacheKey(`synthesis_${topic}`, signature);

  const cached = getFromCache<SynthesisResult>(cacheKey, 7200);
  if (cached) {
    console.log(`[Cache] 🎯 Synthesis cache HIT for: ${topic}`);
    return cached;
  }
  console.log(`[Cache] 💨 Synthesis cache MISS for: ${topic}`);

  const articlesText = articles.map((a, i) => `
    [Article ${i + 1}]
    Source: ${a.source}
    Title: ${a.title}
    Content: ${a.content}
  `).join('\n\n');

  const prompt = `
    You are an expert, neutral news editor and analyzer in Taiwan.
    Your task is to analyze the following news articles about the topic: "${topic}".
    The articles may come from sources with different political leanings (e.g., Pan-Blue, Pan-Green, Neutral).

    Please perform the following tasks:
    1. Identify the common facts reported by all sources.
    2. Identify the specific viewpoints or subjective interpretations from each source.
    3. Synthesize a neutral, objective news report that covers the key information without bias.
    4. Generate a neutral title.

    IMPORTANT: ALL Output MUST be in Traditional Chinese (Taiwan).

    Return the result in the following JSON format:
    {
      "title": "A neutral title (Traditional Chinese)",
      "summary": "A short summary of the event (2-3 sentences)",
      "factList": ["Fact 1", "Fact 2", ...],
      "viewpointDifferences": [
        { "source": "Source Name", "viewpoint": "How this source interprets the event..." }
      ],
      "balancedContent": "A full-length, objective article combining all facts."
    }

    Articles:
    ${articlesText}
  `;

  const jsonText = await generateWithFallback(prompt, true);

  if (jsonText) {
    try {
      const result = JSON.parse(jsonText) as SynthesisResult;
      saveToCache(cacheKey, result);
      return result;
    } catch (e) {
      console.error('[LLM] Error parsing synthesis JSON', e);
    }
  }
  return null;
}
