# 🔄 CI/CD Pipeline - Полная Документация

## 📊 Обзор системы

**Whisp Quest** использует enterprise-level CI/CD на базе GitHub Actions с 4 автоматизированными workflow'ами:

### 🎯 Архитектура CI/CD:
```
📥 Trigger Events
├── Push/PR → CI Workflow (качество + тесты)
├── Push to master → Deploy Workflow (production)
├── Weekly schedule → Security Audit
└── Manual → Pages Setup
```

---

## 🧪 1. Continuous Integration (`ci.yml`)

### **Когда запускается:**
- Push в ветки: `main`, `master`, `develop`
- Pull Request в: `main`, `master`

### **Что делает:**
```yaml
🔄 Matrix Testing (Node.js 18 & 20):
├── 📦 Install dependencies (frontend + backend)
├── 🔍 ESLint code quality check  
├── 🧪 Run tests (26 frontend + 4 backend)
├── 📊 Upload coverage to Codecov (8.57%)
├── 🏗️ Build verification
├── 🔍 Security audit (NPM)
└── 📈 Bundle size analysis
```

### **Результат:**
- ✅/❌ Статус для PR (required для merge)
- 📊 Coverage report в Codecov
- 🚨 Уведомления при failing тестах

### **Время выполнения:** ~3-5 минут

---

## 🚀 2. Deploy to Production (`deploy.yml`)

### **Когда запускается:**
- Push в `master` (автоматически)
- Release published (автоматически)
- Manual workflow dispatch (кнопка)

### **Что делает:**

#### **Job 1: 🏗️ Build Production**
```yaml
├── 📦 Install deps → 🔍 Type check → 🧪 All tests
├── 🏗️ Production build → 🔒 Generate unique hash
├── ✅ Verify build (index.html, assets, size)
└── 📤 Upload artifact (retention: 30 days)
```

#### **Job 2: 🌐 Deploy to GitHub Pages**
```yaml
├── 📥 Download build artifact
├── 📄 Setup Pages (auto-enablement)
├── 📤 Upload Pages artifact → 🚀 Deploy
└── ✅ Success: https://savvasavelev.github.io/whisp-quest
```

#### **Job 3: 📦 Build Release Artifacts**
```yaml
├── 📥 Download build + 🔧 Optimize backend
├── 📁 Create complete archive (frontend + backend + docs)
├── 📝 Generate deployment instructions
└── 📤 Upload (90 days) / Attach to GitHub release
```

#### **Job 4: 📊 Deployment Summary**
```yaml
└── 📋 Comprehensive report in GitHub Step Summary
```

### **Результат:**
- 🌐 **Live site:** https://savvasavelev.github.io/whisp-quest
- 📦 **Download archive:** `whisp-quest-master-YYYYMMDD-hash.tar.gz`
- 📊 **Detailed report:** Build metrics, deployment status, next steps

### **Время выполнения:** ~5-8 минут

---

## 🔒 3. Security Audit (`security.yml`)

### **Когда запускается:**
- **Автоматически:** Каждый понедельник в 6:00 UTC
- Push/PR в `master`

### **Что делает:**
```yaml
🔍 Vulnerability Scan:
├── 🔍 NPM audit (frontend) - moderate level
└── 🔍 NPM audit (backend) - moderate level

🔒 Secrets Scan:
├── 📥 Full git history checkout (fetch-depth: 0)
└── 🔍 TruffleHog OSS (verified secrets only)
```

### **Результат:**
- 🚨 Security alerts при уязвимостях
- 📧 Weekly security report
- 🔒 Защита от утечки API ключей

---

## 📄 4. GitHub Pages Setup (`pages-setup.yml`)

### **Когда запускается:**
- Manual workflow dispatch (кнопка в Actions)

### **Что делает:**
```yaml
├── 🏗️ Build production
├── ✅ Verify build output
├── 📄 Auto-enable GitHub Pages
└── 🚀 Initial deployment
```

### **Использование:**
Только для первоначальной настройки Pages. После этого используется автоматический deploy workflow.

---

## 🎯 Практическое использование

### **Для разработчика:**

#### **Обычная разработка:**
```bash
git checkout -b feature/новая-фича
# ... разработка ...
git push origin feature/новая-фича
# → CI автоматически запустится и проверит код
```

#### **Merge в master:**
```bash
git checkout master
git merge feature/новая-фича
git push origin master
# → Deploy автоматически обновит production сайт
```

#### **Создание релиза:**
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# Создать Release в GitHub UI
# → Deploy автоматически прикрепит архив к релизу
```

### **Для тимлида:**

#### **Monitoring:**
- GitHub → Actions → Workflow runs
- Codecov dashboard для coverage
- Security alerts в GitHub

#### **Manual actions:**
- Deploy: Actions → "🚀 Deploy to Production" → Run workflow
- Pages setup: Actions → "📄 GitHub Pages Setup" → Run workflow
- Security: Actions → "🔒 Security Audit" → Run workflow

---

## 📊 Метрики и KPI

### **Quality Gates:**
- ✅ All tests pass (30 tests total)
- ✅ Coverage ≥ 6% (текущий: 8.57%)
- ✅ ESLint checks pass
- ✅ TypeScript compilation successful
- ✅ Build succeeds without errors

### **Performance Metrics:**
- ⚡ CI время: ~3-5 минут
- ⚡ Deploy время: ~5-8 минут  
- ⚡ Security scan: ~2-3 минуты
- 📦 Bundle size tracking
- 🔄 Deployment frequency: On every master push

### **Security Metrics:**
- 🔒 Weekly vulnerability scans
- 🔍 Real-time secrets detection
- 📊 Dependency audit reports
- 🚨 Zero tolerance для high-severity issues

---

## 🛠️ Конфигурация и настройка

### **GitHub Repository Settings:**

#### **Actions permissions:**
```
Settings → Actions → General
├── ✅ Allow all actions and reusable workflows
├── ✅ Allow actions created by GitHub
└── ✅ Read and write permissions for GITHUB_TOKEN
```

#### **Pages configuration:**
```
Settings → Pages
├── Source: GitHub Actions
└── Custom domain: (optional)
```

#### **Branch protection (рекомендуется):**
```
Settings → Branches → master
├── ✅ Require status checks (CI workflow)
├── ✅ Require branches to be up to date
├── ✅ Require pull request reviews
└── ✅ Dismiss stale reviews
```

### **Secrets management:**
```
Settings → Secrets and variables → Actions
└── GITHUB_TOKEN (автоматический, не требует настройки)
```

### **Dependabot (настроен):**
```yaml
# .github/dependabot.yml
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    target-branch: "develop"
```

---

## 🆘 Troubleshooting CI/CD

### **❌ CI failures:**

#### **Tests failing:**
```bash
# Локальная проверка
npm run prepare
# Если проходят локально → проверить различия в Node.js версиях
```

#### **Build failing:**
```bash
# Проверить TypeScript
npm run type-check
# Проверить зависимости
npm audit --audit-level=moderate
```

#### **Coverage too low:**
```bash
# Текущий порог: 6%
npm run test:coverage
# Добавить тесты или изменить порог в jest.config.cjs
```

### **❌ Deploy failures:**

#### **Pages not enabled:**
```
1. Repository Settings → Pages
2. Source: GitHub Actions
3. Re-run deploy workflow
```

#### **Build artifact missing:**
```
Проверить что CI workflow прошел успешно перед deploy
```

### **❌ Security alerts:**

#### **Vulnerability found:**
```bash
npm audit
npm audit fix
# Или обновить конкретный пакет
npm update package-name
```

#### **Secret detected:**
```
1. Удалить секрет из кода
2. Invalidate/rotate API keys
3. Force push или contact GitHub support
```

---

## 🔄 Workflow файлы

### **Локации:**
```
.github/workflows/
├── ci.yml              # Continuous Integration
├── deploy.yml          # Production Deployment  
├── security.yml        # Security Auditing
└── pages-setup.yml     # Pages Setup
```

### **Ключевые особенности:**

#### **Parallel execution:**
- CI jobs выполняются параллельно (Matrix strategy)
- Deploy jobs выполняются последовательно с dependencies

#### **Error handling:**
- `continue-on-error: true` для non-critical steps
- Graceful fallbacks для optional features
- Comprehensive error messages

#### **Optimization:**
- NPM cache enabled (`cache: 'npm'`)
- Artifact reuse между jobs
- Conditional execution based on triggers

#### **Security:**
- Minimal permissions principle
- No hardcoded secrets
- Verified actions only

---

## 📈 Дальнейшее развитие

### **Planned improvements:**

#### **Short term:**
- [ ] Playwright E2E тесты
- [ ] Storybook для компонентов  
- [ ] SonarCloud integration
- [ ] Docker containerization

#### **Long term:**
- [ ] Multi-environment deploys (staging/prod)
- [ ] Blue-green deployments
- [ ] Performance monitoring (Lighthouse CI)
- [ ] A/B testing framework

### **Monitoring additions:**
- [ ] Sentry error tracking
- [ ] Analytics integration
- [ ] Uptime monitoring
- [ ] Performance budgets

---

## 📞 Контакты и поддержка

**🔗 Ресурсы:**
- **Репозиторий:** https://github.com/SavvaSavelev/whisp-quest
- **Live Demo:** https://savvasavelev.github.io/whisp-quest
- **Actions:** https://github.com/SavvaSavelev/whisp-quest/actions
- **Issues:** https://github.com/SavvaSavelev/whisp-quest/issues

**📋 Workflow статус можно проверить:**
- GitHub → Actions tab → Latest runs
- Badges в README (если добавлены)
- Commit status checks в PR

**🆘 При проблемах:**
1. Проверить Actions logs
2. Сравнить с успешными runs
3. Создать Issue с детальным описанием
4. Использовать Manual workflow dispatch для диагностики

---

**✅ CI/CD система готова к enterprise использованию!**

*Последнее обновление: 5 августа 2025*
