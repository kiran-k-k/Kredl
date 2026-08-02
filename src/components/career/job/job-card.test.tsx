import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from './job-card';

describe('JobCard Component', () => {
  const mockProps = {
    id: 'j1',
    companyName: 'Tech Corp',
    role: 'Frontend Engineer',
    location: 'San Francisco, CA',
    experience: '3-5 years',
    salary: '$120k - $150k',
    postedDate: '2 days ago',
    isRemote: true,
  };

  it('renders job details correctly', () => {
    render(<JobCard {...mockProps} />);

    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, CA/)).toBeInTheDocument();
    expect(screen.getByText(/3-5 years/)).toBeInTheDocument();
    expect(screen.getByText(/\$120k - \$150k/)).toBeInTheDocument();
    expect(screen.getByText(/2 days ago/)).toBeInTheDocument();
  });

  it('shows remote badge when isRemote is true', () => {
    render(<JobCard {...mockProps} />);
    // Note: There are two remote badges (one for mobile, one for desktop)
    const badges = screen.getAllByText('Remote');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('handles bookmark toggle', () => {
    const onToggleBookmark = jest.fn();
    render(<JobCard {...mockProps} onToggleBookmark={onToggleBookmark} />);

    const bookmarkButtons = screen.getAllByRole('button');
    fireEvent.click(bookmarkButtons[0]);

    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
  });

  it('disables bookmark button when toggling', () => {
    render(<JobCard {...mockProps} onToggleBookmark={jest.fn()} isTogglingBookmark={true} />);
    const bookmarkButtons = screen.getAllByRole('button');
    expect(bookmarkButtons[0]).toBeDisabled();
  });

  it('renders correctly when expired', () => {
    render(<JobCard {...mockProps} status="Expired" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
    
    // the "Apply" link changes to "View"
    expect(screen.getByText('View')).toBeInTheDocument();
  });
});
