#!/usr/bin/env node

/**
 * Скрипт мониторинга сайта prokoleso.ua
 * Проверяет доступность и производительность сайта
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
  url: 'https://prokoleso.ua',
  timeout: 30000,
  retries: 3,
  interval: 5 * 60 * 1000, // 5 минут
  reportFile: 'reports/monitor-report.json',
  alertThresholds: {
    loadTime: 10000, // 10 секунд
    responseTime: 5000, // 5 секунд
    errorRate: 0.1 // 10%
  }
};

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

// Функция проверки сайта
async function checkWebsite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const startTime = Date.now();
  let success = false;
  let error = null;
  let metrics = {};
  
  try {
    log('🔍 Проверка сайта prokoleso.ua...', 'blue');
    
    // Переход на сайт
    const response = await page.goto(CONFIG.url, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout 
    });
    
    // Проверка статуса ответа
    if (response.status() !== 200) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }
    
    // Измерение метрик производительности
    metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        responseTime: navigation.responseEnd - navigation.requestStart,
        transferSize: navigation.transferSize,
        domSize: document.documentElement.outerHTML.length
      };
    });
    
    // Проверка консольных ошибок
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Проверка основных элементов
    const bodyVisible = await page.locator('body').isVisible();
    const title = await page.title();
    
    if (!bodyVisible) {
      throw new Error('Основной контент не загружен');
    }
    
    if (!title || title.length === 0) {
      throw new Error('Заголовок страницы отсутствует');
    }
    
    success = true;
    
    log(`✅ Сайт доступен`, 'green');
    log(`📄 Заголовок: ${title}`, 'cyan');
    log(`⏱️ Время загрузки: ${metrics.loadComplete}ms`, 'cyan');
    log(`🎨 First Paint: ${metrics.firstPaint}ms`, 'cyan');
    log(`📊 Размер DOM: ${Math.round(metrics.domSize / 1024)}KB`, 'cyan');
    
    if (consoleErrors.length > 0) {
      log(`⚠️ Ошибок в консоли: ${consoleErrors.length}`, 'yellow');
      consoleErrors.forEach(error => log(`   - ${error}`, 'yellow'));
    }
    
  } catch (err) {
    error = err.message;
    log(`❌ Ошибка: ${error}`, 'red');
  } finally {
    await browser.close();
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  return {
    timestamp: new Date().toISOString(),
    success,
    error,
    totalTime,
    metrics,
    url: CONFIG.url
  };
}

// Функция сохранения отчета
function saveReport(result) {
  const reportPath = path.dirname(CONFIG.reportFile);
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }
  
  let report = [];
  if (fs.existsSync(CONFIG.reportFile)) {
    try {
      report = JSON.parse(fs.readFileSync(CONFIG.reportFile, 'utf8'));
    } catch (err) {
      log('⚠️ Ошибка чтения отчета, создаю новый', 'yellow');
    }
  }
  
  report.push(result);
  
  // Ограничиваем размер отчета (последние 100 записей)
  if (report.length > 100) {
    report = report.slice(-100);
  }
  
  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
  log(`📊 Отчет сохранен: ${CONFIG.reportFile}`, 'blue');
}

// Функция анализа трендов
function analyzeTrends(report) {
  if (report.length < 5) return;
  
  const recent = report.slice(-5);
  const successRate = recent.filter(r => r.success).length / recent.length;
  const avgLoadTime = recent
    .filter(r => r.success && r.metrics)
    .reduce((sum, r) => sum + r.metrics.loadComplete, 0) / recent.length;
  
  log(`📈 Анализ трендов:`, 'blue');
  log(`   Успешность: ${(successRate * 100).toFixed(1)}%`, 'cyan');
  log(`   Среднее время загрузки: ${Math.round(avgLoadTime)}ms`, 'cyan');
  
  // Проверка пороговых значений
  if (successRate < 0.9) {
    log(`🚨 ВНИМАНИЕ: Низкая успешность (${(successRate * 100).toFixed(1)}%)`, 'red');
  }
  
  if (avgLoadTime > CONFIG.alertThresholds.loadTime) {
    log(`🚨 ВНИМАНИЕ: Медленная загрузка (${Math.round(avgLoadTime)}ms)`, 'red');
  }
}

// Основная функция
async function main() {
  log('🚀 Запуск мониторинга prokoleso.ua', 'blue');
  log(`🔧 Конфигурация:`, 'blue');
  log(`   URL: ${CONFIG.url}`, 'cyan');
  log(`   Таймаут: ${CONFIG.timeout}ms`, 'cyan');
  log(`   Интервал: ${CONFIG.interval / 1000}с`, 'cyan');
  
  try {
    const result = await checkWebsite();
    saveReport(result);
    
    // Анализ трендов если есть история
    if (fs.existsSync(CONFIG.reportFile)) {
      const report = JSON.parse(fs.readFileSync(CONFIG.reportFile, 'utf8'));
      analyzeTrends(report);
    }
    
    // Код выхода
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    log(`💥 Критическая ошибка: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Обработка сигналов
process.on('SIGINT', () => {
  log('🛑 Остановка мониторинга...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Остановка мониторинга...', 'yellow');
  process.exit(0);
});

// Запуск
if (require.main === module) {
  main();
}

module.exports = { checkWebsite, CONFIG };