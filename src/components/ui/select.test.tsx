import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

// Mock matchMedia is already in jest.setup.ts
// Mock ResizeObserver is already in jest.setup.ts
// React testing library needs a wrapper for pointer events when dealing with Base UI / Radix primitives sometimes,
// but let's test it normally first.

const SelectDemo = () => (
  <Select defaultValue="apple">
    <SelectTrigger aria-label="Food">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="blueberry">Blueberry</SelectItem>
    </SelectContent>
  </Select>
);

describe('Select Component', () => {
  it('should render the select trigger with default value', () => {
    render(<SelectDemo />);
    expect(screen.getByRole('combobox', { name: 'Food' })).toHaveTextContent('apple');
  });

  it('should open the dropdown and allow selection', async () => {
    const user = userEvent.setup();
    render(<SelectDemo />);

    const trigger = screen.getByRole('combobox', { name: 'Food' });
    
    // Open the select
    await user.click(trigger);

    // Find options
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // The options might be rendered in a portal. Base UI uses 'option' role.
    const bananaOption = await screen.findByRole('option', { name: 'Banana' });
    
    // Select Banana
    await user.click(bananaOption);

    // Trigger should now show Banana
    await waitFor(() => {
      expect(trigger).toHaveTextContent('banana');
    });
  });

  it('should render placeholders correctly when no default value is set', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Food">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox', { name: 'Food' })).toHaveTextContent('Select a fruit');
  });
});
