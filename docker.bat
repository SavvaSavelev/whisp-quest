@echo off
:: 🐳 Whisp Quest Docker Management Script for Windows

setlocal enabledelayedexpansion

:: Проверка наличия Docker
where docker >nul 2>nul
if errorlevel 1 (
    echo ❌ Docker не установлен!
    exit /b 1
)

where docker-compose >nul 2>nul
if errorlevel 1 (
    echo ❌ Docker Compose не установлен!
    exit /b 1
)

:: Проверка .env файла
if not exist .env (
    echo ⚠️  Файл .env не найден, создаю из шаблона...
    copy .env.production .env >nul
    echo ⚠️  Не забудьте добавить ваш OPENAI_API_KEY в файл .env!
)

:: Основная логика
set command=%1
if "%command%"=="" set command=help

if "%command%"=="build" goto build
if "%command%"=="dev" goto dev
if "%command%"=="start" goto start
if "%command%"=="stop" goto stop
if "%command%"=="restart" goto restart
if "%command%"=="status" goto status
if "%command%"=="logs" goto logs
if "%command%"=="shell" goto shell
if "%command%"=="clean" goto clean
if "%command%"=="help" goto help
goto unknown

:build
echo 🔨 Сборка Docker образов...
docker-compose build --no-cache
echo ✅ Образы собраны!
goto end

:dev
echo 🚀 Запуск в development режиме...
docker-compose up --build
goto end

:start
echo 🚀 Запуск в production режиме...
docker-compose up -d --build
echo ✅ Whisp Quest запущен! Откройте http://localhost
goto end

:stop
echo 🛑 Остановка контейнеров...
docker-compose down
echo ✅ Контейнеры остановлены
goto end

:restart
echo 🔄 Перезагрузка сервисов...
if "%2"=="" (
    docker-compose restart
) else (
    docker-compose restart %2
)
echo ✅ Перезагрузка завершена
goto end

:status
echo 📊 Статус контейнеров:
docker-compose ps
echo.
echo 📈 Использование ресурсов:
docker stats --no-stream
goto end

:logs
if "%2"=="" (
    echo 📋 Показываю логи всех сервисов...
    docker-compose logs -f
) else (
    echo 📋 Показываю логи сервиса: %2
    docker-compose logs -f %2
)
goto end

:shell
set service=%2
if "%service%"=="" set service=whisp-server
echo 🐚 Подключение к контейнеру: !service!
docker-compose exec !service! sh
goto end

:clean
echo 🧹 Полная очистка Docker ресурсов...
set /p confirm=Вы уверены? Это удалит все контейнеры, образы и тома! (y/N): 
if /i "!confirm!"=="y" (
    docker-compose down -v --rmi all --remove-orphans
    docker system prune -af
    echo ✅ Очистка завершена
) else (
    echo ℹ️  Операция отменена
)
goto end

:help
echo 🐳 Whisp Quest Docker Management
echo.
echo Использование: %0 [команда]
echo.
echo Команды:
echo   build          Собрать Docker образы
echo   dev            Запустить в development режиме
echo   start          Запустить в production режиме
echo   stop           Остановить все контейнеры
echo   restart [сервис] Перезагрузить сервис(ы)
echo   status         Показать статус контейнеров
echo   logs [сервис]  Показать логи
echo   shell [сервис] Войти в контейнер (по умолчанию: whisp-server)
echo   clean          Полная очистка
echo   help           Показать эту справку
echo.
echo Сервисы: whisp-frontend, whisp-server
goto end

:unknown
echo ❌ Неизвестная команда: %command%
goto help

:end
