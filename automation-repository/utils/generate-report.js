'use strict';

// Parses reports/results.json → execution-summary.md + updates DASHBOARD.md
// Usage: node automation-repository/utils/generate-report.js [--sprint N] [--env UAT|DEV] [--portal admin]

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..', '..');
const RESULTS_FILE  = path.join(ROOT, 'reports', 'results.json');
const DASHBOARD_FILE = path.join(ROOT, 'manual-qa-repository', 'DASHBOARD.md');
const RUNS_DIR      = path.join(ROOT, 'manual-qa-repository', '06-test-runs');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const argVal = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const ENV    = argVal('--env')    || process.env.ENV    || 'UAT';
const PORTAL = argVal('--portal') || process.env.PORTAL || 'admin';
const SPRINT = argVal('--sprint') || process.env.SPRINT || detectSprint();

function detectSprint() {
  const sprintDir = path.join(RUNS_DIR, ENV);
  if (!fs.existsSync(sprintDir)) return '1';
  const existing = fs.readdirSync(sprintDir)
    .filter(d => /^sprint-\d+$/.test(d))
    .map(d => parseInt(d.replace('sprint-', ''), 10))
    .sort((a, b) => b - a);
  return existing.length ? String(existing[0] + 1) : '1';
}

// ── Load results ─────────────────────────────────────────────────────────────
if (!fs.existsSync(RESULTS_FILE)) {
  console.error('No results found — run was not executed');
  process.exit(0);
}

const raw = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
const stats = raw.stats || {};

// ── Walk suite tree → flat spec list ─────────────────────────────────────────
function walkSuites(suites, file = '') {
  const specs = [];
  for (const suite of (suites || [])) {
    const f = suite.file || file;
    for (const spec of (suite.specs || [])) {
      for (const test of (spec.tests || [])) {
        const result = test.results?.[test.results.length - 1] || {};
        specs.push({
          title:       spec.title,
          file:        f,
          project:     test.projectName || '',
          status:      result.status || 'unknown',
          duration:    result.duration || 0,
          error:       result.errors?.[0]?.message || null,
          attachments: (result.attachments || []).map(a => a.path || a.name).filter(Boolean),
        });
      }
    }
    if (suite.suites) specs.push(...walkSuites(suite.suites, f));
  }
  return specs;
}

const allSpecs = walkSuites(raw.suites);

// ── Stats ─────────────────────────────────────────────────────────────────────
const total   = allSpecs.length;
const passed  = allSpecs.filter(s => s.status === 'passed').length;
const failed  = allSpecs.filter(s => s.status === 'failed').length;
const skipped = allSpecs.filter(s => s.status === 'skipped' || s.status === 'pending').length;
const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
const runDate = stats.startTime ? new Date(stats.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
const durationSec = stats.duration ? (stats.duration / 1000).toFixed(1) : '—';

// ── TC_ID extractor ───────────────────────────────────────────────────────────
function extractTCID(title) {
  const m = title.match(/^(TC[-_][A-Z0-9_-]+)/);
  return m ? m[1] : '—';
}

function statusIcon(s) {
  if (s === 'passed') return '✅ PASS';
  if (s === 'failed') return '❌ FAIL';
  if (s === 'skipped' || s === 'pending') return '⏭ SKIP';
  return '❓ ' + s.toUpperCase();
}

function fmtDuration(ms) {
  return ms ? (ms / 1000).toFixed(1) + 's' : '—';
}

function shortError(msg) {
  if (!msg) return '—';
  const first = msg.split('\n')[0].trim();
  return first.length > 120 ? first.slice(0, 117) + '...' : first;
}

// ── Build markdown ────────────────────────────────────────────────────────────
const lines = [];

lines.push(`# Execution Summary — ${PORTAL.charAt(0).toUpperCase() + PORTAL.slice(1)} Portal`);
lines.push('');
lines.push('## Run Metadata');
lines.push('');
lines.push(`| Field | Value |`);
lines.push(`|-------|-------|`);
lines.push(`| Portal | ${PORTAL} |`);
lines.push(`| Sprint | ${SPRINT} |`);
lines.push(`| Run Date | ${runDate} |`);
lines.push(`| Environment | ${ENV} |`);
lines.push(`| Duration | ${durationSec}s |`);
lines.push(`| Executor | QA Agent |`);
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push('| Metric | Count |');
lines.push('|--------|-------|');
lines.push(`| Total TCs | ${total} |`);
lines.push(`| Passed | ${passed} |`);
lines.push(`| Failed | ${failed} |`);
lines.push(`| Skipped | ${skipped} |`);
lines.push(`| Pass Rate | ${passRate}% |`);
lines.push('');
lines.push('## Per-Test Results');
lines.push('');
lines.push('| TC_ID | Title | Project | Status | Duration | Failure Reason |');
lines.push('|-------|-------|---------|--------|----------|---------------|');
for (const s of allSpecs) {
  const tcid    = extractTCID(s.title);
  const title   = s.title.replace(/\|/g, '\\|');
  const reason  = s.status === 'failed' ? shortError(s.error).replace(/\|/g, '\\|') : '—';
  lines.push(`| ${tcid} | ${title} | ${s.project} | ${statusIcon(s.status)} | ${fmtDuration(s.duration)} | ${reason} |`);
}
lines.push('');

// Failures detail
const failures = allSpecs.filter(s => s.status === 'failed');
if (failures.length) {
  lines.push('## Failures Detail');
  lines.push('');
  for (const s of failures) {
    lines.push(`### ${extractTCID(s.title)}`);
    lines.push('');
    lines.push(`**Title:** ${s.title}`);
    lines.push(`**Project:** ${s.project}`);
    lines.push(`**File:** \`${s.file}\``);
    if (s.error) {
      lines.push('**Error:**');
      lines.push('```');
      lines.push(s.error.split('\n').slice(0, 10).join('\n'));
      lines.push('```');
    }
    if (s.attachments.length) {
      lines.push('**Attachments:**');
      for (const a of s.attachments) lines.push(`- \`${path.relative(ROOT, a)}\``);
    }
    lines.push('');
  }
}

lines.push('## Coverage Map');
lines.push('');
lines.push(`Specs executed this run: **${total}** across project(s): ${[...new Set(allSpecs.map(s => s.project))].join(', ') || '—'}`);
lines.push('');
lines.push('_Full BRD/FRD requirement traceability is maintained per TC_ID in the test titles above._');
lines.push('');

const markdown = lines.join('\n');

// ── Write report ──────────────────────────────────────────────────────────────
const outDir = path.join(RUNS_DIR, ENV, `sprint-${SPRINT}`);
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'execution-summary.md');
fs.writeFileSync(outFile, markdown, 'utf8');
console.log(`Report written → ${path.relative(ROOT, outFile)}`);

// ── Update DASHBOARD.md ───────────────────────────────────────────────────────
if (fs.existsSync(DASHBOARD_FILE)) {
  let dash = fs.readFileSync(DASHBOARD_FILE, 'utf8');

  // Update Last Updated date
  dash = dash.replace(/(\*\*Last Updated:\*\*\s*)[\d-]+/, `$1${runDate}`);

  // Update or append Last Run row for Test Execution
  const execRow = `| Test Execution | QA Agent | ${passRate === 100 ? '✅' : passRate >= 70 ? '⚠️' : '❌'} ${passRate}% pass | ${runDate} |`;
  if (dash.includes('| Test Execution |')) {
    dash = dash.replace(/\| Test Execution \|.*\|.*\|.*\|/, execRow);
  }

  fs.writeFileSync(DASHBOARD_FILE, dash, 'utf8');
  console.log(`Dashboard updated → manual-qa-repository/DASHBOARD.md`);
}
