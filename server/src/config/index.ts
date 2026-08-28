import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'ekoz_jwt_secret_high_performance_executive_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'ekoz_refresh_secret_exclusive_black_mastermind_2026',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,https://ekoz.jpstudio.tech,http://localhost:3000').split(','),
  caktoSecretKey: process.env.CAKTO_SECRET_KEY || 'cakto_sec_sample_key',
  caktoWebhookSecret: process.env.CAKTO_WEBHOOK_SECRET || 'cakto_wh_sample_secret',
  whatsappApiUrl: process.env.WHATSAPP_API_URL || 'https://api.z-api.io/instances/sample/token/sample',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || 'sample_token',
};
