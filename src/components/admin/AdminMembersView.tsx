import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AdminMember, UserRole } from '../../types';
import { useEkoz } from '../../context/EkozContext';

const ROLES: UserRole[] = ['Member', 'Black Member', 'Admin', 'Mentor', 'CEO'];

export const AdminMembersView: React.FC = () => {
  const { user: currentUser, triggerToast } = useEkoz();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminListUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleRoleChange = async (member: AdminMember, role: string) => {
    try {
      await api.adminUpdateUserRole(member.id, role);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: role as UserRole } : m)));
      triggerToast({ title: 'Cargo atualizado', message: `${member.name} agora é ${role}`, type: 'success' });
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message || 'Não foi possível atualizar o cargo', type: 'info' });
    }
  };

  const handleToggleActive = async (member: AdminMember) => {
    try {
      const updated = await api.adminUpdateUserActive(member.id, !member.active);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, active: updated.user.active } : m)));
      triggerToast({
        title: updated.user.active ? 'Conta reativada' : 'Conta desativada',
        message: member.name,
        type: 'success',
      });
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message || 'Não foi possível atualizar a conta', type: 'info' });
    }
  };

  return (
    <>
      <p className="admin-view-subtitle">
        {members.length} membro{members.length === 1 ? '' : 's'} encontrado{members.length === 1 ? '' : 's'}
      </p>

      <div className="ekoz-card admin-toolbar">
        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            className="ekoz-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="ekoz-input admin-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos os cargos</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
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
                <th>Cargo</th>
                <th>Assinatura</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const sub = m.subscriptions[0];
                return (
                  <tr key={m.id} className={!m.active ? 'row-inactive' : ''}>
                    <td>
                      <div className="admin-member-cell">
                        <span className="admin-member-name">{m.name}</span>
                        <span className="admin-member-email">{m.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="ekoz-input admin-role-select"
                        value={m.role}
                        onChange={(e) => handleRoleChange(m, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {sub ? (
                        <span className="badge badge-moss">{sub.plan}</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>Sem assinatura ativa</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${m.active ? 'badge-gold' : ''}`} style={!m.active ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' } : undefined}>
                        {m.active ? 'Ativo' : 'Desativado'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={m.id === currentUser.id && m.active}
                        onClick={() => handleToggleActive(m)}
                        title={m.id === currentUser.id ? 'Você não pode desativar a própria conta' : undefined}
                      >
                        {m.active ? 'Desativar' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
