import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { query } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api', socialRoutes);
app.use('/api/admin', adminRoutes);

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connected', ts: new Date().toISOString() }));
});

setInterval(async () => {
  const trending = (await query('SELECT post_id, content_text, engagement_score FROM posts ORDER BY engagement_score DESC LIMIT 10')).rows;
  const payload = JSON.stringify({ type: 'trending', data: trending });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}, config.wsBroadcastIntervalMs);

server.listen(config.port, () => {
  console.log(`AICP backend listening on ${config.port}`);
});
