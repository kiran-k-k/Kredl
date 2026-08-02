import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// ─── Imports (after mocks) ───────────────────────────────────────────────────
import { RouteGuard } from '@/components/auth/route-guard';
import { usePathname } from 'next/navigation';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

// ─── Helper to mock auth state ──────────────────────────────────────────────
function mockAuth(overrides: Partial<{
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  fetchUser: jest.Mock;
}>) {
  (useAuthStore as unknown as jest.Mock).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: true,
    fetchUser: jest.fn(),
    ...overrides,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RBAC Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  // ── Authentication Gating ─────────────────────────────────────────────────

  describe('Authentication Gating', () => {
    it('shows loading spinner while auth is initializing', () => {
      mockAuth({ isLoading: true, isInitialized: false });

      render(<RouteGuard><div>Protected</div></RouteGuard>);

      expect(screen.getByText('Verifying session...')).toBeInTheDocument();
      expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    });

    it('redirects unauthenticated user from /dashboard to /login', () => {
      (usePathname as jest.Mock).mockReturnValue('/dashboard');
      mockAuth({ isAuthenticated: false });

      render(<RouteGuard><div>Protected</div></RouteGuard>);

      expect(mockReplace).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
    });

    it('renders content for authenticated user', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '1', roleId: 'student', email: 'a@b.com', firstName: 'A', lastName: 'B', status: 'active' },
      });

      render(<RouteGuard><div>Protected Content</div></RouteGuard>);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  // ── Role-Based Access ─────────────────────────────────────────────────────

  describe('Role-Based Access Control', () => {
    it('allows admin to access admin-only routes', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '1', roleId: 'admin', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', status: 'active' },
      });

      render(
        <RouteGuard allowedRoles={['admin']}>
          <div>Admin Dashboard</div>
        </RouteGuard>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('redirects student away from admin-only routes', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '2', roleId: 'student', email: 'student@test.com', firstName: 'Student', lastName: 'User', status: 'active' },
      });

      render(
        <RouteGuard allowedRoles={['admin']}>
          <div>Admin Dashboard</div>
        </RouteGuard>
      );

      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith('/unauthorized');
    });

    it('allows TPO to access TPO-only routes', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '3', roleId: 'tpo', email: 'tpo@test.com', firstName: 'TPO', lastName: 'User', status: 'active' },
      });

      render(
        <RouteGuard allowedRoles={['tpo']}>
          <div>TPO Dashboard</div>
        </RouteGuard>
      );

      expect(screen.getByText('TPO Dashboard')).toBeInTheDocument();
    });

    it('redirects TPO away from admin-only routes', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '3', roleId: 'tpo', email: 'tpo@test.com', firstName: 'TPO', lastName: 'User', status: 'active' },
      });

      render(
        <RouteGuard allowedRoles={['admin']}>
          <div>Admin Only</div>
        </RouteGuard>
      );

      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith('/unauthorized');
    });

    it('allows access when user role is in the allowed roles list (multi-role)', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '3', roleId: 'tpo', email: 'tpo@test.com', firstName: 'TPO', lastName: 'User', status: 'active' },
      });

      render(
        <RouteGuard allowedRoles={['admin', 'tpo']}>
          <div>Admin or TPO Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Admin or TPO Content')).toBeInTheDocument();
    });

    it('renders content when no allowedRoles specified (public authenticated)', () => {
      mockAuth({
        isAuthenticated: true,
        user: { _id: '1', roleId: 'student', email: 'a@b.com', firstName: 'A', lastName: 'B', status: 'active' },
      });

      render(
        <RouteGuard>
          <div>Any Authenticated User</div>
        </RouteGuard>
      );

      expect(screen.getByText('Any Authenticated User')).toBeInTheDocument();
    });
  });

  // ── Layout Integration ────────────────────────────────────────────────────

  describe('Layout Integration', () => {
    it('DashboardLayout wraps children in RouteGuard', () => {
      // DashboardLayout uses RouteGuard without allowedRoles
      mockAuth({
        isAuthenticated: true,
        user: { _id: '1', roleId: 'student', email: 'a@b.com', firstName: 'A', lastName: 'B', status: 'active' },
      });

      const { DashboardLayout } = require('@/components/layout/dashboard-layout');

      render(
        <Providers>
          <DashboardLayout>
            <div>Student Dashboard</div>
          </DashboardLayout>
        </Providers>
      );

      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    it('DashboardLayout blocks unauthenticated access', () => {
      (usePathname as jest.Mock).mockReturnValue('/dashboard');
      mockAuth({ isAuthenticated: false });

      const { DashboardLayout } = require('@/components/layout/dashboard-layout');

      render(
        <Providers>
          <DashboardLayout>
            <div>Student Dashboard</div>
          </DashboardLayout>
        </Providers>
      );

      expect(screen.queryByText('Student Dashboard')).not.toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
    });
  });
});
