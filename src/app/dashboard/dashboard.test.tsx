import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './page';

// Mock dependencies
jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/hooks/useDashboard', () => ({
  useDashboard: jest.fn(),
}));

jest.mock('@/hooks/useProgress', () => ({
  useDashboardProgress: jest.fn(),
  useContinueLearningData: jest.fn(() => ({ data: null, isLoading: false, isError: false })),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

import { useAuthStore } from '@/store/auth.store';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardProgress } from '@/hooks/useProgress';

describe('Student Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a loading state when data is loading', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { firstName: 'Alice', roleId: 'student' },
    });
    (useDashboard as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
    });
    (useDashboardProgress as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
    });

    const { container } = render(<DashboardPage />);
    // Testing for loading spinner
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders an error state when there is an error fetching dashboard data', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { firstName: 'Alice', roleId: 'student' },
    });
    (useDashboard as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });
    (useDashboardProgress as jest.Mock).mockReturnValue({
      isLoading: false,
      data: null,
    });

    render(<DashboardPage />);
    expect(screen.getByText(/Failed to load your dashboard/i)).toBeInTheDocument();
  });

  it('renders the dashboard with progress metrics and recent activity', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { firstName: 'Alice', roleId: 'student' },
    });
    
    (useDashboard as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        profile: { role: 'Student' },
        progress: {
          learningStreak: 5,
          overallProgress: 42,
          modulesCompleted: 3,
          coursesCompleted: 1,
        },
        recentActivity: [
          { activityId: '1', title: 'Completed Lesson: Intro to React', description: '2 hours ago' },
        ],
        continueLearning: {
          moduleTitle: 'Advanced React',
          nextLesson: { title: 'Hooks deep dive' },
        },
      },
    });

    (useDashboardProgress as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [
        {
          id: 'course-1',
          title: 'Frontend Engineering',
          instructor: 'John Doe',
          thumbnail: '/test.png',
          progress: 42,
        },
      ],
    });

    render(<DashboardPage />);

    // Welcome Section
    expect(screen.getByText('Welcome back, Alice!')).toBeInTheDocument();
    expect(screen.getByText('5 Day Learning Streak')).toBeInTheDocument();

    // Career Progression Metrics
    expect(screen.getAllByText('42%').length).toBeGreaterThan(0);
    expect(screen.getByText('3')).toBeInTheDocument(); // Modules completed
    expect(screen.getByText('1')).toBeInTheDocument(); // Courses completed

    // Enrolled Courses
    expect(screen.getByText('My Enrolled Courses')).toBeInTheDocument();
    expect(screen.getByText('Frontend Engineering')).toBeInTheDocument();

    // Recent Activity
    expect(screen.getByText('Completed Lesson: Intro to React')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('opens and closes the Career Readiness modal', async () => {
    const user = userEvent.setup();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { firstName: 'Alice' },
    });
    (useDashboard as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        profile: { role: 'Student' },
        progress: { overallProgress: 42, learningStreak: 5, modulesCompleted: 3, coursesCompleted: 1 },
        recentActivity: [],
      },
    });
    (useDashboardProgress as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [],
    });

    render(<DashboardPage />);

    // Open modal
    const readinessButton = screen.getByRole('button', { name: /career readiness/i });
    await user.click(readinessButton);

    expect(screen.getByText('Career Readiness Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Finish React Roadmap')).toBeInTheDocument();

    // Close modal
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[0]);

    // Modal is removed or hidden (shadcn Dialog unmounts content by default or visually hides it, usually unmounts)
    expect(screen.queryByText('Career Readiness Breakdown')).not.toBeInTheDocument();
  });
});
