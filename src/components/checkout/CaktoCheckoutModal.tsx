import React from 'react';
import { useEkoz } from '../../context/EkozContext';
import { X, Lock } from 'lucide-react';
import { CheckoutPlansCard } from './CheckoutPlansCard';

export const CaktoCheckoutModal: React.FC = () => {
  const { checkoutOpen, setCheckoutOpen } = useEkoz();

  if (!checkoutOpen) return null;

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

        <CheckoutPlansCard />
      </div>
    </div>
  );
};
