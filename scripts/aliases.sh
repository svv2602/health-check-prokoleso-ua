#!/bin/bash

# Алиасы для удобства работы с проектом тестирования prokoleso.ua
# Добавьте этот файл в ваш .bashrc или .zshrc:
# source /path/to/Playwright_for_prokoleso/scripts/aliases.sh

# Основные команды тестирования
alias prokoleso-test="npm run test:health"
alias prokoleso-test-all="npm run test:all"
alias prokoleso-test-specific="npm run test:specific"
alias prokoleso-test-ui="npm run test:ui"
alias prokoleso-test-debug="npm run test:debug"

# Команды мониторинга
alias prokoleso-monitor="npm run monitor"
alias prokoleso-monitor-continuous="npm run monitor:continuous"

# Команды отчетов
alias prokoleso-report="npm run test:report"
alias prokoleso-report-open="npm run test:report:open"

# Команды браузеров
alias prokoleso-chrome="npm run test:chrome"
alias prokoleso-firefox="npm run test:firefox"
alias prokoleso-webkit="npm run test:webkit"
alias prokoleso-mobile="npm run test:mobile"
alias prokoleso-tablet="npm run test:tablet"

# Команды управления
alias prokoleso-clean="npm run clean"
alias prokoleso-setup="npm run setup"
alias prokoleso-install="npm run install-browsers"

# Быстрые команды
alias prokoleso-quick="./scripts/run-health-check.sh chromium html false"
alias prokoleso-full="./scripts/run-health-check.sh chromium html,json false"
alias prokoleso-visual="./scripts/run-health-check.sh chromium html true"

# Информационные команды
alias prokoleso-status="echo 'Prokoleso Health Check Status:' && npm run test:health -- --reporter=list"
alias prokoleso-help="echo 'Доступные команды:' && grep 'alias prokoleso-' $0 | sed 's/alias /  /' | sed 's/=\".*//'"

echo "✅ Алиасы prokoleso загружены!"
echo "Используйте 'prokoleso-help' для списка команд"