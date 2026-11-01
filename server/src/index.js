import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ordersRouter from './routes/orders.js';
import { isTinyFishConfigured } from './tinyfish.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const configured = isTinyFishConfigured();
  res.json({
    status: 'healthy',
    service: 'Orderix Backend API',
    version: '1.1.0-live',
    mode: 'Hackathon MVP + Live TinyFish Integration',
    timestamp: new Date().toISOString(),
    demoMode: false,
    tinyfishStatus: configured ? 'LIVE_CONFIGURED_AND_READY' : 'KEY_MISSING',
    targetSandbox: 'https://parcelperfect.com/tracking-demo/ (Waybill 1)'
  });
});

// Orders & Shipment Intelligence API
app.use('/api/orders', ordersRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to Orderix Logistics Intelligence API',
    endpoints: {
      health: '/api/health',
      orders: '/api/orders',
      orderDetail: '/api/orders/:id',
      tinyfishTrack: 'POST /api/orders/tinyfish/track',
      tinyfishStatus: 'GET /api/orders/tinyfish/status',
      analyzeCustomPayload: 'POST /api/orders/intelligence/analyze'
    }
  });
});

app.listen(PORT, () => {
  const configured = isTinyFishConfigured();
  console.log(`===============================================`);
  console.log(`🚀 Orderix Backend API running on port ${PORT}`);
  console.log(`📦 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`📋 Orders & Intelligence: http://localhost:${PORT}/api/orders`);
  console.log(`🐟 TinyFish Integration: ${configured ? 'LIVE API READY' : 'KEY MISSING'}`);
  console.log(`🧪 Target Sandbox: Parcel Perfect Demo (Waybill 1)`);
  console.log(`===============================================`);
});
