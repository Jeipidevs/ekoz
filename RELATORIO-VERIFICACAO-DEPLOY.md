# Relatório de Verificação do Deploy — Ekoz Ecosystem

**Data:** 28/08/2026
**Escopo:** Validação das alterações de deploy full-stack feitas via AntiGravity (commits `286067b` → `57ab7e6`) e correção dos problemas encontrados.

---

## 1. Contexto

Os últimos commits antes desta sessão implementaram o deploy unificado do Ekoz:

| Commit | Descrição |
|---|---|
| `286067b` | Backend Node.js + TypeScript + Prisma + Socket.IO completo, integração com frontend |
| `150cdaa` | Dockerfile full-stack unificado (Nginx + Node) e suíte de testes de integração |
| `bea8b62` | Pré-seed do SQLite no build e ajustes no entrypoint |
| `57ab7e6` | Ajustes de Nginx (server_name, headers de proxy, cópia para conf.d) |

O objetivo desta sessão foi **validar de fato** (build real da imagem Docker + execução do container + testes end-to-end), não apenas revisar código.

---

## 2. Metodologia

- Build real da imagem (`docker build`).
- Execução do container exatamente como definido no `Dockerfile`/`docker-entrypoint.sh`, sem atalhos.
- Testes na superfície real: HTTP via Nginx, proxy da API, handshake do Socket.IO.
- Execução da suíte `server/scripts/test-integrations.ts` contra o container vivo.
- Probes adicionais (payload malformado, rota inexistente, erro forçado) para verificar comportamento de borda.

---

## 3. Problemas críticos encontrados (1ª rodada)

### 3.1 Nginx derrubava o container inteiro
O `Dockerfile` copiava o mesmo `nginx.conf` (um bloco `server{}`) para **dois** diretórios: `/etc/nginx/http.d/` e `/etc/nginx/conf.d/`. No Nginx do Alpine, `conf.d` é incluído **fora** do bloco `http{}` no `nginx.conf` base — um `server{}` ali é sintaticamente inválido. Resultado:

```
nginx: [emerg] "server" directive is not allowed here in /etc/nginx/conf.d/default.conf:1
```

Como o Nginx roda em foreground (`daemon off`) como processo principal do entrypoint, essa falha derrubava **o container inteiro**, matando também o backend Node.

### 3.2 Prisma não conseguia abrir o banco SQLite em runtime
`DATABASE_URL="file:./prisma/dev.db"` (caminho relativo). O query engine do Prisma resolve caminhos relativos de SQLite em relação à pasta onde o **Prisma Client foi gerado** (`node_modules/.prisma/client/`), e não em relação ao `cwd` do processo Node. Isso fazia o Prisma procurar o banco em `node_modules/.prisma/client/prisma/dev.db` (inexistente) em vez de `/app/server/prisma/dev.db` (onde o arquivo realmente estava). Resultado: **todo endpoint que tocava o banco retornava 500** (`Error code 14: Unable to open the database file`) — só sobreviviam rotas sem Prisma (health check e o stub de WhatsApp). Suíte de integração: **2 de 12 passando**.

---

## 4. Correções aplicadas

### 4.1 `Dockerfile`
- Removida a cópia de `nginx.conf` para `/etc/nginx/conf.d/default.conf` (mantida apenas em `http.d`, contexto correto).
- `DATABASE_URL` trocado para caminho absoluto (`file:/app/server/prisma/dev.db`) nos dois stages de build que o utilizam.

### 4.2 Sanitização de erros internos em produção
Durante a revalidação, identificado um segundo problema (menor, mas real): **todos os 11 controllers do backend** capturavam exceções localmente e devolviam `error.message` cru ao cliente, mesmo em produção — vazando detalhes internos do Prisma (nomes de tabela, stack, etc.) em respostas HTTP públicas. 31 pontos de código com o mesmo padrão.

Correção:
- Criada `sendServerError()` em `server/src/middleware/error.middleware.ts`: em produção retorna uma mensagem genérica de fallback; em desenvolvimento continua expondo `error.message` para facilitar debug. O erro completo é sempre logado no servidor.
- Os 31 pontos nos 11 controllers (`academy`, `auth`, `cakto`, `chat`, `events`, `experiences`, `marketplace`, `notifications`, `posts`, `users`, `whatsapp`) foram atualizados para usar `sendServerError()`.

---

## 5. Resultado da revalidação (2ª rodada, pós-fix)

- Rebuild completo da imagem Docker: sucesso.
- Container sobe e permanece estável, sem workarounds.
- Suíte de integração: **11 de 12 testes passando** (o 1 "falhando" é falso negativo do próprio script — ele instancia um `PrismaClient` local no host sem `DATABASE_URL`, lendo o SQLite do host em vez do container; confirmado diretamente no banco do container que o upgrade de plano ocorreu corretamente).
- Probe de segurança: forçado um erro 500 real (violação de FK). Cliente recebeu apenas `{"error":"Erro ao confirmar presença no evento"}`; o stack completo do Prisma ficou apenas no log do servidor — comportamento correto.
- `tsc --noEmit` limpo em todo o backend após as mudanças.

---

## 6. Commits desta sessão

| Commit | Descrição |
|---|---|
| `22f1465` | `fix(deploy): corrigir crash do Nginx e falha do Prisma/SQLite no container; sanitizar erros 500` |

Push realizado para `origin/main`.

---

## 7. Status final

✅ **Deploy funcional de ponta a ponta**: Nginx → proxy reverso → API Node/Prisma/SQLite → Socket.IO, com frontend servido corretamente e erros internos não mais expostos ao cliente em produção.
