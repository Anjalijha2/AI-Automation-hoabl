// scripts/generate-execution-report.js
// Builds the enhanced Test Case Execution Report (HTML + XLSX) for a sprint.
//
// New columns vs base TC catalogue:
//   * Automation Status         (Automated / Not Automated)  ← cross-ref tests/**/*.spec.js
//   * Last Run Status           (PASS / FAIL / SKIP / —)
//   * Execution Details         (append-only history — latest at top)
//   * Actual Result             (auto-populated from results.json)
//   * Screenshot Link           (relative path → test-failed-1.png, FAIL only)
//
// Inputs:
//   * reports/results.json                                    (Playwright JSON reporter)
//   * manual-qa-repository/01-test-cases/**/TC_*.md           (TC catalogue)
//   * manual-qa-repository/06-test-runs/UAT/sprint-<N>/execution-report.xlsx
//                                                             (previous run, for history)
//
// Outputs:
//   * manual-qa-repository/06-test-runs/UAT/sprint-<N>/execution-report.html
//   * manual-qa-repository/06-test-runs/UAT/sprint-<N>/execution-report.xlsx
//
// Usage:
//   node scripts/generate-execution-report.js [--sprint 5] [--env UAT]

'use strict';

const fs   = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// ── CLI args ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function arg(flag, def) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
}

const SPRINT      = arg('--sprint', '5');
const ENVNAME     = arg('--env', 'UAT');
const ROOT        = path.resolve(__dirname, '..');
const RESULTS     = path.join(ROOT, 'reports', 'results.json');
const TC_ROOT     = path.join(ROOT, 'manual-qa-repository', '01-test-cases');
const SPECS_ROOT  = path.join(ROOT, 'tests');
const TEST_RESULTS_DIRS = ['test-results', 'test-results-sm', 'test-results-uiux']
  .map(d => path.join(ROOT, d))
  .filter(p => fs.existsSync(p));
const OUT_DIR     = path.join(ROOT, 'manual-qa-repository', '06-test-runs', ENVNAME, `sprint-${SPRINT}`);
const OUT_HTML    = path.join(OUT_DIR, 'execution-report.html');
const OUT_XLSX    = path.join(OUT_DIR, 'execution-report.xlsx');

// ── Helpers ────────────────────────────────────────────────────────────────
function walk(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, pred, out);
    else if (pred(full)) out.push(full);
  }
  return out;
}

function nowStamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── 1. Scan spec corpus for TC_IDs referenced via test('TC_... — ...') ──────
function scanSpecsForTcIds() {
  const specFiles = walk(SPECS_ROOT, f => f.endsWith('.spec.js'));
  const automated = new Set();
  // Match both TC-LOGIN-001 and TC_ALLOC_E2E_001 plus other ALLCAPS_NN forms
  const rx = /\btest(?:\.\w+)?\s*\(\s*['"`]([A-Z][A-Z0-9_-]*?\d+)\b/g;
  for (const file of specFiles) {
    const src = fs.readFileSync(file, 'utf8');
    let m; while ((m = rx.exec(src)) !== null) automated.add(m[1]);
  }
  return automated;
}

// ── 2. Scan TC markdown files for catalogue rows ───────────────────────────
function scanTcMarkdown() {
  const mdFiles = walk(TC_ROOT, f => f.endsWith('.md') && !f.includes(`${path.sep}archived${path.sep}`));
  const rows = [];

  // ### <TC_ID> — <Title>
  const tcHeading = /^###\s+([A-Z][A-Z0-9_-]*?\d+)\s*[—\-:]+\s*(.+)$/gm;

  for (const file of mdFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const segs = rel.split('/'); // manual-qa-repository/01-test-cases/<portal>/<module>/<file>.md
    const portal = segs[2] || '';
    const module = segs[3] || '';
    const src = fs.readFileSync(file, 'utf8');

    let m; while ((m = tcHeading.exec(src)) !== null) {
      const tcId  = m[1].trim();
      const title = m[2].trim();
      // Look forward up to ~30 lines for Type / Priority lines in the table
      const tail = src.slice(m.index, m.index + 2000);
      const typeMatch  = tail.match(/\|\s*\*\*Type\*\*\s*\|\s*([^|\n]+?)\s*\|/i);
      const prioMatch  = tail.match(/\|\s*\*\*Priority\*\*\s*\|\s*([^|\n]+?)\s*\|/i);
      rows.push({
        tcId,
        portal,
        module,
        title,
        type:     typeMatch ? typeMatch[1].trim() : '',
        priority: prioMatch ? prioMatch[1].trim() : '',
        sourceFile: rel,
      });
    }
  }

  // Deduplicate by tcId (keep first occurrence)
  const seen = new Set();
  return rows.filter(r => (seen.has(r.tcId) ? false : (seen.add(r.tcId), true)));
}

// ── 3. Index Playwright results.json by TC_ID ──────────────────────────────
function indexResults() {
  if (!fs.existsSync(RESULTS)) return {};
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));
  const idx = {};

  // Recursive walk through suites → suites → specs
  function visitSuites(suites) {
    if (!Array.isArray(suites)) return;
    for (const s of suites) {
      if (Array.isArray(s.specs)) for (const spec of s.specs) collectSpec(spec);
      if (Array.isArray(s.suites)) visitSuites(s.suites);
    }
  }

  function collectSpec(spec) {
    const tcMatch = (spec.title || '').match(/^\s*([A-Z][A-Z0-9_-]*?\d+)\b/);
    if (!tcMatch) return;
    const tcId = tcMatch[1];
    const t = (spec.tests || [])[0] || {};
    const results = t.results || [];
    const last = results[results.length - 1] || {};
    const status = (last.status || t.status || 'unknown').toLowerCase();
    let mapped = 'SKIP';
    if (status === 'passed' || t.status === 'expected') mapped = 'PASS';
    else if (status === 'failed' || status === 'timedout' || status === 'interrupted' || t.status === 'unexpected') mapped = 'FAIL';
    else if (status === 'skipped' || t.status === 'skipped') mapped = 'SKIP';

    const errMsg = (last.errors && last.errors[0] && (last.errors[0].message || last.errors[0].value)) || '';
    const attachments = last.attachments || [];
    const shot = attachments.find(a => a && a.name === 'screenshot' && a.path) ||
                 attachments.find(a => a && /screenshot/i.test(a.contentType || '') && a.path);

    idx[tcId] = {
      status: mapped,
      actual: mapped === 'PASS' ? 'As expected' :
              mapped === 'SKIP' ? 'Skipped' :
              (errMsg.split('\n')[0] || 'Failed').slice(0, 800),
      screenshotPath: shot ? shot.path : null,
      specFile: spec.file || '',
      runTime: last.startTime || data.stats?.startTime || new Date().toISOString(),
    };
  }

  visitSuites(data.suites || []);
  return idx;
}

// ── 4. Locate fallback screenshot in test-results dirs ─────────────────────
function findFallbackScreenshot(tcId) {
  for (const dir of TEST_RESULTS_DIRS) {
    const hits = walk(dir, f => /test-failed-1\.png$/i.test(f));
    // Heuristic: match dir name against tcId fragments
    const slug = tcId.toLowerCase().replace(/_/g, '-');
    const hit = hits.find(h => h.toLowerCase().includes(slug));
    if (hit) return hit;
  }
  return null;
}

// ── 5. Load previous report XLSX (for history append) ──────────────────────
async function loadPriorHistory() {
  if (!fs.existsSync(OUT_XLSX)) return {};
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(OUT_XLSX);
    const ws = wb.getWorksheet('Execution Report');
    if (!ws) return {};
    const map = {};
    const header = ws.getRow(1).values.map(v => (v || '').toString());
    const idIdx  = header.indexOf('TC_ID');
    const histIdx = header.indexOf('Execution Details');
    if (idIdx < 0 || histIdx < 0) return {};
    ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
      if (rowNum === 1) return;
      const tc = (row.getCell(idIdx).value || '').toString().trim();
      const hist = (row.getCell(histIdx).value || '').toString();
      if (tc) map[tc] = hist;
    });
    return map;
  } catch (e) {
    console.warn('[history] could not read prior xlsx:', e.message);
    return {};
  }
}

// ── 6. Build row set ───────────────────────────────────────────────────────
function buildRows(tcCatalogue, automatedSet, resultsIdx, priorHistory, stamp) {
  return tcCatalogue.map(tc => {
    const automated = automatedSet.has(tc.tcId);
    const res = resultsIdx[tc.tcId];
    const lastStatus = res ? res.status : '—';
    const actual     = res ? res.actual : '';

    // Screenshot: from results, else fallback walk
    let shotPath = res && res.screenshotPath ? res.screenshotPath : null;
    if (!shotPath && lastStatus === 'FAIL') shotPath = findFallbackScreenshot(tc.tcId);
    const shotRel = shotPath ? path.relative(OUT_DIR, shotPath).replace(/\\/g, '/') : '';

    // History append: new entry on top if we have a fresh run for this TC
    const prior = priorHistory[tc.tcId] || '';
    let history = prior;
    if (res) {
      const entry = `${stamp} · ${lastStatus}`;
      history = prior ? `${entry}\n${prior}` : entry;
    }

    return {
      tcId:      tc.tcId,
      portal:    tc.portal,
      module:    tc.module,
      title:     tc.title,
      type:      tc.type,
      priority:  tc.priority,
      automation: automated ? 'Automated' : 'Not Automated',
      lastStatus,
      history,
      actual,
      shotRel,
      shotAbs:   shotPath || '',
    };
  });
}

// ── 7. Render XLSX ─────────────────────────────────────────────────────────
async function writeXlsx(rows) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'XR Portal QA Framework';
  wb.created = new Date();

  const ws = wb.addWorksheet('Execution Report', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'TC_ID',              key: 'tcId',       width: 28 },
    { header: 'Portal',             key: 'portal',     width: 16 },
    { header: 'Module',             key: 'module',     width: 22 },
    { header: 'Title',              key: 'title',      width: 60 },
    { header: 'Type',               key: 'type',       width: 10 },
    { header: 'Priority',           key: 'priority',   width: 10 },
    { header: 'Automation Status',  key: 'automation', width: 16 },
    { header: 'Last Run Status',    key: 'lastStatus', width: 14 },
    { header: 'Execution Details',  key: 'history',    width: 36 },
    { header: 'Actual Result',      key: 'actual',     width: 50 },
    { header: 'Screenshot Link',    key: 'shot',       width: 20 },
  ];
  // Header styling
  const hdr = ws.getRow(1);
  hdr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
  hdr.alignment = { vertical: 'middle', horizontal: 'left' };
  hdr.height = 22;

  for (const r of rows) {
    const row = ws.addRow({
      tcId:       r.tcId,
      portal:     r.portal,
      module:     r.module,
      title:      r.title,
      type:       r.type,
      priority:   r.priority,
      automation: r.automation,
      lastStatus: r.lastStatus,
      history:    r.history,
      actual:     r.actual,
      shot:       r.shotRel ? { text: 'View Screenshot', hyperlink: r.shotRel } : '',
    });
    row.alignment = { vertical: 'top', wrapText: true };

    // Colour cells: Last Run Status
    const c = row.getCell('lastStatus');
    if (r.lastStatus === 'PASS') c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    else if (r.lastStatus === 'FAIL') c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
    else if (r.lastStatus === 'SKIP') c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };

    // Automation column
    const ac = row.getCell('automation');
    ac.fill = { type: 'pattern', pattern: 'solid',
      fgColor: { argb: r.automation === 'Automated' ? 'FFD9E1F2' : 'FFF2F2F2' } };

    if (r.shotRel) {
      row.getCell('shot').font = { color: { argb: 'FF0563C1' }, underline: true };
    }
  }
  ws.autoFilter = { from: 'A1', to: `K${rows.length + 1}` };

  // Summary sheet
  const sumWs = wb.addWorksheet('Summary');
  const counts = summaryCounts(rows);
  sumWs.columns = [
    { header: 'Metric', key: 'k', width: 36 },
    { header: 'Value',  key: 'v', width: 18 },
  ];
  sumWs.getRow(1).font = { bold: true };
  for (const [k, v] of Object.entries(counts.top)) sumWs.addRow({ k, v });
  sumWs.addRow({});
  sumWs.addRow({ k: 'Per-module breakdown', v: '' }).font = { bold: true };
  sumWs.addRow({ k: 'Module', v: 'PASS / FAIL / SKIP / N-A' }).font = { italic: true };
  for (const [mod, c] of Object.entries(counts.byModule)) {
    sumWs.addRow({ k: mod, v: `${c.PASS} / ${c.FAIL} / ${c.SKIP} / ${c.NA}` });
  }

  await wb.xlsx.writeFile(OUT_XLSX);
}

function summaryCounts(rows) {
  const c = { PASS: 0, FAIL: 0, SKIP: 0, NA: 0, Automated: 0, NotAutomated: 0 };
  const byModule = {};
  for (const r of rows) {
    const key = r.lastStatus === '—' ? 'NA' : r.lastStatus;
    c[key] = (c[key] || 0) + 1;
    if (r.automation === 'Automated') c.Automated++; else c.NotAutomated++;
    const m = `${r.portal}/${r.module}`;
    byModule[m] ||= { PASS: 0, FAIL: 0, SKIP: 0, NA: 0 };
    byModule[m][key]++;
  }
  return {
    top: {
      'Total Test Cases':   rows.length,
      'Automated':          c.Automated,
      'Not Automated':      c.NotAutomated,
      'Last Run · PASS':    c.PASS,
      'Last Run · FAIL':    c.FAIL,
      'Last Run · SKIP':    c.SKIP,
      'Last Run · No Data': c.NA,
      'Generated':          nowStamp(),
      'Sprint':             SPRINT,
      'Environment':        ENVNAME,
    },
    byModule,
  };
}

// ── 8. Render HTML (inline-styled, mail-safe) ──────────────────────────────
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function statusBadge(s) {
  const map = {
    PASS: ['#10812B', '#DFF7E2'],
    FAIL: ['#B0002A', '#FFD4DA'],
    SKIP: ['#8A6D00', '#FFF1B8'],
    '—':  ['#444',    '#EEE'],
  };
  const [fg, bg] = map[s] || map['—'];
  return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:${bg};color:${fg};font-weight:600;font-size:12px;">${escapeHtml(s)}</span>`;
}

function autoBadge(a) {
  const fg = a === 'Automated' ? '#1F3864' : '#555';
  const bg = a === 'Automated' ? '#D9E1F2' : '#F0F0F0';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:${bg};color:${fg};font-size:12px;">${escapeHtml(a)}</span>`;
}

function renderHtml(rows, counts) {
  const top = counts.top;
  const summaryRows = Object.entries(top).map(([k, v]) =>
    `<tr><td style="padding:4px 12px;color:#666;">${escapeHtml(k)}</td><td style="padding:4px 12px;font-weight:600;">${escapeHtml(v)}</td></tr>`
  ).join('');

  const modRows = Object.entries(counts.byModule).map(([m, c]) =>
    `<tr>
       <td style="padding:4px 10px;border-bottom:1px solid #eee;">${escapeHtml(m)}</td>
       <td style="padding:4px 10px;border-bottom:1px solid #eee;color:#10812B;">${c.PASS}</td>
       <td style="padding:4px 10px;border-bottom:1px solid #eee;color:#B0002A;">${c.FAIL}</td>
       <td style="padding:4px 10px;border-bottom:1px solid #eee;color:#8A6D00;">${c.SKIP}</td>
       <td style="padding:4px 10px;border-bottom:1px solid #eee;color:#888;">${c.NA}</td>
     </tr>`
  ).join('');

  const tcRows = rows.map(r => {
    const history = (r.history || '').split('\n').map(escapeHtml).join('<br>');
    const shot    = r.shotRel
      ? `<a href="${escapeHtml(r.shotRel)}" style="color:#0563C1;">Screenshot</a>`
      : '<span style="color:#aaa;">—</span>';
    return `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">${escapeHtml(r.tcId)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${escapeHtml(r.portal)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${escapeHtml(r.module)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;max-width:380px;">${escapeHtml(r.title)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${escapeHtml(r.type)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${escapeHtml(r.priority)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${autoBadge(r.automation)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${statusBadge(r.lastStatus)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;color:#444;">${history}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;color:#444;max-width:340px;">${escapeHtml(r.actual)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${shot}</td>
    </tr>`;
  }).join('');

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>XR Portal QA — Sprint ${escapeHtml(SPRINT)} Execution Report</title></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:'Segoe UI',Arial,sans-serif;color:#222;">
<div style="max-width:1400px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(90deg,#1F3864,#3a5a9c);color:#fff;padding:20px 28px;">
    <div style="font-size:22px;font-weight:700;">XR Portal QA — Execution Report</div>
    <div style="font-size:14px;opacity:.92;margin-top:4px;">
      Sprint ${escapeHtml(SPRINT)} · ${escapeHtml(ENVNAME)} · Generated ${escapeHtml(nowStamp())}
    </div>
  </div>

  <div style="display:flex;gap:20px;padding:20px 28px;flex-wrap:wrap;">
    <div style="flex:1;min-width:320px;">
      <div style="font-weight:700;margin-bottom:8px;color:#1F3864;">Headline</div>
      <table style="border-collapse:collapse;font-size:13px;">${summaryRows}</table>
    </div>
    <div style="flex:2;min-width:420px;">
      <div style="font-weight:700;margin-bottom:8px;color:#1F3864;">Per-Module Breakdown</div>
      <table style="border-collapse:collapse;font-size:13px;width:100%;">
        <thead><tr style="background:#f0f3fa;">
          <th style="text-align:left;padding:6px 10px;">Module</th>
          <th style="text-align:left;padding:6px 10px;color:#10812B;">PASS</th>
          <th style="text-align:left;padding:6px 10px;color:#B0002A;">FAIL</th>
          <th style="text-align:left;padding:6px 10px;color:#8A6D00;">SKIP</th>
          <th style="text-align:left;padding:6px 10px;color:#888;">—</th>
        </tr></thead>
        <tbody>${modRows || '<tr><td colspan="5" style="padding:8px;color:#888;">No module data</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <div style="padding:0 28px 28px;">
    <div style="font-weight:700;margin-bottom:8px;color:#1F3864;">All Test Cases (${rows.length})</div>
    <table style="border-collapse:collapse;width:100%;font-size:12px;">
      <thead><tr style="background:#1F3864;color:#fff;">
        <th style="text-align:left;padding:8px;">TC_ID</th>
        <th style="text-align:left;padding:8px;">Portal</th>
        <th style="text-align:left;padding:8px;">Module</th>
        <th style="text-align:left;padding:8px;">Title</th>
        <th style="text-align:left;padding:8px;">Type</th>
        <th style="text-align:left;padding:8px;">Priority</th>
        <th style="text-align:left;padding:8px;">Automation</th>
        <th style="text-align:left;padding:8px;">Last Run</th>
        <th style="text-align:left;padding:8px;">Execution Details</th>
        <th style="text-align:left;padding:8px;">Actual Result</th>
        <th style="text-align:left;padding:8px;">Screenshot</th>
      </tr></thead>
      <tbody>${tcRows}</tbody>
    </table>
  </div>

  <div style="background:#f0f3fa;padding:12px 28px;font-size:11px;color:#666;">
    Generated by <code>scripts/generate-execution-report.js</code> ·
    Source: <code>reports/results.json</code> +
    <code>manual-qa-repository/01-test-cases/**/TC_*.md</code>
  </div>
</div>
</body></html>`;
}

// ── 8b. Merge run results INTO the per-portal TC catalogue workbooks ──────
// Updates K-O cells (Automation Status / Last Run Status / Execution Details /
// Actual Result (Run) / Screenshot Link) by matching col-A TC_ID. Preserves
// every other cell, banner row, formula, merge, and styling.
const CATALOGUE_DIR = path.join(ROOT, 'manual-qa-repository', '07-execution');
const CATALOGUE_FILES = [
  'TestCases-AdminPortal.xlsx',
  'TestCases-BuyerPortal.xlsx',
  'TestCases-CPPortal.xlsx',
  'TestCases-SMPortal.xlsx',
];
const CAT_COL_TCID        = 1;   // A
const CAT_COL_AUTOMATION  = 11;  // K
const CAT_COL_LASTSTATUS  = 12;  // L
const CAT_COL_HISTORY     = 13;  // M
const CAT_COL_ACTUALRUN   = 14;  // N
const CAT_COL_SHOT        = 15;  // O

async function mergeIntoCatalogue(resultsIdx, automatedSet, stamp) {
  for (const fname of CATALOGUE_FILES) {
    const fpath = path.join(CATALOGUE_DIR, fname);
    if (!fs.existsSync(fpath)) {
      console.log(`[catalogue] skip ${fname} — not found`);
      continue;
    }
    const wb = new ExcelJS.Workbook();
    try { await wb.xlsx.readFile(fpath); }
    catch (e) { console.warn(`[catalogue] could not open ${fname}: ${e.message}`); continue; }

    let updated = 0, autoOnly = 0;
    wb.eachSheet(ws => {
      if (ws.name && ws.name.startsWith('📋')) return;  // skip Index
      // Header row is row 2; scan data starting at row 3
      const lastRow = ws.rowCount;
      for (let r = 3; r <= lastRow; r++) {
        const row = ws.getRow(r);
        const tcId = (row.getCell(CAT_COL_TCID).value || '').toString().trim();
        if (!tcId || tcId.includes('━')) continue;  // banner

        // Always refresh K (Automation Status) — reflects current spec corpus
        const automation = automatedSet.has(tcId) ? 'Automated' : 'Not Automated';
        const kCell = row.getCell(CAT_COL_AUTOMATION);
        kCell.value = automation;
        kCell.alignment = { horizontal: 'center', vertical: 'top' };
        kCell.fill = { type: 'pattern', pattern: 'solid',
          fgColor: { argb: automation === 'Automated' ? 'FFD9E1F2' : 'FFF2F2F2' } };
        autoOnly++;

        const res = resultsIdx[tcId];
        if (!res) continue;

        // L — Last Run Status
        const lCell = row.getCell(CAT_COL_LASTSTATUS);
        lCell.value = res.status;
        lCell.alignment = { horizontal: 'center', vertical: 'top' };
        if (res.status === 'PASS')      lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        else if (res.status === 'FAIL') lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        else if (res.status === 'SKIP') lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };

        // M — Execution Details (PREPEND latest entry, preserve prior history)
        const mCell = row.getCell(CAT_COL_HISTORY);
        const priorHist = (mCell.value || '').toString();
        const newEntry  = `${stamp} · ${res.status}`;
        mCell.value = priorHist ? `${newEntry}\n${priorHist}` : newEntry;
        mCell.alignment = { vertical: 'top', wrapText: true };

        // N — Actual Result (Run)
        const nCell = row.getCell(CAT_COL_ACTUALRUN);
        nCell.value = res.actual || '';
        nCell.alignment = { vertical: 'top', wrapText: true };

        // O — Screenshot Link (only on FAIL)
        const oCell = row.getCell(CAT_COL_SHOT);
        let shotPath = res.screenshotPath;
        if (!shotPath && res.status === 'FAIL') shotPath = findFallbackScreenshot(tcId);
        if (shotPath) {
          const shotRel = path.relative(CATALOGUE_DIR, shotPath).replace(/\\/g, '/');
          oCell.value = { text: 'screenshot', hyperlink: shotRel };
          oCell.font = { color: { argb: 'FF0563C1' }, underline: true };
        } else {
          oCell.value = '';
        }
        updated++;
      }
    });

    await wb.xlsx.writeFile(fpath);
    console.log(`[catalogue] ${fname} — ${updated} TC row(s) merged with results, ${autoOnly} K-cells refreshed`);
  }
}

// ── 9. Main ────────────────────────────────────────────────────────────────
(async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[exec-report] sprint=${SPRINT} env=${ENVNAME}`);
  const automatedSet = scanSpecsForTcIds();
  console.log(`[exec-report] automated TC_IDs in specs: ${automatedSet.size}`);

  const tcCatalogue = scanTcMarkdown();
  console.log(`[exec-report] TC catalogue rows: ${tcCatalogue.length}`);

  const resultsIdx = indexResults();
  console.log(`[exec-report] results.json entries indexed: ${Object.keys(resultsIdx).length}`);

  const priorHistory = await loadPriorHistory();
  console.log(`[exec-report] prior history rows: ${Object.keys(priorHistory).length}`);

  const stamp = nowStamp();
  const rows = buildRows(tcCatalogue, automatedSet, resultsIdx, priorHistory, stamp);

  // Augment rows with any results-only TC_IDs that have no markdown catalogue entry
  const known = new Set(rows.map(r => r.tcId));
  for (const [tcId, res] of Object.entries(resultsIdx)) {
    if (known.has(tcId)) continue;
    // res.specFile is like 'db/connection.db.spec.js' or 'e2e/admin/login.spec.js'
    const parts = (res.specFile || '').split(/[\\/]/);
    const portal = parts.length >= 3 ? parts[1] : parts[0] || '';
    const moduleFile = parts[parts.length - 1] || '';
    const module = moduleFile.replace(/\.(spec|test)\.js$/i, '').replace(/\.db$/, '');
    const prior = priorHistory[tcId] || '';
    const entry = `${stamp} · ${res.status}`;
    rows.push({
      tcId, portal, module,
      title: '(not in TC catalogue — from spec)',
      type: '', priority: '',
      automation: automatedSet.has(tcId) ? 'Automated' : 'Not Automated',
      lastStatus: res.status,
      history: prior ? `${entry}\n${prior}` : entry,
      actual: res.actual,
      shotRel: res.screenshotPath
        ? path.relative(OUT_DIR, res.screenshotPath).replace(/\\/g, '/')
        : (res.status === 'FAIL' ? (findFallbackScreenshot(tcId)
            ? path.relative(OUT_DIR, findFallbackScreenshot(tcId)).replace(/\\/g, '/')
            : '') : ''),
      shotAbs: res.screenshotPath || '',
    });
  }

  // Stable sort: portal → module → tcId
  rows.sort((a, b) =>
    (a.portal || '').localeCompare(b.portal || '') ||
    (a.module || '').localeCompare(b.module || '') ||
    a.tcId.localeCompare(b.tcId)
  );

  await writeXlsx(rows);
  const counts = summaryCounts(rows);
  fs.writeFileSync(OUT_HTML, renderHtml(rows, counts), 'utf8');

  console.log(`[exec-report] wrote:`);
  console.log(`   HTML  → ${path.relative(ROOT, OUT_HTML)}`);
  console.log(`   XLSX  → ${path.relative(ROOT, OUT_XLSX)}`);
  console.log(`[exec-report] summary:`, counts.top);

  // Also merge results into the four per-portal TC catalogue workbooks
  console.log(`[catalogue] merging results into TestCases-*Portal.xlsx ...`);
  await mergeIntoCatalogue(resultsIdx, automatedSet, stamp);
  console.log(`[catalogue] done.`);
})();
