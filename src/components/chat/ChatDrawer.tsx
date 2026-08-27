import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { membersList } from '../../data/mockData';
import {
  X,
  Send,
  MessageCircle,
  Phone,
  CheckCheck,
  Shield,
  ChevronDown,
} from 'lucide-react';

export const ChatDrawer: React.FC = () => {
  const {
    chatOpen,
    setChatOpen,
    chatRecipient,
    openChatWith,
    chatMessages,
    sendChatMessage,
    user,
  } = useEkoz();

  const [inputMsg, setInputMsg] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  if (!chatOpen) return null;

  const currentRecipient = chatRecipient || membersList[1];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendChatMessage(inputMsg.trim());
    setInputMsg('');
  };

  const handleWhatsAppRedirect = () => {
    if (currentRecipient.whatsapp) {
      window.open(
        `https://wa.me/${currentRecipient.whatsapp.replace(/\D/g, '')}`,
        '_blank'
      );
    }
  };

  return (
    <div className="chat-drawer-overlay">
      <div className="chat-drawer-content">
        {/* Drawer Header */}
        <div className="chat-drawer-header">
          <div className="chat-recipient-info">
            <div className="avatar-wrap">
              <img
                src={currentRecipient.avatar}
                alt={currentRecipient.name}
                className="chat-avatar-img"
              />
              <span className="online-indicator"></span>
            </div>

            <div className="chat-name-col">
              <div
                className="recipient-name-clickable"
                onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
              >
                <h4>{currentRecipient.name}</h4>
                <ChevronDown size={14} />
              </div>
              <span className="recipient-headline">{currentRecipient.company}</span>
            </div>
          </div>

          <div className="chat-header-actions">
            {currentRecipient.whatsapp && (
              <button
                onClick={handleWhatsAppRedirect}
                className="btn btn-ghost btn-sm btn-icon-only"
                title="Migrar para WhatsApp"
              >
                <Phone size={17} color="#25D366" />
              </button>
            )}
            <button
              onClick={() => setChatOpen(false)}
              className="chat-close-btn"
              title="Fechar Chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Switch Recipient Dropdown */}
        {showRecipientDropdown && (
          <div className="recipient-selector-menu">
            <span className="selector-title">Conversar com outro membro:</span>
            {membersList
              .filter((m) => m.id !== user.id)
              .map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    openChatWith(m);
                    setShowRecipientDropdown(false);
                  }}
                  className={`selector-item ${m.id === currentRecipient.id ? 'active' : ''}`}
                >
                  <img src={m.avatar} alt={m.name} className="selector-avatar" />
                  <div>
                    <div className="selector-name">{m.name}</div>
                    <div className="selector-sub">{m.company}</div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Messages Body */}
        <div className="chat-messages-body">
          <div className="chat-security-notice">
            <Shield size={13} color="#CBA548" />
            <span>Conexão direta encriptada entre empresários Ekoz</span>
          </div>

          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble-row ${msg.isMe ? 'msg-me' : 'msg-other'}`}
            >
              {!msg.isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="chat-bubble-avatar"
                />
              )}
              <div className="chat-bubble">
                <p className="chat-bubble-text">{msg.text}</p>
                <div className="chat-bubble-meta">
                  <span className="chat-time">{msg.timestamp}</span>
                  {msg.isMe && <CheckCheck size={13} color="#4ADE80" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="chat-input-bar">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Mensagem para ${currentRecipient.name.split(' ')[0]}...`}
            className="ekoz-input chat-input-field"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="btn btn-gold btn-sm btn-icon-only"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
