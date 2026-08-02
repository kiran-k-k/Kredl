import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './card';

describe('Card Components', () => {
  it('should render the Card container with children', () => {
    render(
      <Card data-testid="card">
        <div data-testid="child">Child Content</div>
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('group/card');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should render CardHeader, Title, Description, and Action', () => {
    render(
      <CardHeader data-testid="card-header">
        <CardTitle data-testid="card-title">Title</CardTitle>
        <CardDescription data-testid="card-description">Description</CardDescription>
        <CardAction data-testid="card-action">Action</CardAction>
      </CardHeader>
    );

    const header = screen.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Title');
    expect(screen.getByTestId('card-description')).toHaveTextContent('Description');
    expect(screen.getByTestId('card-action')).toHaveTextContent('Action');
  });

  it('should render CardContent and CardFooter', () => {
    render(
      <>
        <CardContent data-testid="card-content">Content</CardContent>
        <CardFooter data-testid="card-footer">Footer</CardFooter>
      </>
    );

    expect(screen.getByTestId('card-content')).toHaveTextContent('Content');
    expect(screen.getByTestId('card-footer')).toHaveTextContent('Footer');
  });

  it('should pass custom className to Card', () => {
    render(<Card data-testid="card" className="custom-class" />);
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('should handle the size prop on Card', () => {
    render(<Card data-testid="card" size="sm" />);
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'sm');
  });
});
