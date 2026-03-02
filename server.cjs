const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');
require('dotenv').config();

// Настройка логгера
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'goszakupki-api' },
  transports: [
    // Ошибки пишутся в error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Всё пишется в combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// В development режиме выводим логи в консоль
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const app = express();
const PORT = process.env.PORT || 5000;

// Helmet для безопасности (CSP и другие заголовки)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:5000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

// Rate limiting для API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    error: 'Слишком много запросов',
    message: 'Пожалуйста, попробуйте позже'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Разрешаем CORS для указанных origin
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    // разрешаем запросы без origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Не разрешённый CORS origin'));
    }
  }
}));

// Применяем rate limiting к API эндпоинтам
app.use('/api', limiter);

// Middleware для парсинга JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Кэш для данных
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 30000;
const MAX_CACHE_SIZE = 100000; // Максимальное количество записей в кэше

// Функция чтения Excel файла
function readExcelData() {
  const filePath = path.join(__dirname, 'database.xlsx');

  if (!fs.existsSync(filePath)) {
    throw new Error('Файл database.xlsx не найден');
  }

  // Проверка размера файла
  const stats = fs.statSync(filePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  if (fileSizeMB > 50) {
    console.warn(`⚠️ Файл database.xlsx имеет большой размер: ${fileSizeMB.toFixed(2)} MB`);
  }

  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // Читаем как массив массивов (без заголовков) для доступа по индексу
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  
  // Удаляем заголовок (первая строка)
  const headers = data.shift();
  console.log('Excel загружен:', { 
    rows: data.length, 
    columns: headers?.length || 0,
    yearColIndex: 26,
    yearColName: headers?.[26]
  });

  return data;
}

// Функция санитизации строк (защита от XSS)
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Удаляем потенциально опасные символы
    .trim()
    .substring(0, 500); // Ограничиваем длину
}

// Функция валидации записи
function validateRecord(record) {
  const errors = [];

  // Проверка обязательных полей
  if (!record.customer) errors.push('Отсутствует заказчик');
  if (!record.region) errors.push('Отсутствует регион');

  // Проверка числовых полей
  if (record.price < 0) errors.push('Отрицательная цена');
  if (record.quantity < 0) errors.push('Отрицательное количество');
  if (record.amount < 0) errors.push('Отрицательная сумма');

  // Проверка года (допускаем диапазон 2020-2050)
  if (record.year && (record.year < 2020 || record.year > 2050)) {
    errors.push(`Некорректный год: ${record.year}`);
  }

  // Проверка месяца
  if (record.month && (record.month < 1 || record.month > 12)) {
    errors.push(`Некорректный месяц: ${record.month}`);
  }

  return errors;
}

// Конвертация данных Excel в формат для дашборда
function convertData(rawData) {
  const validRecords = [];
  let skippedCount = 0;
  const validationErrors = [];

  // Индексы колонок (0-based)
  const COL_CUSTOMER = 1;      // Заказчик: наименование
  const COL_REGION = 2;        // Регион
  const COL_CONTRACT_DATE = 9; // Контракт: дата
  const COL_PRODUCT = 15;      // Что закупали
  const COL_PRICE = 18;        // цена, руб
  const COL_QUANTITY = 19;     // количество
  const COL_AMOUNT = 20;       // сумма, руб
  const COL_SUPPLIER = 21;     // Информация о поставщиках
  const COL_YEAR = 26;         // Год

  rawData.forEach((rowArr, index) => {
    // rowArr - массив значений строки по индексам
    const contractDateRaw = rowArr[COL_CONTRACT_DATE];
    let contractYear = null;  // Год из "Контракт: дата"
    let month = null;         // Месяц из "Контракт: дата"
    let contractDate = '';
    let finalYear = null;     // Итоговый год для записи

    // Обрабатываем дату контракта (индекс 9)
    if (contractDateRaw !== undefined && contractDateRaw !== null) {
      if (typeof contractDateRaw === 'object' && contractDateRaw instanceof Date) {
        contractYear = contractDateRaw.getFullYear();
        month = contractDateRaw.getMonth() + 1;
        contractDate = contractDateRaw.toISOString().split('T')[0];
      } else if (typeof contractDateRaw === 'number') {
        // Дата как serial number Excel
        const date = new Date(Math.round((contractDateRaw - 25569) * 86400 * 1000));
        contractYear = date.getFullYear();
        month = date.getMonth() + 1;
        contractDate = date.toISOString().split('T')[0];
      } else if (typeof contractDateRaw === 'string') {
        if (contractDateRaw.includes('T')) {
          contractDate = contractDateRaw.split('T')[0];
        } else {
          contractDate = contractDateRaw;
        }
        const parts = contractDate.split('-');
        if (parts.length === 3) {
          contractYear = parseInt(parts[0]);
          month = parseInt(parts[1]);
        }
      }
    }

    // Получаем год поставки из столбца "Год" (индекс 26)
    const yearRaw = rowArr[COL_YEAR];
    let supplyYear = null;
    if (yearRaw !== undefined && yearRaw !== null) {
      if (typeof yearRaw === 'object' && yearRaw.getFullYear) {
        supplyYear = yearRaw.getFullYear();
      } else {
        supplyYear = parseInt(yearRaw);
      }
    }

    // Логика определения итогового года:
    // 1. Если год из "Контракт: дата" совпадает с годом из "Год" → используем этот год
    // 2. Если годы отличаются → используем год из "Год" (поставки), месяц из "Контракт: дата"
    // 3. Если "Год" пустой → используем год из "Контракт: дата"
    if (supplyYear !== null && !isNaN(supplyYear)) {
      finalYear = supplyYear;
    } else if (contractYear !== null && !isNaN(contractYear)) {
      finalYear = contractYear;
    }

    const record = {
      customer: sanitizeString(String(rowArr[COL_CUSTOMER] || '')),
      region: sanitizeString(String(rowArr[COL_REGION] || '')),
      contract_date: contractDate,
      product: sanitizeString(String(rowArr[COL_PRODUCT] || '')),
      price: Math.abs(parseFloat(rowArr[COL_PRICE]) || 0),
      quantity: Math.abs(parseFloat(rowArr[COL_QUANTITY]) || 0),
      amount: Math.abs(parseFloat(rowArr[COL_AMOUNT]) || 0),
      supplier: sanitizeString(String(rowArr[COL_SUPPLIER] || '')),
      year: finalYear,
      month: month
    };

    // Валидация записи
    const errors = validateRecord(record);
    if (errors.length > 0) {
      skippedCount++;
      if (validationErrors.length < 5) { // Сохраняем только первые 5 ошибок
        validationErrors.push(`Строка ${index + 1}: ${errors.join(', ')}`);
      }
    } else {
      validRecords.push(record);
    }
  });

  if (skippedCount > 0) {
    logger.warn(`Пропущено ${skippedCount} записей из-за ошибок валидации`, { skippedCount, validationErrors: validationErrors.slice(0, 5) });
  }

  return validRecords;
}

// Эндпоинт для получения данных с поддержкой pagination
app.get('/api/data', (req, res) => {
  try {
    const now = Date.now();
    
    // Параметры pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Проверяем кэш (для pagination кэш не используется, чтобы не усложнять)
    if (page === 1 && limit >= MAX_CACHE_SIZE && cachedData && (now - cacheTimestamp) < CACHE_TTL) {
      logger.info('Отправка данных из кэша', { cacheAge: now - cacheTimestamp });
      return res.json({ 
        records: cachedData,
        meta: {
          count: cachedData.length,
          total: cachedData.length,
          page: 1,
          limit: MAX_CACHE_SIZE,
          pages: 1,
          timestamp: new Date().toISOString(),
          cached: true
        }
      });
    }

    // Читаем свежие данные
    logger.info('Чтение Excel файла...', { page, limit });
    const rawData = readExcelData();

    // Проверка на пустые данные
    if (!rawData || rawData.length === 0) {
      throw new Error('Excel файл пуст или содержит некорректные данные');
    }

    const convertedData = convertData(rawData);
    const totalRecords = convertedData.length;

    // Проверка размера кэша
    if (totalRecords > MAX_CACHE_SIZE) {
      logger.warn(`Количество записей (${totalRecords}) превышает лимит (${MAX_CACHE_SIZE})`);
      return res.status(413).json({
        error: 'Превышен лимит данных',
        message: `Количество записей (${totalRecords}) превышает максимальное значение (${MAX_CACHE_SIZE})`,
        count: totalRecords,
        maxAllowed: MAX_CACHE_SIZE
      });
    }

    // Применяем pagination
    const paginatedData = convertedData.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalRecords / limit);

    // Обновляем кэш (только полные данные)
    cachedData = convertedData;
    cacheTimestamp = now;

    logger.info(`Отправлено ${paginatedData.length} записей`, { 
      page, 
      limit, 
      total: totalRecords,
      pages: totalPages 
    });
    
    res.json({
      records: paginatedData,
      meta: {
        count: paginatedData.length,
        total: totalRecords,
        page,
        limit,
        pages: totalPages,
        timestamp: new Date().toISOString(),
        cached: false
      }
    });

  } catch (error) {
    logger.error('Ошибка при чтении данных:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Ошибка при чтении данных',
      message: error.message
    });
  }
});

// Эндпоинт для проверки статуса сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cachedRecords: cachedData ? cachedData.length : 0,
    cacheAge: cachedData ? Math.round((Date.now() - cacheTimestamp) / 1000) : 0,
    version: '1.3.0'
  });
});

// Эндпоинт для сбора метрик производительности (Web Vitals)
app.post('/api/analytics/performance', (req, res) => {
  try {
    const { name, value, rating, delta, navigationType, url, userAgent, timestamp } = req.body;
    
    // Валидация обязательных полей
    if (!name || value === undefined) {
      return res.status(400).json({
        error: 'Некорректные данные',
        message: 'Поля name и value обязательны'
      });
    }
    
    // Логирование метрик (в production можно сохранять в БД или отправлять в мониторинг)
    logger.info('Web Vitals метрика', {
      type: 'performance',
      name,
      value,
      rating,
      delta,
      navigationType,
      url,
      userAgent,
      timestamp
    });
    
    // В development режиме сохраняем в файл
    if (process.env.NODE_ENV !== 'production') {
      const fs = require('fs');
      const path = require('path');
      const metricsFile = path.join(__dirname, 'logs', 'web-vitals.jsonl');
      const logEntry = JSON.stringify({
        name,
        value,
        rating,
        delta,
        navigationType,
        url,
        userAgent,
        timestamp,
        receivedAt: new Date().toISOString()
      }) + '\n';
      
      fs.appendFileSync(metricsFile, logEntry);
    }
    
    res.json({ status: 'ok', message: 'Метрика принята' });
  } catch (error) {
    logger.error('Ошибка при сохранении метрики:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Ошибка при сохранении метрики',
      message: error.message
    });
  }
});

// Создание сервера для graceful shutdown
// HOST='0.0.0.0' позволяет принимать подключения со всех сетевых интерфейсов
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  logger.info('Сервер запущен', {
    host: HOST,
    port: PORT,
    apiUrl: `http://localhost:${PORT}/api/data`,
    healthUrl: `http://localhost:${PORT}/api/health`
  });
  logger.info('╔════════════════════════════════════════╗');
  logger.info('║  Сервер запущен!                       ║');
  logger.info(`║  Хост: ${HOST}`.padEnd(34, ' ') + '║');
  logger.info(`║  Порт: ${PORT}`.padEnd(34, ' ') + '║');
  logger.info(`║  API: http://localhost:${PORT}/api/data   ║`);
  logger.info('║  Данные читаются из database.xlsx      ║');
  logger.info('╚════════════════════════════════════════╝');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Получен сигнал ${signal}, начало graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Ошибка при закрытии сервера:', { error: err.message, stack: err.stack });
      process.exit(1);
    }
    
    logger.info('HTTP сервер закрыт');
    
    // Закрываем все соединения с базой данных (если есть)
    // Закрываем транспорты логгера
    logger.end((err) => {
      if (err) {
        logger.error('Ошибка при закрытии логгера:', { error: err.message });
      } else {
        logger.info('Логгер закрыт');
      }
      process.exit(0);
    });
  });
  
  // Принудительное завершение через 30 секунд
  setTimeout(() => {
    logger.error('Принудительное завершение работы через 30 секунд таймаута');
    process.exit(1);
  }, 30000);
};

// Обработчики сигналов
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Обработка неперехваченных исключений
process.on('uncaughtException', (err) => {
  logger.error('Неперехваченное исключение:', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Неперехваченное отклонение Promise:', { reason: reason?.message || reason, stack: reason?.stack });
});

module.exports = app;
