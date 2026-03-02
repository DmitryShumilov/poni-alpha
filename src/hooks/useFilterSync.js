import { useMemo, useRef, useEffect, useCallback } from 'react';

// Сериализация фильтров в URL-параметры
export const filtersToUrlParams = (filters, selectedYears, selectedMonths) => {
  const params = new URLSearchParams();

  if (selectedYears?.length) {
    params.set('years', selectedYears.join(','));
  }

  if (selectedMonths?.length) {
    params.set('months', selectedMonths.join(','));
  }

  if (filters?.regions?.length) {
    params.set('regions', filters.regions.join(','));
  }

  if (filters?.customers?.length) {
    params.set('customers', filters.customers.join(','));
  }

  if (filters?.suppliers?.length) {
    params.set('suppliers', filters.suppliers.join(','));
  }

  if (filters?.products?.length) {
    params.set('products', filters.products.join(','));
  }

  if (filters?.minAmount !== 0) {
    params.set('minAmount', filters.minAmount.toString());
  }

  if (filters?.maxAmount !== 1e9) {
    params.set('maxAmount', filters.maxAmount.toString());
  }

  return params.toString();
};

// Парсинг URL-параметров в фильтры
export const urlParamsToFilters = (searchParams, uniqueValues) => {
  const filters = {
    years: [],
    months: [],
    regions: [],
    customers: [],
    suppliers: [],
    products: [],
    minAmount: 0,
    maxAmount: 1e9
  };

  const selectedYears = [];
  const selectedMonths = [];

  // Парсинг лет
  const yearsParam = searchParams.get('years');
  if (yearsParam) {
    const years = yearsParam.split(',').map(y => parseInt(y, 10)).filter(y => !isNaN(y));
    selectedYears.push(...years.filter(y => uniqueValues.years?.includes(y)));
  }

  // Парсинг месяцев
  const monthsParam = searchParams.get('months');
  if (monthsParam) {
    const months = monthsParam.split(',').map(m => parseInt(m, 10)).filter(m => !isNaN(m));
    selectedMonths.push(...months.filter(m => uniqueValues.months?.includes(m)));
  }

  // Парсинг регионов
  const regionsParam = searchParams.get('regions');
  if (regionsParam) {
    const regions = regionsParam.split(',');
    filters.regions = regions.filter(r => uniqueValues.regions?.includes(r));
  }

  // Парсинг заказчиков
  const customersParam = searchParams.get('customers');
  if (customersParam) {
    const customers = customersParam.split(',');
    filters.customers = customers.filter(c => uniqueValues.customers?.includes(c));
  }

  // Парсинг поставщиков
  const suppliersParam = searchParams.get('suppliers');
  if (suppliersParam) {
    const suppliers = suppliersParam.split(',');
    filters.suppliers = suppliers.filter(s => uniqueValues.suppliers?.includes(s));
  }

  // Парсинг продуктов
  const productsParam = searchParams.get('products');
  if (productsParam) {
    const products = productsParam.split(',');
    filters.products = products.filter(p => uniqueValues.products?.includes(p));
  }

  // Парсинг диапазона сумм
  const minAmount = searchParams.get('minAmount');
  if (minAmount) {
    filters.minAmount = parseFloat(minAmount) || 0;
  }

  const maxAmount = searchParams.get('maxAmount');
  if (maxAmount) {
    filters.maxAmount = parseFloat(maxAmount) || 1e9;
  }

  return { filters, selectedYears, selectedMonths };
};

// Хук для синхронизации фильтров с URL с debouncing
export const useFilterSync = (filters, setFilters, selectedYears, setSelectedYears, selectedMonths, setSelectedMonths, uniqueValues, debounceDelay = 500) => {
  const timeoutRef = useRef(null);

  // Инициализация из URL при первом рендере
  const initialized = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.toString()) {
      const { filters: urlFilters, selectedYears: urlYears, selectedMonths: urlMonths } = urlParamsToFilters(
        searchParams,
        uniqueValues
      );

      if (urlYears.length) setSelectedYears(urlYears);
      if (urlMonths.length) setSelectedMonths(urlMonths);
      if (Object.values(urlFilters).some(v => Array.isArray(v) ? v.length : v)) {
        setFilters(urlFilters);
      }

      return true;
    }

    return false;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Обновление URL при изменении фильтров с debouncing
  const updateUrl = useCallback((newFilters, newSelectedYears, newSelectedMonths) => {
    if (typeof window === 'undefined') return;

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      const params = filtersToUrlParams(newFilters, newSelectedYears, newSelectedMonths);
      const newUrl = params ? `${window.location.pathname}?${params}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }, debounceDelay);
  }, [debounceDelay]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { initialized, updateUrl };
};
