import React, { useEffect, useState } from 'react';
import { Course } from '../../types';
import { Play, Info } from 'lucide-react';

interface AcademyHeroProps {
  courses: Course[];
  onSelect: (course: Course) => void;
}

const ROTATE_INTERVAL_MS = 6000;

export const AcademyHero: React.FC<AcademyHeroProps> = ({ courses, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trackedCoursesLength, setTrackedCoursesLength] = useState(courses.length);

  if (courses.length !== trackedCoursesLength) {
    setTrackedCoursesLength(courses.length);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (paused || courses.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % courses.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, courses.length]);

  if (courses.length === 0) return null;

  const course = courses[activeIndex];
  const backdrop = course.backdropImage || course.coverImage;

  return (
    <div
      className="academy-hero"
      style={{ backgroundImage: `url(${backdrop})` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="academy-hero-shade" />
      <div className="academy-hero-content">
        <span className="academy-hero-badge">Recomendado para você</span>
        <h1 className="academy-hero-title">{course.title}</h1>
        <p className="academy-hero-desc">{course.description}</p>
        <div className="academy-hero-meta">
          <span>{course.lessonsCount} aulas</span>
          <span>{course.duration}</span>
          <span>{course.category}</span>
        </div>
        <div className="academy-hero-btns">
          <button className="btn btn-gold academy-hero-btn-play" onClick={() => onSelect(course)}>
            <Play size={16} fill="currentColor" />
            <span>Assistir Agora</span>
          </button>
          <button className="academy-hero-btn-info" onClick={() => onSelect(course)}>
            <Info size={16} />
            <span>Mais Informações</span>
          </button>
        </div>
      </div>

      {courses.length > 1 && (
        <div className="academy-hero-dots">
          {courses.map((c, idx) => (
            <button
              key={c.id}
              className={`academy-hero-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ver ${c.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
