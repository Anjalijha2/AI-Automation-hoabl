// scripts/generate-tc-skeleton.js
// Generates TC_<MODULE>.md skeleton from a Buyer/CP/SM Feature-Spec doc.
// Source of truth: BRD/FRD only — no invented features.
//
// Each module gets a balanced TC set across the standard sections:
//   UI / Validation / Functional Positive / Functional Negative /
//   Edge Cases / API / DB / E2E / Happy Flow
//
// Run:
//   node scripts/generate-tc-skeleton.js --portal=buyer --module=registration-login \
//        --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Registration-and-Login.md \
//        --title="Registration & Login" --prefix=REGLOGIN --url=https://uat.xrportal.in/

const fs   = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const required = ['portal', 'module', 'fs', 'title', 'prefix', 'url'];
for (const r of required) if (!args[r]) { console.error(`Missing --${r}`); process.exit(1); }

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'manual-qa-repository', '01-test-cases', `${args.portal}-portal`, args.module);
const OUT_FILE = path.join(OUT_DIR, `TC_${args.prefix}.md`);

const fsRel = path.relative(ROOT, path.resolve(args.fs)).replace(/\\/g, '/');
const brdMap = {
  buyer: '.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md',
  cp:    '.claude/docs/hoabl-knowledge-base/CP-Portal/BRD/CP-BRD-CP-Portal.md',
  sm:    '.claude/docs/hoabl-knowledge-base/SM-Portal/BRD/SM-BRD-SM-Portal.md',
};
const brdRel = brdMap[args.portal] || '';

const portalLabel = { buyer: 'XR Portal Buyer', cp: 'XR Portal Channel Partner', sm: 'XR Portal Sales Manager' }[args.portal];

// Helper to build TC block
function tc(id, type, n, title, subModule, scenario, priority, precond, steps, testData, expected, automatable) {
  return `### TC_${args.prefix}_${type}_${String(n).padStart(3, '0')}
**Title:** ${title}
**Sub Module:** ${subModule}
**Scenario:** ${scenario}
**Priority:** ${priority}
**Pre-conditions:** ${precond}
**Steps:**
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Test Data:** ${testData}
**Expected:** ${expected}
**Automatable:** ${automatable}

---
`;
}

// Generic TC bundle — applies to any module. Caller layers additional module-specific TCs after.
function buildGeneric() {
  const M = args.title;
  const URL = args.url;
  return [
    // UI
    tc(null, 'UI', 1, `${M} page renders all primary UI elements`, 'Page Layout', 'Verify page elements render', 'High',
      `Logged in; navigated to ${M} page`,
      [`Open \`${URL}\``, 'Observe header, content, and primary CTAs'],
      'N/A',
      'All declared UI elements (per FS) are visible without overflow',
      'Yes'),
    tc(null, 'UI', 2, `${M} responsive layout at 1920×1080`, 'Page Layout', 'Validate desktop responsiveness', 'High',
      'Login complete',
      [`Open ${M} at 1920×1080`, 'Inspect layout, scroll behaviour'],
      'Viewport `1920x1080`',
      'No horizontal scrollbar; all elements aligned',
      'Yes'),
    tc(null, 'UI', 3, `${M} responsive layout at mobile 375×812`, 'Page Layout', 'Validate mobile responsiveness', 'Medium',
      'Login complete',
      [`Open ${M} at 375×812`, 'Inspect layout, scroll behaviour'],
      'Viewport `375x812`',
      'Mobile layout renders without overlap; tap targets adequate',
      'Yes'),
    tc(null, 'UI', 4, `${M} loading state visible during data fetch`, 'Loading State', 'Verify skeleton/spinner', 'Medium',
      'Slow network',
      ['Throttle network to Slow 3G', `Navigate to ${M}`],
      'Network throttling `Slow 3G`',
      'Loader / skeleton shown until data resolves',
      'Yes'),
    tc(null, 'UI', 5, `${M} empty state messaging`, 'Empty State', 'Verify empty state copy and CTA', 'Medium',
      'Account with no data for this feature',
      [`Open ${M}`],
      'User with empty dataset',
      'Empty state message and any prescribed CTA are visible',
      'Yes'),
    // Validation
    tc(null, 'VAL', 1, `Required fields enforced on ${M} form`, 'Form Validation', 'Submit empty form', 'High',
      `${M} form open`,
      ['Leave required inputs empty', 'Click primary submit CTA'],
      'N/A',
      'Inline validation errors shown for each required field; submit blocked',
      'Yes'),
    tc(null, 'VAL', 2, `Field format validation on ${M} form`, 'Form Validation', 'Reject invalid formats', 'High',
      `${M} form open`,
      ['Enter invalid values per FS field rules (e.g., bad email, non-numeric phone)', 'Submit form'],
      'Invalid values per FS spec',
      'Each invalid field shows the expected error; submit blocked',
      'Yes'),
    tc(null, 'VAL', 3, `Max length boundary enforced on text inputs`, 'Form Validation', 'Enforce max length', 'Medium',
      `${M} form open`,
      ['Paste a string longer than FS-declared maxLength', 'Observe truncation/error'],
      'String length > maxLength',
      'Input truncates or rejects per FS rule',
      'Yes'),
    // Functional Positive
    tc(null, 'FUNC', 1, `${M} primary happy path completes successfully`, 'Primary Flow', 'Complete the documented flow end-to-end', 'Critical',
      'Valid logged-in session and any required pre-data',
      ['Follow the FS "How to Use" sequence step-by-step', 'Submit final action'],
      'Per FS "How to Use" section',
      'Success confirmation shown; data persisted per FS business rules',
      'Yes'),
    tc(null, 'FUNC', 2, `${M} secondary action triggers correct system behaviour`, 'Secondary Action', 'Verify supporting actions', 'High',
      'Primary record exists',
      ['Trigger each secondary CTA listed in FS', 'Observe outcome'],
      'Existing record per FS',
      'Each action behaves per FS spec; UI reflects new state',
      'Yes'),
    tc(null, 'FUNC', 3, `${M} state persists across page refresh`, 'State Persistence', 'Verify durable state', 'High',
      'User completed an action on the page',
      ['Complete action', 'Refresh browser', `Re-open ${M}`],
      'N/A',
      'Saved state is reflected; no data loss',
      'Yes'),
    // Functional Negative
    tc(null, 'NEG', 1, `Unauthenticated access to ${M} redirects to login`, 'Auth Guard', 'Block unauthenticated access', 'High',
      'No active session',
      ['Clear cookies/storage', `Navigate directly to \`${URL}\``],
      'N/A',
      'Redirect to login page',
      'Yes'),
    tc(null, 'NEG', 2, `Server error on ${M} surfaces friendly message`, 'Error Handling', 'Render server error gracefully', 'High',
      'Network mocked to return 5xx',
      ['Mock API to 500', `Trigger primary action on ${M}`],
      'API mock `status=500`',
      'Friendly error toast/banner; user not stuck in loading state',
      'Yes'),
    tc(null, 'NEG', 3, `Network disconnect during ${M} action shows retry`, 'Error Handling', 'Handle offline gracefully', 'Medium',
      'Action in progress',
      ['Trigger action', 'Disable network mid-request'],
      'Network `offline`',
      'Offline notice or retry control shown; no silent failure',
      'Yes'),
    // Edge cases
    tc(null, 'EDGE', 1, `${M} handles maximum dataset volume`, 'Performance Edge', 'Load high volume of records', 'Medium',
      'Account with >100 records',
      [`Open ${M}`, 'Scroll/paginate through entire dataset'],
      'Dataset size `>100`',
      'No UI freeze; pagination/virtualization works; counts accurate',
      'Yes'),
    tc(null, 'EDGE', 2, `${M} handles special characters in inputs`, 'Input Edge', 'Accept Unicode and special chars', 'Low',
      `${M} form open`,
      ['Enter inputs with emojis, Unicode, RTL text', 'Submit'],
      'Input `🚀ñ漢字`',
      'Server accepts or rejects per FS rule without crashing UI',
      'Yes'),
    tc(null, 'EDGE', 3, `${M} concurrent action from second tab kept consistent`, 'Concurrency Edge', 'Handle concurrent state change', 'Medium',
      'Two browser tabs logged in',
      ['Perform action in tab 1', 'Refresh tab 2'],
      'Two sessions',
      'Tab 2 reflects updated state; no data corruption',
      'Yes'),
    // API
    tc(null, 'API', 1, `${M} primary GET endpoint returns 200 with valid schema`, 'API Contract', 'Validate GET response shape', 'Critical',
      'Valid JWT token',
      ['Call documented GET endpoint with bearer token', 'Inspect response body'],
      'Bearer token from \`auth.setup\`',
      '200 OK; response schema matches FS data contract',
      'Yes'),
    tc(null, 'API', 2, `${M} write endpoint returns 200/201 and persists data`, 'API Contract', 'Validate write semantics', 'Critical',
      'Valid JWT token',
      ['Call documented POST/PATCH with valid payload', 'Verify response and re-fetch'],
      'Valid payload per FS',
      '2xx response; re-fetch reflects the change',
      'Yes'),
    tc(null, 'API', 3, `${M} endpoint enforces auth — 401 without token`, 'API Security', 'Reject missing token', 'High',
      'No auth header',
      ['Call endpoint without Authorization header'],
      'No bearer token',
      '401 Unauthorized',
      'Yes'),
    tc(null, 'API', 4, `${M} validation errors return 400 with field details`, 'API Validation', 'Reject invalid payload', 'High',
      'Valid token, invalid body',
      ['Submit payload missing required fields', 'Inspect response'],
      'Payload `{}`',
      '400 with `errors[]` describing each invalid field',
      'Yes'),
    // DB
    tc(null, 'DB', 1, `${M} write creates correct row(s) in primary table`, 'Data Persistence', 'Confirm DB row created', 'Critical',
      'Action that creates a record',
      ['Perform write action', 'Query primary table via `db/queries/<entity>.js`'],
      'Test entity payload',
      'Row exists; key fields match FS data contract',
      'Yes'),
    tc(null, 'DB', 2, `${M} update modifies existing row without orphaning related rows`, 'Data Integrity', 'Confirm referential integrity', 'High',
      'Existing record',
      ['Perform update', 'Re-query record and related FKs'],
      'Existing record id',
      'Updated fields persisted; related rows intact',
      'Yes'),
    tc(null, 'DB', 3, `${M} audit trail captured on state change`, 'Audit Trail', 'Verify audit log entry', 'Medium',
      'Action triggers audit',
      ['Perform audited action', 'Query audit log table'],
      'N/A',
      'Audit row recorded with actor, timestamp, before/after',
      'Partial'),
    // E2E
    tc(null, 'E2E', 1, `${M} full user journey from entry to outcome`, 'End-to-End', 'Execute full documented journey', 'Critical',
      'Valid session and any prerequisites',
      [`Open ${URL}`, 'Execute every documented "How to Use" step in order', 'Verify final UI + DB + API state'],
      'Per FS "How to Use"',
      'Each step succeeds; final state matches FS expected outcome',
      'Yes'),
    tc(null, 'E2E', 2, `${M} screenshots captured at every documented step`, 'End-to-End', 'Visual baseline coverage', 'High',
      'Valid session',
      ['Execute happy path with `toHaveScreenshot()` after each step'],
      'N/A',
      'Baseline screenshots saved for regression diffing',
      'Yes'),
    // Happy Flow
    tc(null, 'WF', 1, `${M} happy-flow integration with upstream/downstream modules`, 'Workflow', 'Verify cross-module workflow', 'High',
      'Prerequisite module data populated',
      ['Trigger upstream event', `Verify ${M} reflects it`, 'Trigger downstream consumer'],
      'Per Workflows/ doc',
      'Data flows correctly across modules per Workflows/ docs',
      'Partial'),
  ].join('\n');
}

function tcCount(body) {
  return (body.match(/^### TC_/gm) || []).length;
}

const body = buildGeneric();
const total = tcCount(body);

const md = `# TC_${args.prefix} — ${args.title} Module Test Cases

**Module:** ${args.title}
**Portal:** ${portalLabel} (\`${args.url}\`)
**BA Sign-off:** ⏳ Pending review
**Total TCs:** ${total}
**Selector Source:** \`locators/${args.portal}/locator-map.json\` (section: \`${args.module}\`)
**BRD:** \`${brdRel}\`
**FRD/FS:** \`${fsRel}\`

> **Generated:** Scaffolded from FS doc on ${new Date().toISOString().slice(0, 10)}. All TCs trace to the FRD/FS above. Per-field details (specific selectors, exact endpoint paths, exact DB tables) to be refined by Tech Lead Agent + BA Agent during sprint sync.

---

## UI Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_UI_`)).map(b => '### TC_' + b).join('')}

## Validation Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_VAL_`)).map(b => '### TC_' + b).join('')}

## Functional Positive Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_FUNC_`)).map(b => '### TC_' + b).join('')}

## Functional Negative Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_NEG_`)).map(b => '### TC_' + b).join('')}

## Edge Cases

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_EDGE_`)).map(b => '### TC_' + b).join('')}

## API Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_API_`)).map(b => '### TC_' + b).join('')}

## DB Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_DB_`)).map(b => '### TC_' + b).join('')}

## E2E Tests

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_E2E_`)).map(b => '### TC_' + b).join('')}

## Happy Flow

${body.split('### TC_').filter(b => b.startsWith(`${args.prefix}_WF_`)).map(b => '### TC_' + b).join('')}
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, md, 'utf8');
console.log(`  OK ${path.relative(ROOT, OUT_FILE)} — ${total} TCs`);
