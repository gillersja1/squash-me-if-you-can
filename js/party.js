import { initPage, toast } from './common.js';

const MAX_MEMBERS = 6;
const PARTIES_KEY = 'smiyc.parties';
const form = document.querySelector('#party-form');
const members = document.querySelector('#members');
const addMember = document.querySelector('#add-member');
const list = document.querySelector('#parties');

function loadParties() {
  try {
    return JSON.parse(localStorage.getItem(PARTIES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveParties(parties) {
  try {
    localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  } catch {
    /* storage blocked */
  }
}

function memberInputs() {
  return [...members.querySelectorAll('input')];
}

function addMemberField(value = '') {
  const n = memberInputs().length + 1;
  const label = document.createElement('label');
  label.innerHTML = `<span>Member ${n}</span><input name="member" maxlength="30" value="${value}">`;
  members.append(label);
}

addMember.addEventListener('click', () => {
  if (memberInputs().length > MAX_MEMBERS) {
    toast(`A party can have at most ${MAX_MEMBERS} members.`);
    return;
  }
  addMemberField();
});

function renderParties() {
  const parties = loadParties();
  list.innerHTML = parties.length
    ? parties.map((p) => `<li><strong>${escapeHtml(p.name)}</strong> · ${p.date} at ${p.slot} · ${p.members.length} members</li>`).join('')
    : '<li class="muted">No parties registered yet.</li>';
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.partyName.value.trim();
  const date = form.date.value;
  const slot = form.slot.value;
  const names = memberInputs()
    .map((i) => i.value.trim())
    .filter(Boolean);
  const parties = loadParties();

  if (!name) return toast('Your party needs a name.');
  if (parties.some((p) => p.name.toLowerCase() === name.toLowerCase())) return toast('That party name is taken.');
  if (!date) return toast('Pick a date for your crawl.');
  if (names.length < 1) return toast('Add at least one member.');

  parties.push({ name, date, slot, members: names });
  saveParties(parties);
  renderParties();
  form.reset();
  members.innerHTML = '';
  addMemberField();
  toast(`${name} is registered for ${date} at ${slot}.`);
});

initPage();
addMemberField();
renderParties();
