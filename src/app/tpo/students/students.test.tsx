import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TpoStudentsPage from './page';

jest.mock('@/components/layout/tpo-layout', () => ({
  TpoLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="tpo-layout">{children}</div>,
}));

jest.mock('@/lib/tpo-data/students.mock', () => ({
  MOCK_TPO_STUDENTS: [
    {
      id: 'student-1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      branch: 'Computer Science',
      year: '2024',
      cgpa: 8.5,
      skills: ['React', 'Node.js', 'AWS'],
      placementStatus: 'Placed',
      placedCompany: 'Google'
    },
    {
      id: 'student-2',
      name: 'Bob Jones',
      email: 'bob@example.com',
      branch: 'Information Technology',
      year: '2024',
      cgpa: 7.2,
      skills: ['Python', 'Django'],
      placementStatus: 'Not Placed'
    }
  ]
}));

describe('TpoStudentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the students page with initial mock data', () => {
    render(<TpoStudentsPage />);
    
    expect(screen.getAllByText('Students').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0);
  });

  it('filters students by search query (name, email, or branch)', async () => {
    const user = userEvent.setup();
    render(<TpoStudentsPage />);

    const searchInput = screen.getByLabelText('Search students');
    
    // Search by name
    await user.type(searchInput, 'Alice');
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Bob Jones').length).toBe(0);

    await user.clear(searchInput);

    // Search by email
    await user.type(searchInput, 'bob@example.com');
    expect(screen.queryAllByText('Alice Smith').length).toBe(0);
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0);
  });

  it('displays empty state when no students match search criteria', async () => {
    const user = userEvent.setup();
    render(<TpoStudentsPage />);

    const searchInput = screen.getByLabelText('Search students');
    await user.type(searchInput, 'NonExistentStudent');

    expect(screen.getByText('No students found')).toBeInTheDocument();
    
    // Clear search using the action button
    const clearButton = screen.getByRole('button', { name: 'Clear Search' });
    await user.click(clearButton);

    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0);
  });
});
