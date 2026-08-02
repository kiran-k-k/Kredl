import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDashboard } from './useDashboard';
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

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns student dashboard data on success', async () => {
    const mockData = {
      profile: { id: '1', name: 'Student', email: 's@test.com', role: 'student', joinedAt: '2025-01-01' },
      continueLearning: null,
      recommendedCourses: [],
      progress: {
        coursesEnrolled: 3,
        coursesCompleted: 1,
        modulesCompleted: 10,
        lessonsCompleted: 50,
        overallProgress: 33,
        learningStreak: 5,
        hoursLearned: 12,
      },
      recentActivity: [],
      notifications: [],
      generatedAt: '2025-01-01T00:00:00.000Z',
    };

    (api.get as jest.Mock).mockResolvedValueOnce({ data: { data: mockData } });

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(api.get).toHaveBeenCalledWith('/dashboard');
  });

  it('returns error on failure', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('starts in loading state', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
