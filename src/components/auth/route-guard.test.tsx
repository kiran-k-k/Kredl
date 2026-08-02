import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouteGuard } from './route-guard';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Mock Next.js routing
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(),
}));

// Mock useAuthStore
const mockFetchUser = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

describe('RouteGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user if not initialized', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      fetchUser: mockFetchUser,
    });
    (usePathname as jest.Mock).mockReturnValue('/');

    render(<RouteGuard><div>Content</div></RouteGuard>);
    expect(mockFetchUser).toHaveBeenCalled();
    expect(screen.getByText('Verifying session...')).toBeInTheDocument();
  });

  it('should render children if authenticated and initialized', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { roleId: 'student' },
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      fetchUser: mockFetchUser,
    });
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<RouteGuard><div>Content</div></RouteGuard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should redirect unauthenticated users away from /dashboard', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      fetchUser: mockFetchUser,
    });
    (usePathname as jest.Mock).mockReturnValue('/dashboard/profile');

    render(<RouteGuard><div>Content</div></RouteGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/login?redirect=%2Fdashboard%2Fprofile');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should not redirect unauthenticated users on public routes', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      fetchUser: mockFetchUser,
    });
    (usePathname as jest.Mock).mockReturnValue('/about');

    render(<RouteGuard><div>Public Content</div></RouteGuard>);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should redirect authenticated users if they do not have allowedRoles', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { roleId: 'student' },
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      fetchUser: mockFetchUser,
    });
    (usePathname as jest.Mock).mockReturnValue('/admin');

    render(<RouteGuard allowedRoles={['admin', 'tpo']}><div>Admin Content</div></RouteGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/unauthorized');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render children if authenticated user has allowedRoles', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { roleId: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      fetchUser: mockFetchUser,
    });
    (usePathname as jest.Mock).mockReturnValue('/admin');

    render(<RouteGuard allowedRoles={['admin']}><div>Admin Content</div></RouteGuard>);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
