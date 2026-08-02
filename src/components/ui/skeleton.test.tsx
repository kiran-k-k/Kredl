import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton Component', () => {
  it('should render correctly', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    render(<Skeleton data-testid="skeleton" className="custom-class" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('custom-class');
  });
});
