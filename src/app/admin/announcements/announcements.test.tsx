import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminAnnouncementsPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock ResizeObserver for Dialog
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

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

describe('Admin Announcements Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminAnnouncementsPage />
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderComponent();
    // Assuming there are Skeleton elements rendered
  });

  it('renders announcements correctly', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: [
          { _id: '1', title: 'Test Announcement 1', targetAudience: 'All', createdAt: new Date().toISOString() },
        ],
        meta: { total: 1, page: 1, lastPage: 1 }
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Announcement 1')).toBeInTheDocument();
    });
  });

  it('shows empty state when no announcements', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 }
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No announcements/i)).toBeInTheDocument();
    });
  });
});
