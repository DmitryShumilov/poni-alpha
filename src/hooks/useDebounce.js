import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Хук для debouncing значений
 * @param {any} value - Значение для debouncing
 * @param {number} delay - Задержка в мс
 * @returns {any} Debounced значение
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Хук для debouncing функций
 * @param {Function} func - Функция для debouncing
 * @param {number} wait - Задержка в мс
 * @returns {Function} Debounced функция
 */
export const useCallbackDebounce = (func, wait = 300) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, wait);
  }, [func, wait]);
};

export default useDebounce;
