import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmDialogProps {
  data: ConfirmOptions | null;
  onResolve: (result: boolean) => void;
}

// Modal de confirmação on-brand — substitui o window.confirm nativo do
// navegador em ações destrutivas/sensíveis, mantendo o visual Ekoz.
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ data, onResolve }) => {
  if (!data) return null;

  return (
    <div className="modal-overlay" onClick={() => onResolve(false)}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-header-title-group">
            <div className={`confirm-icon ${data.danger ? 'danger' : ''}`}>
              <AlertTriangle size={18} />
            </div>
            <h3 className="modal-title">{data.title}</h3>
          </div>
          <button onClick={() => onResolve(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <p className="modal-subtitle mt-2">{data.message}</p>

        <div className="modal-footer-row mt-4">
          <button onClick={() => onResolve(false)} className="btn btn-secondary">
            {data.cancelLabel || 'Cancelar'}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`btn ${data.danger ? 'btn-danger' : 'btn-gold'}`}
          >
            {data.confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
