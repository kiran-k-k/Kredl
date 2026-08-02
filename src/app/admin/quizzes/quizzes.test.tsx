import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminQuizzesPage from './page';
import { getAdminQuizzes, deleteQuiz, publishQuiz, unpublishQuiz } from '@/services/quiz.api';

jest.mock('@/services/quiz.api', () => ({
  getAdminQuizzes: jest.fn(),
  deleteQuiz: jest.fn(),
  publishQuiz: jest.fn(),
  unpublishQuiz: jest.fn(),
}));

// Mock ResizeObserver for Dialog
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();

describe('Admin Quizzes Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminQuizzesPage />
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    (getAdminQuizzes as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderComponent();
    // Assuming there are Skeleton elements rendered
  });

  it('renders quizzes correctly', async () => {
    (getAdminQuizzes as jest.Mock).mockResolvedValue([
      { _id: '1', title: 'Test Quiz 1', description: 'Test', passingScore: 50, duration: 30, questions: [], isActive: true },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Quiz 1')).toBeInTheDocument();
    });
  });

  it('shows empty state when no quizzes', async () => {
    (getAdminQuizzes as jest.Mock).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No quizzes/i)).toBeInTheDocument();
    });
  });
});
