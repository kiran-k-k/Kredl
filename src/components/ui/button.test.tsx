import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should apply variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button', { name: /delete/i })).toHaveClass('bg-destructive/10');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button', { name: /outline/i })).toHaveClass('border-border');
  });

  it('should apply size classes correctly', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button', { name: /small/i })).toHaveClass('h-7');
  });

  it('should handle onClick events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });
});
