---
module: JBP Management
url: https://uat-web.xrportal.in/admin/jbp-management
sprint: 3
status: Automated
spec: tests/ui/jbp-management.spec.js
tcs: TC-JBP-001–004 (4 tests)
updated: 2026-05-10
---

# Module — JBP Management

## 1. Overview

Two-sided module: Admin manages Job Board Plan (JBP) cycles; Channel Partners submit JBP commitment forms through the CP Portal.

**Admin URL:** `https://uat-web.xrportal.in/admin/jbp-management`
**CP Portal URL:** `https://uat-web.xrportal.in/jbp`
**Auth:** Admin session for admin side; CP portal has its own OTP login
**Page Objects:** `src/pages/JBPManagementPage.js` + `src/pages/CPPortalPage.js`

## 2. Navigation

Left sidebar → "JBP Mgmt" → `/admin/jbp-management`

CP Portal: `https://uat-web.xrportal.in` → phone `8888888888` → OTP `147258` → JBP nav item

## 3. Page Layout

### Admin Side — Cycle Management Page

**Default active tab:** Cycle Management

**Tabs:** Cycle Management · Submissions · Edit Requests

**Date Range Filter:** Start Date → End Date picker (two `.ant-picker` inputs)

**+ Create Cycle button:** Opens modal with: Cycle Name (text) + Start Date picker + End Date picker → Submit

**Campaign Table (5 columns):**

| Column | Description |
|--------|-------------|
| Cycle Name | Name given at creation |
| Start Date | Cycle start date |
| End Date | Cycle end date |
| Status | OPEN or CLOSED |
| Action | "Close Cycle" (when OPEN) / "Closed" label (when CLOSED) |

**Close Cycle flow:** Click "Close Cycle" → confirm dialog → toast "Cycle closed successfully"

**Known test cycle:** `Automation-Test1` | Start=End=2026-04-07 | Status varies per run

### Admin Side — Tabs (Submissions, Edit Requests)

Content of Submissions and Edit Requests tabs has not yet been tested (Q-JBP-001).

### CP Portal Side

**URL:** `https://uat-web.xrportal.in` (login) → JBP nav item → `https://uat-web.xrportal.in/jbp`

| Zone | Description |
|------|-------------|
| Banner | "Current Cycle - `<name>`" + ACTIVE badge + "Closes on: `<date>`" |
| Your Status | "Not Submitted" / "Submitted" |
| Tabs | Current Cycle Entry · JBP History · Edit Requests |
| Add New JBP Entry button | Visible only when no submission exists for current cycle |

**CP Portal login:** Mobile `8888888888`, OTP `147258`
**CP Portal opens as a new tab:** `context.newPage()` — separate tab from admin session

### JBP Form (14 fields)

| # | Field | Type | Options / Notes |
|---|-------|------|-----------------|
| 1 | Brokerage to be Earned | Select | 10,00,000 / 25,00,000 / 50,00,000 / 75,00,000 / 1,00,00,000+ |
| 2 | Net Booking Commitment (Units) | Select | Dropdown options (values not fully confirmed) |
| 3 | Manpower to deploy | Number + Slider | Default: 1 |
| 4 | List of activities | Multi-checkbox (14 options) | Tele-calling / WhatsApp Blast / Email Blast / SMS Blast / Personal Connect Calling / Digital / Portal Listing / Expo / Society Activity / Corporate Activity / Newspaper Insert / Club Activities / Mall Activity / Association Activity / Others |
| 5 | Go live on digital | Multi-checkbox | Google / Meta / Webpage / Portal listing / Others — selecting Google reveals Google Budget input |
| 6 | Total investment | Radio (5 ranges) | Upto 1 lakhs / 1 to 3 lakhs / 3 to 5 lakhs / 5 to 7 lakhs / 7+ lakhs |
| 7 | Inserts Required | Radio Yes/No | Default: No |
| 8 | Standees Required | Radio Yes/No | Default: No |
| 9 | Kiosk Required | Radio Yes/No | Default: No |
| 10 | Tele Callers Required | Radio Yes/No | Default: No |
| 11 | SMS Blast | Radio Yes/No | Default: No |
| 12 | WhatsApp Blast | Radio Yes/No | Default: No |
| 13 | Growth Hub | Radio Yes/No | Default: No |
| 14 | Registration Commitment (Count) | Number | Enter count |

**Test form data used in TC-JBP-004:**
```
brokerage: '10,00,000'
activities: ['Tele-calling', 'Digital']
digitalPlatforms: ['Google']
googleBudget: '10000'
registrationCount: '1'
```

**Create Cycle modal title:** "Create New Cycle"
**Close Cycle confirmation button:** "Yes, Close"
**Create Cycle success toast:** "Cycle created successfully"
**Close Cycle success toast:** "Cycle closed successfully"

## 4. Features

- Create, view, and close allocation cycles
- Date range filter on cycle list
- CP Portal JBP form submission (14 fields)
- One active cycle constraint (only one OPEN cycle at a time)

## 4a. How to Use

### Viewing JBP Cycles

1. Left sidebar → click **"JBP Mgmt"** → `/admin/jbp-management`
2. **Cycle Management** tab is open by default
3. Table shows all cycles: Cycle Name, Start Date, End Date, Status (OPEN/CLOSED), Actions

### Filtering Cycles by Date Range

1. Click the **Start Date** picker → select a date
2. Click the **End Date** picker → select a date
3. Table updates to show only cycles within that range
4. Clear both date inputs to restore all cycles

### Creating a New JBP Cycle

1. Click **"+ Create Cycle"** button
2. Fill in: Cycle Name, Start Date, End Date
3. Click **Submit**
4. Toast "Cycle created successfully" → new cycle appears in table with status OPEN

> **Important:** Only one OPEN cycle is allowed at a time. If one already exists, an "Active Cycle Detected" popup may appear — close the existing open cycle first.

### Closing a Cycle

1. Find the OPEN cycle in the table
2. Click **"Close Cycle"** in the Action column
3. Confirmation dialog appears → click **"Yes, Close"**
4. Toast "Cycle closed successfully" → status changes to CLOSED

> Closed cycles cannot be reopened.

### Viewing CP JBP Submissions (CP Portal Side)

1. CPs log in to `https://uat-web.xrportal.in` → navigate to **JBP** in the nav
2. Banner shows the current active cycle name and close date
3. CPs click **"Add New JBP Entry"** → fill in the 14-field commitment form → submit
4. After submission, status shows "Submitted" and the entry button disappears
5. Admin can view submissions on the **Submissions** tab

### Handling CP Edit Requests

1. CPs may request to edit a submitted form → admin sees requests in **Edit Requests** tab
2. Review the request → click Approve or Reject with a reason

---

## 5. Business Rules

1. Only one OPEN cycle is allowed at a time — creating a new cycle when one is OPEN may trigger an "Active Cycle Detected" popup
2. A cycle can only be closed from Cycle Management tab when its status is OPEN
3. "Closed" cycles show no action button — only the "Closed" label
4. Close Cycle requires a confirmation dialog
5. CP Portal shows "Add New JBP Entry" button only when no submission exists for the current cycle
6. CP Portal JBP submission is per cycle — once submitted, status shows "Submitted"
7. OPEN cycle must exist before TC-JBP-004 can run — test pre-conditions create one if needed

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Channel Partners | CP Portal is accessed via the same phone login as Channel Partners CP portal tests |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Only one OPEN cycle at a time | MEDIUM | Pre-condition logic must close existing OPEN cycle before creating new one — skip guard needed |
| Submissions and Edit Requests tabs untested | INFO | Content of these tabs unknown (Q-JBP-001) |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-JBP-001 | What appears in the Submissions and Edit Requests tabs? These were not tested. | TC scope | ⏳ Open |
| Q-JBP-002 | Can a CP edit a submitted JBP entry after submission? Via "Edit Requests" tab? | Edit flow TC | ⏳ Open |

## 9. Test Coverage

| TC | Description | Result |
|----|-------------|--------|
| TC-JBP-001 | Page loads with 3 tabs; Cycle Management active; 5 table columns present | ✅ Pass |
| TC-JBP-002 | Date range filter → shows only cycles in range; clear → all rows restore | ✅ Pass |
| TC-JBP-003 | Create cycle with today's date → status = OPEN; pre-condition closes existing OPEN first | ✅ Pass |
| TC-JBP-004 | CP Portal: login → navigate to JBP → verify active cycle banner → fill form → submit | ✅ Pass |

**Key technical notes:**
- TC-JBP-003 pre-closes any existing OPEN cycle before creating a new one
- "Active Cycle Detected" popup may appear if OPEN cycle exists on cycle creation — TC-JBP-003 handles this guard
- TC-JBP-004 pre-condition: ensures OPEN cycle exists (creates if needed) before CP portal launch
- Date range filter: `filterByDateRange(start, end)` fills both `.ant-picker` inputs
- `clearDateRangeFilter()`: clears both date inputs and waits for table reset
- `getAllCycleRows()`: returns array of `{cycleName, startDate, endDate, status, action}`
- `getOpenCycle()`: finds first row with status = OPEN; returns null if none

---

## 10. Data Model

### JbpCycle (jbp_cycles table)

| Field | Type | Notes |
|-------|------|-------|
| `id` | PK | |
| `cycleName` | STRING | |
| `startDate` | DATE | |
| `endDate` | DATE | |
| `status` | ENUM('OPEN','CLOSED') | |
| `projectId` | FK → projects | |
| `createdBy` | FK → users | Admin who created |

### JbpSubmission (jbp_submissions table)

One submission per CP per cycle. Contains all 14 form field values.

### JbpEditRequest (jbp_edit_requests table)

CP submits an edit request to change their JBP submission after it is submitted. Admin can approve or reject via Edit Requests tab.

| Status | Meaning |
|--------|---------|
| Pending | Edit request submitted, awaiting admin review |
| Approved | Admin approved — submission updated with new values |
| Rejected | Admin rejected — original submission preserved |

---

## 11. API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/jbp-cycles` | List all cycles (query: `projectId`, date range) |
| POST | `/api/v1/admin/jbp-cycles` | Create new cycle (`cycleName`, `startDate`, `endDate`, `projectId`) |
| PUT | `/api/v1/admin/jbp-cycles/:id/close` | Close an OPEN cycle |
| GET | `/api/v1/admin/jbp-submissions` | List submissions (query: `cycleId`, `projectId`) |
| GET | `/api/v1/admin/jbp-edit-requests` | List edit requests |
| PUT | `/api/v1/admin/jbp-edit-requests/:id/approve` | Approve edit request (body: `reason`) |
| PUT | `/api/v1/admin/jbp-edit-requests/:id/reject` | Reject edit request (body: `reason`) |

### Auto-Close Cascade

When a JBP cycle is closed (`PUT /jbp-cycles/:id/close`):
1. Cycle `status` → `'CLOSED'`
2. All associated `JbpSubmission` records for that cycle are also finalized
3. No refund or financial impact — JBP is a commitment tracking module, not a payment module
