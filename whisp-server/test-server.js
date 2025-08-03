// Простой тестовый сервер для проверки
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к директории текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env из текущей папки
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Отладка .env загрузки:');
console.log('📁 __dirname:', __dirname);
console.log('📄 .env path:', path.join(__dirname, '.env'));
console.log('🔑 OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('🔑 OPENAI_API_KEY first 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10) || 'undefined');

const app = express();
const PORT = process.env.PORT || 3001;

// Простой middleware для JSON
app.use(express.json());

// Тестовые маршруты
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Whisp Quest Server работает!',
    timestamp: new Date().toISOString(),
    port: PORT,
    version: '2.0.0-test'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/test-openai', (req, res) => {
  res.json({
    openai_configured: !!process.env.OPENAI_API_KEY,
    key_length: process.env.OPENAI_API_KEY?.length || 0
  });
});

// Запуск сервера
app.listen(PORT, 'localhost', () => {
  console.log(`✅ Тестовый сервер запущен на http://localhost:${PORT}`);
  console.log(`📋 Доступные endpoint'ы:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/test-openai`);
});

// Обработка ошибок
app.on('error', (error) => {
  console.error('❌ Ошибка сервера:', error);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Необработанное исключение:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Необработанное отклонение промиса:', reason);
  process.exit(1);
});
