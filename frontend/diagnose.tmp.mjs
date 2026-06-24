import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const routes = [
  '/',
  '/procedure-generator',
  '/document-upload',
  '/nlp-extraction',
  '/case-memory',
  '/delay-prediction',
  '/prevent-delay',
  '/dashboard',
  '/legal-impact',
  '/roles',
];

const browser = await chromium.launch();
const results = [];

for (const route of routes) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const apiErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    failedRequests.push({ url: req.url(), method: req.method(), failure: req.failure()?.errorText });
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      apiErrors.push({ url: res.url(), status: res.status() });
    }
  });

  try {
    // Set role to manager first (broadest access) via the role-switcher select on the root page
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 15000 });
    const select = page.locator('#role-switcher-select');
    if (await select.count()) {
      await select.selectOption('manager');
      await page.waitForTimeout(300);
    }
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    consoleErrors.push(`navigation error: ${e.message}`);
  }

  await page.waitForTimeout(1500);

  // Try to trigger a primary action button to fire any on-click API calls
  try {
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = (await btn.innerText().catch(() => '')).trim();
      if (/generate|submit|upload|predict|analyze|extract|run|start|load/i.test(text)) {
        await btn.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(1500);
        break;
      }
    }
  } catch {}

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));

  results.push({
    route,
    consoleErrors,
    failedRequests,
    apiErrors,
    bodyPreview: bodyText,
  });

  await page.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));
