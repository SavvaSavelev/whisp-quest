import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-white rounded-xl shadow-xl p-8">
        {children}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Закрыть">×</button>
      </div>
    </div>,
    document.body
  );
};
