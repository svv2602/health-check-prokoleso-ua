#!/bin/bash

# Скрипт настройки проекта для тестирования prokoleso.ua
# Автор: Prokoleso Health Check Team
# Версия: 1.0.0

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функции логирования
log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Заголовок
echo -e "${BLUE}"
echo "🚀 Настройка проекта тестирования prokoleso.ua"
echo "================================================"
echo -e "${NC}"

# Проверка системы
log "Проверка системы..."

# Проверка операционной системы
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows"
else
    OS="Unknown"
fi

log "Операционная система: $OS"

# Проверка Node.js
if ! command -v node &> /dev/null; then
    error "Node.js не установлен!"
    log "Установите Node.js версии 18 или выше:"
    log "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    log "  macOS: brew install node"
    log "  Windows: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
log "Node.js версия: $NODE_VERSION"

# Проверка npm
if ! command -v npm &> /dev/null; then
    error "npm не установлен!"
    exit 1
fi

NPM_VERSION=$(npm -v)
log "npm версия: $NPM_VERSION"

# Проверка версии Node.js
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    error "Требуется Node.js версии 18 или выше. Текущая версия: $NODE_VERSION"
    exit 1
fi

success "Система готова"

# Создание структуры проекта
log "Создание структуры проекта..."

# Создание папок
mkdir -p reports
mkdir -p test-results
mkdir -p logs
mkdir -p config

# Создание .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test results
test-results/
reports/playwright-report/
reports/test-results.json
reports/test-results.xml
reports/monitor-report.json
reports/alerts.log

# Logs
logs/
*.log

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF

success "Структура проекта создана"

# Установка зависимостей
log "Установка зависимостей..."

if [ -f "package.json" ]; then
    log "Установка npm пакетов..."
    npm install
    
    if [ $? -eq 0 ]; then
        success "Зависимости установлены"
    else
        error "Ошибка установки зависимостей"
        exit 1
    fi
else
    error "package.json не найден!"
    exit 1
fi

# Установка браузеров Playwright
log "Установка браузеров Playwright..."

npx playwright install

if [ $? -eq 0 ]; then
    success "Браузеры Playwright установлены"
else
    error "Ошибка установки браузеров Playwright"
    exit 1
fi

# Установка системных зависимостей для Playwright
log "Установка системных зависимостей..."

if [[ "$OS" == "Linux" ]]; then
    # Проверяем версию Ubuntu и устанавливаем правильные зависимости
    if command -v lsb_release &> /dev/null; then
        UBUNTU_VERSION=$(lsb_release -rs)
        log "Обнаружена Ubuntu версии: $UBUNTU_VERSION"
        
        # Для Ubuntu 25.04+ используем ручную установку зависимостей
        if [[ "$UBUNTU_VERSION" == "25.04" ]] || [[ "$UBUNTU_VERSION" > "24.04" ]]; then
            log "Установка зависимостей для Ubuntu 25.04+..."
            sudo apt update
            sudo apt install -y \
                libwoff1 \
                libgstreamer-plugins-bad1.0-0 \
                libmanette-0.2-0 \
                libicu76 \
                libharfbuzz0b \
                libgstreamer-gl1.0-0 \
                libgstreamer-plugins-bad1.0-0 \
                libgstreamer-plugins-base1.0-0 \
                libgstreamer1.0-0 \
                libgtk-3-0 \
                libgtk-4-1 \
                libxss1 \
                libasound2 \
                libatspi2.0-0 \
                libdrm2 \
                libxcomposite1 \
                libxdamage1 \
                libxrandr2 \
                libgbm1 \
                libxkbcommon0 \
                libgtk-3-0 \
                libxss1 \
                libasound2
        else
            # Для старых версий используем стандартную команду
            npx playwright install-deps
        fi
    else
        # Если lsb_release недоступен, пробуем стандартную установку
        npx playwright install-deps
    fi
elif [[ "$OS" == "macOS" ]]; then
    log "macOS: системные зависимости обычно устанавливаются автоматически"
elif [[ "$OS" == "Windows" ]]; then
    log "Windows: системные зависимости обычно устанавливаются автоматически"
fi

# Создание конфигурационных файлов
log "Создание конфигурационных файлов..."

# Создание .env файла
cat > .env << EOF
# Конфигурация мониторинга prokoleso.ua
PROKOLESO_URL=https://prokoleso.ua
MONITOR_INTERVAL=300000
ALERT_EMAIL=
ALERT_SLACK_WEBHOOK=
ALERT_TELEGRAM_BOT_TOKEN=
ALERT_TELEGRAM_CHAT_ID=

# Настройки тестирования
HEADLESS=true
TIMEOUT=30000
RETRIES=3
EOF

# Создание конфигурации для мониторинга
cat > config/monitor.json << EOF
{
  "url": "https://prokoleso.ua",
  "timeout": 30000,
  "retries": 3,
  "interval": 300000,
  "alertThresholds": {
    "loadTime": 10000,
    "responseTime": 5000,
    "errorRate": 0.1
  },
  "notifications": {
    "email": {
      "enabled": false,
      "smtp": {
        "host": "",
        "port": 587,
        "secure": false,
        "auth": {
          "user": "",
          "pass": ""
        }
      },
      "to": ""
    },
    "slack": {
      "enabled": false,
      "webhook": ""
    },
    "telegram": {
      "enabled": false,
      "botToken": "",
      "chatId": ""
    }
  }
}
EOF

success "Конфигурационные файлы созданы"

# Создание скриптов запуска
log "Создание скриптов запуска..."

# Делаем скрипты исполняемыми
chmod +x scripts/*.sh

# Создание alias для удобства
cat > scripts/aliases.sh << EOF
#!/bin/bash
# Алиасы для удобства работы с проектом

alias prokoleso-test="npm run test:health"
alias prokoleso-monitor="npm run monitor"
alias prokoleso-report="npm run test:report"
alias prokoleso-clean="npm run clean"
alias prokoleso-setup="npm run setup"
EOF

chmod +x scripts/aliases.sh

success "Скрипты созданы"

# Проверка работоспособности
log "Проверка работоспособности..."

# Тестовый запуск
log "Запуск тестового прогона..."
npx playwright test tests/prokoleso-health-check.spec.ts --project=chromium --reporter=list

if [ $? -eq 0 ]; then
    success "Тестовый прогон успешен"
else
    warning "Тестовый прогон завершился с ошибками"
fi

# Финальная информация
echo -e "${GREEN}"
echo "✅ Настройка завершена успешно!"
echo ""
echo "📋 Доступные команды:"
echo "  npm run test:health     - Проверка работоспособности"
echo "  npm run test:specific   - Специфичные тесты"
echo "  npm run test:all        - Все тесты"
echo "  npm run monitor         - Одноразовая проверка"
echo "  npm run monitor:continuous - Непрерывный мониторинг"
echo "  npm run test:report     - Просмотр отчетов"
echo ""
echo "📁 Структура проекта:"
echo "  tests/                  - Тесты"
echo "  reports/                - Отчеты"
echo "  scripts/                - Скрипты"
echo "  config/                 - Конфигурация"
echo ""
echo "🚀 Для начала работы:"
echo "  npm run test:health"
echo -e "${NC}"

success "Проект готов к использованию!"