import { expect, prerenderedPages, test } from './fixtures';

// `/` is the API reference: Scalar renders its sections, and their `#tag/…`
// anchors, in the browser from the OpenAPI document, so they are not in the
// served HTML. Links to `/` are checked for the page only.
const CLIENT_RENDERED_ANCHORS = new Set(['/']);

const sources = ['/', ...prerenderedPages()];

for (const source of sources) {
  test(`internal links on ${source} resolve`, async ({ page, request }) => {
    await page.goto(source);
    const hrefs = await page.$$eval('a[href^="/"]', (anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href') ?? ''),
    );
    expect(hrefs.length).toBeGreaterThan(0);

    const broken: string[] = [];
    const html = new Map<string, string>();
    for (const href of [...new Set(hrefs)]) {
      if (href.startsWith('//')) continue; // protocol-relative: not internal
      const url = new URL(href, 'http://docs.invalid');
      const target = url.pathname;
      if (!html.has(target)) {
        const response = await request.get(target);
        if (response.status() !== 200) {
          broken.push(`${href}: ${response.status()}`);
          continue;
        }
        html.set(target, await response.text());
      }
      const anchor = decodeURIComponent(url.hash.slice(1));
      if (anchor && !CLIENT_RENDERED_ANCHORS.has(target)) {
        const body = html.get(target) ?? '';
        const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!new RegExp(`\\s(?:id|name)=["']${escaped}["']`).test(body)) {
          broken.push(`${href}: no #${anchor} on ${target}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
}
