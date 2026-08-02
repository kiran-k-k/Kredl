import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TpoReportsPage from './page';

// Mock ResizeObserver for any charts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe('TPO Reports Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TpoReportsPage />
      </QueryClientProvider>
    );
  };

  it('renders reports header and export button', () => {
    renderComponent();
    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });
});
