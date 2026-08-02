import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboardPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
  }
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/admin',
}));

describe('Admin Dashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  const setupMockSuccess = () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        stats: {
          users: 1500,
          courses: 25,
          modules: 120,
          lessons: 450,
          notes: 300,
        },
        recentActivity: [
          { type: 'CREATE', title: 'New Course Added', description: 'React Basics', time: '2 hours ago', color: 'bg-green-500' },
          { type: 'LOGIN', title: 'New User Registration', description: 'john@example.com', time: '5 hours ago', color: 'bg-blue-500' }
        ],
        system: {
          api: 'online',
          database: 'connected',
          environment: 'production',
          lastChecked: new Date().toISOString(),
        }
      }
    });
  };

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<AdminDashboardPage />);
    
    // Overview heading should always render
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    
    // Quick Actions render instantly
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders stats, recent activity, and system status correctly', async () => {
    setupMockSuccess();
    renderWithProviders(<AdminDashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('1,500')).toBeInTheDocument();
    });

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();

    // Recent activity
    expect(screen.getByText('New Course Added')).toBeInTheDocument();
    expect(screen.getByText('New User Registration')).toBeInTheDocument();

    // System Status
    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('connected')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('renders empty recent activity', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        stats: { users: 0, courses: 0, modules: 0, lessons: 0, notes: 0 },
        recentActivity: [],
        system: { api: 'online', database: 'connected', environment: 'production' }
      }
    });

    renderWithProviders(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No recent activity.')).toBeInTheDocument();
    });
  });

  it('renders error state and handles retry', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    renderWithProviders(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load admin dashboard data. Some information may be unavailable.')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Retry should trigger another API call
    setupMockSuccess(); // set up success for the retry
    await user.click(retryBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Failed to load admin dashboard data. Some information may be unavailable.')).not.toBeInTheDocument();
    });
  });
});
