import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardLayout } from './dashboard-layout';

// Mock the child components to avoid needing their complex providers/states
jest.mock('./sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar Component</div>,
}));

jest.mock('./header', () => ({
  Header: () => <div data-testid="header">Header Component</div>,
}));

jest.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="breadcrumb">Breadcrumb Component</div>,
}));

jest.mock('@/components/auth/route-guard', () => ({
  RouteGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="route-guard">{children}</div>
  ),
}));

describe('DashboardLayout', () => {
  it('should wrap everything in RouteGuard', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const routeGuard = screen.getByTestId('route-guard');
    expect(routeGuard).toBeInTheDocument();
    expect(routeGuard).toContainElement(screen.getByTestId('sidebar'));
  });

  it('should render all layout components and children', () => {
    render(
      <DashboardLayout>
        <div data-testid="dashboard-child">Dashboard Child Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-child')).toBeInTheDocument();
  });
});
