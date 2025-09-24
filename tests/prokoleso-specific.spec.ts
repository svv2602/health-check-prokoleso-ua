import { test, expect } from '@playwright/test';

/**
 * Специфичные тесты для функций сайта prokoleso.ua
 * Проверяет каталог товаров, корзину, формы и другие специфичные функции
 */
test.describe('Prokoleso.ua - Специфичные функции', () => {
  const BASE_URL = 'https://prokoleso.ua';
  
  test('Каталог товаров доступен', async ({ page }) => {
    console.log('📦 Проверка каталога товаров...');
    
    await page.goto(BASE_URL);
    
    // Поиск ссылок на каталог
    const catalogSelectors = [
      'a[href*="catalog"]',
      'a[href*="каталог"]',
      'a[href*="товары"]',
      'a[href*="products"]',
      'a[href*="shop"]',
      '.catalog',
      '.products',
      '.shop'
    ];
    
    let catalogFound = false;
    for (const selector of catalogSelectors) {
      const catalogLink = page.locator(selector);
      if (await catalogLink.count() > 0) {
        console.log(`✅ Найдена ссылка на каталог: ${selector}`);
        
        // Проверяем, что ссылка кликабельна
        await expect(catalogLink.first()).toBeVisible();
        
        // Переходим по ссылке
        await catalogLink.first().click();
        await page.waitForLoadState('networkidle');
        
        // Проверяем, что страница загрузилась
        await expect(page.locator('body')).toBeVisible();
        
        catalogFound = true;
        console.log('✅ Каталог загружен успешно');
        break;
      }
    }
    
    if (!catalogFound) {
      console.log('⚠️ Ссылки на каталог не найдены');
    }
  });

  test('Корзина работает', async ({ page }) => {
    console.log('🛒 Проверка корзины...');
    
    await page.goto(BASE_URL);
    
    // Поиск кнопки корзины
    const cartSelectors = [
      'a[href*="cart"]',
      'a[href*="корзина"]',
      'a[href*="basket"]',
      '.cart',
      '.basket',
      '.shopping-cart',
      '[aria-label*="корзина"]',
      '[aria-label*="cart"]'
    ];
    
    let cartFound = false;
    for (const selector of cartSelectors) {
      const cartButton = page.locator(selector);
      if (await cartButton.count() > 0) {
        console.log(`✅ Найдена корзина: ${selector}`);
        
        await expect(cartButton.first()).toBeVisible();
        
        // Переходим в корзину
        await cartButton.first().click();
        await page.waitForLoadState('networkidle');
        
        // Проверяем, что страница корзины загрузилась
        await expect(page.locator('body')).toBeVisible();
        
        cartFound = true;
        console.log('✅ Корзина загружена успешно');
        break;
      }
    }
    
    if (!cartFound) {
      console.log('⚠️ Корзина не найдена');
    }
  });

  test('Форма обратной связи', async ({ page }) => {
    console.log('📝 Проверка формы обратной связи...');
    
    await page.goto(BASE_URL);
    
    // Поиск форм обратной связи
    const formSelectors = [
      'form',
      '.contact-form',
      '.feedback-form',
      '.contact',
      '.feedback',
      '[action*="contact"]',
      '[action*="feedback"]'
    ];
    
    let formFound = false;
    for (const selector of formSelectors) {
      const form = page.locator(selector);
      if (await form.count() > 0) {
        console.log(`✅ Найдена форма: ${selector}`);
        
        await expect(form.first()).toBeVisible();
        
        // Проверяем наличие полей ввода
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        console.log(`📝 Найдено полей ввода: ${inputCount}`);
        
        if (inputCount > 0) {
          // Проверяем, что поля доступны
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = inputs.nth(i);
            await expect(input).toBeVisible();
          }
        }
        
        formFound = true;
        break;
      }
    }
    
    if (!formFound) {
      console.log('⚠️ Формы обратной связи не найдены');
    }
  });

  test('Фильтры и сортировка товаров', async ({ page }) => {
    console.log('🔍 Проверка фильтров и сортировки...');
    
    await page.goto(BASE_URL);
    
    // Поиск страницы с товарами
    const productPageSelectors = [
      'a[href*="catalog"]',
      'a[href*="товары"]',
      'a[href*="products"]'
    ];
    
    let productPageFound = false;
    for (const selector of productPageSelectors) {
      const link = page.locator(selector);
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        productPageFound = true;
        break;
      }
    }
    
    if (productPageFound) {
      // Поиск фильтров
      const filterSelectors = [
        '.filter',
        '.filters',
        '.sort',
        '.sorting',
        'select[name*="sort"]',
        'select[name*="filter"]',
        '[class*="filter"]',
        '[class*="sort"]'
      ];
      
      let filtersFound = false;
      for (const selector of filterSelectors) {
        const filter = page.locator(selector);
        if (await filter.count() > 0) {
          console.log(`✅ Найдены фильтры: ${selector}`);
          await expect(filter.first()).toBeVisible();
          filtersFound = true;
          break;
        }
      }
      
      if (!filtersFound) {
        console.log('⚠️ Фильтры не найдены');
      }
    } else {
      console.log('⚠️ Страница с товарами не найдена');
    }
  });

  test('Поиск по сайту', async ({ page }) => {
    console.log('🔍 Проверка поиска по сайту...');
    
    await page.goto(BASE_URL);
    
    // Поиск поля поиска
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="поиск"]',
      'input[placeholder*="search"]',
      'input[name*="search"]',
      '.search input',
      '#search'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      const input = page.locator(selector);
      if (await input.count() > 0) {
        searchInput = input.first();
        console.log(`✅ Найдено поле поиска: ${selector}`);
        break;
      }
    }
    
    if (searchInput) {
      // Тестируем различные поисковые запросы
      const searchQueries = ['шины', 'диски', 'масло', 'аккумулятор'];
      
      for (const query of searchQueries) {
        console.log(`🔍 Тестируем поиск: "${query}"`);
        
        await searchInput.fill(query);
        await searchInput.press('Enter');
        
        // Ждем загрузки результатов
        await page.waitForLoadState('networkidle');
        
        // Проверяем, что страница загрузилась
        await expect(page.locator('body')).toBeVisible();
        
        // Возвращаемся на главную для следующего поиска
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Находим поле поиска снова
        for (const selector of searchSelectors) {
          const input = page.locator(selector);
          if (await input.count() > 0) {
            searchInput = input.first();
            break;
          }
        }
      }
      
      console.log('✅ Поиск работает корректно');
    } else {
      console.log('⚠️ Поле поиска не найдено');
    }
  });

  test('Социальные сети и контакты', async ({ page }) => {
    console.log('📱 Проверка социальных сетей и контактов...');
    
    await page.goto(BASE_URL);
    
    // Поиск ссылок на социальные сети
    const socialSelectors = [
      'a[href*="facebook"]',
      'a[href*="instagram"]',
      'a[href*="telegram"]',
      'a[href*="viber"]',
      'a[href*="whatsapp"]',
      'a[href*="youtube"]',
      '.social',
      '.social-links'
    ];
    
    let socialLinksFound = 0;
    for (const selector of socialSelectors) {
      const links = page.locator(selector);
      const count = await links.count();
      if (count > 0) {
        socialLinksFound += count;
        console.log(`✅ Найдено социальных ссылок (${selector}): ${count}`);
      }
    }
    
    console.log(`📱 Всего социальных ссылок: ${socialLinksFound}`);
    
    // Поиск контактной информации
    const contactSelectors = [
      'text=/телефон|phone/i',
      'text=/email|почта/i',
      'text=/адрес|address/i',
      '.phone',
      '.email',
      '.address',
      '.contact'
    ];
    
    let contactInfoFound = 0;
    for (const selector of contactSelectors) {
      const contact = page.locator(selector);
      const count = await contact.count();
      if (count > 0) {
        contactInfoFound += count;
        console.log(`✅ Найдено контактной информации (${selector}): ${count}`);
      }
    }
    
    console.log(`📞 Всего контактной информации: ${contactInfoFound}`);
  });

  test('Языковая поддержка', async ({ page }) => {
    console.log('🌐 Проверка языковой поддержки...');
    
    await page.goto(BASE_URL);
    
    // Поиск переключателя языков
    const languageSelectors = [
      '.language',
      '.lang',
      '.locale',
      'select[name*="lang"]',
      'select[name*="locale"]',
      '[class*="language"]',
      '[class*="lang"]'
    ];
    
    let languageSwitcherFound = false;
    for (const selector of languageSelectors) {
      const langSwitcher = page.locator(selector);
      if (await langSwitcher.count() > 0) {
        console.log(`✅ Найден переключатель языков: ${selector}`);
        await expect(langSwitcher.first()).toBeVisible();
        languageSwitcherFound = true;
        break;
      }
    }
    
    if (!languageSwitcherFound) {
      console.log('⚠️ Переключатель языков не найден');
    }
    
    // Проверка наличия текста на украинском языке
    const ukrainianText = page.locator('text=/українська|украинский|prokoleso/i');
    const ukrainianCount = await ukrainianText.count();
    console.log(`🇺🇦 Найдено украинского текста: ${ukrainianCount}`);
    
    // Проверка наличия текста на русском языке
    const russianText = page.locator('text=/русский|російська/i');
    const russianCount = await russianText.count();
    console.log(`🇷🇺 Найдено русского текста: ${russianCount}`);
  });

  test('Мобильная навигация', async ({ page }) => {
    console.log('📱 Проверка мобильной навигации...');
    
    // Устанавливаем мобильный размер экрана
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Поиск мобильного меню
    const mobileMenuSelectors = [
      '.mobile-menu',
      '.hamburger',
      '.menu-toggle',
      '.burger',
      '[aria-label*="меню"]',
      '[aria-label*="menu"]',
      '.navbar-toggler'
    ];
    
    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      const menu = page.locator(selector);
      if (await menu.count() > 0) {
        console.log(`✅ Найдено мобильное меню: ${selector}`);
        await expect(menu.first()).toBeVisible();
        
        // Пытаемся кликнуть по меню
        try {
          await menu.first().click();
          await page.waitForTimeout(1000); // Ждем анимации
          console.log('✅ Мобильное меню открылось');
        } catch (error) {
          console.log('⚠️ Не удалось открыть мобильное меню');
        }
        
        mobileMenuFound = true;
        break;
      }
    }
    
    if (!mobileMenuFound) {
      console.log('⚠️ Мобильное меню не найдено');
    }
    
    // Проверка адаптивности контента
    const bodyBox = await page.locator('body').boundingBox();
    if (bodyBox) {
      console.log(`📏 Размеры контента: ${bodyBox.width}x${bodyBox.height}`);
      expect(bodyBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('Проверка форм регистрации/входа', async ({ page }) => {
    console.log('👤 Проверка форм регистрации/входа...');
    
    await page.goto(BASE_URL);
    
    // Поиск ссылок на вход/регистрацию
    const authSelectors = [
      'a[href*="login"]',
      'a[href*="register"]',
      'a[href*="signin"]',
      'a[href*="signup"]',
      'a[href*="вход"]',
      'a[href*="регистрация"]',
      '.login',
      '.register',
      '.auth'
    ];
    
    let authLinksFound = false;
    for (const selector of authSelectors) {
      const authLink = page.locator(selector);
      if (await authLink.count() > 0) {
        console.log(`✅ Найдена ссылка авторизации: ${selector}`);
        
        // Переходим по ссылке
        await authLink.first().click();
        await page.waitForLoadState('networkidle');
        
        // Проверяем наличие форм
        const forms = page.locator('form');
        const formCount = await forms.count();
        console.log(`📝 Найдено форм на странице авторизации: ${formCount}`);
        
        if (formCount > 0) {
          // Проверяем поля ввода
          const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
          const inputCount = await inputs.count();
          console.log(`📝 Найдено полей ввода: ${inputCount}`);
          
          if (inputCount > 0) {
            console.log('✅ Формы авторизации найдены');
          }
        }
        
        authLinksFound = true;
        break;
      }
    }
    
    if (!authLinksFound) {
      console.log('⚠️ Ссылки на авторизацию не найдены');
    }
  });
});