---
type: feature-spec
portal: Admin Portal
module: Towers
updated: 2026-05-11
status: complete
---

# Admin Portal — Towers Module Feature Specifications

**URL:** `/admin/towers` — Read-only inventory view. No create, edit, or delete operations from this page. All tower and unit modifications are performed via Config CMS.

---

# Feature 1: View Tower & Unit KPI Dashboard

## 1. Objective
Provide admins an at-a-glance summary of the entire project inventory — total towers, active/inactive towers, and unit availability counts — without needing to navigate into individual towers.

## 2. Scope
KPI summary cards at the top of the Towers page, visible immediately on page load.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Two rows of KPI cards displayed at the top of the page.
- Counts update automatically when tower or unit state changes in Config CMS.

## 5. KPI Cards

| Card | Metric Definition |
|------|------------------|
| Total Towers | Count of all towers in the system (fixed: 18) |
| Active Towers | Towers currently toggled Active in Config CMS Tower Configuration |
| Inactive Towers | Towers currently toggled Inactive in Config CMS |
| Total Units | All units across all towers regardless of status |
| Available Units | Units with `status = AVAILABLE` |
| Sold Units | Units with `status = BOOKED` |
| Disabled Units | Units with `status = REFUGE / RESERVED / PBT` |

## 6. Validations & Business Rules
1. KPI counts are live — they reflect the current database state, not a cached snapshot.
2. Toggling a tower Active/Inactive in Config CMS updates the Active Towers / Inactive Towers KPI here.
3. A booking completed during an allocation campaign immediately increments Sold Units and decrements Available Units.

## 7. System Actions
- `GET /api/v1/admin/tower-kpi` — returns aggregate counts for all KPI cards on page load.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only view.

## How to Use

1. **Navigate to Towers:** Go to `/admin/towers` from the left sidebar.
2. **Read the KPI cards** at the top of the page:
   - **Total Towers:** Always 18 (all project towers).
   - **Active / Inactive Towers:** How many towers are currently toggled on or off in Config CMS.
   - **Total Units / Available / Sold / Disabled:** Current inventory counts across all towers.
3. **Note:** These counts are live — they update whenever a booking is completed, a unit status changes, or a tower is toggled in Config CMS. No manual refresh needed.

---

# Feature 2: Browse Tower List (Sidebar Navigation)

## 1. Objective
Allow admins to select a specific tower from the sidebar list to load that tower's floor/unit grid for detailed inventory inspection.

## 2. Scope
Tower list sidebar on the left side of the Towers page. All 18 project towers are listed.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Sidebar listing all 18 towers.
- Active towers: selectable; display format — Tower Name + "N Units Available" count.
- Inactive towers: selectable but labelled "(Inactive)".

## 5. Tower List

**All 18 towers:**
Crest · Crown · Blossom · Bright · Pinnacle · Triumph · Prestige · Horizon · Dawn · Aura · Glory · Pride · Grace · Aspire · Prime · Fortune · Radiance · Grand

## 6. Validations & Business Rules
1. All 18 towers appear in the sidebar regardless of Active/Inactive state.
2. Inactive towers display an "(Inactive)" label.
3. Clicking any tower (Active or Inactive) loads that tower's floor/unit grid in the main area.
4. Tower active/inactive state is controlled exclusively in Config CMS → Tower Configuration.

## 7. System Actions
- `GET /api/v1/admin/towers` — loads all towers with their status and unit availability counts for the sidebar.
- Selecting a tower triggers `GET /api/v1/admin/units-by-tower/:towerId` to load the grid.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only view.

## How to Use

1. **Look at the left sidebar** on the Towers page — all 18 towers are listed with their available unit counts.
2. **Identify active vs inactive:** Active towers show their name and "N Units Available". Inactive towers show the "(Inactive)" label.
3. **Click any tower name** to load that tower's floor/unit grid in the main content area.
4. **Switch towers:** Click a different tower in the sidebar at any time to switch to that tower's grid.

---

# Feature 3: View Floor / Unit Grid

## 1. Objective
Allow admins to inspect the floor-by-floor unit availability layout for a selected tower, with colour-coded unit status cells showing at a glance which units are available, sold, or reserved.

## 2. Scope
Main content area of the Towers page. Loads when a tower is selected from the sidebar.

## 3. Eligibility / Preconditions
- Admin session required.
- A tower must be selected from the sidebar.

## 4. UI Changes
- Grid header: Tower-level stats (Total / Available / Sold / Disabled unit counts for the selected tower).
- Grid body: Floors as rows; units as cells, colour-coded by status.

## 5. Unit Colour Coding

| Colour | DB Status | Meaning | Clickable |
|--------|-----------|---------|-----------|
| White / light border | `AVAILABLE` | Available for selection | Yes — opens Unit Detail Drawer |
| Green | Selected (session) | Selected by a buyer in current session | No |
| Red | `BOOKED` | Sold / confirmed booking | No |
| Orange | `HOLD` | Another buyer is paying right now | No |
| Grey | `REFUGE` / `RESERVED` / `PBT` | Reserved or blocked — not for sale | No |

## 6. Validations & Business Rules
1. This is a read-only view — clicking a unit does NOT initiate any booking or reservation.
2. Only Available (white) units open the Unit Detail Drawer on click.
3. Sold (red), orange, and grey units are not clickable — clicking has no effect.
4. Grid loads fresh from server when a tower is selected — not cached from a previous visit.
5. Grid header stats update when a different tower is selected from the sidebar.

## 7. System Actions
- `GET /api/v1/admin/units-by-tower/:towerId` — returns all unit records for the selected tower including floor number, unit number, and current status.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only view.

## How to Use

1. **Select a tower** from the left sidebar to load its floor/unit grid.
2. **Read the grid header stats:** Total, Available, Sold, and Disabled unit counts for the selected tower appear above the grid.
3. **Read the colour coding:**
   - **White cells** = Available units (can be clicked to view pricing details).
   - **Red cells** = Sold/Booked units.
   - **Orange cells** = Units currently being paid by a buyer (in-progress payment).
   - **Grey cells** = Reserved, refuge, or blocked units — not for sale.
4. **Click a white (Available) cell** to open the Unit Detail Drawer with pricing information.
5. **This is read-only:** No booking, reservation, or data change can be made from this view.

---

# Feature 4: View Unit Detail Drawer

## 1. Objective
Allow admins to inspect the full pricing and typology details of any available unit by clicking on it in the floor/unit grid, without leaving the Towers page.

## 2. Scope
Unit Detail Drawer that slides in from the right side of the page when an Available unit cell is clicked in the grid.

## 3. Eligibility / Preconditions
- Admin session required.
- A tower must be selected (grid loaded).
- The clicked unit must have `status = AVAILABLE` (white cell).

## 4. UI Changes
- Clicking an Available unit cell opens a right-side drawer panel.
- Non-available units (red, orange, grey) do NOT open the drawer.

## 5. Drawer Fields

| Field | Example |
|-------|---------|
| Unit No | "3502 – Crest" |
| BHK Type | "1 BHK Growth Home" |
| Size | "323 sq.ft." |
| Agreement Value | ₹32,99,000 |
| Early Bird Benefit | ₹27,000 |
| All Inclusive Price | Calculated total |

## 6. Validations & Business Rules
1. Drawer is read-only — no actions, edits, or bookings can be initiated from it.
2. Drawer only opens for AVAILABLE units. Clicking any other unit status has no effect.
3. Agreement Value displayed here is the current value from the Unit record — it reflects any bulk pricing updates made via Config CMS → Unit Cost Update.
4. Early Bird Benefit reflects the `earlyBirdBenefit` field from the Unit record.
5. Close the drawer by clicking the close (×) button or clicking outside the drawer area.

## 7. System Actions
- No additional API call — drawer data is included in the grid data already loaded by `GET /api/v1/admin/units-by-tower/:towerId`.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only view.

## How to Use

1. **Select a tower** from the sidebar and **click a white (Available) unit cell** in the floor/unit grid.
2. **View the drawer:** A panel slides in from the right showing:
   - Unit number and tower name
   - BHK type and size
   - Agreement Value (current base price)
   - Early Bird Benefit (discount)
   - All Inclusive Price (calculated total)
3. **Close the drawer:** Click the × button in the drawer header, or click anywhere outside the drawer.
4. **Note:** This is read-only — no booking or change can be made from this drawer.

---

# Feature 5: Cross-Module Navigation ("View Tower >")

## 1. Objective
Allow admins to navigate directly from the Config CMS Tower Configuration section to a specific tower's unit grid in the Towers module, without having to manually locate the tower in the sidebar.

## 2. Scope
"View Tower >" link on each tower card in Config CMS → Section 1 (Tower Configuration).

## 3. Eligibility / Preconditions
- Admin session required.
- Admin must be on the Config CMS page (`/admin/cms`).

## 4. UI Changes
- "View Tower >" link on each of the 18 tower cards in the Config CMS Tower Configuration section.

## 5. Behaviour
- Clicking "View Tower >" on a tower card navigates to `/admin/towers` with that specific tower pre-selected.
- The floor/unit grid for that tower loads automatically — no manual sidebar selection required.

## 6. Validations & Business Rules
1. Navigation works for both Active and Inactive towers — the tower's grid always loads regardless of its current active state.
2. This is a read-only cross-navigation — no data changes occur.

## 7. System Actions
- Browser navigates to `/admin/towers` (with tower pre-selected via URL parameter or application state).
- `GET /api/v1/admin/units-by-tower/:towerId` is called automatically for the pre-selected tower.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only navigation.

## How to Use

1. **Navigate to Config CMS:** Go to `/admin/cms` from the left sidebar.
2. **Find the Tower Configuration section** (Section 1 at the top of the Config page).
3. **Locate the tower card** you want to inspect — all 18 towers are shown as cards.
4. **Click "View Tower >"** on the card.
5. **Result:** You are taken directly to the Towers page (`/admin/towers`) with that specific tower already selected and its floor/unit grid loaded. No need to locate the tower manually in the sidebar.

---

# Backend Gap Reconciliation (2026-05-21)

Controller- and service-layer audit findings. These notes override conflicting statements above. See parent BRD §11 for full narrative.

### Feature 1 corrections (KPI Cards)
- `disabledUnits` KPI counts RESERVED only — NOT REFUGE+RESERVED+PBT as previously documented. <!-- BA correction: GAP-TL-027, 2026-05-21 -->
- `projectId` is env-derived (`prod=1`, `uat=2`) — client cannot override. <!-- BA correction: GAP-TL-025, GAP-DEV-001, 2026-05-21 -->

### Feature 2 / 3 corrections (List + Toggle)
- `getAllTowers` accepts `isActive` filter ONLY via GET request body (literal `true`/`false`). Non-standard. <!-- BA correction: GAP-TL-026, 2026-05-21 -->
- `updateTowerStatus` no-op (toggle to the same state) skips audit-log emission. <!-- BA correction: GAP-TL-030, 2026-05-21 -->
- `updateTowerStatus` fires GET to Python `/broadcast-towers` for real-time WebSocket fan-out. QA must mock this endpoint. <!-- BA correction: GAP-TL-029, 2026-05-21 -->

### Feature 4 corrections (Unit drawer)
- API response fields: `id, unitName, unitId, unitNo, floorNumber, status, basicPrice, totalUnitValue, facing`. <!-- BA correction: GAP-TL-031, 2026-05-21 -->
- Fields previously documented but NOT in response: `agreementValue`, `earlyBirdBenefit`, "All Inclusive Price", BHK Type, Size. UI may compute these from other endpoints or display computed values.
- Fields present in response but previously undocumented: `basicPrice`, `totalUnitValue`.

### Admin unit-swap tower list <!-- BA correction: GAP-DEV-028, 2026-05-21 -->
- `tower.service.js adminUnitSwapTowers` returns ALL towers (no `isActive` filter). Other tower queries do filter. Already noted in Customers UnitSwap FRD §4.2.
