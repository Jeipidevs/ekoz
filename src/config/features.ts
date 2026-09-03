// Ekoz Academy (cursos/aulas) — EM STAND BY a partir de 03/09/2026.
//
// Decisão tomada em reunião com Ezekiel: para lançar o ecossistema o quanto
// antes, a aba de cursos fica fora da navegação até termos conteúdo real
// gravado (hoje não há nenhum curso pronto, só o seed de exemplo).
//
// O módulo NÃO foi removido — só escondido da navegação. Para reativar:
//   1. Vire este flag para `true`.
//   2. Isso já devolve o item "Ekoz Academy" na Sidebar e o roteamento em App.tsx.
//
// Código do módulo (intacto):
//   - Frontend: src/components/academy/**
//   - Backend:  server/src/controllers/academy.controller.ts
//               server/src/routes/academy.routes.ts
export const ACADEMY_ENABLED = false;
