import React from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  Layers,
  GraduationCap,
  Store,
  Calendar,
  Compass,
  Video,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { ACADEMY_ENABLED } from '../../config/features';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useEkoz();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'feed',
      label: 'Feed',
      icon: <Layers size={20} />,
    },
    ...(ACADEMY_ENABLED
      ? [
          {
            id: 'academy' as ActiveTab,
            label: 'Academy',
            icon: <GraduationCap size={20} />,
          },
        ]
      : []),
    {
      id: 'marketplace',
      label: 'Mercado',
      icon: <Store size={20} />,
    },
    {
      id: 'events',
      label: 'Eventos',
      icon: <Calendar size={20} />,
    },
    {
      id: 'experiences',
      label: 'Expedições',
      icon: <Compass size={20} />,
    },
    {
      id: 'videocall',
      label: 'Vídeo',
      icon: <Video size={20} />,
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-bar-inner">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">{item.icon}</div>
              <span className="mobile-nav-label">{item.label}</span>
              {isActive && <span className="mobile-active-dot" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
