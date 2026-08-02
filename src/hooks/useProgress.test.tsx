import { renderHook, waitFor } from '@testing-library/react';
import { useCourseProgress, useMarkLessonComplete, useDashboardProgress } from './useProgress';
import { getCourseProgress, markLessonComplete, getDashboardProgress } from '@/services/progress.api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API calls
jest.mock('@/services/progress.api', () => ({
  getCourseProgress: jest.fn(),
  getDashboardProgress: jest.fn(),
  markLessonComplete: jest.fn(),
}));

describe('useProgress Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useCourseProgress', () => {
    it('fetches course progress successfully', async () => {
      const mockData = { completedLessons: 2, totalLessons: 10 };
      (getCourseProgress as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useCourseProgress('course-1'), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(getCourseProgress).toHaveBeenCalledWith('course-1');
    });

    it('is disabled when courseId is missing', () => {
      renderHook(() => useCourseProgress(''), { wrapper });
      expect(getCourseProgress).not.toHaveBeenCalled();
    });
  });

  describe('useDashboardProgress', () => {
    it('fetches dashboard progress', async () => {
      const mockData = { courses: [] };
      (getDashboardProgress as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardProgress(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useMarkLessonComplete', () => {
    it('mutates successfully and invalidates queries', async () => {
      (markLessonComplete as jest.Mock).mockResolvedValue({ success: true });
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useMarkLessonComplete(), { wrapper });

      result.current.mutate({ lessonId: 'lesson-1', courseId: 'course-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(markLessonComplete).toHaveBeenCalledWith('lesson-1', 'course-1');
      
      // Should invalidate related queries on success
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['lesson-details'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['course-progress'] });
    });
  });
});
