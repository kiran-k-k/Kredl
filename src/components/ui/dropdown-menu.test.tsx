import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from './dropdown-menu';

describe('DropdownMenu Component', () => {
  it('renders and opens dropdown menu', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    expect(trigger).toBeInTheDocument();

    // The content shouldn't be visible initially in Radix (though it might be in the DOM hidden)
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('My Account')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('handles item clicks and closes the menu', async () => {
    const user = userEvent.setup();
    const handleItemClick = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleItemClick}>Click Me</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Click Me'));

    expect(handleItemClick).toHaveBeenCalledTimes(1);
    
    // The menu should close (wait for it to disappear)
    await waitFor(() => {
      expect(screen.queryByText('Click Me')).not.toBeInTheDocument();
    });
  });

  it('renders checkbox and radio items', async () => {
    const user = userEvent.setup();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={true}>Checked Option</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="radio2">
            <DropdownMenuRadioItem value="radio1">Radio 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="radio2">Radio 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open Menu'));

    await waitFor(() => {
      expect(screen.getByText('Checked Option')).toBeInTheDocument();
      expect(screen.getByText('Radio 1')).toBeInTheDocument();
      expect(screen.getByText('Radio 2')).toBeInTheDocument();
    });
  });
});
