import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress, ProgressLabel, ProgressValue } from './progress';

describe('Progress Component', () => {
  it('should render correctly with value', () => {
    render(
      <Progress value={50} data-testid="progress">
        <ProgressLabel>Loading</ProgressLabel>
        <ProgressValue />
      </Progress>
    );
    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
    
    // Test base-ui structure
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
