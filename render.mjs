import { chromium } from 'playwright';
import fs from 'fs';

const fps = 24;
const duration = 20;
const total = fps * duration;
const width = 1080;
const height = 1920;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto('file://' + process.cwd() + '/index.html');
await page.waitForFunction(() => window.__ready === true);
fs.mkdirSync('frames', { recursive: true });

for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.renderFrame(t), i / fps);
  await page.screenshot({
    path: 'frames/' + String(i).padStart(4, '0') + '.jpg',
    type: 'jpeg',
    quality: 94
  });
  if (i % 48 === 0) console.log('frame', i, '/', total);
}

await browser.close();
console.log('frames complete');
