import { PrismaClient } from '@prisma/client';

const API_BASE = 'http://localhost:3001/api/v1';

interface TestResult {
  suite: string;
  test: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<any>) {
  const start = Date.now();
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    results.push({ suite, test: name, status: 'PASSED', durationMs, details });
    console.log(`  ✅ [${suite}] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ suite, test: name, status: 'FAILED', durationMs, details: err.message });
    console.error(`  ❌ [${suite}] ${name} FAILED:`, err.message);
  }
}

async function main() {
  console.log('\n🏛️ ========================================================');
  console.log('🧪 INICIANDO SUÍTE COMPLETA DE TESTES DE INTEGRAÇÃO EKOZ');
  console.log('🏛️ ========================================================\n');

  let ezekielToken = '';
  let newMemberToken = '';
  let createdPostId = '';
  let courseId = '';
  let lessonId = '';
  let eventId = '';
  let experienceId = '';

  // 1. Health Check
  await runTest('Sistema', 'API Health Check', async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('Status diferente de online');
    return data;
  });

  // 2. Auth Login - Ezekiel (CEO)
  await runTest('Autenticação', 'Login Executivo do CEO Ezekiel', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ezekiel@ekoz.com.br',
        password: 'ekoz2026',
      }),
    });
    if (!res.ok) throw new Error(`Login falhou: HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.role !== 'CEO') throw new Error('Dados de autenticação inválidos');
    ezekielToken = data.token;
    return { name: data.user.name, role: data.user.role, plan: data.user.plan };
  });

  // 3. Auth Register - Novo Membro de Elite
  const testEmail = `empresario_${Date.now()}@holding.com.br`;
  await runTest('Autenticação', 'Cadastro de Novo Membro Executivo', async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'senhaSegura2026',
        name: 'Dr. Leonardo Castilhos',
        company: 'Castilhos Wealth Management',
        headline: 'Gestor de Fundos & Family Office',
        role: 'Member',
        plan: 'Membro Ekoz',
        whatsapp: '+55 51 98888-9999',
      }),
    });
    if (!res.ok) throw new Error(`Cadastro falhou: HTTP ${res.status}`);
    const data = await res.json();
    newMemberToken = data.token;
    return { id: data.user.id, email: data.user.email };
  });

  // 4. Feed - Criação de Publicação na Ágora
  await runTest('Feed Social', 'Criar Publicação na Ágora pelo CEO', async () => {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ezekielToken}`,
      },
      body: JSON.stringify({
        content: '🎯 Estratégia é a arte de escolher o que NÃO fazer. Reunião de alinhamento com conselho finalizada com sucesso.',
        category: 'Insights & Estratégia',
      }),
    });
    if (!res.ok) throw new Error(`Erro ao criar post: HTTP ${res.status}`);
    const data = await res.json();
    createdPostId = data.id;
    return { postId: data.id, author: data.author.name };
  });

  // 5. Feed - Curtir e Comentar
  await runTest('Feed Social', 'Curtir Publicação com Novo Membro', async () => {
    const res = await fetch(`${API_BASE}/posts/${createdPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newMemberToken}` },
    });
    if (!res.ok) throw new Error(`Erro ao curtir post: HTTP ${res.status}`);
    const data = await res.json();
    if (!data.liked) throw new Error('Deveria constar como curtido');
    return data;
  });

  await runTest('Feed Social', 'Adicionar Comentário no Post', async () => {
    const res = await fetch(`${API_BASE}/posts/${createdPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newMemberToken}`,
      },
      body: JSON.stringify({
        content: 'Visão cirúrgica, Ezekiel! Totalmente alinhado.',
      }),
    });
    if (!res.ok) throw new Error(`Erro ao comentar: HTTP ${res.status}`);
    const data = await res.json();
    return { commentId: data.id, text: data.content };
  });

  // 6. Academy - Cursos e Progresso
  await runTest('Braço Educacional', 'Listar Masterclasses e Marcar Aula como Concluída', async () => {
    const listRes = await fetch(`${API_BASE}/academy/courses`, {
      headers: { Authorization: `Bearer ${ezekielToken}` },
    });
    if (!listRes.ok) throw new Error(`Erro ao listar cursos: HTTP ${listRes.status}`);
    const courses = await listRes.json();
    if (courses.length === 0) throw new Error('Nenhum curso retornado');
    courseId = courses[0].id;
    lessonId = courses[0].modules[0].lessons[0].id;

    // Toggle progress
    const progRes = await fetch(`${API_BASE}/academy/lessons/${lessonId}/progress`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ezekielToken}` },
    });
    if (!progRes.ok) throw new Error(`Erro ao atualizar progresso: HTTP ${progRes.status}`);
    const progData = await progRes.json();
    return { courseTitle: courses[0].title, lessonId: progData.lessonId, completed: progData.completed };
  });

  // 7. Marketplace - Cadastro de Nova Empresa B2B
  await runTest('Marketplace B2B', 'Cadastrar Negócio em Núcleo Temático', async () => {
    const res = await fetch(`${API_BASE}/marketplace/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newMemberToken}`,
      },
      body: JSON.stringify({
        name: 'Castilhos Wealth Advisory',
        coreId: 'core-juridico',
        headline: 'Gestão de fortunas e estruturação de fundos exclusivos.',
        description: 'Multi-family office atendendo empresários com patrimônio líquido superior a R$ 20M.',
        founder: 'Dr. Leonardo Castilhos',
        founderRole: 'Managing Partner',
        avatar: '/ezekiel.jpg',
        tags: ['Wealth Management', 'Family Office', 'Investimentos'],
        whatsapp: '+55 51 98888-9999',
        location: 'Porto Alegre, RS',
      }),
    });
    if (!res.ok) throw new Error(`Erro ao cadastrar empresa: HTTP ${res.status}`);
    const data = await res.json();
    return { businessId: data.id, name: data.name };
  });

  // 8. Eventos - RSVP
  await runTest('Eventos & Cúpulas', 'Confirmar Presença (RSVP) em Cúpula Executiva', async () => {
    const listRes = await fetch(`${API_BASE}/events`);
    const events = await listRes.json();
    eventId = events[0].id;

    const rsvpRes = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newMemberToken}` },
    });
    if (!rsvpRes.ok) throw new Error(`Erro no RSVP: HTTP ${rsvpRes.status}`);
    const data = await rsvpRes.json();
    return { eventTitle: events[0].title, isRegistered: data.isRegistered };
  });

  // 9. Experiências - Candidatura VIP
  await runTest('Expedições de Luxo', 'Submeter Candidatura para Expedição Cânions RS', async () => {
    const listRes = await fetch(`${API_BASE}/experiences`);
    const exps = await listRes.json();
    experienceId = exps[0].id;

    const applyRes = await fetch(`${API_BASE}/experiences/${experienceId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newMemberToken}`,
      },
      body: JSON.stringify({
        notes: 'Gostaria de levar meu sócio e participar da mesa redonda de 8 dígitos.',
      }),
    });
    if (!applyRes.ok) throw new Error(`Erro na candidatura: HTTP ${applyRes.status}`);
    const data = await applyRes.json();
    return data;
  });

  // 10. Cakto Webhook - Simulação de Pagamento Aprovado e Upgrade para Ekoz Black
  await runTest('Gateway Cakto', 'Processar Webhook de Pagamento Aprovado & Upgrade Ekoz Black', async () => {
    const res = await fetch(`${API_BASE}/cakto/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'order.approved',
        data: {
          id: `cakto_order_${Date.now()}`,
          amount: 125000, // R$ 1.250,00 em centavos
          payment_method: 'pix',
          status: 'paid',
          customer: {
            email: testEmail,
            name: 'Dr. Leonardo Castilhos',
            phone: '+55 51 98888-9999',
          },
          metadata: {
            plan: 'Ekoz Black',
          },
        },
      }),
    });
    if (!res.ok) throw new Error(`Erro no webhook Cakto: HTTP ${res.status}`);
    const data = await res.json();

    // Verify user was upgraded in database
    const prisma = new PrismaClient();
    const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
    await prisma.$disconnect();

    if (updatedUser?.plan !== 'Ekoz Black') throw new Error('Plano do usuário não foi atualizado para Ekoz Black');
    return { user: updatedUser.name, newPlan: updatedUser.plan, newRole: updatedUser.role };
  });

  // 11. WhatsApp Dispatcher
  await runTest('WhatsApp Engine', 'Teste de Formatação e Disparo de Push WhatsApp', async () => {
    const res = await fetch(`${API_BASE}/whatsapp/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+55 55 99999-8888',
        title: 'Masterclass ao Vivo Confirmada',
        body: 'A masterclass exclusiva com o CEO Ezekiel Dall\'Bello começará em 15 minutos.',
      }),
    });
    if (!res.ok) throw new Error(`Erro no teste WhatsApp: HTTP ${res.status}`);
    const data = await res.json();
    return data;
  });

  // Summary
  console.log('\n🏛️ ========================================================');
  console.log('📊 RESUMO DA EXECUÇÃO DOS TESTES DE INTEGRAÇÃO:');
  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;
  console.log(`   Total de Testes: ${results.length}`);
  console.log(`   ✅ Sucessos: ${passed}`);
  console.log(`   ❌ Falhas: ${failed}`);
  console.log('🏛️ ========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
