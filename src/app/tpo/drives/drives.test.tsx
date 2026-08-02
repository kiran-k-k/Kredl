import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TpoDrivesPage from './page';

// Mock the Layout to avoid next/navigation router issues in tests
jest.mock('@/components/layout/tpo-layout', () => ({
  TpoLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="tpo-layout">{children}</div>,
}));

// Mock the Data
jest.mock('@/lib/tpo-data/drives.mock', () => ({
  MOCK_TPO_DRIVES: [
    {
      id: 'drive-1',
      companyName: 'TechCorp',
      role: 'Software Engineer',
      status: 'Ongoing',
      driveDate: '2023-12-01',
      packageRange: '10 LPA',
      applicantCount: 150,
      registrationStatus: 'Open',
      eligibleBranches: ['CS', 'IT']
    },
    {
      id: 'drive-2',
      companyName: 'DesignStudio',
      role: 'UX Designer',
      status: 'Upcoming',
      driveDate: '2024-01-15',
      packageRange: '8 LPA',
      applicantCount: 45,
      registrationStatus: 'Closed',
      eligibleBranches: ['CS', 'IT']
    }
  ]
}));

describe('TpoDrivesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the drives page with initial mock data', () => {
    render(<TpoDrivesPage />);
    
    expect(screen.getByText('Placement Drives')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
    expect(screen.getByText('DesignStudio')).toBeInTheDocument();
  });

  it('filters drives by search query (companyName or role)', async () => {
    const user = userEvent.setup();
    render(<TpoDrivesPage />);

    const searchInput = screen.getByLabelText('Search drives');
    await user.type(searchInput, 'TechCorp');

    expect(screen.getByText('TechCorp')).toBeInTheDocument();
    expect(screen.queryByText('DesignStudio')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'UX Designer');

    expect(screen.queryByText('TechCorp')).not.toBeInTheDocument();
    expect(screen.getByText('DesignStudio')).toBeInTheDocument();
  });

  it('displays empty state when no drives match search criteria', async () => {
    const user = userEvent.setup();
    render(<TpoDrivesPage />);

    const searchInput = screen.getByLabelText('Search drives');
    await user.type(searchInput, 'NonExistentCompany');

    expect(screen.getByText('No drives found')).toBeInTheDocument();
    
    // Clear search using the action button
    const clearButton = screen.getByRole('button', { name: 'Clear Search' });
    await user.click(clearButton);

    expect(screen.getByText('TechCorp')).toBeInTheDocument();
    expect(screen.getByText('DesignStudio')).toBeInTheDocument();
  });
});
