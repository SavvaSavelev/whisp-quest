import React from 'react';
import { theme } from '../config/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`px-6 py-3 rounded-full font-bold text-lg transition-all shadow-lg ${theme.colors.button ? 'bg-indigo-500 text-white hover:bg-indigo-600' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);
