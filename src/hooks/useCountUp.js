import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Хук для анимации счётчика от 0 до целевого значения
 * @param {number} end - Целевое значение
 * @param {number} duration - Длительность анимации в мс (по умолчанию 1500)
 * @param {boolean} start - Запускать ли анимацию (по умолчанию true)
 * @returns {number} Текущее значение счётчика
 */
const useCountUp = (end, duration = 1500, start = true) => {
  const [count, setCount] = useState(0);
  const previousEnd = useRef(0);
  const animationRef = useRef(null);

  // Функция плавности (easeOutQuart)
  const easeOutQuart = useCallback((t) => 1 - Math.pow(1 - t, 4), []);

  useEffect(() => {
    // Если анимация не запущена, устанавливаем конечное значение
    if (!start) {
      setCount(end);
      return;
    }

    // Если значение не изменилось, не перезапускаем анимацию
    if (end === previousEnd.current) {
      return;
    }

    const startValue = count;
    const change = end - startValue;
    const startTime = performance.now();

    previousEnd.current = end;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      setCount(startValue + change * easedProgress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration, start, count, easeOutQuart]);

  return count;
};

export default useCountUp;
