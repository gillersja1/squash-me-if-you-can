import { expect, test } from '@playwright/test';

// Happy paths only: everything here should work. The 20 planted bugs are
// avoided on purpose and checked in the private answer-key repo instead.

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
});

test('hub explains the hunt and links reports to the GitHub issue form', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.getByRole('heading', { name: 'Squash Me If You Can' })).toBeVisible();
  await expect(page.getByText('20 intentional bugs')).toBeVisible();
  const report = page.getByRole('link', { name: 'Report a bug' }).first();
  await expect(report).toHaveAttribute('href', /github\.com\/gillersja1\/squash-me-if-you-can\/issues\/new\?template=bug-report\.yml&title=%5BHub%5D/);
});

test('shop filters by category', async ({ page }) => {
  await page.goto('/shop.html');
  await page.getByLabel('Category').selectOption('Armor');
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('article', { name: 'Royal Tiara' })).toBeVisible();
});

test('shop sorts by name', async ({ page }) => {
  await page.goto('/shop.html');
  await page.getByLabel('Sort by').selectOption('name');
  await expect(page.getByRole('article').first()).toHaveAttribute('aria-label', 'Bronze Mystery Box');
});

test('adding and removing gear updates the cart', async ({ page }) => {
  await page.goto('/shop.html');
  await page.getByRole('article', { name: 'Healing Scroll' }).getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.locator('[data-total]')).toHaveText('35 gold');
  await expect(page.locator('[data-cart-count]')).toHaveText('1');
  await page.getByRole('button', { name: 'Remove Healing Scroll' }).click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});

test('forged discount scrolls are rejected', async ({ page }) => {
  await page.goto('/shop.html');
  await page.getByLabel('Discount scroll').fill('FREELOOT');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('That discount scroll is a forgery.')).toBeVisible();
});

test('checkout requires a name and places an order', async ({ page }) => {
  await page.goto('/shop.html');
  await page.getByRole('article', { name: 'Royal Tiara' }).getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Go to checkout' }).click();
  await expect(page.locator('[data-total]')).toHaveText('250 gold');

  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Every crawler needs a name.')).toBeVisible();

  await page.getByLabel('Crawler name').fill('Carl');
  await page.getByLabel('Email *').fill('carl@dungeon.test');
  await page.locator('select[name="floor"]').selectOption('3');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText(/Order #\d+ will be delivered to floor 3/)).toBeVisible();
  await expect(page.locator('[data-cart-count]')).toHaveText('0');
});

test('checkout with an empty cart points back to the shop', async ({ page }) => {
  await page.goto('/checkout.html');
  await expect(page.getByRole('link', { name: 'Visit the gear shop' })).toBeVisible();
});

test('stat points change derived stats and cannot go below base', async ({ page }) => {
  await page.goto('/stats.html');
  await page.getByRole('button', { name: 'Raise Strength' }).click();
  await expect(page.locator('#remaining')).toHaveText('9');
  await expect(page.locator('[data-damage]')).toHaveText('11');
  await page.getByRole('button', { name: 'Lower Dexterity' }).click();
  await expect(page.getByLabel('Dexterity value')).toHaveText('3');
});

test('a party registers, and an exact duplicate name is refused', async ({ page }) => {
  await page.goto('/party.html');
  await page.getByLabel('Party name').fill('Royal Court');
  await page.getByLabel('Date').fill('2030-01-15');
  await page.getByLabel('Member 1').fill('Donut');
  await page.getByRole('button', { name: 'Register party' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Royal Court' })).toContainText('1 members');

  await page.getByLabel('Party name').fill('royal court');
  await page.getByLabel('Date').fill('2030-02-01');
  await page.getByLabel('Member 1').fill('Mongo');
  await page.getByRole('button', { name: 'Register party' }).click();
  await expect(page.getByText('That party name is taken.')).toBeVisible();
});

test.describe('Hall of Squashers', () => {
  const user = (login, id) => ({ login, avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4`, html_url: `https://github.com/${login}` });
  const issues = [
    { user: user('donut', 1), created_at: '2026-11-20T10:00:00Z' },
    { user: user('carl', 2), created_at: '2026-11-18T10:00:00Z' },
    { user: user('donut', 1), created_at: '2026-11-21T10:00:00Z' },
    { user: user('katia', 3), created_at: '2026-11-17T10:00:00Z' },
    { user: user('mordecai', 4), created_at: '2026-11-16T10:00:00Z', pull_request: {} },
  ];

  test('ranks confirmed reporters by finds, then earliest first find, ignoring PRs', async ({ page }) => {
    await page.route('https://api.github.com/**', (route) => route.fulfill({ json: issues }));
    await page.route('https://avatars.githubusercontent.com/**', (route) => route.fulfill({ status: 204 }));
    await page.goto('/hall.html');
    const rows = page.locator('.squasher');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('donut');
    await expect(rows.nth(0)).toContainText('2 bugs squashed');
    await expect(rows.nth(1)).toContainText('katia');
    await expect(rows.nth(2)).toContainText('carl');
    await expect(rows.nth(2)).toContainText('1 bug squashed');
    await expect(page.getByText('mordecai')).toHaveCount(0);
  });

  test('says so when nobody is confirmed yet', async ({ page }) => {
    await page.route('https://api.github.com/**', (route) => route.fulfill({ json: [] }));
    await page.goto('/hall.html');
    await expect(page.getByText('No confirmed squashers yet.')).toBeVisible();
  });

  test('explains when GitHub is unavailable', async ({ page }) => {
    await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 403, json: { message: 'rate limited' } }));
    await page.goto('/hall.html');
    await expect(page.getByText('The hall is closed for cleaning')).toBeVisible();
  });
});

test('every page has share tags pointing at a real 1200x630 image', async ({ page, request }) => {
  for (const file of ['index.html', 'shop.html', 'checkout.html', 'stats.html', 'party.html', 'hall.html']) {
    await page.goto(`/${file}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://gillersja1.github.io/squash-me-if-you-can/assets/og-image.png');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://gillersja1.github.io/squash-me-if-you-can/${file}`);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  }
  const img = await request.get('/assets/og-image.png');
  expect(img.status()).toBe(200);
  const png = await img.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});
