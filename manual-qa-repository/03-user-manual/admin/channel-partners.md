# Admin Portal — Channel Partners Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/channel-partners`
**Sources:** ADMIN-BRD-Channel-Partners.md · ADMIN-FS-Channel-Partners.md
**Last Updated:** 2026-05-22

---

## Overview

The Channel Partners (CP) module is the admin directory for all licensed brokers and agents who bring buyers to the project. Each CP carries a unique **HV Code** (HoABL Venture code) used to track buyer attribution and commissions. The page lists ~2705 CPs in a paginated table with phone search, column filters, a slide-in detail drawer, and operations to designate Master CPs and map Member CPs underneath them.

Reach this page from the left sidebar → **Channel Partners** → `/admin/channel-partners`.

---

## Page Layout (At a Glance)

1. **Header** — Title "2705 Channel Partners" (static system total, does NOT change with filters), Map Master CP button (disabled until rows selected), Reset Filters, Refresh.
2. **Phone Search** — top of the page, server-side phone filter.
3. **CP Table** — 13 columns, paginated; row checkboxes for multi-select.
4. **CP Detail Drawer** — right slide-in with 4 sections.
5. **Map Master CP Modal** — multi-select assignment to a Master.

---

# Feature 1 — View Channel Partner List

### What it does
Presents a paginated, searchable table of all CPs with HV codes, firm details, region, KYC status, CP type, and assigned Sales Manager.

### Preconditions
- Admin session.

### How to use
1. Go to `/admin/channel-partners`.
2. Read the table — 13 columns:

| Column | Filter Type | Notes |
|--------|-------------|-------|
| Owner Name | Search (magnifying glass) | Free-text |
| Firm Name | Search | Free-text |
| HV Code | Search | CP's unique HoABL Venture code |
| Master HV Code | Filter (funnel) | HV of assigned Master |
| Business Region | Filter | Region dropdown |
| Pincode | Search | Free-text |
| Phone | (top phone search) | — |
| CP Type | Filter | Master CP / Member CP |
| SM Name | — | Auto-populated from assigned SM |
| SM Email ID | — | Auto-populated |
| SM Mobile Number | — | Auto-populated |
| KYC Status | — | Pending / Approved / Rejected / Verified |
| Actions | — | Eye icon (View) · 3-dot menu |

3. Use pagination at the bottom to browse the full list.

### Result
A complete CP directory with SM assignment and KYC visibility.

### Notes
- The header count "2705 Channel Partners" is the **system total** and does not change with search/filter.
- API: `GET /api/v1/admin/cp?page=&limit=&phone=&cpType=&masterHvCode=&businessRegion=`.
- SM Name / SM Email / SM Mobile show "-" when no SM is linked.
- KYC Status reflects the CP's own KYC process (managed in the CP Portal) — distinct from buyer KYC. On UAT, most test CPs are `Pending`.

---

# Feature 2 — Search by Phone Number

### What it does
Server-side phone-number filter to find a specific CP quickly.

### Preconditions
- You know the CP's phone (or part of it).

### How to use
1. Click the **Phone Search** input near the top of the page.
2. Type the full or partial phone number.
3. The table rows filter to matching CPs (server-side `LIKE`).
4. Click **Reset Filters** to clear the search and re-fetch the full list.

### Result
Only matching CPs are visible. The header count badge remains the system total — it is NOT a count of visible rows.

### Note
Reset Filters triggers a full data re-fetch — wait for the table to redraw before reading counts.

---

# Feature 3 — Filter by Column

### What it does
Per-column filters allow narrowing the list by Owner Name, Firm Name, HV Code, Pincode, Master HV Code, Business Region, or CP Type.

### How to use
1. Click the small **icon** in the column header:
   - **Magnifying-glass** (Owner Name, Firm Name, HV Code, Pincode) → type a free-text value.
   - **Funnel** (Master HV Code, Business Region, CP Type) → select from a dropdown.
2. The table filters server-side; column filters can be combined with the top phone search.
3. Click **Reset Filters** in the header to clear all filters.

### Result
A focused subset of CPs. Common use cases:
- **CP Type = Master CP** → list of all Masters (useful before mapping operations).
- **Master HV Code = <code>** → all Member CPs mapped under a specific Master.
- **Business Region = <region>** → CPs in a target region.

### Note
API: `GET /api/v1/admin/cp?cpType=&masterHvCode=&businessRegion=`.

---

# Feature 4 — View Channel Partner Detail Drawer

### What it does
Opens a right slide-in panel with the CP's full profile across 4 sections.

### Preconditions
- Admin session.

### How to use
1. Find the CP row in the table.
2. Click the **eye icon** in the Actions column.
3. The drawer slides in with title **"Channel Partner Details"**.
4. Read the 4 sections:
   - **Basic Information** — HV Code, Owner Name, CP Type.
   - **Firm Details** — Firm Name, Business Region, Pincode.
   - **Contact Details** — Phone, Email.
   - **Additional Details** — KYC Status, Master HV Code.
5. Close with the **×** button in the drawer header.

### Result
You see the complete CP profile without leaving the list page. Drawer is read-only — no edits possible from here.

### Note
- API: `GET /api/v1/admin/cp/:id`.
- KYC Status in the drawer is the CP's CP-Portal KYC — separate from buyer KYC.

---

# Feature 5 — Mark CP as Master

### What it does
Elevates a Member CP to Master CP. Master CPs appear in the Master HV Code dropdown and can have Member CPs mapped underneath them.

### Preconditions
- The selected CP is currently a Member CP.
- Admin session.

### How to use
1. Find the Member CP row to elevate.
2. Click the **3-dot (…) menu** in the Actions column.
3. Select **Mark as Master**.

### Result
- Backend hits `PUT /api/v1/admin/cp/:id/mark-master`.
- The CP's `cpType` flips to **Master CP** immediately — no confirmation dialog.
- The CP's HV Code becomes available in the Master HV Code dropdown for mapping operations.

### Note
- No CP notification is sent.
- The 3-dot menu may contain additional navigation items — target "Mark as Master" specifically.

---

# Feature 6 — Map Member CPs to a Master CP

### What it does
Maps one or more Member CPs to a designated Master CP, establishing the broker hierarchy.

### Preconditions
- At least one CP row is selected via checkbox.
- At least one Master CP exists (to populate the dropdown).
- Admin session.

### How to use
1. Check the **row checkbox** on each Member CP to map. The **Map Master CP** button in the header becomes enabled.
2. Click **Map Master CP**. The **"Map CPs to Master"** modal opens with:
   - A note showing the count of selected CPs.
   - **Master HV Code** dropdown — lists all Master CPs.
   - **Confirm** / **Cancel** buttons.
3. Select the target **Master HV Code** from the dropdown.
4. Click **Confirm**.

### Result
- Backend hits `PUT /api/v1/admin/cp/map-master` with `{ cpIds: [...], masterHvCode }`.
- `masterHvCode` is written on every selected CP record.
- The Master HV Code column in the table updates immediately.

### Validation rules
| Rule | Behaviour |
|------|-----------|
| No rows selected | Map Master CP button disabled |
| Modal without Master HV Code chosen | Confirm disabled / rejected |

### Notes
- A CP can only have ONE Master CP at a time — remapping replaces the existing relationship.
- No CP notification is sent when mapped to a Master.
- Modal opens with `GET /api/v1/admin/cp/masters` to populate the dropdown.

---

## Business Rules

1. Header count "2705 Channel Partners" is the system total — never changes with filters.
2. Phone search is server-side `LIKE` match; supports partial input.
3. Reset Filters clears all inputs AND re-fetches data.
4. Map Master CP button is disabled when no rows are selected.
5. New CPs default to **Member CP** at registration.
6. Only Master CPs appear in the Master HV Code dropdown.
7. SM Name / SM Email / SM Mobile columns auto-populate from the SM assigned via the Sales Managers module — show `-` when no SM is linked.
8. KYC Status is the CP's own KYC, distinct from buyer KYC.
9. A CP has at most one Master CP at any time — remapping replaces.

---

## Role Restrictions

- Admin (roleId 1) and Sales Manager Admin (roleId 4) have full access.
- Mark as Master and Map Master CP are admin-grade write operations and are logged for audit.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/cp` | Paginated CP list + filters |
| GET | `/api/v1/admin/cp/:id` | Full CP detail for drawer |
| GET | `/api/v1/admin/cp/masters` | Master CP list (dropdown) |
| PUT | `/api/v1/admin/cp/:id/mark-master` | Elevate CP to Master |
| PUT | `/api/v1/admin/cp/map-master` | Map selected CPs to a Master |

---

## Integrations

- **Sales Managers module** — SM assignment FK on the CP record drives the SM Name/Email/Mobile columns.
- **Customers module** — CPs appear as **Growth Partners** on customer registrations.
- **JBP Management** — CPs submit their commitment plans via the JBP portal.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Map Master CP button stays disabled | No rows selected | Tick at least one row checkbox |
| Master HV Code dropdown empty in modal | No Master CPs exist yet | Mark at least one CP as Master first |
| Header count stays at 2705 after filter | By design — count is the system total | Read row count from the result table footer, not the header |
| SM Name shows "-" | No SM is linked to this CP | Assign via Sales Managers module |
| KYC stays Pending on UAT | UAT test data default | Approve via CP Portal flow or via separate admin operation |
| Reset Filters leaves stale row counts | Re-fetch in progress | Wait for table to reload before reading counts |
| Remapped CP not showing new Master HV Code | Stale table state | Click Refresh in the header |
