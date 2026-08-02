import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLessonsPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}));

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
window.confirm = jest.fn(() => true);

describe('Admin Lessons Page', () => {
  beforeAll(() => {
    jest.setTimeout(15000);
  });
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/courses') {
        return Promise.resolve({
          data: {
            data: [{ id: 'course-1', title: 'React Course' }]
          }
        });
      }
      if (url === '/modules') {
        return Promise.resolve({
          data: {
            data: [{ _id: 'module-1', title: 'React Basics' }]
          }
        });
      }
      if (url === '/lessons') {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'lesson-1',
                title: 'Intro to React',
                description: 'First lesson',
                moduleId: { _id: 'module-1', title: 'React Basics' },
                youtubeUrl: '',
                durationMinutes: 10,
                order: 1,
                status: 'published'
              }
            ],
            total: 1
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

  it('renders lessons list', async () => {
    renderWithProviders(<AdminLessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Intro to React')).toBeInTheDocument();
      expect(screen.getAllByText('React Basics')[0]).toBeInTheDocument();
    });
  });

  it('creates a new lesson', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminLessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Intro to React')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create lesson/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Create Lesson' });
    expect(dialogTitle).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. React Components'), 'New Lesson');
    await user.type(screen.getByPlaceholderText('Optional description'), 'Lesson desc');
    
    const dialogComboboxes = within(screen.getByRole('dialog')).getAllByRole('combobox');
    await user.selectOptions(dialogComboboxes[0], 'module-1');
    
    const durationInput = within(screen.getByRole('dialog')).getAllByRole('spinbutton')[1];
    await user.clear(durationInput);
    await user.type(durationInput, '20');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /create lesson/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/lessons', expect.objectContaining({
        title: 'New Lesson',
        description: 'Lesson desc',
        moduleId: 'module-1',
        durationMinutes: 20
      }));
    });
  });

  it('edits a lesson', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminLessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Intro to React')).toBeInTheDocument();
    });

    const row = screen.getByText('Intro to React').closest('tr');
    const buttons = within(row!).getAllByRole('button');
    const editBtn = buttons[1];
    await user.click(editBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Edit Lesson' });
    expect(dialogTitle).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('e.g. React Components') as HTMLInputElement;
    expect(titleInput.value).toBe('Intro to React');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Lesson');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /update lesson/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/lessons/lesson-1', expect.objectContaining({
        title: 'Updated Lesson'
      }));
    });
  });

  it('deletes a lesson', async () => {
    const user = userEvent.setup();
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminLessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Intro to React')).toBeInTheDocument();
    });

    const row = screen.getByText('Intro to React').closest('tr');
    const buttons = within(row!).getAllByRole('button');
    const deleteBtn = buttons[2];
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Delete lesson "Intro to React"?');

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/lessons/lesson-1');
    });
  });

  describe('API States', () => {
    it('shows loading state initially', () => {
      (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
      const { container } = renderWithProviders(<AdminLessonsPage />);
      const loaders = container.querySelectorAll('.animate-spin');
      expect(loaders.length).toBeGreaterThan(0);
    });

    it('shows error state when API fails', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
      renderWithProviders(<AdminLessonsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load lessons.')).toBeInTheDocument();
      });
    });

    it('shows empty state when no data exists', async () => {
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/admin/courses') {
          return Promise.resolve({ data: { data: [{ id: 'course-1', title: 'React Course' }] } });
        }
        if (url === '/modules?courseId=course-1') {
          return Promise.resolve({ data: { data: [{ _id: 'module-1', title: 'React Basics' }] } });
        }
        return Promise.resolve({ data: { data: [], total: 0 } });
      });
      renderWithProviders(<AdminLessonsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No lessons found/i)).toBeInTheDocument();
      });
    });
  });
});
