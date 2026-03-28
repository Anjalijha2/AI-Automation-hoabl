/**
 * ============================================================
 * AGENT 7 — SPRINT & KNOWLEDGE MANAGER
 * ============================================================
 * Purpose : Track project progress, maintain sprint logs,
 *           task tracker, changelog, test coverage report,
 *           and generate sprint plans from BRD files.
 *
 * Responsibilities:
 *   - Generate/update docs/project-memory/SPRINT_LOG.md
 *   - Generate/update docs/project-memory/TASK_TRACKER.md
 *   - Append new entries to docs/project-memory/CHANGELOG.md
 *   - Generate/update docs/project-memory/TEST_COVERAGE.md
 *   - Read BRD files from brd/ and generate SPRINT_PLAN_*.md
 *     with Epics, Features, User Stories, and per-agent task breakdown
 *
 * Outputs:
 *   docs/project-memory/TEST_COVERAGE.md
 *   docs/project-memory/SPRINT_LOG.md
 *   docs/project-memory/TASK_TRACKER.md
 *   docs/project-memory/CHANGELOG.md
 *   docs/project-memory/SPRINT_PLAN_<BRD_NAME>.md  (plan-brd action)
 *
 * Run:
 *   node src/test/agents/sprint-manager.js status     → show coverage
 *   node src/test/agents/sprint-manager.js update     → update all docs
 *   node src/test/agents/sprint-manager.js plan-brd   → generate sprint plan from brd/*.md
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

const PROJECT_MEMORY_DIR = path.join(process.cwd(), 'docs', 'project-memory');
const BRD_DIR            = path.join(process.cwd(), 'brd');

const COVERAGE_FILE  = path.join(PROJECT_MEMORY_DIR, 'TEST_COVERAGE.md');
const SPRINT_FILE    = path.join(PROJECT_MEMORY_DIR, 'SPRINT_LOG.md');
const TASK_FILE      = path.join(PROJECT_MEMORY_DIR, 'TASK_TRACKER.md');
const CHANGELOG_FILE = path.join(PROJECT_MEMORY_DIR, 'CHANGELOG.md');

const ACTION = process.argv[2] || 'status';

// ── Coverage Definition ─────────────────────────────────────────────────────

const MODULE_COVERAGE = [
  { feature: 'Login',            totalTC: 18, automated: 18, specFile: 'login.spec.js' },
  { feature: 'Customers',        totalTC: 6,  automated: 6,  specFile: 'customers.spec.js' },
  { feature: 'Configuration',    totalTC: 0,  automated: 0,  specFile: '—' },
  { feature: 'Allocation',       totalTC: 0,  automated: 0,  specFile: '—' },
  { feature: 'Towers',           totalTC: 0,  automated: 0,  specFile: '—' },
  { feature: 'Channel Partners', totalTC: 0,  automated: 0,  specFile: '—' },
  { feature: 'JBP Management',   totalTC: 0,  automated: 0,  specFile: '—' },
];

// ── Generators ───────────────────────────────────────────────────────────────

function generateCoverageReport() {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const totalTC   = MODULE_COVERAGE.reduce((s, m) => s + m.totalTC, 0);
  const totalAuto = MODULE_COVERAGE.reduce((s, m) => s + m.automated, 0);
  const pending   = MODULE_COVERAGE.filter(m => m.totalTC === 0).length;

  let md = `# Test Coverage Report\n\n`;
  md += `**Last updated:** ${timestamp}  \n`;
  md += `**Maintained by:** Agent 7 — Sprint & Knowledge Manager\n\n`;
  md += `---\n\n`;
  md += `| Feature | Test Cases | Automated | Spec File | Status |\n`;
  md += `|---------|------------|-----------|-----------|--------|\n`;

  for (const m of MODULE_COVERAGE) {
    const status = m.totalTC === 0
      ? '⏳ Not Started'
      : m.automated === m.totalTC
      ? '✅ Full Coverage'
      : '🔶 Partial';
    md += `| ${m.feature} | ${m.totalTC || '—'} | ${m.automated || '—'} | \`${m.specFile}\` | ${status} |\n`;
  }

  md += `\n---\n\n`;
  md += `**Summary:** ${totalTC} total test cases | ${totalAuto} automated | ${pending} modules pending\n`;
  return md;
}

function generateSprintLog() {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return `# Sprint Log

**Last updated:** ${timestamp}

---

## Sprint 1 — Framework Setup & Core Module Coverage

**Goal:** Establish QA framework structure and automate Login + Customers modules.

**Status:** ✅ Complete

### Completed
- [x] Setup Playwright + JavaScript project structure
- [x] Configured \`resources/config/playwright.config.js\` with projects (auth-setup, login-tests, smoke, regression, chromium, firefox, webkit)
- [x] Created Auth Setup (\`src/test/automation/auth.setup.js\`) for session caching
- [x] Implemented Login Page Object (\`src/main/js/pages/login.page.js\`)
- [x] Implemented 18 Login test cases (Positive, Negative, Functional, Security)
- [x] Implemented Customers Page Object (\`src/main/js/pages/customers.page.js\`)
- [x] Implemented 6 Customers test cases
- [x] Created all 8 AI Agent scripts (\`src/test/agents/\` folder)
- [x] Created manual test case files (\`manual-test-cases/\`)
- [x] Created page documentation (\`docs/pages/\`)
- [x] Created bug tracker (\`bugs/BUG_TRACKER.md\`)

---

## Sprint 2 — Module Expansion (Upcoming)

**Goal:** Automate remaining modules.

**Planned**
- [ ] Config module
- [ ] Allocation module
- [ ] Towers module
- [ ] Channel Partners module
- [ ] JBP Management module
`;
}

function generateTaskTracker() {
  return `# Task Tracker

**Maintained by:** Agent 7 — Sprint & Knowledge Manager

---

## ✅ Completed Tasks

| Task | Module | Agent | Status |
|------|--------|-------|--------|
| Project setup | All | Setup | ✅ Done |
| Auth session caching | Login | Agent 3 | ✅ Done |
| Login automation (18 tests) | Login | Agent 3 | ✅ Done |
| Customers automation (6 tests) | Customers | Agent 3 | ✅ Done |
| Page Documentation | Login, Customers | Agent 1 | ✅ Done |
| Manual Test Cases | Login, Customers | Agent 2 | ✅ Done |
| All 8 Agent scripts created | Framework | Agent 7 | ✅ Done |

---

## ⏳ Pending Tasks

| Task | Module | Priority | Agent |
|------|--------|----------|-------|
| Automate Config module | Config | P1 | Agent 3 |
| Automate Allocation module | Allocation | P1 | Agent 3 |
| Automate Towers module | Towers | P2 | Agent 3 |
| Automate Channel Partners | Channel Partners | P2 | Agent 3 |
| Automate JBP Management | JBP Mgmt | P3 | Agent 3 |
| Integration / Regression Suite | All | P1 | Agent 4 |
`;
}

/**
 * Appends a new dated entry to CHANGELOG.md.
 * Skips if today's entry already exists.
 */
function appendChangelog(newEntry) {
  let content = fs.existsSync(CHANGELOG_FILE)
    ? fs.readFileSync(CHANGELOG_FILE, 'utf-8')
    : `# Changelog\n\nAll notable changes to the XR Portal QA Framework are documented here.\n\n---\n\n`;

  const today = new Date().toISOString().split('T')[0];
  if (content.includes(`## [${today}]`)) {
    console.log(`   ℹ️  Changelog entry for ${today} already exists. Skipping.`);
    return;
  }

  // Insert after the --- separator, or append at end
  const separatorIdx = content.indexOf('\n---\n');
  if (separatorIdx !== -1) {
    content = content.slice(0, separatorIdx + 5) + '\n' + newEntry + '\n' + content.slice(separatorIdx + 5);
  } else {
    content += '\n' + newEntry;
  }

  fs.writeFileSync(CHANGELOG_FILE, content);
  console.log(`   ✅ Changelog updated: ${CHANGELOG_FILE}`);
}

function buildChangelogEntry() {
  const date = new Date().toISOString().split('T')[0];
  return `## [${date}] — Sprint Manager Update

### Updated
- Test coverage report refreshed
- Sprint log and task tracker regenerated
`;
}

// ── BRD → Sprint Planning ────────────────────────────────────────────────────

function parseBRD(content) {
  const lines = content.split('\n');
  const epics = [];
  let currentEpic = null;
  let currentFeature = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      currentEpic = { name: trimmed.replace(/^## /, ''), description: '', features: [] };
      epics.push(currentEpic);
      currentFeature = null;
    } else if (trimmed.startsWith('### ') && currentEpic) {
      currentFeature = { name: trimmed.replace(/^### /, ''), stories: [] };
      currentEpic.features.push(currentFeature);
    } else if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && currentFeature) {
      currentFeature.stories.push({ text: trimmed.replace(/^[-*] /, '') });
    } else if (currentEpic && !currentFeature && !trimmed.startsWith('#')) {
      currentEpic.description += (currentEpic.description ? ' ' : '') + trimmed;
    }
  }

  return epics;
}

function generateSprintPlanDoc(epics, brdFileName) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const totalFeatures = epics.reduce((s, e) => s + e.features.length, 0);

  let md = `# Sprint Plan\n\n`;
  md += `**Source BRD:** \`brd/${brdFileName}\`  \n`;
  md += `**Generated:** ${timestamp}  \n`;
  md += `**Status:** Draft — Pending Review\n\n`;
  md += `---\n\n`;

  if (epics.length === 0) {
    md += `_No epics found. Ensure your BRD uses \`## \` for Epics and \`### \` for Features._\n`;
    return md;
  }

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Total Epics | ${epics.length} |\n`;
  md += `| Total Features | ${totalFeatures} |\n`;
  md += `| Estimated Sprints | ${Math.ceil(totalFeatures / 2)} |\n\n`;
  md += `---\n\n`;

  epics.forEach((epic, eIdx) => {
    md += `## Epic ${eIdx + 1}: ${epic.name}\n\n`;
    if (epic.description) md += `> ${epic.description}\n\n`;

    if (epic.features.length === 0) {
      md += `_No features defined for this epic._\n\n`;
      return;
    }

    epic.features.forEach((feature, fIdx) => {
      md += `### Feature E${eIdx + 1}.F${fIdx + 1}: ${feature.name}\n\n`;

      if (feature.stories.length > 0) {
        md += `**User Stories / Acceptance Criteria:**\n\n`;
        feature.stories.forEach(s => { md += `- [ ] ${s.text}\n`; });
        md += '\n';
      }

      md += `**Agent Task Breakdown:**\n\n`;
      md += `| Agent | Task | Status |\n|-------|------|--------|\n`;
      md += `| Agent 0 — Discovery | Crawl and map UI elements for "${feature.name}" | ⏳ Pending |\n`;
      md += `| Agent 1 — Page Docs | Document selectors and workflows for "${feature.name}" | ⏳ Pending |\n`;
      md += `| Agent 2 — Test Cases | Write manual test cases for "${feature.name}" | ⏳ Pending |\n`;
      md += `| Agent 3 — Automation | Create Playwright spec for "${feature.name}" | ⏳ Pending |\n`;
      md += `| Agent 4 — Execution | Execute and validate all tests | ⏳ Pending |\n`;
      md += `| Agent 5 — Defect | Log any failures found | ⏳ Pending |\n`;
      md += `| Agent 6 — Healing | Fix broken selectors after execution | ⏳ Pending |\n`;
      md += `| Agent 7 — Sprint Mgr | Update sprint tracking & changelog | ⏳ Pending |\n\n`;
    });
  });

  return md;
}

function planFromBRD() {
  console.log('📋 [Agent 7] BRD → SPRINT PLANNING\n');

  if (!fs.existsSync(BRD_DIR)) {
    fs.mkdirSync(BRD_DIR, { recursive: true });
    console.log('   ℹ️  Created brd/ folder. Add your BRD markdown files and re-run.');
    return;
  }

  const brdFiles = fs.readdirSync(BRD_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('TEMPLATE'));

  if (brdFiles.length === 0) {
    console.log('   ⚠️  No BRD files found in brd/ (TEMPLATE.md is excluded).');
    console.log('   ℹ️  Add a .md file to brd/ following the TEMPLATE.md format.');
    return;
  }

  fs.mkdirSync(PROJECT_MEMORY_DIR, { recursive: true });

  for (const brdFile of brdFiles) {
    const content = fs.readFileSync(path.join(BRD_DIR, brdFile), 'utf-8');
    const epics   = parseBRD(content);
    const plan    = generateSprintPlanDoc(epics, brdFile);

    const baseName = brdFile.replace('.md', '').toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const outFile  = path.join(PROJECT_MEMORY_DIR, `SPRINT_PLAN_${baseName}.md`);

    fs.writeFileSync(outFile, plan);
    console.log(`   ✅ Sprint plan: ${outFile}`);
    console.log(`      Epics: ${epics.length} | Features: ${epics.reduce((s, e) => s + e.features.length, 0)}`);
  }

  console.log('\n✅ [Agent 7] BRD PLANNING COMPLETE');
}

// ── Actions ──────────────────────────────────────────────────────────────────

function showStatus() {
  console.log('\n' + generateCoverageReport());
}

function updateAll() {
  fs.mkdirSync(PROJECT_MEMORY_DIR, { recursive: true });

  fs.writeFileSync(COVERAGE_FILE, generateCoverageReport());
  console.log(`   ✅ Updated: ${COVERAGE_FILE}`);

  fs.writeFileSync(SPRINT_FILE, generateSprintLog());
  console.log(`   ✅ Updated: ${SPRINT_FILE}`);

  fs.writeFileSync(TASK_FILE, generateTaskTracker());
  console.log(`   ✅ Updated: ${TASK_FILE}`);

  appendChangelog(buildChangelogEntry());

  console.log('\n✅ [Agent 7] SPRINT MANAGER UPDATE COMPLETE');
}

function run() {
  console.log('📋 [Agent 7] SPRINT & KNOWLEDGE MANAGER\n');
  if (ACTION === 'status')   showStatus();
  else if (ACTION === 'plan-brd') planFromBRD();
  else updateAll();
}

run();
