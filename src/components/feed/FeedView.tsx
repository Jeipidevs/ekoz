import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { CreatePostCard } from './CreatePostCard';
import { PostCard } from './PostCard';
import { ACADEMY_ENABLED } from '../../config/features';
import {
  Sparkles,
  Shield,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Compass,
  MessageCircle,
} from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, setActiveTab, openChatWith, user, events, members, thematicCores } = useEkoz();
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos');

  const filterTabs = [
    'Todos',
    'Avisos Oficiais',
    'Negócios',
    'Insights & Estratégia',
    'Oportunidades',
  ];

  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === 'Todos') return true;
    return post.category === selectedFilter;
  });

  const nextEvent = events[0];

  return (
    <div className="feed-layout-grid">
      {/* Main Feed Column */}
      <div className="feed-main-column">
        {/* CEO Hero Slogan Banner */}
        <div className="ekoz-card hero-slogan-card">
          <div className="hero-glow-overlay"></div>
          <div className="hero-content-inner">
            <div className="hero-badge-row">
              <span className="badge badge-gold">
                <Sparkles size={13} />
                <span>ECOSSISTEMA EXECUTIVO</span>
              </span>
              <span className="badge badge-moss">ACESSO VIP</span>
            </div>

            <h1 className="hero-slogan-title">
              "Viva a vida que você <span className="text-gold-gradient">nunca VIVEU!</span>"
            </h1>

            <p className="hero-slogan-desc">
              Bem-vindo à <strong>Ekoz</strong>. O ecossistema concebido por{' '}
              <strong>Ezekiel Dall'Bello</strong> para líderes, empresários e mentes de elite que
              unem alta performance nos negócios, saúde inegociável e expansão contínua.
            </p>

            <div className="hero-metrics-row">
              <div className="hero-metric-item">
                <span className="metric-val">100%</span>
                <span className="metric-lbl">Curadoria B2B</span>
              </div>
              <div className="hero-metric-item">
                <span className="metric-val">{thematicCores.length || '—'}</span>
                <span className="metric-lbl">Núcleos Setoriais</span>
              </div>
              <div className="hero-metric-item">
                <span className="metric-val">24/7</span>
                <span className="metric-lbl">Conexão & Rede</span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Input Box */}
        <CreatePostCard />

        {/* Filter Navigation Bar */}
        <div className="feed-filter-bar">
          <div className="filter-buttons-scroll">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`filter-tab-btn ${selectedFilter === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Post Feed List */}
        <div className="posts-stream">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Right Column / Widgets */}
      <aside className="feed-right-column">
        {/* CEO Spotlight Card */}
        <div className="ekoz-card ceo-spotlight-card">
          <div className="ceo-card-cover">
            <div className="cover-gradient-tag">LIDERANÇA & MENTORIA</div>
          </div>
          <div className="ceo-avatar-badge-wrap">
            <img
              src="/ezekiel.jpg"
              alt="Ezekiel Dall'Bello"
              className="ceo-avatar-img"
            />
            <div className="verified-crown" title="CEO & Fundador">
              <Award size={15} color="#0F1713" />
            </div>
          </div>
          <div className="ceo-info">
            <h3 className="ceo-name">Ezekiel Dall'Bello</h3>
            <p className="ceo-subtitle">CEO Ekoz • Fundador da Cross Life & ZK Co.</p>
            <p className="ceo-accolade">Mister Rio Grande do Sul 2025 • CNB</p>
            
            <p className="ceo-bio-snippet">
              "O Homem Além da Beleza: nossa meta é elevar o padrão da sua mente, do seu corpo e do seu faturamento empresarial."
            </p>

            {ACADEMY_ENABLED && (
              <div className="ceo-card-actions">
                <button
                  onClick={() => setActiveTab('academy')}
                  className="btn btn-gold btn-sm full-width"
                >
                  <Sparkles size={14} />
                  <span>Ver Masterclasses do CEO</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Event Teaser */}
        {nextEvent && (
          <div className="ekoz-card event-teaser-card">
            <div className="event-card-header-row">
              <div className="event-badge-pill">
                <Calendar size={13} />
                <span>PRÓXIMO ENCONTRO</span>
              </div>
              <span className="badge badge-gold">{nextEvent.type}</span>
            </div>

            <h4 className="event-teaser-title">{nextEvent.title}</h4>
            <p className="event-teaser-date">🗓️ {nextEvent.date}</p>
            <p className="event-teaser-loc">📍 {nextEvent.location}</p>

            <button
              onClick={() => setActiveTab('events')}
              className="btn btn-secondary btn-sm full-width mt-3"
            >
              <span>Detalhes & Credenciamento</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Experiences Teaser ("Viva a vida que você nunca VIVEU!") */}
        <div className="ekoz-card experience-teaser-card">
          <div className="exp-teaser-header">
            <Compass size={18} color="#DFC16E" />
            <span className="exp-teaser-title">Expedição Cânions 2026</span>
          </div>
          <p className="exp-teaser-desc">
            Voo de balão, trilha 4x4 e mentoria ao pôr do sol nos cânions da Serra Gaúcha.
          </p>
          <button
            onClick={() => setActiveTab('experiences')}
            className="btn btn-gold btn-sm full-width"
            style={{ fontSize: '0.8rem' }}
          >
            <span>Ver Experiências Exclusivas</span>
          </button>
        </div>

        {/* Connect with Members List */}
        <div className="ekoz-card members-connect-card">
          <div className="card-section-header">
            <h4>Empresários em Destaque</h4>
            <Users size={16} color="#A8B5AE" />
          </div>

          <div className="members-mini-list">
            {members
              .filter((m) => m.id !== user.id)
              .slice(0, 4)
              .map((member) => (
                <div key={member.id} className="member-mini-item">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="member-mini-avatar"
                  />
                  <div className="member-mini-info">
                    <span className="member-mini-name">{member.name}</span>
                    <span className="member-mini-role">{member.company}</span>
                  </div>
                  <button
                    onClick={() => openChatWith(member)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    title={`Conversar com ${member.name}`}
                  >
                    <MessageCircle size={15} color="#DFC16E" />
                  </button>
                </div>
              ))}
            {members.filter((m) => m.id !== user.id).length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                Ainda não há outros membros — em breve o ecossistema cresce.
              </p>
            )}
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="btn btn-ghost btn-sm full-width"
            style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#A8B5AE' }}
          >
            Ver Diretório Completo no Marketplace
          </button>
        </div>
      </aside>
    </div>
  );
};
