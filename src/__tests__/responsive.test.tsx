import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: { data: { data: [], total: 0 } } }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn(() => ({
    user: { _id: '1', firstName: 'Test', lastName: 'User', email: 'test@test.com', roleId: 'admin', status: 'active' },
    isAuthenticated: true,
  })),
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

import { AdminLayout } from '@/components/layout/admin-layout';
import { TpoLayout } from '@/components/layout/tpo-layout';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe('Responsive UI Tests', () => {

  describe('AdminLayout Responsive Structures', () => {
    it('renders desktop sidebar with lg:block class', () => {
      const { container } = render(
        <Providers>
          <AdminLayout><div>Content</div></AdminLayout>
        </Providers>
      );
      
      const asides = container.querySelectorAll('aside');
      expect(asides.length).toBeGreaterThan(0);
      
      // Ensure one aside has the desktop visibility classes
      const desktopAside = Array.from(asides).find(aside => aside.className.includes('lg:block') && aside.className.includes('hidden'));
      expect(desktopAside).toBeDefined();
    });

    it('renders mobile menu button with lg:hidden class', () => {
      render(
        <Providers>
          <AdminLayout><div>Content</div></AdminLayout>
        </Providers>
      );
      
      const buttons = screen.getAllByRole('button');
      // Look for the mobile hamburger menu which typically has lg:hidden
      const mobileBtn = Array.from(buttons).find(btn => btn.className.includes('lg:hidden'));
      expect(mobileBtn).toBeDefined();
    });

    it('renders search bar with sm:flex hidden class', () => {
      const { container } = render(
        <Providers>
          <AdminLayout><div>Content</div></AdminLayout>
        </Providers>
      );
      
      // Look for the global search wrapper which typically has 'hidden sm:flex'
      const searchInput = screen.getByPlaceholderText(/Search anything/i);
      const searchWrapper = searchInput.parentElement;
      
      expect(searchWrapper?.className).toContain('hidden sm:flex');
    });
  });

  describe('TpoLayout Responsive Structures', () => {
    it('renders desktop sidebar with lg:block class', () => {
      const { container } = render(
        <Providers>
          <TpoLayout><div>Content</div></TpoLayout>
        </Providers>
      );
      
      const asides = container.querySelectorAll('aside');
      expect(asides.length).toBeGreaterThan(0);
      
      const desktopAside = Array.from(asides).find(aside => aside.className.includes('lg:block') && aside.className.includes('hidden'));
      expect(desktopAside).toBeDefined();
    });
  });

});
