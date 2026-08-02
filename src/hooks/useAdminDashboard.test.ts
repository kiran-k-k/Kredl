import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAdminDashboard } from './useAdminDashboard';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns dashboard data on success', async () => {
    const mockData = {
      stats: { users: 10, courses: 5, modules: 20, lessons: 100, notes: 50 },
      recentActivity: [],
      system: { status: 'ok', database: 'connected', api: 'running', environment: 'dev', lastChecked: '2025-01-01' },
    };

    (api.get as jest.Mock).mockResolvedValueOnce({ data: { data: mockData } });

    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('returns error on failure', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('starts in loading state', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
