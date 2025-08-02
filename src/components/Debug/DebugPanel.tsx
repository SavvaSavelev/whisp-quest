import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../design-system/tokens';
import { useServices } from '../../services/ServiceContainer';
import { useAppStore } from '../../store/appStore';

interface DebugMetrics {
  fps: number;
  memory: number;
  renderTime: number;
  spiritCount: number;
  cacheSize: number;
}

interface DebugPanelProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isVisible = true,
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<DebugMetrics>({
    fps: 60,
    memory: 0,
    renderTime: 0,
    spiritCount: 0,
    cacheSize: 0
  });
  
  const { services, isReady } = useServices();
  const appStore = useAppStore();

  // Обновление метрик
  useEffect(() => {
    if (!isReady) return;

    const updateMetrics = () => {
      setMetrics({
        fps: appStore.fps,
        memory: (performance as unknown as { memory?: { usedJSHeapSize: number } })?.memory?.usedJSHeapSize || 0,
        renderTime: appStore.renderTime,
        spiritCount: appStore.spiritCount,
        cacheSize: Object.keys(localStorage).length
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [isReady, appStore]);

  // Позиционирование панели
  const positionStyles = {
    'top-left': { top: tokens.spacing.md, left: tokens.spacing.md },
    'top-right': { top: tokens.spacing.md, right: tokens.spacing.md },
    'bottom-left': { bottom: tokens.spacing.md, left: tokens.spacing.md },
    'bottom-right': { bottom: tokens.spacing.md, right: tokens.spacing.md }
  };

  // Функции отладки
  const clearCache = () => {
    services.cacheService.clear();
    services.notificationService.success('Кэш очищен');
  };

  const clearStorage = () => {
    services.storageService.clear();
    services.notificationService.success('Хранилище очищено');
  };

  const triggerError = () => {
    services.errorService.captureException(new Error('Тестовая ошибка'), {
      source: 'debug-panel',
      timestamp: Date.now()
    });
  };

  const togglePerformancePanel = () => {
    appStore.setShowPerformancePanel(!appStore.showPerformancePanel);
  };

  if (!isVisible || !isReady) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: tokens.zIndex.modal + 1,
        fontFamily: tokens.typography.fonts.mono,
        fontSize: tokens.typography.sizes.xs,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Кнопка toggle */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: tokens.colors.spiritual.primary,
          border: 'none',
          borderRadius: tokens.borderRadius.full,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '18px',
          boxShadow: tokens.shadows.lg,
          marginBottom: isExpanded ? tokens.spacing.sm : '0',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🔧
      </motion.button>

      {/* Развернутая панель */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              background: tokens.colors.system.surface,
              border: `1px solid ${tokens.colors.system.border}`,
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing.md,
              backdropFilter: 'blur(12px)',
              boxShadow: tokens.shadows.xl,
              minWidth: '280px',
              color: tokens.colors.system.text,
            }}
          >
            {/* Заголовок */}
            <div style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.bold,
              marginBottom: tokens.spacing.md,
              color: tokens.colors.spiritual.primary,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.xs
            }}>
              🛠️ Debug Panel
            </div>

            {/* Метрики производительности */}
            <div style={{ marginBottom: tokens.spacing.md }}>
              <div style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: tokens.typography.weights.semibold,
                marginBottom: tokens.spacing.xs,
                color: tokens.colors.system.textSecondary
              }}>
                📊 Производительность
              </div>
              
              <div style={{ display: 'grid', gap: '4px' }}>
                <MetricRow label="FPS" value={metrics.fps.toFixed(0)} color={metrics.fps > 50 ? tokens.colors.system.success : tokens.colors.system.warning} />
                <MetricRow label="Memory" value={`${(metrics.memory / 1024 / 1024).toFixed(1)}MB`} color={tokens.colors.system.text} />
                <MetricRow label="Render" value={`${metrics.renderTime.toFixed(1)}ms`} color={tokens.colors.system.text} />
                <MetricRow label="Spirits" value={metrics.spiritCount.toString()} color={tokens.colors.spiritual.primary} />
                <MetricRow label="Cache" value={metrics.cacheSize.toString()} color={tokens.colors.system.text} />
              </div>
            </div>

            {/* Действия */}
            <div style={{ marginBottom: tokens.spacing.md }}>
              <div style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: tokens.typography.weights.semibold,
                marginBottom: tokens.spacing.xs,
                color: tokens.colors.system.textSecondary
              }}>
                🎮 Действия
              </div>
              
              <div style={{ display: 'grid', gap: tokens.spacing.xs }}>
                <DebugButton onClick={clearCache} color={tokens.colors.system.warning}>
                  🗑️ Очистить кэш
                </DebugButton>
                <DebugButton onClick={clearStorage} color={tokens.colors.system.error}>
                  💾 Очистить хранилище
                </DebugButton>
                <DebugButton onClick={triggerError} color={tokens.colors.system.error}>
                  ⚠️ Тест ошибки
                </DebugButton>
                <DebugButton onClick={togglePerformancePanel} color={tokens.colors.spiritual.primary}>
                  📈 Performance Panel
                </DebugButton>
              </div>
            </div>

            {/* Информация о состоянии */}
            <div>
              <div style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: tokens.typography.weights.semibold,
                marginBottom: tokens.spacing.xs,
                color: tokens.colors.system.textSecondary
              }}>
                📋 Состояние
              </div>
              
              <div style={{ display: 'grid', gap: '2px' }}>
                <StateRow label="Debug Mode" value={appStore.debugMode ? '✅' : '❌'} />
                <StateRow label="Loading" value={appStore.isLoading ? '⏳' : '✅'} />
                <StateRow label="Error" value={appStore.error ? '❌' : '✅'} />
                <StateRow label="Theme" value={appStore.theme} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Компонент для отображения метрики
interface MetricRowProps {
  label: string;
  value: string;
  color: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: tokens.typography.sizes.xs,
  }}>
    <span style={{ color: tokens.colors.system.textSecondary }}>{label}:</span>
    <span style={{ color, fontWeight: tokens.typography.weights.medium }}>{value}</span>
  </div>
);

// Компонент для отображения состояния
interface StateRowProps {
  label: string;
  value: string;
}

const StateRow: React.FC<StateRowProps> = ({ label, value }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: tokens.typography.sizes.xs,
  }}>
    <span style={{ color: tokens.colors.system.textSecondary }}>{label}:</span>
    <span style={{ color: tokens.colors.system.text }}>{value}</span>
  </div>
);

// Кнопка отладки
interface DebugButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
}

const DebugButton: React.FC<DebugButtonProps> = ({ children, onClick, color }) => (
  <motion.button
    onClick={onClick}
    style={{
      background: 'transparent',
      border: `1px solid ${color}40`,
      borderRadius: tokens.borderRadius.sm,
      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
      color,
      fontSize: tokens.typography.sizes.xs,
      cursor: 'pointer',
      textAlign: 'left',
    }}
    whileHover={{
      backgroundColor: `${color}10`,
      borderColor: `${color}60`,
    }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.button>
);

export default DebugPanel;
