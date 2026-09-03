import React, { useState, useRef } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { api } from '../../services/api';
import { X, Save, LogOut, ShieldCheck, Upload, Trash2 } from 'lucide-react';

// Redimensiona a imagem escolhida no próprio navegador (máx 400px, JPEG) e
// devolve um data URL base64 leve — evita subir arquivo pesado e dispensa
// storage externo. Avatares ficam ~20-40KB, adequados pra coluna do banco.
const resizeImageToDataUrl = (file: File, maxSize = 400): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas não suportado'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsDataURL(file);
  });

export const EditProfileModal: React.FC = () => {
  const { profileOpen, setProfileOpen, user, setUser, triggerToast, logout } = useEkoz();

  const [name, setName] = useState(user.name);
  const [headline, setHeadline] = useState(user.headline || '');
  const [company, setCompany] = useState(user.company || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [instagram, setInstagram] = useState(user.instagram || '');
  const [linkedin, setLinkedin] = useState(user.linkedin || '');
  const [skills, setSkills] = useState((user.skills || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profileOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Selecione um arquivo de imagem.');
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatar(dataUrl);
    } catch (err: any) {
      setPhotoError(err.message || 'Não foi possível processar a imagem.');
    } finally {
      // permite reselecionar o mesmo arquivo depois
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({
        name: name.trim(),
        headline: headline.trim(),
        company: company.trim(),
        location: location.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
        skills: skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setUser(updated);
      triggerToast({
        title: 'Perfil atualizado',
        message: 'Suas informações foram salvas com sucesso.',
        type: 'success',
      });
      setProfileOpen(false);
    } catch (err: any) {
      triggerToast({
        title: 'Erro ao salvar',
        message: err.message || 'Não foi possível atualizar seu perfil.',
        type: 'info',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-profile-modal">
        <div className="modal-header-row">
          <div className="modal-header-title-group">
            <span className="badge badge-gold">MEU PERFIL</span>
            <h3 className="modal-title">Editar Perfil</h3>
          </div>
          <button onClick={() => setProfileOpen(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="edit-profile-identity">
          <img
            src={avatar || '/default-avatar.svg'}
            alt={name}
            className="edit-profile-avatar-preview"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.svg';
            }}
          />
          <div className="edit-profile-identity-text">
            <span className="edit-profile-role">
              <ShieldCheck size={13} /> {user.role} · {user.plan}
            </span>
            <span className="edit-profile-email">{user.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-business-form">
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ekoz-input"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Cargo / Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: CEO & Fundador"
                className="ekoz-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Empresa</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Nexus Tecnologia"
                className="ekoz-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cidade / Estado</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Porto Alegre, RS"
              className="ekoz-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre sua trajetória e o que você busca no ecossistema..."
              className="ekoz-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Foto de Perfil</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="avatar-upload-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
              >
                <Upload size={14} />
                <span>{avatar ? 'Trocar foto' : 'Enviar foto'}</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="btn btn-ghost btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Remover</span>
                </button>
              )}
            </div>
            {photoError && (
              <p className="text-muted mt-2" style={{ color: '#F87171', fontSize: '0.78rem' }}>
                {photoError}
              </p>
            )}
            <p className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
              Envie uma imagem da galeria ou do computador. Ela é otimizada automaticamente.
            </p>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+55 51 99999-9999"
                className="ekoz-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@seuusuario"
                className="ekoz-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/seuperfil"
              className="ekoz-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Especialidades / Skills (separadas por vírgula)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Gestão, Vendas B2B, Holdings, IA"
              className="ekoz-input"
            />
          </div>

          <div className="modal-footer-row mt-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Sair da sua conta Ekoz?')) logout();
              }}
              className="btn btn-ghost"
            >
              <LogOut size={15} />
              <span>Sair da conta</span>
            </button>
            <button type="submit" disabled={saving} className="btn btn-gold">
              <Save size={15} />
              <span>{saving ? 'Salvando...' : 'Salvar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
