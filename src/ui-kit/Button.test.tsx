import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with children text', () => {
    render(<Button>Нажми меня</Button>);
    
    const button = screen.getByRole('button', { name: /нажми меня/i });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Тест</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Клик</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Заблокирован</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('forwards HTML button props', () => {
    render(<Button type="submit" data-testid="submit-btn">Отправить</Button>);
    
    const button = screen.getByTestId('submit-btn');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('has correct default styles', () => {
    render(<Button>Стили</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'rounded-full', 'font-bold', 'text-lg', 'transition-all', 'shadow-lg');
  });
});
