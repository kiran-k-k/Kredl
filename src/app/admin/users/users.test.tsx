import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminUsersPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  }
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/admin/users',
}));

// Mock window.confirm
const originalConfirm = window.confirm;

describe('Admin Users Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  const setupMockUsers = (count = 2) => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        users: Array.from({ length: count }).map((_, i) => ({
          _id: `user-${i}`,
          firstName: `User${i}`,
          lastName: 'Test',
          email: `user${i}@test.com`,
          roleId: { name: 'Student' },
          createdAt: '2026-07-01T00:00:00.000Z',
          status: 'ACTIVE'
        })),
        total: count,
        totalPages: 1
      }
    });
  };

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<AdminUsersPage />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders the users table with data', async () => {
    setupMockUsers(2);
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('User0 Test')).toBeInTheDocument();
      expect(screen.getByText('User1 Test')).toBeInTheDocument();
    });

    expect(screen.getByText('user0@test.com')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    setupMockUsers(2);
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    const searchInput = screen.getByPlaceholderText('Search users by name or email...');
    await user.type(searchInput, 'User0');

    // It should trigger another api call with search param
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users', expect.objectContaining({
        params: expect.objectContaining({ search: 'User0' })
      }));
    });
  });

  it('handles empty state', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { users: [], total: 0, totalPages: 1 }
    });
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });

  it('handles single user deletion', async () => {
    setupMockUsers(1);
    (api.delete as jest.Mock).mockResolvedValue({});
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('User0 Test')).toBeInTheDocument();
    });

    // Find the row for User0
    const row = screen.getByText('User0 Test').closest('tr');
    // Inside the row, find all buttons and the delete one is the last one
    const rowButtons = row!.querySelectorAll('button');
    const deleteButton = rowButtons[rowButtons.length - 1];
    
    await user.click(deleteButton);
    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledWith('/admin/users/user-0');
  });

  it('handles bulk selection and deletion', async () => {
    setupMockUsers(2);
    (api.delete as jest.Mock).mockResolvedValue({});
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('User0 Test')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // First is select all, followed by row checkboxes
    await user.click(checkboxes[0]); // Select all

    expect(screen.getByText('2 users selected')).toBeInTheDocument();

    const bulkDeleteBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(bulkDeleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledTimes(2);
    expect(api.delete).toHaveBeenCalledWith('/admin/users/user-0');
    expect(api.delete).toHaveBeenCalledWith('/admin/users/user-1');
  });

  it('handles pagination', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        users: [{ _id: '1', firstName: 'A', lastName: 'B', email: 'a@b.com' }],
        total: 20,
        totalPages: 2
      }
    });
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 10 of 20 entries')).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /next/i });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/users', expect.objectContaining({
        params: expect.objectContaining({ page: 2 })
      }));
    });
  });
});
