import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { ExperienceItem } from '../../types';
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Send,
  ArrowRight,
  X,
} from 'lucide-react';

export const ExperiencesView: React.FC = () => {
  const { experiences, user, applyForExperience } = useEkoz();
  const [selectedExp, setSelectedExp] = useState<ExperienceItem | null>(null);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleApplyInterest = (exp: ExperienceItem) => {
    setSelectedExp(exp);
    setInterestSubmitted(false);
    setSubmitError(null);
    setWhatsapp(user.whatsapp || '');
    setMotivation('');
  };

  const handleConfirmApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp) return;
    setSubmitting(true);
    setSubmitError(null);

    const notes = [
      whatsapp ? `WhatsApp de contato: ${whatsapp}` : null,
      motivation || null,
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      await applyForExperience(selectedExp.id, notes || undefined);
      setInterestSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Não foi possível enviar sua candidatura agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="experiences-view-container">
      {/* Inspirational Hero */}
      <div className="ekoz-card experiences-hero-card">
        <div className="experiences-hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-gold">
              <Compass size={13} />
              <span>EXPEDIÇÕES & RETIROS DE ELITE</span>
            </span>
            <span className="badge badge-moss">ACESSO RESTRITO</span>
          </div>

          <h1 className="experiences-hero-title">
            "Viva a vida que você <span className="text-gold-gradient">nunca VIVEU!</span>"
          </h1>

          <p className="experiences-hero-desc">
            Expedições autênticas onde o luxo encontra a aventura pura. Conecte-se com empresários
            obstinados em cenários inóspitos e memoráveis, vivenciando o que menos de 1% das pessoas
            no mundo jamais experimentará.
          </p>

          <div className="experiences-features-row">
            <div className="exp-feature">
              <CheckCircle2 size={16} color="#DFC16E" />
              <span>Curadoria Ímpar de Destinos</span>
            </div>
            <div className="exp-feature">
              <CheckCircle2 size={16} color="#DFC16E" />
              <span>Mentoria ao Vivo com Ezekiel Dall'Bello</span>
            </div>
            <div className="exp-feature">
              <CheckCircle2 size={16} color="#DFC16E" />
              <span>Vagas Limitadas por Expedição</span>
            </div>
          </div>
        </div>
      </div>

      {/* Experiences Showcase */}
      <div className="experiences-list">
        {experiences.map((exp) => (
          <article key={exp.id} className="ekoz-card experience-card">
            <div className="exp-media-column">
              <img src={exp.coverImage} alt={exp.title} className="exp-cover-main" />
              
              {exp.gallery && exp.gallery.length > 1 && (
                <div className="exp-mini-gallery">
                  {exp.gallery.slice(1).map((img, idx) => (
                    <img key={idx} src={img} alt="Galeria" className="exp-thumb-img" />
                  ))}
                </div>
              )}
            </div>

            <div className="exp-info-column">
              <div className="exp-header-badges">
                <span className="badge badge-gold">{exp.status}</span>
                <span className="exp-destination-text">
                  <MapPin size={14} color="#DFC16E" />
                  {exp.destination}
                </span>
              </div>

              <h2 className="exp-title">{exp.title}</h2>
              <p className="exp-subtitle">"{exp.subtitle}"</p>

              <div className="exp-dates-row">
                <Calendar size={15} color="#A8B5AE" />
                <span>{exp.dates}</span>
              </div>

              <p className="exp-description">{exp.description}</p>

              {/* Highlights */}
              <div className="exp-highlights-box">
                <span className="highlights-title">O que está incluído na experiência:</span>
                <ul className="highlights-list">
                  {exp.highlights.map((h, i) => (
                    <li key={i}>
                      <Sparkles size={14} color="#DFC16E" className="highlight-bullet-icon" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="exp-footer-cta-row">
                <div className="exp-investment-wrap">
                  <span className="inv-label">Investimento:</span>
                  <span className="inv-value">{exp.investment}</span>
                </div>

                <button
                  onClick={() => handleApplyInterest(exp)}
                  className="btn btn-gold"
                >
                  <span>Candidatar-se à Vaga</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Application Modal */}
      {selectedExp && (
        <div className="modal-overlay">
          <div className="modal-content experience-modal">
            <div className="modal-header-row">
              <div className="modal-header-title-group">
                <span className="badge badge-gold">CANDIDATURA VIP</span>
                <h3 className="modal-title">{selectedExp.title}</h3>
              </div>
              <button onClick={() => setSelectedExp(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {!interestSubmitted ? (
              <form onSubmit={handleConfirmApplication} className="exp-application-form">
                <p className="exp-modal-intro">
                  As vagas para nossas expedições passam por análise prévia da diretoria executiva
                  para garantir a harmonia do grupo e o mais alto nível de networking.
                </p>

                <div className="form-group">
                  <label className="form-label">Seu Nome Completo</label>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="ekoz-input"
                    title="Identidade da sua conta Ekoz"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Direto</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+55 51 99999-9999"
                    className="ekoz-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Por que você deseja viver essa experiência?</label>
                  <textarea
                    rows={3}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="Conte brevemente sobre seus objetivos com a expedição..."
                    className="ekoz-textarea"
                  />
                </div>

                {submitError && <div className="login-screen-error">{submitError}</div>}

                <div className="modal-footer-row mt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedExp(null)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-gold" disabled={submitting}>
                    <Send size={15} />
                    <span>{submitting ? 'Enviando...' : 'Enviar Solicitação de Reserva'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="success-confirmation-pane">
                <CheckCircle2 size={48} color="#4ADE80" />
                <h3>Solicitação Enviada com Sucesso!</h3>
                <p>Nossa equipe de concierge VIP entrará em contato via WhatsApp nas próximas 24 horas.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
