import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminJobRolesPage from './page';
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

describe('Admin Job Roles Page', () => {
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
      if (url === '/admin/job-roles') {
        return Promise.resolve({
          data: {
            data: {
              data: [
                {
                  _id: 'role-1',
                  title: 'Software Engineer',
                  shortDescription: 'Write code',
                  description: 'Detailed description',
                  category: 'Software Development',
                  experienceLevel: 'Fresher',
                  isPublished: true,
                  isFeatured: false,
                  requiredSkills: ['Java', 'Spring'],
                }
              ],
              total: 1,
              page: 1,
              limit: 10
            }
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

  it('renders job roles list', async () => {
    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Total Roles')).toBeInTheDocument();
    });

    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // total stat
  });

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AdminJobRolesPage />);
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state and handles retry', async () => {
    const user = userEvent.setup();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/job-roles') return Promise.reject(new Error('Failed to fetch'));
      return Promise.resolve({ data: { data: { data: [] } } });
    });

    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load job roles/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/job-roles') return Promise.resolve({ data: { data: { data: [{ _id: 'role-1', title: 'Software Engineer', isPublished: true }], total: 1 } } });
      return Promise.resolve({ data: { data: { data: [] } } });
    });
    
    await user.click(retryBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('renders empty state when no job roles exist', async () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/job-roles') return Promise.resolve({ data: { data: { data: [], total: 0 } } });
      return Promise.resolve({ data: { data: { data: [] } } });
    });

    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText(/no job roles/i)).toBeInTheDocument();
    });
  });

  it('opens create dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /add role/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Add Job Role' });
    expect(dialogTitle).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. Java Backend Developer'), 'New Role');
    await user.type(screen.getByPlaceholderText(/Concise 1/), 'Short desc');
    await user.type(screen.getByPlaceholderText(/Detailed role overview/), 'Long desc');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /create role/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/job-roles', expect.objectContaining({
        title: 'New Role',
        shortDescription: 'Short desc',
        description: 'Long desc',
      }));
    });
  }, 15000);

  it('opens edit dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const row = screen.getByText('Software Engineer').closest('tr');
    // Buttons: [0]=Publish/Unpublish, [1]=Edit, [2]=Delete
    const actionButtons = within(row!).getAllByRole('button');
    await user.click(actionButtons[1]); // Edit

    const dialogTitle = await screen.findByRole('heading', { name: 'Edit Job Role' });
    expect(dialogTitle).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('e.g. Java Backend Developer') as HTMLInputElement;
    expect(titleInput.value).toBe('Software Engineer');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Role');

    const submitBtn = screen.getByRole('button', { name: /update role/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/job-roles/role-1', expect.objectContaining({
        title: 'Updated Role'
      }));
    });
  });

  it('opens delete confirmation and deletes role', async () => {
    const user = userEvent.setup();
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const row = screen.getByText('Software Engineer').closest('tr');
    const actionButtons = within(row!).getAllByRole('button');
    await user.click(actionButtons[2]); // Delete

    const deleteHeading = await screen.findByText('Delete Job Role');
    expect(deleteHeading).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /yes, delete/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/job-roles/role-1');
    });
  });

  it('toggles publish status', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobRolesPage />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const row = screen.getByText('Software Engineer').closest('tr');
    const actionButtons = within(row!).getAllByRole('button');
    await user.click(actionButtons[0]); // Publish toggle

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/job-roles/role-1/unpublish');
    });
  });
});
