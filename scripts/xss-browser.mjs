import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

export async function verifyCmsXss({ origin, token, cookieName, postId, payload }) {
  const browser = await chromium.launch();
  let checks = 0;
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      // Keep all synthetic browser traffic inside this isolated loopback application.
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(origin + '/admin/login?redirect=' + encodeURIComponent(payload));
      assert.equal(response.status(), 200);
      const policy = response.headers()['content-security-policy'], nonce = policy.match(/'nonce-([^']+)'/)?.[1]; assert.ok(nonce);
      assert.ok(!policy.split(';').find(part => part.trim().startsWith('script-src ')).includes('unsafe-inline'));
      assert.equal(await page.locator('script').evaluateAll((nodes, value) => nodes.every(node => node.nonce === value), nonce), true);
      await expect(page.locator('input[name=email]')).toBeVisible();
      const second = await fetch(origin + '/admin/login'); assert.notEqual(second.headers.get('content-security-policy'), policy); checks++;
      // Synthetic real-login JWT; HTTP-only fixture cookie is used on loopback, not a production cookie policy change.
      await context.addCookies([{ name: cookieName, value: token, url: origin, httpOnly: true, sameSite: 'Lax', secure: false }]);
      await page.goto(origin + '/admin/collections/posts/' + postId);
      await expect(page.locator('input[name=title]')).toHaveValue(payload);
      await expect(page.locator('[contenteditable=true]').first()).toContainText(payload);
      assert.equal(await page.locator('[onerror],script:not([src]):not([nonce])').count(), 0);
      // The real editor must hydrate: typing updates its controlled title field without executing markup.
      await page.locator('input[name=title]').fill(payload + ' edited');
      await expect(page.locator('input[name=title]')).toHaveValue(payload + ' edited');
      assert.equal(await page.evaluate(() => globalThis.xssExecuted || false), false); checks++;
      await page.evaluate(() => { const script = document.createElement('script'); script.textContent = 'globalThis.xssExecuted=1'; document.body.append(script); const img = document.createElement('img'); img.setAttribute('onerror', 'globalThis.xssExecuted=1'); img.src = '/missing-xss-image'; document.body.append(img); });
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => globalThis.xssExecuted || false), false); checks++;
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log(JSON.stringify({ cmsProductionXssBrowserChecks: checks, types: ['stored', 'reflected', 'DOM'], widths: [1440, 390], scope: 'isolated PostgreSQL fixtures only' }));
    return checks;
  } finally { await browser.close(); }
}
