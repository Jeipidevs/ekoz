import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem } from '../../types';
import { useEkoz } from '../../context/EkozContext';

const EVENT_TYPES: EventItem['type'][] = ['Presencial', 'Online', 'Masterclass Exclusiva', 'Jantar Executivo'];

const emptyForm: Omit<EventItem, 'id' | 'spotsLeft' | 'isRegistered'> & { totalSpots: number } = {
  title: '', type: EVENT_TYPES[0], date: '', time: '', location: '',
  speaker: '', speakerRole: '', description: '', image: '', totalSpots: 50,
};

export const AdminEventsView: React.FC = () => {
  const { triggerToast } = useEkoz();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setEvents(await api.listEvents());
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (ev: EventItem) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title, type: ev.type, date: ev.date, time: ev.time, location: ev.location,
      speaker: ev.speaker, speakerRole: ev.speakerRole, description: ev.description,
      image: ev.image, totalSpots: ev.totalSpots ?? ev.spotsLeft,
    });
    setShowForm(true);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.adminUpdateEvent(editingId, form);
        triggerToast({ title: 'Evento atualizado', message: form.title, type: 'success' });
      } else {
        await api.adminCreateEvent(form);
        triggerToast({ title: 'Evento criado', message: form.title, type: 'success' });
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  const handleDelete = async (ev: EventItem) => {
    if (!window.confirm(`Remover o evento "${ev.title}"?`)) return;
    try {
      await api.adminDeleteEvent(ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      triggerToast({ title: 'Evento removido', message: ev.title, type: 'success' });
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  return (
    <div className="admin-view-container">
      <div className="admin-toolbar" style={{ padding: 0, background: 'transparent', border: 'none' }}>
        <button className="btn btn-gold btn-sm" onClick={startNew}>
          <Plus size={14} /> Novo Evento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="ekoz-card admin-content-form">
          <div className="admin-form-header">
            <h4>{editingId ? 'Editar Evento' : 'Novo Evento'}</h4>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="admin-form-grid">
            <input className="ekoz-input" placeholder="Título" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="ekoz-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventItem['type'] })}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="ekoz-input" placeholder="Data (ex: 15 Out 2026)" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="ekoz-input" placeholder="Horário" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <input className="ekoz-input" placeholder="Local" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input className="ekoz-input" placeholder="Vagas totais" type="number" value={form.totalSpots} onChange={(e) => setForm({ ...form, totalSpots: Number(e.target.value) })} />
            <input className="ekoz-input" placeholder="Palestrante" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} />
            <input className="ekoz-input" placeholder="Cargo do palestrante" value={form.speakerRole} onChange={(e) => setForm({ ...form, speakerRole: e.target.value })} />
            <input className="ekoz-input" placeholder="URL da imagem" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <textarea className="ekoz-input" placeholder="Descrição" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn btn-gold btn-sm">{editingId ? 'Salvar' : 'Criar'}</button>
        </form>
      )}

      <div className="ekoz-card admin-table-card">
        {loading ? (
          <p className="text-muted" style={{ padding: '1.5rem' }}>Carregando...</p>
        ) : (
          <table className="admin-members-table">
            <thead>
              <tr><th>Evento</th><th>Tipo</th><th>Data</th><th>Vagas</th><th></th></tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td className="admin-member-name">{ev.title}</td>
                  <td>{ev.type}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{ev.date}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{ev.spotsLeft}</td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(ev)}><Pencil size={13} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(ev)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>Nenhum evento cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
