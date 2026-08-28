import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Building, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useEkoz } from '../../context/EkozContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithCredentials, registerUser } = useEkoz();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isRegister) {
        await registerUser({
          email,
          password,
          name,
          company,
          headline: headline || `Fundador(a) na ${company || 'Ekoz'}`,
        });
      } else {
        await loginWithCredentials(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithCredentials(presetEmail, 'ekoz2026');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro no login rápido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#060B08',
            }}>
              {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                {isRegister ? 'Credenciamento de Membro' : 'Acesso Executivo Ekoz'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isRegister ? 'Cadastre seu perfil executivo no ecossistema' : 'Conecte-se à sua conta oficial'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Active User Info */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(203, 152, 39, 0.08)',
          border: '1px solid rgba(203, 152, 39, 0.25)',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-primary)' }}
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold-light)' }}>
                {user.name} ({user.role})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Plano: {user.plan}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(46, 86, 67, 0.6)', color: 'var(--emerald-light)' }}>
            Sessão Ativa
          </span>
        </div>

        {/* Quick Switch Profiles for Ezekiel & Demo */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="var(--gold-primary)" /> Acesso Rápido de Liderança
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('ezekiel@ekoz.com.br')}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <img src="/ezekiel.jpg" style={{ width: '22px', height: '22px', borderRadius: '50%' }} alt="Ezekiel" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>Ezekiel (CEO)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--gold-primary)' }}>Founding Partner</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('camila@vasconcellos.com.br')}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" style={{ width: '22px', height: '22px', borderRadius: '50%' }} alt="Camila" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>Dra. Camila</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--emerald-light)' }}>Ekoz Black</div>
              </div>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            marginBottom: '1rem',
          }}>
            {errorMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Nome Completo
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome executivo"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Empresa / Negócio
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nome da sua empresa principal"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              E-mail Corporativo
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Senha de Acesso
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))',
              border: 'none',
              borderRadius: '6px',
              color: '#060B08',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={18} />
            {loading ? 'Processando Autenticação...' : isRegister ? 'Confirmar Credenciamento' : 'Entrar na Plataforma'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-light)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isRegister ? 'Já possui credenciais? Fazer Login' : 'Ainda não é membro? Criar conta executiva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
