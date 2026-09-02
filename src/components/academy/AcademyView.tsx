import React, { useMemo } from 'react';
import { useEkoz } from '../../context/EkozContext';
import { AcademyHero } from './AcademyHero';
import { CourseRow } from './CourseRow';
import { LessonPlayerModal } from './LessonPlayerModal';
import { Course } from '../../types';

const CATEGORY_SLUGS: Record<Course['category'], string> = {
  'Alta Performance': 'alta-performance',
  'Gestão & Escala': 'gestao-escala',
  'Liderança & Inteligência': 'lideranca-inteligencia',
  'Lifestyle & Network': 'lifestyle-network',
};

const CATEGORIES = Object.keys(CATEGORY_SLUGS) as Course['category'][];

export const AcademyView: React.FC = () => {
  const { courses, selectedCourse, setSelectedCourse } = useEkoz();

  const featuredCourses = useMemo(() => courses.filter((c) => c.isFeatured), [courses]);

  const continueWatching = useMemo(
    () => courses.filter((c) => c.progress > 0 && c.progress < 100),
    [courses]
  );

  const trending = useMemo(
    () => [...courses].sort((a, b) => (b.learnersCount || 0) - (a.learnersCount || 0)).slice(0, 8),
    [courses]
  );

  const scrollToCategory = (category: Course['category']) => {
    document
      .getElementById(`academy-row-${CATEGORY_SLUGS[category]}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="academy-view-container">
      <AcademyHero courses={featuredCourses} onSelect={setSelectedCourse} />

      <div className="academy-quick-nav">
        {CATEGORIES.map((cat) => (
          <button key={cat} className="academy-quick-nav-btn" onClick={() => scrollToCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="academy-rows">
        <CourseRow title="Continuar Assistindo" courses={continueWatching} onOpen={setSelectedCourse} />
        <CourseRow title="Em Alta no Ecossistema" courses={trending} onOpen={setSelectedCourse} showRanking />

        {CATEGORIES.map((cat) => (
          <div key={cat} id={`academy-row-${CATEGORY_SLUGS[cat]}`}>
            <CourseRow
              title={cat}
              courses={courses.filter((c) => c.category === cat)}
              onOpen={setSelectedCourse}
            />
          </div>
        ))}
      </div>

      {selectedCourse && (
        <LessonPlayerModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
};
