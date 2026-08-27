import React, { useState } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { CourseCard } from './CourseCard';
import { LessonPlayerModal } from './LessonPlayerModal';
import { Course } from '../../types';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
} from 'lucide-react';

export const AcademyView: React.FC = () => {
  const { courses, selectedCourse, setSelectedCourse } = useEkoz();
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const categories = [
    'Todas',
    'Alta Performance',
    'Gestão & Escala',
    'Liderança & Inteligência',
    'Lifestyle & Network',
  ];

  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'Todas') return true;
    return c.category === activeCategory;
  });

  return (
    <div className="academy-view-container">
      {/* Hero Banner */}
      <div className="ekoz-card academy-hero-card">
        <div className="academy-hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-gold">
              <GraduationCap size={13} />
              <span>BRAÇO EDUCACIONAL EXECUTIVO</span>
            </span>
            <span className="badge badge-moss">CONTEÚDO EXCLUSIVO</span>
          </div>

          <h1 className="academy-hero-title">
            Ekoz Academy: <span className="text-gold-gradient">Masterclasses de Alta Performance</span>
          </h1>

          <p className="academy-hero-desc">
            Aulas aprofundadas sobre gestão de equipes autônomas, biohacking para empresários,
            blindagem emocional e estratégia de escala com o CEO <strong>Ezekiel Dall'Bello</strong> e mentores convidados.
          </p>

          <div className="academy-stats-bar">
            <div className="stat-pill">
              <Clock size={16} color="#DFC16E" />
              <span>+35 Horas de Conteúdo</span>
            </div>
            <div className="stat-pill">
              <PlayCircle size={16} color="#DFC16E" />
              <span>3 Masterclasses Completas</span>
            </div>
            <div className="stat-pill">
              <CheckCircle size={16} color="#DFC16E" />
              <span>Certificação Ekoz Black</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="academy-filter-bar">
        <div className="category-scroll-list">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`cat-filter-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onOpen={(c) => setSelectedCourse(c)}
          />
        ))}
      </div>

      {/* Lesson Player Modal */}
      {selectedCourse && (
        <LessonPlayerModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
};
