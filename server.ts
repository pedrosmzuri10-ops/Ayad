import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware
  app.use(express.json({ limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Persistent storage directory and file
  const DATA_DIR = path.join(__dirname, 'data');
  const DATA_FILE = path.join(DATA_DIR, 'pos_database.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // In-memory cache
  let dbData: any = null;
  let lastUpdated = Date.now();

  // Load from disk if exists
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      dbData = parsed.data || parsed;
      lastUpdated = parsed.lastUpdated || Date.now();
      console.log('[Server] Loaded existing database from disk');
    } catch (err) {
      console.error('[Server] Failed to read database from disk:', err);
    }
  }

  // SSE client connections for real-time live sync
  const sseClients = new Set<Response>();

  function broadcastUpdate(payload: { lastUpdated: number; data?: any; updatedBy?: string }) {
    const message = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(message);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      clients: sseClients.size,
      hasData: dbData !== null,
      lastUpdated,
    });
  });

  // GET /api/sync - Retrieve latest database state
  app.get('/api/sync', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: dbData,
      lastUpdated,
      clientsCount: sseClients.size,
    });
  });

  // POST /api/sync - Save new database state and broadcast to other devices
  app.post('/api/sync', (req: Request, res: Response) => {
    try {
      const { data, updatedBy, timestamp } = req.body || {};
      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      dbData = data;
      lastUpdated = timestamp || Date.now();

      // Persist to disk
      try {
        fs.writeFileSync(
          DATA_FILE,
          JSON.stringify({ data: dbData, lastUpdated, updatedBy }, null, 2),
          'utf-8'
        );
      } catch (err) {
        console.error('[Server] Error persisting database to disk:', err);
      }

      // Broadcast update to all connected mobile & PC clients
      broadcastUpdate({ lastUpdated, data: dbData, updatedBy });

      return res.json({
        success: true,
        lastUpdated,
        clientsCount: sseClients.size,
      });
    } catch (err: any) {
      console.error('[Server] Sync error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  // GET /api/sync/events - Real-time SSE stream
  app.get('/api/sync/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial ping
    res.write(`data: ${JSON.stringify({ type: 'connected', lastUpdated })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Setup Vite dev server or static files
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Pedros POS running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
