import React, { useState } from 'react';
import { Course, Lesson } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import {
  X,
  Play,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface LessonPlayerModalProps {
  course: Course;
  onClose: () => void;
}

const findFirstIncompleteLesson = (course: Course): Lesson => {
  for (const mod of course.modules) {
    const incomplete = mod.lessons.find((lesson) => !lesson.completed);
    if (incomplete) return incomplete;
  }
  return course.modules[0]?.lessons[0] || ({} as Lesson);
};

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({ course, onClose }) => {
  const { toggleLessonComplete } = useEkoz();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(() => findFirstIncompleteLesson(course));
  const [activeSubTab, setActiveSubTab] = useState<'resumo' | 'materiais' | 'duvidas'>('resumo');
  const [doubtText, setDoubtText] = useState('');
  const [doubtsList, setDoubtsList] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: 'd-1',
      user: 'Marcelo Bittencourt',
      text: 'Excelente abordagem sobre protocolos matinais. Como você adapta essa rotina nos dias de viagens executivas?',
      time: 'há 2 dias',
    },
  ]);

  const handleToggleComplete = () => {
    toggleLessonComplete(course.id, selectedLesson.id);
    setSelectedLesson((prev) => ({ ...prev, completed: !prev.completed }));
  };

  const handleAddDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setDoubtsList([
      ...doubtsList,
      {
        id: `d-${Date.now()}`,
        user: "Ezekiel Dall'Bello (Você)",
        text: doubtText.trim(),
        time: 'Agora mesmo',
      },
    ]);
    setDoubtText('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content lesson-player-modal">
        {/* Modal Top Bar */}
        <div className="player-top-bar">
          <div className="player-course-info">
            <span className="badge badge-gold">{course.category}</span>
            <h3 className="player-course-title">{course.title}</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Fechar Player">
            <X size={20} />
          </button>
        </div>

        <div className="player-body-grid">
          {/* Left: Video Player & Tabs */}
          <div className="player-video-column">
            <div className="video-viewport-wrapper">
              <video
                controls
                autoPlay
                src={selectedLesson.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                className="main-video-element"
                poster={course.coverImage}
              />
            </div>

            <div className="lesson-header-action-row">
              <div>
                <h4 className="active-lesson-title">{selectedLesson.title}</h4>
                <span className="active-lesson-duration">Duração estimada: {selectedLesson.duration}</span>
              </div>

              <button
                onClick={handleToggleComplete}
                className={`btn ${selectedLesson.completed ? 'btn-secondary' : 'btn-gold'} btn-sm`}
              >
                <CheckCircle2 size={16} color={selectedLesson.completed ? '#4ADE80' : 'currentColor'} />
                <span>{selectedLesson.completed ? 'Aula Concluída' : 'Marcar como Concluída'}</span>
              </button>
            </div>

            {/* Sub-Tabs: Resumo, Materiais, Dúvidas */}
            <div className="player-subtabs-nav">
              <button
                onClick={() => setActiveSubTab('resumo')}
                className={`player-subtab-btn ${activeSubTab === 'resumo' ? 'active' : ''}`}
              >
                <BookOpen size={15} />
                <span>Resumo Executivo</span>
              </button>
              <button
                onClick={() => setActiveSubTab('materiais')}
                className={`player-subtab-btn ${activeSubTab === 'materiais' ? 'active' : ''}`}
              >
                <FileText size={15} />
                <span>Materiais ({selectedLesson.resources?.length || 1})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('duvidas')}
                className={`player-subtab-btn ${activeSubTab === 'duvidas' ? 'active' : ''}`}
              >
                <MessageSquare size={15} />
                <span>Dúvidas & Discussão ({doubtsList.length})</span>
              </button>
            </div>

            <div className="player-subtab-content">
              {activeSubTab === 'resumo' && (
                <div className="summary-tab-pane">
                  <p>{selectedLesson.summary || 'Nenhum resumo cadastrado para esta aula ainda.'}</p>
                  <div className="instructor-card-snippet mt-3">
                    <img src={course.instructorAvatar} alt={course.instructor} className="inst-avatar" />
                    <div>
                      <span className="inst-name">{course.instructor}</span>
                      <span className="inst-role">{course.instructorRole}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'materiais' && (
                <div className="resources-tab-pane">
                  <div className="resource-item-row">
                    <div className="resource-info">
                      <FileText size={18} color="#DFC16E" />
                      <div>
                        <span className="resource-title">Framework de Decisão Rápida.pdf</span>
                        <span className="resource-size">PDF • 2.4 MB</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Download do material iniciado.')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download size={14} />
                      <span>Baixar</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'duvidas' && (
                <div className="doubts-tab-pane">
                  <form onSubmit={handleAddDoubt} className="doubt-input-row">
                    <input
                      type="text"
                      value={doubtText}
                      onChange={(e) => setDoubtText(e.target.value)}
                      placeholder="Envie sua pergunta diretamente para a mentoria..."
                      className="ekoz-input"
                    />
                    <button type="submit" className="btn btn-gold btn-sm">
                      Enviar
                    </button>
                  </form>

                  <div className="doubts-list mt-3">
                    {doubtsList.map((d) => (
                      <div key={d.id} className="doubt-item">
                        <div className="doubt-author-line">
                          <span className="doubt-author">{d.user}</span>
                          <span className="doubt-time">{d.time}</span>
                        </div>
                        <p className="doubt-text">{d.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Modules & Lessons Playlist */}
          <div className="player-playlist-column">
            <div className="playlist-header">
              <span className="playlist-title">Grade do Curso</span>
              <span className="playlist-progress">{course.progress}% concluído</span>
            </div>

            <div className="playlist-modules-list">
              {course.modules.map((module, mIdx) => (
                <div key={module.id} className="module-group">
                  <div className="module-title-bar">
                    <span>{module.title}</span>
                  </div>

                  <div className="module-lessons">
                    {module.lessons.map((lesson) => {
                      const isPlaying = selectedLesson.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`playlist-lesson-item ${isPlaying ? 'active' : ''}`}
                        >
                          <div className="lesson-status-icon">
                            {lesson.completed ? (
                              <CheckCircle2 size={16} color="#4ADE80" />
                            ) : isPlaying ? (
                              <Play size={16} color="#DFC16E" />
                            ) : (
                              <ChevronRight size={16} color="#7C8B82" />
                            )}
                          </div>
                          <div className="lesson-meta-text">
                            <span className="lesson-item-title">{lesson.title}</span>
                            <span className="lesson-item-duration">{lesson.duration}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
