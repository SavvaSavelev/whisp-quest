# 🔄 CI/CD Pipeline Documentation

## 📋 Обзор

Этот проект использует профессиональный CI/CD pipeline на GitHub Actions, который включает:

- ✅ **Автоматическое тестирование** на каждый push/PR
- 🔒 **Сканирование безопасности** зависимостей и кода  
- 📊 **Анализ качества кода** с покрытием тестами
- 🚀 **Автоматический деплой** на GitHub Pages
- 📦 **Управление зависимостями** через Dependabot

## 🔄 Workflows

### 1. 🧪 Continuous Integration (`.github/workflows/ci.yml`)

**Запускается:** При push в `master`/`main`/`develop` и PR в `master`/`main`

**Включает:**
- **Code Quality & Tests** - тестирование на Node.js 18 и 20
- **Security Scan** - проверка уязвимостей зависимостей
- **Code Quality Analysis** - анализ покрытия кода

**Этапы:**
1. 📥 Checkout кода
2. 🟢 Установка Node.js
3. 📦 Установка зависимостей (frontend + backend)
4. 🔍 ESLint проверка
5. 🧪 Запуск тестов с покрытием
6. 🏗️ Проверка сборки
7. 📈 Анализ размера bundle
8. 🔒 Аудит безопасности

### 2. 🚀 Deploy (`.github/workflows/deploy.yml`)

**Запускается:** При push в `master` или создании release

**Включает:**
- **GitHub Pages Deploy** - автоматический деплой фронтенда
- **Release Build** - создание архивов для релизов

### 3. 🔒 Security Audit (`.github/workflows/security.yml`)

**Запускается:** Еженедельно по понедельникам, при push/PR

**Включает:**
- **Vulnerability Scan** - Snyk + npm audit
- **CodeQL Analysis** - статический анализ безопасности  
- **Secrets Scan** - поиск утечек секретов

## 🤖 Dependabot (`.github/dependabot.yml`)

**Автоматически:**
- 📦 Обновляет зависимости каждый понедельник
- 🔄 Создает PR для frontend, backend и GitHub Actions
- 🏷️ Добавляет соответствующие лейблы

## 📊 Настройки качества

### Jest Coverage Thresholds
```javascript
coverageThreshold: {
  global: {
    branches: 70,     // 70% покрытие веток
    functions: 70,    // 70% покрытие функций  
    lines: 70,        // 70% покрытие строк
    statements: 70    // 70% покрытие выражений
  }
}
```

### Bundle Size Limits
```json
{
  "files": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "1MB"     // JavaScript файлы <= 1MB
    },
    {
      "path": "./dist/assets/*.css", 
      "maxSize": "100KB"   // CSS файлы <= 100KB
    }
  ]
}
```

## 🚀 Деплой

### GitHub Pages
- **URL:** `https://savvasavelev.github.io/whisp-quest/`
- **Автоматический деплой:** При push в master
- **Build command:** `npm run build`
- **Deploy directory:** `./dist`

### Manual Deploy
```bash
# Локальная сборка
npm run build

# Проверка производства
npm run preview
```

## 🔧 Настройка секретов

В настройках репозитория (`Settings > Secrets and variables > Actions`) добавь:

### Required Secrets:
- `GITHUB_TOKEN` - автоматически предоставляется GitHub
- `CODECOV_TOKEN` - для загрузки покрытия кода
- `SNYK_TOKEN` - для сканирования безопасности
- `SONAR_TOKEN` - для анализа качества кода

### Optional Secrets:
- `OPENAI_API_KEY` - для тестирования API (если нужно)

## 📋 Шаблоны Issues/PR

### Bug Report (`.github/ISSUE_TEMPLATE/bug_report.md`)
- 🐛 Структурированный отчет о багах
- 📱 Секции для скриншотов и воспроизведения
- 🖥️ Информация о среде выполнения

### Feature Request (`.github/ISSUE_TEMPLATE/feature_request.md`)  
- ✨ Предложения новых функций
- 🎯 Критерии приемки
- 💡 Альтернативные решения

### Pull Request (`.github/pull_request_template.md`)
- 📋 Описание изменений
- 🎯 Тип изменений (баг/фича/рефакторинг)
- ✅ Чеклист для проверки

## 🔄 Процесс разработки

### 1. Создание ветки
```bash
git checkout -b feature/awesome-feature
git checkout -b bugfix/fix-something
git checkout -b hotfix/critical-fix
```

### 2. Разработка
- Пишешь код
- Добавляешь тесты
- Запускаешь локально: `npm test`

### 3. Commit & Push
```bash
git add .
git commit -m "✨ Add awesome feature"
git push origin feature/awesome-feature
```

### 4. Pull Request
- Создаешь PR в GitHub
- CI автоматически запускается
- Все проверки должны пройти ✅
- Code review и merge

### 5. Deploy
- При merge в master → автоматический деплой
- Результат доступен на GitHub Pages

## 🏆 Best Practices

### ✅ Do's:
- Всегда пиши тесты для нового кода
- Проверяй локально перед push
- Используй conventional commits
- Обновляй документацию при изменениях

### ❌ Don'ts:
- Не коммить секреты/ключи API
- Не пушить код без тестов
- Не игнорировать предупреждения ESLint
- Не мержить при падающих тестах

## 📈 Мониторинг

- **GitHub Actions** - статус всех workflows
- **Codecov** - покрытие тестами
- **Dependabot** - обновления зависимостей
- **SonarCloud** - качество кода (если настроено)
- **Snyk** - уязвимости безопасности

---

**Готово!** 🎉 Теперь у тебя enterprise-уровень CI/CD как в топовых IT-компаниях!
