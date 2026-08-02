import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';

jest.mock('axios', () => {
  const mockAxios: any = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
  };
  return mockAxios;
});

describe('API Interceptors', () => {
  beforeEach(() => {
    // Only clear the HTTP methods, don't clear interceptor registrations!
    (axios.post as jest.Mock).mockClear();
    (axios.get as jest.Mock).mockClear();
    useAuthStore.setState({ accessToken: null, isAuthenticated: false });
  });

  it('adds Authorization header if token exists', () => {
    useAuthStore.setState({ accessToken: 'mock-token', isAuthenticated: true });
    
    // Get the registered request interceptor
    const requestInterceptor = (api.interceptors.request.use as jest.Mock).mock.calls[0][0];
    
    const config = { headers: {} as any };
    const result = requestInterceptor(config);
    
    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });

  it('dispatches auth:unauthorized event when refresh fails on 401', async () => {
    // Get the registered response error interceptor
    const responseErrorInterceptor = (api.interceptors.response.use as jest.Mock).mock.calls[0][1];
    
    // Mock the refresh endpoint to fail
    (axios.post as jest.Mock).mockRejectedValue(new Error('Refresh Failed'));
    
    const errorEvent = jest.fn();
    window.addEventListener('auth:unauthorized', errorEvent);

    const error = {
      response: { status: 401 },
      config: { url: '/some-endpoint' }
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      expect(e).toBeDefined();
    }

    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/refresh'), {}, expect.any(Object));
    expect(errorEvent).toHaveBeenCalled();
    
    window.removeEventListener('auth:unauthorized', errorEvent);
  });
});
