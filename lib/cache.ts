import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'llm_cache.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface CacheEntry {
  timestamp: number;
  data: any;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

// Helper to generate a unique key based on topic and articles
export function generateCacheKey(topic: string, content: string): string {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `${topic}_${hash}`;
}

export function getFromCache<T>(key: string, ttlSeconds: number = 3600): T | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const store: CacheStore = JSON.parse(raw);
    const entry = store[key];

    if (!entry) return null;

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    if (age > ttlSeconds) {
      // Expired
      delete store[key];
      fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2));
      return null;
    }

    return entry.data as T;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export function saveToCache(key: string, data: any) {
  try {
    let store: CacheStore = {};
    if (fs.existsSync(CACHE_FILE)) {
      store = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }

    store[key] = {
      timestamp: Date.now(),
      data
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}
