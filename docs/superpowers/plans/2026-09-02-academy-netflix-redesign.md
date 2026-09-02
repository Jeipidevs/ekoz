# Academy Netflix Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformular a aba Academy do Ekoz para um layout estilo Netflix (hero rotativo, fileiras horizontais com hover-preview) usando a paleta visual já existente do produto, com dados novos (curadoria de destaque, tags, imagem wide) e 8 cursos de exemplo adicionais.

**Architecture:** Três campos novos no model `Course` do Prisma (`backdropImage`, `isFeatured`, `tags`) expostos pelo endpoint `GET /api/v1/academy/courses` já existente (mais um campo calculado `learnersCount`); frontend reestruturado em componentes pequenos e focados (`AcademyHero`, `CourseRow`, `CourseCard` reescrito) orquestrados por `AcademyView`; CSS novo isolado em `src/styles/academy.css`, reaproveitando os tokens de `variables.css`.

**Tech Stack:** React 19 + TypeScript + Vite (frontend), Express + Prisma + SQLite (backend), sem dependências novas.

## Global Constraints

- Nenhuma cor nova: todo CSS novo usa as variáveis já definidas em `src/styles/variables.css` (`--color-gold-*`, `--color-moss-*`, `--bg-primary`, `--gradient-gold`, etc.).
- Nenhuma dependência npm nova, nem no frontend nem no backend.
- Sem endpoint novo: tudo passa por `GET /api/v1/academy/courses`, que já existe.
- Sem modal novo: cliques em cards/hero reaproveitam `LessonPlayerModal.tsx` já existente.
- O projeto **não tem suíte de testes automatizada** (confirmado: sem Jest/Vitest, sem arquivos `*.test.*` fora de `node_modules`). A verificação de cada tarefa é: `npx tsc --noEmit` (backend) ou `npm run build` + `npm run lint` (frontend), mais um passo manual explícito quando aplicável — não "adicionar testes" como parte deste plano (fora de escopo, evitar scope creep).
- Comandos do backend rodam a partir de `server/`; comandos do frontend rodam a partir da raiz do projeto (`C:\Projetos\particulares\Ekoz`).
- Sem mudança em outras abas (Feed, Marketplace, Eventos, Experiências, Videochamada).

---

### Task 1: Schema Prisma — novos campos em `Course`

**Files:**
- Modify: `server/prisma/schema.prisma:122-135`

**Interfaces:**
- Produces: `Course.backdropImage: String?`, `Course.isFeatured: Boolean` (default `false`), `Course.tags: String` (JSON array serializado, default `"[]"`) — consumidos pelas Tasks 3, 4, 7.

- [ ] **Step 1: Editar o model `Course`**

Substituir o bloco atual:

```prisma
model Course {
  id               String         @id @default(uuid())
  title            String
  instructorName   String
  instructorRole   String
  instructorAvatar String
  coverImage       String
  category         String // Alta Performance, Gestão & Escala, Liderança & Inteligência, Lifestyle & Network
  duration         String
  description      String
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  modules          CourseModule[]
}
```

Por:

```prisma
model Course {
  id               String         @id @default(uuid())
  title            String
  instructorName   String
  instructorRole   String
  instructorAvatar String
  coverImage       String
  backdropImage    String?
  category         String // Alta Performance, Gestão & Escala, Liderança & Inteligência, Lifestyle & Network
  duration         String
  description      String
  isFeatured       Boolean        @default(false)
  tags             String         @default("[]") // JSON array of string
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  modules          CourseModule[]
}
```

- [ ] **Step 2: Validar a sintaxe do schema**

Run (a partir de `server/`): `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 3: Aplicar no banco local e regenerar o client**

Run (a partir de `server/`):
```bash
npx prisma db push
npx prisma generate
```
Expected: `Your database is now in sync with your Prisma schema.` seguido de `✔ Generated Prisma Client`.

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma
git commit -m "feat(academy): adicionar backdropImage, isFeatured e tags ao model Course"
```

---

### Task 2: Tipos do frontend — `Course`

**Files:**
- Modify: `src/types/index.ts:89-102`

**Interfaces:**
- Consumes: nada (tipos puros).
- Produces: `Course.backdropImage?: string`, `Course.isFeatured?: boolean`, `Course.tags?: string[]`, `Course.learnersCount?: number` — consumidos pelas Tasks 7, 8, 9, 10. Todos opcionais de propósito: `src/data/mockData.ts` (fallback offline) não precisa ser editado.

- [ ] **Step 1: Editar a interface `Course`**

Substituir:

```ts
export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  coverImage: string;
  category: 'Alta Performance' | 'Gestão & Escala' | 'Liderança & Inteligência' | 'Lifestyle & Network';
  duration: string;
  lessonsCount: number;
  description: string;
  modules: CourseModule[];
  progress: number;
}
```

Por:

```ts
export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  coverImage: string;
  backdropImage?: string;
  category: 'Alta Performance' | 'Gestão & Escala' | 'Liderança & Inteligência' | 'Lifestyle & Network';
  duration: string;
  lessonsCount: number;
  description: string;
  modules: CourseModule[];
  progress: number;
  isFeatured?: boolean;
  tags?: string[];
  learnersCount?: number;
}
```

- [ ] **Step 2: Verificar tipos**

Run (raiz do projeto): `npx tsc -b`
Expected: sem erros (build silencioso).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(academy): adicionar campos de destaque/tags ao tipo Course"
```

---

### Task 3: Backend — `listCourses` retorna os novos campos + popularidade

**Files:**
- Modify: `server/src/controllers/academy.controller.ts:1-73`

**Interfaces:**
- Consumes: `Course.backdropImage`, `Course.isFeatured`, `Course.tags` do Prisma Client (Task 1).
- Produces: resposta JSON de `GET /api/v1/academy/courses` com `backdropImage`, `isFeatured`, `tags: string[]`, `learnersCount: number` por curso — consumido pelo frontend nas Tasks 9 e 10.

- [ ] **Step 1: Reescrever `listCourses`**

Substituir o método `listCourses` inteiro (linhas 6-73) por:

```ts
  public static async listCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      const courses = await prisma.course.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                include: {
                  userProgress: userId ? { where: { userId } } : false,
                },
              },
            },
          },
        },
      });

      // Mapa aula -> curso, usado para calcular popularidade real (learnersCount)
      // sem precisar de agregação SQL crua.
      const lessonToCourseId = new Map<string, string>();
      courses.forEach((course) => {
        course.modules.forEach((mod) => {
          mod.lessons.forEach((les) => {
            lessonToCourseId.set(les.id, course.id);
          });
        });
      });

      const allProgress = await prisma.userLessonProgress.findMany({
        select: { userId: true, lessonId: true },
      });

      const learnersByCourse = new Map<string, Set<string>>();
      allProgress.forEach((p) => {
        const courseId = lessonToCourseId.get(p.lessonId);
        if (!courseId) return;
        if (!learnersByCourse.has(courseId)) learnersByCourse.set(courseId, new Set());
        learnersByCourse.get(courseId)!.add(p.userId);
      });

      const formatted = courses.map((course) => {
        let totalLessons = 0;
        let completedLessons = 0;

        const modules = course.modules.map((mod) => ({
          id: mod.id,
          title: mod.title,
          lessons: mod.lessons.map((les) => {
            totalLessons++;
            const isCompleted = les.userProgress && les.userProgress.length > 0 && les.userProgress[0].completed;
            if (isCompleted) completedLessons++;

            return {
              id: les.id,
              title: les.title,
              duration: les.duration,
              videoUrl: les.videoUrl,
              summary: les.summary,
              completed: isCompleted || false,
              resources: JSON.parse(les.resources || '[]'),
            };
          }),
        }));

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          id: course.id,
          title: course.title,
          instructor: course.instructorName,
          instructorRole: course.instructorRole,
          instructorAvatar: course.instructorAvatar,
          coverImage: course.coverImage,
          backdropImage: course.backdropImage || course.coverImage,
          category: course.category as any,
          duration: course.duration,
          lessonsCount: totalLessons,
          description: course.description,
          modules,
          progress,
          isFeatured: course.isFeatured,
          tags: JSON.parse(course.tags || '[]'),
          learnersCount: learnersByCourse.get(course.id)?.size || 0,
        };
      });

      res.json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar masterclasses da Academy');
    }
  }
```

- [ ] **Step 2: Verificar tipos**

Run (a partir de `server/`): `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificação manual do endpoint**

Run (a partir de `server/`, em um terminal separado): `npm run dev`

Em outro terminal, logar como CEO e listar cursos:
```bash
curl -s -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"ezekiel@ekoz.com.br\",\"password\":\"ekoz2026\"}" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))" > /tmp/token.txt
curl -s http://localhost:3001/api/v1/academy/courses -H "Authorization: Bearer $(cat /tmp/token.txt)" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const c=JSON.parse(d);console.log(c.map(x=>({t:x.title,f:x.isFeatured,tags:x.tags,learners:x.learnersCount})))})"
```
Expected: array de objetos com `f` (isFeatured) `true`/`false` e `tags` como array de strings — confirma que os 3 campos novos chegam formatados no JSON (os 2 cursos existentes ainda não têm `tags`/`isFeatured` reais até a Task 4 rodar o seed de novo, então nesta checagem é esperado ver `tags: []` e `f: false` — o objetivo aqui é só confirmar que a *forma* da resposta está correta, não os valores).

Pare o servidor de dev (`Ctrl+C`) antes de seguir.

- [ ] **Step 4: Commit**

```bash
git add server/src/controllers/academy.controller.ts
git commit -m "feat(academy): expor backdropImage, isFeatured, tags e learnersCount na API"
```

---

### Task 4: Seed — cursos existentes ganham os campos novos + 8 cursos de exemplo

**Files:**
- Modify: `server/prisma/seed.ts:333-435`

**Interfaces:**
- Consumes: `ezekiel` (variável já definida em `seed.ts`, um `User` com `id: 'user-ezekiel'`), fields do Task 1.
- Produces: 10 cursos no banco (`course-1` .. `course-10`), usados manualmente via UI nas Tasks 9-11.

- [ ] **Step 1: Adicionar campos ao `course1` (Estratégia & Escala)**

Em `server/prisma/seed.ts`, no `prisma.course.create` de `course1`, substituir:

```ts
  const course1 = await prisma.course.create({
    data: {
      id: 'course-1',
      title: 'Estratégia & Escala: Do Zero à Liderança de Mercado',
      instructorName: "Ezekiel Dall'Bello",
      instructorRole: 'CEO Ekoz & Especialista em Gestão',
      instructorAvatar: '/ezekiel.jpg',
      coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      category: 'Gestão & Escala',
      duration: '4h 30min',
      description: 'O método comprovado que utilizei para estruturar empresas escaláveis, criar marcas com autoridade inabalável e liderar equipes de alta performance sem depender da minha presença operacional diária.',
    },
  });
```

Por:

```ts
  const course1 = await prisma.course.create({
    data: {
      id: 'course-1',
      title: 'Estratégia & Escala: Do Zero à Liderança de Mercado',
      instructorName: "Ezekiel Dall'Bello",
      instructorRole: 'CEO Ekoz & Especialista em Gestão',
      instructorAvatar: '/ezekiel.jpg',
      coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80',
      category: 'Gestão & Escala',
      duration: '4h 30min',
      description: 'O método comprovado que utilizei para estruturar empresas escaláveis, criar marcas com autoridade inabalável e liderar equipes de alta performance sem depender da minha presença operacional diária.',
      isFeatured: true,
      tags: JSON.stringify(['Gestão de Pessoas', 'Escala de Negócios']),
    },
  });
```

- [ ] **Step 2: Adicionar campos ao `course2` (Holdings Patrimoniais)**

Substituir:

```ts
  const course2 = await prisma.course.create({
    data: {
      id: 'course-2',
      title: 'Holdings Patrimoniais e Proteção de Ativos Familiares',
      instructorName: 'Dra. Camila Vasconcellos',
      instructorRole: 'Sócia Vasconcellos Capital & M&A',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      category: 'Liderança & Inteligência',
      duration: '3h 15min',
      description: 'Como blindar o patrimônio construído pela sua empresa de passivos fiscais e trabalhistas, reduzindo em até 70% o ITCMD na sucessão familiar.',
    },
  });
```

Por:

```ts
  const course2 = await prisma.course.create({
    data: {
      id: 'course-2',
      title: 'Holdings Patrimoniais e Proteção de Ativos Familiares',
      instructorName: 'Dra. Camila Vasconcellos',
      instructorRole: 'Sócia Vasconcellos Capital & M&A',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80',
      category: 'Liderança & Inteligência',
      duration: '3h 15min',
      description: 'Como blindar o patrimônio construído pela sua empresa de passivos fiscais e trabalhistas, reduzindo em até 70% o ITCMD na sucessão familiar.',
      isFeatured: true,
      tags: JSON.stringify(['Sucessão Patrimonial', 'Tributário']),
    },
  });
```

- [ ] **Step 3: Inserir os 8 cursos novos**

Logo **antes** da linha `console.log('✅ Courses, Modules & Lessons seeded');` (que vem depois da criação do `les-2-1-1`), inserir o bloco abaixo:

```ts
  // --- Curso 3: Alta Performance (destaque) ---
  const course3 = await prisma.course.create({
    data: {
      id: 'course-3',
      title: 'Biohacking Executivo: Energia e Foco Sem Limites',
      instructorName: 'Dr. Rafael Tanaka',
      instructorRole: 'Médico de Performance Humana & Longevidade',
      instructorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&auto=format&fit=crop&q=80',
      category: 'Alta Performance',
      duration: '2h 50min',
      description: 'Protocolos de sono, nutrição estratégica e suplementação baseada em evidências para sustentar decisões de alto risco sem esgotar o corpo.',
      isFeatured: true,
      tags: JSON.stringify(['Biohacking', 'Saúde Executiva']),
    },
  });

  const module3_1 = await prisma.courseModule.create({
    data: { id: 'mod-3-1', courseId: course3.id, title: 'Módulo 1: Fundamentos do Biohacking Executivo', order: 1 },
  });

  const lesson3_1_1 = await prisma.lesson.create({
    data: {
      id: 'les-3-1-1',
      moduleId: module3_1.id,
      title: 'Aula 1: Protocolos de Sono para Alta Performance',
      duration: '18:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      summary: 'Como estruturar ciclos de sono compatíveis com viagens e fusos múltiplos sem perder capacidade cognitiva.',
      order: 1,
      resources: JSON.stringify([{ name: 'Protocolo_Sono_Ekoz.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-3-1-2',
      moduleId: module3_1.id,
      title: 'Aula 2: Nutrição Estratégica para Decisões de Alto Risco',
      duration: '21:05',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      summary: 'Janelas alimentares e suplementação com evidência real para sustentar foco em negociações longas.',
      order: 2,
      resources: JSON.stringify([{ name: 'Guia_Nutricao_Executiva.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.userLessonProgress.create({
    data: { userId: ezekiel.id, lessonId: lesson3_1_1.id, completed: true, completedAt: new Date() },
  });

  // --- Curso 4: Alta Performance ---
  const course4 = await prisma.course.create({
    data: {
      id: 'course-4',
      title: 'Blindagem Emocional: Liderando Sob Pressão',
      instructorName: 'Bianca Ferraz',
      instructorRole: 'Psicóloga Executiva & Coach de Alta Performance',
      instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&auto=format&fit=crop&q=80',
      category: 'Alta Performance',
      duration: '3h 10min',
      description: 'Técnicas de regulação emocional e tomada de decisão sob pressão para líderes que não podem se dar ao luxo de reagir por impulso.',
      isFeatured: false,
      tags: JSON.stringify(['Inteligência Emocional', 'Liderança']),
    },
  });

  const module4_1 = await prisma.courseModule.create({
    data: { id: 'mod-4-1', courseId: course4.id, title: 'Módulo 1: Regulação Emocional Executiva', order: 1 },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-4-1-1',
      moduleId: module4_1.id,
      title: 'Aula 1: O Ciclo da Reação Impulsiva',
      duration: '19:40',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      summary: 'Como identificar o gatilho fisiológico antes de reagir mal em uma reunião de alto risco.',
      order: 1,
      resources: JSON.stringify([{ name: 'Mapa_Gatilhos_Executivos.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-4-1-2',
      moduleId: module4_1.id,
      title: 'Aula 2: Negociando Sob Pressão sem Perder a Régua',
      duration: '23:15',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      summary: 'Protocolo de 3 passos para manter clareza de decisão em negociações tensas.',
      order: 2,
      resources: JSON.stringify([{ name: 'Checklist_Negociacao_Tensa.pdf', type: 'PDF', url: '#' }]),
    },
  });

  // --- Curso 5: Gestão & Escala (destaque, 100% concluído) ---
  const course5 = await prisma.course.create({
    data: {
      id: 'course-5',
      title: 'Gestão de Equipes Autônomas: Escale Sem Estar Presente',
      instructorName: "Ezekiel Dall'Bello",
      instructorRole: 'CEO Ekoz & Especialista em Gestão',
      instructorAvatar: '/ezekiel.jpg',
      coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&auto=format&fit=crop&q=80',
      category: 'Gestão & Escala',
      duration: '5h 05min',
      description: 'O sistema operacional de gestão que uso para liderar múltiplas operações simultâneas sem depender da minha presença diária.',
      isFeatured: false,
      tags: JSON.stringify(['Gestão de Pessoas', 'Escala']),
    },
  });

  const module5_1 = await prisma.courseModule.create({
    data: { id: 'mod-5-1', courseId: course5.id, title: 'Módulo 1: O Sistema Operacional de Gestão Ekoz', order: 1 },
  });

  const lesson5_1_1 = await prisma.lesson.create({
    data: {
      id: 'les-5-1-1',
      moduleId: module5_1.id,
      title: 'Aula 1: Desenhando Autonomia com Accountability',
      duration: '24:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      summary: 'Como dar autonomia real sem perder controle sobre resultado.',
      order: 1,
      resources: JSON.stringify([{ name: 'Matriz_Autonomia_Accountability.pdf', type: 'PDF', url: '#' }]),
    },
  });

  const lesson5_1_2 = await prisma.lesson.create({
    data: {
      id: 'les-5-1-2',
      moduleId: module5_1.id,
      title: 'Aula 2: Rituais de Gestão à Distância',
      duration: '20:50',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      summary: 'A cadência de reuniões e reports que sustenta múltiplas operações sem microgerenciamento.',
      order: 2,
      resources: JSON.stringify([{ name: 'Calendario_Ritos_Gestao.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.userLessonProgress.create({
    data: { userId: ezekiel.id, lessonId: lesson5_1_1.id, completed: true, completedAt: new Date() },
  });
  await prisma.userLessonProgress.create({
    data: { userId: ezekiel.id, lessonId: lesson5_1_2.id, completed: true, completedAt: new Date() },
  });

  // --- Curso 6: Gestão & Escala ---
  const course6 = await prisma.course.create({
    data: {
      id: 'course-6',
      title: 'M&A para Pequenas e Médias Empresas',
      instructorName: 'Dra. Camila Vasconcellos',
      instructorRole: 'Sócia Vasconcellos Capital & M&A',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1600&auto=format&fit=crop&q=80',
      category: 'Gestão & Escala',
      duration: '3h 40min',
      description: 'Como estruturar, avaliar e conduzir uma fusão ou aquisição de médio porte sem abrir mão de blindagem jurídica e patrimonial.',
      isFeatured: false,
      tags: JSON.stringify(['Fusões e Aquisições', 'Finanças']),
    },
  });

  const module6_1 = await prisma.courseModule.create({
    data: { id: 'mod-6-1', courseId: course6.id, title: 'Módulo 1: Estruturando a Operação de M&A', order: 1 },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-6-1-1',
      moduleId: module6_1.id,
      title: 'Aula 1: Due Diligence Sem Surpresas',
      duration: '26:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      summary: 'Checklist prático de due diligence financeira, trabalhista e fiscal para PMEs.',
      order: 1,
      resources: JSON.stringify([{ name: 'Checklist_Due_Diligence.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-6-1-2',
      moduleId: module6_1.id,
      title: 'Aula 2: Estrutura Societária Pós-Aquisição',
      duration: '22:10',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      summary: 'Como desenhar a nova estrutura societária para proteger sócios e ativos após o fechamento.',
      order: 2,
      resources: JSON.stringify([{ name: 'Modelo_Estrutura_Societaria.pdf', type: 'PDF', url: '#' }]),
    },
  });

  // --- Curso 7: Liderança & Inteligência ---
  const course7 = await prisma.course.create({
    data: {
      id: 'course-7',
      title: 'Inteligência Competitiva: Decisões Baseadas em Dados',
      instructorName: 'Rodrigo Almeida',
      instructorRole: 'Head de Growth & Business Intelligence',
      instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80',
      category: 'Liderança & Inteligência',
      duration: '2h 55min',
      description: 'Como montar um radar de inteligência competitiva para antecipar movimentos de mercado antes da concorrência.',
      isFeatured: false,
      tags: JSON.stringify(['Dados', 'Estratégia']),
    },
  });

  const module7_1 = await prisma.courseModule.create({
    data: { id: 'mod-7-1', courseId: course7.id, title: 'Módulo 1: Radar de Inteligência Competitiva', order: 1 },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-7-1-1',
      moduleId: module7_1.id,
      title: 'Aula 1: Fontes de Dados que Ninguém Está Olhando',
      duration: '17:45',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      summary: 'Mapeamento de fontes públicas e privadas para monitorar concorrentes em tempo real.',
      order: 1,
      resources: JSON.stringify([{ name: 'Lista_Fontes_Inteligencia.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-7-1-2',
      moduleId: module7_1.id,
      title: 'Aula 2: Transformando Dados em Decisão',
      duration: '19:20',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
      summary: 'Framework para ir do dado bruto à decisão executiva em menos de uma semana.',
      order: 2,
      resources: JSON.stringify([{ name: 'Framework_Dado_Para_Decisao.pdf', type: 'PDF', url: '#' }]),
    },
  });

  // --- Curso 8: Liderança & Inteligência ---
  const course8 = await prisma.course.create({
    data: {
      id: 'course-8',
      title: 'Oratória & Autoridade Executiva',
      instructorName: "Ezekiel Dall'Bello",
      instructorRole: 'CEO Ekoz & Especialista em Gestão',
      instructorAvatar: '/ezekiel.jpg',
      coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&auto=format&fit=crop&q=80',
      category: 'Liderança & Inteligência',
      duration: '4h 20min',
      description: 'A estrutura de discurso que uso em palcos e negociações de alto nível para construir autoridade em minutos, não em anos.',
      isFeatured: false,
      tags: JSON.stringify(['Comunicação', 'Autoridade']),
    },
  });

  const module8_1 = await prisma.courseModule.create({
    data: { id: 'mod-8-1', courseId: course8.id, title: 'Módulo 1: A Estrutura do Discurso de Autoridade', order: 1 },
  });

  const lesson8_1_1 = await prisma.lesson.create({
    data: {
      id: 'les-8-1-1',
      moduleId: module8_1.id,
      title: 'Aula 1: Abertura que Prende a Atenção em 10 Segundos',
      duration: '15:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      summary: 'A fórmula de abertura que uso em palestras e reuniões de conselho.',
      order: 1,
      resources: JSON.stringify([{ name: 'Roteiro_Abertura_Executiva.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-8-1-2',
      moduleId: module8_1.id,
      title: 'Aula 2: Fechamento com Chamada para Ação',
      duration: '18:05',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      summary: 'Como fechar qualquer apresentação com uma chamada para ação clara e irresistível.',
      order: 2,
      resources: JSON.stringify([{ name: 'Modelo_Fechamento_CTA.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.userLessonProgress.create({
    data: { userId: ezekiel.id, lessonId: lesson8_1_1.id, completed: true, completedAt: new Date() },
  });

  // --- Curso 9: Lifestyle & Network (destaque) ---
  const course9 = await prisma.course.create({
    data: {
      id: 'course-9',
      title: 'Networking de Alto Nível: Relações que Escalam Negócios',
      instructorName: 'Marcelo Bittencourt',
      instructorRole: 'Especialista em Relacionamento Corporativo',
      instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&auto=format&fit=crop&q=80',
      category: 'Lifestyle & Network',
      duration: '2h 30min',
      description: 'Como construir e manter uma rede de relacionamentos executivos que gera negócios reais, sem parecer interesseiro.',
      isFeatured: true,
      tags: JSON.stringify(['Networking', 'Relacionamentos']),
    },
  });

  const module9_1 = await prisma.courseModule.create({
    data: { id: 'mod-9-1', courseId: course9.id, title: 'Módulo 1: Construindo Rede de Alto Nível', order: 1 },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-9-1-1',
      moduleId: module9_1.id,
      title: 'Aula 1: Como Entrar em uma Roda de Conversa Executiva',
      duration: '14:50',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      summary: 'Táticas práticas para se inserir em conversas de alto nível em eventos executivos.',
      order: 1,
      resources: JSON.stringify([{ name: 'Guia_Eventos_Executivos.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-9-1-2',
      moduleId: module9_1.id,
      title: 'Aula 2: Follow-up que Gera Negócio de Verdade',
      duration: '16:40',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      summary: 'O sistema de follow-up que transforma contatos de evento em parcerias reais.',
      order: 2,
      resources: JSON.stringify([{ name: 'Sistema_Followup_Ekoz.pdf', type: 'PDF', url: '#' }]),
    },
  });

  // --- Curso 10: Lifestyle & Network ---
  const course10 = await prisma.course.create({
    data: {
      id: 'course-10',
      title: 'Estilo de Vida Executivo: Rotina, Viagens e Performance',
      instructorName: "Ezekiel Dall'Bello",
      instructorRole: 'CEO Ekoz & Especialista em Gestão',
      instructorAvatar: '/ezekiel.jpg',
      coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80',
      backdropImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&auto=format&fit=crop&q=80',
      category: 'Lifestyle & Network',
      duration: '3h 00min',
      description: 'Como organizo rotina, viagens internacionais e vida pessoal sem sacrificar performance nos negócios.',
      isFeatured: false,
      tags: JSON.stringify(['Lifestyle', 'Rotina']),
    },
  });

  const module10_1 = await prisma.courseModule.create({
    data: { id: 'mod-10-1', courseId: course10.id, title: 'Módulo 1: Rotina de Alta Performance', order: 1 },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-10-1-1',
      moduleId: module10_1.id,
      title: 'Aula 1: Minha Rotina Semanal Real',
      duration: '20:15',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      summary: 'A agenda semanal que uso para equilibrar operação, família e viagens.',
      order: 1,
      resources: JSON.stringify([{ name: 'Template_Rotina_Semanal.pdf', type: 'PDF', url: '#' }]),
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-10-1-2',
      moduleId: module10_1.id,
      title: 'Aula 2: Trabalhando de Qualquer Lugar do Mundo',
      duration: '17:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      summary: 'Como estruturo viagens longas sem perder produtividade nem presença com a equipe.',
      order: 2,
      resources: JSON.stringify([{ name: 'Kit_Trabalho_Remoto_Executivo.pdf', type: 'PDF', url: '#' }]),
    },
  });

```

- [ ] **Step 4: Rodar o seed**

Run (a partir de `server/`): `npx tsx prisma/seed.ts`
Expected: log termina com `✅ Courses, Modules & Lessons seeded` e depois os demais `✅` (events, experiences etc.), sem erro. Terminal não deve mostrar nenhuma exception/stack trace.

- [ ] **Step 5: Conferir a contagem de cursos**

Run (a partir de `server/`):
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.course.count().then(async (n) => {
  const featured = await p.course.count({ where: { isFeatured: true } });
  console.log('total:', n, '| featured:', featured);
  await p.\$disconnect();
});
"
```
Expected: `total: 10 | featured: 4`

- [ ] **Step 6: Commit**

```bash
git add server/prisma/seed.ts
git commit -m "feat(academy): adicionar 8 cursos de exemplo e curadoria de destaque no seed"
```

---

### Task 5: `LessonPlayerModal` — abrir na primeira aula não concluída

**Files:**
- Modify: `src/components/academy/LessonPlayerModal.tsx:1-25`

**Interfaces:**
- Consumes: `Course.modules[].lessons[].completed` (já existe).
- Produces: nenhuma interface nova — comportamento interno do modal, usado pelas Tasks 9 e 10 (hero e card abrem o modal esperando que ele já pule para a aula certa).

- [ ] **Step 1: Adicionar o helper e usá-lo no estado inicial**

Substituir o topo do arquivo:

```tsx
import React, { useState } from 'react';
import { Course, Lesson } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import {
  X,
  Play,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface LessonPlayerModalProps {
  course: Course;
  onClose: () => void;
}

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({ course, onClose }) => {
  const { toggleLessonComplete } = useEkoz();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    course.modules[0]?.lessons[0] || ({} as Lesson)
  );
```

Por:

```tsx
import React, { useState } from 'react';
import { Course, Lesson } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import {
  X,
  Play,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface LessonPlayerModalProps {
  course: Course;
  onClose: () => void;
}

const findFirstIncompleteLesson = (course: Course): Lesson => {
  for (const mod of course.modules) {
    const incomplete = mod.lessons.find((lesson) => !lesson.completed);
    if (incomplete) return incomplete;
  }
  return course.modules[0]?.lessons[0] || ({} as Lesson);
};

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({ course, onClose }) => {
  const { toggleLessonComplete } = useEkoz();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(() => findFirstIncompleteLesson(course));
```

- [ ] **Step 2: Verificar tipos e build**

Run (raiz do projeto): `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/LessonPlayerModal.tsx
git commit -m "fix(academy): abrir o player na primeira aula não concluída do curso"
```

---

### Task 6: CSS — `academy.css` novo + remover estilos antigos de `components.css`

**Files:**
- Create: `src/styles/academy.css`
- Modify: `src/styles/components.css:1095-1355` (remover bloco antigo do Academy)
- Modify: `src/styles/components.css` (remover bloco "Academy Mobile" dentro do `@media (max-width: 768px)`)
- Modify: `src/styles/index.css:1-2` (importar `academy.css`)

**Interfaces:**
- Produces: classes CSS `.academy-hero*`, `.academy-quick-nav*`, `.course-row*` consumidas pelas Tasks 7, 8, 9, 10.

- [ ] **Step 1: Criar `src/styles/academy.css`**

```css
/* ==========================================================================
   ACADEMY VIEW — LAYOUT ESTILO NETFLIX
   ========================================================================== */

.academy-view-container {
  display: flex;
  flex-direction: column;
  margin: -2rem -1.75rem 0;
}

/* Hero */
.academy-hero {
  position: relative;
  min-height: 440px;
  height: 60vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 3rem;
}

.academy-hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, var(--bg-primary) 0%, rgba(10, 18, 14, 0.55) 45%, rgba(10, 18, 14, 0.05) 75%),
    linear-gradient(0deg, var(--bg-primary) 0%, rgba(10, 18, 14, 0.1) 45%, rgba(10, 18, 14, 0) 75%);
}

.academy-hero-content {
  position: relative;
  z-index: 2;
  max-width: 620px;
}

.academy-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(203, 165, 72, 0.15);
  border: 1px solid var(--border-gold-glow);
  color: var(--color-gold-200);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.academy-hero-title {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.12;
  margin-bottom: 0.85rem;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.academy-hero-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-concrete-300);
  margin-bottom: 1.25rem;
  max-width: 520px;
}

.academy-hero-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.4rem;
  font-size: 0.8rem;
  color: var(--color-concrete-400);
}

.academy-hero-btns {
  display: flex;
  gap: 0.75rem;
}

.academy-hero-btn-play {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.academy-hero-btn-info {
  background: rgba(230, 236, 233, 0.12);
  backdrop-filter: blur(6px);
  color: var(--color-white);
  border: 1px solid var(--border-subtle);
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: var(--font-main);
  transition: background var(--transition-fast);
}

.academy-hero-btn-info:hover {
  background: rgba(230, 236, 233, 0.2);
}

.academy-hero-dots {
  position: absolute;
  right: 2rem;
  bottom: 1.5rem;
  z-index: 2;
  display: flex;
  gap: 0.4rem;
}

.academy-hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(230, 236, 233, 0.3);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.academy-hero-dot.active {
  background: var(--color-gold-400);
  transform: scale(1.3);
}

/* Navegação rápida por categoria */
.academy-quick-nav {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 1.5rem 3rem 0;
}

.academy-quick-nav-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.5rem 1.25rem;
  color: var(--color-concrete-300);
  font-family: var(--font-main);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.academy-quick-nav-btn:hover {
  background: rgba(35, 66, 51, 0.35);
  border-color: var(--color-gold-400);
  color: var(--color-gold-300);
}

/* Fileiras */
.academy-rows {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 3rem 3rem;
}

.course-row-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-gold-200);
  margin-bottom: 0.85rem;
}

.course-row-viewport {
  position: relative;
}

.course-row-track {
  display: flex;
  gap: 0.9rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding-bottom: 0.5rem;
}

.course-row-track::-webkit-scrollbar {
  display: none;
}

.course-row-arrow {
  position: absolute;
  top: 0;
  bottom: 0.5rem;
  width: 44px;
  border: none;
  background: linear-gradient(90deg, var(--bg-primary) 0%, rgba(10, 18, 14, 0) 100%);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
}

.course-row-arrow-left {
  left: 0;
}

.course-row-arrow-right {
  right: 0;
  transform: scaleX(-1);
}

/* Card da fileira */
.course-row-card {
  position: relative;
  flex: 0 0 220px;
  height: 130px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease;
}

.course-row-card:hover {
  transform: scale(1.14) translateY(-10px);
  box-shadow: var(--shadow-lg), 0 0 0 2px var(--border-gold-glow);
  z-index: 5;
}

.course-row-card-rank {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(10, 18, 14, 0.75);
  backdrop-filter: blur(4px);
  color: var(--color-gold-300);
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  letter-spacing: 0.04em;
  z-index: 2;
}

.course-row-card-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 18, 14, 0) 30%, rgba(10, 18, 14, 0.95) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.65rem;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.course-row-card:hover .course-row-card-shade {
  opacity: 1;
}

.course-row-card-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 0.25rem;
  line-height: 1.25;
}

.course-row-card-meta {
  font-size: 0.66rem;
  color: var(--color-gold-300);
  margin: 0 0 0.4rem;
}

.course-row-card-icons {
  display: flex;
  gap: 0.4rem;
}

.course-row-icon-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(230, 236, 233, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  cursor: pointer;
  padding: 0;
}

.course-row-icon-btn.gold {
  background: var(--color-gold-400);
  color: var(--bg-primary);
  border: none;
}

.course-row-card-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: rgba(255, 255, 255, 0.25);
}

.course-row-card-progress-fill {
  height: 100%;
  background: var(--gradient-gold);
}

@media (max-width: 1024px) {
  .academy-view-container {
    margin: -1.25rem -1rem 0;
  }

  .academy-hero {
    padding: 2rem;
  }

  .academy-quick-nav,
  .academy-rows {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (max-width: 768px) {
  .academy-view-container {
    margin: -0.85rem -0.75rem 0;
  }

  .academy-hero {
    height: auto;
    min-height: 360px;
    padding: 1.5rem 1.25rem 2rem;
  }

  .academy-hero-title {
    font-size: 1.6rem;
  }

  .academy-hero-desc {
    font-size: 0.85rem;
  }

  .academy-hero-btns {
    flex-direction: column;
    align-items: stretch;
  }

  .academy-quick-nav {
    padding: 1.25rem 1.25rem 0;
  }

  .academy-rows {
    padding: 1.25rem 1.25rem 2rem;
  }

  .course-row-card {
    flex: 0 0 168px;
    height: 100px;
  }

  .course-row-arrow {
    display: none;
  }
}
```

- [ ] **Step 2: Remover o bloco antigo do Academy em `components.css`**

Remover (linhas 1095-1355), da linha do comentário `ACADEMY VIEW & LESSON PLAYER MODAL` até o fim de `.progress-bar-fill`, **mantendo** o comentário `/* Lesson Player Modal */` e tudo depois dele (o player continua usando esses estilos). Ou seja, apagar exatamente este trecho:

```css
/* ==========================================================================
   ACADEMY VIEW & LESSON PLAYER MODAL
   ========================================================================== */
.academy-view-container {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.academy-hero-card {
  padding: 2.25rem 2rem;
  background: radial-gradient(circle at 90% 10%, rgba(203, 165, 72, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, #162E22 0%, #0A120E 100%);
  border: 1px solid var(--border-gold);
}

.academy-hero-title {
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.academy-hero-desc {
  font-size: 0.95rem;
  color: var(--color-concrete-200);
  max-width: 720px;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.academy-stats-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-concrete-100);
}

.academy-filter-bar {
  overflow-x: auto;
}

.category-scroll-list {
  display: flex;
  gap: 0.5rem;
}

.cat-filter-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.5rem 1.25rem;
  color: var(--color-concrete-300);
  font-family: var(--font-main);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.cat-filter-btn:hover {
  background: rgba(35, 66, 51, 0.35);
  color: var(--color-white);
}

.cat-filter-btn.active {
  background: var(--gradient-gold-subtle);
  border-color: var(--color-gold-400);
  color: var(--color-gold-300);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.75rem;
}

/* Course Card */
.course-card {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.course-cover-wrapper {
  position: relative;
  height: 200px;
  cursor: pointer;
  overflow: hidden;
}

.course-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.course-card:hover .course-cover-img {
  transform: scale(1.04);
}

.course-overlay-play {
  position: absolute;
  inset: 0;
  background: rgba(10, 18, 14, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.course-card:hover .course-overlay-play {
  opacity: 1;
}

.play-button-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--gradient-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(203, 165, 72, 0.5);
  transform: scale(0.9);
  transition: transform var(--transition-fast);
}

.course-card:hover .play-button-circle {
  transform: scale(1);
}

.course-category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(10, 18, 14, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-full);
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-gold-300);
}

.course-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.course-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-concrete-400);
  margin-bottom: 0.65rem;
}

.course-duration, .course-lessons-count {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.course-card-title {
  font-size: 1.15rem;
  line-height: 1.35;
  margin-bottom: 0.65rem;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.course-card-title:hover {
  color: var(--color-gold-300);
}

.course-card-desc {
  font-size: 0.85rem;
  color: var(--color-concrete-300);
  line-height: 1.5;
  margin-bottom: 1.25rem;
  flex: 1;
}

.course-instructor-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.instructor-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-gold);
}

.instructor-info-sm {
  display: flex;
  flex-direction: column;
}

.inst-name-sm {
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--color-white);
}

.inst-role-sm {
  font-size: 0.7rem;
  color: var(--color-concrete-400);
}

.course-progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.progress-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-concrete-300);
}

.progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--gradient-gold);
  border-radius: 3px;
  transition: width 0.3s ease;
}

```

Deixando apenas:

```css
/* Lesson Player Modal */
.lesson-player-modal {
  max-width: 1060px;
  ...
```

(o restante do arquivo, a partir de `/* Lesson Player Modal */`, **não muda**).

- [ ] **Step 3: Remover o bloco "Academy Mobile" dentro do `@media (max-width: 768px)`**

Remover este trecho (dentro do mesmo media query que trata `.create-post-card`, `.category-select-group` etc. — não remover o media query inteiro, só este pedaço):

```css
  /* Academy Mobile */
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
  }
  .academy-header-banner {
    padding: 1.25rem 1rem;
  }
  .academy-banner-title {
    font-size: 1.35rem;
  }
  .academy-filters-bar {
    overflow-x: auto;
    padding-bottom: 0.35rem;
  }

```

(essas classes — `.academy-header-banner`, `.academy-banner-title`, `.academy-filters-bar` — já eram CSS morto, não referenciado por nenhum componente; o novo responsivo de Academy fica inteiro dentro de `academy.css`, feito no Step 1).

- [ ] **Step 4: Importar `academy.css`**

Em `src/styles/index.css`, substituir:

```css
@import './variables.css';
@import './components.css';
```

Por:

```css
@import './variables.css';
@import './components.css';
@import './academy.css';
```

- [ ] **Step 5: Build**

Run (raiz do projeto): `npm run build`
Expected: build Vite conclui sem erro (a ausência de classes CSS não quebra o build — TypeScript/Vite não validam nomes de classe — mas confirma que nenhum import quebrou).

- [ ] **Step 6: Commit**

```bash
git add src/styles/academy.css src/styles/components.css src/styles/index.css
git commit -m "feat(academy): CSS do layout estilo Netflix (hero, fileiras, cards)"
```

---

### Task 7: `CourseCard.tsx` — reescrever para o card de fileira (hover scale + overlay)

**Files:**
- Modify: `src/components/academy/CourseCard.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `Course` (Task 2), classes `.course-row-card*` (Task 6), `useEkoz().triggerToast` (já existe em `EkozContext.tsx`).
- Produces: `CourseCard(props: { course: Course; onOpen: (course: Course) => void; rank?: number })` — consumido pela Task 8 (`CourseRow`).

- [ ] **Step 1: Substituir o arquivo inteiro**

```tsx
import React from 'react';
import { Course } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import { Play, Plus, Info } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onOpen: (course: Course) => void;
  rank?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onOpen, rank }) => {
  const { triggerToast } = useEkoz();

  const metaLabel =
    course.progress > 0 && course.progress < 100
      ? `${course.progress}% assistido`
      : `${course.lessonsCount} aulas · ${course.duration}`;

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerToast({
      title: 'Em breve',
      message: 'Listas personalizadas de cursos chegam em uma próxima atualização.',
      type: 'info',
    });
  };

  return (
    <div
      className="course-row-card"
      style={{ backgroundImage: `url(${course.coverImage})` }}
      onClick={() => onOpen(course)}
    >
      {rank && <span className="course-row-card-rank">TOP {rank}</span>}

      <div className="course-row-card-shade">
        <p className="course-row-card-title">{course.title}</p>
        <p className="course-row-card-meta">{metaLabel}</p>
        <div className="course-row-card-icons">
          <button
            className="course-row-icon-btn gold"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(course);
            }}
            aria-label="Assistir"
          >
            <Play size={12} fill="currentColor" />
          </button>
          <button className="course-row-icon-btn" onClick={handleAddToList} aria-label="Adicionar à lista">
            <Plus size={12} />
          </button>
          <button
            className="course-row-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(course);
            }}
            aria-label="Mais informações"
          >
            <Info size={12} />
          </button>
        </div>
      </div>

      {course.progress > 0 && (
        <div className="course-row-card-progress">
          <div className="course-row-card-progress-fill" style={{ width: `${course.progress}%` }} />
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verificar tipos**

Run (raiz do projeto): `npx tsc -b`
Expected: erro esperado neste ponto — `AcademyView.tsx` ainda importa `CourseCard` com as props antigas (`onOpen` já bate, mas o grid antigo some só na Task 10). Se o erro for só em `AcademyView.tsx`, está OK, será corrigido na Task 10. Se o erro for dentro do próprio `CourseCard.tsx`, corrija antes de seguir.

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/CourseCard.tsx
git commit -m "feat(academy): reescrever CourseCard no estilo hover Netflix (scale + overlay)"
```

---

### Task 8: `CourseRow.tsx` — fileira horizontal com setas

**Files:**
- Create: `src/components/academy/CourseRow.tsx`

**Interfaces:**
- Consumes: `CourseCard` (Task 7), `Course` (Task 2).
- Produces: `CourseRow(props: { title: string; courses: Course[]; onOpen: (course: Course) => void; showRanking?: boolean })` — consumido pela Task 10 (`AcademyView`).

- [ ] **Step 1: Criar o arquivo**

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CourseRowProps {
  title: string;
  courses: Course[];
  onOpen: (course: Course) => void;
  showRanking?: boolean;
}

const SCROLL_AMOUNT = 680;

export const CourseRow: React.FC<CourseRowProps> = ({ title, courses, onOpen, showRanking }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
  }, [courses, updateArrows]);

  const scrollBy = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (courses.length === 0) return null;

  return (
    <div className="course-row">
      <h3 className="course-row-title">{title}</h3>
      <div className="course-row-viewport">
        {canScrollLeft && (
          <button
            className="course-row-arrow course-row-arrow-left"
            onClick={() => scrollBy(-SCROLL_AMOUNT)}
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="course-row-track" ref={trackRef} onScroll={updateArrows}>
          {courses.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpen={onOpen}
              rank={showRanking ? idx + 1 : undefined}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            className="course-row-arrow course-row-arrow-right"
            onClick={() => scrollBy(SCROLL_AMOUNT)}
            aria-label="Rolar para a direita"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verificar tipos**

Run (raiz do projeto): `npx tsc -b`
Expected: sem novos erros introduzidos por este arquivo (o erro pré-existente de `AcademyView.tsx`, se ainda houver, será resolvido na Task 10).

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/CourseRow.tsx
git commit -m "feat(academy): criar CourseRow (fileira horizontal com setas)"
```

---

### Task 9: `AcademyHero.tsx` — hero rotativo

**Files:**
- Create: `src/components/academy/AcademyHero.tsx`

**Interfaces:**
- Consumes: `Course` (Task 2), classes `.academy-hero*` (Task 6).
- Produces: `AcademyHero(props: { courses: Course[]; onSelect: (course: Course) => void })` — consumido pela Task 10.

- [ ] **Step 1: Criar o arquivo**

```tsx
import React, { useEffect, useState } from 'react';
import { Course } from '../../types';
import { Play, Info } from 'lucide-react';

interface AcademyHeroProps {
  courses: Course[];
  onSelect: (course: Course) => void;
}

const ROTATE_INTERVAL_MS = 6000;

export const AcademyHero: React.FC<AcademyHeroProps> = ({ courses, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [courses.length]);

  useEffect(() => {
    if (paused || courses.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % courses.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, courses.length]);

  if (courses.length === 0) return null;

  const course = courses[activeIndex];
  const backdrop = course.backdropImage || course.coverImage;

  return (
    <div
      className="academy-hero"
      style={{ backgroundImage: `url(${backdrop})` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="academy-hero-shade" />
      <div className="academy-hero-content">
        <span className="academy-hero-badge">Recomendado para você</span>
        <h1 className="academy-hero-title">{course.title}</h1>
        <p className="academy-hero-desc">{course.description}</p>
        <div className="academy-hero-meta">
          <span>{course.lessonsCount} aulas</span>
          <span>{course.duration}</span>
          <span>{course.category}</span>
        </div>
        <div className="academy-hero-btns">
          <button className="btn btn-gold academy-hero-btn-play" onClick={() => onSelect(course)}>
            <Play size={16} fill="currentColor" />
            <span>Assistir Agora</span>
          </button>
          <button className="academy-hero-btn-info" onClick={() => onSelect(course)}>
            <Info size={16} />
            <span>Mais Informações</span>
          </button>
        </div>
      </div>

      {courses.length > 1 && (
        <div className="academy-hero-dots">
          {courses.map((c, idx) => (
            <button
              key={c.id}
              className={`academy-hero-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ver ${c.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verificar tipos**

Run (raiz do projeto): `npx tsc -b`
Expected: sem novos erros introduzidos por este arquivo.

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/AcademyHero.tsx
git commit -m "feat(academy): criar AcademyHero (banner rotativo de cursos em destaque)"
```

---

### Task 10: `AcademyView.tsx` — orquestrar hero + fileiras

**Files:**
- Modify: `src/components/academy/AcademyView.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `AcademyHero` (Task 9), `CourseRow` (Task 8), `LessonPlayerModal` (já existe, ajustado na Task 5), `useEkoz()` (`courses`, `selectedCourse`, `setSelectedCourse` — já existem em `EkozContext.tsx`).
- Produces: nada consumido por outra task — é o topo da árvore de componentes da Academy.

- [ ] **Step 1: Substituir o arquivo inteiro**

```tsx
import React, { useMemo } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { AcademyHero } from './AcademyHero';
import { CourseRow } from './CourseRow';
import { LessonPlayerModal } from './LessonPlayerModal';
import { Course } from '../../types';

const CATEGORY_SLUGS: Record<Course['category'], string> = {
  'Alta Performance': 'alta-performance',
  'Gestão & Escala': 'gestao-escala',
  'Liderança & Inteligência': 'lideranca-inteligencia',
  'Lifestyle & Network': 'lifestyle-network',
};

const CATEGORIES = Object.keys(CATEGORY_SLUGS) as Course['category'][];

export const AcademyView: React.FC = () => {
  const { courses, selectedCourse, setSelectedCourse } = useEkoz();

  const featuredCourses = useMemo(() => courses.filter((c) => c.isFeatured), [courses]);

  const continueWatching = useMemo(
    () => courses.filter((c) => c.progress > 0 && c.progress < 100),
    [courses]
  );

  const trending = useMemo(
    () => [...courses].sort((a, b) => (b.learnersCount || 0) - (a.learnersCount || 0)).slice(0, 8),
    [courses]
  );

  const scrollToCategory = (category: Course['category']) => {
    document
      .getElementById(`academy-row-${CATEGORY_SLUGS[category]}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="academy-view-container">
      <AcademyHero courses={featuredCourses} onSelect={setSelectedCourse} />

      <div className="academy-quick-nav">
        {CATEGORIES.map((cat) => (
          <button key={cat} className="academy-quick-nav-btn" onClick={() => scrollToCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="academy-rows">
        <CourseRow title="Continuar Assistindo" courses={continueWatching} onOpen={setSelectedCourse} />
        <CourseRow title="Em Alta no Ecossistema" courses={trending} onOpen={setSelectedCourse} showRanking />

        {CATEGORIES.map((cat) => (
          <div key={cat} id={`academy-row-${CATEGORY_SLUGS[cat]}`}>
            <CourseRow
              title={cat}
              courses={courses.filter((c) => c.category === cat)}
              onOpen={setSelectedCourse}
            />
          </div>
        ))}
      </div>

      {selectedCourse && (
        <LessonPlayerModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verificar tipos e lint**

Run (raiz do projeto):
```bash
npx tsc -b
npm run lint
```
Expected: `tsc -b` sem erros. `oxlint` pode acusar avisos cosméticos pré-existentes em outros arquivos (já presentes antes deste plano — ver `RELATORIO-VERIFICACAO-DEPLOY.md`/histórico do projeto); não deve haver novo erro (`error`, não `warning`) nos arquivos tocados por este plano.

- [ ] **Step 3: Build**

Run (raiz do projeto): `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 4: Commit**

```bash
git add src/components/academy/AcademyView.tsx
git commit -m "feat(academy): orquestrar hero rotativo + fileiras no AcademyView"
```

---

### Task 11: QA manual end-to-end + commit final

**Files:** nenhum (apenas verificação).

- [ ] **Step 1: Subir backend e frontend**

Terminal 1 (a partir de `server/`): `npm run dev`
Terminal 2 (a partir da raiz do projeto): `npm run dev`

- [ ] **Step 2: Login e navegação**

No navegador, abrir a URL do Vite (`http://localhost:5173`), logar como `ezekiel@ekoz.com.br` / `ekoz2026`, ir para a aba **Academy**.

Checklist a confirmar visualmente:
- [ ] Hero aparece com imagem de fundo, título, descrição, badge "Recomendado para você" (sem número de match) e os dois botões.
- [ ] Hero troca de curso sozinho a cada ~6s; passar o mouse por cima pausa a rotação; os pontinhos (dots) refletem o curso atual e são clicáveis.
- [ ] Clicar em "Assistir Agora" ou "Mais Informações" abre o `LessonPlayerModal` já na primeira aula **não concluída** do curso (para `course-1`, deve abrir direto em "Aula 2: Delegação Estratégica...", já que a Aula 1 está marcada como concluída no seed).
- [ ] Fileira "Continuar Assistindo" mostra `course-1`, `course-3` e `course-8` (os três com progresso parcial).
- [ ] Fileira "Em Alta no Ecossistema" mostra badges `TOP 1`–`TOP 4` nos primeiros cards.
- [ ] Uma fileira por categoria aparece, cada uma com os cursos certos (ex.: "Alta Performance" com `course-3` e `course-4`).
- [ ] Passar o mouse sobre um card da fileira faz ele crescer no próprio lugar (sem empurrar os vizinhos), revelando título, meta e os 3 ícones de ação.
- [ ] Clicar no ícone "+" (adicionar à lista) mostra um toast "Em breve" — não deve navegar nem quebrar.
- [ ] Passar o mouse sobre uma fileira revela as setas de navegação lateral; clicar nelas rola suavemente; a seta desaparece quando não há mais conteúdo para rolar naquela direção.
- [ ] Chips de categoria no topo rolam a página até a fileira correspondente.
- [ ] Redimensionar a janela para largura de celular (ou abrir DevTools em modo responsivo, ~390px): hero, fileiras e cards se reajustam sem overflow lateral (sem barra de rolagem horizontal na página).

Se algum item falhar, ajuste o componente/CSS correspondente antes de prosseguir (não faz parte de uma task numerada porque é o passo de validação final do conjunto, não de uma peça isolada).

- [ ] **Step 3: Rebuild final**

Run (raiz do projeto):
```bash
npx tsc -b
npm run build
npm run lint
```

Run (a partir de `server/`):
```bash
npx tsc --noEmit
```

Expected: todos sem erro.

- [ ] **Step 4: Commit final (se houve ajustes no Step 2)**

```bash
git add -A
git commit -m "fix(academy): ajustes finais de QA no redesign estilo Netflix"
```

Se nenhum ajuste foi necessário no Step 2, não há o que commitar aqui — as Tasks 1-10 já cobrem todo o trabalho.
