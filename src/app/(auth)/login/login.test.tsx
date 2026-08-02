import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuthStore completely since the page uses multiple returns (login, getState)
const mockLogin = jest.fn();
const mockGetState = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    () => ({ login: mockLogin }),
    { getState: () => mockGetState() }
  ),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({ user: null });
  });

  it('should render all form elements', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should redirect to /admin if user is Admin', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    mockGetState.mockReturnValue({ user: { roleName: 'Admin' } });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should redirect to /tpo if user is TPO', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    mockGetState.mockReturnValue({ user: { roleName: 'TPO' } });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'tpo@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tpo');
    });
  });

  it('should redirect to /dashboard if user is student and profile is completed', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    mockGetState.mockReturnValue({ user: { roleName: 'Student', profileCompleted: true } });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should redirect to /onboarding if user is student and profile is not completed', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    mockGetState.mockReturnValue({ user: { roleName: 'Student', profileCompleted: false } });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });
});
