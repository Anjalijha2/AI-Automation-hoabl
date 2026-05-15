---
module: Offers
url: https://uat-web.xrportal.in/admin/offers
sprint: 4
status: Automated
spec: tests/ui/offers.spec.js
tcs: TC-OFFERS-001–012 (13 tests)
updated: 2026-05-10
---

# Module — Offers

## 1. Overview

Manages discount offers applied to unit purchases during the booking flow. Admins create, edit, toggle active/inactive, and delete offers. Active offers appear as line-item discounts on the customer-facing unit selection panel during Allocation.

**Business intent:** Controlled, auditable mechanism for time-bound discount campaigns without modifying base pricing in the Unit Cost Update section.

**URL:** `https://uat-web.xrportal.in/admin/offers`
**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** `src/pages/OffersPage.js`
**Selectors:** `docs/selectors/offers.json`

## 2. Navigation

Left sidebar → gift icon → "Offers" → `/admin/offers`

Single-page module. No sub-navigation tabs.

## 3. Page Layout

### Header

| Element | Selector | Content |
|---------|----------|---------|
| Page Heading | `h5` | "Offers Management" |
| Offer Count Badge | `div` matching `/\d+ Offers/` | Live count — includes all statuses (active + inactive) |
| Refresh Button | `button:has-text('Refresh')` | Reloads table from server |
| Add New Offer Button | `button:has-text('Add New Offer')` | Opens Add drawer |

**No search or filter** on list page — only Refresh.

### Offers Table

| Column | Position | Data Type | Notes |
|--------|----------|-----------|-------|
| Sr.No | 0 | Integer | DB primary key — non-contiguous (gaps = hard deletes) |
| Offer Name | 1 | Text | Free-text, max 100 chars |
| Description | 2 | Text | Free-text, max 500 chars; optional |
| Amount | 3 | Currency | Formatted as "₹ X,XX,XXX" |
| Percentage | 4 | Numeric or "-" | Always "-" when offer type is Amount Based |
| Start Date | 5 | Date | DD MMM YYYY format (e.g. "13 Apr 2026") |
| End Date | 6 | Date | DD MMM YYYY format |
| Created By | 7 | Text | Display name of creating admin |
| Action | 8 | Controls | Toggle switch + Edit button + Delete button |

**Table Selectors:**
- Headers: `table thead th`
- Body rows: `table tbody tr`
- Toggle switch: `[role="switch"]` with `aria-checked="true/false"`
- Edit button: `button:has([aria-label="edit"])` — NOT `button:has(img[alt="edit"])`
- Delete button: `button:has([aria-label="delete"])` — NOT `button:has(img[alt="delete"])`

> **Critical pattern:** Ant Design uses `<span role="img" aria-label="edit">` inside buttons — NOT `<img>` tags. Always use `:has([aria-label="..."])`.

### Pagination

- Selector: `.ant-pagination`
- UAT: 6 offers fit on one page
- Previous/Next buttons disabled at extremes

### Add New Offer Drawer

**Trigger:** Click "Add New Offer"
**Component:** Ant Design Drawer (`.ant-drawer-body`) — slides from right. NOT a centered modal.
**Drawer title:** "Add New Offer"

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| Offer Name | Yes | Text input | Max 100 chars; character counter "X / 100"; `input[placeholder='Please enter offer name']` |
| Offer Type | Yes | Radio group | Amount Based (default) OR Percentage Based — mutually exclusive |
| Amount | Conditional (Amount Based) | Spinbutton | Positive integer INR; `input[placeholder='Please enter amount']` or `.ant-input-number-input` |
| Percentage | Conditional (% Based) | Numeric | 0-100 |
| Description | No | Textarea | Max 500 chars; `textarea[placeholder='Please enter description']` |
| Offer Validity | Yes | Date range picker | Start ≤ End; `input[placeholder='Start date']` / `input[placeholder='End date']` |
| Select Typology | No | Multi-select | Optional; empty = applies to all typologies |

**Drawer Buttons:**

| Button | Selector | Behavior |
|--------|----------|----------|
| Cancel | `button:has-text('Cancel')` | Closes drawer; discards input |
| Create Offer | `button:has-text('Create Offer')` | Submits; validates required fields |
| Close (X) | `.ant-drawer-close` | Same as Cancel |

**Typology Options (confirmed from live portal 2026-05-08):**
- 1 Bed Growth Home
- 2 Bed Growth Home
- 2 Bed Peak Home
- 2 Bed Rise Home

### Edit Offer Drawer

**Trigger:** Click edit icon on any row
**Drawer title:** "Edit Offer"
**Pre-fill behavior:** All existing values pre-populated on open

**Edit Buttons:**

| Button | Behavior |
|--------|----------|
| Cancel | Closes drawer; discards changes |
| Update Offer | Submits changes |

### Toggle ON/OFF

- `role="switch"` with `aria-checked="true"/"false"`
- **No confirmation dialog** — state flips immediately and persists to server
- HIGH risk: accidental deactivation mid-campaign changes customer pricing instantly

### Delete Offer

- **Trigger:** Click delete icon (trash) per row
- **Confirmation dialog:** Present — title: "Are you sure you want to delete this offer?" / body: "This action cannot be undone."
- **Dialog buttons:** "Cancel" | "Yes, delete" (NOT "OK" or "Yes")
- **Result:** Offer removed; count badge decrements; Sr.No gap remains (hard delete confirmed)

## 4. Features

### CRUD Operations
- Create offer via drawer form
- Edit offer (pre-filled drawer)
- Toggle active/inactive (immediate, no confirmation)
- Delete offer (confirmation dialog required)
- Refresh list

### Data Model

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| Offer Name | Yes | Text | Max 100 chars |
| Offer Type | Yes | Radio | Amount Based OR Percentage Based |
| Amount | Conditional | Currency | Positive integer, INR |
| Percentage | Conditional | Numeric | 0-100 |
| Description | No | Textarea | Max 500 chars |
| Start Date | Yes | Date picker | ≤ End Date |
| End Date | Yes | Date picker | ≥ Start Date |
| Select Typology | No | Multi-select | 4 options; optional |
| Active (ON/OFF) | — | Toggle | Default ON at creation |

## 4a. How to Use

### Viewing All Offers

1. Left sidebar → click gift icon → **"Offers"** → `/admin/offers`
2. Table shows all offers (active + inactive) with count badge at top

### Creating a New Offer

1. Click **"Add New Offer"** button (top right)
2. Drawer slides in from right — fill in:
   - **Offer Name** (required, max 100 chars)
   - **Offer Type:** select **Amount Based** (enter INR amount) OR **Percentage Based** (enter 0–100 %)
   - **Description** (optional, max 500 chars)
   - **Offer Validity:** pick Start Date and End Date (Start must be ≤ End)
   - **Select Typology** (optional) — leave empty to apply to all unit types; or select specific typologies
3. Click **"Create Offer"** → offer appears in table, active by default

### Editing an Offer

1. Find the offer row in the table
2. Click the **edit icon** in the Action column
3. Drawer opens pre-filled with existing values
4. Make changes → click **"Update Offer"**

### Activating or Deactivating an Offer

1. Find the offer row
2. Click the **toggle switch** in the Action column (green = ON, grey = OFF)
3. State flips immediately — no confirmation dialog

> **Warning:** Toggling OFF removes the offer from customer-facing pricing **instantly**, even during an active campaign. Buyers currently in the booking flow will see the price change.

### Deleting an Offer

1. Find the offer row
2. Click the **delete icon** (trash) in the Action column
3. Confirmation dialog: "Are you sure you want to delete this offer? This action cannot be undone."
4. Click **"Yes, delete"** to confirm

> Deletion is **permanent and irreversible**. The Sr.No. will have a permanent gap.

### Refreshing the List

1. Click **"Refresh"** button to reload data from the server

---

## 5. Business Rules

1. Offer Type (Amount Based / Percentage Based) is mutually exclusive — selecting one clears the other
2. Start Date must be ≤ End Date — date range enforced by picker
3. Offer Name has a maximum length of 100 characters
4. Description is optional with a maximum length of 500 characters
5. Typology is optional — when empty, offer applies to all unit types
6. Toggle OFF immediately removes offer from customer-facing pricing with no confirmation
7. Sr.No values are DB primary keys — non-contiguous gaps confirm hard deletes
8. All UAT offers observed are Amount Based — Percentage column shows "-" for Amount Based offers
9. Offer count badge counts all offers regardless of status (active + inactive)
10. Offer deletion is permanent and irreversible ("cannot be undone")

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Allocation | Active offers appear as line-item discounts on unit selection detail panel during customer booking |
| Config CMS | Unit Cost Update sets Agreement Value; Offers set discounts on top |
| Towers | Typology-scoped offers apply to specific unit types shown in tower inventory |

### Pricing Formula (confirmed from Allocation unit selection panel)
```
Agreement Value (base)
- Home Loan Offer Discount
- Early Bird Benefit Discount
= All Inclusive Price
```

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Toggle OFF has no confirmation dialog | HIGH | Admin can accidentally deactivate an active offer mid-campaign; immediately re-prices all active customer selections |
| Toggle OFF mid-booking behavior | HIGH | Undefined — customer in mid-selection when offer is toggled OFF may see inconsistent pricing |
| Offer end date expiry mid-booking | MEDIUM | Undefined behavior — no confirmed rule for what happens when End Date passes while customer is in the booking flow |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-OFFERS-001 | Is search/filter planned for offers list page? | TC scope | ⏳ Open |
| Q-OFFERS-002 | Is Offer Name required to be unique system-wide? (Multiple "VC request" rows exist — suggests NOT unique) | Validation TC | ⏳ Open |
| Q-OFFERS-003 | Does toggling an offer OFF mid-allocation re-price the customer's active selection immediately? | Critical integration TC | ⏳ Open |
| Q-OFFERS-004 | When offer End Date passes while customer is mid-booking with that offer applied — does system re-price or honor locked offer? | Edge case TC | ⏳ Open |
| Q-OFFERS-005 | Delete confirmation dialog text? | ✅ Resolved: "Are you sure you want to delete this offer?" / "Yes, delete" | ✅ Resolved |
| Q-OFFERS-006 | Full typology dropdown values? | ✅ Resolved: 1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Peak Home / 2 Bed Rise Home | ✅ Resolved |

## 9. Test Coverage

| TC | Description | Result |
|----|-------------|--------|
| TC-OFFERS-001 | Page load + count > 0 | ✅ Pass |
| TC-OFFERS-002 | Table column headers + data types (currency/dates) | ✅ Pass |
| TC-OFFERS-003 | Non-contiguous Sr. No. confirmed (gaps = hard deletes) | ✅ Pass |
| TC-OFFERS-004 | Add drawer opens with all required fields | ✅ Pass |
| TC-OFFERS-005 | Create offer → verify in table → delete (cleanup) | ✅ Pass |
| TC-OFFERS-006 | Empty submit → required field validation errors shown | ✅ Pass |
| TC-OFFERS-007 | Edit drawer pre-fills all existing values | ✅ Pass |
| TC-OFFERS-008 | Edit offer → round-trip update verified in table | ✅ Pass |
| TC-OFFERS-009 | Toggle OFF → state persists after refresh | ✅ Pass |
| TC-OFFERS-010 | Toggle ON and back to OFF | ✅ Pass |
| TC-OFFERS-011 | Typology dropdown shows all 4 options | ✅ Pass |
| TC-OFFERS-012 | Refresh button reloads data, count unchanged | ✅ Pass |

**Not yet tested:**
- Percentage-based offers (no UAT data)
- Expired offer behavior (requires time manipulation)
- Search/filter (not present — Q-OFFERS-001)
- Pricing integration during live campaign (cross-module; ENV SKIP on UAT)

**UAT Data (observed 2026-05-08):**

| Sr | Name | Amount | Status |
|----|------|--------|--------|
| 10 | VK test | ₹10,000 | OFF |
| 9 | VC request | ₹75,000 | ON |
| 8 | VC request | ₹75,000 | ON |
| 7 | VC request | ₹75,000 | ON |
| 3 | VC request | ₹50,000 | ON |
| 1 | Home Loan Discount | ₹10,000 | OFF |

---

## 10. Data Model

### Offer (offers table)

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT UNSIGNED PK | Auto-increment — gaps in sequence = deleted offers |
| `projectId` | BIGINT UNSIGNED FK → projects | Offers are project-scoped |
| `unitTypologyId` | BIGINT UNSIGNED FK → unit_typologies | NULL = applies to all typologies |
| `name` | STRING(100) NOT NULL | Display name; NOT unique system-wide (multiple "VC request" rows confirmed) |
| `offerCode` | ENUM('HOME_LOAN','VC_REQUEST') NULLABLE | System-generated offers only; admin-created offers have NULL offerCode |
| `description` | STRING(500) NULLABLE | |
| `offerType` | ENUM('AMOUNT','PERCENTAGE') DEFAULT 'AMOUNT' | |
| `amount` | DECIMAL(10,2) | Used when offerType = AMOUNT |
| `percentage` | DECIMAL(10,2) | Used when offerType = PERCENTAGE |
| `startDate` | DATE NOT NULL | |
| `endDate` | DATE NOT NULL | |
| `isActive` | BOOLEAN DEFAULT true | Toggle state |
| `createdBy` | BIGINT UNSIGNED FK → users | Admin who created |
| `deletedAt` | DATE | Soft delete (paranoid: true) |

### offerCode System Values

| offerCode | Trigger | Offer Name (UAT) |
|-----------|---------|-----------------|
| `HOME_LOAN` | Admin manually creates; shown on unit if buyer has approved home loan | "Home Loan Discount" |
| `VC_REQUEST` | Auto-created by system when SM records `vcOutcome = VC_DONE_PREFERENCE` or `VC_2_DONE` | "VC request" |
| NULL | Admin-created offers with no system code | Any name |

### processOffers Race Condition (from allocation.service.js)

Offer eligibility is computed **live at allocation submission time**, not when customer opens unit selection:

```js
// At allocation submit — live DB query
WHERE isActive = 1 AND startDate <= TODAY AND endDate >= TODAY
```

**Risk:** If an offer is toggled OFF or its end date passes between the moment a customer sees pricing and the moment they submit, the discount disappears from the final booking without warning.

---

## 11. API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/offers` | List all offers (paginated, filtered) |
| POST | `/api/v1/admin/offers` | Create new offer |
| PUT | `/api/v1/admin/offers/:id` | Update offer (name, amount, dates, typology) |
| PATCH | `/api/v1/admin/offers/:id/toggle` | Toggle isActive ON/OFF (no request body needed) |
| DELETE | `/api/v1/admin/offers/:id` | Soft-delete offer (paranoid — sets deletedAt) |

**Toggle endpoint:** `PATCH /offers/:id/toggle` — flips `isActive` atomically. No confirmation. Effective immediately system-wide.

**Delete behavior:** Soft-delete via Sequelize paranoid. `deletedAt` set on record. Offer disappears from all queries. Sr.No gaps in UI because `id` auto-increment keeps incrementing after deleted rows.
