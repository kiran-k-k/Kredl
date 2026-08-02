import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TpoDashboardPage from './page';
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
  usePathname: () => '/tpo',
}));

describe('TPO Dashboard', () => {
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
          totalStudents: 1200,
          placedStudents: 450,
          placementRate: '37.5%',
          activeDrives: 5,
        },
        recentActivity: [
          { id: '1', type: 'drive', title: 'Drive Created', description: 'Google Off-Campus', timestamp: '2 hours ago' },
          { id: '2', type: 'student', title: 'Student Placed', description: 'John Doe at Microsoft', timestamp: '5 hours ago' }
        ]
      }
    });
  };

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<TpoDashboardPage />);
    
    // Overview heading should always render
    expect(screen.getByRole('heading', { name: 'TPO Dashboard' })).toBeInTheDocument();
    
    // Action buttons render instantly
    expect(screen.getByRole('button', { name: /add announcement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create drive/i })).toBeInTheDocument();
  });

  it('renders stats and recent activity correctly', async () => {
    setupMockSuccess();
    renderWithProviders(<TpoDashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('1,200')).toBeInTheDocument();
    });

    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('37.5%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Recent activity
    expect(screen.getByText('Drive Created')).toBeInTheDocument();
    expect(screen.getByText('Student Placed')).toBeInTheDocument();
  });

  it('renders empty recent activity', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        stats: { totalStudents: 0, placedStudents: 0, placementRate: '0%', activeDrives: 0 },
        recentActivity: []
      }
    });

    renderWithProviders(<TpoDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No recent activity found.')).toBeInTheDocument();
    });
  });

  it('renders error state and handles retry', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    renderWithProviders(<TpoDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data. Some information may be unavailable.')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Retry should trigger another API call
    setupMockSuccess();
    await user.click(retryBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Failed to load dashboard data. Some information may be unavailable.')).not.toBeInTheDocument();
    });
  });
});
