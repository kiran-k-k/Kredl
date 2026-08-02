import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminCompaniesPage from './page';
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

describe('Admin Companies Page', () => {
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
      if (url === '/companies') {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'comp-1',
                name: 'Google',
                logo: 'http://google.com/logo.png',
                overview: 'Tech giant',
                salaryRange: { min: 20, max: 40, currency: 'LPA' },
                eligibilityCriteria: { minimumCgpa: 8.0 }
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

  it('renders companies list', async () => {
    renderWithProviders(<AdminCompaniesPage />);

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Tech giant')).toBeInTheDocument();
    });
  });

  it('renders loading state initially', () => {
    // Need to mock unresolved promise to see loading state
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AdminCompaniesPage />);
    
    // Check for the skeleton or loading text
    // The page uses DataTable which renders skeletons when isLoading is true
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state and handles retry', async () => {
    const user = userEvent.setup();
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<AdminCompaniesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load companies/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    
    // Mock successful fetch for the retry
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: [{ _id: 'comp-1', name: 'Google' }], total: 1 }
    });
    
    await user.click(retryBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
  });

  it('renders empty state when no companies exist', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: [], total: 0 }
    });

    renderWithProviders(<AdminCompaniesPage />);

    await waitFor(() => {
      expect(screen.getByText(/no companies/i)).toBeInTheDocument();
    });
  });

  it('opens create company dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCompaniesPage />);

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /add company/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Add New Company' });
    expect(dialogTitle).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. Google'), 'Microsoft');
    await user.type(screen.getAllByPlaceholderText('https://...')[0], 'http://ms.com/logo.png');
    await user.type(screen.getByPlaceholderText('Company overview...'), 'MS Overview');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /create company/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/companies', expect.objectContaining({
        name: 'Microsoft',
        logo: 'http://ms.com/logo.png',
        overview: 'MS Overview'
      }));
    });
  });

  it('opens edit company dialog and submits form', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCompaniesPage />);

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const row = screen.getByText('Google').closest('tr');
    const buttons = row!.querySelectorAll('button');
    await user.click(buttons[0]); // Edit button

    const dialogTitle = await screen.findByRole('heading', { name: 'Edit Company Profile' });
    expect(dialogTitle).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Google') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Google Updated');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /update company/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/companies/comp-1', expect.objectContaining({
        name: 'Google Updated'
      }));
    });
  });

  it('opens delete confirmation and deletes company', async () => {
    const user = userEvent.setup();
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminCompaniesPage />);

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const row = screen.getByText('Google').closest('tr');
    const buttons = row!.querySelectorAll('button');
    await user.click(buttons[1]); // Delete button

    const dialogTitle = await screen.findByRole('heading', { name: 'Delete Company' });
    expect(dialogTitle).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /yes, delete/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/companies/comp-1');
    });
  });
});
