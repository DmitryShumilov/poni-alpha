import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 30000;

const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Таймаут запроса: не удалось получить данные за ${timeout/1000} сек`);
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Нет соединения с сервером. Проверьте, запущен ли сервер.');
    }
    throw error;
  }
};

const useData = (initialLoad = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Загружаем все данные с большим лимитом
      const response = await fetchWithTimeout(`${API_URL}/api/data?limit=10000`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Не удалось загрузить данные`);
      const jsonData = await response.json();

      if (!jsonData.records || jsonData.records.length === 0) {
        throw new Error('Данные пусты. Проверьте файл database.xlsx');
      }

      setData(jsonData.records || jsonData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (initialLoad) {
      loadData();
    }
  }, [refreshKey, initialLoad, loadData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    loadData,
    setData
  };
};

export default useData;
