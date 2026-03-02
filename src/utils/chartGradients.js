/**
 * Утилиты для создания градиентов и улучшенных визуальных эффектов для Chart.js
 */

/**
 * Создать градиент для bar chart
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} chartArea - Область графика
 * @param {string} color - Базовый цвет
 * @param {string} direction - Направление градиента ('vertical' | 'horizontal')
 * @returns {CanvasGradient}
 */
export const createGradient = (ctx, chartArea, color, direction = 'vertical') => {
  const gradient = ctx.createLinearGradient(
    0,
    direction === 'vertical' ? chartArea.bottom : chartArea.left,
    direction === 'vertical' ? 0 : chartArea.right,
    direction === 'vertical' ? 0 : chartArea.bottom
  );

  // Парсим цвет и создаём градиент с прозрачностью
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.6)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
  } else {
    // Если цвет не в формате rgba, используем fallback
    gradient.addColorStop(0, color.replace(')', ', 0.9)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, color.replace(')', ', 0.1)').replace('rgb', 'rgba'));
  }

  return gradient;
};

/**
 * Создать градиент для line chart (заполнение под линией)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} chartArea - Область графика
 * @param {string} color - Базовый цвет
 * @returns {CanvasGradient}
 */
export const createLineGradient = (ctx, chartArea, color) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.05)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.5)`);
  } else {
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  }

  return gradient;
};

/**
 * Современная палитра цветов для графиков
 */
export const chartColors = {
  // Основные цвета
  teal: {
    rgb: '46, 196, 182',
    rgba: (alpha) => `rgba(46, 196, 182, ${alpha})`,
    hex: '#2ec4b6'
  },
  green: {
    rgb: '82, 183, 136',
    rgba: (alpha) => `rgba(82, 183, 136, ${alpha})`,
    hex: '#52b788'
  },
  orange: {
    rgb: '251, 133, 0',
    rgba: (alpha) => `rgba(251, 133, 0, ${alpha})`,
    hex: '#fb8500'
  },
  blue: {
    rgb: '58, 134, 255',
    rgba: (alpha) => `rgba(58, 134, 255, ${alpha})`,
    hex: '#3a86ff'
  },
  purple: {
    rgb: '114, 9, 183',
    rgba: (alpha) => `rgba(114, 9, 183, ${alpha})`,
    hex: '#7209b7'
  },
  cyan: {
    rgb: '0, 180, 216',
    rgba: (alpha) => `rgba(0, 180, 216, ${alpha})`,
    hex: '#00b4d8'
  },
  // Дополнительные цвета для множественных наборов данных
  indigo: {
    rgb: '99, 102, 241',
    rgba: (alpha) => `rgba(99, 102, 241, ${alpha})`,
    hex: '#6366f1'
  },
  violet: {
    rgb: '168, 85, 247',
    rgba: (alpha) => `rgba(168, 85, 247, ${alpha})`,
    hex: '#a855f7'
  },
  pink: {
    rgb: '236, 72, 153',
    rgba: (alpha) => `rgba(236, 72, 153, ${alpha})`,
    hex: '#ec4899'
  },
  emerald: {
    rgb: '34, 197, 94',
    rgba: (alpha) => `rgba(34, 197, 94, ${alpha})`,
    hex: '#22c55e'
  },
  turquoise: {
    rgb: '45, 212, 191',
    rgba: (alpha) => `rgba(45, 212, 191, ${alpha})`,
    hex: '#2dd4bf'
  },
  rose: {
    rgb: '244, 63, 94',
    rgba: (alpha) => `rgba(244, 63, 94, ${alpha})`,
    hex: '#f43f5e'
  }
};

// Примечание: функции getColors и getGradientColors были удалены как неиспользуемые
// При необходимости можно восстановить из git истории
