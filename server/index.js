import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import taskRouter from './routes/taskRoute.js';
import agentRouter from './llmAgent/agentRouter.js';
import { handleLLMMessage } from './llmAgent/controller.js';
console.log('[server] importing agentRouter:', typeof agentRouter, 'at', new Date().toISOString());
console.log('[server] OpenAI key present:', !!process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Debug: log every request path/method
app.use((req, _res, next) => { try { console.log('[req]', req.method, req.originalUrl); } catch {} next(); });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskfast')
  .then(() => {
    console.log("MongoDB Connected to taskfast database");
  }).catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get('/', (req, res) => {
  res.send('Task Fast Server is running!');
});

// Basic CORS preflight support for all /api routes (Express 5: use regex, not '/api/*')
app.options(/^\/api\/.*/, (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// Routes
app.use("/api/tasks", taskRouter);
app.use("/api/agent", (req, res, next) => { console.log('[server] /api/agent hit:', req.method, req.url); next(); }, agentRouter);
// Direct endpoints (bypass router if needed)
app.get('/api/agent', (req, res) => res.json({ ok: true, service: 'agent', via: 'direct' }));
app.get('/api/agent/health', (req, res) => res.json({ ok: true, llm: !!process.env.OPENAI_API_KEY ? 'ready' : 'offline' }));
// Echo and messages endpoints
app.post('/api/agent/echo', (req, res) => {
  res.json({ ok: true, body: req.body, headers: req.headers });
});
app.post('/api/agent/messages', (req, res, next) => {
  // If body is empty and content-type not json, try to parse as text
  if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        if (raw && raw.trim().startsWith('{')) {
          req.body = JSON.parse(raw);
        } else if (raw) {
          req.body = { conversationId: 'fallback', message: raw };
        }
      } catch {}
      return handleLLMMessage(req, res);
    });
  } else {
    return handleLLMMessage(req, res);
  }
});
console.log('[server] agent router mounted at /api/agent', new Date().toISOString());

// Debug: list routes
app.get('/debug/routes', (_req, res) => {
  try {
    const getRoutes = (stack, base = '') => {
      const out = [];
      stack.forEach((layer) => {
        if (layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods).filter(Boolean);
          out.push({ path: base + layer.route.path, methods });
        } else if (layer.name === 'router' && layer.handle && layer.regexp) {
          // extract base path from regexp if possible
          const re = new RegExp('^\\\\/(.*?)\\\\/?\\?\\$','i');
          const match = layer.regexp.toString().match(re);
          const pathBase = match && match[1] ? '/' + match[1] : base;
          if (layer.handle && layer.handle.stack) {
            out.push(...getRoutes(layer.handle.stack, pathBase));
          }
        }
      });
      return out;
    };
    const routes = getRoutes(app._router?.stack || []);
    res.json({ routes });
  } catch (e) {
    res.json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
