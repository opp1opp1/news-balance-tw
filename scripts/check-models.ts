import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// 手動讀取 .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('API Key not found in .env or .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

(async () => {
  try {
    console.log('--- Testing Gemini Models (including 2.0/2.5) ---');
    const candidates = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-pro'
    ];

    for (const modelName of candidates) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        await result.response;
        console.log('✅ Available');
      } catch (error: any) {
        if (error.message.includes('404') || error.message.includes('not found')) {
           console.log('❌ Not Found');
        } else if (error.message.includes('429')) {
           console.log('⚠️ Rate Limited (but exists)');
        } else {
           console.log(`⚠️ Error: ${error.message.split('\n')[0]}`);
        }
      }
    }
  } catch (error) {
    console.error('Global Error:', error);
  }
})();