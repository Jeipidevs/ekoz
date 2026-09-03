# Ekoz

SaaS de **comunidade profissional de alta performance**: rede social no estilo LinkedIn +
área de membros + marketplace B2B segmentado por núcleos temáticos + divulgação de eventos e
expedições, com videochamada nativa e checkout externo. Concebido por Ezekiel Dall'Bello.

Acesso é **fechado**: contas são provisionadas automaticamente após a compra aprovada na
Cakto, e as credenciais chegam ao membro por WhatsApp. Não há cadastro público.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 · TypeScript · **Vite 8** (Rolldown, não Next.js) |
| UI | `lucide-react`, `canvas-confetti`, CSS próprio em `src/styles/` |
| Tempo real | `socket.io-client` (feed, chat e notificações ao vivo) |
| Vídeo | **LiveKit** auto-hospedado (`@livekit/components-react`) |
| Backend | Node · Express · **Prisma** (ORM) |
| Banco | PostgreSQL (Supabase, via pooler) |
| Pagamento | **Cakto** (checkout externo + webhook) |
| WhatsApp | **Evolution API** (instância dedicada) |
| Lint | **oxlint** (não ESLint) |
| Deploy | Docker multi-stage + nginx, publicado no EasyPanel |

## Estrutura

```
.
├── src/                      # Frontend (Vite)
│   ├── components/           # Views por domínio: feed, marketplace, events,
│   │                         #   experiences, chat, checkout, admin, profile,
│   │                         #   videocall, notifications, auth, layout
│   ├── context/EkozContext   # Estado global + integração com a API
│   ├── services/api.ts       # Cliente HTTP tipado do backend
│   ├── config/               # features.ts (feature flags) · cakto.ts (checkout)
│   ├── styles/               # CSS
│   └── types/                # Tipos compartilhados
├── server/
│   ├── prisma/schema.prisma  # Fonte de verdade do schema (migrações versionadas)
│   └── src/
│       ├── controllers/      # auth, posts, marketplace, events, experiences,
│       │                     #   chat, notifications, academy, admin, cakto,
│       │                     #   whatsapp, videocall, users
│       ├── routes/           # Rotas Express
│       ├── middleware/       # Autenticação JWT, tratamento de erro
│       ├── services/         # prisma, cakto, whatsapp
│       └── utils/roles.ts    # STAFF_ROLES centralizado (RBAC)
├── Dockerfile                # Build multi-stage (frontend + backend + nginx)
├── docker-entrypoint.sh      # prisma db push idempotente + Node + nginx
└── nginx.conf                # Serve o SPA e faz proxy do /api pro Node
```

## Comandos

### Frontend (raiz)

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview
```

### Backend (`server/`)

```bash
cd server
npm install
npx prisma generate
npm run build      # tsc
npm run dev        # servidor em watch
npm run seed       # popula dados de teste (NUNCA roda em produção)
```

## Variáveis de ambiente

O frontend expõe apenas valores públicos, sempre com prefixo `VITE_`. O servidor concentra
os segredos. Nomes principais:

**Frontend**
- `VITE_API_URL` — base da API (em produção, o nginx faz proxy de `/api`)

**Backend**
- `DATABASE_URL` — Postgres runtime (pooler em modo transação, porta 6543)
- `DIRECT_URL` — Postgres para migrações (pooler em modo sessão, porta 5432)
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — assinatura dos tokens de sessão
- `CAKTO_CLIENT_ID` / `CAKTO_CLIENT_SECRET` — API da Cakto (OAuth2)
- `CAKTO_WEBHOOK_SECRET` — validação do webhook de pagamento
- `EVOLUTION_API_URL` / `EVOLUTION_INSTANCE_NAME` / `EVOLUTION_API_KEY` — WhatsApp
- `ADMIN_WHATSAPP_NUMBER` — número que recebe alertas administrativos
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `LIVEKIT_WS_URL` — videochamada
- `INTERNAL_PORT` — porta interna do Node (default 3001; **não** usar `PORT`,
  que o EasyPanel sobrescreve com a porta pública)
- `CORS_ORIGIN` — origens permitidas (separadas por vírgula)

## Regras do projeto

- **É Vite, não Next.js.** Sem App Router, `use server` ou route handlers.
- **O linter é o oxlint.** Ajuste `.oxlintrc.json`, não instale ESLint.
- **Prisma é a fonte de verdade do schema.** Toda mudança nasce como migração versionada —
  nunca alteração manual no banco.
- **Dado de membro é dado pessoal (LGPD).** Acesso autenticado, zero PII em log.
- **Pagamento é delegado.** O sistema nunca armazena nem trafega dado de cartão.
- **Marketplace é segmentado por núcleos temáticos** — o núcleo é dimensão de modelagem.

## Módulos em stand-by

A **Ekoz Academy** (área de aulas gravadas) está desativada por feature flag
(`src/config/features.ts` → `ACADEMY_ENABLED = false`). O código permanece na raiz,
documentado, pronto para ser reativado quando houver conteúdo real.

## Histórico

Ver [`CHANGELOG.md`](./CHANGELOG.md) e
[`RELATORIO-VERIFICACAO-DEPLOY.md`](./RELATORIO-VERIFICACAO-DEPLOY.md).
