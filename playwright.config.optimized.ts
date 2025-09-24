import { defineConfig, devices } from '@playwright/test';

/**
 * Оптимизированная конфигурация Playwright для тестирования сайта prokoleso.ua
 * Улучшенная производительность, стабильность и скорость выполнения
 */
export default defineConfig({
  // Директория с тестами
  testDir: './tests',
  
  // Параллельное выполнение тестов
  fullyParallel: true,
  
  // Запрет запуска только части тестов в CI
  forbidOnly: !!process.env.CI,
  
  // Количество повторных попыток при неудаче (уменьшено для скорости)
  retries: process.env.CI ? 1 : 0,
  
  // Количество воркеров для параллельного выполнения (оптимизировано)
  workers: process.env.CI ? 2 : 4,
  
  // Настройки отчетов (упрощены для скорости)
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['list'], // Консольный вывод
    // Кастомный репортер для Telegram уведомлений
    ['./scripts/playwright-telegram-reporter.js']
  ],
  
  // Глобальные настройки для всех тестов (оптимизированы)
  use: {
    // Базовый URL для тестирования
    baseURL: 'https://prokoleso.ua',
    
    // Трассировка только при ошибках
    trace: 'retain-on-failure',
    
    // Скриншоты только при ошибках
    screenshot: 'only-on-failure',
    
    // Видео только при ошибках
    video: 'retain-on-failure',
    
    // Оптимизированные таймауты
    actionTimeout: 8000,
    navigationTimeout: 15000,
    
    // Игнорирование HTTPS ошибок для тестирования
    ignoreHTTPSErrors: true,
    
    // Настройки браузера (оптимизированы)
    viewport: { width: 1280, height: 720 },
    locale: 'ru-RU',
    timezoneId: 'Europe/Kiev',
    
    // Дополнительные настройки для стабильности
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  },
  
  // Оптимизированные проекты (только работающие браузеры)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Убираем channel для стабильности
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Убираем webkit из-за проблем с зависимостями
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Убираем Mobile Safari из-за проблем с webkit
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    }
  ],
  
  // Настройки для CI/CD
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Оптимизированные настройки expect
  expect: {
    // Уменьшенный таймаут для expect утверждений
    timeout: 8000,
  },
  
  // Уменьшенный общий таймаут для теста
  timeout: 30000, // 30 секунд вместо 60
});

/**
 * Конфигурация для быстрых тестов (только критичные проверки)
 */
export const fastConfig = defineConfig({
  ...defineConfig({}),
  testDir: './tests',
  testMatch: '**/prokoleso-health-check-fast.spec.ts',
  projects: [
    {
      name: 'chromium-fast',
      use: { 
        ...devices['Desktop Chrome'],
        // Минимальные настройки для скорости
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
        }
      },
    }
  ],
  timeout: 15000, // 15 секунд для быстрых тестов
  retries: 0,
  workers: 1
});
