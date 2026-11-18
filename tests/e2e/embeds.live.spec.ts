import { LIVE, expect, prerenderedPages, test } from './fixtures';

// Live element embeds load micropay.js from cdn.m.todaq.net and talk to
// pay.m.todaq.net, so this runs only with DOCS_E2E_LIVE=1, never in CI. It
// only looks: it never presses a button.
//
// Regression check for TODAQmicro/docs#22: a hydrated island re-rendered the
// mount point after micropay.js had mounted, leaving the embed blank.

test.skip(!LIVE, 'set DOCS_E2E_LIVE=1 to load production element embeds');

for (const path of prerenderedPages()) {
  test(`every embed on ${path} mounts an iframe`, async ({ page }) => {
    await page.goto(path);
    const mounts = page.locator('div[id^="ref-"]');
    const count = await mounts.count();
    test.skip(count === 0, 'no element embeds on this page');
    for (let index = 0; index < count; index++) {
      const frame = mounts.nth(index).locator('iframe');
      await expect(frame).toHaveCount(1, { timeout: 30_000 });
      await expect(frame).toHaveAttribute('src', /^https?:\/\//);
    }
  });
}
