import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompanyCard } from './company-card';

describe('CompanyCard Component', () => {
  const mockProps = {
    id: 'c1',
    name: 'Tech Corp',
    description: 'A leading technology company.',
    industry: 'Software Development',
    location: 'San Francisco, CA',
    isHiring: true,
    popularRoles: ['Frontend Engineer', 'Backend Engineer'],
  };

  it('renders company details correctly', () => {
    render(<CompanyCard {...mockProps} />);

    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Software Development')).toBeInTheDocument();
    expect(screen.getByText('A leading technology company.')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('Popular: Frontend Engineer, Backend Engineer')).toBeInTheDocument();
  });

  it('shows Hiring Now badge when isHiring is true', () => {
    render(<CompanyCard {...mockProps} />);
    expect(screen.getByText('Hiring Now')).toBeInTheDocument();
  });

  it('does not show Hiring Now badge when isHiring is false', () => {
    render(<CompanyCard {...mockProps} isHiring={false} />);
    expect(screen.queryByText('Hiring Now')).not.toBeInTheDocument();
  });

  it('has the correct link href', () => {
    render(<CompanyCard {...mockProps} />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/companies/c1');
  });
});
