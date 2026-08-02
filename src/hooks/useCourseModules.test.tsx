import { renderHook, waitFor } from '@testing-library/react';
import { useCourseModules } from './useCourseModules';
import { getCourseModules } from '@/services/course.api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API call
jest.mock('@/services/course.api', () => ({
  getCourseModules: jest.fn(),
}));

describe('useCourseModules Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Turn off retries to make testing errors faster
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches modules successfully', async () => {
    const mockData = [{ id: 'm1', title: 'Module 1' }];
    (getCourseModules as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCourseModules('course-1'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(getCourseModules).toHaveBeenCalledWith('course-1');
  });

  it('handles error state correctly', async () => {
    const error = new Error('Failed to fetch modules');
    (getCourseModules as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useCourseModules('course-2'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('does not fetch if courseIdOrSlug is empty', () => {
    renderHook(() => useCourseModules(''), { wrapper });

    expect(getCourseModules).not.toHaveBeenCalled();
  });
});
