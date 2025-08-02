# 🎨 Система загрузки Whisp Quest

Красивые и анимированные компоненты загрузки для улучшения пользовательского опыта.

## 📦 Компоненты

### 🌟 AppLoader
Полноэкранная загрузка приложения с анимированным логотипом.

```tsx
import { AppLoader } from './components/UI/AppLoader';

<AppLoader 
  isVisible={!ready}
  progress={loadingProgress}
  message="Загружаю мир духов..."
/>
```

**Особенности:**
- Градиентный фон с анимациями
- Вращающийся орб с орбитальными элементами
- Прогресс-бар с плавной анимацией
- Динамическое изменение сообщений

### ✨ SpiritGenerationLoader
Специальная модальная загрузка для генерации духов с этапами.

```tsx
import { SpiritGenerationLoader } from './components/UI/SpiritGenerationLoader';

<SpiritGenerationLoader 
  isVisible={isGenerating}
  stage="generating" // analyzing | generating | materializing | completing
  progress={75}
/>
```

**Особенности:**
- 4 этапа с уникальными цветами и иконками
- Анимированный орб с пульсацией
- Кольцевые волны расширения
- Летающие частицы
- Backdrop blur эффект

### 🔄 LoadingSpinner
Универсальные спиннеры для различных ситуаций.

```tsx
import { LoadingSpinner } from './components/UI/LoadingSpinner';

<LoadingSpinner 
  size="lg" // sm | md | lg | xl
  variant="spiritual" // primary | spiritual | cosmic | pulse
  text="Загрузка..."
/>
```

**Варианты:**
- `primary` - простой вращающийся спиннер
- `spiritual` - двойные кольца с центральной точкой
- `cosmic` - 8-лучевая звезда с последовательной анимацией
- `pulse` - пульсирующий градиентный шар

### 🎯 LoadingButton
Кнопка с встроенным состоянием загрузки.

```tsx
import { LoadingButton } from './components/UI/LoadingButton';

<LoadingButton
  onClick={handleGenerate}
  isLoading={isGenerating}
  loadingText="Призываю..."
  variant="spiritual"
  size="md"
>
  Призвать духа
</LoadingButton>
```

**Особенности:**
- Плавный переход в состояние загрузки
- Встроенный спиннер
- Блокировка повторных кликов
- Анимированный фон при загрузке

## 🔧 Хук useLoading

Хук для управления сложными состояниями загрузки.

```tsx
import { useLoading } from './hooks/useLoading';

const { loadingState, simulateSpiritGeneration, updateLoading } = useLoading();

// Автоматическая симуляция генерации духа
await simulateSpiritGeneration();

// Ручное управление
updateLoading('generating', 50, 'Создаю сущность...');
```

**Возвращает:**
- `loadingState` - текущее состояние
- `startLoading` - начать загрузку
- `updateLoading` - обновить этап и прогресс
- `stopLoading` - завершить загрузку
- `simulateSpiritGeneration` - готовая симуляция

## 🎭 Этапы генерации духа

1. **analyzing** 🧠 - Анализирую ваши мысли...
2. **generating** ✨ - Создаю духовную сущность...
3. **materializing** 🌟 - Материализую дух...
4. **completing** 🎯 - Завершаю создание...

## 📝 Примеры использования

### Полная интеграция в форме

```tsx
const DiaryPage = () => {
  const { loadingState, simulateSpiritGeneration } = useLoading();
  
  const handleSummon = async () => {
    const loadingPromise = simulateSpiritGeneration();
    const spiritPromise = generateSpirit(text);
    
    const [, newSpirit] = await Promise.all([loadingPromise, spiritPromise]);
    // Обработка результата...
  };

  return (
    <>
      <SpiritGenerationLoader 
        isVisible={loadingState.isLoading}
        stage={loadingState.stage}
        progress={loadingState.progress}
      />
      
      <LoadingButton
        onClick={handleSummon}
        isLoading={loadingState.isLoading}
        variant="spiritual"
      >
        Призвать
      </LoadingButton>
    </>
  );
};
```

### Кастомная анимация загрузки

```tsx
const CustomLoader = () => {
  const { loadingState, startLoading, updateLoading, stopLoading } = useLoading();
  
  const customLoad = async () => {
    startLoading('Начинаю магию...');
    await sleep(1000);
    
    updateLoading('generating', 30, 'Вплетаю заклинания...');
    await sleep(1500);
    
    updateLoading('materializing', 80, 'Почти готово...');
    await sleep(800);
    
    stopLoading();
  };
  
  // ...
};
```

## 🎨 Стилизация

Все компоненты используют Tailwind CSS и поддерживают:
- Темную тему по умолчанию
- Градиентные фоны
- Backdrop blur эффекты
- Framer Motion анимации
- Адаптивные размеры

## ⚡ Производительность

- Компоненты обернуты в `React.memo`
- Анимации оптимизированы для 60fps
- Lazy loading для тяжелых компонентов
- Минимальное количество ре-рендеров
