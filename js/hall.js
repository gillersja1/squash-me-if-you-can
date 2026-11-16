import { initPage } from './common.js';

// Built live from GitHub: every issue labeled "confirmed" credits its reporter.
const API = 'https://api.github.com/repos/gillersja1/squash-me-if-you-can/issues?labels=confirmed&state=all&per_page=100';
const list = document.querySelector('#hall');

// Pinned above the rankings: the person who built (and bugged) the dungeon.
const DUNGEON_MASTER = { login: 'gillersja1', role: 'Dungeon Master · planted all 20 bugs' };

// In-game characters, clearly tagged NPC. They rank alongside real crawlers, who can beat them.
export const NPCS = [
  { login: 'Princess Donut', icon: '🐱', finds: 3, first: '2026-11-16T00:00:00Z', quip: 'Filed every report in all caps.' },
  { login: 'Mordecai', icon: '🧪', finds: 2, first: '2026-11-16T00:00:01Z', quip: 'Found them while restocking the shop.' },
  { login: 'Mongo', icon: '🦖', finds: 1, first: '2026-11-16T00:00:02Z', quip: 'Squashed one literally.' },
  { login: 'The System AI', icon: '🤖', finds: 1, first: '2026-11-16T00:00:03Z', quip: 'Insists the other 19 are features.' },
];

/** Groups confirmed issues by reporter: most finds first, then earliest first find. */
export function rankSquashers(issues, npcs = []) {
  const byUser = new Map(npcs.map((n) => [`npc:${n.login}`, { ...n, npc: true }]));
  for (const issue of issues) {
    if (issue.pull_request || !issue.user) continue;
    const { login, avatar_url: avatar, html_url: profile } = issue.user;
    const entry = byUser.get(login) ?? { login, avatar, profile, finds: 0, first: issue.created_at };
    entry.finds += 1;
    if (issue.created_at < entry.first) entry.first = issue.created_at;
    byUser.set(login, entry);
  }
  return [...byUser.values()].sort((a, b) => b.finds - a.finds || a.first.localeCompare(b.first));
}

function message(text) {
  list.replaceChildren(Object.assign(document.createElement('li'), { className: 'muted', textContent: text }));
}

function row(rank, iconEl, nameEl, detail, extraClass = '') {
  const li = document.createElement('li');
  li.className = `squasher ${extraClass}`.trim();
  li.append(Object.assign(document.createElement('span'), { className: 'rank', textContent: rank }), iconEl, nameEl, detail);
  return li;
}

function masterRow() {
  const img = Object.assign(document.createElement('img'), { src: `https://github.com/${DUNGEON_MASTER.login}.png?size=64`, alt: '', width: 32, height: 32 });
  const name = Object.assign(document.createElement('a'), { href: `https://github.com/${DUNGEON_MASTER.login}`, textContent: DUNGEON_MASTER.login, target: '_blank', rel: 'noopener' });
  const role = Object.assign(document.createElement('span'), { className: 'finds', textContent: DUNGEON_MASTER.role });
  return row('👑', img, name, role, 'master');
}

function squasherRow(s, i) {
  const rank = i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`;
  const finds = Object.assign(document.createElement('span'), { className: 'finds', textContent: `${s.finds} ${s.finds === 1 ? 'bug' : 'bugs'} squashed` });
  if (s.npc) {
    const icon = Object.assign(document.createElement('span'), { className: 'npc-icon', textContent: s.icon, ariaHidden: 'true' });
    const name = document.createElement('span');
    name.className = 'npc-name';
    name.append(document.createTextNode(s.login + ' '), Object.assign(document.createElement('span'), { className: 'npc-tag', textContent: 'NPC' }));
    name.title = s.quip;
    return row(rank, icon, name, finds, 'npc');
  }
  const img = Object.assign(document.createElement('img'), { src: `${s.avatar}&s=64`, alt: '', width: 32, height: 32, loading: 'lazy' });
  const name = Object.assign(document.createElement('a'), { href: s.profile, textContent: s.login, target: '_blank', rel: 'noopener' });
  return row(rank, img, name, finds);
}

async function load() {
  try {
    const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(String(res.status));
    const issues = await res.json();
    const ranked = rankSquashers(issues, NPCS);
    list.replaceChildren(masterRow(), ...ranked.map(squasherRow));
    if (!ranked.some((s) => !s.npc)) {
      const note = Object.assign(document.createElement('li'), { className: 'muted', textContent: 'No crawler has been confirmed yet. Beat the NPCs and take the top spot.' });
      list.append(note);
    }
  } catch {
    message('The hall is closed for cleaning (GitHub did not answer). Try again in a minute.');
    list.prepend(masterRow());
  }
}

initPage();
load();
