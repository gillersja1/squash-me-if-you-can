// Shared helpers for every page: the cart store, the cart badge, toasts and the report link.
const REPO = 'gillersja1/squash-me-if-you-can';
const CART_KEY = 'smiyc.cart';

export const ITEMS = [
  { id: 'enchanted-boxers', name: "Carl's Enchanted Boxers", category: 'Armor', price: 120, icon: '🩲', blurb: 'Plus-five to confidence. Minus-five to dignity.' },
  { id: 'tiara', name: 'Royal Tiara', category: 'Armor', price: 250, icon: '👑', blurb: 'Fits one very important cat.' },
  { id: 'gauntlets', name: 'Steel-Toed Gauntlets', category: 'Armor', price: 75, icon: '🧤', blurb: 'For punching things that deserve it.' },
  { id: 'magic-missile', name: 'Scroll of Magic Missile', category: 'Scrolls', price: 50, icon: '📜', blurb: 'Point away from face before reading.' },
  { id: 'fireball', name: 'Scroll of Fireball', category: 'Scrolls', price: 90, icon: '🔥', blurb: 'Warranty void if used indoors.' },
  { id: 'heal', name: 'Healing Scroll', category: 'Scrolls', price: 35, icon: '✨', blurb: 'Closes wounds. Does not close arguments.' },
  { id: 'hobgoblin-dynamite', name: 'Hobgoblin Dynamite', category: 'Weapons', price: 45, icon: '🧨', blurb: 'Light fuse. Run. Count to three.' },
  { id: 'smoke-bomb', name: 'Smoke Bomb', category: 'Weapons', cost: 20, icon: '💨', blurb: 'For dramatic exits from awkward conversations.' },
  { id: 'war-pick', name: 'Dwarven War Pick', category: 'Weapons', price: 180, icon: '⛏️', blurb: 'Mines ore. Also mines goblins.' },
  { id: 'copper-tack', name: 'Copper Tack', category: 'Junk', price: 0.1, icon: '📌', blurb: 'Technically loot.' },
  { id: 'rusty-nail', name: 'Rusty Nail', category: 'Junk', price: 0.2, icon: '🔩', blurb: 'Tetanus sold separately.' },
  { id: 'mystery-box', name: 'Bronze Mystery Box', category: 'Junk', price: 15, icon: '📦', blurb: 'Could be anything. It is probably a sock.' },
];

export const COUPONS = { DONUT10: 10 };

export function findItem(id) {
  return ITEMS.find((i) => i.id === id);
}

export function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || 'null');
    if (raw && Array.isArray(raw.items)) return { items: raw.items, discount: Number(raw.discount) || 0 };
  } catch {
    /* storage blocked or corrupt: start empty */
  }
  return { items: [], discount: 0 };
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* storage blocked: the cart lives for this page only */
  }
}

export function cartCount(cart) {
  return cart.items.reduce((n, line) => n + Number(line.qty), 0);
}

export function subtotal(cart) {
  return cart.items.reduce((sum, line) => sum + findItem(line.id).price * line.qty, 0);
}

export function updateBadge(cart) {
  const badge = document.querySelector('[data-cart-count]');
  if (badge) badge.textContent = String(cartCount(cart));
}

export function toast(text) {
  let box = document.querySelector('.toasts');
  if (!box) {
    box = document.createElement('div');
    box.className = 'toasts';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  box.append(el);
  setTimeout(() => el.remove(), 4000);
}

/** Points every "Report a bug" link at the GitHub issue form, prefilled with this page's name. */
export function wireReportLinks() {
  const page = document.body.dataset.page || 'Hub';
  for (const a of document.querySelectorAll('[data-report]')) {
    const title = encodeURIComponent(`[${page}] `);
    a.href = `https://github.com/${REPO}/issues/new?template=bug-report.yml&title=${title}`;
    a.target = '_blank';
    a.rel = 'noopener';
  }
}

export function initPage() {
  updateBadge(loadCart());
  wireReportLinks();
}
