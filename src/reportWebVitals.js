/**
 * Отчёт о производительности Web Vitals
 * @param {Function} onPerfEntry - Callback для получения метрик
 */
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, getINP }) => {
      // Cumulative Layout Shift (CLS) - стабильность макета
      getCLS((metric) => {
        onPerfEntry(metric);
        console.warn('[Web Vitals] CLS:', metric.value, metric.rating);
        // Отправляем на сервер аналитики при плохих значениях
        if (metric.rating !== 'good') {
          sendToAnalytics(metric);
        }
      });

      // First Input Delay (FID) - задержка первого ввода
      getFID((metric) => {
        onPerfEntry(metric);
        console.warn('[Web Vitals] FID:', metric.value, 'ms', metric.rating);
        if (metric.rating !== 'good') {
          sendToAnalytics(metric);
        }
      });

      // First Contentful Paint (FCP) - первая отрисовка контента
      getFCP((metric) => {
        onPerfEntry(metric);
        console.warn('[Web Vitals] FCP:', metric.value, 'ms', metric.rating);
        if (metric.rating !== 'good') {
          sendToAnalytics(metric);
        }
      });

      // Largest Contentful Paint (LCP) - отрисовка крупнейшего элемента
      getLCP((metric) => {
        onPerfEntry(metric);
        console.warn('[Web Vitals] LCP:', metric.value, 'ms', metric.rating);
        if (metric.rating !== 'good') {
          sendToAnalytics(metric);
        }
      });

      // Time to First Byte (TTFB) - время до первого байта
      getTTFB((metric) => {
        onPerfEntry(metric);
        console.warn('[Web Vitals] TTFB:', metric.value, 'ms', metric.rating);
        if (metric.rating !== 'good') {
          sendToAnalytics(metric);
        }
      });

      // Interaction to Next Paint (INP) - новая метрика отзывчивости
      getINP((metric) => {
        onPerfEntry(metric);
        console.warn('[Web Vitals] INP:', metric.value, 'ms', metric.rating);
        if (metric.rating !== 'good') {
          sendToAnalytics(metric);
        }
      });
    });
  }
};

/**
 * Отправка метрик на сервер аналитики
 * @param {Object} metric - Объект метрики
 */
const sendToAnalytics = (metric) => {
  // В production можно отправлять на сервер
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    const body = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Отправка beacon (не блокирует навигацию)
    navigator.sendBeacon('/api/analytics/performance', JSON.stringify(body));
  }
  
  // Также сохраняем в localStorage для отладки
  try {
    const key = 'web-vitals-' + metric.name;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ ...metric, timestamp: Date.now() });
    // Храним только последние 100 записей
    localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
  } catch {
    // localStorage недоступен
  }
};

export default reportWebVitals;
