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
  // Porta interna do Node (proxied pelo Nginx em nginx.conf via 127.0.0.1:3001)
  // — nunca ler de process.env.PORT: plataformas como o EasyPanel injetam sua
  // própria PORT (a porta pública, 80) no container em runtime, sobrepondo o
  // ENV PORT=3001 do Dockerfile e fazendo o Node tentar escutar na 80, que
  // colide com o Nginx. Usar um nome de variável exclusivo evita a colisão.
  port: parseInt(process.env.INTERNAL_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requireInProduction(process.env.JWT_SECRET, 'JWT_SECRET', 'ekoz_jwt_secret_high_performance_executive_key_2026'),
  jwtRefreshSecret: requireInProduction(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET', 'ekoz_refresh_secret_exclusive_black_mastermind_2026'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,https://ekoz.jpstudio.tech,http://localhost:3000').split(','),
  caktoWebhookSecret: requireInProduction(process.env.CAKTO_WEBHOOK_SECRET, 'CAKTO_WEBHOOK_SECRET', 'cakto_wh_sample_secret'),
  caktoClientId: process.env.CAKTO_CLIENT_ID || '',
  caktoClientSecret: process.env.CAKTO_CLIENT_SECRET || '',
  // Evolution API (WhatsApp) — instância "Ekoz" dedicada, mesma infra usada
  // por outros projetos (crm-vip-os, life-endo-os) no EasyPanel
  evolutionApiUrl: process.env.EVOLUTION_API_URL || '',
  evolutionInstanceName: process.env.EVOLUTION_INSTANCE_NAME || '',
  evolutionApiKey: process.env.EVOLUTION_API_KEY || '',
  // Número que recebe alertas administrativos (ex: compra sem telefone no webhook)
  adminWhatsappNumber: process.env.ADMIN_WHATSAPP_NUMBER || '',
  // LiveKit (videochamadas) — servidor self-hosted no EasyPanel
  livekitApiKey: process.env.LIVEKIT_API_KEY || '',
  livekitApiSecret: process.env.LIVEKIT_API_SECRET || '',
  livekitWsUrl: process.env.LIVEKIT_WS_URL || '',
};
