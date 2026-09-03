import React, { useEffect, useState, useCallback } from 'react';
import { Pin, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Post } from '../../types';
import { useEkoz } from '../../context/EkozContext';

export const AdminModerationView: React.FC = () => {
  const { triggerToast, confirm } = useEkoz();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setPosts(await api.listPosts());
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  useEffect(() => { void load(); }, [load]);

  const handleTogglePin = async (post: Post) => {
    try {
      const { pinned } = await api.togglePostPin(post.id);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, pinned } : p)));
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  const handleDelete = async (post: Post) => {
    const ok = await confirm({
      title: 'Remover publicação',
      message: 'Remover esta publicação da timeline? Esta ação não pode ser desfeita.',
      confirmLabel: 'Remover',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.adminDeletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      triggerToast({ title: 'Publicação removida', message: '', type: 'success' });
    } catch (err: any) {
      triggerToast({ title: 'Erro', message: err.message, type: 'info' });
    }
  };

  return (
    <div className="admin-view-container">
      <div className="ekoz-card admin-table-card">
        {loading ? (
          <p className="text-muted" style={{ padding: '1.5rem' }}>Carregando...</p>
        ) : (
          <table className="admin-members-table">
            <thead>
              <tr><th>Autor</th><th>Conteúdo</th><th>Categoria</th><th></th></tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className={post.pinned ? '' : undefined}>
                  <td className="admin-member-name">{post.author.name}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem', maxWidth: '360px' }}>
                    {post.content.length > 120 ? `${post.content.slice(0, 120)}...` : post.content}
                  </td>
                  <td><span className="badge badge-moss">{post.category}</span></td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleTogglePin(post)}
                      title={post.pinned ? 'Desafixar' : 'Fixar'}
                    >
                      <Pin size={13} color={post.pinned ? '#DFC16E' : undefined} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(post)} title="Remover">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>Nenhuma publicação encontrada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
