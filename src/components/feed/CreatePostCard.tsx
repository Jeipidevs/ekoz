import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { Post } from '../../types';
import { Send, Image as ImageIcon, Sparkles } from 'lucide-react';

export const CreatePostCard: React.FC = () => {
  const { user, addPost } = useEkoz();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Post['category']>('Insights & Estratégia');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  const categories: Post['category'][] = [
    'Insights & Estratégia',
    'Negócios',
    'Oportunidades',
    'Avisos Oficiais',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addPost(content.trim(), category, mediaUrl.trim() || undefined);
    setContent('');
    setMediaUrl('');
    setShowMediaInput(false);
  };

  return (
    <div className="ekoz-card create-post-card">
      <div className="create-post-header">
        <img src={user.avatar} alt={user.name} className="create-post-avatar" />
        <div className="create-post-meta">
          <div className="post-author-name-row">
            <span className="post-author-name">{user.name}</span>
            <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
              {user.role}
            </span>
          </div>
          <span className="post-author-sub">{user.company}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Compartilhe um insight, oportunidade de negócio ou resultado com a comunidade Ekoz, ${user.name.split(' ')[0]}...`}
          className="ekoz-textarea create-post-textarea"
          rows={3}
        />

        {showMediaInput && (
          <div className="media-input-wrapper">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Cole o link de uma imagem ou foto de capa (https://...)"
              className="ekoz-input"
            />
          </div>
        )}

        <div className="create-post-actions-row">
          <div className="category-select-group">
            <span className="category-label">Núcleo:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Post['category'])}
              className="ekoz-select category-dropdown"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="create-post-buttons">
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="btn btn-secondary btn-sm"
              title="Adicionar imagem"
            >
              <ImageIcon size={15} />
              <span className="hide-mobile">Imagem</span>
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              className="btn btn-gold btn-sm"
              style={{ opacity: content.trim() ? 1 : 0.5 }}
            >
              <Send size={14} />
              <span>Publicar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
