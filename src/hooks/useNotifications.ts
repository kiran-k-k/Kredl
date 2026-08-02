import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        return res.data?.data?.count || res.data?.count || 0;
      } catch (error) {
        return 0;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useLatestNotifications() {
  return useQuery({
    queryKey: ['notifications', 'latest'],
    queryFn: async () => {
      const res = await api.get('/notifications/latest');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 60000,
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
