import { findItem, initPage, loadCart, saveCart, subtotal, toast, updateBadge } from './common.js';

const form = document.querySelector('#checkout-form');
const summary = document.querySelector('#summary');
const result = document.querySelector('#result');
const ORDER_KEY = 'smiyc.orderNumber';

function nextOrderNumber() {
  let n = 1000;
  try {
    n = Number(localStorage.getItem(ORDER_KEY)) || 1000;
    localStorage.setItem(ORDER_KEY, String(n + 1));
  } catch {
    /* storage blocked: numbers restart each visit */
  }
  return n + 1;
}

function renderSummary() {
  const cart = loadCart();
  if (cart.items.length === 0) {
    summary.innerHTML = '<p class="muted">Your cart is empty. <a href="shop.html">Visit the gear shop</a>.</p>';
    return;
  }
  const rows = cart.items
    .map((line) => {
      const item = findItem(line.id);
      return `<li><span>${item.icon} ${item.name} × ${line.qty}</span><span>${item.price * line.qty} gold</span></li>`;
    })
    .join('');
  summary.innerHTML = `<ul class="summary-lines">${rows}</ul>
    <div class="grand"><span>Total due</span><span data-total>${subtotal(cart)} gold</span></div>`;
}

function showError(field, message) {
  const el = form.querySelector(`[data-error-for="${field}"]`);
  el.textContent = message;
}

function validate() {
  let ok = true;
  for (const el of form.querySelectorAll('[data-error-for]')) el.textContent = '';
  if (!form.crawlerName.value.trim()) {
    showError('crawlerName', 'Every crawler needs a name.');
    ok = false;
  }
  if (!/\S+@/.test(form.email.value)) {
    showError('email', 'Enter a valid email address.');
    ok = false;
  }
  if (!form.floor.value) {
    showError('floor', 'Pick a delivery floor.');
    ok = false;
  }
  return ok;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cart = loadCart();
  if (cart.items.length === 0) {
    toast('Your cart is empty. Nothing to deliver.');
    return;
  }
  if (!validate()) return;

  // Simulate the shopkeeper counting your gold.
  await new Promise((r) => setTimeout(r, 600));
  const order = nextOrderNumber();
  const p = document.createElement('p');
  p.className = 'success';
  p.textContent = `Party registered! Order #${order} will be delivered to floor ${form.floor.value}.`;
  result.append(p);

  saveCart({ items: [], discount: 0 });
  updateBadge(loadCart());
  renderSummary();
});

initPage();
renderSummary();
