import React from 'react';
import { CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import { CAKTO_CHECKOUT } from '../../config/cakto';

// Card de planos reutilizado no modal de checkout (membros já logados) e na
// tela de login (visitantes que ainda não têm conta — "Registrar-se agora").
export const CheckoutPlansCard: React.FC = () => {
  return (
    <>
      <div className="checkout-plans-grid mt-3">
        <div className="checkout-plan-card">
          <h4 className="plan-name">{CAKTO_CHECKOUT.monthly.label}</h4>
          <div className="plan-price-row">
            <span className="plan-price">{CAKTO_CHECKOUT.monthly.price}</span>
            <span className="plan-period">{CAKTO_CHECKOUT.monthly.period}</span>
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
            href={CAKTO_CHECKOUT.monthly.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold full-width mt-3"
            style={{ fontSize: '0.95rem', padding: '0.75rem' }}
          >
            <ExternalLink size={16} />
            <span>Ir para o checkout</span>
          </a>
        </div>

        <div className="checkout-plan-card checkout-plan-featured">
          <span className="checkout-plan-badge">MELHOR OFERTA</span>
          <h4 className="plan-name">{CAKTO_CHECKOUT.annual.label}</h4>
          <div className="plan-price-row plan-price-row-highlight">
            <span className="plan-price plan-price-highlight">{CAKTO_CHECKOUT.annual.price}</span>
            <span className="plan-period">{CAKTO_CHECKOUT.annual.period}</span>
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

          <div className="checkout-cash-offer">
            <span className="checkout-cash-offer-tag">(Pagamento à vista)</span>
            <span>{CAKTO_CHECKOUT.annual.cashNote}</span>
          </div>

          <a
            href={CAKTO_CHECKOUT.annual.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold full-width mt-3"
            style={{ fontSize: '0.95rem', padding: '0.75rem' }}
          >
            <ExternalLink size={16} />
            <span>Ir para o checkout</span>
          </a>
        </div>
      </div>

      <div className="checkout-guarantee-row mt-4">
        <ShieldCheck size={16} color="#4ADE80" />
        <span>Garantia incondicional de 7 dias • Pagamento processado pela Cakto</span>
      </div>

      <p className="text-muted mt-3" style={{ fontSize: '0.8rem' }}>
        Após o pagamento ser aprovado, seu acesso é liberado automaticamente — você recebe as
        credenciais por WhatsApp.
      </p>
    </>
  );
};
