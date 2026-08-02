import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './empty-state';

describe('EmptyState Component', () => {
  it('renders default text correctly', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters or search terms to find what you're looking for.")).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<EmptyState title="Custom Title" message="Custom Message" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });

  it('renders reset buttons when onReset is provided', () => {
    const mockOnReset = jest.fn();
    render(<EmptyState onReset={mockOnReset} />);
    
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).toBeInTheDocument();
    
    const browseButton = screen.getByRole('button', { name: /browse all/i });
    expect(browseButton).toBeInTheDocument();
  });

  it('does not render buttons when onReset is not provided', () => {
    render(<EmptyState />);
    
    expect(screen.queryByRole('button', { name: /reset filters/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /browse all/i })).not.toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const mockOnReset = jest.fn();
    render(<EmptyState onReset={mockOnReset} />);
    
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
