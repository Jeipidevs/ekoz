import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  X,
  Smartphone,
  CheckCircle2,
  Bell,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const WhatsAppPushModal: React.FC = () => {
  const { whatsappPushOpen, setWhatsappPushOpen, triggerToast, user } = useEkoz();
  const [phoneNumber, setPhoneNumber] = useState('+55 55 99999-8888');
  const [lessonAlert, setLessonAlert] = useState(true);
  const [messagesAlert, setMessagesAlert] = useState(true);
  const [eventsAlert, setEventsAlert] = useState(true);

  if (!whatsappPushOpen) return null;

  const handleTestTrigger = (type: 'aula' | 'chat' | 'evento') => {
    if (type === 'aula') {
      triggerToast({
        title: '📲 WhatsApp Push: Nova Aula Liberada!',
        message:
          'Ezekiel Dall\'Bello liberou a aula "2.2 O Homem Além da Beleza". Toque para assistir agora na Ekoz Academy.',
        type: 'whatsapp',
      });
    } else if (type === 'chat') {
      triggerToast({
        title: '📲 WhatsApp Push: Mensagem no Ekoz',
        message:
          'Dra. Camila Vasconcellos respondeu seu recado sobre holdings familiares.',
        type: 'whatsapp',
      });
    } else {
      triggerToast({
        title: '📲 WhatsApp Push: Credenciamento Aberto',
        message:
          'Últimas 5 vagas para o Ekoz Executive Summit em Gramado! Confirme sua vaga.',
        type: 'whatsapp',
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content whatsapp-push-modal">
        <div className="modal-header-row">
          <div className="modal-header-title-group">
            <span className="badge badge-moss">INTEGRAÇÃO WHATSAPP CLOUD</span>
            <h3 className="modal-title">Push Notifications no WhatsApp</h3>
          </div>
          <button onClick={() => setWhatsappPushOpen(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <p className="modal-subtitle">
          Na Ekoz, nenhuma oportunidade se perde. Você recebe alertas instantâneos no seu WhatsApp
          sempre que novas aulas são liberadas, mensagens são enviadas ou novos membros se conectam.
        </p>

        {/* WhatsApp Phone Config */}
        <div className="whatsapp-config-box ekoz-card mt-3">
          <div className="config-header-row">
            <Smartphone size={20} color="#25D366" />
            <div>
              <span className="config-title">Número Cadastrado para Disparos</span>
              <span className="config-sub">Status: Conectado e Verificado via API Oficial</span>
            </div>
          </div>

          <div className="phone-input-row mt-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="ekoz-input"
            />
            <button
              onClick={() => {
                triggerToast({
                  title: 'Configurações Atualizadas',
                  message: `Notificações WhatsApp salvas para ${phoneNumber}`,
                  type: 'success',
                });
              }}
              className="btn btn-whatsapp btn-sm"
            >
              Salvar
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="notification-toggles-list mt-3">
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={lessonAlert}
              onChange={(e) => setLessonAlert(e.target.checked)}
            />
            <div className="toggle-label-wrap">
              <span className="toggle-title">Novas Aulas e Masterclasses</span>
              <span className="toggle-desc">Aviso quando o CEO ou mentores sobem novos conteúdos</span>
            </div>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={messagesAlert}
              onChange={(e) => setMessagesAlert(e.target.checked)}
            />
            <div className="toggle-label-wrap">
              <span className="toggle-title">Mensagens Diretas de Empresários</span>
              <span className="toggle-desc">Notificar quando alguém inicia uma conversa de negócios</span>
            </div>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={eventsAlert}
              onChange={(e) => setEventsAlert(e.target.checked)}
            />
            <div className="toggle-label-wrap">
              <span className="toggle-title">Eventos & Expedições Extraordinárias</span>
              <span className="toggle-desc">Abertura de lotes com vagas limitadas para membros</span>
            </div>
          </label>
        </div>

        {/* Simulator Buttons */}
        <div className="simulator-section-box mt-4">
          <span className="simulator-label">🧪 TESTAR DISPARO DE PUSH AGORA:</span>
          <div className="simulator-buttons-row mt-2">
            <button
              onClick={() => handleTestTrigger('aula')}
              className="btn btn-secondary btn-sm"
            >
              <Sparkles size={14} color="#DFC16E" />
              <span>Simular Nova Aula</span>
            </button>

            <button
              onClick={() => handleTestTrigger('chat')}
              className="btn btn-secondary btn-sm"
            >
              <MessageCircle size={14} color="#25D366" />
              <span>Simular Mensagem Chat</span>
            </button>

            <button
              onClick={() => handleTestTrigger('evento')}
              className="btn btn-secondary btn-sm"
            >
              <Bell size={14} color="#DFC16E" />
              <span>Simular Alerta de Evento</span>
            </button>
          </div>
        </div>

        <div className="modal-footer-row mt-4">
          <button
            onClick={() => setWhatsappPushOpen(false)}
            className="btn btn-gold full-width"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
