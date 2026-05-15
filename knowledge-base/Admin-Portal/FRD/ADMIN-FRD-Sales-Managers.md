---
module: Sales Managers
url: https://uat-web.xrportal.in/admin/sales-managers
sprint: 2
status: Automated
spec: tests/ui/config.spec.js
tcs: TC_CFG_019 + TC_CFG_041–048 (9 tests)
updated: 2026-05-10
---

# Module — Sales Managers

## 1. Overview

Two-surface module managing the sales force that accesses the XR Portal sales portal.

**Surface 1:** `/admin/cms` → Section 7 — bulk CSV upload to create/update SM records  
**Surface 2:** `/admin/sales-managers` — standalone list page with search, column filters, add/edit modal, settings

**Business intent:** Governed, role-based sales team with configurable PII and pricing masking for sales staff. Automation covers both surfaces.

**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** `src/pages/ConfigPage.js` (bulk upload); direct page.goto for list page
**Selectors:** `docs/selectors/config.json`

## 2. Navigation

- **Bulk upload:** Left sidebar → "Config" → `/admin/cms` → scroll to Section 7 "Sales Managers"
- **List page:** Left sidebar → "Managers" → `/admin/sales-managers`

## 3. Page Layout

### Surface 1 — CMS Bulk Upload (`/admin/cms` Section 7)

**Section heading:** "Sales Managers"
**Actions:** Sample File Download | Upload File input | Submit button

**CSV Format (confirmed from `buildSalesManagerFile` helper):**

| Col | Header | Values |
|-----|--------|--------|
| 0 | Role | `"Sales Manager"` |
| 1 | First Name | text |
| 2 | Last Name | text |
| 3 | Email | email format |
| 4 | Phone | 10-digit string |
| 5 | IS_AVAILABLE | `1` (assignable) / `0` (not assignable) |
| 6 | IS_ACTIVE | `1` (active) / `0` (inactive) |

**Upload accepts:** `.xlsx`
**Success:** toast containing `"upload"` or `"success|add|creat|updat"`

### Surface 2 — List Page (`/admin/sales-managers`)

**Header:** "Sales Managers" heading | "26 Sales Managers" counter | Search box | Settings | Add Sales Manager

**Table Columns:**

| Column | Filterable |
|--------|-----------|
| First Name | No |
| Last Name | No |
| Email | No |
| Phone | No |
| Role | Yes (column filter) |
| Assignable | Yes (column filter) |
| Is Active | Yes (column filter) |
| Created At | No |
| Actions | No (Edit button only) |

**Pagination:** 26 records, 3 pages, 10 per page

**Search:** `input.ant-input` → fill text → Enter → table filters by First Name, Last Name, Email, Phone

**Settings Modal:**
- Email Masking toggle (ON/OFF)
- Phone Masking toggle (ON/OFF)
- Cost Masking toggle (ON/OFF)
- System-wide — affects ALL Sales Managers simultaneously; no per-SM masking

**Add/Edit SM Modal Fields:**

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| First Name | Yes | Text | Primary identifier |
| Last Name | Yes | Text | Blank in load test data |
| Email | Yes | Email | Uniqueness unclear — duplicates observed |
| Phone | Yes | Tel | 10 digits |
| Role | Yes | Dropdown | "Sales Manager" observed; full value list unknown (Q-SM-003) |
| Assignable | No | Toggle | Default ON |
| Is Active | No | Toggle | Default ON |

**No delete button** — SMs are deactivated (Is Active = OFF), never deleted.

## 4. Features

### Surface 1 — Bulk Upload (CMS)
- Download sample CSV with correct column headers
- Upload XLSX to create or update SM records
- Submit triggers server-side processing with success toast
- Post-upload, server may return result file or direct toast

### Surface 2 — List Page
- Paginated list with 10/page default
- Free-text search (name, email, phone)
- Column filters: Role, Assignable, Is Active
- Add new SM via modal
- Edit existing SM via modal (pre-filled)
- Configure system-wide privacy masking via Settings

## 4a. How to Use

### Bulk Adding or Updating Sales Managers (CMS Upload)

1. Left sidebar → **"Config"** → `/admin/cms` → scroll to **"Sales Managers"** section
2. Click **"Sample File Download"** to get the XLSX template
3. Fill in rows: Role / First Name / Last Name / Email / Phone / IS_AVAILABLE (1=yes) / IS_ACTIVE (1=yes)
4. Save as `.xlsx` → click **"Upload File"** → select your file
5. Click **"Submit"** → toast confirms success
6. If a row's phone matches an existing SM → that SM is **updated**; new phone → new SM is **created**

### Browsing Sales Managers (List Page)

1. Left sidebar → **"Managers"** → `/admin/sales-managers`
2. Table shows all SMs with columns: Name, Email, Phone, Role, Assignable, Is Active, Created At

### Searching for a Sales Manager

1. On the list page → type in the **search box** (top right)
2. Press **Enter** → table filters by First Name, Last Name, Email, or Phone

### Adding a Sales Manager via Modal

1. List page → click **"Add Sales Manager"** button (top right)
2. Fill in: First Name, Last Name, Email, Phone, Role; set Assignable and Is Active toggles
3. Click Save/Create

### Editing a Sales Manager

1. Find the SM row in the table
2. Click the **Edit** button in the Actions column
3. Modal opens pre-filled with existing values — update as needed
4. Save

### Deactivating a Sales Manager

- To remove from customer assignment dropdowns: edit SM → set **Assignable = OFF** (IS_AVAILABLE = 0)
- To revoke portal login access: edit SM → set **Is Active = OFF** (IS_ACTIVE = 0)

> SMs are **never deleted** — they are only deactivated.

### Configuring Privacy Masking (Settings)

1. List page → click **"Settings"** button
2. Toggle **Email Masking**, **Phone Masking**, and/or **Cost Masking** as needed
3. Save

> **Warning:** These settings are **system-wide** — changing masking affects ALL Sales Managers simultaneously.

---

## 5. Business Rules

1. IS_AVAILABLE controls whether SM appears in customer assignment dropdowns
2. IS_ACTIVE controls SM login access to the sales portal
3. Privacy masking (Email / Phone / Cost) is system-wide — changing it affects all SMs simultaneously
4. No per-SM masking granularity
5. No delete operation — SMs are soft-deleted via IS_ACTIVE = 0
6. Bulk upload accepts `.xlsx` format only
7. Test data: Role = `"Sales Manager"` | Name = `"Tester Anjali"` | Email = `test1@test.com` | Phone = `8888888888`
8. Sample file download located in Sales Managers section card within CMS page
9. Multiple SMs can share the same email on UAT (load test seed data) — uniqueness enforcement unclear (Q-SM-001)

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Config CMS | SM bulk upload lives in Section 7 of `/admin/cms` |
| Customers | Assignable SMs (IS_AVAILABLE=1) appear in customer SM assignment dropdowns |
| Channel Partners | SM Name / SM Email / SM Mobile appear as columns in CP table — relationship and data flow unclear (Q-SM-004) |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Cost Masking system-wide toggle | MEDIUM | Accidentally toggling OFF exposes unit pricing data to ALL sales managers simultaneously |
| Email/Phone masking system-wide | MEDIUM | No per-SM masking — changes affect entire sales force at once |
| SM email uniqueness unclear | MEDIUM | Duplicate emails may pass validation but cause ambiguous assignment behavior |
| Settings modal save mechanism unconfirmed | LOW | Auto-save on toggle vs explicit Save button — test path unclear (Q-SM-002) |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-SM-001 | Is Email unique per Sales Manager? UAT shows duplicate emails (load test seed). Does system reject duplicates at API level? | Validation TC | ⏳ Open |
| Q-SM-002 | Does Settings modal auto-save on toggle, or require an explicit Save/Update button click? | Settings TC | ⏳ Open |
| Q-SM-003 | What are all available Role dropdown values in Add SM modal? Only "Sales Manager" observed. | Test data | ⏳ Open |
| Q-SM-004 | What is the relationship between Sales Managers and Channel Partners? Can a CP also be an SM? | Integration test scope | ⏳ Open |
| Q-SM-005 | Are Settings changes (masking toggles) recorded in an audit log? | Security TC | ⏳ Open |
| Q-SM-006 | What is the merge key for SM bulk upload — if a row matches an existing SM by phone/email, does it update or create a duplicate? | Bulk upload TC | ⏳ Open |

## 9. Test Coverage

| TC | Type | Description | Result |
|----|------|-------------|--------|
| TC_CFG_019 | Positive | Sample file downloads with correct SM column headers | ✅ Pass |
| TC_CFG_041 | Positive | Add new SM (Role=Sales Manager, AVAILABLE=1, ACTIVE=1) via CMS bulk upload | ✅ Pass |
| TC_CFG_042 | Positive | Make SM unavailable (IS_AVAILABLE=0) | ✅ Pass |
| TC_CFG_043 | Positive | Make SM inactive (IS_ACTIVE=0) | ✅ Pass |
| TC_CFG_044 | Positive | Update email (test1→test2@test.com) | ✅ Pass |
| TC_CFG_045 | Positive | Search by name "Tester" on list page — results > 0 | ✅ Pass |
| TC_CFG_046 | Positive | Search by phone "8888888888" on list page — results > 0 | ✅ Pass |
| TC_CFG_047 | Negative | Invalid phone "123" — error or flagged row in upload | ✅ Pass |
| TC_CFG_048 | Negative | Duplicate email test2@test.com in upload | ✅ Pass |

**Not yet automated:**
- Add SM via modal UI (only bulk upload tested)
- Settings masking toggles (requires cross-portal verification in sales portal)
- Column filters (Role / Assignable / Is Active)
- Pagination on list page
- Edit SM via modal UI

---

## 10. API Reference

### Surface 1 — Bulk Upload (via Config CMS)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/sales-manager-sample` | Download sample XLSX with correct column headers |
| POST | `/api/v1/admin/sales-managers-import` | Upload XLSX to create/update SM records (multipart/form-data, field: `doc`) |

### Surface 2 — List Page CRUD

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/sales-managers` | Paginated SM list with search + filters |
| GET | `/api/v1/admin/sales-managers/:id` | Single SM by ID |
| POST | `/api/v1/admin/sales-managers/create` | Create new SM via modal |
| PUT | `/api/v1/admin/sales-managers/update/:id` | Update SM via modal |

**Query params for GET list:**
- `page`, `limit` — pagination
- `search` — free-text (name, email, phone)
- `role` — column filter
- `isAvailable`, `isActive` — column filters (1/0)

### isAvailable Force-Zero Behaviour

When `IS_AVAILABLE = 0` in bulk upload, the SM is immediately removed from all customer assignment dropdowns. This is a system-wide flag — no per-customer reassignment happens automatically.

When SM login is set `IS_ACTIVE = 0`, the user account is deactivated and SM cannot log into the sales portal. This is a soft deactivation — the SM record is NOT deleted.
