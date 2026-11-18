import { expect, test } from './fixtures';

// The servers in playwright.config.ts point API_BASE_URL at a closed local
// port, so these requests never reach the payment API.

const valid = {
  hash: 'not-a-real-payment-hash',
  nonce: 'not-a-real-nonce',
  timestamp: 1700000000,
};

test.describe('POST /api/delegate', () => {
  test('answers 400 to a malformed body', async ({ request }) => {
    for (const data of ['not json', JSON.stringify({}), JSON.stringify({ hash: '', nonce: 'n', timestamp: 1 })]) {
      const response = await request.post('/api/delegate', {
        headers: { 'Content-Type': 'application/json' },
        data,
      });
      expect(response.status(), data).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'bad_request' });
    }
  });

  test('answers 502 when the payment API is unreachable', async ({ request }) => {
    const response = await request.post('/api/delegate', { data: valid });
    expect(response.status()).toBe(502);
    expect(await response.json()).toMatchObject({ error: 'upstream_error' });
  });

  test('answers 500 without the DELEGATE_* pair', async ({ request }) => {
    const response = await request.post(
      `http://127.0.0.1:${process.env.DOCS_E2E_BARE_PORT}/api/delegate`,
      { data: valid },
    );
    expect(response.status()).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'internal_error' });
  });
});
