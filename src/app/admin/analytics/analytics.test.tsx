import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminAnalyticsPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
  }
}));

// Mock ResizeObserver for Dialog
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe('Admin Analytics Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/analytics/quizzes') {
        return Promise.resolve({
          data: {
            data: [
              {
                quizId: 'quiz-1',
                quizName: 'React Basics',
                moduleName: 'Module 1',
                courseName: 'React Course',
                totalAttempts: 100,
                avgScore: 8.5,
                avgPercentage: 85,
                highestScore: 10,
                lowestScore: 2,
                passCount: 90,
                failCount: 10,
                passRate: 90,
                failRate: 10,
              }
            ]
          }
        });
      }
      if (url === '/admin/analytics/questions') {
        return Promise.resolve({
          data: {
            data: [
              {
                questionId: 'q-1',
                incorrectCount: 20,
                totalCount: 50,
                incorrectPercentage: 40,
                quizTitle: 'React Basics',
                moduleTitle: 'Module 1',
                questionText: 'What is JSX?',
                correctAnswer: 'A syntax extension',
              }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders quizzes analytics correctly', async () => {
    renderWithProviders(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('React Course')).toBeInTheDocument();
    });

    expect(screen.getByText('100')).toBeInTheDocument(); // totalAttempts
  });

  it('switches to questions tab and renders correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });

    const questionsTab = screen.getByRole('button', { name: /most missed questions/i });
    await user.click(questionsTab);

    await waitFor(() => {
      expect(screen.getByText('What is JSX?')).toBeInTheDocument();
      expect(screen.getByText('A syntax extension')).toBeInTheDocument();
    });
  });

  it('filters quizzes based on search query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search quizzes...');
    await user.type(searchInput, 'NonExistentQuiz123');

    await waitFor(() => {
      expect(screen.getByText('No Quizzes Found')).toBeInTheDocument();
    });
  });
});
