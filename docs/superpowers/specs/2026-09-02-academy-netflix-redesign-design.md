# Redesign da aba Academy — estilo Netflix (Ekoz)

## Contexto

A aba Academy hoje (`src/components/academy/AcademyView.tsx`, `CourseCard.tsx`,
`LessonPlayerModal.tsx`) é: banner hero estático + filtro de categorias em botões +
grid vertical estático de cards. Ezekiel (CEO/cliente) pediu uma reformulação visual
completa no estilo Netflix — hero em destaque, fileiras horizontais roláveis por
categoria, cards com hover-preview — usando a paleta Ekoz (verde musgo, dourado,
preto) no lugar do preto/vermelho da Netflix.

Pesquisa de referência: hero "Billboard" full-bleed com gradiente e CTA dupla,
fileiras horizontais com `overflow-x: auto` e setas de navegação que aparecem no
hover, cards com hover-zoom + overlay de informações (título, progresso, ações).
Fonte: shadcn.io/design/netflix, tutoriais de clone Netflix (Tailwind/CSS-Tricks).

Validado com mockup interativo real (companion visual) — hero rotativo + fileiras
com hover funcional, usando as cores de `src/styles/variables.css`.

## Escopo

Mudança visual/frontend **com** alterações mínimas de schema e seed, para suportar
os dados que o novo layout precisa (imagem wide para hero, curadoria de destaque,
tags). Sem mudança de fluxo de autenticação, sem endpoint novo — só amplia
`GET /api/v1/academy/courses`.

## 1. Modelo de dados (`server/prisma/schema.prisma` — model `Course`)

Três campos novos, todos com defaults seguros (não quebram dados existentes):

```prisma
model Course {
  // ...campos existentes...
  backdropImage String?              // imagem 16:9 larga para o hero; se ausente, usa coverImage
  isFeatured    Boolean  @default(false) // elegível para o carrossel do hero (curadoria manual)
  tags          String   @default("[]") // JSON array de chips curtos, ex.: ["Tributário","Sucessão Familiar"]
}
```

Aplicado via `npx prisma db push` (projeto não usa migrations formais — confirmado em
`server/package.json`).

`src/types/index.ts` — `Course` ganha `backdropImage?: string`, `isFeatured: boolean`,
`tags: string[]`.

## 2. Backend (`server/src/controllers/academy.controller.ts`)

`listCourses` passa a:
- Retornar `backdropImage`, `isFeatured`, `tags` (parse do JSON, mesmo padrão de
  `resources` já usado no mesmo controller).
- Calcular `learnersCount` por curso: número de usuários distintos com pelo menos
  um `UserLessonProgress` em alguma aula do curso. Implementado buscando todos os
  `UserLessonProgress` (sem filtro de usuário) com `lesson.moduleId` para mapear ao
  curso, e reduzindo em JS — mesmo padrão de transformação já usado no controller,
  sem endpoint novo nem dependência de agregação SQL crua.

Não há personalização real (nenhum "% de match"); o hero mostra um badge textual
fixo tipo "Recomendado para você" ou "Em Destaque", nunca um número calculado ou
inventado.

## 3. Frontend — composição da tela

`AcademyView.tsx` é reestruturado para orquestrar:

1. **Hero rotativo** — novo componente `AcademyHero.tsx`. Alterna automaticamente
   (~6s) entre os cursos com `isFeatured: true`; pausa a rotação no hover; dots de
   navegação manual. Botões "Assistir Agora" e "Mais Informações" abrem o
   `LessonPlayerModal` já existente (sem modal novo) — Play seleciona a próxima aula
   não concluída, Info abre no resumo do curso.
2. **Fileira "Continuar Assistindo"** — cursos com `0 < progress < 100` do usuário
   logado (dado já existe, sem campo novo), ordenados pela atividade mais recente
   (`UserLessonProgress.createdAt` mais recente do curso).
3. **Fileira "Em Alta no Ecossistema"** — ordenada por `learnersCount` desc, badges
   "TOP 1"–"TOP 4" nos 4 primeiros. Dado real, não fake.
4. **Uma fileira por categoria** — reaproveita as 4 categorias existentes
   (`Alta Performance`, `Gestão & Escala`, `Liderança & Inteligência`,
   `Lifestyle & Network`).
5. Chips de categoria no topo viram atalhos de scroll até a fileira correspondente
   (substituem o filtro que hoje reduz o grid — não há mais grid único).

Novo componente `CourseRow.tsx`: título da fileira + track com `overflow-x: auto`,
scrollbar oculta, setas esquerda/direita que aparecem só no hover da fileira
(escondidas quando não há mais conteúdo para rolar naquela direção).

`CourseCard.tsx` é reescrito para o estilo de hover validado no mockup ("Opção B"):
no hover, o card cresce no próprio lugar (`transform: scale(1.14) translateY(-10px)`),
ganha sombra/glow dourado, e revela um overlay inferior com título, meta
(módulo/aula atual ou duração), barra de progresso (quando aplicável) e 3 ações
(play, adicionar, mais informações). Sem reflow dos cards vizinhos (rejeitado no
mockup por fragilidade de manutenção).

Paleta: reaproveita as CSS vars já existentes em `src/styles/variables.css`
(`--color-gold-*`, `--color-moss-*`, `--bg-primary`, `--gradient-gold`, etc.) — nenhuma
cor nova é introduzida.

## 4. Dados de exemplo (`server/prisma/seed.ts`)

Hoje existem só 2 cursos (`course-1` em Gestão & Escala, `course-2` em Liderança &
Inteligência); as categorias "Alta Performance" e "Lifestyle & Network" não têm
nenhum curso. Adicionar **8 cursos novos** (2 por categoria, cobrindo as 4
categorias), cada um com 1–2 módulos/aulas seguindo o padrão já existente no seed
(resources, videoUrl placeholder), mais:
- `backdropImage` distinto por curso (crops largos do Unsplash já usados no
  mockup/projeto).
- `tags` com 2–3 chips por curso.
- ~4–5 cursos marcados `isFeatured: true` (para o carrossel do hero ter variedade).
- Progresso variado via `UserLessonProgress` para o usuário Ezekiel: alguns cursos
  0%, alguns parciais (para popular "Continuar Assistindo"), um ou dois 100%.

## Fora de escopo

- Algoritmo de recomendação/match real.
- Vídeo autoplay no hover do card (Netflix real faz isso; aqui fica só imagem +
  overlay, mais leve e sem dependência de assets de vídeo por curso).
- Nova modal de detalhes — reaproveita `LessonPlayerModal.tsx`.
- Mudança em outras abas (Feed, Marketplace, Eventos, etc.).
