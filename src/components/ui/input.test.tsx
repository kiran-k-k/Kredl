import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
  it('should render correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should allow typing', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('should apply custom className', () => {
    render(<Input placeholder="Custom" className="custom-class" />);
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is passed', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('should pass through input attributes (type, name, id)', () => {
    render(<Input type="email" name="emailInput" id="email-1" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'emailInput');
    expect(input).toHaveAttribute('id', 'email-1');
  });
});
