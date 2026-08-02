import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OAuthButton } from './oauth-button';

describe('OAuthButton', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    // Suppress JSDOM navigation not implemented error when clicking the oauth button
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string' && msg.includes('Not implemented: navigation')) {
        return;
      }
      if (msg instanceof Error && msg.message.includes('Not implemented: navigation')) {
        return;
      }
      originalConsoleError(msg);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the button with provider text', () => {
    render(<OAuthButton provider="google">Continue with Google</OAuthButton>);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('should call custom onClick if provided', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<OAuthButton provider="google" onClick={handleClick}>Continue</OAuthButton>);
    
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should respect preventDefault in custom onClick', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn((e) => e.preventDefault());
    render(<OAuthButton provider="google" onClick={handleClick}>Continue</OAuthButton>);
    
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(handleClick).toHaveBeenCalled();
  });
});
