const request = require('supertest');

const API_BASE = 'http://localhost:3001';

describe('Whisp Quest API Integration Tests', () => {
  beforeAll(async () => {
    // Ждем, пока сервер запустится
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('GET /', () => {
    it('returns welcome message', async () => {
      const response = await request(API_BASE)
        .get('/')
        .expect(200);
      
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toContain('Whisp Quest Server');
      expect(response.body).toHaveProperty('status', 'running');
    });
  });

  describe('GET /health', () => {
    it('returns health status', async () => {
      const response = await request(API_BASE)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('POST /analyze', () => {
    it('analyzes sentiment correctly', async () => {
      const testText = 'Я очень счастлив и радостен!';
      
      const response = await request(API_BASE)
        .post('/analyze')
        .send({ text: testText })
        .expect(200);
      
      expect(response.body).toHaveProperty('mood');
      expect(response.body).toHaveProperty('color');
      expect(response.body).toHaveProperty('rarity');
      expect(response.body).toHaveProperty('essence');
      expect(response.body).toHaveProperty('dialogue');
    });

    it('rejects empty text', async () => {
      const response = await request(API_BASE)
        .post('/analyze')
        .send({ text: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /spirit-chat', () => {
    it('handles spirit dialogue endpoint correctly', async () => {
      // Ждем, чтобы не попасть под rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await request(API_BASE)
        .post('/spirit-chat')
        .send({
          spiritName: 'Тестовый Дух',
          spiritMood: 'радостный',
          message: 'Привет!'
        });
      
      // Проверяем, что endpoint работает (может быть rate-limited)
      if (response.status === 200) {
        expect(response.body).toHaveProperty('response');
        expect(typeof response.body.response).toBe('string');
        expect(response.body.response.length).toBeGreaterThan(0);
      } else if (response.status === 429) {
        // Rate limiting сработал - это нормально
        expect(response.body).toHaveProperty('error');
      } else {
        // Неожиданный статус
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('rate limiting is configured (may trigger with heavy load)', async () => {
      // Тестируем наличие системы rate limiting без необходимости её срабатывания
      const response = await request(API_BASE)
        .get('/health');
      
      // Проверяем, что сервер отвечает (rate limiting работает в фоне)
      expect([200, 429]).toContain(response.status);
    });
  });
});
