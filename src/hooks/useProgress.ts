import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourseProgress,
  getDashboardProgress,
  getContinueLearning,
  markLessonComplete,
  markLessonIncomplete,
  toggleProjectCompletion,
  saveQuizScore,
  QuizSubmitPayload,
} from '@/services/progress.api';
import type { LessonDetailsResponse } from '@/types/lesson';

// ---------------------------------------------------------
// Queries
// ---------------------------------------------------------

export const useCourseProgress = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => getCourseProgress(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  });
};

export const useDashboardProgress = () => {
  return useQuery({
    queryKey: ['dashboard-progress'],
    queryFn: getDashboardProgress,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useContinueLearningData = () => {
  return useQuery({
    queryKey: ['continue-learning-progress'],
    queryFn: getContinueLearning,
    staleTime: 1000 * 60, // 1 minute
  });
};

// ---------------------------------------------------------
// Mutations
// ---------------------------------------------------------

export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, courseId }: { lessonId: string; courseId: string }) =>
      markLessonComplete(lessonId, courseId),

    // Optimistic update
    onMutate: async ({ lessonId }) => {
      await queryClient.cancelQueries({ queryKey: ['lesson-details'] });
      const previousCache = queryClient.getQueriesData<LessonDetailsResponse>({
        queryKey: ['lesson-details'],
      });

      queryClient.setQueriesData<LessonDetailsResponse>(
        { queryKey: ['lesson-details'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            lesson: { ...old.lesson, completed: true, completedAt: new Date().toISOString() },
            progress: { ...old.progress, lessonCompleted: true },
          };
        },
      );
      return { previousCache };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCache) {
        for (const [queryKey, data] of context.previousCache) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['lesson-details'] });
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['continue-learning-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useMarkLessonIncomplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, courseId }: { lessonId: string; courseId: string }) =>
      markLessonIncomplete(lessonId, courseId),

    // Optimistic update
    onMutate: async ({ lessonId }) => {
      await queryClient.cancelQueries({ queryKey: ['lesson-details'] });
      const previousCache = queryClient.getQueriesData<LessonDetailsResponse>({
        queryKey: ['lesson-details'],
      });

      queryClient.setQueriesData<LessonDetailsResponse>(
        { queryKey: ['lesson-details'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            lesson: { ...old.lesson, completed: false },
            progress: { ...old.progress, lessonCompleted: false },
          };
        },
      );
      return { previousCache };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCache) {
        for (const [queryKey, data] of context.previousCache) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['lesson-details'] });
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['continue-learning-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useToggleProjectCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, courseId }: { projectId: string; courseId: string }) =>
      toggleProjectCompletion(projectId, courseId),

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['continue-learning-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useSaveQuizScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuizSubmitPayload) => saveQuizScore(payload),

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['continue-learning-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
