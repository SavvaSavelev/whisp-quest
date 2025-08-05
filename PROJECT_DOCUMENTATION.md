# 🌟 Whisp Quest - Полная Документация Проекта

## 📋 Содержание
1. [Описание проекта](#описание-проекта)
2. [Архитектура](#архитектура)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Быстрый старт](#быстрый-старт)
5. [Разработка](#разработка)
6. [Тестирование](#тестирование)
7. [Деплой](#деплой)
8. [Безопасность](#безопасность)
9. [Команды и скрипты](#команды-и-скрипты)
10. [Troubleshooting](#troubleshooting)

---

## 🎮 Описание проекта

**Whisp Quest** - интерактивное веб-приложение для создания и общения с виртуальными духами, построенное на современном tech stack.

### 🎯 Основные возможности:
- 🧙‍♀️ Создание духов на основе текста и настроения
- 💬 Интерактивное общение с духами через AI
- 🎨 3D визуализация с Three.js
- 📱 Адаптивный дизайн с Tailwind CSS
- 🔮 Система эмоций и настроений
- 💾 Локальное хранение духов
- 🌟 Анимации с Framer Motion

### 🏗️ Tech Stack:
- **Frontend:** React 19 + TypeScript + Vite
- **3D Graphics:** Three.js + React Three Fiber
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Animations:** Framer Motion
- **Backend:** Express.js + OpenAI API
- **Testing:** Jest + React Testing Library
- **CI/CD:** GitHub Actions
- **Deployment:** GitHub Pages

---

## 🏛️ Архитектура

### 📁 Структура проекта:
```
whisp-quest/
├── 🎨 Frontend (React App)
│   ├── src/
│   │   ├── components/       # React компоненты
│   │   │   ├── Atelier/     # Мастерская духов
│   │   │   ├── UI/          # UI компоненты
│   │   │   └── Optimized/   # Оптимизированные компоненты
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Утилиты и бизнес-логика
│   │   ├── store/           # Zustand стейт менеджмент
│   │   ├── ui-kit/          # Переиспользуемые UI компоненты
│   │   └── scenes/          # 3D сцены
│   ├── public/
│   │   └── textures/        # Текстуры для духов
│   └── dist/                # Production build
│
├── 🖥️ Backend (Express API)
│   └── whisp-server/
│       ├── server-optimized.js  # Express сервер
│       ├── package.json         # Backend зависимости
│       └── api.test.js          # Backend тесты
│
├── ⚙️ CI/CD & Config
│   ├── .github/
│   │   ├── workflows/       # GitHub Actions
│   │   ├── ISSUE_TEMPLATE/  # Шаблоны issue
│   │   └── dependabot.yml   # Автообновления
│   ├── .vscode/             # VSCode настройки
│   └── docs/                # Документация
│
└── 📋 Config Files
    ├── package.json         # Основные зависимости
    ├── vite.config.ts       # Vite конфигурация
    ├── jest.config.cjs      # Jest настройки
    ├── tailwind.config.js   # Tailwind CSS
    └── eslint.config.js     # ESLint правила
```

### 🔄 Data Flow:
```
User Input → Frontend (React) → API Client → Backend (Express) → OpenAI API
                ↓                                    ↓
        State Management (Zustand)           Response Processing
                ↓                                    ↓
        3D Rendering (Three.js) ← ← ← ← ← ← Spirit Data
```

---

## 🔄 CI/CD Pipeline

### 📊 Обзор системы:
У нас настроена **enterprise-level CI/CD система** с 4 workflow'ами:

### 1. 🧪 **Continuous Integration** (`ci.yml`)

**Триггеры:** Push в [main, master, develop] | PR в [main, master]

**Процесс:**
```yaml
🔄 Matrix Testing (Node 18 & 20)
├── 📥 Checkout code
├── 🟢 Setup Node.js + npm cache
├── 📦 Install dependencies (frontend + backend)
├── 🔍 ESLint code quality check
├── 🧪 Run tests (26 frontend + 4 backend)
├── 📊 Upload coverage to Codecov
├── 🏗️ Build verification
├── 🔍 NPM security audit
└── 📈 Bundle size analysis
```

**Результат:** ✅/❌ статус для каждого PR/push

### 2. 🚀 **Deploy to Production** (`deploy.yml`)

**Триггеры:** Push в master | Release published | Manual dispatch

**Процесс:**
```yaml
🏗️ Build Production:
├── 📦 Install deps → 🔍 Type check → 🧪 Tests
├── 🏗️ Build → 🔒 Generate hash → ✅ Verify
└── 📤 Upload artifact (30 days)

🌐 Deploy to GitHub Pages:
├── 📥 Download build → 📄 Setup Pages
├── 📤 Upload to Pages → 🚀 Deploy
└── ✅ Success notification + URL

📦 Build Release Artifacts:
├── 📥 Download build → 📦 Install backend deps
├── 🔧 Optimize production → 📁 Create archive
├── 📝 Generate deployment instructions
└── 📤 Upload artifact (90 days) / Attach to release

📊 Deployment Summary:
└── 📋 Generate comprehensive report
```

**Результат:** 
- 🌐 Live site: `https://savvasavelev.github.io/whisp-quest`
- 📦 Download archive: Available in workflow artifacts
- 📊 Deployment report: In GitHub Step Summary

### 3. 🔒 **Security Audit** (`security.yml`)

**Триггеры:** Weekly (Monday 6:00 UTC) | Push/PR в master

**Процесс:**
```yaml
🔍 Vulnerability Scan:
├── 🔍 NPM audit (frontend) - moderate level
└── 🔍 NPM audit (backend) - moderate level

🔒 Secrets Scan:
├── 📥 Full git history checkout
└── 🔍 TruffleHog OSS (verified secrets only)
```

**Результат:** Security report + alerts при найденных уязвимостях

### 4. 📄 **GitHub Pages Setup** (`pages-setup.yml`)

**Триггер:** Manual workflow dispatch

**Процесс:** Первоначальная настройка GitHub Pages с auto-enablement

---

## 🚀 Быстрый старт

### 📋 Требования:
- Node.js 18+ 
- npm 9+
- Git
- VSCode (рекомендуется)

### ⚡ Установка:
```bash
# 1. Клонирование проекта
git clone https://github.com/SavvaSavelev/whisp-quest.git
cd whisp-quest

# 2. Установка зависимостей
npm install
cd whisp-server && npm install && cd ..

# 3. Настройка окружения
cp .env.example .env  # Если есть
# Добавить OPENAI_API_KEY в .env для backend

# 4. Запуск в dev режиме
npm run dev              # Frontend (http://localhost:5173)
cd whisp-server && npm start  # Backend (http://localhost:3001)
```

### 🔧 VSCode Setup:
1. Открыть папку проекта в VSCode
2. Согласиться на установку рекомендуемых расширений
3. Настройки применятся автоматически из `.vscode/`

---

## 💻 Разработка

### 🛠️ Основные команды:
```bash
# 📦 Управление зависимостями
npm install                    # Установка всех зависимостей
npm run audit                  # Аудит безопасности

# 🚀 Запуск проекта
npm run dev                    # Development сервер
npm run build                  # Production build
npm run preview                # Предпросмотр build

# 🔍 Качество кода
npm run lint                   # ESLint проверка
npm run lint:fix               # Автоисправление ESLint
npm run type-check             # TypeScript проверка
npm run prepare                # Полная проверка (type + lint + test)

# 🧪 Тестирование
npm test                       # Запуск тестов в watch режиме
npm run test:ci                # Тесты для CI (без watch)
npm run test:coverage          # Тесты с покрытием кода
```

### 📁 Где что находится:

**🎨 Frontend разработка:**
- `src/components/` - React компоненты
- `src/hooks/` - Custom hooks
- `src/lib/` - Утилиты и API клиенты
- `src/store/` - Zustand stores
- `src/ui-kit/` - Переиспользуемые компоненты

**🖥️ Backend разработка:**
- `whisp-server/server-optimized.js` - Express сервер
- `whisp-server/api.test.js` - API тесты

**⚙️ Конфигурация:**
- `vite.config.ts` - Vite настройки
- `tailwind.config.js` - Tailwind CSS
- `jest.config.cjs` - Jest настройки
- `eslint.config.js` - ESLint правила

### 🎯 Workflow разработки:

1. **Создание feature branch:**
```bash
git checkout -b feature/название-фичи
```

2. **Разработка:**
```bash
npm run dev          # Запуск dev сервера
npm test             # Тесты в watch режиме
npm run lint:fix     # Исправление кода
```

3. **Проверка перед коммитом:**
```bash
npm run prepare      # Полная проверка
```

4. **Создание PR:**
```bash
git add .
git commit -m "feat: добавил новую фичу"
git push origin feature/название-фичи
```

5. **Создание Pull Request в GitHub**

---

## 🧪 Тестирование

### 📊 Текущее покрытие:
- **Frontend тесты:** 26/26 ✅ (100% прохождение)
- **Backend тесты:** 4/4 ✅ (100% прохождение)  
- **Code Coverage:** 8.57% (выше порога 6%)

### 🎯 Настройки качества:
```javascript
// jest.config.cjs
coverageThreshold: {
  global: {
    branches: 6,      // 6% покрытие веток
    functions: 6,     // 6% покрытие функций  
    lines: 6,         // 6% покрытие строк
    statements: 6     // 6% покрытие выражений
  }
}
```

### 🧪 Типы тестов:

**Unit тесты:**
- `src/lib/generateSpirit.test.ts` - Генерация духов
- `src/lib/analyzeSentiment.test.ts` - Анализ настроения
- `src/lib/getMoodTexture.test.ts` - Текстуры настроений
- `src/hooks/useInitAssets.test.ts` - Загрузка ресурсов

**Integration тесты:**
- `whisp-server/api.test.js` - API тестирование

**Component тесты:**
- `src/ui-kit/Button.test.tsx` - UI компоненты
- `src/ui-kit/Modal.test.tsx` - Модальные окна

### ▶️ Запуск тестов:
```bash
# Все тесты в watch режиме
npm test

# Однократный запуск
npm run test:ci

# С покрытием кода
npm run test:coverage

# Только изменившиеся файлы
npm test -- --changedSince=main

# Конкретный файл
npm test generateSpirit.test.ts
```

---

## 🚀 Деплой

### 🌐 Автоматический деплой:

**При push в master:**
```
git push origin master → CI/CD запускается → Деплой на GitHub Pages
```

**Результат:** Сайт обновляется на `https://savvasavelev.github.io/whisp-quest`

### 📦 Manual деплой:

1. **GitHub Actions:**
   - Идти в GitHub → Actions
   - Выбрать "🚀 Deploy to Production" 
   - Нажать "Run workflow"

2. **Локальный build:**
```bash
npm run build
# Файлы в папке dist/ готовы для деплоя
```

### 🏷️ Создание релиза:

```bash
# 1. Создать и запушить тег
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. Создать Release в GitHub UI
# → CI/CD автоматически прикрепит архив к релизу
```

### 📁 Release архив содержит:
```
whisp-quest-v1.0.0.tar.gz
├── frontend/           # Готовое React приложение
├── backend/           # Express сервер + production deps
├── package.json       # Основная конфигурация  
├── README.md          # Документация
└── DEPLOY_INSTRUCTIONS.md  # Инструкции по деплою
```

---

## 🔒 Безопасность

### 🛡️ Автоматические проверки:

**Еженедельно (понедельник 6:00 UTC):**
- 🔍 NPM audit уязвимостей
- 🔒 TruffleHog сканирование секретов
- 📊 Отчет безопасности

**При каждом push/PR:**
- 🔍 Базовый NPM audit
- 📋 ESLint security правила

### 🔐 Секреты и переменные окружения:

**GitHub Secrets (настроены):**
- `GITHUB_TOKEN` - автоматический (для actions)

**Backend переменные (.env):**
```bash
OPENAI_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=production
```

**⚠️ Важно:** Никогда не коммитить `.env` файлы!

### 🚨 Security Best Practices:

1. **Зависимости:**
   - Регулярные `npm audit`
   - Dependabot автообновления
   - Проверка известных уязвимостей

2. **Код:**
   - ESLint security правила
   - TypeScript для type safety
   - Code review обязателен

3. **CI/CD:**
   - Минимальные permissions для actions
   - Секреты только где необходимо
   - Audit logs всех действий

---

## ⚙️ Команды и скрипты

### 📋 Полный список npm scripts:

```json
{
  "dev": "vite",                              // 🚀 Development сервер
  "build": "tsc -b && vite build",            // 🏗️ Production build
  "preview": "vite preview",                  // 👁️ Предпросмотр build
  "lint": "eslint .",                         // 🔍 ESLint проверка
  "lint:fix": "eslint . --fix",               // 🔧 Автоисправление ESLint
  "type-check": "tsc --noEmit",               // 📝 TypeScript проверка
  "test": "jest",                             // 🧪 Тесты в watch режиме
  "test:ci": "jest --coverage --watchAll=false", // 🤖 Тесты для CI
  "test:coverage": "jest --coverage",         // 📊 Тесты с покрытием
  "audit": "npm audit --audit-level=moderate", // 🔒 Аудит безопасности
  "prepare": "npm run type-check && npm run lint && npm run test:ci" // ✅ Полная проверка
}
```

### 🖥️ Backend команды:
```bash
cd whisp-server
npm start                    # Запуск сервера (порт 3001)
npm test                     # Backend тесты
npm run dev                  # Development режим (если настроен)
```

### 🎯 VSCode Tasks (Ctrl+Shift+P → "Run Task"):
- **🚀 Dev Server** - Запуск frontend
- **🏗️ Build Project** - Production build  
- **🧪 Run Tests** - Тестирование
- **🔍 Lint Code** - Проверка кода
- **🖥️ Backend Server** - Запуск backend

---

## 🆘 Troubleshooting

### ❌ Частые проблемы:

**1. Ошибки при `npm install`:**
```bash
# Очистить кеш и переустановить
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**2. TypeScript ошибки:**
```bash
# Перезапустить TypeScript сервер в VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Проверка типов
npm run type-check
```

**3. Тесты не проходят:**
```bash
# Очистить Jest кеш
npm test -- --clearCache

# Запуск с подробным выводом
npm test -- --verbose

# Только один тест файл
npm test generateSpirit.test.ts
```

**4. Build ошибки:**
```bash
# Проверить что все тесты проходят
npm run prepare

# Очистить и пересобрать
rm -rf dist
npm run build
```

**5. GitHub Actions не работают:**
- Проверить `.github/workflows/` синтаксис
- Посмотреть логи в GitHub → Actions
- Убедиться что все secrets настроены

**6. Backend не запускается:**
```bash
# Проверить порт 3001
netstat -tulpn | grep 3001

# Переменные окружения
echo $OPENAI_API_KEY

# Логи сервера
cd whisp-server && npm start
```

### 🔧 Полезные команды диагностики:

```bash
# Информация о системе
node --version
npm --version
git --version

# Проверка зависимостей
npm list --depth=0
npm outdated

# Статус git
git status
git log --oneline -5

# Размер проекта
du -sh .
du -sh node_modules/
```

### 📞 Куда обращаться:

1. **GitHub Issues** - баги и feature requests
2. **GitHub Discussions** - вопросы разработки  
3. **Actions logs** - проблемы с CI/CD
4. **README.md** - базовая информация

---

## 🎉 Заключение

**Whisp Quest** настроен как enterprise-level проект с:

✅ **Полностью автоматизированным CI/CD pipeline**  
✅ **Comprehensive testing** (30 тестов, coverage tracking)  
✅ **Security scanning** (weekly + on-demand)  
✅ **Code quality gates** (ESLint, TypeScript, Prettier)  
✅ **Automated deployments** (GitHub Pages)  
✅ **Professional development environment** (VSCode config)  
✅ **Team collaboration tools** (templates, workflows)  

### 🚀 Готово к production и командной разработке!

---

**📅 Последнее обновление:** 5 августа 2025  
**👨‍💻 Автор:** SavvaSavelev  
**🌐 Репозиторий:** https://github.com/SavvaSavelev/whisp-quest  
**🔗 Live Demo:** https://savvasavelev.github.io/whisp-quest
