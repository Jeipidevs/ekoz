import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, X, ShieldCheck, Star } from 'lucide-react';
import { api } from '../../services/api';
import { ThematicCore, MarketplaceBusiness } from '../../types';
import { useEkoz } from '../../context/EkozContext';

const emptyCoreForm = { name: '', slug: '', icon: 'Layers', description: '' };

export const AdminMarketplaceView: React.FC = () => {
  const { triggerToast, confirm } = useEkoz();
  const [cores, setCores] = useState<ThematicCore[]>([]);
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCoreForm, setShowCoreForm] = useState(false);
  const [coreForm, setCoreForm] = useState(emptyCoreForm);

  const load = useCallback(async () => {
    try {
      const [c, b] = await Promise.all([api.listCores(), api.listBusinesses()]);
      setCores(c);
      setBusinesses(b);
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  useEffect(() => { void load(); }, [load]);

  const handleCreateCore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateCore(coreForm);
      triggerToast({ title: 'Núcleo criado', message: coreForm.name, type: 'success' });
      setShowCoreForm(false);
      setCoreForm(emptyCoreForm);
      load();
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  const handleDeleteCore = async (core: ThematicCore) => {
    const ok = await confirm({
      title: 'Remover núcleo',
      message: `Remover o núcleo "${core.name}"? Isso também remove os negócios vinculados a ele.`,
      confirmLabel: 'Remover',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.adminDeleteCore(core.id);
      triggerToast({ title: 'Núcleo removido', message: core.name, type: 'success' });
      load();
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  const toggleBusinessFlag = async (biz: MarketplaceBusiness, field: 'verified' | 'featured') => {
    try {
      await api.adminUpdateBusiness(biz.id, { [field]: !biz[field] });
      setBusinesses((prev) => prev.map((b) => (b.id === biz.id ? { ...b, [field]: !b[field] } : b)));
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  const handleDeleteBusiness = async (biz: MarketplaceBusiness) => {
    const ok = await confirm({
      title: 'Remover negócio',
      message: `Remover o negócio "${biz.name}" do marketplace?`,
      confirmLabel: 'Remover',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.adminDeleteBusiness(biz.id);
      setBusinesses((prev) => prev.filter((b) => b.id !== biz.id));
      triggerToast({ title: 'Negócio removido', message: biz.name, type: 'success' });
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  return (
    <div className="admin-view-container">
      <div className="ekoz-card admin-toolbar" style={{ justifyContent: 'space-between' }}>
        <span className="admin-member-name">Núcleos Temáticos</span>
        <button className="btn btn-gold btn-sm" onClick={() => setShowCoreForm(!showCoreForm)}>
          <Plus size={14} /> Novo Núcleo
        </button>
      </div>

      {showCoreForm && (
        <form onSubmit={handleCreateCore} className="ekoz-card admin-content-form">
          <div className="admin-form-header">
            <h4>Novo Núcleo</h4>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCoreForm(false)}><X size={14} /></button>
          </div>
          <div className="admin-form-grid">
            <input className="ekoz-input" placeholder="Nome" required value={coreForm.name} onChange={(e) => setCoreForm({ ...coreForm, name: e.target.value })} />
            <input className="ekoz-input" placeholder="Slug (ex: tecnologia)" required value={coreForm.slug} onChange={(e) => setCoreForm({ ...coreForm, slug: e.target.value })} />
            <input className="ekoz-input" placeholder="Ícone (nome lucide-react)" value={coreForm.icon} onChange={(e) => setCoreForm({ ...coreForm, icon: e.target.value })} />
          </div>
          <textarea className="ekoz-input" placeholder="Descrição" rows={2} value={coreForm.description} onChange={(e) => setCoreForm({ ...coreForm, description: e.target.value })} />
          <button type="submit" className="btn btn-gold btn-sm">Criar</button>
        </form>
      )}

      <div className="ekoz-card admin-table-card">
        {loading ? <p className="text-muted" style={{ padding: '1.5rem' }}>Carregando...</p> : (
          <table className="admin-members-table">
            <thead><tr><th>Núcleo</th><th>Slug</th><th>Negócios</th><th></th></tr></thead>
            <tbody>
              {cores.map((c) => (
                <tr key={c.id}>
                  <td className="admin-member-name">{c.name}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{c.slug}</td>
                  <td>{c.count}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDeleteCore(c)}><Trash2 size={13} /></button></td>
                </tr>
              ))}
              {cores.length === 0 && <tr><td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>Nenhum núcleo cadastrado.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="ekoz-card admin-toolbar">
        <span className="admin-member-name">Negócios do Marketplace</span>
      </div>

      <div className="ekoz-card admin-table-card">
        {loading ? <p className="text-muted" style={{ padding: '1.5rem' }}>Carregando...</p> : (
          <table className="admin-members-table">
            <thead><tr><th>Negócio</th><th>Fundador</th><th>Verificado</th><th>Destaque</th><th></th></tr></thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id}>
                  <td className="admin-member-name">{b.name}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{b.founder}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleBusinessFlag(b, 'verified')} title="Alternar verificação">
                      <ShieldCheck size={14} color={b.verified ? '#4ADE80' : undefined} />
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleBusinessFlag(b, 'featured')} title="Alternar destaque">
                      <Star size={14} color={b.featured ? '#DFC16E' : undefined} />
                    </button>
                  </td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDeleteBusiness(b)}><Trash2 size={13} /></button></td>
                </tr>
              ))}
              {businesses.length === 0 && <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>Nenhum negócio cadastrado.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
