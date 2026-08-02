import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import all public pages
import HomePage from './page';
import CoursesPage from './courses/page';
import CompaniesPage from './companies/page';
import JobsPage from './jobs/page';
import AboutPage from './about/page';
import ContactPage from './contact/page';
import PrivacyPage from './privacy/page';
import TermsPage from './terms/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Public Pages', () => {
  it('should render the Home page successfully', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/The Premier Career Preparation Ecosystem/i)).toBeInTheDocument();
  });

  it('should render the Courses page successfully', () => {
    renderWithProviders(<CoursesPage />);
    expect(screen.getByRole('heading', { name: /Choose Your Career Path/i })).toBeInTheDocument();
  });

  it('should render the Companies page successfully', () => {
    renderWithProviders(<CompaniesPage />);
    expect(screen.getByRole('heading', { name: /Discover Top Companies/i })).toBeInTheDocument();
  });

  it('should render the Jobs page successfully', () => {
    renderWithProviders(<JobsPage />);
    expect(screen.getByRole('heading', { name: /Find Your First Tech Job/i })).toBeInTheDocument();
  });

  it('should render the About page successfully', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByRole('heading', { name: /Bridging the gap/i })).toBeInTheDocument();
  });

  it('should render the Contact page successfully', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByRole('heading', { name: /Get in touch/i })).toBeInTheDocument();
  });

  it('should render the Privacy Policy page successfully', () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
  });

  it('should render the Terms and Conditions page successfully', () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Terms & Conditions/i })).toBeInTheDocument();
  });
});
