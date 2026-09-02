import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CourseRowProps {
  title: string;
  courses: Course[];
  onOpen: (course: Course) => void;
  showRanking?: boolean;
}

const SCROLL_AMOUNT = 680;

export const CourseRow: React.FC<CourseRowProps> = ({ title, courses, onOpen, showRanking }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
  }, [courses, updateArrows]);

  const scrollBy = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (courses.length === 0) return null;

  return (
    <div className="course-row">
      <h3 className="course-row-title">{title}</h3>
      <div className="course-row-viewport">
        {canScrollLeft && (
          <button
            className="course-row-arrow course-row-arrow-left"
            onClick={() => scrollBy(-SCROLL_AMOUNT)}
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="course-row-track" ref={trackRef} onScroll={updateArrows}>
          {courses.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpen={onOpen}
              rank={showRanking ? idx + 1 : undefined}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            className="course-row-arrow course-row-arrow-right"
            onClick={() => scrollBy(SCROLL_AMOUNT)}
            aria-label="Rolar para a direita"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </div>
  );
};
