import React, { useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../../design-system/tokens';
import { 
  NotificationContext,
  type Notification,
  type NotificationContextType
} from './NotificationContext';

// Провайдер уведомлений
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Автоматическое удаление (если не persistent)
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Быстрые методы для разных типов
  const success = useCallback((title: string, message?: string) => 
    addNotification({ type: 'success', title, message }), [addNotification]);

  const error = useCallback((title: string, message?: string) => 
    addNotification({ type: 'error', title, message, persistent: true }), [addNotification]);

  const warning = useCallback((title: string, message?: string) => 
    addNotification({ type: 'warning', title, message }), [addNotification]);

  const info = useCallback((title: string, message?: string) => 
    addNotification({ type: 'info', title, message }), [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Контейнер для отображения уведомлений
const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;
  
  const { notifications } = context;

  return (
    <div style={{
      position: 'fixed',
      top: tokens.spacing.lg,
      right: tokens.spacing.lg,
      zIndex: tokens.zIndex.notification,
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing.sm,
      maxWidth: '400px',
      width: '100%',
    }}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification: Notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Компонент одного уведомления
interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const context = useContext(NotificationContext);
  if (!context) return null;
  
  const { removeNotification } = context;

  // Стили для разных типов уведомлений
  const typeStyles = {
    success: {
      background: `linear-gradient(135deg, ${tokens.colors.system.success}20, ${tokens.colors.system.success}10)`,
      borderColor: tokens.colors.system.success,
      icon: '✅',
    },
    error: {
      background: `linear-gradient(135deg, ${tokens.colors.system.error}20, ${tokens.colors.system.error}10)`,
      borderColor: tokens.colors.system.error,
      icon: '❌',
    },
    warning: {
      background: `linear-gradient(135deg, ${tokens.colors.system.warning}20, ${tokens.colors.system.warning}10)`,
      borderColor: tokens.colors.system.warning,
      icon: '⚠️',
    },
    info: {
      background: `linear-gradient(135deg, ${tokens.colors.spiritual.primary}20, ${tokens.colors.spiritual.primary}10)`,
      borderColor: tokens.colors.spiritual.primary,
      icon: 'ℹ️',
    },
  };

  const style = typeStyles[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      style={{
        background: style.background,
        border: `1px solid ${style.borderColor}60`,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing.md,
        backdropFilter: 'blur(12px)',
        boxShadow: tokens.shadows.lg,
        color: tokens.colors.system.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Прогресс-бар для временных уведомлений */}
      {!notification.persistent && notification.duration && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            background: style.borderColor,
            borderRadius: '0 0 8px 8px',
          }}
        />
      )}

      {/* Содержимое */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing.sm }}>
        {/* Иконка */}
        <div style={{
          fontSize: tokens.typography.sizes.lg,
          lineHeight: 1,
          marginTop: '2px',
        }}>
          {style.icon}
        </div>

        {/* Текст */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: tokens.typography.sizes.sm,
            fontWeight: tokens.typography.weights.semibold,
            marginBottom: notification.message ? '4px' : 0,
            color: tokens.colors.system.text,
          }}>
            {notification.title}
          </div>
          
          {notification.message && (
            <div style={{
              fontSize: tokens.typography.sizes.xs,
              color: tokens.colors.system.textSecondary,
              lineHeight: tokens.typography.lineHeights.normal,
            }}>
              {notification.message}
            </div>
          )}

          {/* Действия */}
          {notification.actions && notification.actions.length > 0 && (
            <div style={{
              marginTop: tokens.spacing.sm,
              display: 'flex',
              gap: tokens.spacing.xs,
            }}>
              {notification.actions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.onClick}
                  style={{
                    background: action.variant === 'primary' ? style.borderColor : 'transparent',
                    border: `1px solid ${style.borderColor}`,
                    borderRadius: tokens.borderRadius.sm,
                    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                    fontSize: tokens.typography.sizes.xs,
                    color: action.variant === 'primary' ? 'white' : style.borderColor,
                    cursor: 'pointer',
                  }}
                  whileHover={{
                    backgroundColor: action.variant === 'primary' ? undefined : `${style.borderColor}20`,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка закрытия */}
        <motion.button
          onClick={() => removeNotification(notification.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: tokens.colors.system.textSecondary,
            cursor: 'pointer',
            fontSize: tokens.typography.sizes.sm,
            padding: '2px',
            borderRadius: tokens.borderRadius.sm,
          }}
          whileHover={{
            backgroundColor: `${tokens.colors.system.border}40`,
            color: tokens.colors.system.text,
          }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  );
};

// Пример использования
export const NotificationExample: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;
  
  const { success, warning, info, error } = context;

  const showExamples = () => {
    success('Дух успешно создан!', 'Новый дух появился в вашей коллекции');
    
    setTimeout(() => {
      warning('Осталось мало места', 'Рекомендуем очистить старые духи');
    }, 1000);

    setTimeout(() => {
      info('Новая функция', 'Теперь вы можете экспортировать духов');
    }, 2000);

    setTimeout(() => {
      error('Ошибка подключения', 'Не удалось загрузить данные с сервера');
    }, 3000);
  };

  return (
    <div style={{ padding: tokens.spacing.xl }}>
      <motion.button
        onClick={showExamples}
        style={{
          background: tokens.colors.spiritual.primary,
          border: 'none',
          borderRadius: tokens.borderRadius.md,
          padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
          color: 'white',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Показать примеры уведомлений
      </motion.button>
    </div>
  );
};

export default NotificationProvider;
