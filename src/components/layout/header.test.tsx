import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './header';

// Mock the ThemeToggle since we just want to ensure it renders in the header
jest.mock('./theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

// Mock the MobileNav
jest.mock('./mobile-nav', () => ({
  MobileNav: () => <button data-testid="mobile-nav">Mobile Nav</button>,
}));

// Mock useAuthStore
const mockUseAuthStore = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the logo and brand name', () => {
    mockUseAuthStore.mockImplementation(() => ({ user: null }));
    render(<Header />);
    
    expect(screen.getByAltText('Kredl Logo')).toBeInTheDocument();
    expect(screen.getByText('Kredl')).toBeInTheDocument();
  });

  it('should render desktop and mobile search bars', () => {
    mockUseAuthStore.mockImplementation(() => ({ user: null }));
    render(<Header />);
    
    // There are two search inputs (one hidden on desktop, one hidden on mobile)
    const searchInputs = screen.getAllByPlaceholderText(/Search/i);
    expect(searchInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should render ThemeToggle and MobileNav', () => {
    mockUseAuthStore.mockImplementation(() => ({ user: null }));
    render(<Header />);
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('should render fallback avatar when no user is logged in', () => {
    mockUseAuthStore.mockImplementation(() => ({ user: null }));
    render(<Header />);
    
    // AvatarFallback renders "KR" by default
    expect(screen.getByText('KR')).toBeInTheDocument();
  });

  it('should render user initials when user is logged in', () => {
    mockUseAuthStore.mockImplementation(() => ({
      user: { firstName: 'John', lastName: 'Doe' },
    }));
    render(<Header />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render the notifications button', () => {
    mockUseAuthStore.mockImplementation(() => ({ user: null }));
    render(<Header />);
    
    // Notification button has the Bell icon. Let's find it by role or class if needed.
    // It's a button. Wait, we have the ThemeToggle and MobileNav mocked, so there's only 1 real button left: the bell.
    const buttons = screen.getAllByRole('button');
    // Notification button is the one without test id
    const bellButton = buttons.find(b => !b.hasAttribute('data-testid'));
    expect(bellButton).toBeInTheDocument();
  });
});
