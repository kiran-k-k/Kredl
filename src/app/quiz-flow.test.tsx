import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizActivePage from './courses/[courseId]/module/[moduleId]/quiz/page';
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
  useParams: () => ({ courseId: 'react-101', moduleId: 'm1' }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Quiz Experience Flow', () => {
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
            title: 'React Basics',
          }
        });
      }
      if (url.includes('/modules')) {
        return Promise.resolve({
          data: {
            modules: [
              { _id: 'm1', title: 'Intro Module' }
            ]
          }
        });
      }
      if (url.includes('/quiz/m1')) {
        return Promise.resolve({
          data: {
            id: 'q1',
            title: 'React Basics Quiz',
            description: 'Test your React knowledge',
            timeLimitMinutes: 10,
            passingScorePercentage: 80,
            maxAttempts: 3,
            questions: [
              { _id: 'q1-1', questionText: 'What is JSX?', options: ['JavaScript XML', 'Java XML', 'JSON XML'] },
              { _id: 'q1-2', questionText: 'What is a component?', options: ['A function', 'A class', 'Both'] }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
  };

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<QuizActivePage />);
    expect(screen.getByText('Loading quiz details...')).toBeInTheDocument();
  });

  it('renders the quiz start page with quiz details', async () => {
    setupMocks();
    renderWithProviders(<QuizActivePage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'React Basics Quiz' })).toBeInTheDocument();
    });

    expect(screen.getByText('Test your React knowledge')).toBeInTheDocument();
    expect(screen.getByText('10 Mins')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('2 MCQs')).toBeInTheDocument();
  });

  it('allows user to start quiz, answer questions, and submit', async () => {
    setupMocks();
    (api.post as jest.Mock).mockImplementation((url) => {
      if (url.includes('/quiz/start')) {
        return Promise.resolve({ data: { attemptId: 'attempt-123' } });
      }
      if (url.includes('/quiz/submit')) {
        return Promise.resolve({ data: { attemptId: 'attempt-123' } });
      }
      return Promise.resolve({ data: {} });
    });

    const user = userEvent.setup();
    renderWithProviders(<QuizActivePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
    });

    // 1. Start Quiz
    await user.click(screen.getByRole('button', { name: /start quiz/i }));
    
    // Wait for question 1 to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'What is JSX?' })).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith('/quiz/start', { moduleId: 'm1' });

    // 2. Answer Question 1
    const option1 = screen.getByText('JavaScript XML');
    await user.click(option1);

    // 3. Go to next question
    const nextBtn = screen.getByRole('button', { name: /next/i });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'What is a component?' })).toBeInTheDocument();
    });

    // 4. Answer Question 2
    const option2 = screen.getByText('Both');
    await user.click(option2);

    // 5. Submit Quiz
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    await user.click(submitBtn);

    // 6. Confirm Modal
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to submit?/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /yes, submit/i });
    await user.click(confirmBtn);

    // 7. Verify Submit API Call
    expect(api.post).toHaveBeenCalledWith('/quiz/submit', {
      attemptId: 'attempt-123',
      answers: [
        { questionId: 'q1-1', selectedAnswerIndex: 0 },
        { questionId: 'q1-2', selectedAnswerIndex: 2 }
      ]
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/courses/react-101/module/m1/quiz/result?attemptId=attempt-123');
    });
  });

  it('renders an error state if quiz is locked', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: { status: 403 }
    });
    renderWithProviders(<QuizActivePage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Quiz Locked' })).toBeInTheDocument();
    });
  });
});
