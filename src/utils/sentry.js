import * as Sentry from "@sentry/react";

/**
 * Инициализация Sentry для мониторинга ошибок
 * @param {Object} config - Конфигурация
 * @param {string} config.dsn - DSN проекта Sentry
 * @param {string} config.environment - Окружение (development, production)
 * @param {string} config.release - Версия приложения
 */
export const initSentry = (config) => {
  if (!config?.dsn) {
    console.warn('Sentry DSN не указан. Мониторинг ошибок отключен.');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment || 'development',
    release: config.release || 'goszakupki_cgm@unknown',
    
    // Интеграции
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.httpClientIntegration({
        failedRequestStatusCodes: [400, 599],
      }),
    ],

    // Производительность
    tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: config.environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Фильтрация ошибок
    beforeSend(event, hint) {
      // Игнорируем ошибки сети для localhost
      if (config.environment !== 'production') {
        const error = hint.originalException;
        if (error?.message?.includes('localhost')) {
          return null;
        }
      }

      // Игнорируем известные неопасные ошибки
      const ignoreErrors = [
        /ResizeObserver loop limit exceeded/,
        /Non-Error promise rejection captured/,
        /Failed to fetch/,
        /NetworkError/,
        /Loading chunk/,
      ];

      if (event.message && ignoreErrors.some(pattern => pattern.test(event.message))) {
        return null;
      }

      return event;
    },

    // Обогащение данных
    beforeBreadcrumb(breadcrumb) {
      // Не логируем клики в production для приватности
      if (config.environment === 'production' && breadcrumb.category === 'ui.click') {
        return null;
      }
      return breadcrumb;
    },
  });

  console.log('Sentry инициализирован');
};

/**
 * Логирование ошибки в Sentry
 * @param {Error} error - Объект ошибки
 * @param {Object} context - Дополнительный контекст
 */
export const logError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Логирование сообщения в Sentry
 * @param {string} message - Сообщение
 * @param {string} level - Уровень (info, warning, error)
 */
export const logMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Установка пользователя для отслеживания
 * @param {Object} user - Данные пользователя
 */
export const setUser = (user) => {
  if (user?.id) {
    Sentry.setUser(user);
  }
};

/**
 * Сброс пользователя
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

export default Sentry;
