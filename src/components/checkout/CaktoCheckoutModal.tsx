import React from 'react';
import { useEkoz } from '../../context/EkozContext';
import { X, ShieldCheck, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { CAKTO_CHECKOUT } from '../../config/cakto';

export const CaktoCheckoutModal: React.FC = () => {
  const { checkoutOpen, setCheckoutOpen } = useEkoz();

  if (!checkoutOpen) return null;

  const plans = [CAKTO_CHECKOUT.annual, CAKTO_CHECKOUT.monthly];

  return (
    <div className="modal-overlay">
      <div className="modal-content cakto-checkout-modal">
        <div className="modal-header-row">
          <div className="modal-header-title-group">
            <div className="cakto-brand-badge">
              <span className="cakto-tag">Checkout Seguro Cakto</span>
              <Lock size={12} />
            </div>
            <h3 className="modal-title">Acesso ao Ecossistema Ekoz</h3>
          </div>
          <button onClick={() => setCheckoutOpen(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="checkout-plans-grid mt-3">
          {plans.map((p) => (
            <div key={p.url} className="checkout-plan-card">
              <h4 className="plan-name">{p.label}</h4>
              <div className="plan-price-row">
                <span className="plan-price">{p.price}</span>
                <span className="plan-period">{p.period}</span>
              </div>

              <ul className="plan-features-list mt-3">
                <li>
                  <CheckCircle2 size={13} color="#DFC16E" />
                  <span>Acesso completo à comunidade, aulas e marketplace</span>
                </li>
                <li>
                  <CheckCircle2 size={13} color="#DFC16E" />
                  <span>Eventos, summits e videochamadas exclusivas</span>
                </li>
              </ul>

              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold full-width mt-3"
                style={{ fontSize: '0.95rem', padding: '0.75rem' }}
              >
                <ExternalLink size={16} />
                <span>Ir para o checkout</span>
              </a>
            </div>
          ))}
        </div>

        <div className="checkout-guarantee-row mt-4">
          <ShieldCheck size={16} color="#4ADE80" />
          <span>Garantia incondicional de 7 dias • Pagamento processado pela Cakto</span>
        </div>

        <p className="text-muted mt-3" style={{ fontSize: '0.8rem' }}>
          Após o pagamento ser aprovado, seu acesso é liberado automaticamente — você recebe as
          credenciais por WhatsApp.
        </p>
      </div>
    </div>
  );
};
