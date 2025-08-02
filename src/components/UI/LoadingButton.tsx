import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingButtonProps {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'spiritual';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
  spiritual: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  children,
  isLoading = false,
  loadingText = 'Загрузка...',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const handleClick = async () => {
    if (isLoading || disabled) return;
    await onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${isLoading || disabled ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} 
        ${className}
      `}
      whileTap={!isLoading && !disabled ? { scale: 0.95 } : {}}
      whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
    >
      {/* Фоновая анимация при загрузке */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Контент кнопки */}
      <div className="relative flex items-center justify-center space-x-2">
        {isLoading && (
          <LoadingSpinner 
            size="sm" 
            variant={variant === 'spiritual' ? 'spiritual' : 'primary'} 
          />
        )}
        
        <motion.span
          animate={{
            opacity: isLoading ? 0.8 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? loadingText : children}
        </motion.span>
      </div>

      {/* Эффект свечения при hover */}
      <motion.div
        className="absolute inset-0 bg-white/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};
