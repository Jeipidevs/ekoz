import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ekoz Database Seeding...');

  // 1. Clear existing records safely
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.experienceApplication.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.lessonComment.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.marketplaceBusiness.deleteMany();
  await prisma.thematicCore.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('ekoz2026', 10);

  // 2. Create Users
  const ezekiel = await prisma.user.create({
    data: {
      id: 'user-ezekiel',
      email: 'ezekiel@ekoz.com.br',
      passwordHash: defaultPasswordHash,
      name: "Ezekiel Dall'Bello",
      role: 'CEO',
      headline: 'CEO & Fundador Ekoz | ZK & Company | Performance, Estratégia e Negócios',
      company: 'ZK & Company / Ekoz',
      avatar: '/ezekiel.jpg',
      bio: 'Empresário, mentor e palestrante focado em estratégia, gestão e performance executiva. Lidero a ZK & Company e fundei a rede Cross Life em 2019. Mister RS 2025. Minha missão na Ekoz é reunir empresários obstinados que desejam romper seus limites e viver a vida que nunca viveram.',
      verified: true,
      skills: JSON.stringify(['Estratégia Empresarial', 'Alta Performance', 'Inteligência Emocional', 'Liderança', 'Expansão de Negócios']),
      location: 'Santa Maria / Porto Alegre, RS',
      whatsapp: '+55 55 99999-8888',
      instagram: '@ezekieldallbello',
      linkedin: 'linkedin.com/in/ezekiel-dall-bello',
      plan: 'Founding Partner',
    },
  });

  const camila = await prisma.user.create({
    data: {
      id: 'user-2',
      email: 'camila@vasconcellos.com.br',
      passwordHash: defaultPasswordHash,
      name: 'Dra. Camila Vasconcellos',
      role: 'Black Member',
      headline: 'Sócia-diretora na Vasconcellos M&A | Estruturação Tributária & Holdings',
      company: 'Vasconcellos Capital',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Advogada tributarista e conselheira de empresas familiares com mais de R$ 100M sob governança.',
      verified: true,
      skills: JSON.stringify(['Holdings', 'Tributário', 'M&A', 'Planejamento Sucessório']),
      location: 'São Paulo, SP',
      whatsapp: '+55 11 98888-7777',
      plan: 'Ekoz Black',
    },
  });

  const rodrigo = await prisma.user.create({
    data: {
      id: 'user-3',
      email: 'rodrigo@vortextia.com',
      passwordHash: defaultPasswordHash,
      name: 'Rodrigo Silveira',
      role: 'Member',
      headline: 'Founder & CTO na Vórtex IA | Soluções de Automação e Big Data para Grandes Redes',
      company: 'Vórtex Inteligência Artificial',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Especialista em inteligência artificial aplicada à conversão de vendas e redução de churn para SaaS e franquias.',
      verified: true,
      skills: JSON.stringify(['Inteligência Artificial', 'Automações', 'SaaS', 'Engenharia de Dados']),
      location: 'Florianópolis, SC',
      whatsapp: '+55 48 97777-6666',
      plan: 'Membro Ekoz',
    },
  });

  const marcelo = await prisma.user.create({
    data: {
      id: 'user-4',
      email: 'marcelo@highlands.com.br',
      passwordHash: defaultPasswordHash,
      name: 'Marcelo Bittencourt',
      role: 'Black Member',
      headline: 'Diretor de Incorporação na Highlands Real Estate | Imóveis de Ultra Luxo',
      company: 'Highlands Empreendimentos',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      bio: 'Mais de 18 anos desenvolvendo residenciais boutique e condomínios de alto padrão na Serra Gaúcha e Litoral.',
      verified: true,
      skills: JSON.stringify(['Mercado Imobiliário', 'Investimentos', 'Incorporação', 'Alto Padrão']),
      location: 'Gramado / Canela, RS',
      whatsapp: '+55 54 99111-2222',
      plan: 'Ekoz Black',
    },
  });

  const juliana = await prisma.user.create({
    data: {
      id: 'user-5',
      email: 'juliana@sparkmedia.com.br',
      passwordHash: defaultPasswordHash,
      name: 'Juliana Mendes',
      role: 'Member',
      headline: 'Head de Growth na Spark Mídia | Gestão de R$ 35M em Tráfego Pago Anual',
      company: 'Spark Growth Media',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      bio: 'Focada na escala de infoprodutores e redes físicas com estratégias multicanal de alta conversão.',
      verified: true,
      skills: JSON.stringify(['Tráfego Pago', 'Growth Marketing', 'Branding', 'Copywriting']),
      location: 'Curitiba, PR',
      whatsapp: '+55 41 98444-5555',
      plan: 'Membro Ekoz',
    },
  });

  console.log('✅ Users seeded');

  // 3. Seed Posts
  const post1 = await prisma.post.create({
    data: {
      id: 'post-1',
      authorId: ezekiel.id,
      content: '🏛️ Bem-vindos oficialmente ao ecossistema Ekoz! Este espaço foi desenhado exclusivamente para empresários e líderes que não aceitam a mediocridade. Aqui nós compartilhamos estratégias reais, negócios de alto valor e conexões que transformam trajetórias. Usem a Ágora para interagir, o braço educacional para lapidar sua gestão e o marketplace para gerar negócios entre nossos membros.',
      category: 'Avisos Oficiais',
      pinned: true,
      mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      id: 'post-2',
      authorId: camila.id,
      content: 'Fechamos esta semana a reestruturação de uma holding familiar no setor agropecuário com economia tributária estimada em R$ 4.2M/ano. O planejamento sucessório e tributário preventivo é um dos pilares mais negligenciados por fundadores de alto faturamento. Se você fatura acima de R$ 10M/ano, faça uma auditoria urgente.',
      category: 'Insights & Estratégia',
      pinned: false,
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
  });

  const post3 = await prisma.post.create({
    data: {
      id: 'post-3',
      authorId: rodrigo.id,
      content: '🚀 Lançamos ontem uma atualização na nossa IA de atendimento para redes de franquias: integração nativa com o WhatsApp Web e CRM. Reduzimos o tempo de primeira resposta para 3 segundos e aumentamos a taxa de agendamento em 34%. Aberto para trocar figurinhas com outros fundadores de SaaS da comunidade!',
      category: 'Negócios',
      pinned: false,
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 3600000 * 12),
    },
  });

  // Comments and Likes
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: rodrigo.id,
      content: 'Excelente iniciativa Ezekiel! Honrado em fazer parte do conselho de fundadores.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: camila.id,
      content: 'Espaço fantástico para geração de negócios qualificados. Parabéns pela liderança!',
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: ezekiel.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: rodrigo.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: ezekiel.id,
    },
  });

  console.log('✅ Posts, Comments & Likes seeded');

  // 4. Thematic Cores & Marketplace Businesses
  const coresData = [
    {
      id: 'core-ti',
      name: 'TI & Inteligência Artificial',
      slug: 'ti-ia',
      icon: 'Cpu',
      description: 'Software, automações avançadas, IA generativa, segurança da informação e infraestrutura cloud.',
    },
    {
      id: 'core-mkt',
      name: 'Marketing & Publicidade',
      slug: 'marketing',
      icon: 'TrendingUp',
      description: 'Agências de performance, branding executivo, tráfego pago, audiovisual e assessoria de imprensa.',
    },
    {
      id: 'core-imob',
      name: 'Mercado Imobiliário & Luxo',
      slug: 'imobiliario',
      icon: 'Building2',
      description: 'Incorporadoras, construtoras, corretores de ultra luxo, arquitetura boutique e loteamentos.',
    },
    {
      id: 'core-saude',
      name: 'Saúde & Alta Performance',
      slug: 'saude-performance',
      icon: 'Activity',
      description: 'Clínicas integradas, longevidade humana, academias premium, suplementação e biohacking.',
    },
    {
      id: 'core-juridico',
      name: 'Jurídico & Estratégico',
      slug: 'juridico-estrategico',
      icon: 'Scale',
      description: 'Holdings patrimoniais, tributário avançado, fusões e aquisições (M&A) e governança corporativa.',
    },
  ];

  for (const core of coresData) {
    await prisma.thematicCore.create({ data: core });
  }

  const businessesData = [
    {
      id: 'biz-1',
      name: 'Vórtex Inteligência Artificial',
      coreId: 'core-ti',
      headline: 'Soluções de automação comercial e IA conversacional para redes de franquias e e-commerce.',
      description: 'Desenvolvemos agentes autônomos de IA que integram com WhatsApp, CRM e ERPs para qualificar leads e realizar vendas 24 horas por dia com linguagem humana natural.',
      founderName: 'Rodrigo Silveira',
      founderRole: 'Founder & CTO',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      tags: JSON.stringify(['Inteligência Artificial', 'Automação WhatsApp', 'Big Data', 'SaaS']),
      whatsapp: '+55 48 97777-6666',
      website: 'https://vortextia.com',
      location: 'Florianópolis, SC',
      verified: true,
      featured: true,
      ownerId: rodrigo.id,
    },
    {
      id: 'biz-2',
      name: 'Spark Growth Media',
      coreId: 'core-mkt',
      headline: 'Assessoria de tráfego de alta escala e branding para empresários de grande faturamento.',
      description: 'Gerenciamos mais de R$ 35 milhões ao ano em mídia paga nas plataformas Meta Ads, Google Ads e TikTok. Criamos ecossistemas de conversão e funis perpétuos para infoprodutos e franquias.',
      founderName: 'Juliana Mendes',
      founderRole: 'Head de Growth',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      tags: JSON.stringify(['Tráfego Pago', 'Meta Ads', 'Copywriting', 'Branding']),
      whatsapp: '+55 41 98444-5555',
      website: 'https://sparkmedia.com.br',
      location: 'Curitiba, PR',
      verified: true,
      featured: true,
      ownerId: juliana.id,
    },
    {
      id: 'biz-3',
      name: 'Highlands Empreendimentos',
      coreId: 'core-imob',
      headline: 'Desenvolvimento imobiliário de ultra luxo e residenciais boutique na Serra Gaúcha.',
      description: 'Projetos exclusivos com arquitetura biofílica, acabamentos nobres e valorização patrimonial acelerada em Gramado, Canela e Campos de Cima da Serra.',
      founderName: 'Marcelo Bittencourt',
      founderRole: 'Diretor de Incorporação',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      tags: JSON.stringify(['Ultra Luxo', 'Serra Gaúcha', 'Investimentos', 'Arquitetura']),
      whatsapp: '+55 54 99111-2222',
      website: 'https://highlands.com.br',
      location: 'Gramado, RS',
      verified: true,
      featured: false,
      ownerId: marcelo.id,
    },
    {
      id: 'biz-4',
      name: 'Vasconcellos M&A & Holdings',
      coreId: 'core-juridico',
      headline: 'Estruturação tributária, proteção patrimonial e assessoria jurídica em fusões e aquisições.',
      description: 'Escritório boutique focado em planejamento sucessório para grandes grupos familiares, reestruturação societária e preparação para captação de investimento.',
      founderName: 'Dra. Camila Vasconcellos',
      founderRole: 'Sócia-fundadora',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      tags: JSON.stringify(['Holdings', 'M&A', 'Tributário', 'Sucessório']),
      whatsapp: '+55 11 98888-7777',
      location: 'São Paulo, SP',
      verified: true,
      featured: true,
      ownerId: camila.id,
    },
  ];

  for (const biz of businessesData) {
    await prisma.marketplaceBusiness.create({ data: biz });
  }

  console.log('✅ Marketplace Cores & Businesses seeded');

  // 5. Courses, Modules & Lessons
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

  const module1_1 = await prisma.courseModule.create({
    data: {
      id: 'mod-1-1',
      courseId: course1.id,
      title: 'Módulo 1: Fundamentos da Liderança Inabalável',
      order: 1,
    },
  });

  const lesson1_1_1 = await prisma.lesson.create({
    data: {
      id: 'les-1-1-1',
      moduleId: module1_1.id,
      title: 'Aula 1: A Mentalidade do Empresário de Elite',
      duration: '22:15',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      summary: 'Como romper crenças limitantes de faturamento e estabelecer padrões inegociáveis de excelência na rotina executiva.',
      order: 1,
      resources: JSON.stringify([
        { name: 'Guia_Mentalidade_Executiva.pdf', type: 'PDF', url: '#' },
        { name: 'Planilha_Habitos_Alta_Performance.xlsx', type: 'Planilha', url: '#' },
      ]),
    },
  });

  const lesson1_1_2 = await prisma.lesson.create({
    data: {
      id: 'les-1-1-2',
      moduleId: module1_1.id,
      title: 'Aula 2: Delegação Estratégica e Criação de Processos',
      duration: '28:40',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      summary: 'O passo a passo para mapear gargalos operacionais e treinar líderes para assumirem a operação com autonomia total.',
      order: 2,
      resources: JSON.stringify([
        { name: 'Matriz_Delegacao_Ekoz.pdf', type: 'PDF', url: '#' },
      ]),
    },
  });

  // User progress
  await prisma.userLessonProgress.create({
    data: {
      userId: ezekiel.id,
      lessonId: lesson1_1_1.id,
      completed: true,
      completedAt: new Date(),
    },
  });

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

  const module2_1 = await prisma.courseModule.create({
    data: {
      id: 'mod-2-1',
      courseId: course2.id,
      title: 'Módulo 1: Arquitetura Societária e Tributação',
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      id: 'les-2-1-1',
      moduleId: module2_1.id,
      title: 'Aula 1: Tipos de Holdings e Vantagens Fiscais Reais',
      duration: '25:10',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      summary: 'Diferenças práticas entre holding pura, mista e imobiliária com estudos de caso reais de economia tributária.',
      order: 1,
      resources: JSON.stringify([
        { name: 'Checklist_Holdings_2026.pdf', type: 'PDF', url: '#' },
      ]),
    },
  });

  console.log('✅ Courses, Modules & Lessons seeded');

  // 6. Events & Experiences
  await prisma.event.create({
    data: {
      id: 'event-1',
      title: 'Ekoz Executive Summit 2026 — Gramado',
      type: 'Presencial',
      date: '14 a 16 de Novembro de 2026',
      time: '09:00 às 19:00',
      location: 'Hotel Saint Andrews, Gramado - RS',
      speakerName: "Ezekiel Dall'Bello & Convidados Especiais",
      speakerRole: 'Liderança Ekoz & Palestrantes Nacionais',
      description: 'Imersão de 3 dias com os principais empresários do ecossistema Ekoz. Rodadas de negócios de alto padrão, palestras estratégicas, jantares fechados e networking de altíssimo nível.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      totalSpots: 35,
    },
  });

  await prisma.event.create({
    data: {
      id: 'event-2',
      title: 'Masterclass: Escala e M&A no Cenário Atual',
      type: 'Online',
      date: '10 de Outubro de 2026',
      time: '20:00 às 22:30',
      location: 'Sala Exclusiva Ekoz Live',
      speakerName: 'Dra. Camila Vasconcellos',
      speakerRole: 'Especialista em M&A',
      description: 'Como preparar o seu balanço, governança e múltiplos de EBITDA para receber valuation premium em processos de aquisição.',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop&q=80',
      totalSpots: 100,
    },
  });

  await prisma.experience.create({
    data: {
      id: 'exp-1',
      title: 'Expedição Cânions RS 2026 — Helicóptero & Negócios',
      subtitle: 'Uma jornada inesquecível de conexão, aventura e negócios nas alturas',
      destination: 'Cambará do Sul, Aparados da Serra - RS',
      dates: '22 a 25 de Outubro de 2026',
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
      ]),
      highlights: JSON.stringify([
        'Voo de helicóptero sobre o Cânion Fortaleza e Itaimbezinho',
        'Hospedagem em Glamping de Ultra Luxo com gastronomia premiada',
        'Mesa redonda executiva: Estratégias para faturar 8 dígitos',
        'Jantar harmonizado com vinhos raros da Serra Gaúcha',
      ]),
      description: 'A união perfeita entre adrenalina, paisagens de tirar o fôlego e conversas estratégicas ao redor do fogo com empresários selecionados a dedo.',
      status: 'Últimas Vagas',
      investment: 'R$ 8.900 ou Acesso VIP Ekoz Black',
    },
  });

  await prisma.experience.create({
    data: {
      id: 'exp-2',
      title: 'Retiro Mendoza Wine & Business — Argentina',
      subtitle: 'Imersão em vinícolas históricas e conexões bilaterais no Cone Sul',
      destination: 'Mendoza, Vale do Uco - Argentina',
      dates: '03 a 07 de Dezembro de 2026',
      coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
      ]),
      highlights: JSON.stringify([
        'Acomodações privativas em lodges dentro das melhores vinícolas do mundo',
        'Degustação privada com os principais enólogos da América do Sul',
        'Networking executivo com fundadores de empresas multinacionais',
      ]),
      description: 'Experiência imersiva focada em descanso estratégico, expansão de visão global e relacionamentos de valor eterno.',
      status: 'Exclusivo Black',
      investment: 'Exclusivo para membros Ekoz Black Mastermind',
    },
  });

  console.log('✅ Events & Experiences seeded');

  // 7. Initial Notifications
  await prisma.notification.create({
    data: {
      userId: ezekiel.id,
      type: 'whatsapp',
      title: 'WhatsApp Push Ativo',
      description: 'Seu número +55 55 99999-8888 está sincronizado com o canal de notificações push do ecossistema Ekoz.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: ezekiel.id,
      type: 'announcement',
      title: 'Aviso Oficial Publicado',
      description: 'Sua mensagem de boas-vindas foi fixada no topo da Ágora Executiva.',
      isRead: true,
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
