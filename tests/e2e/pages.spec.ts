import { loadEntries, pagePath, sidebarGuides } from '../lib/content';
import { expect, prerenderedPages, test } from './fixtures';

const pages = prerenderedPages();

test('the build prerendered every published entry, and only those', () => {
  const expected = loadEntries()
    .filter((entry) => entry.published)
    .map(pagePath)
    .sort();
  expect(pages).toEqual(expected);
});

for (const path of pages) {
  test(`${path} answers 200 and has a title heading`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const heading = page.locator('.main-content').locator('h1, h2').first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText(/^\s*$/);
  });
}

test('the sidebar lists the guides in order', async ({ page }) => {
  await page.goto('/guide/getting-started/');
  const links = page.locator('.sidebar > h4:has-text("User Guides") + nav .nav-link');
  const guides = sidebarGuides();
  await expect(links).toHaveText(guides.map((entry) => String(entry.data.title)));
  for (const [index, entry] of guides.entries()) {
    await expect(links.nth(index)).toHaveAttribute('href', pagePath(entry));
  }
});

test('/ holds the Scalar mount for the API reference', async ({ page }) => {
  // Scalar itself loads from its CDN, which page checks do not reach: check
  // only that the page renders its mount point with a configuration.
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const mount = page.locator('[data-scalar-client]');
  await expect(mount).toHaveCount(1);
  const configuration = JSON.parse((await mount.getAttribute('data-configuration')) ?? '{}');
  expect(configuration.url).toMatch(/\/v4\/openapi\.json$/);
});
