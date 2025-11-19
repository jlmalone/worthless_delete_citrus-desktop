import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

describe('App Component', () => {
  it('should render with default title', () => {
    render(<App />);
    expect(screen.getByText('Citrus Desktop')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<App title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should display initial receipt count as 0', () => {
    render(<App />);
    expect(screen.getByText('Receipts: 0')).toBeInTheDocument();
  });

  it('should increment receipt count when button clicked', () => {
    render(<App />);
    const button = screen.getByText('Add Receipt');

    expect(screen.getByText('Receipts: 0')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Receipts: 1')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Receipts: 2')).toBeInTheDocument();
  });

  it('should render Add Receipt button', () => {
    render(<App />);
    const button = screen.getByText('Add Receipt');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.app')).toBeInTheDocument();
    expect(container.querySelector('.receipt-counter')).toBeInTheDocument();
  });
});
