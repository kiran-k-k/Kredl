import { create } from 'zustand';
import { api } from '@/lib/api';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName?: string;
  avatarUrl?: string;
  profileImage?: string;
  status: string;
  profileCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUnauthenticated: () => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // The response interceptor might unwrap or not, but backend returns { success: true, data: { accessToken: "..." } }
    // By default axios returns response.data as the payload. So response.data.data.accessToken
    const token = response.data?.data?.accessToken || response.data?.accessToken;
    if (token) {
      set({ accessToken: token });
      await useAuthStore.getState().fetchUser();
    }
  },
  register: async (data) => {
    await api.post('/auth/register', data);
  },
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      // Changed from /auth/me to /users/me to get the full profile including profileCompleted
      const response = await api.get('/users/me');
      set({ 
        user: response.data?.data || response.data, 
        isAuthenticated: true, 
        isLoading: false,
        isInitialized: true 
      });
    } catch (error) {
      set({ 
        user: null, 
        accessToken: null,
        isAuthenticated: false, 
        isLoading: false,
        isInitialized: true 
      });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
  setUnauthenticated: () => {
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
  setAccessToken: (token) => {
    set({ accessToken: token });
  }
}));

// Listen to global unauthorized events from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().setUnauthenticated();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  });
}
