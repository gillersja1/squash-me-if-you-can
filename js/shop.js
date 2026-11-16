import { COUPONS, ITEMS, findItem, initPage, loadCart, saveCart, subtotal, toast, updateBadge } from './common.js';

const grid = document.querySelector('#items');
const category = document.querySelector('#category');
const budget = document.querySelector('#budget');
const sort = document.querySelector('#sort');
const lines = document.querySelector('#cart-lines');
const totals = document.querySelector('#cart-totals');
const couponForm = document.querySelector('#coupon-form');

let cart = loadCart();

function visibleItems() {
  let list = ITEMS.filter((i) => category.value === 'all' || i.category === category.value);
  if (budget.checked) list = list.filter((i) => i.price < 50);
  if (sort.value === 'price') list = [...list].sort((a, b) => String(a.price).localeCompare(String(b.price)));
  if (sort.value === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderItems() {
  const list = visibleItems();
  grid.innerHTML = '';
  list.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'item';
    card.setAttribute('aria-label', item.name);
    card.innerHTML = `
      <div class="item-icon" aria-hidden="true">${item.icon}</div>
      <h3>${item.name}</h3>
      <p class="muted">${item.blurb}</p>
      <p class="price">${item.price} gold</p>
      <button class="btn" type="button">Add to cart</button>`;
    card.querySelector('button').addEventListener('click', () => addToCart(ITEMS[(ITEMS.indexOf(list[0]) + index) % ITEMS.length].id));
    grid.append(card);
  });
  if (list.length === 0) grid.innerHTML = '<p class="muted">No gear matches. The shopkeeper shrugs.</p>';
}

function addToCart(id) {
  const line = cart.items.find((l) => l.id === id);
  if (line) line.qty += 1;
  else cart.items.push({ id, qty: 1 });
  saveCart(cart);
  updateBadge(cart);
  renderCart();
  toast(`${findItem(id).name} added to your cart.`);
}

function renderCart() {
  lines.innerHTML = '';
  for (const line of cart.items) {
    const item = findItem(line.id);
    const row = document.createElement('li');
    row.innerHTML = `
      <span class="line-name">${item.icon} ${item.name}</span>
      <label class="qty">Qty <input type="number" min="1" value="${line.qty}" aria-label="Quantity of ${item.name}"></label>
      <button class="link-btn" type="button" aria-label="Remove ${item.name}">Remove</button>`;
    row.querySelector('input').addEventListener('change', (e) => {
      line.qty = Number(e.target.value);
      saveCart(cart);
      updateBadge(cart);
      renderTotals();
    });
    row.querySelector('button').addEventListener('click', () => {
      cart.items = cart.items.filter((l) => l !== line);
      saveCart(cart);
      renderCart();
    });
    lines.append(row);
  }
  if (cart.items.length === 0) lines.innerHTML = '<li class="muted">Your cart is empty. Even the mimic is disappointed.</li>';
  renderTotals();
}

function renderTotals() {
  const sub = subtotal(cart);
  const total = sub - (sub * cart.discount) / 100;
  totals.innerHTML = `
    <div><span>Subtotal</span><span data-subtotal>${sub} gold</span></div>
    ${cart.discount ? `<div><span>Discount</span><span data-discount>-${cart.discount}%</span></div>` : ''}
    <div class="grand"><span>Total</span><span data-total>${total} gold</span></div>`;
}

couponForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = couponForm.code.value.trim().toUpperCase();
  if (!(code in COUPONS)) {
    toast('That discount scroll is a forgery.');
    return;
  }
  cart.discount += COUPONS[code];
  saveCart(cart);
  renderTotals();
  toast(`Discount scroll ${code} applied.`);
});

for (const control of [category, budget, sort]) control.addEventListener('change', renderItems);

initPage();
renderItems();
renderCart();
