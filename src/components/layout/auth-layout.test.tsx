import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './auth-layout';

describe('AuthLayout', () => {
  it('should render children in the left panel', () => {
    render(
      <AuthLayout>
        <div data-testid="auth-child">Auth Form Here</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('auth-child')).toBeInTheDocument();
  });

  it('should render the brand and footer links', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    // Brand
    expect(screen.getByAltText('Kredl Logo')).toBeInTheDocument();
    
    // Footer links
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute('href', '/terms');
  });

  it('should render the aspirational right panel', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText(/learn\. build\. prepare\./i)).toBeInTheDocument();
    expect(screen.getByText(/join 10,000\+ students/i)).toBeInTheDocument();
  });
});
