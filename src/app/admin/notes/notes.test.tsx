import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminNotesPage from './page';
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

describe('Admin Notes Page', () => {
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
      if (url === '/lessons') {
        return Promise.resolve({
          data: {
            data: [{ _id: 'lesson-1', title: 'Intro to React' }]
          }
        });
      }
      if (url === '/lesson-notes') {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'note-1',
                title: 'React Hooks Cheat Sheet',
                content: 'UseState, UseEffect',
                lessonId: { _id: 'lesson-1', title: 'Intro to React' },
                updatedAt: new Date().toISOString()
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

  it('renders notes list and active note', async () => {
    renderWithProviders(<AdminNotesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Hooks Cheat Sheet')).toBeInTheDocument();
      const titleInput = screen.getByDisplayValue('React Hooks Cheat Sheet');
      expect(titleInput).toBeInTheDocument();
      const contentTextarea = screen.getByDisplayValue('UseState, UseEffect');
      expect(contentTextarea).toBeInTheDocument();
    });
  });

  it('creates a new note', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: { _id: 'new-note' } });

    renderWithProviders(<AdminNotesPage />);

    await waitFor(() => {
      expect(screen.getByText('React Hooks Cheat Sheet')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create note/i });
    await user.click(createBtn);

    const dialogTitle = await screen.findByRole('heading', { name: 'Create Note' });
    expect(dialogTitle).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. React Hooks Cheat Sheet'), 'New Note');
    const dialogComboboxes = within(screen.getByRole('dialog')).getAllByRole('combobox');
    await user.selectOptions(dialogComboboxes[0], 'lesson-1');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /create note/i });
    const form = submitBtn.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/lesson-notes', expect.objectContaining({
        title: 'New Note',
        lessonId: 'lesson-1',
        content: ''
      }));
    });
  });

  it('updates a note', async () => {
    const user = userEvent.setup();
    (api.patch as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminNotesPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('React Hooks Cheat Sheet')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('React Hooks Cheat Sheet');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    const saveBtn = screen.getByRole('button', { name: /save note/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/lesson-notes/note-1', expect.objectContaining({
        title: 'Updated Title',
        content: 'UseState, UseEffect'
      }));
    });
  });

  it('deletes a note', async () => {
    const user = userEvent.setup();
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(<AdminNotesPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('React Hooks Cheat Sheet')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /save note/i });
    const deleteBtn = saveBtn.previousElementSibling as HTMLElement;
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Delete note "React Hooks Cheat Sheet"?');

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/lesson-notes/note-1');
    });
  });
});
