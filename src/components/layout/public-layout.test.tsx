import React from 'react';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from './public-layout';

// Mock useAuthStore
const mockUseAuthStore = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('PublicLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children in the main content area', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    render(
      <PublicLayout>
        <div data-testid="public-child">Public Content</div>
      </PublicLayout>
    );

    expect(screen.getByTestId('public-child')).toBeInTheDocument();
  });

  it('should render public navigation links and Log in / Get Started buttons when unauthenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );

    // Nav Links (both desktop and mobile might render them, we check if they are present)
    const coursesLinks = screen.getAllByRole('link', { name: /courses/i });
    expect(coursesLinks.length).toBeGreaterThan(0);

    const loginLinks = screen.getAllByRole('link', { name: /log in/i });
    expect(loginLinks.length).toBeGreaterThan(0);

    const getStartedLinks = screen.getAllByText(/get started/i);
    expect(getStartedLinks.length).toBeGreaterThan(0);
  });

  it('should render Dashboard links and avatar when authenticated', () => {
    mockUseAuthStore.mockReturnValue({ 
      isAuthenticated: true, 
      user: { firstName: 'Jane', lastName: 'Doe', avatarUrl: '' } 
    });
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );

    // Dashboard links
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThan(0);

    // Log in should not be present
    const loginLinks = screen.queryAllByRole('link', { name: /log in/i });
    expect(loginLinks).toHaveLength(0);

    // Should render initials
    expect(screen.getAllByText('JD').length).toBeGreaterThan(0);
  });

  it('should render footer with proper links', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );

    expect(screen.getByText(/learn\. build\. prepare\. get hired\./i)).toBeInTheDocument();
    
    // Check for some footer headings
    expect(screen.getByRole('heading', { name: /platform/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /company/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /connect/i })).toBeInTheDocument();
  });
});
