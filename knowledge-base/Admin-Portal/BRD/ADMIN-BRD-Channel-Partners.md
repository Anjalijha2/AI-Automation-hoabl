# Admin Portal — Channel Partners Module BRD

**Module:** Channel Partners
**URL:** `https://uat-web.xrportal.in/admin/channel-partners`
**Created:** 2026-05-11
**Status:** Complete — Automated (Sprint 3)

---

## 1. Purpose

The Channel Partners module is the admin directory for all licensed brokers and agents (called Channel Partners or CPs) who bring buyers to the project. Admins can search for any CP, view their full details, see which sales manager is assigned to them, and manage the CP hierarchy by designating Master CPs and mapping other CPs under them.

Channel Partners are how most buyers first discover and register for the project — they earn a commission tracked via their unique HV Code.

---

## 2. Who Uses This

| User | What They Do Here |
|------|------------------|
| Admin | View and manage the CP directory, map CP hierarchy |
| Sales Manager Admin | Same as Admin |

---

## 3. How to Access

Left sidebar → click **Channel Partners** → `/admin/channel-partners`

---

## 4. Screen Layout

### Page Header

| Element | Description |
|---------|-------------|
| Title | "2705 Channel Partners" — shows the total CP count (does NOT change when filters are applied) |
| **Map Master CP** button | Disabled until one or more rows are selected; opens the mapping modal |
| **Reset Filters** button | Clears all search/filter inputs and reloads the full list |
| **Refresh** button | Reloads data from the server |

### Search Bar

A phone number search field near the top. Type a phone number to filter the table server-side.

### CP Table — 13 Columns

| Column | Filter Type Available? |
|--------|----------------------|
| Owner Name | Search (magnifying glass icon) |
| Firm Name | Search icon |
| HV Code | Search icon |
| Master HV Code | Filter (funnel icon) |
| Business Region | Filter icon |
| Pincode | Search icon |
| Phone | (phone search at top) |
| CP Type | Filter icon (Master CP / Member CP) |
| SM Name | No filter |
| SM Email ID | No filter |
| SM Mobile Number | No filter |
| KYC Status | No filter |
| Actions | Eye icon (View) + Three-dot menu |

### CP Detail Drawer

Clicking the eye icon on any row opens a panel from the right showing the CP's full profile in four sections:

1. **Basic Information** — HV Code, CP type, KYC status
2. **Firm Details** — Business name, registration details
3. **Contact Details** — Phone, email, address
4. **Additional Details** — Additional business information

**KYC Status values:** Pending / Approved / Rejected / Verified

### Map Master CP Modal

When one or more rows are selected (using row checkboxes) and **Map Master CP** is clicked:
- Modal title: "Map CPs to Master"
- Contains a **Master HV Code** dropdown to select the master
- Shows how many CPs will be mapped
- Click Confirm to complete the mapping

---

## 5. Feature Walkthrough

### Finding a Specific Channel Partner by Phone

1. In the search field at the top of the page, type the CP's phone number
2. The table filters to show matching CPs (server-side search)
3. Click **Reset Filters** to clear and see all CPs again

### Using Column Filters

1. Click the **magnifying glass** icon on Owner Name, Firm Name, HV Code, or Pincode columns — type to filter that column
2. Click the **funnel (filter)** icon on Master HV Code, Business Region, or CP Type — select from the dropdown values
3. Click **Reset Filters** to clear all column filters

### Viewing a CP's Full Profile

1. Find the CP in the table
2. Click the **eye icon** in the Actions column
3. The CP Detail drawer opens from the right
4. Read through all four sections (Basic Information, Firm Details, Contact Details, Additional Details)
5. Click **X** to close the drawer

### Mapping CPs to a Master CP

A Master CP is a senior broker who has other agents (Member CPs) under them.

1. Select one or more Member CP rows using the checkboxes in the leftmost column
2. The **Map Master CP** button (header) becomes active (enabled)
3. Click **Map Master CP**
4. The modal opens — "Map CPs to Master"
5. Select the Master HV Code from the dropdown
6. Click Confirm

### Marking a CP as Master

1. Find the CP who should be elevated to Master CP status
2. Click the **three-dot (…)** menu in the Actions column
3. Select **Mark as Master**
4. The CP's type changes from Member CP to Master CP and they appear in the Master HV Code dropdown

### Checking Which SM is Assigned to a CP

The SM Name, SM Email ID, and SM Mobile Number columns show which sales manager is linked to each CP. If no SM is assigned, these columns show "-". The assignment is made through the Sales Managers module.

---

## 6. Business Rules

1. The header count "2705 Channel Partners" is fixed — it shows the total and does not change when search or column filters are applied
2. Phone number search filters table rows server-side — the result is immediate
3. Reset Filters clears all search inputs AND re-fetches the data from the server — wait for the table to reload before checking counts
4. The Map Master CP button is disabled when no rows are selected
5. A CP starts as Member CP by default when they register
6. Only Master CPs appear in the Map Master CP dropdown
7. SM Name / SM Email / SM Mobile columns are auto-populated from the SM assigned to that CP via the SM module — shows "-" if no SM is linked
8. KYC Status for CPs is their own CP-specific KYC (separate from buyer KYC)
9. On UAT, all test CP KYC statuses are "Pending" by default

---

## 7. Validations

| Action | Validation |
|--------|-----------|
| Map Master CP | Button disabled if no rows selected |
| Map Master CP modal | Master HV Code must be selected before confirming |

---

## 8. Dependencies

| Module | Relationship |
|--------|-------------|
| [Sales Managers](BRD-Sales-Managers.md) | SM Name / SM Email / SM Mobile in the CP table comes from the SM assigned to each CP |
| [Customers](BRD-Customers.md) | Channel partners are shown as "Growth Partners" in the customer registrations table |
| [JBP Management](BRD-JBP-Management.md) | CPs access the JBP portal to submit their commitment plans |

---

## 9. User Journey Map

**Finding and viewing a CP:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Opens Channel Partners page | Full list of 2705 CPs loads | Step 2 |
| 2 | Admin | Types CP phone in search field | Table filters to matching CP | Step 3 |
| 3 | Admin | Clicks eye icon on the CP row | CP Detail drawer opens | Step 4 |
| 4 | Admin | Reviews Basic Information, Firm Details, KYC Status | CP profile visible | Step 5 |
| 5 | Admin | Clicks X | Drawer closes | Done |

**Mapping a CP to Master:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Selects CP row using checkbox | Map Master CP button becomes enabled | Step 2 |
| 2 | Admin | Clicks Map Master CP | Modal opens — "Map CPs to Master" | Step 3 |
| 3 | Admin | Selects Master HV Code from dropdown | Master selected | Step 4 |
| 4 | Admin | Clicks Confirm | CP mapped; Master HV Code column updates | Done |

---

## 10. Open Questions / Gaps

All Channel Partners questions resolved as of 2026-05-10:
- SM columns are auto-populated via the SM assignment FK on the CP user record
- Mark as Master feature is fully implemented and operational
