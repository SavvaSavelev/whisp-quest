import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../design-system/tokens';

// Базовые типы для компонента Card
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'spiritual' | 'cosmic' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  withHover?: boolean;
  withGlow?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// Стили для различных вариантов карточек
const cardVariants = {
  default: {
    background: tokens.colors.system.surface,
    border: `1px solid ${tokens.colors.system.border}`,
    backdropFilter: 'blur(8px)',
  },
  spiritual: {
    background: `linear-gradient(135deg, ${tokens.colors.spiritual.primary}20, ${tokens.colors.spiritual.secondary}10)`,
    border: `1px solid ${tokens.colors.spiritual.primary}40`,
    backdropFilter: 'blur(12px)',
  },
  cosmic: {
    background: `linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))`,
    border: `1px solid ${tokens.colors.spiritual.accent}40`,
    backdropFilter: 'blur(10px)',
  },
  minimal: {
    background: 'transparent',
    border: `1px solid ${tokens.colors.system.border}60`,
    backdropFilter: 'none',
  }
};

const cardSizes = {
  sm: {
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
  },
  md: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
  },
  lg: {
    padding: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.xl,
  }
};

// Основной компонент карточки
const CardRoot: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  withHover = true,
  withGlow = false
}) => {
  const variantStyles = cardVariants[variant];
  const sizeStyles = cardSizes[size];

  return (
    <motion.div
      className={`card-root ${className}`}
      style={{
        ...variantStyles,
        ...sizeStyles,
        boxShadow: withGlow ? tokens.shadows.spiritualGlow : tokens.shadows.md,
        color: tokens.colors.system.text,
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={withHover ? {
        scale: 1.02,
        boxShadow: withGlow ? tokens.shadows.spiritualGlow : tokens.shadows.lg,
      } : undefined}
      transition={{
        duration: parseFloat(tokens.animations.durations.normal) / 1000,
        ease: [0.25, 0.46, 0.45, 0.94] // Кубическая кривая
      }}
    >
      {children}
    </motion.div>
  );
};

// Заголовок карточки
const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div
    className={`card-header ${className}`}
    style={{
      marginBottom: tokens.spacing.md,
      paddingBottom: tokens.spacing.sm,
      borderBottom: `1px solid ${tokens.colors.system.border}40`,
      fontSize: tokens.typography.sizes.lg,
      fontWeight: tokens.typography.weights.semibold,
      color: tokens.colors.system.text,
    }}
  >
    {children}
  </div>
);

// Тело карточки
const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div
    className={`card-body ${className}`}
    style={{
      fontSize: tokens.typography.sizes.base,
      lineHeight: tokens.typography.lineHeights.normal,
      color: tokens.colors.system.textSecondary,
    }}
  >
    {children}
  </div>
);

// Подвал карточки
const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div
    className={`card-footer ${className}`}
    style={{
      marginTop: tokens.spacing.md,
      paddingTop: tokens.spacing.sm,
      borderTop: `1px solid ${tokens.colors.system.border}40`,
      fontSize: tokens.typography.sizes.sm,
      color: tokens.colors.system.textSecondary,
    }}
  >
    {children}
  </div>
);

// Compound компонент Card
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
};

// Пример использования для Storybook или документации
export const CardExample: React.FC = () => (
  <div style={{ padding: tokens.spacing.xl, display: 'grid', gap: tokens.spacing.lg, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
    {/* Стандартная карточка */}
    <Card.Root variant="default">
      <Card.Header>Обычная карточка</Card.Header>
      <Card.Body>
        Это пример обычной карточки с базовыми стилями.
      </Card.Body>
      <Card.Footer>Подвал карточки</Card.Footer>
    </Card.Root>

    {/* Духовная карточка */}
    <Card.Root variant="spiritual" withGlow>
      <Card.Header>Духовная карточка</Card.Header>
      <Card.Body>
        Карточка с духовной тематикой и свечением.
      </Card.Body>
      <Card.Footer>✨ Магическая энергия</Card.Footer>
    </Card.Root>

    {/* Космическая карточка */}
    <Card.Root variant="cosmic" size="lg">
      <Card.Header>Космическая карточка</Card.Header>
      <Card.Body>
        Большая карточка с космическим градиентом.
      </Card.Body>
      <Card.Footer>🌌 Вселенная</Card.Footer>
    </Card.Root>

    {/* Минималистичная карточка */}
    <Card.Root variant="minimal" withHover={false}>
      <Card.Header>Минималистичная</Card.Header>
      <Card.Body>
        Простая карточка без лишних эффектов.
      </Card.Body>
    </Card.Root>
  </div>
);

export default Card;
