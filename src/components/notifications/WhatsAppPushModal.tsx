import React, { useState, useEffect } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { api } from '../../services/api';
import { X, Smartphone, BellRing, BellOff } from 'lucide-react';
import {
  isPushSupported,
  isPushSubscribed,
  enablePush,
  disablePush,
} from '../../services/push';

export const WhatsAppPushModal: React.FC = () => {
  const { whatsappPushOpen, setWhatsappPushOpen, triggerToast, user, setUser } = useEkoz();
  const [phoneNumber, setPhoneNumber] = useState(user.whatsapp || '');
  const [saving, setSaving] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const pushSupported = isPushSupported();

  useEffect(() => {
    if (whatsappPushOpen && pushSupported) {
      isPushSubscribed().then(setPushOn);
    }
  }, [whatsappPushOpen, pushSupported]);

  if (!whatsappPushOpen) return null;

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
        triggerToast({
          title: 'Notificações desativadas',
          message: 'Este dispositivo não receberá mais notificações push.',
          type: 'info',
        });
      } else {
        await enablePush();
        setPushOn(true);
        triggerToast({
          title: 'Notificações ativadas',
          message: 'Você receberá avisos direto neste dispositivo.',
          type: 'success',
        });
      }
    } catch (err: any) {
      triggerToast({
        title: 'Não foi possível ativar',
        message: err.message || 'Tente novamente.',
        type: 'info',
      });
    } finally {
      setPushBusy(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({ whatsapp: phoneNumber });
      setUser(updated);
      triggerToast({
        title: 'Configurações Atualizadas',
        message: `Notificações WhatsApp serão enviadas para ${phoneNumber}`,
        type: 'success',
      });
    } catch (err: any) {
      triggerToast({
        title: 'Erro ao salvar',
        message: err.message || 'Não foi possível atualizar seu número.',
        type: 'info',
      });
    } finally {
      setSaving(false);
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
              placeholder="+55 51 99999-9999"
              className="ekoz-input"
            />
            <button
              onClick={handleSave}
              disabled={saving || !phoneNumber.trim()}
              className="btn btn-whatsapp btn-sm"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <p className="modal-subtitle mt-3" style={{ fontSize: '0.8rem' }}>
          Avisos de novas masterclasses, mensagens de outros membros e eventos são enviados pela
          liderança da Ekoz para este número sempre que houver novidade.
        </p>

        {/* Push nativo no dispositivo */}
        <div className="whatsapp-config-box ekoz-card mt-3">
          <div className="config-header-row">
            {pushOn ? <BellRing size={20} color="#DFC16E" /> : <BellOff size={20} color="#A8B5AE" />}
            <div>
              <span className="config-title">Notificações neste dispositivo</span>
              <span className="config-sub">
                {pushOn ? 'Ativas — você recebe alertas aqui' : 'Receba alertas mesmo com o app fechado'}
              </span>
            </div>
          </div>

          {pushSupported ? (
            <button
              onClick={handleTogglePush}
              disabled={pushBusy}
              className={`btn btn-sm full-width mt-2 ${pushOn ? 'btn-secondary' : 'btn-gold'}`}
            >
              {pushBusy
                ? 'Aguarde...'
                : pushOn
                  ? 'Desativar notificações neste aparelho'
                  : 'Ativar notificações neste aparelho'}
            </button>
          ) : (
            <p className="config-sub mt-2" style={{ fontSize: '0.75rem' }}>
              Para receber notificações no iPhone, primeiro instale o app na tela inicial
              (Compartilhar → Adicionar à Tela de Início) e abra por lá.
            </p>
          )}
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
