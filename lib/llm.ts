import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, SynthesisResult } from './types';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function synthesizeNews(topic: string, articles: NewsItem[]): Promise<SynthesisResult | null> {
  if (!apiKey) {
    console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });

  // Filter articles relevant to the topic (simple filtering for now, or pass already filtered list)
  // For this function, we assume the passed articles are already relevant.

  const articlesText = articles.map((a, i) => `
    [Article ${i + 1}]
    Source: ${a.source}
    Title: ${a.title}
    Content: ${a.content}
  `).join('

');

  const prompt = `
    You are an expert, neutral news editor and analyzer in Taiwan.
    Your task is to analyze the following news articles about the topic: "${topic}".
    The articles may come from sources with different political leanings (e.g., Pan-Blue, Pan-Green, Neutral).

    Please perform the following tasks:
    1. Identify the common facts reported by all sources.
    2. Identify the specific viewpoints or subjective interpretations from each source.
    3. Synthesize a neutral, objective news report that covers the key information without bias.
    4. Generate a neutral title.

    Return the result in the following JSON format:
    {
      "title": "A neutral title",
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
    console.error('Error synthesizing news:', error);
    return null;
  }
}
