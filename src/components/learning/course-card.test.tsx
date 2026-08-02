import React from 'react';
import { render, screen } from '@testing-library/react';
import { CourseCard } from './course-card';

describe('CourseCard Component', () => {
  const mockProps = {
    id: 'course-1',
    title: 'Intro to React',
    description: 'Learn the basics of React.',
    difficulty: 'Beginner' as const,
    duration: '2h 30m',
    modules: 5,
  };

  it('renders course details correctly when not enrolled', () => {
    render(<CourseCard {...mockProps} />);

    expect(screen.getByText('Intro to React')).toBeInTheDocument();
    expect(screen.getByText('Learn the basics of React.')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('2h 30m')).toBeInTheDocument();
    expect(screen.getByText('5 Modules')).toBeInTheDocument();
    
    // View details button
    const viewButton = screen.getByText(/view course details/i).closest('a');
    expect(viewButton).toHaveAttribute('href', '/courses/course-1');
  });

  it('renders progress and continue button when enrolled', () => {
    render(<CourseCard {...mockProps} isEnrolled={true} progress={75} />);

    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    
    // Progress bar role
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');

    // Continue learning link
    const continueLink = screen.getByText(/continue learning/i).closest('a');
    expect(continueLink).toHaveAttribute('href', '/learn/course-1/lesson-1');
  });

  it('renders intermediate and advanced difficulty correctly', () => {
    const { rerender } = render(<CourseCard {...mockProps} difficulty="Intermediate" />);
    expect(screen.getByText('Intermediate')).toBeInTheDocument();

    rerender(<CourseCard {...mockProps} difficulty="Advanced" />);
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });
});
