import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  Bell,
  MessageSquare,
  Search,
  Sparkles,
  Smartphone,
  ExternalLink,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    members,
    openChatWith,
    setChatOpen,
    chatMessages,
    notifications,
    setWhatsappPushOpen,
    setProfileOpen,
  } = useEkoz();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const query = searchQuery.trim().toLowerCase();
  const searchResults =
    query.length >= 2
      ? members
          .filter(
            (m) =>
              m.id !== user.id &&
              (m.name.toLowerCase().includes(query) ||
                m.company?.toLowerCase().includes(query) ||
                m.headline?.toLowerCase().includes(query)),
          )
          .slice(0, 6)
      : [];

  const handleSelectMember = (member: (typeof members)[number]) => {
    setSearchQuery('');
    setMobileSearchOpen(false);
    openChatWith(member);
  };

  // Lista de resultados reutilizada na busca do desktop e na do mobile.
  const searchResultsList =
    query.length >= 2 ? (
      <div className="navbar-search-results">
        {searchResults.length > 0 ? (
          searchResults.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelectMember(member)}
              className="navbar-search-result-item"
            >
              <img src={member.avatar} alt={member.name} className="search-result-avatar" />
              <div className="search-result-text">
                <span className="search-result-name">{member.name}</span>
                <span className="search-result-meta">{member.headline || member.company}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="navbar-search-empty">Nenhum membro encontrado</div>
        )}
      </div>
    ) : null;

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="navbar-brand">
          <img src="/logo-ekoz-wordmark.png" alt="Ekoz" className="navbar-logo-img" />
        </div>

        <div className="navbar-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar membros por nome, empresa ou cargo..."
            className="navbar-search-input"
          />
          {searchResultsList}
        </div>
      </div>

      <div className="navbar-right">
        {/* Busca (só mobile — no desktop a barra fica à esquerda) */}
        <button
          onClick={() => setMobileSearchOpen((v) => !v)}
          className="navbar-icon-btn navbar-mobile-search-toggle"
          title="Buscar membros"
        >
          {mobileSearchOpen ? <X size={19} /> : <Search size={19} />}
        </button>

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
          onClick={() => setProfileOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Ver e editar meu perfil"
        >
          <div className="user-avatar-wrap">
            <img
              src={user.avatar || '/default-avatar.svg'}
              alt={user.name}
              className="user-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
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

      {/* Barra de busca mobile (aberta pelo ícone de lupa no header) */}
      {mobileSearchOpen && (
        <div className="navbar-mobile-search">
          <div className="navbar-mobile-search-inner">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar membros..."
              className="navbar-search-input"
            />
          </div>
          {searchResultsList}
        </div>
      )}
    </header>
  );
};
