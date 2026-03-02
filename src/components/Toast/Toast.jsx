import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

/**
 * Компонент Toast-уведомлений
 * @param {Object} props
 * @param {Object} props.toast - { id, type, message, duration }
 * @param {Function} props.onClose - функция закрытия
 */
const Toast = ({ toast, onClose }) => {
  const { id, type = 'info', message, duration = 3000 } = toast || {};

  // Автозакрытие по таймеру
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose(id);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [id, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  if (!toast) return null;

  return createPortal(
    <div 
      className={`toast toast-${type}`}
      role="alert"
      aria-live="assertive"
      aria-label={type === 'success' ? 'Успех' : type === 'error' ? 'Ошибка' : type === 'warning' ? 'Предупреждение' : 'Информация'}
    >
      <div className="toast-icon" aria-hidden="true">
        {icons[type] || icons.info}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button 
        className="toast-close" 
        onClick={() => onClose(id)}
        aria-label="Закрыть уведомление"
      >
        ✕
      </button>
      <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
    </div>,
    document.body
  );
};

/**
 * Компонент-контейнер для управления очередью Toast
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Уведомления">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

/**
 * Хук для управления Toast-уведомлениями
 * @returns {Object} Методы addToast, removeToast, toasts
 */
export const useToast = () => {
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const event = new CustomEvent('toast-add', { 
      detail: { message, type, duration, id: Date.now() } 
    });
    document.dispatchEvent(event);
  }, []);

  const removeToast = useCallback((id) => {
    const event = new CustomEvent('toast-remove', { detail: { id } });
    document.dispatchEvent(event);
  }, []);

  return { addToast, removeToast };
};

export default Toast;
