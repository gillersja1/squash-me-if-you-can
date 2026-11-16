import { initPage } from './common.js';

// Built live from GitHub: every issue labeled "confirmed" credits its reporter.
const API = 'https://api.github.com/repos/gillersja1/squash-me-if-you-can/issues?labels=confirmed&state=all&per_page=100';
const list = document.querySelector('#hall');

/** Groups confirmed issues by reporter: most finds first, then earliest first find. */
export function rankSquashers(issues) {
  const byUser = new Map();
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

async function load() {
  try {
    const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(String(res.status));
    const ranked = rankSquashers(await res.json());
    if (ranked.length === 0) {
      message('No confirmed squashers yet. The first spot is waiting for you.');
      return;
    }
    list.replaceChildren(
      ...ranked.map((s, i) => {
        const li = document.createElement('li');
        li.className = 'squasher';
        const rank = Object.assign(document.createElement('span'), { className: 'rank', textContent: i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}` });
        const img = Object.assign(document.createElement('img'), { src: `${s.avatar}&s=64`, alt: '', width: 32, height: 32, loading: 'lazy' });
        const name = Object.assign(document.createElement('a'), { href: s.profile, textContent: s.login, target: '_blank', rel: 'noopener' });
        const finds = Object.assign(document.createElement('span'), {
          className: 'finds',
          textContent: `${s.finds} ${s.finds === 1 ? 'bug' : 'bugs'} squashed`,
        });
        li.append(rank, img, name, finds);
        return li;
      }),
    );
  } catch {
    message('The hall is closed for cleaning (GitHub did not answer). Try again in a minute.');
  }
}

initPage();
load();
