#!/bin/bash

# Скрипт для запуска Docker контейнеров с Playwright тестами

set -e

# Функция для отображения справки
show_help() {
    echo "🐳 Playwright Docker Runner"
    echo ""
    echo "Использование: $0 [КОМАНДА] [ОПЦИИ]"
    echo ""
    echo "Команды:"
    echo "  fast      - Быстрые тесты (по умолчанию)"
    echo "  full      - Полные тесты"
    echo "  health    - Тесты работоспособности"
    echo "  checkout  - Тесты формы заказа"
    echo "  specific  - Специфичные тесты"
    echo "  monitor   - Непрерывный мониторинг"
    echo "  dev       - Режим разработки с UI"
    echo "  clean     - Очистка контейнеров и образов"
    echo ""
    echo "Опции:"
    echo "  --detach, -d    - Запуск в фоновом режиме"
    echo "  --build         - Пересборка образа"
    echo "  --logs          - Показать логи"
    echo "  --help, -h      - Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 fast --build"
    echo "  $0 full --detach"
    echo "  $0 monitor --logs"
}

# Параметры по умолчанию
COMMAND="fast"
DETACH=""
BUILD=""
LOGS=""

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        fast|full|health|checkout|specific|monitor|dev|clean)
            COMMAND="$1"
            shift
            ;;
        --detach|-d)
            DETACH="-d"
            shift
            ;;
        --build)
            BUILD="--build"
            shift
            ;;
        --logs)
            LOGS="logs"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

echo "🐳 Запуск Playwright тестов в Docker..."

case $COMMAND in
    fast)
        echo "⚡ Запуск быстрых тестов..."
        docker compose up $DETACH $BUILD playwright-tests
        ;;
    full)
        echo "🧪 Запуск полных тестов..."
        docker compose --profile full up $DETACH $BUILD playwright-full
        ;;
    health)
        echo "🏥 Запуск тестов работоспособности..."
        docker compose run --rm playwright-tests npm run test:health
        ;;
    checkout)
        echo "🛒 Запуск тестов формы заказа..."
        docker compose run --rm playwright-tests npm run test:checkout
        ;;
    specific)
        echo "🎯 Запуск специфичных тестов..."
        docker compose run --rm playwright-tests npm run test:specific
        ;;
    monitor)
        echo "📊 Запуск мониторинга..."
        docker compose --profile monitor up $DETACH $BUILD playwright-monitor
        ;;
    dev)
        echo "🛠️ Запуск режима разработки..."
        docker compose --profile dev up $DETACH $BUILD playwright-dev
        ;;
    clean)
        echo "🧹 Очистка Docker ресурсов..."
        docker compose down --rmi all --volumes --remove-orphans
        docker system prune -f
        echo "✅ Очистка завершена"
        exit 0
        ;;
esac

if [[ "$LOGS" == "logs" ]]; then
    echo "📋 Показ логов..."
    docker compose logs -f
fi

echo "✅ Выполнение завершено"
