---
module: Channel Partners
url: https://uat-web.xrportal.in/admin/channel-partners
sprint: 3
status: Automated
spec: tests/ui/channel-partners.spec.js
tcs: TC-CP-001–006 + TC-CP-003b + TC-CP-005b + TC-CP-008–012 (13 tests; TC-CP-007 removed)
updated: 2026-05-10
---

# Module — Channel Partners

## 1. Overview

Manages channel partner (broker/agent) accounts. Large dataset (2705 CPs). Supports phone-based search, drawer-based CP detail view, Master CP mapping, and "Mark as Master" designation.

**URL:** `https://uat-web.xrportal.in/admin/channel-partners`
**Auth:** Required — `src/fixtures/.auth/admin.json`
**Page Object:** `src/pages/ChannelPartnersPage.js`
**Selectors:** `docs/selectors/channel-partners.json`

## 2. Navigation

Left sidebar → "Channel Partners" → `/admin/channel-partners`

## 3. Page Layout

### Header

| Element | Description |
|---------|-------------|
| Title | "2705 Channel Partners" — static total count (does NOT update on search) |
| Map Master CP button | Disabled until row(s) selected; opens modal with Master HV Code dropdown |
| Reset Filters button | Clears search input + restores baseline table rows |
| Refresh button | Reloads data from server |

### Search Bar

Phone number input in header area — filters table rows server-side. Not a standard `ant-input` — check selector carefully.

### CP Table (13 columns)

Owner Name | Firm Name | HV Code | Master HV Code | Business Region | Pincode | Phone | CP Type | SM Name | SM Email ID | SM Mobile Number | KYC Status | Actions

**Column filter types:**

| Column | Filter Type | Notes |
|--------|-------------|-------|
| Owner Name | Search (magnifying glass icon) | — |
| Firm Name | Search icon | — |
| HV Code | Search icon | — |
| Pincode | Search icon | — |
| Master HV Code | Filter (funnel icon) | — |
| Business Region | Filter icon | — |
| CP Type | Filter icon | Values include: Master CP, Member CP |

**CP Type values observed:** Master CP, Member CP

### Row Actions

| Action | Trigger | Description |
|--------|---------|-------------|
| View CP detail | Eye icon | Opens CP detail drawer |
| Mark as Master | … (3-dot) dropdown | Dropdown also contains nav-type items — filter specifically for "Mark as Master" |
| Map Master CP | Row checkbox + "Map Master CP" header button | Modal with Master HV Code dropdown |

### CP Detail Drawer

Trigger: Eye icon on any row
Component: Ant Design drawer (`.ant-drawer-body`)
Drawer title: "Channel Partner Details"
Close: `.ant-drawer-close` button

**Drawer sections (confirmed from TC-CP-006):**
1. Basic Information
2. Firm Details
3. Contact Details
4. Additional Details

**Key fields visible:** HV Code, Owner Name, Phone, KYC Status
**KYC Status valid values:** Pending / Approved / Rejected / Verified

**Test CP data (two confirmed CPs):**

| Phone | Type | Owner | HV Code |
|-------|------|-------|---------|
| 8888888888 | Master CP | (name confirmed in test) | (HV code in page object) |
| 7888888888 | Member CP | (name confirmed in test) | (HV code in page object) |

> Reference spec for exact field values: `tests/ui/channel-partners.spec.js` TC-CP-005 and TC-CP-005b assertions.

### Map Master CP Modal

Available when ≥ 1 row is selected via row checkbox.
Modal title: "Map CPs to Master"
Modal body: Contains "Master HV Code" selector + note about mapping N CP(s).
Opens a modal with a Master HV Code dropdown to assign the master relationship.

## 4. Features

- Browse 2705+ channel partner records
- Phone-number search (server-side filtering)
- Reset filters / restore full list
- View CP details in drawer
- Mark CP as Master via 3-dot dropdown
- Map Master CP via multi-select modal
- CP portal login verification (E2E test — TC-CP-012)

## 4a. How to Use

### Browsing Channel Partners

1. Left sidebar → click **"Channel Partners"**
2. Table loads all CPs (total count shown in header, e.g. "2705 Channel Partners")
3. Scroll through rows or use filters to find specific CPs

### Searching by Phone Number

1. Enter the CP's phone number in the search box at the top
2. Table filters to show matching rows (server-side search)
3. Click **"Reset Filters"** to clear the search and restore all records

> The header count ("2705 Channel Partners") does NOT change when you search — it always shows the total.

### Using Column Filters

1. Click the **search icon** (magnifying glass) on columns: Owner Name, Firm Name, HV Code, Pincode — type to filter
2. Click the **filter icon** (funnel) on columns: Master HV Code, Business Region, CP Type — select values
3. To clear all filters → click **"Reset Filters"**

### Viewing CP Details

1. Find the CP row in the table
2. Click the **eye icon** in the Actions column
3. A detail drawer opens from the right showing: Basic Information, Firm Details, Contact Details, Additional Details
4. Key fields: HV Code, Owner Name, Phone, KYC Status
5. Click **X** to close the drawer

### Mapping a CP to a Master CP

1. Select one or more CP rows using the row checkboxes
2. The **"Map Master CP"** button (header) becomes enabled
3. Click **"Map Master CP"** → modal opens with title "Map CPs to Master"
4. Select the Master HV Code from the dropdown
5. Confirm to complete the mapping

### Refreshing the Table

1. Click **"Refresh"** button to reload data from the server without navigating away

---

## 5. Business Rules

1. Header count "2705 Channel Partners" is a static total — it does NOT update when search filters are applied
2. Search filters table rows server-side by phone number
3. Reset Filters clears the input AND triggers a re-fetch; wait for table to reload before asserting
4. "Map Master CP" button is disabled when no rows are selected
5. TC-CP-007 (Mark as Master via button flow) was removed — feature is deferred or out of scope (Q-CP-002)
6. SM Name / SM Email / SM Mobile columns show assigned SM data — data source and update mechanism unclear (Q-CP-001)
7. CP portal login: phone `8888888888`, OTP `147258`
8. Test CP: phone `8000000002`, owner "Testing uat CP", HV code `HV00026097`

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Sales Managers | SM Name / SM Email / SM Mobile columns in CP table reflect assigned SM — relationship and data flow unclear |
| Customers | Channel partners are assigned to customers as Growth Partners (HV Code visible in Customers table) |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| SM-CP relationship data flow unclear | MEDIUM | SM columns in CP table — source of data and update mechanism unknown (Q-CP-001) |
| "Mark as Master" deferred | INFO | TC-CP-007 removed; if feature re-introduced, test case needed |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-CP-001 | What is the relationship between SM columns (SM Name/Email/Mobile) in CP table and the Sales Managers module? Are these auto-populated from SM assignments? | Integration test scope | ⏳ Open |
| Q-CP-002 | TC-CP-007 (Mark as Master) was removed — is this feature deferred or permanently out of scope? | Test scope | ⏳ Open |

## 9. Test Coverage

| TC | Priority | Description | Result |
|----|----------|-------------|--------|
| TC-CP-001 | P1 Smoke | Page loads with "2705 Channel Partners" count in title | ✅ Pass |
| TC-CP-002 | P1 Smoke | Table has all 13 required columns | ✅ Pass |
| TC-CP-003 | P1 | Search by phone "8888888888" → Master CP row with correct owner/HV code | ✅ Pass |
| TC-CP-003b | P1 | Search by phone "7888888888" → Member CP row with correct owner/HV code | ✅ Pass |
| TC-CP-004 | P1 | Reset Filters clears search, restores full list | ✅ Pass |
| TC-CP-005 | P1 | Eye icon opens Master CP (8888888888) drawer with correct fields | ✅ Pass |
| TC-CP-005b | P1 | Eye icon opens Member CP (7888888888) drawer with correct fields | ✅ Pass |
| TC-CP-006 | P2 | Drawer shows all 4 sections (Basic Information, Firm Details, Contact Details, Additional Details) and valid KYC status | ✅ Pass |
| TC-CP-007 | REMOVED | Mark as Master — deferred (Q-CP-002) | — |
| TC-CP-008 | P1 | Map Master CP button disabled by default; enabled after row selection | ✅ Pass |
| TC-CP-009 | P1 | Map Master CP modal opens with title "Map CPs to Master" and Master HV Code selector | ✅ Pass |
| TC-CP-010 | P2 | Refresh button reloads data without changing total count | ✅ Pass |
| TC-CP-011 | P1 | All filterable columns have correct icons; CP Type filter returns correct results; Reset restores full list | ✅ Pass |
| TC-CP-012 | P2 | Filter by Master HV Code → verify CP rows → login to CP portal → check All Team Leads (E2E) | ✅ Pass |

**Drawer field details (from TC-CP-005/005b):**
- Drawer title: "Channel Partner Details"
- Key fields confirmed: HV Code, KYC Status, Owner Name, Phone
- Section headings: Basic Information · Firm Details · Contact Details · Additional Details
- KYC Status valid values: Pending / Approved / Rejected / Verified

**Column filter details (from TC-CP-011):**
- Search icon columns: Owner Name, Firm Name, HV Code, Pincode
- Filter icon columns: Master HV Code, Business Region, CP Type
- CP Type filter value confirmed: "Master CP"
- After Reset: count returns to full total

**Key technical notes:**
- Search input is NOT a standard `ant-input` — verify selector from page object
- `… dropdown`: `.ant-dropdown-menu` — filter items by text, do not rely on position
- `clickResetFilters()`: clears input AND triggers re-fetch; wait for table reload
- TC-CP-012: Two-step E2E — admin applies Master HV filter, then CP portal login confirms "All Team Leads" section

---

## 10. API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/cp` | Paginated CP list with search + filters |
| GET | `/api/v1/admin/cp/masters` | List of Master CPs only (for Map Master dropdown) |
| GET | `/api/v1/admin/cp/:id` | Single CP detail (for drawer) |
| PUT | `/api/v1/admin/cp/:id/mark-master` | Mark CP as Master type |
| PUT | `/api/v1/admin/cp/map-master` | Map selected CPs to a Master HV Code (JSON body: `{ cpIds: [], masterHvCode: '' }`) |
| POST | `/api/v1/admin/cp/bulk-map-excel` | Bulk map CPs to master via Excel upload (field: `doc`) |

**Query params for GET `/cp`:**
- `page`, `limit` — pagination
- `phone` — phone number search (server-side filter)
- `cpType` — filter by CP type (Master CP / Member CP)
- `masterHvCode` — filter by master HV code
- `businessRegion` — filter by region

### KYC Status Source

KYC Status in CP drawer (Pending / Approved / Rejected / Verified) comes from the CP's user profile, NOT from the Admin Customers KYC flow. CPs have their own KYC process managed through the CP Portal. **On UAT, KYC status is hardcoded as 'pending'** for all test CPs — the KYC approval flow is not exercised in automated tests.

### Master CP vs Member CP Logic

- A CP starts as Member CP by default on registration
- Admin can `PUT /cp/:id/mark-master` to elevate to Master CP
- Master CPs appear in the Map Master dropdown — they can have Member CPs mapped under them
- `PUT /cp/map-master` sets `masterHvCode` on selected Member CP records to point to the Master
