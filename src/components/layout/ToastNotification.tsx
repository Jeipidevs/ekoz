import React from 'react';
import { useEkoz } from '../../context/EkozContext';
import { CheckCircle2, MessageCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { activeToast, dismissToast } = useEkoz();

  if (!activeToast) return null;

  const isWhatsApp = activeToast.type === 'whatsapp';

  return (
    <div className={`ekoz-toast ${isWhatsApp ? 'toast-whatsapp' : 'toast-default'}`}>
      <div className="toast-icon">
        {isWhatsApp ? (
          <MessageCircle size={22} color="#25D366" />
        ) : activeToast.type === 'success' ? (
          <CheckCircle2 size={22} color="#4ADE80" />
        ) : (
          <Info size={22} color="#DFC16E" />
        )}
      </div>

      <div className="toast-body">
        <div className="toast-title-row">
          <span className="toast-title">{activeToast.title}</span>
          {isWhatsApp && <span className="badge badge-moss" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>Push WhatsApp</span>}
        </div>
        <p className="toast-message">{activeToast.message}</p>
      </div>

      <button onClick={dismissToast} className="toast-close-btn">
        <X size={15} />
      </button>
    </div>
  );
};
