import React, { useState } from 'react';
import { Users, CreditCard, ShieldCheck, Calendar, Store, MessageSquare } from 'lucide-react';
import { AdminMembersView } from './AdminMembersView';
import { AdminSubscriptionsView } from './AdminSubscriptionsView';
import { AdminEventsView } from './AdminEventsView';
import { AdminMarketplaceView } from './AdminMarketplaceView';
import { AdminModerationView } from './AdminModerationView';

type AdminSection = 'members' | 'subscriptions' | 'events' | 'marketplace' | 'moderation';

const SECTIONS: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'members', label: 'Membros', icon: <Users size={15} /> },
  { id: 'subscriptions', label: 'Assinaturas', icon: <CreditCard size={15} /> },
  { id: 'events', label: 'Eventos', icon: <Calendar size={15} /> },
  { id: 'marketplace', label: 'Marketplace', icon: <Store size={15} /> },
  { id: 'moderation', label: 'Timeline', icon: <MessageSquare size={15} /> },
];

const SECTION_TITLES: Record<AdminSection, string> = {
  members: 'Gerenciar Membros',
  subscriptions: 'Assinaturas & Pagamentos',
  events: 'Gerenciar Eventos',
  marketplace: 'Gerenciar Marketplace',
  moderation: 'Moderar Timeline',
};

export const AdminView: React.FC = () => {
  const [section, setSection] = useState<AdminSection>('members');

  return (
    <div className="admin-view-container">
      <div className="ekoz-card admin-hero-card">
        <div className="hero-badge-row">
          <span className="badge badge-gold">
            <ShieldCheck size={13} />
            <span>PAINEL ADMINISTRATIVO</span>
          </span>
        </div>
        <h1 className="admin-view-title">{SECTION_TITLES[section]}</h1>
      </div>

      <div className="admin-section-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`admin-section-tab ${section === s.id ? 'active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {section === 'members' && <AdminMembersView />}
      {section === 'subscriptions' && <AdminSubscriptionsView />}
      {section === 'events' && <AdminEventsView />}
      {section === 'marketplace' && <AdminMarketplaceView />}
      {section === 'moderation' && <AdminModerationView />}
    </div>
  );
};
