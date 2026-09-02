import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  Bell,
  MessageSquare,
  Crown,
  Search,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    setChatOpen,
    chatMessages,
    notifications,
    setWhatsappPushOpen,
    setCheckoutOpen,
    logout,
  } = useEkoz();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleOpenUpgrade = () => setCheckoutOpen(true);

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="navbar-brand">
          <img src="/logo-ekoz-wordmark.png" alt="Ekoz" className="navbar-logo-img" />
          <span className="navbar-subtitle">Ecosystem</span>
        </div>

        <div className="navbar-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar membros, núcleos, masterclasses..."
            className="navbar-search-input"
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* WhatsApp Push status indicator */}
        <button
          onClick={() => setWhatsappPushOpen(true)}
          className="navbar-tool-btn btn-whatsapp-indicator"
          title="Configurações de Push WhatsApp"
        >
          <Smartphone size={16} />
          <span className="hide-mobile">WhatsApp Push</span>
          <span className="status-dot"></span>
        </button>

        {/* Upgrade / Black Access CTA */}
        <button onClick={handleOpenUpgrade} className="btn btn-gold btn-sm btn-upgrade" title="Acesso Ekoz Black">
          <Crown size={15} />
          <span className="hide-mobile">Ekoz Black</span>
        </button>

        {/* Direct Messages */}
        <button
          onClick={() => setChatOpen(true)}
          className="navbar-icon-btn"
          title="Mensagens Diretas"
        >
          <MessageSquare size={19} />
          {chatMessages.length > 0 && <span className="badge-count">2</span>}
        </button>

        {/* Notifications */}
        <div className="notification-dropdown-wrapper">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="navbar-icon-btn"
            title="Notificações"
          >
            <Bell size={19} />
            {unreadNotifications > 0 && (
              <span className="badge-count count-gold">{unreadNotifications}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-menu">
              <div className="notifications-header">
                <h4>Notificações</h4>
                <span className="badge badge-gold">{unreadNotifications} novas</span>
              </div>
              <div className="notifications-list">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-item ${item.read ? 'read' : 'unread'}`}
                  >
                    <div className="notification-icon-pill">
                      {item.type === 'whatsapp' ? (
                        <Smartphone size={14} color="#25D366" />
                      ) : item.type === 'lesson' ? (
                        <Sparkles size={14} color="#DFC16E" />
                      ) : (
                        <ExternalLink size={14} color="#A8B5AE" />
                      )}
                    </div>
                    <div className="notification-text">
                      <p className="notification-title">{item.title}</p>
                      <p className="notification-desc">{item.description}</p>
                      <span className="notification-time">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notifications-footer">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          className="navbar-user-pill"
          onClick={() => {
            if (window.confirm('Sair da sua conta Ekoz?')) logout();
          }}
          style={{ cursor: 'pointer' }}
          title="Clique para sair da conta"
        >
          <div className="user-avatar-wrap">
            <img src={user.avatar} alt={user.name} className="user-avatar-img" />
            <span className="online-indicator"></span>
          </div>
          <div className="user-info-text hide-tablet">
            <div className="user-name-row">
              <span className="user-name">{user.name}</span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {user.role}
              </span>
            </div>
            <span className="user-company">{user.company}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
