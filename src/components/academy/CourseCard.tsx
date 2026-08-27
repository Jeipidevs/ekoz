import React from 'react';
import { Course } from '../../types';
import { Play, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onOpen: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onOpen }) => {
  return (
    <div className="ekoz-card course-card">
      <div className="course-cover-wrapper" onClick={() => onOpen(course)}>
        <img src={course.coverImage} alt={course.title} className="course-cover-img" />
        <div className="course-overlay-play">
          <div className="play-button-circle">
            <Play size={22} fill="#0F1713" color="#0F1713" />
          </div>
        </div>
        <span className="course-category-badge">{course.category}</span>
      </div>

      <div className="course-card-body">
        <div className="course-meta-top">
          <span className="course-duration">
            <Clock size={13} />
            {course.duration}
          </span>
          <span className="course-lessons-count">
            <BookOpen size={13} />
            {course.lessonsCount} aulas
          </span>
        </div>

        <h3 className="course-card-title" onClick={() => onOpen(course)}>
          {course.title}
        </h3>

        <p className="course-card-desc">{course.description}</p>

        {/* Instructor */}
        <div className="course-instructor-row">
          <img
            src={course.instructorAvatar}
            alt={course.instructor}
            className="instructor-avatar-sm"
          />
          <div className="instructor-info-sm">
            <span className="inst-name-sm">{course.instructor}</span>
            <span className="inst-role-sm">{course.instructorRole}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="course-progress-section">
          <div className="progress-info-row">
            <span className="progress-label">Progresso</span>
            <span className="progress-percent">{course.progress}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        {/* CTA Button */}
        <button onClick={() => onOpen(course)} className="btn btn-gold btn-sm full-width mt-3">
          <Play size={14} fill="currentColor" />
          <span>{course.progress > 0 ? 'Continuar Assistindo' : 'Iniciar Masterclass'}</span>
        </button>
      </div>
    </div>
  );
};
