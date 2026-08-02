import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TpoActivity {
  id: string;
  type: 'drive' | 'student' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
}

export interface TpoDashboardData {
  stats: {
    totalStudents: number;
    placedStudents: number;
    placementRate: string;
    activeDrives: number;
  };
  recentActivity: TpoActivity[];
}

export function useTpoDashboard() {
  return useQuery({
    queryKey: ['tpoDashboard'],
    queryFn: async (): Promise<TpoDashboardData> => {
      const response = await api.get('/tpo/dashboard');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every 60 seconds
  });
}
