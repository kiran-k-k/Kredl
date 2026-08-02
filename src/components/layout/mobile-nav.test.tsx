import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from './mobile-nav';

// Mock the Sidebar to just render a button that calls onNavigate
jest.mock('./sidebar', () => ({
  Sidebar: ({ onNavigate }: { onNavigate?: () => void }) => (
    <div data-testid="sidebar">
      <button onClick={onNavigate}>Navigate Link</button>
    </div>
  ),
}));

// We need a wrapper to manage state since MobileNav expects isOpen and setIsOpen
const MobileNavWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />;
};

describe('MobileNav Component', () => {
  it('should render the toggle button', () => {
    render(<MobileNavWrapper />);
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
  });

  it('should open the drawer when trigger is clicked and close when link clicked', async () => {
    const user = userEvent.setup();
    render(<MobileNavWrapper />);
    
    // Initially sidebar is not visible
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    
    const trigger = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(trigger);
    
    // Sidebar should now be visible
    const sidebar = await screen.findByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
    
    // Click a link inside sidebar which should call onNavigate -> setIsOpen(false)
    const link = screen.getByRole('button', { name: /navigate link/i });
    await user.click(link);
    
    // Sidebar should close
    await waitFor(() => {
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });
  });
});
