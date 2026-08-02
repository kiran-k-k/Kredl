import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// We need to import the store AFTER mocking api
import { useAuthStore } from '@/store/auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
    });
  });

  describe('initial state', () => {
    it('starts with null user and unauthenticated', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('login', () => {
    it('sets access token and fetches user on successful login', async () => {
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        _id: 'user-1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        roleId: 'student',
        status: 'active',
      };

      (api.post as jest.Mock).mockResolvedValueOnce({
        data: { data: { accessToken: mockToken } },
      });
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: { data: mockUser },
      });

      await useAuthStore.getState().login({ email: 'test@test.com', password: 'pass' });

      const state = useAuthStore.getState();
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass' });
      expect(state.accessToken).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('does not fetch user if no token is returned', async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({
        data: {},
      });

      await useAuthStore.getState().login({ email: 'test@test.com', password: 'wrong' });

      expect(api.get).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('calls the register API endpoint', async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({ data: {} });

      await useAuthStore.getState().register({ email: 'new@test.com', password: 'pass', firstName: 'New', lastName: 'User' });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@test.com',
        password: 'pass',
        firstName: 'New',
        lastName: 'User',
      });
    });
  });

  describe('fetchUser', () => {
    it('sets user and authenticated on success', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        roleId: 'student',
        status: 'active',
      };

      (api.get as jest.Mock).mockResolvedValueOnce({
        data: { data: mockUser },
      });

      await useAuthStore.getState().fetchUser();

      const state = useAuthStore.getState();
      expect(api.get).toHaveBeenCalledWith('/users/me');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('clears state on fetch failure (e.g. expired token)', async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().fetchUser();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears user state and calls logout API', async () => {
      // Set up authenticated state first
      useAuthStore.setState({
        user: { _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', roleId: 'admin', status: 'active' },
        accessToken: 'token',
        isAuthenticated: true,
      });

      (api.post as jest.Mock).mockResolvedValueOnce({ data: {} });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('clears state even if logout API fails', async () => {
      useAuthStore.setState({
        user: { _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', roleId: 'admin', status: 'active' },
        accessToken: 'token',
        isAuthenticated: true,
      });

      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setUnauthenticated', () => {
    it('resets to unauthenticated state', () => {
      useAuthStore.setState({
        user: { _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', roleId: 'admin', status: 'active' },
        accessToken: 'token',
        isAuthenticated: true,
        isLoading: true,
      });

      useAuthStore.getState().setUnauthenticated();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setAccessToken', () => {
    it('sets the access token', () => {
      useAuthStore.getState().setAccessToken('new-token');
      expect(useAuthStore.getState().accessToken).toBe('new-token');
    });

    it('can clear the access token', () => {
      useAuthStore.getState().setAccessToken('token');
      useAuthStore.getState().setAccessToken(null);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
