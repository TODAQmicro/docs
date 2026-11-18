import { expect, test } from './fixtures';

const theme = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.getAttribute('data-theme'));

test.describe('theme toggle', () => {
  test.use({ colorScheme: 'light' });

  test('switches data-theme, persists it, and shows an icon', async ({ page }) => {
    await page.goto('/guide/getting-started/');
    const toggle = page.locator('#theme-toggle');
    expect(await theme(page)).toBe('light');
    await expect(toggle.locator('svg.icon-light')).toBeVisible();
    await expect(toggle.locator('svg.icon-dark')).toBeHidden();

    await toggle.click();
    expect(await theme(page)).toBe('dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    await expect(toggle.locator('svg.icon-dark')).toBeVisible();
    await expect(toggle.locator('svg.icon-light')).toBeHidden();

    // The stored choice wins over the OS preference on the next page.
    await page.goto('/reference/payment-js/payment-element/');
    expect(await theme(page)).toBe('dark');
    await expect(page.locator('#theme-toggle svg.icon-dark')).toBeVisible();

    await page.locator('#theme-toggle').click();
    expect(await theme(page)).toBe('light');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  });
});

test.describe('without a stored choice', () => {
  test.use({ colorScheme: 'dark' });

  test('follows the OS preference', async ({ page }) => {
    await page.goto('/guide/getting-started/');
    expect(await theme(page)).toBe('dark');
    await expect(page.locator('#theme-toggle svg.icon-dark')).toBeVisible();
  });
});
