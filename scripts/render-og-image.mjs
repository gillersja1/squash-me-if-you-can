// Renders scripts/og-image.html to assets/og-image.png (1200x630, the size LinkedIn and others expect).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(new URL('./og-image.html', import.meta.url).href);
await page.screenshot({ path: fileURLToPath(new URL('../assets/og-image.png', import.meta.url)) });
await browser.close();
console.log('Wrote assets/og-image.png');
