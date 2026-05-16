/**
 * ============================================================
 * AGENT 2 — TEST CASE GENERATOR AGENT
 * ============================================================
 * Purpose : Generate structured manual test cases from BRD
 *           and page documentation, stored as Markdown files.
 *
 * Inputs  : manual-qa-repository/pages/<MODULE>.md
 *           BRD inputs from user
 *
 * Outputs : manual-test-cases/TC_<MODULE>.md
 *
 * Coverage per module:
 *   - Positive scenarios
 *   - Negative scenarios
 *   - Boundary conditions
 *   - Validation checks
 *   - Security scenarios
 *   - UI behaviour validation
 *   - Business logic validation
 *
 * Test Case Format:
 *   TC_ID | MODULE | SCENARIO | PRECONDITION | STEPS | EXPECTED | PRIORITY
 *
 * Run:
 *   node src/test/agents/testcase-agent.js
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'manual-test-cases');

// ── Test Case Definitions ──────────────────────────────────────────────────────
// Add new module test cases here as you expand coverage

const LOGIN_TEST_CASES = [
  // ── Positive ────────────────────────────────────────────────────────────────
  {
    id: 'TC_LOGIN_001', module: 'Login', priority: 'P1',
    scenario: 'Successful login with valid mobile number and valid OTP',
    precondition: 'Application is accessible. Mobile 8888888888 is registered.',
    steps: [
      'Navigate to https://uat-web.xrportal.in/admin',
      'Enter mobile number: 8888888888',
      'Click "Send OTP" button',
      'Enter OTP: 258369 in all 6 OTP boxes',
      'Click "Submit OTP" button',
    ],
    expected: 'User is redirected to /admin/customers. Greeting "Welcome, <username>" is visible.',
  },
  {
    id: 'TC_LOGIN_002', module: 'Login', priority: 'P1',
    scenario: 'OTP is sent for valid 10-digit mobile number',
    precondition: 'Application is on login page.',
    steps: [
      'Navigate to https://uat-web.xrportal.in/admin',
      'Enter mobile number: 8888888888',
      'Click "Send OTP"',
    ],
    expected: 'OTP screen is displayed. 6 OTP input boxes and "Submit OTP" button are visible.',
  },
  // ── Negative ────────────────────────────────────────────────────────────────
  {
    id: 'TC_LOGIN_003', module: 'Login', priority: 'P1',
    scenario: 'Empty mobile field — clicking Send OTP should show validation',
    precondition: 'Application is on login page.',
    steps: ['Navigate to login page', 'Leave mobile number empty', 'Click "Send OTP"'],
    expected: 'OTP screen does NOT appear. User stays on login page.',
  },
  {
    id: 'TC_LOGIN_004', module: 'Login', priority: 'P2',
    scenario: 'Short mobile number (5 digits) is rejected',
    precondition: 'Application is on login page.',
    steps: ['Navigate to login page', 'Enter mobile: 12345', 'Click "Send OTP"'],
    expected: 'OTP screen does NOT appear.',
  },
  {
    id: 'TC_LOGIN_005', module: 'Login', priority: 'P2',
    scenario: 'Wrong OTP is rejected',
    precondition: 'OTP has been sent for 8888888888.',
    steps: [
      'Enter OTP: 123456',
      'Click "Submit OTP"',
    ],
    expected: 'Login is NOT successful. Error message or toast is shown.',
  },
  // ── Security ────────────────────────────────────────────────────────────────
  {
    id: 'TC_LOGIN_006', module: 'Login', priority: 'P1',
    scenario: 'SQL injection in mobile field is handled safely',
    precondition: 'Application is on login page.',
    steps: ["Enter in mobile field: ' OR '1'='1", 'Click "Send OTP"'],
    expected: 'No database error. No login. Field rejects non-numeric input.',
  },
  {
    id: 'TC_LOGIN_007', module: 'Login', priority: 'P1',
    scenario: 'XSS injection in mobile field does not execute',
    precondition: 'Application is on login page.',
    steps: ['Enter in mobile field: <script>alert("xss")</script>', 'Click "Send OTP"'],
    expected: 'No alert dialog appears. Script is not executed.',
  },
  // ── Functionality ────────────────────────────────────────────────────────────
  {
    id: 'TC_LOGIN_008', module: 'Login', priority: 'P2',
    scenario: 'Back button returns user to mobile entry screen',
    precondition: 'User is on OTP screen.',
    steps: ['Navigate to login page', 'Enter valid mobile and send OTP', 'Click back button'],
    expected: 'Mobile number input is visible again. OTP boxes are gone.',
  },
];

const CUSTOMERS_TEST_CASES = [
  {
    id: 'TC_CUST_001', module: 'Customers', priority: 'P1',
    scenario: 'KPI — Registered Count Validation',
    precondition: 'User is on Customers page.',
    steps: [
      'Note the value on "Registered" KPI card.',
      'Open Allocation Status filter.',
      'Check Booked Offline, Booked Online, Registered, and Inactive Registrations.',
      'Click OK.',
      'Check the total table record count.'
    ],
    expected: 'Table record count exactly matches the "Registered" card value.',
  },
  {
    id: 'TC_CUST_002', module: 'Customers', priority: 'P1',
    scenario: 'KPI — Inactive Count Validation',
    precondition: 'User is on Customers page.',
    steps: [
      'Note the value on "Inactive Registrations" KPI card.',
      'Open Allocation Status filter and check only "Inactive Registrations".',
      'Click OK.',
      'Check the total table record count.'
    ],
    expected: 'Table record count exactly matches the "Inactive Registrations" card value.',
  },
  {
    id: 'TC_CUST_003', module: 'Customers', priority: 'P1',
    scenario: 'KPI — Cancelled Count Validation',
    precondition: 'User is on Customers page.',
    steps: [
      'Note the value on "Cancelled Registrations" KPI card.',
      'Open Allocation Status filter and check only "Cancelled".',
      'Click OK.',
      'Check the total table record count.'
    ],
    expected: 'Table record count exactly matches the "Cancelled Registrations" card value.',
  },
  {
    id: 'TC_CUST_004', module: 'Customers', priority: 'P1',
    scenario: 'KPI — KYC Pending Count Validation',
    precondition: 'User is on Customers page.',
    steps: [
      'Note the value on "KYC Pending" KPI card.',
      'Open Allocation Status filter and check Booked Online + Booked Offline.',
      'Open Process Status filter and check KYC Pending.',
      'Click OK on both.',
      'Check the total table record count.'
    ],
    expected: 'Table record count exactly matches the "KYC Pending" card value.',
  },
  {
    id: 'TC_CUST_005', module: 'Customers', priority: 'P1',
    scenario: 'KPI — Confirmed Count Validation',
    precondition: 'User is on Customers page.',
    steps: [
      'Note the value on "Confirmed" KPI card.',
      'Open Allocation Status filter and check Booked Online + Booked Offline.',
      'Open Process Status filter and check KYC Completed.',
      'Click OK on both.',
      'Check the total table record count.'
    ],
    expected: 'Table record count exactly matches the "Confirmed" card value.',
  },
  {
    id: 'TC_CUST_006', module: 'Customers', priority: 'P1',
    scenario: 'KPI — Active Towers Validation',
    precondition: 'User is an Admin with access to Config page.',
    steps: [
      'Note the value on "Active Towers" KPI card in Customers page.',
      'Navigate to Config page.',
      'Count the number of towers with green Active toggle ON.',
      'Toggle any inactive tower to ON, and update configuration.',
      'Return to Customers page and check Active Towers card again.'
    ],
    expected: 'Initial count matches Config active toggles. After toggling a new tower, the KPI count increments by 1.',
  },
  {
    id: 'TC_CUST_007', module: 'Customers', priority: 'P1',
    scenario: 'Cancel Registration Flow',
    precondition: 'A registration record exists with Allocation Status = "Registered". Refund is handled offline.',
    steps: [
      'Search for a specific Registered user via Phone number.',
      'Click the delete (trash) icon in the Actions column.',
      'Verify the "Confirm Refund" modal details.',
      'Click the red "Cancel Registration" button.'
    ],
    expected: 'Modal shows Registration No, Unit, Refund ₹999. Success toast appears. Allocation Status changes to Cancelled. Cancelled KPI increments by 1.',
  },
  {
    id: 'TC_CUST_008', module: 'Customers', priority: 'P1',
    scenario: 'Home Loan Approval Flow',
    precondition: 'A valid registration record exists.',
    steps: [
      'Click the 3-dot menu in the Actions column of a target row.',
      'Select "Home Loan Approval".',
      'Verify the "Home Loan Approval" modal details.',
      'Toggle "Enable Home Loan" to ON and click Submit.'
    ],
    expected: 'Modal shows Registration Number and Apartment Type. Success confirmation is shown. Home Loan Details column updates to Yes/Discount Availed.',
  },
  {
    id: 'TC_CUST_009', module: 'Customers', priority: 'P1',
    scenario: 'Filter — Registration Details Search',
    precondition: 'User is on Customers page.',
    steps: [
      'Click "Filter" button to show inline search boxes.',
      'Type or paste a specific Registration ID.',
      'Verify the table updates.'
    ],
    expected: 'Table shows exactly 1 matching record for the Registration ID.',
  },
  {
    id: 'TC_CUST_010', module: 'Customers', priority: 'P2',
    scenario: 'Filter — Growth Partner Search',
    precondition: 'User is on Customers page.',
    steps: [
      'Click "Filter" button to show inline search boxes.',
      'Paste an HV Code (e.g., HV00026005) into the Growth Partner search box.',
      'Verify the table updates.'
    ],
    expected: 'Table filters to show only records matching the HV Code.',
  },
  {
    id: 'TC_CUST_011', module: 'Customers', priority: 'P2',
    scenario: 'Filter — Confirmation Number Search',
    precondition: 'User is on Customers page.',
    steps: [
      'Click "Filter" button to show inline search boxes.',
      'Paste a Confirmation Number into the search box.',
      'Verify the table updates.'
    ],
    expected: 'Table shows exactly 1 matching record for the Confirmation Number.',
  },
  {
    id: 'TC_CUST_012', module: 'Customers', priority: 'P2',
    scenario: 'Filter — Alloted Unit Search',
    precondition: 'User is on Customers page.',
    steps: [
      'Click "Filter" button to show inline search boxes.',
      'Type "1 Bed" in the Alloted Unit search box.',
      'Clear and type "2 Bed".'
    ],
    expected: 'Table filters correctly to show only 1BHK units, then only 2BHK units.',
  },
  {
    id: 'TC_CUST_013', module: 'Customers', priority: 'P2',
    scenario: 'Filter — Home Loan Details Checkbox',
    precondition: 'User is on Customers page.',
    steps: [
      'Click the filter icon on the Home Loan Details column header.',
      'Select "Yes" and click OK.',
      'Clear filter, select "No" and click OK.'
    ],
    expected: 'Table filters to display only records with a home loan, then only records without.',
  },
  {
    id: 'TC_CUST_014', module: 'Customers', priority: 'P1',
    scenario: 'Reset Filters Functionality',
    precondition: 'Filters and inline searches are actively applied on the table.',
    steps: [
      'Click the "Reset Filters" button in the toolbar.'
    ],
    expected: 'All column searches and status filters clear. Full record count (9400+) is restored. Search boxes hide.',
  },
  {
    id: 'TC_CUST_015', module: 'Customers', priority: 'P1',
    scenario: 'Download Data to Excel',
    precondition: 'Table displays registration records (filtered or unfiltered).',
    steps: [
      'Click the "Download" button in the toolbar.',
      'Open the downloaded Excel/CSV file.',
      'Verify columns and row counts.'
    ],
    expected: 'File downloads successfully. Columns include Registration Details, Growth Partner, Phone, Home Loan Details, Confirmation Number, Alloted Unit, Allocation Status, Confirmation, Process Status.',
  },
  {
    id: 'TC_CUST_016', module: 'Customers', priority: 'P2',
    scenario: 'Pagination Navigation & Sizes',
    precondition: 'Customers table has more than 100 records.',
    steps: [
      'Verify default 10 / page view.',
      'Select 20 / page, 50 / page, and 100 / page from the pagination dropdown.',
      'Click through page numbers (2, 3, 4).',
      'Navigate to the last page.'
    ],
    expected: 'Record count per page matches the dropdown selection. Total pages calculate correctly. Last page shows remaining records <= page size.',
  }
];

// ── Formatter ────────────────────────────────────────────────────────────────────

function formatTestCases(moduleName, cases) {
  let md = `# Manual Test Cases — ${moduleName}\n\n`;
  md += `Generated by Agent 2 — Test Case Generator Agent\n\n---\n\n`;

  for (const tc of cases) {
    md += `## ${tc.id} | Priority: ${tc.priority}\n\n`;
    md += `**Module:** ${tc.module}  \n`;
    md += `**Scenario:** ${tc.scenario}  \n\n`;
    md += `**Precondition:**  \n${tc.precondition}\n\n`;
    md += `**Steps to Reproduce:**  \n`;
    tc.steps.forEach((step, i) => { md += `${i + 1}. ${step}\n`; });
    md += `\n**Expected Result:**  \n${tc.expected}\n\n---\n\n`;
  }
  return md;
}

function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('📝 [Agent 2] TEST CASE GENERATOR AGENT starting...\n');

  const testModules = [
    ['Login', LOGIN_TEST_CASES],
    ['Customers', CUSTOMERS_TEST_CASES],
  ];

  for (const [moduleName, cases] of testModules) {
    const content = formatTestCases(moduleName, cases);
    const filePath = path.join(OUTPUT_DIR, `TC_${moduleName.toUpperCase()}.md`);
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ ${filePath} — ${cases.length} test cases written`);
  }

  console.log('\n✅ [Agent 2] TEST CASE GENERATION COMPLETE');
}

run();
