# Test Cases — Tower and Unit Heatmap
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Tower-Heatmap.md

---

## Navigation & Page Load

### SM_HMP_001 — Towers page loads at /sales-manager/towers

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | SM logged in; at least one tower configured and active |
| **Test Steps** | 1. From bottom nav or side menu click Towers<br>2. Wait for page load |
| **Expected Result** | URL changes to /sales-manager/towers; page renders without errors |
| **Priority** | Critical |

---

### SM_HMP_002 — Tower list sidebar renders all active towers

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | On /sales-manager/towers; multiple active towers exist |
| **Test Steps** | 1. Inspect tower list/sidebar<br>2. Count towers listed |
| **Expected Result** | All active towers shown with names; inactive towers hidden per BR 1.6.2 |
| **Priority** | High |

---

### SM_HMP_003 — Selecting a tower loads its unit grid

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower list visible |
| **Test Steps** | 1. Click on a tower name e.g. Crest<br>2. Wait for unit grid render |
| **Expected Result** | Unit grid loads showing all floors and units for the selected tower |
| **Priority** | Critical |

---

## Unit Status Colour Coding

### SM_HMP_004 — Available units display in white/green colour

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; units with AVAILABLE status exist |
| **Test Steps** | 1. Locate an AVAILABLE unit on the grid<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in white or green per FS 1.5 legend |
| **Priority** | High |

---

### SM_HMP_005 — Held units display in orange

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; at least one unit in HOLD status |
| **Test Steps** | 1. Locate a unit on hold<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in orange indicating "Proceeding to Pay" hold state |
| **Priority** | High |

---

### SM_HMP_006 — Booked units display in red

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; BOOKED units exist |
| **Test Steps** | 1. Locate a BOOKED unit<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in red indicating confirmed sale |
| **Priority** | High |

---

### SM_HMP_007 — Reserved units display in blue

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; admin has reserved at least one unit |
| **Test Steps** | 1. Locate a reserved unit<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in blue indicating admin reservation |
| **Priority** | Medium |

---

### SM_HMP_008 — Unit status legend visible on screen

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | On towers page with unit grid loaded |
| **Test Steps** | 1. Locate the legend area<br>2. Verify all 4 status colours documented |
| **Expected Result** | Legend shows: White/Green = Available, Orange = Hold, Red = Booked, Blue = Reserved |
| **Priority** | Medium |

---

## Read-Only Behaviour & Real-Time Sync

### SM_HMP_009 — SM cannot modify unit status from heatmap

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; unit grid loaded |
| **Test Steps** | 1. Click on an AVAILABLE unit<br>2. Right-click or long-press unit<br>3. Inspect for any edit/action controls |
| **Expected Result** | No edit, book, hold, or status-change controls present; view is read-only per BR 1.6.1 |
| **Priority** | Critical |

---

### SM_HMP_010 — Unit grid updates in real-time during active campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Active allocation campaign running; SM viewing the heatmap |
| **Test Steps** | 1. Keep heatmap open<br>2. Have another user/admin place a unit on HOLD<br>3. Observe SM view |
| **Expected Result** | Unit colour transitions to orange without page refresh via WebSocket per BR 1.6.3 |
| **Priority** | High |

---
