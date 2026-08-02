import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminLayout } from './admin-layout';
import { usePathname } from 'next/navigation';

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin');
    render(
      <AdminLayout>
        <div data-testid="admin-child">Admin Child</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('admin-child')).toBeInTheDocument();
  });

  it('should render the admin sidebar and header', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin');
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    // Kredl Admin branding
    expect(screen.getByText('Kredl Admin')).toBeInTheDocument();
    
    // Sidebar navigation items
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /modules/i })).toBeInTheDocument();

    // Global Search input
    expect(screen.getByPlaceholderText(/search anything/i)).toBeInTheDocument();
    
    // Admin user profile in sidebar
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('should highlight active navigation items correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin/users');
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const usersLink = screen.getByRole('link', { name: /users/i });
    expect(usersLink).toHaveClass('bg-primary/10');
    expect(usersLink).toHaveClass('text-primary');

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveClass('bg-primary/10');
  });
});
