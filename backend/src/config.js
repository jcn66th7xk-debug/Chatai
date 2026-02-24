import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'unsafe-dev-secret',
  wsBroadcastIntervalMs: Number(process.env.WS_BROADCAST_INTERVAL_MS || 300000),
  aiScanIntervalMs: Number(process.env.AI_SCAN_INTERVAL_MS || 300000)
};
