import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Segredos críticos (JWT, webhook Cakto) nunca podem cair para os valores de
// exemplo em produção — eles estão públicos neste repositório e permitiriam
// forjar tokens/pagamentos. Falha no boot em vez de subir inseguro.
const requireInProduction = (value: string | undefined, name: string, devFallback: string): string => {
  if (isProduction) {
    if (!value) {
      throw new Error(`[config] Variável de ambiente obrigatória ausente em produção: ${name}`);
    }
    return value;
  }
  return value || devFallback;
};

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requireInProduction(process.env.JWT_SECRET, 'JWT_SECRET', 'ekoz_jwt_secret_high_performance_executive_key_2026'),
  jwtRefreshSecret: requireInProduction(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET', 'ekoz_refresh_secret_exclusive_black_mastermind_2026'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,https://ekoz.jpstudio.tech,http://localhost:3000').split(','),
  caktoSecretKey: process.env.CAKTO_SECRET_KEY || 'cakto_sec_sample_key',
  caktoWebhookSecret: requireInProduction(process.env.CAKTO_WEBHOOK_SECRET, 'CAKTO_WEBHOOK_SECRET', 'cakto_wh_sample_secret'),
  whatsappApiUrl: process.env.WHATSAPP_API_URL || 'https://api.z-api.io/instances/sample/token/sample',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || 'sample_token',
};
