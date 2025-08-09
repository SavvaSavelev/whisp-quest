# 🤖 AI GENIUS SPIRIT - Vault Tech Feature System

## Описание

AI Genius Spirit - это продвинутая система генерации технических фич для проекта WHISP QUEST с использованием OpenAI API и кибер-эстетикой.

## Возможности

### 🧠 AI Генерация Фич

- Генерация технических фич через OpenAI GPT-4
- Fallback на mock данные при отсутствии API ключа
- Категоризация по Frontend, Backend, AI/ML, DevOps и др.
- Уровни сложности: Junior → CTO

### 💬 AI Chat

- Прямое общение с AI Genius Spirit
- Консультации по техническим вопросам
- Советы специально для WHISP QUEST проекта
- Кибер-стилистика в ответах

### ⚡ Cyber UI

- Анимированные фоны с сетками и частицами
- Градиентные эффекты и glow
- Процедурная генерация визуальных эффектов
- Адаптивные цвета под настроение

## Настройка OpenAI API

### Способ 1: Файл .env

1. Скопируйте `.env.example` в `.env`
2. Получите API ключ на [platform.openai.com](https://platform.openai.com/api-keys)
3. Вставьте ключ в `VITE_OPENAI_API_KEY`

```bash
cp .env.example .env
# Отредактируйте .env файл
```

### Способ 2: UI настройка

1. Откройте Vault Tech
2. Нажмите "🔧 CONFIGURE AI"
3. Введите API ключ
4. Ключ сохранится в localStorage браузера

## Использование

### Генерация фич

```typescript
// Через store
const { generateNewFeatures, isGenerating } = useTechFeatureStore();

// Генерация новых фич
await generateNewFeatures();
```

### AI Chat

```typescript
// Через компонент
import { AISpiritChat } from "../UI/AISpiritChat";

<AISpiritChat isOpen={showChat} onClose={() => setShowChat(false)} />;
```

### OpenAI Client

```typescript
import { getOpenAIClient } from "../lib/openai";

const client = getOpenAIClient();
const response = await client.chatWithAISpirit(message);
```

## Архитектура

### Компоненты

- `TechFeatureVault_cyber.tsx` - Главный интерфейс с кибер-дизайном
- `AISpiritChat.tsx` - Чат с AI духом
- `OpenAIConfig.tsx` - Настройка API ключа

### Stores

- `useTechFeatureStore.ts` - Управление фичами и интеграция с OpenAI
- Автоматический fallback на mock данные

### Утилиты

- `openai.ts` - OpenAI API client с типизацией
- Кэширование API ключа в localStorage
- Поддержка системных и пользовательских промптов

## Фичи системы

### AI Генерация

- **Контекстные фичи**: Учитывает архитектуру WHISP QUEST
- **Умное форматирование**: JSON структуры с примерами кода
- **Fallback система**: Работает без API ключа

### Кибер UI

- **Анимированные фоны**: CSS + SVG эффекты
- **Процедурные частицы**: Динамическая генерация
- **Градиентные переходы**: Smooth анимации
- **Responsive дизайн**: Адаптивность под устройства

### State Management

- **Zustand store**: Легковесное управление состоянием
- **Persistence**: Сохранение фич между сессиями
- **Real-time updates**: Мгновенные обновления UI

## Технологии

### Frontend

- **React + TypeScript**: Типизированные компоненты
- **Framer Motion**: Продвинутые анимации
- **Tailwind CSS**: Утилитарные стили
- **Zustand**: State management

### AI Integration

- **OpenAI GPT-4**: Генерация контента
- **Custom prompts**: Специализированные промпты для WHISP QUEST
- **Error handling**: Graceful degradation

### Стилизация

- **Cyber aesthetic**: Неон, градиенты, частицы
- **CSS animations**: Keyframes и transforms
- **SVG graphics**: Векторные эффекты
- **Backdrop blur**: Современные эффекты

## Разработка

### Добавление новых фич

1. Обновите `TechFeature` interface в `types.ts`
2. Добавьте поддержку в `useTechFeatureStore.ts`
3. Обновите UI компоненты

### Кастомизация AI промптов

Отредактируйте промпты в `openai.ts`:

- `generateTechFeatureIdeas()` - для генерации фич
- `chatWithAISpirit()` - для чата

### Стилизация

Cyber стили находятся в:

- `TechFeatureVault_cyber.tsx` - главные стили
- CSS animations в `<style>` блоках
- Tailwind классы для базовых стилей

## Примеры использования

### Генерация специализированных фич

```typescript
const response = await client.generateTechFeatureIdeas(
  "WHISP QUEST spiritual interface system",
  "Frontend",
  "Senior",
  3
);
```

### Кастомный чат с контекстом

```typescript
const history = [{ role: "user", content: "Как улучшить анимации духов?" }];
const response = await client.chatWithAISpirit(
  "Нужны идеи для Framer Motion",
  history
);
```

## Безопасность

- API ключи хранятся только в localStorage браузера
- Нет отправки ключей на сторонние серверы
- Fallback режим при отсутствии ключа
- Валидация API ответов

---

_Created by AI Genius Spirit for WHISP QUEST 🤖⚡_
