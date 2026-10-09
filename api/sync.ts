import fs from 'fs';
import path from 'path';

// Vercel serverless cache file in /tmp
const CACHE_FILE = path.join('/tmp', 'pedros_pos_sync.json');

let memoryStore: any = null;
let lastUpdated = Date.now();

// Try loading from /tmp if memoryStore is null
function loadStore() {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryStore = parsed.data;
      lastUpdated = parsed.lastUpdated || Date.now();
    }
  } catch {
    // Ignore read errors
  }
  return memoryStore;
}

export default async function handler(req: any, res: any) {
  // CORS configuration for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  loadStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: memoryStore,
      lastUpdated,
      serverType: 'vercel-serverless',
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { data, timestamp } = body || {};

      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      memoryStore = data;
      lastUpdated = timestamp || Date.now();

      try {
        fs.writeFileSync(
          CACHE_FILE,
          JSON.stringify({ data: memoryStore, lastUpdated }),
          'utf-8'
        );
      } catch {
        // /tmp write fallback
      }

      return res.status(200).json({
        success: true,
        lastUpdated,
        serverType: 'vercel-serverless',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error parsing payload' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
