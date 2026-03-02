import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'goszakupki_theme';

/**
 * Хук для управления темой (dark/light)
 * @returns {Object} { isDark, toggleTheme, setTheme }
 */
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Проверяем localStorage при первой загрузке
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) {
          return saved === 'dark';
        }
        // Проверяем системные настройки
        if (window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
      }
    } catch (e) {
      // localStorage недоступен (тестовая среда и т.д.)
      console.warn('localStorage недоступен, используется тема по умолчанию');
    }
    return true; // По умолчанию тёмная тема
  });

  // Применяем тему к document
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('theme-dark');
        root.classList.remove('theme-light');
      } else {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.warn('Не удалось применить тему:', e);
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const setTheme = useCallback((theme) => {
    setIsDark(theme === 'dark');
  }, []);

  return { isDark, toggleTheme, setTheme };
};

export default useTheme;
