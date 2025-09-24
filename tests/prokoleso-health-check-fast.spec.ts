import { test, expect } from '@playwright/test';

/**
 * Быстрые тесты для CI/CD - только критичные проверки
 * Выполняются за 30-60 секунд, проверяют основную функциональность
 */
test.describe('Prokoleso.ua - Быстрые проверки (CI/CD)', () => {
  const BASE_URL = 'https://prokoleso.ua';
  
  // Общий хук для навигации
  test.beforeEach(async ({ page }) => {
    // Агрессивные таймауты для скорости
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(10000);
    
    // Быстрая навигация
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  test('Сайт доступен и загружается', async ({ page }) => {
    console.log('🚀 Проверка доступности сайта...');
    
    // Проверка заголовка
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`📄 Заголовок: ${title}`);
    
    // Проверка статуса
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    console.log('✅ Сайт доступен');
  });

  test('Основные элементы присутствуют', async ({ page }) => {
    console.log('🔍 Проверка основных элементов...');
    
    // Проверка body
    await expect(page.locator('body')).toBeVisible();
    
    // Проверка заголовков
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    console.log(`📄 H1 заголовков: ${h1Count}`);
    
    // Проверка изображений
    const imgCount = await page.locator('img').count();
    console.log(`🖼️ Изображений: ${imgCount}`);
    
    console.log('✅ Основные элементы найдены');
  });

  test('HTTPS и безопасность', async ({ page }) => {
    console.log('🔒 Проверка безопасности...');
    
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const url = page.url();
    
    // HTTPS
    expect(url).toMatch(/^https:/);
    console.log('✅ HTTPS активен');
    
    // Статус
    expect(response?.status()).toBe(200);
    console.log('✅ Статус 200 OK');
    
    // Базовые заголовки безопасности
    const headers = response?.headers();
    if (headers) {
      const hasSecurityHeaders = headers['strict-transport-security'] || 
                                headers['x-frame-options'] ||
                                headers['x-content-type-options'];
      if (hasSecurityHeaders) {
        console.log('✅ Заголовки безопасности присутствуют');
      }
    }
  });

  test('Мобильная версия базовая', async ({ page }) => {
    console.log('📱 Проверка мобильной версии...');
    
    // Мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    // Проверка адаптивности
    const bodyBox = await page.locator('body').boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(375);
      console.log(`📏 Ширина: ${bodyBox.width}px`);
    }
    
    console.log('✅ Мобильная версия работает');
  });

  test('Нет критических ошибок консоли', async ({ page }) => {
    console.log('🐛 Проверка ошибок консоли...');
    
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    
    // Фильтруем только критические ошибки
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('analytics') &&
      !error.includes('tracking') &&
      !error.includes('gtag') &&
      !error.includes('google-analytics') &&
      !error.includes('Cookie') &&
      !error.includes('_fbp')
    );
    
    console.log(`❌ Критических ошибок: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(error => console.log(`   - ${error}`));
    }
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Критических ошибок нет');
  });
});
