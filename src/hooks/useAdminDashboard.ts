import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AdminRecentActivity {
  type: string
  title: string
  description: string
  time: string
  color: string
}

export interface AdminDashboardData {
  stats: {
    users: number
    courses: number
    modules: number
    lessons: number
    notes: number
  }
  recentActivity: AdminRecentActivity[]
  system: {
    status: string
    database: string
    api: string
    environment: string
    lastChecked: string
  }
}

export function useAdminDashboard() {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/overview')
      return response.data?.data || response.data
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  })
}
