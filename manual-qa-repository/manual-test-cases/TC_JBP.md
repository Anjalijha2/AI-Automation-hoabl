# TC_JBP — JBP Management Module Manual Test Cases

**Module:** JBP Management (`/admin/jbp-management` + CP Portal `/jbp`)  
**Sprint:** 3  
**Author:** QA  
**Last Updated:** 2026-04-14  
**Total TCs:** 4

---

## Page Overview

### Admin Side — `/admin/jbp-management`

| Zone | Description |
|------|-------------|
| **Tabs** | Cycle Management · Submissions · Edit Requests |
| **Cycle Date Range** | Range picker filter (Start Date → End Date) |
| **+ Create Cycle** | Opens modal: Cycle Name + Start Date + End Date pickers |
| **Table** | Cycle Name · Start Date · End Date · Status (OPEN/CLOSED) · Action (Close Cycle / Closed) |

### CP Portal Side — `https://uat-web.xrportal.in/jbp`

| Zone | Description |
|------|-------------|
| **Banner** | "Current Cycle - `<name>`" heading + ACTIVE badge + Closes on date |
| **Your Status** | Not Submitted / Submitted |
| **Tabs** | Current Cycle Entry · JBP History · Edit Requests |
| **Add New JBP Entry** | Button visible only when no submission exists for current cycle |
| **JBP Form** | 14 mandatory fields (see form fields below) |

### JBP Form Fields

| # | Field | Type | Options / Notes |
|---|-------|------|-----------------|
| 1 | Brokerage to be Earned | Select | 10,00,000 / 25,00,000 / 50,00,000 / 75,00,000 / 1,00,00,000+ |
| 2 | Net Booking Commitment (Units) | Select | Dropdown options |
| 3 | Manpower to deploy | Number + Slider | Default: 1 |
| 4 | List of activities | Checkboxes (multi) | Tele-calling, WhatsApp Blast, Email Blast, SMS Blast, Personal Connect Calling, Digital, Portal Listing, Expo, Society Activity, Corporate Activity, Newspaper Insert, Club Activities, Mall Activity, Association Activity, Others |
| 5 | Go live on digital | Checkboxes (multi) | Google, Meta, Webpage, Portal listing, Others — if Google selected: Google Budget input appears |
| 6 | Total investment | Radio | Upto 1 lakhs / 1 to 3 lakhs / 3 to 5 lakhs / 5 to 7 lakhs / 7+ lakhs |
| 7 | Inserts Required | Radio (Yes/No) | Default: No |
| 8 | Standees Required | Radio (Yes/No) | Default: No |
| 9 | Kiosk Required | Radio (Yes/No) | Default: No |
| 10 | Tele Callers Required | Radio (Yes/No) | Default: No |
| 11 | SMS Blast | Radio (Yes/No) | Default: No |
| 12 | WhatsApp Blast | Radio (Yes/No) | Default: No |
| 13 | Growth Hub | Radio (Yes/No) | Default: No |
| 14 | Registration Commitment (Count) | Number | Enter count |

---

## Section 1 — Page Load & Structure

### TC-JBP-001 — Page loads with correct tabs and table columns
**Priority:** P1 | **Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/jbp-management` | Page loads, heading "JBP Management" visible |
| 2 | Check tabs | 3 tabs: **Cycle Management**, Submissions, Edit Requests |
| 3 | Verify default active tab | "Cycle Management" is underlined/active |
| 4 | Verify table columns | Cycle Name · Start Date · End Date · Status · Action |

**Assertions:** Tabs list = ['Cycle Management', 'Submissions', 'Edit Requests'] · Active tab matches "Cycle Management" · All 5 column headers present

---

## Section 2 — Cycle Date Range Filter

### TC-JBP-002 — Cycle Date Range filter shows only cycles within selected dates
**Priority:** P1 | **Type:** Functional

**Pre-condition:** At least one cycle exists with start date `2026-04-07`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to JBP Management | Table shows all cycles (baseline row count recorded) |
| 2 | Enter `2026-04-07` in Start Date and End Date fields | Date range picker updates |
| 3 | Wait for table to filter | Table shows only rows where Start Date = `2026-04-07` |
| 4 | Verify each row's Start Date | All filtered rows have `startDate = 2026-04-07` |
| 5 | Verify `Automation-Test1` appears | Cycle is found in filtered results |
| 6 | Check date inputs reflect entered values | Start = `2026-04-07`, End = `2026-04-07` |
| 7 | Clear the date range filter (× button) | All rows restored (count = baseline) |

**Assertions:** `filteredRows.length > 0` · All rows match date · Known cycle found · Row count restored after clear

---

## Section 3 — Create Cycle

### TC-JBP-003 — Create a new cycle with today's date and verify it appears as OPEN
**Priority:** P1 | **Type:** Functional (Stateful — creates data)

**Pre-condition:** Auto-handled — any existing OPEN cycle is closed first

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to JBP Management | Table loads |
| 2 | If OPEN cycle exists: click "Close Cycle" → confirm "Yes, Close" | "Cycle closed successfully" toast |
| 3 | Click "+ Create Cycle" | "Create New Cycle" modal opens |
| 4 | Fill Cycle Name: `Automation-TC003-<timestamp>` | Name entered |
| 5 | Pick today's date for Start Date (calendar) | Date fills with today's date in DD-MM-YYYY |
| 6 | Pick today's date for End Date (calendar) | Date fills with today's date |
| 7 | Click "Create Cycle" | "Cycle created successfully" toast |
| 8 | Verify new cycle in table | New cycle row appears, Status = **OPEN**, Action = "Close Cycle" |

**Notes:**
- "Active Cycle Detected" popup may appear if OPEN cycle still exists → click "Yes, Create Cycle"
- If error toast "A active cycle already exists within the specified date range" → ENV SKIP (same-date conflict)
- Table is paginated (10 rows/page) — new cycle appears at top of page 1

---

## Section 4 — JBP Form Submission (CP Portal)

### TC-JBP-004 — CP Portal login, navigate to JBP, fill form and submit
**Priority:** P1 | **Type:** End-to-End (Admin + CP Portal cross-flow)

**Pre-condition:** An OPEN JBP cycle must exist on the admin side (auto-created if missing)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Admin: navigate to JBP Management | Verify OPEN cycle exists; create one if not |
| 2 | Open CP Portal in new tab: `https://uat-web.xrportal.in` | Login page loads |
| 3 | Enter mobile `8888888888`, click "Send OTP" | OTP input screen loads |
| 4 | Enter OTP `147258`, click "Submit OTP" | Redirected to `/dashboard` |
| 5 | Navigate to `/jbp` | JBP Dashboard loads |
| 6 | Verify "Current Cycle" banner shows ACTIVE cycle | Banner contains "Current Cycle - `<name>`" |
| 7 | Verify "Add New JBP Entry" button is visible | Button present (no prior submission) |
| 8 | Click "Add New JBP Entry" | JBP Form loads with heading "JBP Form - `<cycle-name>`" |
| 9 | Fill Q1 Brokerage: `10,00,000` | Dropdown value selected |
| 10 | Fill Q2 Net Booking Commitment: first option | Value selected |
| 11 | Q3 Manpower: leave default (1) | — |
| 12 | Q4 Activities: check `Tele-calling`, `Digital` | Both checkboxes ticked |
| 13 | Q5 Digital platforms: check `Google` | Google Budget field appears |
| 14 | Fill Google Budget: `10000` | Amount entered |
| 15 | Q6 Total Investment: `Upto 1 lakhs` (default already selected) | Radio confirmed |
| 16 | Q7–Q13 Yes/No radios: leave all as `No` (default) | All No radios selected |
| 17 | Q14 Registration Count: `1` | Value entered |
| 18 | Click "Submit" | Page redirects to `/jbp` dashboard |
| 19 | Verify success: no error toast, URL = `/jbp` | Submission confirmed |

**Test Data:**
```
CP Phone:      8888888888
CP OTP:        147258
Brokerage:     10,00,000
Activities:    Tele-calling, Digital
Digital:       Google + Budget 10000
Investment:    Upto 1 lakhs
Reg Count:     1
```

---

## ENV SKIP Conditions

| Condition | Behaviour |
|-----------|-----------|
| No OPEN cycle (TC-JBP-004) | Auto-creates one in pre-condition step |
| Same-date cycle conflict (TC-JBP-003) | `test.skip(true, 'ENV: date range conflict')` |
| "Add New JBP Entry" not visible (TC-JBP-004) | Fails — indicates a prior submission from same test run |

---

## Run Command

```bash
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Single test:
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-001"
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-002"
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-003"
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-004"
```
