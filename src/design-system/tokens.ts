// Design tokens для всего приложения
export const tokens = {
  // 🎨 Цветовая палитра
  colors: {
    // Основные цвета духов
    spiritual: {
      primary: '#8B5CF6',    // Фиолетовый
      secondary: '#A78BFA',  // Светло-фиолетовый
      accent: '#C4B5FD',     // Очень светлый фиолетовый
      dark: '#5B21B6',       // Темно-фиолетовый
    },
    
    // Эмоциональная палитра
    emotions: {
      happy: '#FCD34D',      // Желтый
      sad: '#60A5FA',        // Голубой
      angry: '#F87171',      // Красный
      calm: '#34D399',       // Зеленый
      inspired: '#A78BFA',   // Фиолетовый
      confused: '#9CA3AF',   // Серый
    },
    
    // Системные цвета
    system: {
      background: '#0F0F23',     // Темный фон
      surface: '#1A1A2E',       // Поверхности
      border: '#2D2D44',        // Границы
      text: '#E5E7EB',          // Основной текст
      textSecondary: '#9CA3AF', // Вторичный текст
      success: '#10B981',       // Успех
      warning: '#F59E0B',       // Предупреждение
      error: '#EF4444',         // Ошибка
    },
    
    // Градиенты
    gradients: {
      cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      spiritual: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      aurora: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    }
  },
  
  // 📏 Размеры и отступы
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },
  
  // 🔤 Типографика
  typography: {
    fonts: {
      primary: '"Inter", system-ui, sans-serif',
      display: '"Space Grotesk", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  // 🎭 Анимации
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
    },
    
    easings: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spirit: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  },
  
  // 🔳 Радиусы
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // 🌊 Тени
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgba(139, 92, 246, 0.3)',
    spiritualGlow: '0 0 30px rgba(167, 139, 250, 0.4)',
  },
  
  // 📱 Брейкпоинты
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 🎚️ Z-индексы
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    tooltip: 400,
    notification: 500,
  }
};

// Утилиты для работы с токенами
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let result: unknown = tokens.colors;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }
  
  return typeof result === 'string' ? result : '';
};

export const getSpacing = (size: keyof typeof tokens.spacing) => {
  return tokens.spacing[size];
};

export const getTypography = (property: string, value: string): string | number => {
  const typographyProps = tokens.typography as Record<string, Record<string, unknown>>;
  return typographyProps[property]?.[value] as string | number || '';
};

// Типы для TypeScript
export type ColorPath = 
  | 'spiritual.primary' 
  | 'spiritual.secondary' 
  | 'emotions.happy' 
  | 'system.background'
  // ... добавить все пути

export type SpacingSize = keyof typeof tokens.spacing;
export type TypographySize = keyof typeof tokens.typography.sizes;
export type AnimationDuration = keyof typeof tokens.animations.durations;
