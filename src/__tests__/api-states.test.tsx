import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import MockAdapter from 'axios-mock-adapter';

describe('Global API State & Interceptor Validation', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    useAuthStore.setState({ accessToken: 'mock-token', isAuthenticated: true });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
    jest.restoreAllMocks();
  });

  it('Network Error (Offline)', async () => {
    mock.onGet('/test-offline').networkError();
    await expect(api.get('/test-offline')).rejects.toThrow('Network Error');
  });

  it('Unauthorized (401) triggers logout and redirect', async () => {
    mock.onGet('/test-401').reply(401, { message: 'Unauthorized' });

    try {
      await api.get('/test-401');
    } catch (e) {
      // expected
    }

    // After a 401, the interceptor should clear the token and redirect to login
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('Forbidden (403) throws appropriate error', async () => {
    mock.onGet('/test-403').reply(403, { message: 'Forbidden access' });

    await expect(api.get('/test-403')).rejects.toThrow();
  });
});
