# 📜 Ekoz Ecosystem — Registro de Alterações & Contexto Geral (CHANGELOG)

Este documento registra todas as funcionalidades, decisões arquiteturais, correções e instruções de infraestrutura implementadas no projeto **Ekoz**, servindo como base e contexto unificado para continuidade imediata em novas sessões de desenvolvimento.

---

## 📌 Visão Geral do Projeto

- **Nome da Plataforma**: Ekoz (Ekoz Ecosystem)
- **CEO & Líder Estratégico**: Ezekiel Dall'Bello | Empresário | Performance e Estratégia
  - Títulos: Mister Rio Grande do Sul CNB 2025, Finalista Mister Brasil CNB 2026 ("O Homem Além da Beleza"), CEO da ZK & Company, Fundador da rede Cross Life (2019).
- **Slogan Oficial**: *"Viva a vida que você nunca VIVEU!"*
- **Paleta Nobre de Cores**:
  - Verde Musgo / Oliva (`#13241C`, `#1A382B`, `#2E5643`) — Saúde, vitalidade e crescimento.
  - Ouro Champagne / Dourado Luxo (`#CB9827`, `#DFC16E`, `#F5E296`) — Prestígio, autoridade e sofisticação.
  - Concreto / Prata (`#243029`, `#A8B5AE`, `#E1E8E4`) — Solidez estrutural e elegância moderna.
  - Preto Profundo (`#0A120E`, `#060B08`) — Contraste imersivo e sofisticação high-end.
- **Tipografia**: `Plus Jakarta Sans` (interface e textos) + `Outfit` (títulos e métricas).

---

## 🌐 Infraestrutura, Repositório & Deploy em Produção

| Recurso | Detalhes |
|---|---|
| **URL em Produção (Live)** | [https://ekoz.jpstudio.tech](https://ekoz.jpstudio.tech) |
| **Repositório Oficial** | [https://github.com/Jeipidevs/ekoz](https://github.com/Jeipidevs/ekoz) |
| **Branch de Produção** | `main` |
| **Servidor VPS** | Host EasyPanel: `https://fs7nnf.easypanel.host` |
| **Projeto no EasyPanel** | `sistemas` |
| **Serviço no EasyPanel** | `ekoz` |
| **IP do Servidor (IPv4)** | `168.231.92.208` |
| **Certificado SSL** | Let's Encrypt Oficial (gerenciado automaticamente pelo Traefik) |
| **Servidor Web Interno** | Nginx Alpine (Multi-stage Dockerfile) na porta 80 com fallback de SPA (`try_files $uri $uri/ /index.html;`) |
| **Auto Deploy** | Habilitado via webhook do EasyPanel a cada `git push origin main` |

---

## 🚀 Histórico de Versões

### [v2.0.0] — Arquitetura de Backend Completa, Prisma ORM, Socket.IO & Integrações (28/08/2026)

#### 🏛️ Arquitetura de Backend Implementada (`server/`):
- **Core Node.js + TypeScript + Express**: Servidor HTTP modular, com middlewares de segurança (`helmet`, `cors`), logging com `morgan`, e parser JSON com limites expandidos para upload.
- **Camada de Banco de Dados Relacional (Prisma ORM)**:
  - Modelagem e relacionamentos completos de 13 entidades: `User`, `RefreshToken`, `Post`, `Comment`, `Like`, `ThematicCore`, `MarketplaceBusiness`, `Course`, `CourseModule`, `Lesson`, `UserLessonProgress`, `LessonComment`, `Event`, `EventRegistration`, `Experience`, `ExperienceApplication`, `ChatConversation`, `ChatMessage`, `Notification`, `Subscription`.
  - Script de seed rico (`server/prisma/seed.ts`) com credenciais executivas de Ezekiel Dall'Bello (`ezekiel@ekoz.com.br`), membros notáveis, masterclasses em vídeo, publicações fixadas e negócios em múltiplos núcleos.
- **Autenticação Segura & RBAC**:
  - JWT Tokens (Access Token com 7 dias de validade + Refresh Tokens seguros armazenados no banco).
  - Criptografia de senhas com `bcryptjs`.
  - Controle de papéis (*CEO, Mentor, Admin, Member, Black Member*) e proteção de rotas exclusivas.
- **Comunicação em Tempo Real (Socket.IO)**:
  - Gateway de WebSockets com autenticação JWT.
  - Salas privadas de membros (`user:{id}`) para mensagens diretas instantâneas e broadcast global de timeline (`room:feed`).
  - Indicadores de digitação e emissão de eventos em tempo real.
- **Motor de Disparos de Notificações WhatsApp (`WhatsAppService`)**:
  - Formatador de templates com identidade nobre Ekoz para avisos da liderança, novas aulas da Academy, mensagens de networking e confirmações de compra.
  - Compatibilidade nativa com Z-API, Evolution API e Meta Cloud API.
- **Gateway de Pagamento & Webhooks Cakto (`CaktoService`)**:
  - Geração de cobranças PIX copia-e-cola e Cartão de Crédito.
  - Webhook listener idempotente com atualização instantânea do plano do membro para *Ekoz Black* e upgrade de role.
- **Conexão Frontend <-> Backend**:
  - Criação do cliente central de API (`src/services/api.ts`) e WebSocket (`src/services/socket.ts`).
  - Atualização do `EkozContext.tsx` com sincronização contínua e modo offline/fallback resiliente.
  - Modal de autenticação executiva (`AuthModal.tsx`) para login, cadastro e troca rápida de perfis em 1 clique.
  - Dockerfile dedicado para deploy do backend (`server/Dockerfile`) e reverse proxy configurado no `nginx.conf`.

---

### [v1.1.0] — Otimização Total para Smartphones & Deploy na VPS (27/08/2026)

#### 📱 Responsividade Mobile (Correção do Corte Lateral em Smartphones):
- **Diagnóstico do Problema**: Em smartphones (telas de 360px a 412px), o feed apresentava transbordamento lateral (~20px a 30px cortados à direita). As causas identificadas foram:
  1. *Grid Blowout*: O CSS Grid por padrão calcula colunas `1fr` com `min-width: auto`, fazendo o container esticar se houvesse elementos filhos com largura intrínseca maior (como os botões de filtro de categorias e as métricas).
  2. *Uso de `100vw`*: A unidade `100vw` computa a largura incluindo a barra de rolagem vertical do navegador, gerando ~17px de largura excedente.
  3. *Métricas sem Quebra*: A métrica *"24/7 Academy & Networking"* em caixa alta forçava uma coluna de 130px em telas onde cada coluna tinha apenas 111px.
  4. *Navbar com 5 Botões Largos*: Botões com textos (*"WhatsApp Push"* e *"Ekoz Black"*) ocupavam mais de 310px, estourando a barra superior.
- **Correções Aplicadas**:
  - **Grid Seguro**: Aplicado `grid-template-columns: minmax(0, 1fr)` e `min-width: 0` em todos os níveis da hierarquia (`.feed-layout-grid`, `.feed-main-column`, `.page-wrapper`).
  - **Substituição de `100vw` por `100%`**: Removido `100vw` de containers, drawers e navbars, aplicando `box-sizing: border-box` e `width: 100%; max-width: 100%`.
  - **Métricas Concisas**: Texto atualizado para *"24/7 Conexão & Rede"*, com `word-break: break-word`, `white-space: normal` e `min-width: 0`.
  - **Badges Otimizados**: Badges do Hero Card ajustados para *"ECOSSISTEMA EXECUTIVO"* e *"ACESSO VIP"*, acomodando-se em qualquer celular sem sobreposição.
  - **Navbar Compacto**: Textos auxiliares ocultados com `.hide-mobile`, exibindo ícones com glow dourado/verde (Coroa Black, Push WhatsApp, Notificações, Mensagens e Avatar de 34px).
  - **Formulário de Post Adaptativo**: Seleção de núcleo (`Núcleo:`) e botões de anexo/publicação agora quebram harmoniosamente em linhas dedicadas.
  - **Barra de Navegação Inferior (`MobileBottomNav`)**: Implementada barra fixa na base da tela com 6 módulos essenciais (*Feed, Academy, Mercado, Eventos, Expedições e Vídeo*), com suporte a `safe-area-inset-bottom` para iPhones e Androids com navegação por gestos/botões.

#### ☁️ DevOps & Deploy:
- Criação e envio do repositório no GitHub (`Jeipidevs/ekoz`).
- Criação do `Dockerfile` multi-stage (Node 20 Alpine para build + Nginx Alpine para runtime leve).
- Criação do `nginx.conf` com tratamento de rotas SPA.
- Criação e vinculação do serviço `ekoz` e domínio `ekoz.jpstudio.tech` no EasyPanel sob o projeto `sistemas`.
- Configuração do SSL Let's Encrypt com renovação automática via Traefik.

---

### [v1.0.0] — MVP Inicial Completo do Ecossistema Ekoz (26/08/2026)

#### 🏛️ Módulos Desenvolvidos:
1. **Navbar Executiva (`Navbar.tsx`)**:
   - Monograma geométrico de ouro e musgo, barra de pesquisa contextual, indicador de status do Push WhatsApp, botão de upgrade *Ekoz Black*, contador de mensagens diretas, dropdown de notificações e pílula de perfil do CEO Ezekiel Dall'Bello.
2. **Menu Lateral Persistente (`Sidebar.tsx`)**:
   - Navegação pelos 6 módulos centrais, slogan inspiracional fixado e atalhos de simulação (WhatsApp Push e Checkout Cakto).
3. **Feed Executivo ("A Ágora") (`FeedView.tsx`, `CreatePostCard.tsx`, `PostCard.tsx`)**:
   - Hero Banner com métricas do ecossistema e slogan de Ezekiel.
   - Publicador de posts com seleção de núcleo temático e anexo de imagens.
   - Filtros de timeline (*Todos, Avisos Oficiais, Negócios, Insights & Estratégia, Oportunidades*).
   - Post oficial fixado pela Liderança com comunicado de boas-vindas.
   - Postagens de membros com interações de recomendação (*like*), comentários interativos e compartilhamento.
   - Card lateral de Liderança & Mentoria em destaque para Ezekiel Dall'Bello.
   - Teasers de eventos, expedições e lista de membros para networking direto.
4. **Braço Educacional (`AcademyView.tsx`, `CourseCard.tsx`, `LessonPlayerModal.tsx`)**:
   - Catálogo de masterclasses exclusivas ministradas pelo CEO e especialistas convidados (*Gestão de Alta Performance, Expansão & Franquias, Mente & Foco Inabalável, Oratória & Autoridade Executiva*).
   - Barra de progresso dinâmica em tempo real (0 a 100%).
   - Modal player interativo com reprodução de vídeo, marcação de aula concluída, abas de anotações executivas, downloads de materiais complementares (PDFs/Planilhas) e campo de discussão de dúvidas.
5. **Marketplace B2B Segmentado (`MarketplaceView.tsx`, `BusinessCard.tsx`, `RegisterBusinessModal.tsx`)**:
   - Filtros por núcleos: *Todos, TI & Inteligência Artificial, Marketing & Publicidade, Mercado Imobiliário & Luxo, Saúde & Alta Performance, Jurídico & Estratégico*.
   - Vitrine de empresas com tags de especialidade, apresentação executiva e botão direto para o WhatsApp comercial do fundador.
   - Modal de cadastro de novos negócios com celebração de confetes (`canvas-confetti`).
6. **Eventos & Cúpulas Presenciais (`EventsView.tsx`)**:
   - Calendário com encontros executivos (*Ekoz Executive Summit 2026 em Gramado, Masterclass Estratégia & Escala em Porto Alegre, Jantar VIP Fasano*).
   - Sistema de confirmação de presença (RSVP) com cálculo dinâmico de vagas restantes e status de credenciamento.
7. **Viagens & Experiências de Alto Padrão (`ExperiencesView.tsx`)**:
   - Expedições imersivas exclusivas (*Expedição Cânions RS 2026, Retiro Mendoza Wine & Business, Imersão Fernando de Noronha VIP*).
   - Roteiros detalhados, destaques inclusos e modal de candidatura para vagas limitadas.
8. **Sala de Videoconferência Interna (`VideoCallRoom.tsx`)**:
   - Sala de reuniões virtual integrada ao SaaS para mentorias 1-on-1 e mesas redondas de negócios.
   - Grade de 4 participantes ativos com suporte a fallback de webcam real do usuário.
   - Controles de microfone, câmera, compartilhamento de tela e chat lateral durante a chamada.
9. **Mensagens Diretas (`ChatDrawer.tsx`)**:
   - Drawer deslizante lateral para conversas privadas entre empresários membros com resposta automática simulada.
10. **Simulador de Push para WhatsApp (`WhatsAppPushModal.tsx`)**:
    - Central de notificações push para WhatsApp com alternância de categorias (Avisos da Liderança, Novas Aulas da Academy, Mensagens Diretas, Credenciamento de Eventos).
    - Gatilho de teste em tempo real que dispara toasts na tela simulando a notificação recebida no celular.
11. **Checkout Cakto (`CaktoCheckoutModal.tsx`)**:
    - Checkout com identidade visual da processadora Cakto.
    - Comparativo de planos (*Membro Ekoz* a R$ 297/mês vs *Ekoz Black Mastermind* a R$ 1.250/mês).
    - Fluxos funcionais de pagamento por PIX (código copia-e-cola gerado) e Cartão de Crédito com tela de aprovação de assinatura.

#### 👤 Foto Oficial do CEO Ezekiel Dall'Bello:
- Foto oficial em terno azul integrada a partir de `1725240164969.jpg` para `public/ezekiel.jpg`.
- Implementada migração automática em `EkozContext.tsx` para atualizar chaves em cache no `localStorage` dos navegadores.

---

## 🛠️ Como Rodar e Desenvolver Localmente

### Pré-requisitos
- Node.js 18+ instalado.
- Git configurado.

### Comandos Principais
```bash
# 1. Clonar repositório
git clone https://github.com/Jeipidevs/ekoz.git
cd ekoz

# 2. Instalar dependências
npm install

# 3. Rodar servidor de desenvolvimento
npm run dev

# 4. Compilar versão de produção
npm run build

# 5. Visualizar build de produção localmente
npm run preview
```

---

## 📋 Próximos Passos Sugeridos para Próximas Sessões

1. **Apresentação & Validação com o Ezekiel**:
   - Apresentar o link [https://ekoz.jpstudio.tech](https://ekoz.jpstudio.tech) no celular dele para coletar feedback executivo.
2. **Integração Real de Backend (Banco de Dados)**:
   - Conectar Supabase ou PostgreSQL para persistência real de usuários, autenticação JWT e posts no banco de dados.
3. **API Oficial de WhatsApp**:
   - Conectar as notificações com a Meta Cloud API oficial ou Z-API para envio real de mensagens no WhatsApp dos membros.
4. **Webhooks da Cakto**:
   - Integrar webhook real de pagamento aprovado da Cakto para ativação automática de membros e liberação imediata de acesso aos conteúdos Black.
