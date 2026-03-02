import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для глобального управления Toast-уведомлениями
 * Использует CustomEvent для коммуникации между компонентами
 * @returns {Object} { toasts, addToast, removeToast }
 */
const useToastManager = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Слушаем события для добавления/удаления toast из любого компонента
  useEffect(() => {
    const handleAddToast = (e) => {
      const { id, message, type, duration } = e.detail;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    const handleRemoveToast = (e) => {
      const { id } = e.detail;
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    document.addEventListener('toast-add', handleAddToast);
    document.addEventListener('toast-remove', handleRemoveToast);

    return () => {
      document.removeEventListener('toast-add', handleAddToast);
      document.removeEventListener('toast-remove', handleRemoveToast);
    };
  }, []);

  return { toasts, addToast, removeToast };
};

export default useToastManager;
