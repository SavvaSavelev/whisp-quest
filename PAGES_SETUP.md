# 📄 GitHub Pages Setup Guide

> **Инструкции по настройке GitHub Pages для Whisp Quest**

## 🎯 Проблема

Если вы видите ошибку:
```
Run actions/configure-pages@v4
Warning: Get Pages site failed
Error: Create Pages site failed
Error: HttpError: Resource not accessible by integration
```

Это означает, что GitHub Pages не настроен для репозитория или нет необходимых прав доступа.

## 🔧 Решение

### **1️⃣ Настройка GitHub Pages**

#### **Через веб-интерфейс GitHub:**
1. Перейдите в **Settings** репозитория
2. Найдите секцию **Pages** в левом меню
3. В **Source** выберите **GitHub Actions**
4. Нажмите **Save**

#### **Детальные шаги:**
```
GitHub Repository → Settings → Pages
├── Source: "GitHub Actions" (не "Deploy from a branch")
├── Custom domain: (оставить пустым или указать свой)
└── Enforce HTTPS: ✅ (рекомендуется)
```

### **2️⃣ Проверка прав доступа**

#### **Repository Settings:**
```
Settings → Actions → General
├── Actions permissions: ✅ "Allow all actions and reusable workflows"
├── Workflow permissions: ✅ "Read and write permissions"
├── Allow GitHub Actions to create and approve pull requests: ✅
└── Fork pull request workflows: (настроить по необходимости)
```

#### **Необходимые permissions для workflow:**
```yaml
permissions:
  contents: read      # Чтение кода репозитория
  pages: write        # Запись в GitHub Pages
  id-token: write     # Аутентификация
  actions: read       # Чтение Actions
```

### **3️⃣ Автоматический запуск после настройки**

После настройки Pages:
1. Перейдите в **Actions** tab
2. Найдите последний failed workflow **"🚀 Deploy to Production"**
3. Нажмите **Re-run jobs** или **Re-run failed jobs**

Или сделайте новый commit:
```bash
git commit --allow-empty -m "📄 trigger pages setup"
git push
```

## 🚀 Manual Workflow Dispatch

Можно также запустить deploy вручную:
1. **Actions** → **🚀 Deploy to Production**
2. **Run workflow** (кнопка справа)
3. Выбрать ветку **master**
4. **Run workflow**

## 🔍 Диагностика проблем

### **Проверить статус Pages:**
```
Repository → Settings → Pages
Status: "Your site is live at https://username.github.io/repo-name"
```

### **Проверить workflow logs:**
```
Actions → Latest workflow run → deploy-github-pages job
└── Check detailed error messages
```

### **Типичные ошибки и решения:**

#### **Error: Resource not accessible by integration**
**Причина:** Недостаточно прав у GITHUB_TOKEN
**Решение:** 
- Settings → Actions → General → Workflow permissions
- Выбрать "Read and write permissions"

#### **Error: Get Pages site failed**
**Причина:** Pages не включен в репозитории
**Решение:**
- Settings → Pages → Source: GitHub Actions

#### **Warning: Pages not configured**
**Причина:** Первый запуск, Pages еще не настроен
**Решение:** 
- Workflow автоматически попытается настроить
- Или настроить вручную через Settings

## 📦 Alternative Deployment Options

Если GitHub Pages не работает, можно использовать build artifacts:

### **1️⃣ Download Artifacts:**
```
Actions → Latest successful run → Artifacts
└── Download "production-build-XXXXXXXX"
```

### **2️⃣ Deploy to other platforms:**

#### **Netlify:**
1. Распаковать artifact
2. Drag & drop папку `dist/` на netlify.com
3. Instant deployment

#### **Vercel:**
```bash
npm install -g vercel
cd dist/
vercel --prod
```

#### **Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase init hosting
# Point to dist/ folder
firebase deploy
```

#### **Surge.sh:**
```bash
npm install -g surge
cd dist/
surge . your-domain.surge.sh
```

## 🎯 Expected Results

После правильной настройки:
```
✅ GitHub Pages job succeeds
🌐 Site live at: https://savvasavelev.github.io/whisp-quest
📊 Deployment summary in workflow
🔄 Automatic updates on master push
```

## 📞 Getting Help

Если проблемы продолжаются:
1. **Create Issue** в репозитории с деталями ошибки
2. **Include workflow logs** (screenshot или text)
3. **Specify your repository settings** (Settings → Pages screenshot)

## 🔄 Workflow File Locations

Файлы для проверки и редактирования:
```
.github/workflows/
├── deploy.yml          # Основной deployment workflow
├── pages-setup.yml     # Отдельный setup workflow
└── ci.yml             # Continuous integration
```

---

**✅ После настройки GitHub Pages все должно работать автоматически!**

*📅 Последнее обновление: 5 августа 2025*
