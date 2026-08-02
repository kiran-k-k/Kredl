import '@testing-library/jest-dom';

// Mock matchMedia for window since jsdom doesn't support it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Next.js router
jest.mock('next/navigation', () => {
  const originalModule = jest.requireActual('next/navigation');
  return {
    __esModule: true,
    ...originalModule,
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })),
    usePathname: jest.fn(() => ''),
    useSearchParams: jest.fn(() => new URLSearchParams()),
  };
});
