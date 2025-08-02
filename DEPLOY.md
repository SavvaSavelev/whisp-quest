# Деплой на GitHub Pages

## Как работает
- При каждом push или pull request в ветку master запускается workflow `.github/workflows/ci.yml`.
- Проект собирается (`npm run build`), проходят тесты (`npm test`).
- Содержимое папки `dist` автоматически публикуется на GitHub Pages через peaceiris/actions-gh-pages.

## Важно
- В `vite.config.ts` должен быть прописан `base: '/whisp-quest/'`.
- Главная страница будет доступна по адресу: `https://SavvaSavelev.github.io/whisp-quest/`

## Ручной деплой
Если нужно вручную запустить деплой:
1. Соберите проект: `npm run build`
2. Запустите workflow вручную через GitHub Actions

## Troubleshooting
- Если страница не открывается, проверьте путь в `base` и наличие папки `dist`.
- Для SPA роутинга используйте hash mode или настройте 404.html.
