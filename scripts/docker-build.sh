#!/bin/bash

# Скрипт для сборки Docker образа Playwright тестов

set -e

echo "🐳 Сборка Docker образа для Playwright тестов..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверка наличия docker compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Сборка образа
echo "📦 Сборка образа..."
docker compose build

echo "✅ Сборка завершена успешно!"
echo ""
echo "🚀 Доступные команды:"
echo "  docker compose up playwright-tests          # Быстрые тесты"
echo "  docker compose --profile full up           # Полные тесты"
echo "  docker compose --profile monitor up        # Мониторинг"
echo "  docker compose --profile dev up            # Режим разработки"
echo ""
echo "📊 Просмотр результатов:"
echo "  docker compose exec playwright-tests npm run test:report"
