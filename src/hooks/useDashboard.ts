import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    college?: string;
    department?: string;
    joinedAt: string;
  };
  continueLearning: any | null;
  recommendedCourses: any[];
  progress: {
    coursesEnrolled: number;
    coursesCompleted: number;
    modulesCompleted: number;
    lessonsCompleted: number;
    overallProgress: number;
    learningStreak: number;
    hoursLearned: number;
    activeProject?: string;
    estimatedCompletion?: string;
  };
  recentActivity: Array<{
    activityId: string;
    activityType: string;
    title: string;
    description: string;
    courseId?: string;
    courseTitle?: string;
    moduleId?: string;
    lessonId?: string;
    timestamp: string;
    metadata?: any;
  }>;
  notifications: any[];
  generatedAt: string;
}

export function useDashboard() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      // Axios wrapped inside the TransformInterceptor
      // response.data is { success: true, data: DashboardResponseDto }
      return response.data?.data || response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
