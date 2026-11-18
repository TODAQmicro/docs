import { execFileSync } from 'node:child_process';
import { defineConfig, devices } from '@playwright/test';

// Page checks run against the built site (`npm run build` first), served by the
// standalone server the image runs, on a free port. Workers inherit
// process.env, so the port is chosen once, here.
function freePort(): string {
  return execFileSync(process.execPath, [
    '-e',
    "const s=require('net').createServer();s.listen(0,'127.0.0.1',()=>{process.stdout.write(String(s.address().port));s.close()})",
  ]).toString();
}

process.env.DOCS_E2E_PORT ??= freePort();

const port = process.env.DOCS_E2E_PORT;

const server = (listen: string) => ({
  command: 'node ./dist/server/entry.mjs',
  url: `http://127.0.0.1:${listen}/guide/getting-started/`,
  reuseExistingServer: false,
  timeout: 30_000,
  stdout: 'ignore' as const,
  stderr: 'pipe' as const,
  env: { HOST: '127.0.0.1', PORT: listen },
});

// CI installs the browser that matches @playwright/test. Elsewhere, point
// PLAYWRIGHT_CHROMIUM_EXECUTABLE at an installed Chromium instead.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } },
    },
  ],
  webServer: [server(port)],
});
