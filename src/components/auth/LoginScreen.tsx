import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { CheckoutPlansCard } from '../checkout/CheckoutPlansCard';

interface LoginScreenProps {
  onSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login(email, password);
      localStorage.setItem('ekoz_user', JSON.stringify(res.user));
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-root">
      <div className={`login-screen-card ${showCheckout ? 'login-screen-card-wide' : ''}`}>
        <div className="login-screen-brand">
          <img src="/logo-ekoz-wordmark.png" alt="Ekoz" className="login-screen-logo" />
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {showCheckout ? 'Torne-se Membro Ekoz' : 'Acesso Executivo'}
          </p>
        </div>

        {showCheckout ? (
          <>
            <button
              onClick={() => setShowCheckout(false)}
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeft size={14} />
              <span>Voltar ao login</span>
            </button>
            <CheckoutPlansCard />
          </>
        ) : (
          <>
            {errorMessage && (
              <div className="login-screen-error">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="login-screen-form">
              <div>
                <label className="login-screen-label">E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} className="login-screen-input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="login-screen-input"
                  />
                </div>
              </div>

              <div>
                <label className="login-screen-label">Senha</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} className="login-screen-input-icon" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="login-screen-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-gold full-width login-screen-submit">
                <ShieldCheck size={18} />
                {loading ? 'Autenticando...' : 'Entrar na Plataforma'}
              </button>
            </form>

            <div className="login-screen-footer">
              <p>Ainda não é membro?</p>
              <button onClick={() => setShowCheckout(true)} className="btn btn-secondary full-width mt-2">
                Registrar-se Agora
              </button>
              <p className="login-screen-footer-note mt-2">
                Suas credenciais de acesso chegam por WhatsApp assim que o pagamento é aprovado.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
