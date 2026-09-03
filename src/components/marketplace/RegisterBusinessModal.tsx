import React, { useState, useEffect } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { ThematicCore } from '../../types';
import { X, Building2, Store, Smartphone, Globe, MapPin, Sparkles } from 'lucide-react';

interface RegisterBusinessModalProps {
  onClose: () => void;
}

export const RegisterBusinessModal: React.FC<RegisterBusinessModalProps> = ({ onClose }) => {
  const { addBusiness, thematicCores, user } = useEkoz();

  const [name, setName] = useState('');
  const [coreId, setCoreId] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState(user.location);
  const [tags, setTags] = useState('');

  const validCores = thematicCores.filter((c) => c.id !== 'all');

  // Seleciona o primeiro núcleo real assim que a lista carrega — o valor
  // inicial não pode ser um id fixo, já que os núcleos vêm do banco (admin).
  useEffect(() => {
    if (!coreId && validCores.length > 0) {
      setCoreId(validCores[0].id);
    }
  }, [validCores, coreId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !headline.trim() || !coreId) return;

    addBusiness({
      name: name.trim(),
      coreId,
      headline: headline.trim(),
      description: description.trim() || headline.trim(),
      founder: user.name,
      founderRole: user.role === 'CEO' ? 'CEO & Founder' : 'Fundador & Diretor',
      avatar: user.avatar,
      coverImage: undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      whatsapp: whatsapp.replace(/\D/g, ''),
      website: website.trim() || undefined,
      location: location.trim(),
      featured: false,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content register-business-modal">
        <div className="modal-header-row">
          <div className="modal-header-title-group">
            <span className="badge badge-gold">MARKETPLACE B2B</span>
            <h3 className="modal-title">Cadastrar Meu Negócio no Ekoz</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <p className="modal-subtitle">
          Apresente sua empresa, soluções e diferenciais para todos os empresários do ecossistema.
        </p>

        <form onSubmit={handleSubmit} className="register-business-form">
          <div className="form-group">
            <label className="form-label">Nome da Empresa *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nexus Tecnologia & IA"
              className="ekoz-input"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Núcleo Temático *</label>
              <select
                value={coreId}
                onChange={(e) => setCoreId(e.target.value)}
                className="ekoz-select"
                required
                disabled={validCores.length === 0}
              >
                {validCores.length === 0 && <option value="">Nenhum núcleo cadastrado ainda</option>}
                {validCores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cidade / Estado *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Porto Alegre, RS"
                className="ekoz-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Proposta de Valor / Headline *</label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Automações inteligentes e IA generativa para redução de custos operacionais"
              className="ekoz-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição dos Serviços e Casos de Sucesso</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que sua empresa oferece e como ela pode gerar valor para outros empresários da comunidade..."
              className="ekoz-textarea"
              rows={3}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">WhatsApp para Negócios *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="DDD + Número (ex: 55999998888)"
                className="ekoz-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website ou Portfólio (opcional)</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://suaempresa.com.br"
                className="ekoz-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags / Especialidades (separadas por vírgula)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="IA, Software, Cloud, Automação Comercial"
              className="ekoz-input"
            />
          </div>

          <div className="modal-footer-row mt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-gold">
              <Sparkles size={15} />
              <span>Publicar Empresa no Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
