// Форматирование валюты
export const formatCurrency = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value);

// Форматирование валюты (только целые числа)
export const formatCurrencyInt = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

// Форматирование чисел
export const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(value);

// Форматирование количества
export const formatQuantity = (value) => 
  new Intl.NumberFormat('ru-RU', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(value);

// Названия месяцев
export const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

// Валидация данных
export const validateData = (record) => {
  const errors = [];
  if (!record.customer) errors.push('Отсутствует заказчик');
  if (!record.region) errors.push('Отсутствует регион');
  if (record.amount < 0) errors.push('Отрицательная сумма');
  return errors;
};

// Санитизация строк
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().substring(0, 500);
};
