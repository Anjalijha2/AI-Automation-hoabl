/**
 * ============================================================
 * AGENT 5 — DEFECT TRACKING AGENT
 * ============================================================
 * Purpose : Parse Playwright results and log bugs in BUG_TRACKER.md
 *
 * Responsibilities:
 *   - Read reports/results.json
 *   - Detect test failures
 *   - Create structured bug entries (card format)
 *   - Avoid duplicate bug entries (deduplicates by TC_ID)
 *   - Overwrite BUG_TRACKER.md with clean, consistent output
 *
 * Bug Format (card per bug):
 *   ## BUG_001
 *   | Field | Value |
 *   ...
 *
 * Outputs:
 *   bugs/BUG_TRACKER.md
 *
 * Run:
 *   node src/test/agents/defect-agent.js
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(process.cwd(), 'reports', 'results.json');
const BUG_FILE     = path.join(process.cwd(), 'bugs', 'BUG_TRACKER.md');

function ensureDirs() {
  fs.mkdirSync(path.dirname(BUG_FILE), { recursive: true });
}

function severityFromTitle(title) {
  const t = title.toLowerCase();
  if (t.includes('login') || t.includes('auth') || t.includes('security')) return 'Critical';
  if (t.includes('pos_') || t.includes('tc_cust_001'))                      return 'High';
  if (t.includes('neg_') || t.includes('func_'))                            return 'Medium';
  return 'Low';
}

/**
 * Read existing BUG_TRACKER.md and extract current bug cards.
 * Ignores any legacy placeholder table format (lines with '| - |').
 * Returns: { bugs as formatted card strings, set of existing TC IDs }
 */
function readExistingBugs() {
  if (!fs.existsSync(BUG_FILE)) {
    return { cards: '', existingTcIds: new Set(), bugCount: 0 };
  }

  const content = fs.readFileSync(BUG_FILE, 'utf-8');

  // No real bug entries yet (legacy placeholder table or empty)
  if (!content.includes('## BUG_')) {
    return { cards: '', existingTcIds: new Set(), bugCount: 0 };
  }

  // Extract everything from the first ## BUG_ card onwards
  const firstCardIdx = content.indexOf('\n## BUG_');
  const cardsSection = firstCardIdx !== -1 ? content.slice(firstCardIdx + 1) : '';

  // Collect TC IDs already tracked to avoid duplicates
  const tcIdMatches = content.match(/\*\*TC_ID\*\*\s+\|\s+(TC_[A-Z_0-9]+)/g) || [];
  const existingTcIds = new Set(tcIdMatches.map(m => m.replace(/.*\|\s+/, '').trim()));

  const bugCount = (content.match(/^## BUG_/gm) || []).length;

  return { cards: cardsSection, existingTcIds, bugCount };
}

function formatBugCard(bug) {
  let card = `## ${bug.bugId}\n\n`;
  card += `| Field              | Value |\n`;
  card += `|--------------------|-------|\n`;
  card += `| **TC_ID**          | ${bug.tcId} |\n`;
  card += `| **Module**         | ${bug.module} |\n`;
  card += `| **Severity**       | ${bug.severity} |\n`;
  card += `| **Status**         | ${bug.status} |\n`;
  card += `| **Steps**          | ${bug.steps} |\n`;
  card += `| **Expected**       | ${bug.expected} |\n`;
  card += `| **Actual**         | ${bug.actual} |\n\n`;
  card += `---\n\n`;
  return card;
}

/**
 * Recursively walk the Playwright results JSON suite tree.
 * Playwright nests suites: file → describe → spec.
 * Top-level suite.specs may be empty when tests are inside describe blocks.
 */
function collectFailures(suites, parentTitle, existingTcIds, bugs, counter) {
  for (const suite of suites || []) {
    const suiteTitle = suite.title || parentTitle;

    // Process specs at this level
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.[0];
        if (result?.status !== 'failed') continue;

        const tcIdMatch = spec.title?.match(/TC_[A-Z_0-9]+/);
        const tcId      = tcIdMatch ? tcIdMatch[0] : 'TC_UNKNOWN';
        if (existingTcIds.has(tcId)) continue;

        // Derive module name from suite title (e.g. "📊 CUSTOMERS — Module Tests" → "Customers")
        const rawModule = suiteTitle.split('—')[0].replace(/[^a-zA-Z\s]/g, '').trim();
        const module    = rawModule || 'Unknown';
        const bugId     = `BUG_${String(counter.value).padStart(3, '0')}`;

        bugs.push({
          bugId,
          tcId,
          module,
          steps:    `See manual-test-cases/TC_${module.toUpperCase().replace(/\s+/g, '_')}.md → ${tcId}`,
          expected: `Test "${spec.title}" should PASS`,
          actual:   result.error?.message?.replace(/\n/g, ' ').slice(0, 250) || 'Test failed with no error message',
          severity: severityFromTitle(spec.title),
          status:   'Open',
        });

        existingTcIds.add(tcId); // prevent duplicates within same run
        counter.value++;
      }
    }

    // Recurse into nested suites
    if (suite.suites?.length) {
      collectFailures(suite.suites, suiteTitle, existingTcIds, bugs, counter);
    }
  }
}

function run() {
  ensureDirs();
  console.log('🐛 [Agent 5] DEFECT TRACKING AGENT starting...\n');

  if (!fs.existsSync(RESULTS_FILE)) {
    console.log('   ⚠️  No results.json found at reports/results.json');
    console.log('   ℹ️  Run tests first: npm run test  OR  npm run execute');
    return;
  }

  const raw = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  const { cards: existingCards, existingTcIds, bugCount } = readExistingBugs();

  const newBugs = [];
  const counter = { value: bugCount + 1 };

  collectFailures(raw.suites || [], '', existingTcIds, newBugs, counter);

  // ── Write clean BUG_TRACKER.md ───────────────────────────────────────────
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const totalBugs = bugCount + newBugs.length;

  let output = `# Defect Tracker\n\n`;
  output += `**Last updated:** ${timestamp}  \n`;
  output += `**Maintained by:** Agent 5 — Defect Tracking Agent  \n`;
  output += `**Total Open Bugs:** ${totalBugs}\n\n`;
  output += `---\n\n`;

  if (totalBugs === 0) {
    output += `_No bugs logged. All tests are passing._\n`;
  } else {
    output += existingCards;
    for (const bug of newBugs) {
      output += formatBugCard(bug);
    }
  }

  fs.writeFileSync(BUG_FILE, output);

  if (newBugs.length === 0 && bugCount === 0) {
    console.log('   ✅ No failures detected. All tests pass!');
  } else if (newBugs.length === 0) {
    console.log(`   ℹ️  No new failures. ${bugCount} existing bug(s) retained.`);
  } else {
    newBugs.forEach(b => console.log(`   🐛 Logged: ${b.bugId} (${b.tcId}) — ${b.severity}`));
    console.log(`\n✅ [Agent 5] ${newBugs.length} new bug(s) logged | Total: ${totalBugs}`);
  }

  console.log(`   📄 ${BUG_FILE}`);
}

run();
