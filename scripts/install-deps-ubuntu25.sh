#!/bin/bash

# Скрипт установки зависимостей Playwright для Ubuntu 25.04+
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
    echo -e "${BLUE}[INSTALL-DEPS]${NC} $1"
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

log "Установка зависимостей Playwright для Ubuntu 25.04+"

# Обновляем список пакетов
log "Обновление списка пакетов..."
sudo apt update

# Устанавливаем основные зависимости
log "Установка основных зависимостей..."
sudo apt install -y \
    libwoff1 \
    libgstreamer-plugins-bad1.0-0 \
    libmanette-0.2-0 \
    libicu76 \
    libharfbuzz0b \
    libgstreamer-gl1.0-0 \
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
    libxkbcommon0

# Устанавливаем дополнительные зависимости для браузеров
log "Установка дополнительных зависимостей для браузеров..."
sudo apt install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0

# Устанавливаем шрифты
log "Установка шрифтов..."
sudo apt install -y \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk

# Проверяем установку
log "Проверка установленных пакетов..."
if dpkg -l | grep -q libicu76; then
    success "libicu76 установлен"
else
    warning "libicu76 не найден"
fi

if dpkg -l | grep -q libwoff1; then
    success "libwoff1 установлен"
else
    warning "libwoff1 не найден"
fi

if dpkg -l | grep -q libgstreamer-plugins-bad1.0-0; then
    success "libgstreamer-plugins-bad1.0-0 установлен"
else
    warning "libgstreamer-plugins-bad1.0-0 не найден"
fi

if dpkg -l | grep -q libmanette-0.2-0; then
    success "libmanette-0.2-0 установлен"
else
    warning "libmanette-0.2-0 не найден"
fi

success "Установка зависимостей завершена!"

log "Теперь можно запустить:"
log "  npx playwright install"
log "  npm run test:health"
