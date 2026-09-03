import React, { useState } from 'react';
import { Users, CreditCard, ShieldCheck } from 'lucide-react';
import { AdminMembersView } from './AdminMembersView';
import { AdminSubscriptionsView } from './AdminSubscriptionsView';

type AdminSection = 'members' | 'subscriptions';

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
        <h1 className="admin-view-title">
          {section === 'members' ? 'Gerenciar Membros' : 'Assinaturas & Pagamentos'}
        </h1>
      </div>

      <div className="admin-section-tabs">
        <button
          className={`admin-section-tab ${section === 'members' ? 'active' : ''}`}
          onClick={() => setSection('members')}
        >
          <Users size={15} />
          <span>Membros</span>
        </button>
        <button
          className={`admin-section-tab ${section === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setSection('subscriptions')}
        >
          <CreditCard size={15} />
          <span>Assinaturas</span>
        </button>
      </div>

      {section === 'members' ? <AdminMembersView /> : <AdminSubscriptionsView />}
    </div>
  );
};
