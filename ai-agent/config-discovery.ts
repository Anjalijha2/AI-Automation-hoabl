/**
 * Agent 0 — Config Page Discovery Crawler
 * Navigates to /admin/cms and dumps the full DOM structure:
 *   - All section headings with their card container classes
 *   - All buttons (text + nearest section heading)
 *   - All file inputs (id, name, nearest heading)
 *   - All .ant-switch elements (nearest heading)
 *   - All .ant-select dropdowns (nearest heading)
 *   - Success/error toast class names
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SESSION_FILE = path.resolve(__dirname, '../automation/fixtures/.auth/admin.json');
const OUTPUT_FILE  = path.resolve(__dirname, '../docs/selectors/config-discovery.json');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    storageState: SESSION_FILE,
    viewport: { width: 1920, height: 900 }
  });
  const page = await context.newPage();

  console.log('🔍 Navigating to /admin/cms ...');
  await page.goto('https://uat-web.xrportal.in/admin/cms', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // ── Dump everything in one evaluate ──────────────────────────────────────────
  const result = await page.evaluate(() => {
    // Helper: walk up DOM to find the nearest heading ancestor text
    function nearestHeading(el: Element): string {
      let node: Element | null = el.parentElement;
      while (node && node !== document.body) {
        const h = node.querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]');
        if (h) return h.textContent?.trim() ?? '';
        node = node.parentElement;
      }
      return '(unknown)';
    }

    // 1. Section headings
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]'))
      .map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        classes: el.className,
        parentClasses: el.parentElement?.className ?? ''
      }));

    // 2. Buttons
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(b => b.textContent?.trim())
      .map(b => ({
        text: b.textContent?.trim(),
        classes: b.className,
        nearestHeading: nearestHeading(b)
      }));

    // 3. File inputs
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"], input.ant-upload-drag-input, input[accept]'))
      .map(inp => ({
        id: (inp as HTMLInputElement).id,
        name: (inp as HTMLInputElement).name,
        accept: (inp as HTMLInputElement).accept,
        classes: inp.className,
        nearestHeading: nearestHeading(inp)
      }));

    // 4. All inputs (including hidden file inputs used by Ant Design Upload)
    const allInputs = Array.from(document.querySelectorAll('input'))
      .map(inp => ({
        type: inp.type,
        id: inp.id,
        name: inp.name,
        accept: inp.accept,
        classes: inp.className,
        nearestHeading: nearestHeading(inp)
      }));

    // 5. Ant Design upload trigger elements
    const uploadTriggers = Array.from(document.querySelectorAll('.ant-upload, .ant-upload-btn, [class*="upload"]'))
      .slice(0, 40)
      .map(el => ({
        tag: el.tagName,
        classes: el.className,
        text: el.textContent?.trim().substring(0, 80),
        nearestHeading: nearestHeading(el)
      }));

    // 6. Toggles
    const switches = Array.from(document.querySelectorAll('.ant-switch'))
      .map((sw, i) => ({
        index: i,
        checked: sw.classList.contains('ant-switch-checked'),
        nearestHeading: nearestHeading(sw),
        ariaLabel: sw.getAttribute('aria-label') ?? ''
      }));

    // 7. Selects / dropdowns
    const selects = Array.from(document.querySelectorAll('.ant-select, select'))
      .slice(0, 20)
      .map(el => ({
        tag: el.tagName,
        classes: el.className,
        nearestHeading: nearestHeading(el)
      }));

    // 8. Card containers
    const cards = Array.from(document.querySelectorAll('.ant-card'))
      .map(card => ({
        classes: card.className,
        heading: card.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() ?? '',
        buttonTexts: Array.from(card.querySelectorAll('button')).map(b => b.textContent?.trim())
      }));

    // 9. Download links / anchors
    const links = Array.from(document.querySelectorAll('a, span[role="link"]'))
      .filter(a => /download|sample|inventory/i.test(a.textContent ?? ''))
      .map(a => ({
        tag: a.tagName,
        text: a.textContent?.trim(),
        href: (a as HTMLAnchorElement).href ?? '',
        classes: a.className,
        nearestHeading: nearestHeading(a)
      }));

    return { headings, buttons, fileInputs, allInputs, uploadTriggers, switches, selects, cards, links };
  });

  // Also take a full-page screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.resolve(__dirname, '../docs/selectors/config-page-top.png'), fullPage: false });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve(__dirname, '../docs/selectors/config-page-bottom.png'), fullPage: false });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`✅ Discovery complete. Output: ${OUTPUT_FILE}`);
  console.log(`📸 Screenshots saved to docs/selectors/`);
  console.log('\n📋 Section Headings found:');
  result.headings.forEach(h => console.log(`  [${h.tag}] ${h.text}`));
  console.log('\n🔘 Buttons found:');
  result.buttons.forEach(b => console.log(`  "${b.text}" ← section: "${b.nearestHeading}"`));
  console.log('\n📁 File inputs found:');
  result.fileInputs.forEach(f => console.log(`  id="${f.id}" accept="${f.accept}" ← section: "${f.nearestHeading}"`));
  console.log('\n🔀 Switches found:');
  result.switches.slice(0, 25).forEach(s => console.log(`  [${s.index}] ${s.checked ? '✅ checked' : '⬜ unchecked'} ← "${s.nearestHeading}"`));

  await browser.close();
})();
