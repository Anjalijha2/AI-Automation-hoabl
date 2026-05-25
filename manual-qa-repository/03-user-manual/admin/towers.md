# Admin Portal — Towers Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/towers`
**Sources:** ADMIN-BRD-Towers.md · ADMIN-FS-Towers.md
**Last Updated:** 2026-05-22

---

## Overview

The Towers module is a read-only inventory view of all 18 towers in the Xanadu project. It surfaces live KPI counts (tower and unit totals), lets you browse any tower's floor/unit grid colour-coded by status, and exposes per-unit pricing details in a slide-in drawer. No edits are possible from this page — all tower and unit modifications happen in **Config / CMS**.

Reach Towers by clicking **Towers** in the left sidebar, or jump in directly from the Config CMS Tower Configuration section via the **"View Tower >"** link on any tower card.

---

## Page Layout (At a Glance)

1. **KPI Cards** (top): Total / Active / Inactive Towers · Total / Available / Sold / Disabled Units.
2. **Tower Sidebar** (left): all 18 towers with available-unit counts and `(Inactive)` labels.
3. **Floor/Unit Grid** (main area): rows = floors, cells = units, colour-coded by status.
4. **Unit Detail Drawer** (right slide-in): opens only when an Available (white) unit is clicked.

---

# Feature 1 — Tower & Unit KPI Dashboard

### What it does
Provides a live at-a-glance count of project inventory — towers (total / active / inactive) and units (total / available / sold / disabled).

### Preconditions
- Admin session.

### How to use
1. Click **Towers** in the left sidebar (or navigate to `/admin/towers`).
2. Read the KPI cards at the top:
   - **Total Towers** — fixed at 18.
   - **Active Towers** — towers currently toggled ON in Config CMS.
   - **Inactive Towers** — towers currently toggled OFF in Config CMS.
   - **Total Units** — all units across all towers.
   - **Available Units** — units with `status = AVAILABLE`.
   - **Sold Units** — units with `status = BOOKED`.
   - **Disabled Units** — units with `status = RESERVED`.

### Result
You see real-time inventory totals. KPI counts update whenever a tower is toggled in Config or a unit status changes (e.g. on booking).

### Warning — corrected definition (GAP-TL-027)
The **Disabled Units** KPI counts only `RESERVED` units. Earlier doc text claimed it covered REFUGE + RESERVED + PBT; the backend (`tower.controller.js:198`) counts RESERVED only. REFUGE and PBT units are not represented in this KPI.

### Note
- The KPI service runs scoped to a hard-coded `projectId` derived from the environment (`prod=1`, `uat=2` — see `tower.controller.js:17, 175`). Clients cannot override.
- API: `GET /api/v1/admin/tower-kpi` returns the aggregate counts on page load.

---

# Feature 2 — Browse Tower List (Sidebar)

### What it does
Lists all 18 project towers in the left sidebar so you can pick one to inspect.

### Preconditions
- Admin session.

### How to use
1. Look at the left sidebar — all 18 towers are listed: **Crest, Crown, Blossom, Bright, Pinnacle, Triumph, Prestige, Horizon, Dawn, Aura, Glory, Pride, Grace, Aspire, Prime, Fortune, Radiance, Grand.**
2. Each row shows the tower name and how many units are available (e.g. "159 Units Available").
3. Inactive towers display the `(Inactive)` label.
4. Click any tower name to load that tower's floor/unit grid in the main area.
5. Switch towers at any time by clicking another in the sidebar.

### Result
The grid main area updates to show the selected tower's stats and unit cells.

### Note
- API: `GET /api/v1/admin/towers` loads all 18 with their status + counts.
- The list is filterable by `isActive` only via a non-standard GET-with-body parameter — out of scope for typical UI use but documented for API testers (GAP-TL-026).

---

# Feature 3 — View Floor / Unit Grid

### What it does
Shows the floor-by-floor unit layout for the selected tower with colour-coded status cells.

### Preconditions
- Admin session.
- A tower must be selected in the sidebar.

### How to use
1. Select a tower from the sidebar — the grid loads in the main area.
2. Read the grid header: tower-level Total / Available / Sold / Disabled counts.
3. Interpret cell colours:

| Colour | DB Status | Meaning | Clickable |
|--------|-----------|---------|-----------|
| White / light border | `AVAILABLE` | Available for selection | Yes — opens detail drawer |
| Green | session-selected | Selected by a buyer in current session | No |
| Red | `BOOKED` | Sold / confirmed booking | No |
| Orange | `HOLD` | Another buyer is paying right now | No |
| Grey | `REFUGE` / `RESERVED` / `PBT` | Reserved or blocked | No |

4. Click a white cell to open the Unit Detail Drawer (Feature 4). Other colours are inert.

### Result
A complete inventory picture for the selected tower. Status colours map directly to whether a unit can be sold.

### Note
- API: `GET /api/v1/admin/units-by-tower/:towerId` returns all unit records for the tower.
- The grid is fetched fresh on each tower selection — not cached from a prior visit.

---

# Feature 4 — View Unit Detail Drawer

### What it does
Opens a right-side panel with pricing and typology details for an Available unit.

### Preconditions
- Admin session.
- A tower is selected and its grid is loaded.
- The clicked unit must be `AVAILABLE` (white cell).

### How to use
1. Click any white (Available) cell in the grid.
2. The drawer slides in from the right.
3. Read the unit details (presented on the UI):
   - Unit No (e.g. `3502 – Crest`)
   - BHK Type (e.g. `1 BHK Growth Home`)
   - Size (e.g. `323 sq.ft.`)
   - Agreement Value
   - Early Bird Benefit
   - All Inclusive Price
4. Close the drawer by clicking the **×** button in the header, or by clicking anywhere outside the drawer.

### Result
You have the unit's pricing snapshot. The drawer is read-only — no edit, book, or hold action is possible from here.

### Warning — drawer fields vs. API response (GAP-TL-031)
The backend `getUnitsByTowerId` response actually returns: `id`, `unitName`, `unitId`, `unitNo`, `floorNumber`, `status`, `basicPrice`, `totalUnitValue`, `facing`. Fields like `agreementValue`, `earlyBirdBenefit`, "All Inclusive Price", BHK Type and Size are NOT in this endpoint's response — the UI may compute or derive them from other sources. API testers should validate against the actual response shape, not the drawer labels.

---

# Feature 5 — Cross-Module Navigation ("View Tower >")

### What it does
Jumps directly from a tower card in Config CMS to that tower's grid on the Towers page.

### Preconditions
- Admin session.
- You are on `/admin/cms` in the Tower Configuration section.

### How to use
1. Go to `/admin/cms` and scroll to Section 1 (Tower Configuration).
2. Find the tower card you want to inspect (18 cards, one per tower).
3. Click the green **"View Tower >"** link on that card.
4. The browser navigates to `/admin/towers` with that tower pre-selected and its grid already loaded.

### Result
No need to locate the tower in the sidebar — it's auto-selected. Works for both Active and Inactive towers.

---

## Business Rules

1. The Towers page is entirely read-only. No edits to tower or unit data are possible here.
2. To toggle a tower Active/Inactive, use Config CMS → Tower Configuration.
3. To change a unit's status, use Config CMS → Unit Status upload.
4. To update unit pricing, use Config CMS → Unit Cost Update.
5. Only white (Available) cells open the detail drawer — other colours are inert.
6. There are always exactly 18 towers (fixed for the Xanadu project).
7. KPI counts here and on the Customers page both reflect the Config tower toggle state.

---

## Role Restrictions

- Visible to roles `admin` (roleId 1) and `sm_admin` (roleId 4).
- Read-only — no role can edit from this page.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/tower-kpi` | Returns KPI card values |
| GET | `/api/v1/admin/towers` | Returns all 18 towers + sidebar counts |
| GET | `/api/v1/admin/units-by-tower/:towerId` | Returns unit list for the selected tower |

---

## Known Backend Notes

- `projectId` is env-derived (prod=1, uat=2); clients cannot override.
- `disabledUnits` KPI counts RESERVED only (not REFUGE+RESERVED+PBT).
- `updateTowerStatus` fires a GET to the Python `/broadcast-towers` endpoint for real-time WebSocket fan-out (relevant for QA when mocking WebSockets).
- No-op tower toggles (toggling to the current state) skip audit-log emission.
- `adminUnitSwapTowers` (consumed by the Customers Unit Swap modal) returns ALL towers regardless of `isActive` — unique to that flow.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Clicking a sold (red) unit does nothing | By design — only AVAILABLE units open the drawer | Use a white cell |
| Disabled count seems too low | KPI counts RESERVED only, not REFUGE/PBT | Cross-check unit status in Config CMS |
| Grid does not refresh after Config change | Grid is fetched on each tower selection | Click a different tower then back |
| "View Tower >" navigates but no grid loads | Tower may be inactive — should still work; check browser console | Reselect tower from sidebar |
| Drawer shows "Agreement Value" but API returns `basicPrice` | UI labels differ from API field names (computed/derived) | Use API field names when writing API tests |
