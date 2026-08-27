import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { BusinessCard } from './BusinessCard';
import { RegisterBusinessModal } from './RegisterBusinessModal';
import {
  Store,
  Plus,
  Search,
  Cpu,
  TrendingUp,
  Building2,
  Activity,
  Scale,
  Layers,
  Sparkles,
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { businesses, thematicCores, selectedCore, setSelectedCore } = useEkoz();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const getCoreIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu size={18} />;
      case 'TrendingUp':
        return <TrendingUp size={18} />;
      case 'Building2':
        return <Building2 size={18} />;
      case 'Activity':
        return <Activity size={18} />;
      case 'Scale':
        return <Scale size={18} />;
      default:
        return <Layers size={18} />;
    }
  };

  const filteredBusinesses = businesses.filter((biz) => {
    const matchesCore = selectedCore === 'all' || biz.coreId === selectedCore;
    const matchesSearch =
      biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCore && matchesSearch;
  });

  return (
    <div className="marketplace-view-container">
      {/* Hero Header */}
      <div className="ekoz-card marketplace-hero-card">
        <div className="marketplace-hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-gold">
              <Store size={13} />
              <span>MARKETPLACE EXECUTIVO</span>
            </span>
            <span className="badge badge-moss">HUB DE CONEXÕES B2B</span>
          </div>

          <div className="hero-title-action-row">
            <div>
              <h1 className="marketplace-hero-title">
                Núcleos Temáticos & <span className="text-gold-gradient">Marketplace Ekoz</span>
              </h1>
              <p className="marketplace-hero-desc">
                Contrate soluções, feche parcerias e consulte serviços oferecidos exclusivamente
                pelos empresários e fundadores do ecossistema.
              </p>
            </div>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn btn-gold btn-register-biz"
            >
              <Plus size={17} />
              <span>Cadastrar Meu Negócio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thematic Cores Navigation Tabs */}
      <div className="cores-tabs-container">
        <div className="cores-tabs-scroll">
          {thematicCores.map((core) => {
            const isSelected = selectedCore === core.id;
            return (
              <button
                key={core.id}
                onClick={() => setSelectedCore(core.id)}
                className={`core-tab-btn ${isSelected ? 'active' : ''}`}
              >
                <span className="core-icon">{getCoreIcon(core.icon)}</span>
                <span className="core-name">{core.name}</span>
                <span className={`core-count-badge ${isSelected ? 'badge-active' : ''}`}>
                  {core.id === 'all'
                    ? businesses.length
                    : businesses.filter((b) => b.coreId === core.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Stats Bar */}
      <div className="marketplace-controls-bar">
        <div className="marketplace-search-wrap">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por empresa, sócio fundador, especialidade (ex: IA, tráfego, holding)..."
            className="ekoz-input"
          />
        </div>

        <span className="results-count-text">
          Mostrando <strong>{filteredBusinesses.length}</strong> empresas verificadas
        </span>
      </div>

      {/* Business Grid */}
      <div className="businesses-grid">
        {filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))
        ) : (
          <div className="empty-results-box ekoz-card">
            <Store size={40} color="#7C8B82" />
            <h3>Nenhuma empresa encontrada neste filtro</h3>
            <p>Seja o primeiro a cadastrar sua empresa neste núcleo temático!</p>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn btn-gold btn-sm mt-3"
            >
              <Plus size={15} />
              <span>Cadastrar Agora</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal for Registering a Business */}
      {showRegisterModal && (
        <RegisterBusinessModal onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
};
