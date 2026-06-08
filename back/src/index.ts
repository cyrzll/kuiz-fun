import { serve } from '@hono/node-server';
import { WebSocketServer } from 'ws';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initDb } from './db.js';

import mediaRouter from './route/media.js';
import modulesRouter from './route/modules.js';
import roomsRouter from './route/rooms.js';
import meRouter from './route/me.js';
import wsRouter from './route/ws.js';

const app = new Hono();

// Database Initialisation
initDb().then(() => {
  console.log('SQLite database initialized successfully.');
}).catch((err: any) => {
  console.error('Database initialization failed:', err);
});

// Configure CORS middleware
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (c) => {
  return c.text('Pancasila Fun Quiz Backend Server is running.');
});

// Mount modular sub-routers
app.route('/api/media', mediaRouter);
app.route('/api/modules', modulesRouter);
app.route('/api/rooms', roomsRouter);
app.route('/api/me', meRouter);
app.route('/ws', wsRouter);

// Create WebSocket server and bind it to Hono Node server
const wss = new WebSocketServer({ noServer: true });

const server = serve({
  fetch: app.fetch,
  port: 3000,
  websocket: {
    server: wss
  }
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});


