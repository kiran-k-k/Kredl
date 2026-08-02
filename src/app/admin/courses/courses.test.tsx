import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminCoursesPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock ResizeObserver for Dialog
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock PointerEvent
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

describe('Admin Courses Page', () => {
  beforeAll(() => {
    jest.setTimeout(15000);
  });
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/courses/stats') {
        return Promise.resolve({ data: { total: 10, published: 8, draft: 2 } });
      }
      if (url === '/admin/courses') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 'course-1',
                title: 'React Course',
                shortDescription: 'Learn React',
                description: 'Detailed description',
                category: 'Web Dev',
                difficulty: 'Beginner',
                estimatedDuration: '10h',
                isPublished: true,
                thumbnail: 'http://example.com/thumb.jpg',
              }
            ],
            totalItems: 1,
            totalPages: 1
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

  it('renders courses list and stats', async () => {
    renderWithProviders(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Course')).toBeInTheDocument();
      expect(screen.getByText('Total Courses')).toBeInTheDocument();
    });

    // Stats check
    expect(screen.getByText('10')).toBeInTheDocument(); // total courses stat
    expect(screen.getByText('8')).toBeInTheDocument(); // published stat
    expect(screen.getByText('2')).toBeInTheDocument(); // draft stat
  });

  it('opens create course dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Course')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create course/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Create Course' });
    expect(dialogTitle).toBeInTheDocument();

    await user.type(screen.getByLabelText(/title \*/i), 'New Course');
    await user.type(screen.getByLabelText(/short description \*/i), 'Short desc');
    await user.type(screen.getByLabelText(/detailed description \*/i), 'Long desc');
    await user.type(screen.getByLabelText(/thumbnail url \*/i), 'http://thumb');
    await user.type(screen.getByLabelText(/estimated duration \*/i), '10h');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /create course/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/courses', expect.objectContaining({
        title: 'New Course',
        shortDescription: 'Short desc',
        description: 'Long desc',
        thumbnail: 'http://thumb',
        estimatedDuration: '10h'
      }));
    });
  }, 15000);

  it('opens edit course dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Course')).toBeInTheDocument();
    });

    const row = screen.getByText('React Course').closest('tr');
    const editBtn = row!.querySelectorAll('button')[1]; // publish, edit, delete
    await user.click(editBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Edit Course' });
    expect(dialogTitle).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/title \*/i) as HTMLInputElement;
    expect(titleInput.value).toBe('React Course');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Course');

    const submitBtn = screen.getByRole('button', { name: /update course/i });
    
    // Sometimes radix dialog stops propagation on buttons. Fire submit directly on form or click.
    const form = submitBtn.closest('form');
    console.log("Form found:", !!form, "Button tag:", submitBtn.tagName);
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/courses/course-1', expect.objectContaining({
        title: 'Updated Course'
      }));
    });
  });

  it('opens delete confirmation and deletes course', async () => {
    const user = userEvent.setup();
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Course')).toBeInTheDocument();
    });

    const row = screen.getByText('React Course').closest('tr');
    const deleteBtn = row!.querySelectorAll('button')[2]; // publish, edit, delete
    await user.click(deleteBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Delete Course' });
    expect(dialogTitle).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /yes, delete/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/courses/course-1');
    });
  });

  it('toggles publish status', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Course')).toBeInTheDocument();
    });

    const row = screen.getByText('React Course').closest('tr');
    const toggleBtn = row!.querySelectorAll('button')[0]; // publish toggle
    await user.click(toggleBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/courses/course-1/unpublish');
    });
  });

  describe('API States', () => {
    it('shows loading state initially', () => {
      // Mock to never resolve so it stays in loading
      (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
      const { container } = renderWithProviders(<AdminCoursesPage />);
      // Verify loading skeletons exist (they usually have the animate-pulse class)
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error state when API fails', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
      renderWithProviders(<AdminCoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();
    });

    it('shows empty state when no data exists', async () => {
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/admin/courses/stats') {
          return Promise.resolve({ data: { total: 0, published: 0, draft: 0 } });
        }
        return Promise.resolve({ data: { data: [], totalItems: 0, totalPages: 0 } });
      });
      renderWithProviders(<AdminCoursesPage />);

      await waitFor(() => {
        expect(screen.getByText(/No matching courses found/i)).toBeInTheDocument();
      });
    });
  });
});
