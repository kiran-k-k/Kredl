import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge Component', () => {
  it('should render correctly with default variant', () => {
    render(<Badge data-testid="badge">Default Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Default Badge');
    // We expect the default background class
    expect(badge).toHaveClass('bg-primary');
  });

  it('should apply variant classes correctly', () => {
    const { rerender } = render(<Badge data-testid="badge" variant="destructive">Destructive</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-destructive/10');

    rerender(<Badge data-testid="badge" variant="outline">Outline</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('border-border');

    rerender(<Badge data-testid="badge" variant="secondary">Secondary</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-secondary');
  });

  it('should allow rendering as a different element using base-ui render prop', () => {
    // If it uses useRender, it accepts a `render` prop to change the element.
    render(<Badge data-testid="badge" render={<a href="/test" />} />);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('A');
    expect(badge).toHaveAttribute('href', '/test');
  });
});
