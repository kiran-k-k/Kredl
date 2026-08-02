import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminModulesPage from './page';
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

// Mock confirm
const originalConfirm = window.confirm;

describe('Admin Modules Page', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    jest.setTimeout(15000);
    window.confirm = jest.fn();
  });
  
  afterAll(() => {
    window.confirm = originalConfirm;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/courses') {
        return Promise.resolve({
          data: {
            data: [
              { id: 'course-1', title: 'React Course' }
            ]
          }
        });
      }
      if (url === '/modules') {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'module-1',
                title: 'Introduction to React',
                description: 'Module desc',
                courseId: { _id: 'course-1', title: 'React Course' },
                order: 1,
                estimatedTimeMinutes: 60,
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

  it('renders modules list and courses dropdown', async () => {
    renderWithProviders(<AdminModulesPage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getAllByText('React Course')[0]).toBeInTheDocument();
    });
  });

  it('opens create module dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminModulesPage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create module/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Create Module' });
    expect(dialogTitle).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    const titleInput = within(dialog).getByPlaceholderText('e.g. Introduction to React');
    await user.type(titleInput, 'New Module');
    
    // Select course - label has no htmlFor so use positional combobox
    const dialogComboboxes = within(dialog).getAllByRole('combobox');
    await user.selectOptions(dialogComboboxes[0], 'course-1');

    const submitBtn = within(dialog).getByRole('button', { name: /create module/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/modules', expect.objectContaining({
        title: 'New Module',
        courseId: 'course-1'
      }));
    });
  }, 15000);

  it('opens edit module dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminModulesPage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    });

    const row = screen.getByText('Introduction to React').closest('tr');
    // Buttons: [0]=GripVertical, [1]=Edit, [2]=Delete
    const actionButtons = within(row!).getAllByRole('button');
    await user.click(actionButtons[1]); // Edit

    const dialogTitle = await screen.findByRole('heading', { name: 'Edit Module' });
    expect(dialogTitle).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    const titleInput = within(dialog).getByPlaceholderText('e.g. Introduction to React') as HTMLInputElement;
    expect(titleInput.value).toBe('Introduction to React');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Module');

    const submitBtn = within(dialog).getByRole('button', { name: /update module/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/modules/module-1', expect.objectContaining({
        title: 'Updated Module'
      }));
    });
  });

  it('deletes module on confirmation', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(true);
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminModulesPage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    });

    const row = screen.getByText('Introduction to React').closest('tr');
    const actionButtons = within(row!).getAllByRole('button');
    await user.click(actionButtons[2]); // Delete

    expect(window.confirm).toHaveBeenCalledWith('Delete module "Introduction to React"?');

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/modules/module-1');
    });
  });

  describe('API States', () => {
    it('shows loading state initially', () => {
      (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
      const { container } = renderWithProviders(<AdminModulesPage />);
      const loaders = container.querySelectorAll('.animate-spin');
      expect(loaders.length).toBeGreaterThan(0);
    });

    it('shows error state when API fails', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
      renderWithProviders(<AdminModulesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load modules.')).toBeInTheDocument();
      });
    });

    it('shows empty state when no data exists', async () => {
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/admin/courses') {
          return Promise.resolve({ data: { data: [{ id: 'course-1', title: 'React Course' }] } });
        }
        return Promise.resolve({ data: { data: [], total: 0 } });
      });
      renderWithProviders(<AdminModulesPage />);

      await waitFor(() => {
        expect(screen.getByText(/No modules found/i)).toBeInTheDocument();
      });
    });
  });
});
