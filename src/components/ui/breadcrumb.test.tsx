import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from './breadcrumb';
import { usePathname } from 'next/navigation';

describe('Breadcrumb Component', () => {
  it('should not render anything on root path', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render anything when pathname is null', () => {
    (usePathname as jest.Mock).mockReturnValue(null);
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('should render correctly for /dashboard', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    render(<Breadcrumb />);
    
    // Should have Home link
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    
    // Should have Dashboard as text because it's the last segment
    // But wait, the component renders Dashboard as a Link with aria-current="page", let's check
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('should render correctly for nested routes like /dashboard/courses/react', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/courses/react');
    render(<Breadcrumb />);
    
    // Home
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    
    // Dashboard (link)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    
    // Courses (link)
    expect(screen.getByRole('link', { name: /courses/i })).toHaveAttribute('href', '/dashboard/courses');
    
    // React (current page, so it should be text, not a link)
    expect(screen.queryByRole('link', { name: /react/i })).not.toBeInTheDocument();
    
    const currentSegment = screen.getByText('React');
    expect(currentSegment).toBeInTheDocument();
    expect(currentSegment).toHaveAttribute('aria-current', 'page');
  });

  it('should format hyphenated paths properly', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/job-roles');
    render(<Breadcrumb />);
    
    const currentSegment = screen.getByText('Job Roles');
    expect(currentSegment).toBeInTheDocument();
    expect(currentSegment).toHaveAttribute('aria-current', 'page');
  });
});
