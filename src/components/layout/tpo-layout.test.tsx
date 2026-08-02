import React from 'react';
import { render, screen } from '@testing-library/react';
import { TpoLayout } from './tpo-layout';
import { usePathname } from 'next/navigation';

describe('TpoLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/tpo');
    render(
      <TpoLayout>
        <div data-testid="tpo-child">Tpo Child</div>
      </TpoLayout>
    );

    expect(screen.getByTestId('tpo-child')).toBeInTheDocument();
  });

  it('should render the TPO sidebar and header', () => {
    (usePathname as jest.Mock).mockReturnValue('/tpo');
    render(
      <TpoLayout>
        <div>Content</div>
      </TpoLayout>
    );

    expect(screen.getByText('Kredl TPO')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /students/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /placement drives/i })).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText(/search students, drives/i)).toBeInTheDocument();
    expect(screen.getByText('TPO Officer')).toBeInTheDocument();
  });
});
