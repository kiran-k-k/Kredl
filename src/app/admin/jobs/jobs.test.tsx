import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminJobsPage from './page';
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

describe('Admin Jobs Page', () => {
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
      if (url === '/jobs') {
        return Promise.resolve({
          data: {
            data: {
              data: [
              {
                _id: 'job-1',
                title: 'Frontend Developer',
                companyId: { _id: 'comp-1', name: 'Google' },
                companySnapshot: { name: 'Google' },
                location: 'Remote',
                employmentType: 'Full-time',
                workMode: 'Remote',
                experienceRequired: '2-4 years',
                status: 'ACTIVE',
              }
            ],
            total: 1
            }
          }
        });
      }
      if (url === '/companies') {
        return Promise.resolve({
          data: {
            data: { data: [{ _id: 'comp-1', name: 'Google' }] }
          }
        });
      }
      if (url === '/job-roles') {
        return Promise.resolve({
          data: {
            data: { data: [{ _id: 'role-1', title: 'Developer' }] }
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

  it('renders jobs list', async () => {
    renderWithProviders(<AdminJobsPage />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Total Listings')).toBeInTheDocument();
    });

    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // total stat
  });

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AdminJobsPage />);
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state and handles retry', async () => {
    const user = userEvent.setup();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/jobs') return Promise.reject(new Error('Failed to fetch'));
      return Promise.resolve({ data: { data: { data: [] } } });
    });

    renderWithProviders(<AdminJobsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load jobs/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/jobs') return Promise.resolve({ data: { data: { data: [{ _id: 'job-1', title: 'Frontend Developer', status: 'ACTIVE' }], total: 1 } } });
      return Promise.resolve({ data: { data: { data: [] } } });
    });
    
    await user.click(retryBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
  });

  it('renders empty state when no jobs exist', async () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/jobs') return Promise.resolve({ data: { data: { data: [], total: 0 } } });
      return Promise.resolve({ data: { data: { data: [] } } });
    });

    renderWithProviders(<AdminJobsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no jobs/i)).toBeInTheDocument();
    });
  });

  it('opens create dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobsPage />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /post job/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Post Job' });
    expect(dialogTitle).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. SDE-1'), 'New Job');
    await user.type(screen.getByPlaceholderText('Brief overview of the role'), 'Job desc');
    await user.type(screen.getByPlaceholderText('e.g. Bangalore, Remote'), 'Bangalore');
    await user.type(screen.getByPlaceholderText('e.g. 0–2 years'), '0-2 years');

    const dialogComboboxes = within(screen.getByRole('dialog')).getAllByRole('combobox');
    
    const companySelect = dialogComboboxes[2];
    await user.selectOptions(companySelect, 'comp-1');

    const roleSelect = dialogComboboxes[3];
    await user.selectOptions(roleSelect, 'role-1');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /post job/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/jobs', expect.objectContaining({
        title: 'New Job',
        jobSummary: 'Job desc',
        companyId: 'comp-1',
        roleId: 'role-1',
      }));
    });
  }, 15000);

  it('opens edit dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobsPage />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const row = screen.getByText('Frontend Developer').closest('tr');
    const editBtn = row!.querySelector('button'); // first button is Edit
    await user.click(editBtn!);

    const dialogTitle = await screen.findByRole('heading', { name: 'Edit Job' });
    expect(dialogTitle).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('e.g. SDE-1') as HTMLInputElement;
    expect(titleInput.value).toBe('Frontend Developer');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Job');

    const submitBtn = screen.getByRole('button', { name: /update job/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/jobs/job-1', expect.objectContaining({
        title: 'Updated Job'
      }));
    });
  });

  it('opens delete confirmation and deletes job', async () => {
    const user = userEvent.setup();
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminJobsPage />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const row = screen.getByText('Frontend Developer').closest('tr');
    // The actions cell has an Edit button and a DropdownMenuTrigger
    const actionButtons = within(row!).getAllByRole('button');
    // The last button in the row is the DropdownMenuTrigger (More options)
    const moreBtn = actionButtons[actionButtons.length - 1];
    await user.click(moreBtn);

    // Radix DropdownMenu renders menuitem roles
    const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteMenuItem);

    const deleteHeading = await screen.findByText('Delete Job');
    expect(deleteHeading).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /yes, delete/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/jobs/job-1');
    });
  });
});
