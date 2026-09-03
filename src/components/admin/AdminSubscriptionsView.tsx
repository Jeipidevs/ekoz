import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AdminSubscription } from '../../types';
import { useEkoz } from '../../context/EkozContext';

const STATUS_OPTIONS = ['ACTIVE', 'PENDING', 'CANCELLED', 'PAST_DUE'];

const statusBadgeStyle = (status: string): React.CSSProperties | undefined => {
  if (status === 'ACTIVE') return undefined; // usa badge-gold padrão
  if (status === 'CANCELLED') return { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' };
  if (status === 'PAST_DUE') return { background: 'rgba(234,179,8,0.15)', color: '#fde047' };
  return { background: 'rgba(148,163,184,0.15)', color: '#cbd5e1' };
};

export const AdminSubscriptionsView: React.FC = () => {
  const { triggerToast } = useEkoz();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminListSubscriptions(statusFilter || undefined);
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (sub: AdminSubscription) => {
    if (!window.confirm(`Revogar a assinatura de ${sub.user.name}?`)) return;
    try {
      const updated = await api.adminRevokeSubscription(sub.id);
      setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: updated.subscription.status } : s)));
      triggerToast({ title: 'Assinatura revogada', message: sub.user.name, type: 'success' });
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message || 'Não foi possível revogar', type: 'info' });
    }
  };

  return (
    <div className="admin-view-container">
      <div className="ekoz-card admin-toolbar">
        <select className="ekoz-input admin-role-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={load} title="Recarregar">
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <div className="login-screen-error">{error}</div>}

      <div className="ekoz-card admin-table-card">
        {loading ? (
          <p className="text-muted" style={{ padding: '1.5rem' }}>Carregando...</p>
        ) : (
          <table className="admin-members-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Expira em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="admin-member-cell">
                      <span className="admin-member-name">{s.user.name}</span>
                      <span className="admin-member-email">{s.user.email}</span>
                    </div>
                  </td>
                  <td>{s.plan}</td>
                  <td>R$ {s.amount.toFixed(2)}</td>
                  <td>
                    <span className="badge badge-gold" style={statusBadgeStyle(s.status)}>{s.status}</span>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td>
                    {s.status === 'ACTIVE' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRevoke(s)}>
                        <CreditCard size={13} />
                        Revogar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    Nenhuma assinatura encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
