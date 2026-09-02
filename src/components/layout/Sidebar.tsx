import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  Layers,
  GraduationCap,
  Store,
  Calendar,
  Compass,
  Video,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setWhatsappPushOpen, setCheckoutOpen } = useEkoz();
  const [expanded, setExpanded] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'feed',
      label: 'Feed Executivo',
      icon: <Layers size={19} />,
    },
    {
      id: 'academy',
      label: 'Ekoz Academy',
      icon: <GraduationCap size={19} />,
      badge: 'Aulas',
    },
    {
      id: 'marketplace',
      label: 'Marketplace B2B',
      icon: <Store size={19} />,
      badge: 'Núcleos',
    },
    {
      id: 'events',
      label: 'Eventos & Cúpulas',
      icon: <Calendar size={19} />,
    },
    {
      id: 'experiences',
      label: 'Viagens & Experiências',
      icon: <Compass size={19} />,
      badge: 'VIP',
    },
    {
      id: 'videocall',
      label: 'Sala de Vídeo',
      icon: <Video size={19} />,
      badge: 'Ao Vivo',
    },
  ];

  return (
    <aside
      className={`sidebar-container ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-nav-section">
        <span className="sidebar-section-title">PLATAFORMA EKOZ</span>
        <nav className="sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`badge ${isActive ? 'badge-gold' : 'badge-moss'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Slogan Banner Card */}
      <div className="sidebar-footer-card">
        <div className="quote-mark">“</div>
        <p className="sidebar-slogan">Viva a vida que você nunca VIVEU!</p>
        <div className="slogan-author-row">
          <ShieldCheck size={14} color="#CBA548" />
          <span>Ezekiel Dall'Bello • CEO</span>
        </div>

        <div className="sidebar-quick-actions">
          <button
            onClick={() => setWhatsappPushOpen(true)}
            className="btn btn-secondary btn-sm full-width"
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            <Sparkles size={14} color="#25D366" />
            <span>Simulador WhatsApp</span>
          </button>
          <button
            onClick={() => setCheckoutOpen(true)}
            className="btn btn-ghost btn-sm full-width"
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start', color: '#DFC16E' }}
          >
            <ExternalLink size={14} />
            <span>Planos de Adesão (Cakto)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
