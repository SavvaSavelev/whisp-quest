#!/bin/bash

# 🐳 Whisp Quest Docker Management Script

set -e

# Цвета для красивого вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен!"
        exit 1
    fi
    
    success "Docker готов к работе"
}

# Проверка .env файла
check_env() {
    if [ ! -f .env ]; then
        warning "Файл .env не найден, создаю из шаблона..."
        cp .env.production .env
        warning "Не забудьте добавить ваш OPENAI_API_KEY в файл .env!"
    fi
}

# Сборка образов
build() {
    info "🔨 Сборка Docker образов..."
    docker-compose build --no-cache
    success "Образы собраны!"
}

# Запуск в development режиме
dev() {
    info "🚀 Запуск в development режиме..."
    check_env
    docker-compose up --build
}

# Запуск в production режиме
start() {
    info "🚀 Запуск в production режиме..."
    check_env
    docker-compose up -d --build
    success "Whisp Quest запущен! Откройте http://localhost"
}

# Остановка всех контейнеров
stop() {
    info "🛑 Остановка контейнеров..."
    docker-compose down
    success "Контейнеры остановлены"
}

# Полная очистка (контейнеры + образы + тома)
clean() {
    warning "🧹 Полная очистка Docker ресурсов..."
    read -p "Вы уверены? Это удалит все контейнеры, образы и тома! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all --remove-orphans
        docker system prune -af
        success "Очистка завершена"
    else
        info "Операция отменена"
    fi
}

# Логи контейнеров
logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        info "📋 Показываю логи всех сервисов..."
        docker-compose logs -f
    else
        info "📋 Показываю логи сервиса: $service"
        docker-compose logs -f "$service"
    fi
}

# Статус контейнеров
status() {
    info "📊 Статус контейнеров:"
    docker-compose ps
    echo
    info "📈 Использование ресурсов:"
    docker stats --no-stream
}

# Вход в контейнер
shell() {
    service=${1:-"whisp-server"}
    info "🐚 Подключение к контейнеру: $service"
    docker-compose exec "$service" sh
}

# Перезагрузка сервиса
restart() {
    service=${1:-""}
    if [ -z "$service" ]; then
        info "🔄 Перезагрузка всех сервисов..."
        docker-compose restart
    else
        info "🔄 Перезагрузка сервиса: $service"
        docker-compose restart "$service"
    fi
    success "Перезагрузка завершена"
}

# Показать помощь
help() {
    echo "🐳 Whisp Quest Docker Management"
    echo ""
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  build          Собрать Docker образы"
    echo "  dev            Запустить в development режиме"
    echo "  start          Запустить в production режиме"
    echo "  stop           Остановить все контейнеры"
    echo "  restart [сервис] Перезагрузить сервис(ы)"
    echo "  status         Показать статус контейнеров"
    echo "  logs [сервис]  Показать логи"
    echo "  shell [сервис] Войти в контейнер (по умолчанию: whisp-server)"
    echo "  clean          Полная очистка"
    echo "  help           Показать эту справку"
    echo ""
    echo "Сервисы: whisp-frontend, whisp-server"
}

# Основная логика
main() {
    check_docker
    
    case "${1:-help}" in
        "build")
            build
            ;;
        "dev")
            dev
            ;;
        "start")
            start
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart "$2"
            ;;
        "status")
            status
            ;;
        "logs")
            logs "$2"
            ;;
        "shell")
            shell "$2"
            ;;
        "clean")
            clean
            ;;
        "help"|"--help"|"-h")
            help
            ;;
        *)
            error "Неизвестная команда: $1"
            help
            exit 1
            ;;
    esac
}

main "$@"
