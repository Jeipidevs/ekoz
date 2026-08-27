import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CaktoCheckoutModal: React.FC = () => {
  const {
    checkoutOpen,
    setCheckoutOpen,
    selectedPlanForCheckout,
    setSelectedPlanForCheckout,
    triggerToast,
  } = useEkoz();

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  if (!checkoutOpen) return null;

  const plans = [
    {
      id: 'Membro Ekoz',
      name: 'Membro Ekoz',
      price: 'R$ 297',
      period: '/mês',
      features: [
        'Acesso à Timeline & Feed Executivo',
        'Vitrine no Marketplace de Núcleos',
        'Acesso a todas as Masterclasses gravadas',
        'Push notifications no WhatsApp',
      ],
    },
    {
      id: 'Ekoz Black Membership',
      name: 'Ekoz Black Mastermind',
      price: 'R$ 997',
      period: '/mês',
      badge: 'MAIS ESCOLHIDO',
      features: [
        'Tudo do plano Membro',
        'Salas privativas de videoconferência 1-on-1',
        'Acesso prioritário a Jantares Executivos & Summit',
        'Desconto exclusivo em Expedições & Retiros',
        'Mentoria direta com Ezekiel Dall\'Bello',
      ],
    },
  ];

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseComplete(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#DFC16E', '#CBA548', '#25D366', '#FFFFFF'],
        });
      } catch {
        // fallback
      }
      triggerToast({
        title: 'Assinatura Ativada via Cakto!',
        message: 'Parabéns! Seu acesso exclusivo à Ekoz foi atualizado com sucesso.',
        type: 'success',
      });
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content cakto-checkout-modal">
        {/* Header */}
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

        {!purchaseComplete ? (
          <div>
            {/* Plan selection */}
            <div className="checkout-plans-grid mt-3">
              {plans.map((p) => {
                const isSelected = selectedPlanForCheckout === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanForCheckout(p.id)}
                    className={`checkout-plan-card ${isSelected ? 'selected' : ''}`}
                  >
                    {p.badge && <span className="plan-badge-ribbon">{p.badge}</span>}
                    <h4 className="plan-name">{p.name}</h4>
                    <div className="plan-price-row">
                      <span className="plan-price">{p.price}</span>
                      <span className="plan-period">{p.period}</span>
                    </div>

                    <ul className="plan-features-list">
                      {p.features.map((f, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={13} color="#DFC16E" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Payment method selection */}
            <form onSubmit={handleSimulatePayment} className="checkout-form mt-4">
              <div className="payment-method-selector">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`method-btn ${paymentMethod === 'pix' ? 'active' : ''}`}
                >
                  <QrCode size={16} />
                  <span>PIX Instantâneo (Aprovação Imediata)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao')}
                  className={`method-btn ${paymentMethod === 'cartao' ? 'active' : ''}`}
                >
                  <CreditCard size={16} />
                  <span>Cartão de Crédito</span>
                </button>
              </div>

              {paymentMethod === 'cartao' ? (
                <div className="card-inputs-grid mt-3">
                  <div className="form-group">
                    <label className="form-label">Número do Cartão</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="ekoz-input"
                      required
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Validade</label>
                      <input type="text" placeholder="MM/AA" className="ekoz-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input type="text" placeholder="123" className="ekoz-input" required />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pix-instruction-box ekoz-card mt-3">
                  <QrCode size={36} color="#25D366" />
                  <div>
                    <span className="pix-title">QR Code PIX Gerado pelo Gateway Cakto</span>
                    <p className="pix-desc">Acesso liberado imediatamente após a confirmação bancária.</p>
                  </div>
                </div>
              )}

              <div className="checkout-guarantee-row mt-3">
                <ShieldCheck size={16} color="#4ADE80" />
                <span>Garantia incondicional de 7 dias • Cancelamento a qualquer momento</span>
              </div>

              <div className="modal-footer-row mt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-gold full-width"
                  style={{ fontSize: '1rem', padding: '0.85rem' }}
                >
                  <Sparkles size={16} />
                  <span>
                    {isProcessing ? 'Processando no Gateway Cakto...' : 'Confirmar & Ativar Acesso Ekoz'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="purchase-success-view">
            <CheckCircle2 size={54} color="#4ADE80" />
            <h3>Transação Aprovada via Cakto!</h3>
            <p>Seja bem-vindo ao próximo nível de governança e alta performance da sua jornada.</p>
            <button
              onClick={() => {
                setPurchaseComplete(false);
                setCheckoutOpen(false);
              }}
              className="btn btn-gold mt-4"
            >
              Acessar Plataforma
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
