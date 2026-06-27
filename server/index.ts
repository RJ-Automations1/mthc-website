import express from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

import { initDb } from './db/init';
import donateRoutes from './routes/donate';
import leaderboardRoutes from './routes/leaderboard';
import scheduleRoutes from './routes/schedule';
import adminRoutes from './routes/admin';
import boardRoutes from './routes/board';
import historyRoutes from './routes/history';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/donate', donateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('⚠️  Database init failed (site will still serve):', err);
  }
  app.listen(PORT, () => {
    console.log(`🏟️  MTHC Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

export default app;
