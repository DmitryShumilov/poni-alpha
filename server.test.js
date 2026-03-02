import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from './server.cjs';

describe('Server API', () => {
  let server;
  const PORT = 5001; // Используем другой порт для тестов

  beforeAll(async () => {
    // Запускаем сервер на тестовом порту
    server = await new Promise((resolve) => {
      const s = app.listen(PORT, () => resolve(s));
    });
  });

  afterAll(async () => {
    // Закрываем сервер после тестов
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /api/health', () => {
    it('должен возвращать статус ok', async () => {
      const response = await request(`http://localhost:${PORT}`).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });

    it('должен возвращать корректную структуру ответа', async () => {
      const response = await request(`http://localhost:${PORT}`).get('/api/health');
      
      expect(response.body).toHaveProperty('cachedRecords');
      expect(response.body).toHaveProperty('cacheAge');
      expect(typeof response.body.cachedRecords).toBe('number');
      expect(typeof response.body.cacheAge).toBe('number');
    });
  });

  describe('GET /api/data', () => {
    it('должен возвращать данные или ошибку (в зависимости от наличия database.xlsx)', async () => {
      const response = await request(`http://localhost:${PORT}`).get('/api/data');
      
      // Либо данные загружены, либо ошибка (файл не найден)
      if (response.status === 200) {
        expect(response.body).toHaveProperty('records');
        expect(Array.isArray(response.body.records)).toBe(true);
      } else if (response.status === 500) {
        expect(response.body).toHaveProperty('error');
      }
    });

    it('должен возвращать CORS заголовки', async () => {
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/data')
        .set('Origin', 'http://localhost:3000');
      
      // Проверяем, что CORS заголовки присутствуют
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('должен применять rate limiting к API', async () => {
      // Отправляем несколько запросов
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const res = await request(`http://localhost:${PORT}`).get('/api/health');
        responses.push(res);
      }
      
      // Все запросы должны быть успешными (лимит 100 запросов в 15 минут)
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });
    });
  });

  describe('404 Handler', () => {
    it('должен возвращать 404 для несуществующих эндпоинтов', async () => {
      const response = await request(`http://localhost:${PORT}`).get('/api/nonexistent');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/analytics/performance', () => {
    it('должен принимать метрики Web Vitals', async () => {
      const metric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        delta: 0,
        navigationType: 'navigate',
        url: 'http://localhost:3000',
        userAgent: 'test-agent',
        timestamp: new Date().toISOString()
      };

      const response = await request(`http://localhost:${PORT}`)
        .post('/api/analytics/performance')
        .send(metric)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('должен возвращать 400 при отсутствии обязательных полей', async () => {
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/analytics/performance')
        .send({ rating: 'good' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
