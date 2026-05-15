---
type: feature-spec
portal: Admin Portal
module: Channel Partners
updated: 2026-05-11
status: complete
---

# Admin Portal — Channel Partners Module Feature Specifications

**URL:** `/admin/channel-partners` — Manages broker/agent (channel partner) accounts. Large dataset (~2705 CPs). Supports phone search, drawer-based detail view, Master CP designation, and Master CP mapping.

---

# Feature 1: View Channel Partner List

## 1. Objective
Provide admins a paginated, searchable table of all registered channel partners, with their firm details, HV codes, assigned sales manager, KYC status, and CP type visible at a glance.

## 2. Scope
Full-page view at `/admin/channel-partners`.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Page heading: "2705 Channel Partners" — static total count (does NOT update when search or filters are applied).
- "Map Master CP" button (disabled until row(s) selected).
- "Reset Filters" button.
- "Refresh" button.
- Phone number search input.
- Paginated CP table.

## 5. Table Columns

| Column | Filter Type | Notes |
|--------|------------|-------|
| Owner Name | Search icon | Free-text search |
| Firm Name | Search icon | Free-text search |
| HV Code | Search icon | CP's unique HoABL Venture code |
| Master HV Code | Filter icon | HV Code of the assigned Master CP |
| Business Region | Filter icon | Geographic region |
| Pincode | Search icon | CP's registered pincode |
| Phone | No filter | CP's registered mobile |
| CP Type | Filter icon | Master CP / Member CP |
| SM Name | No filter | Assigned Sales Manager's name |
| SM Email ID | No filter | Assigned SM's email |
| SM Mobile Number | No filter | Assigned SM's mobile |
| KYC Status | No filter | Pending / Approved / Rejected / Verified |
| Actions | No filter | Eye icon (view detail) + 3-dot menu |

## 6. Validations & Business Rules
1. Total count "2705 Channel Partners" is static — it always shows the system total, regardless of active search or filter.
2. SM Name / SM Email / SM Mobile columns reflect the SM assigned to the CP — data source and update mechanism managed by the backend.
3. KYC Status reflects the CP's own KYC process (via CP Portal) — not the Admin Customers KYC flow.

## 7. System Actions
- `GET /api/v1/admin/cp` with `page`, `limit`, `phone`, `cpType`, `masterHvCode`, `businessRegion` query params.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only list view.

## How to Use

1. **Navigate to Channel Partners:** Go to `/admin/channel-partners` from the left sidebar.
2. **View the list:** All 2705 Channel Partners are shown in a paginated table with firm details, HV codes, CP type, assigned SM, and KYC status.
3. **Note the count badge:** "2705 Channel Partners" in the heading is a fixed system total — it does not change when you search or filter.
4. **Key columns to check:**
   - **CP Type:** Master CP or Member CP — determines the hierarchy.
   - **Master HV Code:** The HV code of the Master CP this member is mapped to (if any).
   - **KYC Status:** Reflects the CP's own KYC verification status from the CP Portal.
5. **Navigate pages:** Use pagination controls to browse through the full list.

---

# Feature 2: Search by Phone Number

## 1. Objective
Allow admins to quickly locate a specific channel partner by their registered mobile number.

## 2. Scope
Phone number search input in the page header. Filters the table server-side.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Phone search input in the header area.

## 5. Behaviour
- Enter a phone number → table rows filter to matching CP(s).
- Total count badge does NOT update — always shows system total.
- "Reset Filters" button clears the search input and restores the full unfiltered list.

## 6. Validations & Business Rules
1. Search filters server-side by phone number — partial or full number accepted.
2. Reset Filters triggers a full data re-fetch — wait for table to reload before asserting result count.

## 7. System Actions
- `GET /api/v1/admin/cp?phone=<number>` — returns matching CP records.

## 8. Notifications
None.

## 9. Audit & Logging
None for search queries.

## How to Use

1. **Click the phone search input** in the Channel Partners page header.
2. **Type the phone number** (partial or full — e.g., type "98765" to find CPs with that number prefix).
3. **The table filters** to show only matching Channel Partners.
4. **Reset:** Click "Reset Filters" to clear the search and restore the full list.

---

# Feature 3: Filter by Column

## 1. Objective
Allow admins to filter the CP list by CP type, business region, or master HV code to analyse specific segments of the channel partner network.

## 2. Scope
Column filter icons on applicable columns in the CP table.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Search icon on: Owner Name, Firm Name, HV Code, Pincode columns (free-text).
- Filter icon (funnel) on: Master HV Code, Business Region, CP Type columns (dropdown selection).

## 5. Filter Details

| Column | Filter Type | Values |
|--------|------------|--------|
| Owner Name | Free-text search | — |
| Firm Name | Free-text search | — |
| HV Code | Free-text search | — |
| Pincode | Free-text search | — |
| Master HV Code | Dropdown | HV codes of all Master CPs |
| Business Region | Dropdown | Geographic regions configured in the system |
| CP Type | Dropdown | Master CP / Member CP |

## 6. Validations & Business Rules
1. Column filters can be combined with the phone search input.
2. After filtering by CP Type = "Master CP", only Master CP rows appear.
3. Reset Filters clears all active filters and restores the full list.

## 7. System Actions
- `GET /api/v1/admin/cp?cpType=<value>&masterHvCode=<code>&businessRegion=<region>`

## 8. Notifications
None.

## 9. Audit & Logging
None for filter queries.

## How to Use

1. **Click a filter/search icon** on the column you want to filter:
   - **Search icon (magnifier):** On Owner Name, Firm Name, HV Code, Pincode — type a value in the text input that appears.
   - **Filter icon (funnel):** On Master HV Code, Business Region, CP Type — select a value from the dropdown that appears.
2. **Apply the filter:** Select or type your filter value. The table updates to show only matching rows.
3. **Common use cases:**
   - Filter CP Type = "Master CP" to see only Master CPs.
   - Filter Business Region to see CPs from a specific region.
   - Filter Master HV Code to see all Member CPs mapped under a specific Master.
4. **Reset:** Click "Reset Filters" to clear all active filters and return to the full list.

---

# Feature 4: View Channel Partner Detail Drawer

## 1. Objective
Allow admins to inspect the full profile of a channel partner — including personal details, firm information, contact information, and KYC status — without leaving the CP list page.

## 2. Scope
Eye icon in the Actions column of each CP row opens a detail drawer sliding from the right.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Eye icon on each CP row.
- Clicking opens a right-side drawer with title "Channel Partner Details".
- Close button (×) in drawer header.

## 5. Drawer Sections

| Section | Key Fields |
|---------|-----------|
| Basic Information | HV Code, Owner Name, CP Type |
| Firm Details | Firm Name, Business Region, Pincode |
| Contact Details | Phone, Email |
| Additional Details | KYC Status, Master HV Code |

**KYC Status values:** Pending / Approved / Rejected / Verified

> **Note:** KYC Status in the CP drawer comes from the CP's own KYC process (managed through the CP Portal), not from the Admin Customers KYC flow.

## 6. Validations & Business Rules
1. Drawer is read-only — no edits can be made from it.
2. All 4 sections (Basic Information, Firm Details, Contact Details, Additional Details) are always shown — no conditional sections.
3. KYC Status on UAT environment is `Pending` for most test CPs — KYC approval flow is managed externally.

## 7. System Actions
- `GET /api/v1/admin/cp/:id` — fetches full CP detail record for the drawer.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only drawer view.

## How to Use

1. **Find the CP row** in the Channel Partners table.
2. **Click the eye icon** in the Actions column.
3. **View the drawer:** A panel slides in from the right showing the CP's full profile:
   - **Basic Information:** HV Code, Owner Name, CP Type (Master/Member).
   - **Firm Details:** Firm Name, Business Region, Pincode.
   - **Contact Details:** Phone and Email.
   - **Additional Details:** KYC Status and Master HV Code (if mapped).
4. **Close the drawer:** Click the × button in the drawer header.
5. **Note:** This is read-only — no changes can be made from the drawer.

---

# Feature 5: Mark CP as Master

## 1. Objective
Allow admins to designate a Member CP as a Master CP, elevating their role so they can have other Member CPs mapped under them.

## 2. Scope
3-dot (…) menu in the Actions column of each CP row → "Mark as Master" option.

## 3. Eligibility / Preconditions
- CP must currently be a Member CP.
- Admin session required.

## 4. UI Changes
- 3-dot (…) menu on each CP row.
- Menu contains "Mark as Master" option (may contain additional navigation items — use text-based filter to target this option specifically).

## 5. Behaviour
- Selecting "Mark as Master" updates the CP's type from Member CP to Master CP.
- The CP's HV Code then becomes available in the Map Master CP modal's dropdown.

## 6. Validations & Business Rules
1. Once marked as Master, the CP appears in the Master HV Code dropdown for mapping operations.
2. A Master CP can have multiple Member CPs mapped under them.
3. The operation takes effect immediately — no confirmation dialog.

## 7. System Actions on Click
1. `PUT /api/v1/admin/cp/:id/mark-master`
2. CP record `cpType` updated to `Master CP`.
3. CP now available in the Map Master dropdown.

## 8. Notifications
None — no CP notification when marked as Master.

## 9. Audit & Logging
- Admin user ID, CP ID, CP HV Code, action (marked as Master), timestamp logged.

## How to Use

1. **Find the Member CP row** you want to elevate to Master.
2. **Click the 3-dot (…) menu** in the Actions column on that row.
3. **Select "Mark as Master"** from the menu options.
4. **Result:** The CP's type immediately changes from "Member CP" to "Master CP". Their HV Code becomes available in the Master HV Code dropdown when mapping other Member CPs. No confirmation dialog appears — the action is immediate.

---

# Feature 6: Map Member CPs to a Master CP

## 1. Objective
Allow admins to establish a hierarchical relationship between channel partners by mapping one or more Member CPs under a designated Master CP.

## 2. Scope
Multi-row selection via row checkboxes + "Map Master CP" button in the page header opens a mapping modal.

## 3. Eligibility / Preconditions
- At least one CP row must be selected via checkbox.
- At least one Master CP must exist in the system (to be available in the dropdown).
- Admin session required.

## 4. UI Changes
- Row checkboxes for multi-select.
- "Map Master CP" button — disabled by default; enabled when ≥ 1 row is selected.
- Clicking opens "Map CPs to Master" modal.

## 5. Form Details (Modal)

| Element | Type | Description |
|---------|------|-------------|
| Modal Title | — | "Map CPs to Master" |
| Note | Text | Shows count of selected CP(s) to be mapped |
| Master HV Code | Dropdown | List of all current Master CPs' HV Codes |
| Confirm Button | Button | Executes the mapping |
| Cancel Button | Button | Closes modal without changes |

## 6. Validations & Business Rules
1. "Map Master CP" button is disabled when no rows are selected.
2. Selecting a Master HV Code and confirming sets `masterHvCode` on all selected Member CP records.
3. The mapped relationship is immediately visible in the Master HV Code column of the CP table.
4. A CP can only have one Master CP at a time — remapping replaces the existing master relationship.

## 7. System Actions on Confirm
1. `GET /api/v1/admin/cp/masters` — fetches Master CP list for the dropdown (on modal open).
2. `PUT /api/v1/admin/cp/map-master` — payload: `{ cpIds: [<id1>, <id2>...], masterHvCode: '<hv_code>' }`.
3. `masterHvCode` field updated on all selected CP records immediately.

## 8. Notifications
None — no CP notification when mapped to a master.

## 9. Audit & Logging
- Admin user ID, list of CP IDs mapped, Master HV Code assigned, timestamp logged.

## How to Use

1. **Select CP rows to map:** Check the checkbox on each Member CP row you want to map under a Master. You can select multiple rows.
2. **Click "Map Master CP":** The button in the page header becomes active once at least one row is selected. Click it to open the mapping modal.
3. **Review the count:** The modal shows how many CPs are selected for mapping.
4. **Select the Master HV Code:** Choose the Master CP's HV Code from the dropdown. This dropdown lists all CPs who have been marked as Master.
5. **Click Confirm:** The selected Member CPs are mapped under the chosen Master CP immediately.
6. **Result:** The Master HV Code column in the CP table updates to show the assigned master for each mapped CP. If a CP was previously mapped to a different Master, the new mapping replaces it.
