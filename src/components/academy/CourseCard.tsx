import React from 'react';
import { Course } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import { Play, Plus, ChevronDown } from 'lucide-react';

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

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(course);
  };

  return (
    <div className="course-row-card" onClick={() => onOpen(course)}>
      <div className="course-row-card-inner">
        <div className="course-row-card-poster" style={{ backgroundImage: `url(${course.coverImage})` }}>
          {rank && <span className="course-row-card-rank">TOP {rank}</span>}
          {course.progress > 0 && (
            <div className="course-row-card-progress">
              <div className="course-row-card-progress-fill" style={{ width: `${course.progress}%` }} />
            </div>
          )}
        </div>

        <div className="course-row-card-details">
          <div className="course-row-card-icons">
            <button className="course-row-icon-btn gold" onClick={handleOpen} aria-label="Assistir">
              <Play size={13} fill="currentColor" />
            </button>
            <button className="course-row-icon-btn" onClick={handleAddToList} aria-label="Adicionar à lista">
              <Plus size={13} />
            </button>
            <button
              className="course-row-icon-btn push-right"
              onClick={handleOpen}
              aria-label="Mais informações"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          <p className="course-row-card-title">{course.title}</p>
          <p className="course-row-card-meta">{metaLabel}</p>

          {course.tags && course.tags.length > 0 && (
            <p className="course-row-card-tags">{course.tags.join(' • ')}</p>
          )}
        </div>
      </div>
    </div>
  );
};
