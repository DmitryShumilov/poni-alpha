import { test, expect } from '@playwright/test';

test.describe('Goszakupki CGM Dashboard', () => {
  test('должен загружаться главную страницу', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем заголовок
    await expect(page).toHaveTitle(/Госзакупки CGM/);
    
    // Проверяем, что страница загрузилась
    await expect(page.locator('#root')).toBeVisible();
  });

  test('должен отображать KPI карточки после загрузки', async ({ page }) => {
    await page.goto('/');
    
    // Ждём загрузки данных (скелетоны исчезнут)
    await page.waitForSelector('.kpi-card', { state: 'visible', timeout: 30000 });
    
    // Проверяем наличие KPI карточек
    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards).toHaveCount(6);
  });

  test('должен отображать сайдбар с фильтрами', async ({ page }) => {
    await page.goto('/');
    
    // Ждём загрузки сайдбара
    await page.waitForSelector('.sidebar', { state: 'visible', timeout: 30000 });
    
    // Проверяем наличие сайдбара
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
    
    // Проверяем наличие кнопки обновления
    const refreshBtn = page.locator('.refresh-btn');
    await expect(refreshBtn).toBeVisible();
  });

  test('должен отображать графики', async ({ page }) => {
    await page.goto('/');
    
    // Ждём загрузки графиков
    await page.waitForSelector('.chart-card', { state: 'visible', timeout: 30000 });
    
    // Проверяем наличие карточек с графиками
    const chartCards = page.locator('.chart-card');
    await expect(chartCards).toHaveCount({ min: 5 });
  });

  test('должен переключать тему', async ({ page }) => {
    await page.goto('/');
    
    // Ждём загрузки
    await page.waitForSelector('.theme-toggle', { state: 'visible', timeout: 30000 });
    
    // Находим кнопку переключения темы
    const themeToggle = page.locator('.theme-toggle');
    
    // Проверяем начальную тему (тёмная по умолчанию)
    const html = page.locator('html');
    await expect(html).toHaveClass(/theme-dark/);
    
    // Кликаем для переключения на светлую тему
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Проверяем светлую тему
    await expect(html).toHaveClass(/theme-light/);
    
    // Переключаем обратно
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Проверяем тёмную тему
    await expect(html).toHaveClass(/theme-dark/);
  });

  test('должен показывать скелетоны при загрузке', async ({ page }) => {
    // Перехватываем запрос к API для задержки
    await page.route('**/api/data', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Проверяем наличие скелетонов
    const skeletons = page.locator('.skeleton');
    await expect(skeletons).toHaveCount({ min: 5 });
  });

  test('должен экспортировать данные', async ({ page }) => {
    await page.goto('/');
    
    // Ждём загрузки
    await page.waitForSelector('.export-btn', { state: 'visible', timeout: 30000 });
    
    // Кликаем кнопку экспорта
    const exportBtn = page.locator('.export-btn');
    await exportBtn.click();
    
    // Проверяем появление меню экспорта
    const exportMenu = page.locator('.export-menu');
    await expect(exportMenu).toBeVisible();
    
    // Проверяем наличие опций экспорта
    const excelOption = page.locator('.export-menu-item').first();
    await expect(excelOption).toBeVisible();
  });
});
