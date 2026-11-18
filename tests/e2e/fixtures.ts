import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test as base, expect } from '@playwright/test';
import { ROOT } from '../lib/content';

/** Set DOCS_E2E_LIVE=1 to run the checks that load production's CDN and API. */
export const LIVE = process.env.DOCS_E2E_LIVE === '1';

/**
 * Every prerendered page in dist/client, as the path the server serves it at.
 * Needs `npm run build` first.
 */
export function prerenderedPages(): string[] {
  const client = join(ROOT, 'dist', 'client');
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
      const path = join(dir, dirent.name);
      return dirent.isDirectory() ? walk(path) : [path];
    });
  return walk(client)
    .filter((path) => path.endsWith('index.html'))
    .map((path) => '/' + relative(client, path).split('\\').join('/').replace(/index\.html$/, ''))
    .sort();
}

/**
 * Pages load only from the local server. Everything else (the payment CDN and
 * API, Scalar's CDN, fonts) is aborted, so a run never reaches production and
 * does not depend on it. LIVE runs let it through.
 */
export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    if (!LIVE) {
      const origin = new URL(baseURL ?? 'http://127.0.0.1').origin;
      await context.route('**/*', (route) =>
        new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
      );
    }
    await use(context);
  },
});

export { expect };
