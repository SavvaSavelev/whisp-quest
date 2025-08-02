import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'spiritual' | 'cosmic' | 'pulse';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  className = ''
}) => {
  const spinnerVariants = {
    primary: (
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-600 border-t-indigo-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ),
    spiritual: (
      <div className={`${sizeClasses[size]} relative`}>
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-1 border-4 border-transparent border-b-indigo-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 w-2 h-2 bg-white rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    ),
    cosmic: (
      <div className={`${sizeClasses[size]} relative`}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-4 bg-gradient-to-t from-purple-500 to-indigo-300 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '0.5px 20px',
              transform: `rotate(${i * 45}deg)`
            } as React.CSSProperties}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15
            }}
          />
        ))}
      </div>
    ),
    pulse: (
      <motion.div
        className={`${sizeClasses[size]} bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {spinnerVariants[variant]}
      {text && (
        <motion.p
          className={`${textSizeClasses[size]} text-gray-300 font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
