// src/components/UI/AnimatedFrame.tsx
import { ReactNode } from 'react';

interface AnimatedFrameProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export function AnimatedFrame({ children, variant = 'primary', className = '' }: AnimatedFrameProps) {
  const variants = {
    primary: {
      border: 'border-blue-400/30',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      gradient: 'from-blue-500/10 to-purple-500/10'
    },
    secondary: {
      border: 'border-purple-400/30', 
      glow: 'shadow-[0_0_20px_rgba(147,51,234,0.3)]',
      gradient: 'from-purple-500/10 to-pink-500/10'
    },
    accent: {
      border: 'border-pink-400/30',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', 
      gradient: 'from-pink-500/10 to-orange-500/10'
    }
  };

  const config = variants[variant];

  return (
    <>
      <style>{`
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        
        @keyframes borderFlow {
          0% { border-image-slice: 1; }
          25% { border-image-slice: 1; }
          50% { border-image-slice: 1; }
          75% { border-image-slice: 1; }
          100% { border-image-slice: 1; }
        }
        
        .animated-frame {
          position: relative;
          animation: borderGlow 3s ease-in-out infinite;
        }
        
        .animated-frame::before {
          content: '';
          position: absolute;
          inset: -2px;
          padding: 2px;
          background: linear-gradient(45deg, 
            transparent 25%, 
            currentColor 25%, 
            currentColor 50%, 
            transparent 50%, 
            transparent 75%, 
            currentColor 75%
          );
          background-size: 20px 20px;
          border-radius: inherit;
          opacity: 0.3;
          animation: borderFlow 2s linear infinite;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
        }
        
        .animated-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .animated-frame:hover::after {
          opacity: 1;
        }
      `}</style>
      
      <div 
        className={`
          animated-frame
          relative 
          border-2 
          ${config.border}
          bg-gradient-to-br 
          ${config.gradient}
          backdrop-blur-sm 
          rounded-xl 
          ${config.glow}
          hover:${config.glow.replace('0.3', '0.5')}
          transition-all 
          duration-300
          ${className}
        `}
        style={{
          color: variant === 'primary' ? '#60a5fa' : 
                 variant === 'secondary' ? '#a855f7' : '#ec4899'
        }}
      >
        {children}
      </div>
    </>
  );
}
