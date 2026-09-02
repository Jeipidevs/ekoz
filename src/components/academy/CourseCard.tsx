import React from 'react';
import { Course } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import { Play, Plus, Info } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onOpen: (course: Course) => void;
  rank?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onOpen, rank }) => {
  const { triggerToast } = useEkoz();

  const metaLabel =
    course.progress > 0 && course.progress < 100
      ? `${course.progress}% assistido`
      : `${course.lessonsCount} aulas · ${course.duration}`;

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerToast({
      title: 'Em breve',
      message: 'Listas personalizadas de cursos chegam em uma próxima atualização.',
      type: 'info',
    });
  };

  return (
    <div
      className="course-row-card"
      style={{ backgroundImage: `url(${course.coverImage})` }}
      onClick={() => onOpen(course)}
    >
      {rank && <span className="course-row-card-rank">TOP {rank}</span>}

      <div className="course-row-card-shade">
        <p className="course-row-card-title">{course.title}</p>
        <p className="course-row-card-meta">{metaLabel}</p>
        <div className="course-row-card-icons">
          <button
            className="course-row-icon-btn gold"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(course);
            }}
            aria-label="Assistir"
          >
            <Play size={12} fill="currentColor" />
          </button>
          <button className="course-row-icon-btn" onClick={handleAddToList} aria-label="Adicionar à lista">
            <Plus size={12} />
          </button>
          <button
            className="course-row-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(course);
            }}
            aria-label="Mais informações"
          >
            <Info size={12} />
          </button>
        </div>
      </div>

      {course.progress > 0 && (
        <div className="course-row-card-progress">
          <div className="course-row-card-progress-fill" style={{ width: `${course.progress}%` }} />
        </div>
      )}
    </div>
  );
};
