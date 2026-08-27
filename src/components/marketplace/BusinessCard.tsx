import React from 'react';
import { MarketplaceBusiness } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import { membersList } from '../../data/mockData';
import {
  MessageCircle,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BusinessCardProps {
  business: MarketplaceBusiness;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const { openChatWith } = useEkoz();

  const founderUser = membersList.find((m) => m.name === business.founder);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Olá ${business.founder}! Encontrei sua empresa (${business.name}) através do marketplace da Ekoz e gostaria de conversar sobre negócios.`
    );
    window.open(`https://wa.me/${business.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className={`ekoz-card business-card ${business.featured ? 'business-featured' : ''}`}>
      {business.featured && (
        <div className="featured-ribbon">
          <Sparkles size={12} />
          <span>DESTAQUE EKOZ</span>
        </div>
      )}

      {business.coverImage && (
        <div className="business-cover-wrap">
          <img src={business.coverImage} alt={business.name} className="business-cover-img" />
          <div className="business-cover-overlay"></div>
        </div>
      )}

      <div className="business-card-content">
        <div className="business-header-row">
          <div className="business-founder-avatar-wrap">
            <img src={business.avatar} alt={business.founder} className="business-avatar-img" />
            {business.verified && (
              <span className="business-verified-badge" title="Empresa Verificada Ekoz">
                <CheckCircle2 size={13} color="#4ADE80" />
              </span>
            )}
          </div>

          <div className="business-title-meta">
            <h3 className="business-name">{business.name}</h3>
            <span className="business-founder-line">
              Fundado por <strong>{business.founder}</strong> • {business.founderRole}
            </span>
          </div>
        </div>

        <p className="business-headline">{business.headline}</p>
        <p className="business-description">{business.description}</p>

        <div className="business-location-row">
          <MapPin size={13} color="#A8B5AE" />
          <span>{business.location}</span>
        </div>

        {/* Tags */}
        <div className="business-tags-wrap">
          {business.tags.map((tag, idx) => (
            <span key={idx} className="badge badge-moss" style={{ fontSize: '0.72rem' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="business-actions-footer">
          <button onClick={handleWhatsAppClick} className="btn btn-whatsapp btn-sm flex-1">
            <MessageCircle size={15} />
            <span>Chamar no WhatsApp</span>
          </button>

          {founderUser && (
            <button
              onClick={() => openChatWith(founderUser)}
              className="btn btn-secondary btn-sm"
              title="Mensagem Direta no Ekoz"
            >
              Chat Interno
            </button>
          )}

          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm btn-icon-only"
              title="Visitar Site"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
