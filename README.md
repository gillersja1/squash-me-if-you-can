# 🪲 Squash Me If You Can

[![CI](https://github.com/gillersja1/squash-me-if-you-can/actions/workflows/ci.yml/badge.svg)](https://github.com/gillersja1/squash-me-if-you-can/actions/workflows/ci.yml)

**Play:** https://gillersja1.github.io/squash-me-if-you-can

A bug hunt practice site. It's a dungeon gear shop with a cart, checkout, stat calculator and party sign-up, with **20 intentional bugs** hidden in it (8 easy, 7 medium, 5 hard). Find them and report each one with the **Report a bug** button, which opens a GitHub issue form.

Good practice for manual and exploratory testing, writing clear bug reports, and boundary, validation, state, timing and accessibility checks.

## Rules

- One bug per report, with steps, expected vs. actual, and a severity.
- Everything is client-side, so DevTools and reading the source are fair game.
- Don't fix the bugs in a PR. Report them! (PRs that improve the site itself are welcome.)
- Hints are on the [hub page](https://gillersja1.github.io/squash-me-if-you-can).

## How it's tested

The site is plain HTML, CSS and JavaScript with no build step. Two test suites keep it honest:

- **This repo:** Playwright tests for everything that's *supposed* to work (filters, cart, checkout happy path, stats, party sign-up), on desktop and mobile, on every push.
- **A private answer-key repo:** one Playwright test per planted bug. Each asserts the correct behavior and is marked as an expected failure, so CI goes red if a bug ever stops reproducing. It runs on changes and weekly against the live site.

```bash
npm install
npx playwright install chromium
npm test          # serves the site on :4173 and runs the feature tests
npm run serve     # just serve it locally
```

Fan-made and inspired by *Dungeon Crawler Carl*; not affiliated with its author or publishers.
