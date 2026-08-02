import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './sidebar';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS, BOTTOM_SIDEBAR_ITEMS } from '@/config/navigation';

// Mock useAuthStore
const mockLogout = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) => {
    // If the component selects state.logout, return mockLogout
    return mockLogout;
  },
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the logo and brand name', () => {
    render(<Sidebar />);
    expect(screen.getByAltText('Kredl Logo')).toBeInTheDocument();
    expect(screen.getByText('Kredl')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(<Sidebar />);
    
    // Check main items
    SIDEBAR_ITEMS.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      // Ensure it renders as a link
      const link = screen.getByRole('link', { name: new RegExp(item.name, 'i') });
      expect(link).toHaveAttribute('href', item.href);
    });

    // Check bottom items
    BOTTOM_SIDEBAR_ITEMS.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      const link = screen.getByRole('link', { name: new RegExp(item.name, 'i') });
      expect(link).toHaveAttribute('href', item.href);
    });
  });

  it('should highlight the active navigation item', () => {
    // Mock pathname to be '/dashboard/courses' (My Courses)
    (usePathname as jest.Mock).mockReturnValue('/dashboard/courses');
    
    render(<Sidebar />);
    
    const activeLink = screen.getByRole('link', { name: /my courses/i });
    expect(activeLink).toHaveClass('bg-primary');
    
    const inactiveLink = screen.getByRole('link', { name: /dashboard/i }); // '/dashboard'
    expect(inactiveLink).not.toHaveClass('bg-primary');
  });

  it('should call logout function and redirect on logout click', async () => {
    // Suppress JSDOM navigation error
    const originalConsoleError = console.error;
    const consoleError = jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string' && msg.includes('Not implemented: navigation')) return;
      originalConsoleError(msg);
    });

    const user = userEvent.setup();
    render(<Sidebar />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });

  it('should call onNavigate prop when an item is clicked', async () => {
    const user = userEvent.setup();
    const handleNavigate = jest.fn();
    render(<Sidebar onNavigate={handleNavigate} />);
    
    const firstLink = screen.getByRole('link', { name: new RegExp(SIDEBAR_ITEMS[0].name, 'i') });
    await user.click(firstLink);
    
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});
