import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { EventItem } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  Ticket,
  ExternalLink,
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, toggleEventRegistration } = useEkoz();
  const [filterType, setFilterType] = useState<string>('Todos');

  const filterTypes = ['Todos', 'Presencial', 'Masterclass Exclusiva', 'Jantar Executivo'];

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'Todos') return true;
    return ev.type === filterType;
  });

  return (
    <div className="events-view-container">
      {/* Hero */}
      <div className="ekoz-card events-hero-card">
        <div className="events-hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-gold">
              <Calendar size={13} />
              <span>CALENDÁRIO OFICIAL EKOZ</span>
            </span>
            <span className="badge badge-moss">ENCONTROS EXECUTIVOS</span>
          </div>

          <h1 className="events-hero-title">
            Eventos, Cúpulas & <span className="text-gold-gradient">Masterclasses Presenciais</span>
          </h1>

          <p className="events-hero-desc">
            Momentos desenhados para quebrar a rotina, gerar conexões de alto nível e selar
            alianças estratégicas com quem joga o mesmo jogo que você.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="events-filter-bar">
        <div className="filter-buttons-scroll">
          {filterTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`filter-tab-btn ${filterType === type ? 'active' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Grid */}
      <div className="events-grid">
        {filteredEvents.map((ev) => (
          <div key={ev.id} className="ekoz-card event-card">
            <div className="event-card-cover-wrap">
              <img src={ev.image} alt={ev.title} className="event-card-cover-img" />
              <div className="event-cover-overlay"></div>
              <span className="event-type-badge">{ev.type}</span>
              {ev.isRegistered && (
                <div className="event-registered-badge">
                  <CheckCircle2 size={13} />
                  <span>Credenciado</span>
                </div>
              )}
            </div>

            <div className="event-card-body">
              <div className="event-time-row">
                <span className="event-date">
                  <Calendar size={14} color="#DFC16E" />
                  {ev.date}
                </span>
                <span className="event-hour">
                  <Clock size={14} color="#A8B5AE" />
                  {ev.time}
                </span>
              </div>

              <h3 className="event-title">{ev.title}</h3>

              <div className="event-location-row">
                <MapPin size={15} color="#DFC16E" />
                <span>{ev.location}</span>
              </div>

              <p className="event-desc">{ev.description}</p>

              {/* Speaker */}
              <div className="event-speaker-box">
                <span className="speaker-label">Liderança / Palestrante:</span>
                <div className="speaker-name">{ev.speaker}</div>
                <span className="speaker-role">{ev.speakerRole}</span>
              </div>

              {/* Spots and Action */}
              <div className="event-footer-action-row">
                <div className="spots-info">
                  <Users size={14} color="#A8B5AE" />
                  <span>
                    <strong>{ev.spotsLeft}</strong> vagas restantes
                  </span>
                </div>

                <button
                  onClick={() => toggleEventRegistration(ev.id)}
                  className={`btn ${ev.isRegistered ? 'btn-secondary' : 'btn-gold'} btn-sm`}
                >
                  <Ticket size={15} />
                  <span>{ev.isRegistered ? 'Cancelar RSVP' : 'Confirmar Presença'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
