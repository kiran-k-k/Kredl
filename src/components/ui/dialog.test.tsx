import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

// Use a simple boolean to control the dialog via standard props or just internal state
const DialogDemo = () => (
  <Dialog>
    <DialogTrigger>Open Dialog</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog description text.</DialogDescription>
      </DialogHeader>
      <div>Main Content</div>
      <DialogFooter showCloseButton>
        <button type="button">Save</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

describe('Dialog Component', () => {
  it('should not render content initially', () => {
    render(<DialogDemo />);
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DialogDemo />);
    
    await user.click(screen.getByText('Open Dialog'));
    
    const dialogTitle = await screen.findByText('Dialog Title');
    expect(dialogTitle).toBeInTheDocument();
    
    expect(screen.getByText('Dialog description text.')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('should close dialog when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<DialogDemo />);
    
    await user.click(screen.getByText('Open Dialog'));
    await screen.findByText('Dialog Title');
    
    // The dialog content renders an absolute close button by default if showCloseButton is true,
    // plus our footer has showCloseButton which renders a 'Close' text button.
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[0]);
    
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });
});
