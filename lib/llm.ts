import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, SynthesisResult, NewsCluster } from './types';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function clusterNews(articles: NewsItem[]): Promise<NewsCluster[]> {
  if (!apiKey) {
    console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    return [];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });

  // Prepare a simplified list for the LLM to save tokens, sending only ID and Title
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as NewsCluster[];
  } catch (error) {
    console.error('Error clustering news:', error);
    return [];
  }
}

export async function synthesizeNews(topic: string, articles: NewsItem[]): Promise<SynthesisResult | null> {
  if (!apiKey) {
    console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as SynthesisResult;
  } catch (error) {
    console.error('Error synthesizing news with gemini-2.5-flash:', error);
    return null;
  }
}