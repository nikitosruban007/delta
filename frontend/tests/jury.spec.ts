import { test, expect } from '@playwright/test';

test.describe('Перевірка сторінок Журі (Eco-Quest)', () => {

  test('Головна сторінка Eco-Quest завантажується коректно', async ({ page }) => {
    await page.goto('http://localhost:3000/jury/eco-quest');
    
    await expect(page.locator('h1')).toHaveText('CODE & PLAY: ECO-QUEST');
    
    await expect(page.getByText('Головна інформація')).toBeVisible();
    
    await expect(page.getByRole('link', { name: '#КоманднийКод' })).toBeVisible();
  });

  test('Навігація на вкладку Лідерборд працює', async ({ page }) => {
    await page.goto('http://localhost:3000/jury/eco-quest');
    
    await page.getByRole('link', { name: /Лідерборд/i }).click();
    
    await expect(page).toHaveURL(/.*\/jury\/leaderboard/);
    
    await expect(page.getByText('Загальна сума балів')).toBeVisible();
  });

  test('Навігація на Список робіт і перевірка команд', async ({ page }) => {
    await page.goto('http://localhost:3000/jury/eco-quest');
    
    await page.getByRole('link', { name: /Список робіт для оцінювання/i }).click();
    
    await expect(page.getByRole('heading', { name: 'Загальний список команд' })).toBeVisible();
    
    await expect(page.getByRole('link', { name: 'Команда 1', exact: true })).toBeVisible();  });

});