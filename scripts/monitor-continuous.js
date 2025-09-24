#!/usr/bin/env node

/**
 * Непрерывный мониторинг сайта prokoleso.ua
 * Запускает проверки с заданным интервалом
 */

const { checkWebsite, CONFIG } = require('./monitor.js');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Функция логирования
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}]${colors.reset} ${message}`);
}

// Функция отправки уведомлений (заглушка)
function sendAlert(message, type = 'error') {
  // Здесь можно добавить отправку уведомлений:
  // - Email через nodemailer
  // - Slack webhook
  // - Telegram bot
  // - SMS через Twilio
  
  log(`🚨 АЛЕРТ [${type.toUpperCase()}]: ${message}`, 'red');
  
  // Пример отправки в файл
  const alertFile = 'reports/alerts.log';
  const alertMessage = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(alertFile, alertMessage);
}

// Функция анализа результатов
function analyzeResult(result, history) {
  const alerts = [];
  
  // Проверка успешности
  if (!result.success) {
    alerts.push({
      type: 'error',
      message: `Сайт недоступен: ${result.error}`
    });
  }
  
  // Проверка времени загрузки
  if (result.success && result.metrics) {
    if (result.metrics.loadComplete > CONFIG.alertThresholds.loadTime) {
      alerts.push({
        type: 'warning',
        message: `Медленная загрузка: ${result.metrics.loadComplete}ms`
      });
    }
    
    if (result.metrics.responseTime > CONFIG.alertThresholds.responseTime) {
      alerts.push({
        type: 'warning',
        message: `Медленный ответ сервера: ${result.metrics.responseTime}ms`
      });
    }
  }
  
  // Анализ трендов
  if (history.length >= 5) {
    const recent = history.slice(-5);
    const successRate = recent.filter(r => r.success).length / recent.length;
    
    if (successRate < (1 - CONFIG.alertThresholds.errorRate)) {
      alerts.push({
        type: 'error',
        message: `Низкая успешность: ${(successRate * 100).toFixed(1)}% за последние 5 проверок`
      });
    }
  }
  
  return alerts;
}

// Функция непрерывного мониторинга
async function continuousMonitoring() {
  log('🔄 Запуск непрерывного мониторинга', 'blue');
  log(`⏰ Интервал: ${CONFIG.interval / 1000} секунд`, 'cyan');
  log(`📊 Отчеты: ${CONFIG.reportFile}`, 'cyan');
  log('🛑 Для остановки нажмите Ctrl+C', 'yellow');
  
  let checkCount = 0;
  let lastAlertTime = 0;
  const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 минут между алертами
  
  const runCheck = async () => {
    checkCount++;
    log(`\n🔍 Проверка #${checkCount}`, 'blue');
    
    try {
      const result = await checkWebsite();
      
      // Загрузка истории
      let history = [];
      if (fs.existsSync(CONFIG.reportFile)) {
        try {
          history = JSON.parse(fs.readFileSync(CONFIG.reportFile, 'utf8'));
        } catch (err) {
          log('⚠️ Ошибка чтения истории', 'yellow');
        }
      }
      
      // Сохранение результата
      history.push(result);
      if (history.length > 100) {
        history = history.slice(-100);
      }
      fs.writeFileSync(CONFIG.reportFile, JSON.stringify(history, null, 2));
      
      // Анализ и алерты
      const alerts = analyzeResult(result, history);
      const now = Date.now();
      
      for (const alert of alerts) {
        if (now - lastAlertTime > ALERT_COOLDOWN) {
          sendAlert(alert.message, alert.type);
          lastAlertTime = now;
        } else {
          log(`⏳ Алерт пропущен (cooldown): ${alert.message}`, 'yellow');
        }
      }
      
      // Статистика
      if (history.length > 0) {
        const successCount = history.filter(r => r.success).length;
        const successRate = (successCount / history.length * 100).toFixed(1);
        log(`📈 Успешность: ${successRate}% (${successCount}/${history.length})`, 'cyan');
      }
      
    } catch (error) {
      log(`💥 Ошибка проверки: ${error.message}`, 'red');
      sendAlert(`Критическая ошибка мониторинга: ${error.message}`, 'error');
    }
  };
  
  // Первая проверка
  await runCheck();
  
  // Запуск интервальных проверок
  const intervalId = setInterval(runCheck, CONFIG.interval);
  
  // Обработка сигналов остановки
  const cleanup = () => {
    log('\n🛑 Остановка мониторинга...', 'yellow');
    clearInterval(intervalId);
    log(`📊 Всего проверок: ${checkCount}`, 'cyan');
    log(`📁 Отчеты сохранены: ${CONFIG.reportFile}`, 'cyan');
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Обработка необработанных ошибок
  process.on('uncaughtException', (error) => {
    log(`💥 Необработанная ошибка: ${error.message}`, 'red');
    cleanup();
  });
  
  process.on('unhandledRejection', (reason) => {
    log(`💥 Необработанное отклонение: ${reason}`, 'red');
    cleanup();
  });
}

// Запуск
if (require.main === module) {
  continuousMonitoring();
}

module.exports = { continuousMonitoring };