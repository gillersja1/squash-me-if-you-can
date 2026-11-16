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
