/**
 * Discovery Crawler — All Modules
 * ============================================================
 * Crawls every module of XR Portal Admin and dumps full DOM structure:
 *   - All section headings with their card container classes
 *   - All buttons (text + nearest section heading)
 *   - All file inputs (id, name, nearest heading)
 *   - All inputs (id, type, name, nearest heading)
 *   - All .ant-upload trigger elements
 *   - All .ant-switch elements (nearest heading)
 *   - All .ant-select dropdowns (nearest heading)
 *   - All tables / .ant-table (nearest heading)     ← added
 *   - Card containers
 *   - Download links / anchors
 *
 * Outputs (per module):
 *   manual-qa-repository/selectors/<ModuleName>-discovery.json
 *   manual-qa-repository/selectors/<ModuleName>-top.png
 *   manual-qa-repository/selectors/<ModuleName>-bottom.png
 *
 * Summary:
 *   manual-qa-repository/selectors/portal-map.json                 ← added
 *
 * Run:
 *   node src/test/discovery/config-discovery.js
 * ============================================================
 */

const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

const SESSION_FILE = path.resolve(__dirname, '../fixtures/.auth/admin.json');
const OUTPUT_DIR   = path.resolve(__dirname, '../../../manual-qa-repository/selectors');

// ── Modules to crawl ──────────────────────────────────────────────────────────
const MODULES = [
  { name: 'Config',           url: 'https://uat-web.xrportal.in/admin/cms' },
  { name: 'Customers',        url: 'https://uat-web.xrportal.in/admin/customers' },
  { name: 'Allocation',       url: 'https://uat-web.xrportal.in/admin/allocation' },
  { name: 'Towers',           url: 'https://uat-web.xrportal.in/admin/towers' },
  { name: 'JBP_Management',   url: 'https://uat-web.xrportal.in/admin/jbp-management' },
  { name: 'Channel_Partners', url: 'https://uat-web.xrportal.in/admin/channel-partners' },
];

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    storageState: SESSION_FILE,
    viewport: { width: 1920, height: 900 }
  });
  const page = await context.newPage();

  const portalMap = [];

  for (const mod of MODULES) {
    console.log(`\n🔍 Discovering: ${mod.name} → ${mod.url}`);
    await page.goto(mod.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // ── Dump everything in one evaluate ────────────────────────────────────────
    const result = await page.evaluate(() => {
      // Helper: walk up DOM to find the nearest heading ancestor text
      function nearestHeading(el) {
        let node = el.parentElement;
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
          id: inp.id,
          name: inp.name,
          accept: inp.accept,
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
          placeholder: inp.placeholder,
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

      // 6. Toggles / switches
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

      // 8. Tables
      const tables = Array.from(document.querySelectorAll('table, .ant-table'))
        .map(el => ({
          tag: el.tagName,
          classes: el.className,
          nearestHeading: nearestHeading(el)
        }));

      // 9. Card containers
      const cards = Array.from(document.querySelectorAll('.ant-card'))
        .map(card => ({
          classes: card.className,
          heading: card.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() ?? '',
          buttonTexts: Array.from(card.querySelectorAll('button')).map(b => b.textContent?.trim())
        }));

      // 10. Download links / anchors
      const links = Array.from(document.querySelectorAll('a, span[role="link"]'))
        .filter(a => /download|sample|inventory/i.test(a.textContent ?? ''))
        .map(a => ({
          tag: a.tagName,
          text: a.textContent?.trim(),
          href: a.href ?? '',
          classes: a.className,
          nearestHeading: nearestHeading(a)
        }));

      return { headings, buttons, fileInputs, allInputs, uploadTriggers, switches, selects, tables, cards, links };
    });

    // ── Screenshots ────────────────────────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${mod.name}-top.png`), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${mod.name}-bottom.png`), fullPage: false });

    // ── Per-module JSON ────────────────────────────────────────────────────────
    const outputFile = path.join(OUTPUT_DIR, `${mod.name}-discovery.json`);
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

    // ── Console summary ────────────────────────────────────────────────────────
    console.log(`   ✅ ${outputFile}`);
    console.log(`   📋 Headings : ${result.headings.length}`);
    console.log(`   🔘 Buttons  : ${result.buttons.length}`);
    console.log(`   🔀 Switches : ${result.switches.length}`);
    console.log(`   📁 FileInp  : ${result.fileInputs.length}`);
    console.log(`   📊 Tables   : ${result.tables.length}`);
    console.log(`   🗂  Selects  : ${result.selects.length}`);
    if (mod.name === 'Config') {
      console.log('\n   📋 Section Headings:');
      result.headings.forEach(h => console.log(`     [${h.tag}] ${h.text}`));
      console.log('\n   🔘 Buttons:');
      result.buttons.forEach(b => console.log(`     "${b.text}" ← "${b.nearestHeading}"`));
      console.log('\n   📁 File inputs:');
      result.fileInputs.forEach(f => console.log(`     id="${f.id}" accept="${f.accept}" ← "${f.nearestHeading}"`));
      console.log('\n   🔀 Switches:');
      result.switches.slice(0, 25).forEach(s => console.log(`     [${s.index}] ${s.checked ? '✅ on' : '⬜ off'} ← "${s.nearestHeading}"`));
    }

    // ── Portal map entry ───────────────────────────────────────────────────────
    portalMap.push({
      module: mod.name,
      url: mod.url,
      counts: {
        headings:       result.headings.length,
        buttons:        result.buttons.length,
        switches:       result.switches.length,
        fileInputs:     result.fileInputs.length,
        allInputs:      result.allInputs.length,
        uploadTriggers: result.uploadTriggers.length,
        selects:        result.selects.length,
        tables:         result.tables.length,
        cards:          result.cards.length,
        links:          result.links.length,
      },
      screenshots: {
        top:    `${mod.name}-top.png`,
        bottom: `${mod.name}-bottom.png`,
      }
    });
  }

  // ── portal-map.json ────────────────────────────────────────────────────────
  const portalMapFile = path.join(OUTPUT_DIR, 'portal-map.json');
  fs.writeFileSync(portalMapFile, JSON.stringify(portalMap, null, 2));

  console.log('\n✅ Discovery complete.');
  console.log(`📄 Portal map  → ${portalMapFile}`);
  console.log(`📂 Per-module  → ${OUTPUT_DIR}/<ModuleName>-discovery.json`);
  console.log(`📸 Screenshots → ${OUTPUT_DIR}/<ModuleName>-top/bottom.png`);

  await browser.close();
})();
