'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          const status = error?.response?.status;
          if (status === 401 || status === 403 || status === 429) return false;
          return failureCount < 3;
        },
      },
    },
  }));

  const { isInitialized, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchUser().catch(() => {});
    }
  }, [isInitialized, fetchUser]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
