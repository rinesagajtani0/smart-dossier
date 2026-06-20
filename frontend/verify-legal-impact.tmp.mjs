import { chromium } from 'playwright';

const BASE = 'http://localhost:5183';
const browser = await chromium.launch();

async function check(role, path, screenshotPath) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto(BASE);
  await page.evaluate((r) => localStorage.setItem('smart-dossier:role', r), role);
  await page.goto(`${BASE}${path}`);
  await page.waitForTimeout(1500);
  const url = page.url();
  const bodyText = await page.textContent('body');
  if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
  await ctx.close();
  return { url, bodyText, errors };
}

const manager = await check('manager', '/legal-impact', '/tmp/legal-impact-manager.png');
console.log('--- MANAGER /legal-impact ---');
console.log('Blocked:', manager.url.includes('access-denied'));
console.log('Has "Legal Impact Dashboard":', manager.bodyText.includes('Legal Impact Dashboard'));
console.log('Has "Affected Nodes":', manager.bodyText.includes('Affected Nodes'));
console.log('Has "Affected Dossiers":', manager.bodyText.includes('Affected Dossiers'));
console.log('Has "Propagation Path":', manager.bodyText.includes('Propagation Path'));
console.log('Has "High Risk" badge text:', /risk/i.test(manager.bodyText));
console.log('Has "Recommended Action":', manager.bodyText.includes('Recommended Action'));
console.log('Console errors:', manager.errors);

const staff = await check('staff', '/legal-impact');
console.log('--- STAFF /legal-impact (control, should be blocked) ---');
console.log('Blocked:', staff.url.includes('access-denied'));

const citizen = await check('citizen', '/legal-impact');
console.log('--- CITIZEN /legal-impact (control, should be blocked) ---');
console.log('Blocked:', citizen.url.includes('access-denied'));

const managerNav = await check('manager', '/');
console.log('Manager sidebar shows "Legal Impact":', managerNav.bodyText.includes('Legal Impact'));
const staffNav = await check('staff', '/');
console.log('Staff sidebar shows "Legal Impact" (should be false):', staffNav.bodyText.includes('Legal Impact'));

await browser.close();
