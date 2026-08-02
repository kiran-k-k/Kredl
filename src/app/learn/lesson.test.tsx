import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LessonPage from './[courseId]/[lessonId]/page';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ courseId: 'react-101', lessonId: 'l1' }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Lesson Experience Flow', () => {
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

  const setupMocks = () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/courses/')) {
        return Promise.resolve({
          data: {
            id: 'c1',
            slug: 'react-101',
            title: 'React Basics',
            completedLessons: [],
          }
        });
      }
      if (url.includes('/modules')) {
        return Promise.resolve({
          data: {
            data: [
              { id: 'm1', title: 'Intro Module', order: 1 },
              { id: 'm2', title: 'Advanced Module', order: 2 }
            ]
          }
        });
      }
      if (url.includes('/lessons')) {
        return Promise.resolve({
          data: {
            data: [
              { id: 'l1', moduleId: 'm1', title: 'Lesson 1', order: 1, youtubeUrl: 'https://youtube.com/watch?v=12345678901' },
              { id: 'l2', moduleId: 'm1', title: 'Lesson 2', order: 2 }
            ]
          }
        });
      }
      if (url.includes('/lesson-notes')) {
        return Promise.resolve({
          data: {
            data: [
              { content: 'Here are some test notes.' }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
  };

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(<LessonPage />);
    // Testing skeleton
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders lesson content, video iframe, and sidebar correctly', async () => {
    setupMocks();
    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Lesson 1' })[0]).toBeInTheDocument();
    });

    // Check iframe
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain('youtube.com/embed/12345678901');

    // Check tabs
    expect(screen.getByText('Here are some test notes.')).toBeInTheDocument();
    
    // Check Sidebar
    expect(screen.getByText('Intro Module')).toBeInTheDocument();
    expect(screen.getByText('Advanced Module')).toBeInTheDocument();
  });

  it('switches between Notes and Objectives tabs', async () => {
    setupMocks();
    const user = userEvent.setup();
    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Lesson 1' })[0]).toBeInTheDocument();
    });

    // Default is notes
    expect(screen.getByText('Here are some test notes.')).toBeInTheDocument();

    // Switch to objectives
    const objTab = screen.getByRole('button', { name: /learning objectives/i });
    await user.click(objTab);

    expect(screen.getByText('Conceptual Mastery')).toBeInTheDocument();
    expect(screen.queryByText('Here are some test notes.')).not.toBeInTheDocument();
  });

  it('completes the lesson and auto-advances to the next lesson', async () => {
    setupMocks();
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    const user = userEvent.setup();
    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Lesson 1' })[0]).toBeInTheDocument();
    });

    const markCompleteBtn = screen.getByRole('button', { name: /mark as complete/i });
    await user.click(markCompleteBtn);

    expect(api.post).toHaveBeenCalledWith('/lessons/l1/complete');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/learn/react-101/l2');
    });
  });

  it('navigates to next and previous lessons manually', async () => {
    setupMocks();
    const user = userEvent.setup();
    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Lesson 1' })[0]).toBeInTheDocument();
    });

    // Next Lesson
    const nextBtn = screen.getByRole('button', { name: /next lesson/i });
    await user.click(nextBtn);

    expect(mockPush).toHaveBeenCalledWith('/learn/react-101/l2');
  });
});
