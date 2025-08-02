import React, { useEffect, useState } from 'react';
import { AnimatedFrame } from './AnimatedFrame';

interface SpiritNotificationProps {
  spirit: {
    name: string;
    essence: string;
    mood: string;
    rarity: string;
  } | null;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const SpiritNotification: React.FC<SpiritNotificationProps> = ({
  spirit,
  message,
  isVisible,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Время для анимации исчезновения
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !spirit) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'легендарный': return 'from-yellow-400 to-orange-500';
      case 'эпический': return 'from-purple-500 to-pink-500';
      case 'редкий': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes spiritPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .notification-enter {
          animation: slideInFromRight 0.5s ease-out;
        }
        
        .notification-exit {
          animation: slideOutToRight 0.3s ease-in;
        }
        
        .spirit-pulse {
          animation: spiritPulse 2s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className={`fixed top-4 right-4 z-50 max-w-sm ${
          isAnimating ? 'notification-enter' : 'notification-exit'
        }`}
      >
        <AnimatedFrame variant="accent" className="p-4">
          <div className="flex items-start gap-3">
            <div className={`spirit-pulse w-12 h-12 rounded-full bg-gradient-to-r ${getRarityColor(spirit.rarity)} flex items-center justify-center text-2xl shadow-lg`}>
              🌟
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-blue-300 truncate">
                  {spirit.essence}
                </h4>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-xs text-slate-300 mb-2">
                🎭 {spirit.mood} • ⭐ {spirit.rarity}
              </p>
              
              <p className="text-sm text-slate-100 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          {/* Прогресс-бар */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getRarityColor(spirit.rarity)} rounded-full transition-all duration-4000 ease-linear`}
              style={{
                width: isAnimating ? '0%' : '100%',
                transition: isAnimating ? 'width 4s linear' : 'none'
              }}
            />
          </div>
        </AnimatedFrame>
      </div>
    </>
  );
};
