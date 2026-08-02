import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TpoAnnouncementsPage from './page';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe('TPO Announcements Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TpoAnnouncementsPage />
      </QueryClientProvider>
    );
  };

  it('renders announcements header and create button', () => {
    renderComponent();
    expect(screen.getAllByText('Announcements').length).toBeGreaterThan(0);
    expect(screen.getByText('Create Announcement')).toBeInTheDocument();
  });
});
