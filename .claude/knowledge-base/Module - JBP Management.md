---
type: module
module: JBP Management
url: https://uat-web.xrportal.in/admin/jbp-management
sprint: 3
status: Automated
spec: tests/ui/jbp-management.spec.js
tcs: TC-JBP-001–004
tags: [module, jbp, automated]
updated: 2026-05-08
---

# Module: JBP Management

## Overview

Two-sided module: Admin manages Job Board Plan cycles; Channel Partners submit JBP forms through CP Portal.

**Admin URL:** `https://uat-web.xrportal.in/admin/jbp-management`  
**CP Portal URL:** `https://uat-web.xrportal.in/jbp`  
**Auth:** Admin session for admin side; CP portal has its own OTP login  
**Page Objects:** `src/pages/JBPManagementPage.js` + `src/pages/CPPortalPage.js`

## Admin Side Structure

| Zone | Description |
|------|-------------|
| Tabs | Cycle Management · Submissions · Edit Requests |
| Date Range Filter | Start Date → End Date picker |
| + Create Cycle | Opens modal: Cycle Name + Start/End date |
| Table | Cycle Name · Start Date · End Date · Status (OPEN/CLOSED) · Action |

**Default active tab:** Cycle Management  
**Table columns (5):** Cycle Name | Start Date | End Date | Status | Action

**Cycle statuses:** OPEN | CLOSED  
**Actions:** "Close Cycle" (when OPEN) | "Closed" (when CLOSED — no action)

**Create Cycle modal:** Cycle Name (text) + Start Date picker + End Date picker → Submit  
**Close Cycle flow:** Click "Close Cycle" in Action column → confirm dialog → toast "Cycle closed successfully"

**Known test cycle:** `Automation-Test1` | Start=End=2026-04-07 | Status varies per run

## CP Portal Structure

| Zone | Description |
|------|-------------|
| Banner | "Current Cycle - `<name>`" + ACTIVE badge + "Closes on: `<date>`" |
| Your Status | "Not Submitted" / "Submitted" |
| Tabs | Current Cycle Entry · JBP History · Edit Requests |
| Add New JBP Entry | Button — visible only when no submission exists for current cycle |

**CP Portal login:** `page.goto('https://uat-web.xrportal.in')` → phone `8888888888` → OTP `147258`  
**Navigation to JBP:** From CP portal home → JBP nav item

## JBP Form Fields (14)

| # | Field | Type |
|---|-------|------|
| 1 | Brokerage to be Earned | Select (10L/25L/50L/75L/1Cr+) |
| 2 | Net Booking Commitment (Units) | Select |
| 3 | Manpower to deploy | Number + Slider |
| 4 | List of activities | Multi-checkbox (14 options) |
| 5 | Go live on digital | Multi-checkbox; Google selected → Google Budget input |
| 6 | Total investment | Radio (5 ranges) |
| 7-13 | Inserts/Standees/Kiosk/Tele Callers/SMS Blast/WhatsApp Blast/Growth Hub | Radio Yes/No |
| 14 | Registration Commitment (Count) | Number |

**Test form data used:**
```js
brokerage: '10,00,000'
activities: ['Tele-calling', 'Digital']
digitalPlatforms: ['Google']
googleBudget: '10000'
registrationCount: '1'
```

## Automated Tests

| TC | Description |
|----|-------------|
| TC-JBP-001 | Page loads with 3 tabs; Cycle Management active; 5 table columns present |
| TC-JBP-002 | Date range filter → shows only cycles in range; clear → all rows restore |
| TC-JBP-003 | Create cycle with today's date → status = OPEN; pre-condition closes existing OPEN first |
| TC-JBP-004 | CP Portal: login → navigate to JBP → verify active cycle banner → fill form → submit |

## Key Technical Notes

- **OPEN cycle constraint:** Only one OPEN cycle allowed at a time. TC-JBP-003 pre-closes existing OPEN cycle before creating new.
- **"Active Cycle Detected" popup:** May appear if OPEN cycle exists when creating new one. TC-JBP-003 handles this guard.
- **TC-JBP-004 pre-condition:** Ensures OPEN cycle exists (creates one if needed) before launching CP portal
- **CP portal new tab:** Opens via `context.newPage()` — separate tab from admin session
- **Date range filter:** Two `.ant-picker` inputs; `filterByDateRange(start, end)` fills both
- **`clearDateRangeFilter()`:** Clears both date inputs and waits for table to reset
- **`getAllCycleRows()`:** Returns array of `{cycleName, startDate, endDate, status, action}` objects
- **`getOpenCycle()`:** Finds first row with status = OPEN; returns null if none

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Channel Partners]] | CP Portal accessed via same phone login as CP portal tests |

→ See [[Open Questions#JBP Management]] for unresolved items
