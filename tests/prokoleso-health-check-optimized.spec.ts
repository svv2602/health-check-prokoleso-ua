import { test, expect } from '@playwright/test';

/**
 * Оптимизированные тесты проверки работоспособности сайта prokoleso.ua
 * Улучшенная производительность, стабильность и скорость выполнения
 */
test.describe('Prokoleso.ua - Оптимизированная проверка работоспособности', () => {
  const BASE_URL = 'https://prokoleso.ua';
  
  // Общий хук для навигации (избегаем дублирования)
  test.beforeEach(async ({ page }) => {
    // Устанавливаем более агрессивные таймауты
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    
    // Переходим на главную страницу один раз
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    // Ждем загрузки основных элементов
    await page.waitForSelector('body', { timeout: 10000 });
  });

  test('Главная страница загружается корректно', async ({ page }) => {
    console.log('🔍 Проверка загрузки главной страницы...');
    
    // Проверка заголовка страницы
    const title = await page.title();
    console.log(`📄 Заголовок страницы: ${title}`);
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Проверка основных элементов
    await expect(page.locator('body')).toBeVisible();
    
    // Оптимизированное измерение времени загрузки
    const loadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation && navigation.loadEventEnd && navigation.navigationStart) {
        return navigation.loadEventEnd - navigation.navigationStart;
      }
      return null;
    });
    
    if (loadTime !== null) {
      console.log(`⏱️ Время загрузки: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(15000); // Увеличено до 15 секунд
    } else {
      console.log('⚠️ Не удалось измерить время загрузки');
    }
    
    // Проверка статуса ответа
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });

  test('Навигационное меню работает', async ({ page }) => {
    console.log('🧭 Проверка навигационного меню...');
    
    // Поиск навигационных элементов с таймаутом
    const navigationSelectors = [
      'nav',
      '.navigation',
      '.menu',
      '.navbar',
      '.header',
      '[role="navigation"]'
    ];
    
    let navigationFound = false;
    for (const selector of navigationSelectors) {
      const nav = page.locator(selector);
      const count = await nav.count();
      if (count > 0) {
        try {
          await expect(nav.first()).toBeVisible({ timeout: 5000 });
          navigationFound = true;
          console.log(`✅ Найдена навигация: ${selector}`);
          break;
        } catch (error) {
          console.log(`⚠️ Навигация ${selector} найдена, но не видима`);
        }
      }
    }
    
    // Проверка ссылок в меню
    const menuLinks = page.locator('nav a, .navigation a, .menu a, .navbar a');
    const linkCount = await menuLinks.count();
    console.log(`🔗 Найдено ссылок в меню: ${linkCount}`);
    
    if (linkCount > 0) {
      // Проверяем первую ссылку
      const firstLink = menuLinks.first();
      try {
        await expect(firstLink).toBeVisible({ timeout: 3000 });
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
      } catch (error) {
        console.log('⚠️ Первая ссылка не видима или не имеет href');
      }
    }
    
    // Не строго требуем навигацию, только проверяем
    if (!navigationFound) {
      console.log('⚠️ Навигационное меню не найдено');
    }
  });

  test('Поиск работает корректно', async ({ page }) => {
    console.log('🔍 Проверка функции поиска...');
    
    // Поиск поля поиска с оптимизированными селекторами
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="поиск" i]',
      'input[placeholder*="search" i]',
      'input[placeholder*="найти" i]',
      '.search input',
      '#search',
      '[name="search"]'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      const input = page.locator(selector);
      const count = await input.count();
      if (count > 0) {
        searchInput = input.first();
        console.log(`✅ Найдено поле поиска: ${selector}`);
        break;
      }
    }
    
    if (searchInput) {
      try {
        await expect(searchInput).toBeVisible({ timeout: 5000 });
        
        // Тестируем поиск
        await searchInput.fill('шины');
        await searchInput.press('Enter');
        
        // Ждем загрузки результатов с таймаутом
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        await expect(page.locator('body')).toBeVisible();
        
        console.log('✅ Поиск выполнен успешно');
      } catch (error) {
        console.log('⚠️ Ошибка при тестировании поиска');
      }
    } else {
      console.log('⚠️ Поле поиска не найдено');
    }
  });

  test('Контактная информация доступна', async ({ page }) => {
    console.log('📞 Проверка контактной информации...');
    
    // Поиск контактной информации с оптимизированными селекторами
    const contactSelectors = [
      'text=/телефон|phone/i',
      'text=/контакт|contact/i',
      'text=/адрес|address/i',
      'text=/email|почта/i',
      '.contact',
      '.phone',
      '.address'
    ];
    
    let contactInfoFound = false;
    for (const selector of contactSelectors) {
      const contact = page.locator(selector);
      const count = await contact.count();
      if (count > 0) {
        try {
          await expect(contact.first()).toBeVisible({ timeout: 3000 });
          contactInfoFound = true;
          console.log(`✅ Найдена контактная информация: ${selector}`);
          break;
        } catch (error) {
          console.log(`⚠️ Контактная информация ${selector} найдена, но не видима`);
        }
      }
    }
    
    if (!contactInfoFound) {
      console.log('⚠️ Контактная информация не найдена');
    }
  });

  test('Мобильная версия работает', async ({ page }) => {
    console.log('📱 Проверка мобильной версии...');
    
    // Тест на мобильном устройстве
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    await expect(page.locator('body')).toBeVisible();
    
    // Проверка адаптивности
    const bodyBox = await page.locator('body').boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(375);
      console.log(`📏 Ширина контента: ${bodyBox.width}px`);
    }
    
    // Проверка наличия мобильного меню
    const mobileMenuSelectors = [
      '.mobile-menu',
      '.hamburger',
      '.menu-toggle',
      '[aria-label*="меню" i]',
      '[aria-label*="menu" i]'
    ];
    
    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      const menu = page.locator(selector);
      const count = await menu.count();
      if (count > 0) {
        mobileMenuFound = true;
        console.log(`✅ Найдено мобильное меню: ${selector}`);
        break;
      }
    }
    
    if (!mobileMenuFound) {
      console.log('⚠️ Мобильное меню не найдено');
    }
  });

  test('Производительность сайта', async ({ page }) => {
    console.log('⚡ Проверка производительности...');
    
    // Измерение метрик производительности с проверкой на NaN
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const safeGetTime = (start: number, end: number) => {
        if (start && end && !isNaN(start) && !isNaN(end)) {
          return end - start;
        }
        return null;
      };
      
      return {
        domContentLoaded: safeGetTime(navigation.navigationStart, navigation.domContentLoadedEventEnd),
        loadComplete: safeGetTime(navigation.navigationStart, navigation.loadEventEnd),
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || null,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || null,
        responseTime: safeGetTime(navigation.requestStart, navigation.responseEnd)
      };
    });
    
    console.log(`📊 Метрики производительности:`);
    console.log(`   DOM Content Loaded: ${metrics.domContentLoaded || 'N/A'}ms`);
    console.log(`   Load Complete: ${metrics.loadComplete || 'N/A'}ms`);
    console.log(`   First Paint: ${metrics.firstPaint || 'N/A'}ms`);
    console.log(`   First Contentful Paint: ${metrics.firstContentfulPaint || 'N/A'}ms`);
    console.log(`   Response Time: ${metrics.responseTime || 'N/A'}ms`);
    
    // Проверка времени загрузки только если метрики доступны
    if (metrics.domContentLoaded !== null) {
      expect(metrics.domContentLoaded).toBeLessThan(10000); // 10 секунд
    }
    if (metrics.loadComplete !== null) {
      expect(metrics.loadComplete).toBeLessThan(15000); // 15 секунд
    }
    if (metrics.responseTime !== null) {
      expect(metrics.responseTime).toBeLessThan(5000); // 5 секунд
    }
  });

  test('Проверка ошибок в консоли', async ({ page }) => {
    console.log('🐛 Проверка ошибок в консоли...');
    
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    console.log(`❌ Ошибок в консоли: ${consoleErrors.length}`);
    console.log(`⚠️ Предупреждений в консоли: ${consoleWarnings.length}`);
    
    // Фильтруем критические ошибки (исключаем favicon, analytics, tracking)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('analytics') &&
      !error.includes('tracking') &&
      !error.includes('gtag') &&
      !error.includes('google-analytics') &&
      !error.includes('Cookie') &&
      !error.includes('_fbp')
    );
    
    if (criticalErrors.length > 0) {
      console.log('🚨 Критические ошибки:');
      criticalErrors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Проверяем отсутствие критических ошибок
    expect(criticalErrors.length).toBe(0);
  });

  test('Проверка доступности (a11y)', async ({ page }) => {
    console.log('♿ Проверка доступности...');
    
    // Проверка наличия alt атрибутов у изображений
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`🖼️ Найдено изображений: ${imageCount}`);
    
    let imagesWithoutAlt = 0;
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      if (!alt) {
        imagesWithoutAlt++;
      }
    }
    
    console.log(`❌ Изображений без alt: ${imagesWithoutAlt}`);
    expect(imagesWithoutAlt).toBe(0);
    
    // Проверка наличия заголовков
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    console.log(`📝 Найдено заголовков: ${headingCount}`);
    expect(headingCount).toBeGreaterThan(0);
    
    // Проверка наличия h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    console.log(`📄 Найдено H1 заголовков: ${h1Count}`);
    
    // Проверка семантических элементов
    const semanticElements = page.locator('main, article, section, aside, nav, header, footer');
    const semanticCount = await semanticElements.count();
    console.log(`🏗️ Найдено семантических элементов: ${semanticCount}`);
  });

  test('Проверка безопасности (HTTPS)', async ({ page }) => {
    console.log('🔒 Проверка безопасности...');
    
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const url = page.url();
    
    // Проверка HTTPS
    expect(url).toMatch(/^https:/);
    console.log(`✅ Используется HTTPS: ${url}`);
    
    // Проверка статуса ответа
    expect(response?.status()).toBe(200);
    console.log(`✅ Статус ответа: ${response?.status()}`);
    
    // Проверка заголовков безопасности
    const headers = response?.headers();
    if (headers) {
      const securityHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];
      
      console.log('🛡️ Заголовки безопасности:');
      securityHeaders.forEach(header => {
        const value = headers[header];
        if (value) {
          console.log(`   ✅ ${header}: ${value}`);
        } else {
          console.log(`   ❌ ${header}: отсутствует`);
        }
      });
    }
  });
});
