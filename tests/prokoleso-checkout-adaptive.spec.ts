import { test, expect } from '@playwright/test';

/**
 * Адаптивный тест формы заказа
 * Учитывает, что форма может быть скрыта при пустой корзине
 */

test.describe('Адаптивная проверка формы заказа - Prokoleso.ua', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://prokoleso.ua/ua/checkout/');
    // Убираем ожидание networkidle, так как страница может загружаться долго
    await page.waitForTimeout(3000);
  });

  test('Проверка состояния корзины и доступности формы', async ({ page }) => {
    console.log('🛒 Проверка состояния корзины...');
    
    // Проверяем заголовок страницы
    const title = await page.title();
    console.log(`📄 Заголовок страницы: "${title}"`);
    
    // Ищем сообщение о пустой корзине
    const emptyCartMessages = [
      'Кошик порожній',
      'Корзина пуста', 
      'empty cart',
      'cart is empty',
      'Ваш список обраного порожній',
      'Ваш список порівняння порожній'
    ];
    
    let cartEmpty = false;
    for (const message of emptyCartMessages) {
      const element = page.locator(`text=${message}`);
      if (await element.count() > 0 && await element.first().isVisible()) {
        console.log(`⚠️ Найдено сообщение: "${message}"`);
        cartEmpty = true;
        break;
      }
    }
    
    if (cartEmpty) {
      console.log('🛒 Корзина пуста - проверяем альтернативные варианты');
      
      // Ищем ссылки на каталог
      const catalogLinks = page.locator('a[href*="catalog"], a[href*="каталог"], a:has-text("До каталогу"), a:has-text("В каталог")');
      const linkCount = await catalogLinks.count();
      
      if (linkCount > 0) {
        console.log(`📂 Найдено ссылок на каталог: ${linkCount}`);
        for (let i = 0; i < Math.min(3, linkCount); i++) {
          const link = catalogLinks.nth(i);
          const linkText = await link.textContent();
          const linkHref = await link.getAttribute('href');
          console.log(`  - ${linkText?.trim()}: ${linkHref}`);
        }
      }
      
      // Ищем предложения товаров
      const productSuggestions = page.locator('text=Купити, text=Покупка, text=Рекомендації, .product-suggestion, .recommendation');
      const suggestionCount = await productSuggestions.count();
      
      if (suggestionCount > 0) {
        console.log(`💡 Найдено предложений товаров: ${suggestionCount}`);
      }
      
      console.log('✅ Тест завершен - корзина пуста, форма заказа недоступна');
      return;
    }
    
    console.log('🛒 В корзине есть товары - проверяем форму заказа');
  });

  test('Поиск полей формы заказа (если доступна)', async ({ page }) => {
    console.log('🔍 Поиск полей формы заказа...');
    
    // Проверяем, есть ли форма заказа
    const formSelectors = [
      'form',
      '[class*="checkout"]',
      '[class*="order"]',
      '[class*="cart"]',
      '.checkout-form',
      '.order-form',
      '.cart-form'
    ];
    
    let formFound = false;
    for (const selector of formSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`📝 Найдена форма: ${selector} (${count} элементов)`);
        formFound = true;
        break;
      }
    }
    
    if (!formFound) {
      console.log('⚠️ Форма заказа не найдена - возможно, корзина пуста');
      return;
    }
    
    // Ищем поля ввода
    const inputSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="number"]',
      'textarea',
      'select'
    ];
    
    let totalInputs = 0;
    for (const selector of inputSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`📝 Найдено элементов "${selector}": ${count}`);
        totalInputs += count;
        
        // Показываем первые несколько элементов
        for (let i = 0; i < Math.min(3, count); i++) {
          const element = elements.nth(i);
          if (await element.isVisible()) {
            const placeholder = await element.getAttribute('placeholder');
            const name = await element.getAttribute('name');
            const type = await element.getAttribute('type');
            const tagName = await element.evaluate(el => el.tagName);
            
            console.log(`  - ${tagName}${name ? `[name="${name}"]` : ''}${type ? `[type="${type}"]` : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}`);
          }
        }
      }
    }
    
    console.log(`📊 Всего найдено полей ввода: ${totalInputs}`);
  });

  test('Проверка навигации и ссылок', async ({ page }) => {
    console.log('🧭 Проверка навигации и ссылок...');
    
    // Ищем все ссылки на странице
    const allLinks = page.locator('a[href]');
    const linkCount = await allLinks.count();
    
    console.log(`🔗 Найдено ссылок: ${linkCount}`);
    
    // Категоризируем ссылки
    const linkCategories = {
      'Каталог': ['catalog', 'каталог', 'товар', 'product'],
      'Корзина': ['cart', 'корзина', 'basket'],
      'Профиль': ['profile', 'профиль', 'account', 'аккаунт'],
      'Контакты': ['contact', 'контакт', 'about', 'о нас'],
      'Помощь': ['help', 'помощь', 'support', 'поддержка']
    };
    
    for (const [category, keywords] of Object.entries(linkCategories)) {
      let categoryCount = 0;
      const categoryLinks = [];
      
      for (let i = 0; i < linkCount; i++) {
        const link = allLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && keywords.some(keyword => 
          href.toLowerCase().includes(keyword) || 
          (text && text.toLowerCase().includes(keyword))
        )) {
          categoryCount++;
          categoryLinks.push({
            text: text?.trim(),
            href: href
          });
        }
      }
      
      if (categoryCount > 0) {
        console.log(`📂 ${category}: ${categoryCount} ссылок`);
        for (let i = 0; i < Math.min(3, categoryLinks.length); i++) {
          const link = categoryLinks[i];
          console.log(`  - ${link.text || 'Без текста'}: ${link.href}`);
        }
      }
    }
  });

  test('Проверка мобильной адаптивности', async ({ page }) => {
    console.log('📱 Проверка мобильной адаптивности...');
    
    // Тестируем разные размеры экрана
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 768, height: 1024, name: 'iPad' }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n📱 Тестирование ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Проверяем основные элементы
      const checks = [
        { selector: 'header, .header, nav', name: 'Шапка сайта' },
        { selector: 'main, .main, .content', name: 'Основной контент' },
        { selector: 'footer, .footer', name: 'Подвал сайта' },
        { selector: 'form, .form', name: 'Формы' },
        { selector: 'button, .btn', name: 'Кнопки' }
      ];
      
      for (const check of checks) {
        const elements = page.locator(check.selector);
        const count = await elements.count();
        const visibleCount = await elements.filter({ hasText: /.+/ }).count();
        
        if (count > 0) {
          console.log(`  ✅ ${check.name}: ${count} элементов (${visibleCount} видимых)`);
        } else {
          console.log(`  ⚠️ ${check.name}: не найдено`);
        }
      }
    }
  });

  test('Проверка производительности загрузки', async ({ page }) => {
    console.log('⚡ Проверка производительности загрузки...');
    
    const startTime = Date.now();
    
    // Измеряем время загрузки
    await page.goto('https://prokoleso.ua/ua/checkout/', { waitUntil: 'domcontentloaded' });
    const domContentLoadedTime = Date.now() - startTime;
    
    await page.waitForLoadState('load');
    const fullLoadTime = Date.now() - startTime;
    
    console.log(`📊 Время загрузки DOM: ${domContentLoadedTime}мс`);
    console.log(`📊 Полная загрузка: ${fullLoadTime}мс`);
    
    // Проверяем размер страницы
    const pageSize = await page.evaluate(() => {
      return {
        htmlSize: document.documentElement.outerHTML.length,
        bodySize: document.body.outerHTML.length,
        scriptCount: document.scripts.length,
        styleCount: document.styleSheets.length
      };
    });
    
    console.log(`📊 Размер HTML: ${Math.round(pageSize.htmlSize / 1024)}KB`);
    console.log(`📊 Размер body: ${Math.round(pageSize.bodySize / 1024)}KB`);
    console.log(`📊 Скриптов: ${pageSize.scriptCount}`);
    console.log(`📊 Стилей: ${pageSize.styleCount}`);
    
    // Проверяем консольные ошибки
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️ Найдено ошибок в консоли: ${consoleErrors.length}`);
      for (let i = 0; i < Math.min(3, consoleErrors.length); i++) {
        console.log(`  - ${consoleErrors[i]}`);
      }
    } else {
      console.log('✅ Ошибок в консоли не найдено');
    }
  });

  test('Проверка доступности (a11y)', async ({ page }) => {
    console.log('♿ Проверка доступности...');
    
    // Проверяем основные элементы доступности
    const accessibilityChecks = [
      { selector: 'img[alt]', name: 'Изображения с alt' },
      { selector: 'input[aria-label], input[aria-labelledby]', name: 'Поля с aria-label' },
      { selector: 'button[aria-label], button[aria-labelledby]', name: 'Кнопки с aria-label' },
      { selector: '[role="button"]', name: 'Элементы с role="button"' },
      { selector: '[role="navigation"]', name: 'Навигация' },
      { selector: '[role="main"]', name: 'Основной контент' },
      { selector: '[role="banner"]', name: 'Шапка' },
      { selector: '[role="contentinfo"]', name: 'Подвал' }
    ];
    
    for (const check of accessibilityChecks) {
      const elements = page.locator(check.selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`✅ ${check.name}: ${count} элементов`);
      } else {
        console.log(`⚠️ ${check.name}: не найдено`);
      }
    }
    
    // Проверяем заголовки
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      console.log(`📝 Найдено заголовков: ${headingCount}`);
      
      // Проверяем структуру заголовков
      const headingLevels = [];
      for (let i = 0; i < Math.min(5, headingCount); i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName);
        const text = await heading.textContent();
        headingLevels.push(tagName);
        
        if (text && text.trim()) {
          console.log(`  - ${tagName}: ${text.trim().substring(0, 50)}${text.trim().length > 50 ? '...' : ''}`);
        }
      }
      
      // Проверяем логическую последовательность заголовков
      const hasH1 = headingLevels.includes('H1');
      if (hasH1) {
        console.log('✅ Найден заголовок H1');
      } else {
        console.log('⚠️ Заголовок H1 не найден');
      }
    }
  });

  test('Проверка SEO элементов', async ({ page }) => {
    console.log('🔍 Проверка SEO элементов...');
    
    // Проверяем мета-теги
    const metaTags = [
      { selector: 'meta[name="description"]', name: 'Описание' },
      { selector: 'meta[name="keywords"]', name: 'Ключевые слова' },
      { selector: 'meta[property="og:title"]', name: 'Open Graph заголовок' },
      { selector: 'meta[property="og:description"]', name: 'Open Graph описание' },
      { selector: 'meta[name="twitter:card"]', name: 'Twitter Card' },
      { selector: 'link[rel="canonical"]', name: 'Каноническая ссылка' }
    ];
    
    for (const meta of metaTags) {
      const element = page.locator(meta.selector);
      if (await element.count() > 0) {
        const content = await element.getAttribute('content') || await element.getAttribute('href');
        console.log(`✅ ${meta.name}: ${content?.substring(0, 100)}${content && content.length > 100 ? '...' : ''}`);
      } else {
        console.log(`⚠️ ${meta.name}: не найден`);
      }
    }
    
    // Проверяем структурированные данные
    const structuredData = page.locator('script[type="application/ld+json"]');
    const dataCount = await structuredData.count();
    
    if (dataCount > 0) {
      console.log(`📊 Найдено структурированных данных: ${dataCount}`);
    } else {
      console.log('⚠️ Структурированные данные не найдены');
    }
  });
});
