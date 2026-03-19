/**
 * ============================================================
 * AGENT 1 — PAGE DOCUMENTATION AGENT
 * ============================================================
 * Purpose : Create structured page memory documents (Markdown)
 *           so all other agents have a shared reference.
 *
 * Inputs  : discovery/dom-selectors.json
 *           discovery/portal-map.json
 *
 * Outputs : docs/pages/<MODULE>.md
 *           Each file contains:
 *             - Page description
 *             - Element selectors
 *             - Workflow steps
 *             - Execution commands
 *             - Known behaviors
 *
 * Run:
 *   npx ts-node agents/agent1-page-docs.ts
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';

const SELECTORS_FILE = path.join(process.cwd(), 'discovery', 'dom-selectors.json');
const PORTAL_MAP_FILE = path.join(process.cwd(), 'discovery', 'portal-map.json');
const DOCS_DIR = path.join(process.cwd(), 'docs', 'pages');

// Static page documentation templates for known modules.
// When Agent 0 discovers a new module, extend this map.
const PAGE_DOCS: Record<string, string> = {

  'Login': `
# LOGIN PAGE

## Description
Entry point of the XR Portal Admin application.
Uses a 2-step Mobile OTP authentication flow (no password).

## URL
https://uat-web.xrportal.in/admin

## Element Selectors

| Element            | Selector                                           |
|--------------------|----------------------------------------------------|
| Mobile Input       | \`input[placeholder="Enter Mobile Number"]\`         |
| Send OTP Button    | \`button:has-text("Send OTP")\`                      |
| OTP Box 1          | \`input[aria-label="OTP Input 1"]\`                  |
| OTP Box 2          | \`input[aria-label="OTP Input 2"]\`                  |
| OTP Box 3          | \`input[aria-label="OTP Input 3"]\`                  |
| OTP Box 4          | \`input[aria-label="OTP Input 4"]\`                  |
| OTP Box 5          | \`input[aria-label="OTP Input 5"]\`                  |
| OTP Box 6          | \`input[aria-label="OTP Input 6"]\`                  |
| Submit OTP Button  | \`button:has-text("Submit OTP")\`                    |
| Re-Send OTP        | \`text=Re-Send OTP\`                                 |
| Back Button        | \`button.reset-btn.back-to-mobile\`                  |
| OTP Timer          | \`text=/\\d+s/\`                                      |

## Workflow Steps

1. Navigate to https://uat-web.xrportal.in/admin
2. Enter mobile number in the mobile input field
3. Click "Send OTP" button
4. Wait for OTP screen to appear (OTP Input 1 visible)
5. Enter 6-digit OTP across individual input boxes
6. Click "Submit OTP"
7. Verify redirect to /admin/customers

## Page Object File
\`automation/pages/login.page.ts\`

## Automation Test File
\`automation/tests/login.spec.ts\`

## Execution Commands

\`\`\`bash
# Run all login tests
npx playwright test login.spec.ts --headed --workers=1

# Run only positive
npx playwright test login.spec.ts -g "POSITIVE" --headed --workers=1

# Run only negative
npx playwright test login.spec.ts -g "NEGATIVE" --headed --workers=1
\`\`\`

## Known Behaviors

- OTP boxes auto-advance focus between digits
- Timer counts down (e.g. "55s") before Resend OTP becomes clickable
- Mobile field is numeric-only (letters and special characters are blocked)
- Back button returns to mobile entry screen
`,

  'Customers': `
# CUSTOMERS PAGE

## Description
Main dashboard after login showing customer registrations, summary stat cards, and a data table of all registration records. Includes workflows for checking KPIs, Home Loan Approvals, Cancellation, Filtering, and Downloading.

## URL
https://uat-web.xrportal.in/admin/customers

## Requires Auth
Yes. Session must be initialized via \`auth.setup.ts\`.

## Element Selectors
Loaded from \`docs/selectors/customers.json\`.
Includes new locators for: Allocation Status, Process Status, Cancellation Modals, and Home Loan Modals.

## Workflows

### 1. KPI Verification
1.  Verify table count matches 'Registered' KPI when: Booked Offline + Booked Online + Registered + Inactive are filtered.
2.  Verify table count matches 'Inactive' KPI when 'Inactive' is filtered.
3.  Verify table count matches 'Cancelled' KPI when 'Cancelled' is filtered.
4.  Verify table count matches 'KYC Pending' KPI when 'Booked' + 'KYC Pending' are filtered.
5.  Verify table count matches 'Confirmed' KPI when 'Booked' + 'KYC Completed' are filtered.

### 2. Cancel Registration
1. Find a 'Registered' record. Click Delete (trash) icon.
2. Confirm Refund modal appears validating Unit & Amount ₹999.
3. Click 'Cancel Registration' red button.
4. Verify success toast and status change to Cancelled.

### 3. Home Loan Approval
1. Click 3-dot menu and select 'Home Loan Approval'.
2. Modal shows Registration Number and Apartment Type.
3. Toggle 'Enable Home Loan' and submit.

### 4. Filtering & Pagination
1. Filter via Status dropdowns (Allocation / Process).
2. Filter via Inline Search Boxes (Registration Details, Growth Partner HV Code, Confirmation Number, Alloted Unit).
3. Reset Filters.
4. Verify Pagination sizes (10, 20, 50, 100).

### 5. Download
1. Click Download.
2. Exported xlsx must have correct columns and data.

## Page Object File
\`automation/pages/customers.page.ts\`

## Automation Test File
\`automation/tests/customers.spec.ts\`
`,
};

function ensureDirs() {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

function generatePageDoc(moduleName: string, content: string): void {
  const filePath = path.join(DOCS_DIR, `${moduleName.toUpperCase().replace(/\s/g, '_')}.md`);
  fs.writeFileSync(filePath, content.trim());
  console.log(`   📝 Created: ${filePath}`);
}

async function run() {
  ensureDirs();
  console.log('📘 [Agent 1] PAGE DOCUMENTATION AGENT starting...\n');

  // Generate docs for all known pages
  for (const [moduleName, content] of Object.entries(PAGE_DOCS)) {
    generatePageDoc(moduleName, content);
  }

  // If discovery output exists, generate placeholder docs for undocumented modules
  if (fs.existsSync(PORTAL_MAP_FILE)) {
    const portalMap: { module: string; url: string }[] = JSON.parse(fs.readFileSync(PORTAL_MAP_FILE, 'utf-8'));
    for (const { module, url } of portalMap) {
      if (!PAGE_DOCS[module]) {
        const placeholder = `# ${module.toUpperCase()} PAGE\n\n## URL\n${url}\n\n## Status\n⚠️ Not yet documented. Run Agent 0 to discover and then update this file.\n`;
        generatePageDoc(module, placeholder);
      }
    }
  }

  console.log('\n✅ [Agent 1] PAGE DOCUMENTATION COMPLETE');
  console.log(`   Docs saved to: ${DOCS_DIR}`);
}

run().catch(console.error);
