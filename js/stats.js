import { initPage } from './common.js';

const POINTS = 10;
const BASE = 3;
const STATS = ['Strength', 'Constitution', 'Dexterity', 'Intelligence', 'Charisma'];

const table = document.querySelector('#stats');
const remainingEl = document.querySelector('#remaining');
const derived = document.querySelector('#derived');

let stats = Object.fromEntries(STATS.map((s) => [s, BASE]));
let remaining = POINTS;

function renderStats() {
  table.innerHTML = '';
  for (const name of STATS) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${name}</span>
      <button class="btn small" type="button" aria-label="Lower ${name}">−</button>
      <output aria-label="${name} value">${stats[name]}</output>
      <button class="btn small" type="button" aria-label="Raise ${name}">+</button>`;
    const [minus, plus] = row.querySelectorAll('button');
    minus.addEventListener('click', () => {
      if (stats[name] <= BASE) return;
      stats[name] -= 1;
      remaining += 1;
      render();
    });
    plus.addEventListener('click', () => {
      if (remaining < 0) return;
      stats[name] += 1;
      remaining -= 1;
      render();
    });
    table.append(row);
  }
  const hp = 10 + stats.Constitution * 5;
  const damage = stats.Strength * 2 + stats.Dexterity;
  const spell = stats.Intelligence * 3;
  derived.innerHTML = `
    <div><dt>Hit points</dt><dd data-hp>${hp}</dd></div>
    <div><dt>Melee damage</dt><dd data-damage>${damage}</dd></div>
    <div><dt>Spell power</dt><dd data-spell>${spell}</dd></div>`;
}

function render() {
  renderStats();
  remainingEl.textContent = String(remaining);
}

document.querySelector('#reset').addEventListener('click', () => {
  stats = Object.fromEntries(STATS.map((s) => [s, BASE]));
  remaining = POINTS;
  renderStats();
});

initPage();
render();
