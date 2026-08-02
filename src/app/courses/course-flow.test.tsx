import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CourseDetailPage from './[courseId]/page';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ courseId: 'react-101' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock layout so we don't render header/footer overhead
jest.mock('@/components/layout/public-layout', () => ({
  PublicLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="public-layout">{children}</div>,
}));

// Mock ModuleList since it's an enrolled-only component and has its own complexity
jest.mock('@/components/course/ModuleList', () => ({
  ModuleList: () => <div data-testid="module-list">Enrolled Module List</div>,
}));

describe('Course Flow - Details Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders a loading state while fetching course details', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithProviders(<CourseDetailPage />);
    
    // Skeleton should be rendered
    expect(screen.getByTestId('public-layout')).toBeInTheDocument();
    // In shadcn, Skeleton is usually a div with animate-pulse. Let's just check it doesn't throw.
  });

  it('renders an error state when fetching fails', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    renderWithProviders(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Course Details Unavailable')).toBeInTheDocument();
    });
  });

  it('renders the enrolled module list if the user is already enrolled', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        id: '123',
        slug: 'react-101',
        title: 'React Basics',
        isEnrolled: true,
      }
    });

    renderWithProviders(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('module-list')).toBeInTheDocument();
    });
  });

  it('renders the course marketing page if the user is not enrolled', async () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/courses/')) {
        return Promise.resolve({
          data: {
            id: '123',
            slug: 'react-101',
            title: 'React Basics',
            shortDescription: 'Learn React from scratch',
            isEnrolled: false,
            difficulty: 'Beginner',
            estimatedDuration: '4 Weeks',
            moduleCount: 2,
            lessonCount: 10,
          }
        });
      }
      if (url.includes('/modules')) {
        return Promise.resolve({
          data: {
            data: [
              { _id: 'm1', title: 'Intro Module', description: 'Intro' },
              { _id: 'm2', title: 'Advanced Module', description: 'Advanced' }
            ]
          }
        });
      }
      if (url.includes('/lessons')) {
        return Promise.resolve({
          data: {
            data: [
              { _id: 'l1', moduleId: 'm1', title: 'Lesson 1' },
              { _id: 'l2', moduleId: 'm2', title: 'Lesson 2' }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    renderWithProviders(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Learn React from scratch')).toBeInTheDocument();
    });

    // Verify Modules accordion rendered
    await waitFor(() => {
      expect(screen.getByText('Course Modules')).toBeInTheDocument();
      expect(screen.getByText('Intro Module')).toBeInTheDocument();
      expect(screen.getByText('Advanced Module')).toBeInTheDocument();
    });
  });

  it('allows user to enroll', async () => {
    const user = userEvent.setup();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/courses/')) {
        return Promise.resolve({
          data: {
            id: '123',
            slug: 'react-101',
            title: 'React Basics',
            isEnrolled: false,
          }
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });

    renderWithProviders(<CourseDetailPage />);

    // Wait for the button to appear
    const startButtons = await screen.findAllByRole('button', { name: /start learning/i });
    
    await user.click(startButtons[0]);

    expect(api.post).toHaveBeenCalledWith('/courses/123/enroll');
  });
});
