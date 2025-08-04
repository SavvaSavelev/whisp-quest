import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={mockOnClose}>
        <div>Модальное содержимое</div>
      </Modal>
    );
    
    expect(screen.queryByText('Модальное содержимое')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Модальное содержимое</div>
      </Modal>
    );
    
    expect(screen.getByText('Модальное содержимое')).toBeInTheDocument();
  });

  it('has close button', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Содержимое</div>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Содержимое</div>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Содержимое</div>
      </Modal>
    );
    
    // Кликаем по фону (backdrop)
    const backdrop = screen.getByText('Содержимое').closest('.fixed');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not close when modal content clicked', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Содержимое модали</div>
      </Modal>
    );
    
    const content = screen.getByText('Содержимое модали');
    fireEvent.click(content);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
