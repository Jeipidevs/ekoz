import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { SocketService } from './services/socket.service.js';
import { prisma } from './services/prisma.service.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize WebSockets
SocketService.initialize(httpServer);

// Global Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter); // Alias for compatibility

// Root Healthcheck
app.get('/', (_req, res) => {
  res.json({
    name: 'Ekoz Ecosystem API',
    slogan: 'Viva a vida que você nunca VIVEU!',
    leadership: "Ezekiel Dall'Bello",
    status: 'ACTIVE',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

// Central Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`\n🏛️  ===========================================`);
  console.log(`🚀  EKOZ BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`💎  Environment: ${config.nodeEnv}`);
  console.log(`🌐  API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`🔌  Socket.IO: Ready for real-time networking`);
  console.log(`🏛️  ===========================================\n`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down Ekoz Backend...');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('✅ Server closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
