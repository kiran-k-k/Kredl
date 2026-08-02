import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

// Mock routing
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock API
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

// We would import the actual page components here to simulate a full mount,
// but for a smoke test we will simulate the Layout and Page rendering.
import AdminDashboardPage from '@/app/admin/page';
import StudentDashboardPage from '@/app/dashboard/page';
import TpoDashboardPage from '@/app/tpo/page';
import { AdminLayout } from '@/components/layout/admin-layout';
import { TpoLayout } from '@/components/layout/tpo-layout';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

// Mock ResizeObserver for Dialog
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock PointerEvent
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();

describe('Regression Smoke Tests - Key Journeys', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    jest.setTimeout(15000);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    // Default API mocks
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: { total: 10 } });
      if (url.includes('/courses')) return Promise.resolve({ data: { data: [] } });
      if (url.includes('/users')) return Promise.resolve({ data: { data: [] } });
      if (url.includes('/dashboard') && !url.includes('tpo') && !url.includes('admin')) {
        return Promise.resolve({ 
          data: { 
            data: { 
              profile: { role: 'Student' },
              progress: { learningStreak: 5, overallProgress: 10 }, 
              recentActivity: [],
              continueLearning: null,
              recommendedCourses: [],
              notifications: []
            } 
          } 
        });
      }
      if (url.includes('/tpo/dashboard')) return Promise.resolve({ data: { stats: { totalStudents: 100 }, recentActivity: [] } });
      if (url.includes('/admin/dashboard')) return Promise.resolve({ data: { data: { stats: { users: 100 }, recentActivity: [], system: {} } } });
      return Promise.resolve({ data: {} });
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('Admin Journey: logs in, views dashboard, views courses', async () => {
    // 1. Simulate login state
    useAuthStore.setState({
      user: { _id: 'admin-1', email: 'admin@kredl.com', roleId: 'admin-role', status: 'ACTIVE', firstName: 'Admin', lastName: 'User' },
      isAuthenticated: true,
      accessToken: 'token'
    });

    // 2. Render Admin Dashboard
    renderWithProviders(
      <AdminDashboardPage />
    );

    // 3. Verify Dashboard Loads
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
      // Ensure layout elements exist
      expect(screen.getByText('Kredl Admin')).toBeInTheDocument(); 
    });

    // 4. Verify sidebar navigation has Courses
    const coursesLink = screen.getByRole('link', { name: /courses/i });
    expect(coursesLink).toBeInTheDocument();
    expect(coursesLink.getAttribute('href')).toBe('/admin/courses');
  });

  it('TPO Journey: logs in, views dashboard, views students', async () => {
    // 1. Simulate login state
    useAuthStore.setState({
      user: { _id: 'tpo-1', email: 'tpo@kredl.com', roleId: 'tpo-role', status: 'ACTIVE', firstName: 'Tpo', lastName: 'User' },
      isAuthenticated: true,
      accessToken: 'token'
    });

    // 2. Render TPO Dashboard
    renderWithProviders(
      <TpoDashboardPage />
    );

    // 3. Verify Dashboard Loads
    await waitFor(() => {
      expect(screen.getByText('TPO Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Kredl TPO')).toBeInTheDocument(); 
    });

    // 4. Verify sidebar navigation has Students
    const studentsLink = screen.getByRole('link', { name: /students/i });
    expect(studentsLink).toBeInTheDocument();
    expect(studentsLink.getAttribute('href')).toBe('/tpo/students');
  });

  it('Student Journey: logs in, views dashboard, views learning path', async () => {
    // 1. Simulate login state
    useAuthStore.setState({
      user: { _id: 'student-1', email: 'student@kredl.com', roleId: 'student-role', status: 'ACTIVE', firstName: 'Student', lastName: 'User' },
      isAuthenticated: true,
      accessToken: 'token'
    });

    // 2. Render Student Dashboard with Layout since Student doesn't include it
    renderWithProviders(
      <DashboardLayout>
        <StudentDashboardPage />
      </DashboardLayout>
    );

    // 3. Verify Dashboard Loads
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      // Using queryAllByText because 'Kredl' might appear in multiple places
      const kredlLogos = screen.queryAllByText('Kredl');
      expect(kredlLogos.length).toBeGreaterThan(0);
    });

    // 4. Verify sidebar navigation has Courses
    const coursesLink = screen.getByRole('link', { name: /my courses/i });
    expect(coursesLink).toBeInTheDocument();
    expect(coursesLink.getAttribute('href')).toBe('/dashboard/courses');
  });
});
