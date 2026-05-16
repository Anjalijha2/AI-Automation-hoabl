# TC_TOWERS — Towers Module Manual Test Cases

**Module:** Towers View (`/admin/towers`)  
**Sprint:** 3  
**Author:** QA  
**Last Updated:** 2026-04-04  
**Total TCs:** 13

---

## Page Overview

The Towers page has three functional zones:

| Zone | Description |
|------|-------------|
| **KPI Cards** | Tower summary (Total / Active / Inactive) + Unit summary (Total / Sold / Available / Disabled) |
| **Tower List** | Sidebar with all 18 towers; Active = selectable, Inactive = labelled; shows "N Units Available" |
| **Floor / Unit Grid** | Selected tower's floor×unit matrix; cells colour-coded by status; click a cell to open detail drawer |
| **Unit Detail Drawer** | Right panel showing Unit No, BHK, Size, Agreement Value, Early Bird Discount, All-inclusive Price |

---

## Section 1 — KPI Cards

### TC-TWR-001 — Towers KPI card displays correct counts
**Priority:** P1  
**Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/towers` | Page loads; KPI cards visible |
| 2 | Read Towers card | Shows **Total**, **Active**, **Inactive** counts; Total = Active + Inactive |
| 3 | Read Units card | Shows **Total**, **Sold**, **Available**, **Disabled** counts; Total ≥ Sold + Available + Disabled |

**Pass Criteria:** All counts > 0; Total = Active + Inactive for towers; Unit counts sum correctly.

---

### TC-TWR-002 — Units KPI card counts are consistent with grid
**Priority:** P2  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Read "Available" from Units KPI card | N available |
| 2 | Select tower "Crest" → count `.unit-size-item.available` in grid | Grid available count ≤ KPI available (KPI is cross-tower total) |
| 3 | Verify grid stat header for Crest shows its own counts | `floors-index-wrap` shows Tower: Crest Total / Available / Sold / Disabled |

---

## Section 2 — Tower List

### TC-TWR-003 — All 18 towers appear in the sidebar list
**Priority:** P1  
**Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/towers` | Tower list visible |
| 2 | Count `li.tower-item` entries | Count = 18 |
| 3 | Verify known active towers: Crest, Crown, Blossom, Bright, Pinnacle | Each shows no "(Inactive)" badge |
| 4 | Verify known inactive towers: Triumph, Prestige, Horizon etc. | Each shows "(Inactive)" label |

---

### TC-TWR-004 — Tower item shows name and available unit count
**Priority:** P2  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Look at "Crest" tower item | Shows "Crest" + "155 Units Available" (or current count ≥ 1) |
| 2 | Look at an Inactive tower (e.g. Triumph) | Shows unit count + "(Inactive)" badge |

---

### TC-TWR-005 — Selecting a tower loads its floor/unit grid
**Priority:** P1  
**Type:** Critical Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Crest" in tower list | `selected-tower` class applied to Crest item |
| 2 | Floor/unit grid appears in centre panel | `.unit-section-box` visible; floor numbers 1–35 shown |
| 3 | Grid header shows tower stats | "Tower: Crest / Total / Available / Sold / Disabled" values visible |
| 4 | Click "Crown" | Grid switches to Crown's data; Crown becomes selected |
| 5 | Crest loses selected state | Crest item no longer has `selected-tower` class |

---

## Section 3 — Floor / Unit Grid

### TC-TWR-006 — Unit grid legend is correct
**Priority:** P2  
**Type:** UI

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select tower Crest | Grid loads |
| 2 | Check legend indicators | Shows coloured squares for: (empty/white), Active, Sold, Paying now, Refuge, Disabled, PBT |

---

### TC-TWR-007 — Unit cells are colour-coded by status
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select tower Crest | Grid visible |
| 2 | Count available cells (`.unit-size-item.available`) | Count > 0 |
| 3 | Count booked cells (`.unit-size-item.booked`) | Count ≥ 0 (should be ≥ 1 for Crest — unit 3502 known booked) |
| 4 | Count disabled cells | Count ≥ 0 |
| 5 | Verify grid stat matches cell counts | Grid stat "Available" ≈ count of available cells |

---

### TC-TWR-008 — Floor numbers are displayed in descending order
**Priority:** P3  
**Type:** UI

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select any active tower | Grid visible |
| 2 | Read `.floor-number` spans | Floors shown descending: 35, 34, 33 … 1 |

---

## Section 4 — Unit Detail Drawer

### TC-TWR-009 — Clicking an available unit opens detail drawer
**Priority:** P1  
**Type:** Critical Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select tower Crest | Grid visible |
| 2 | Click an available unit cell (e.g. 3504) | Right-panel drawer appears with "Unit Details" |
| 3 | Drawer shows: Unit No., BHK, Size | All fields populated |
| 4 | Drawer shows: Agreement Value, Discount, All-inclusive price | Numeric values shown in ₹ format |

**Pass Criteria:** Drawer populated; no empty fields for known units.

---

### TC-TWR-010 — Unit No. in drawer matches clicked cell
**Priority:** P1  
**Type:** Data Integrity

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select Crest; click unit 3504 | Drawer opens |
| 2 | Read "Unit No." from drawer | Shows "3504 - Crest" or equivalent |
| 3 | Click a different available unit | Drawer updates to new unit's data |

---

### TC-TWR-011 — Clicking a booked/reserved unit still opens drawer (read-only view)
**Priority:** P2  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select Crest; click unit 3502 (booked) | Drawer opens showing 3502 details |
| 2 | Verify data is populated | Unit No., BHK, Agreement Value shown |
| 3 | No booking action available | No "Book" button in drawer (view-only) |

---

### TC-TWR-012 — Switching tower resets grid and drawer
**Priority:** P2  
**Type:** State Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select Crest; click unit 3504 (drawer opens) | Drawer shows Crest 3504 |
| 2 | Click tower "Crown" in sidebar | Grid switches to Crown's data |
| 3 | Drawer resets | Drawer either hides or shows no unit selected |
| 4 | Grid shows Crown floor/unit layout | Crown unit numbers visible (different from Crest) |

---

## Section 5 — Download Excel

### TC-TWR-013 — Download tower unit data as Excel
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/towers`; select tower "Crest" | Grid loads with download button (↓ icon) visible in grid header |
| 2 | Click the download button | File download starts |
| 3 | Check downloaded filename | Filename is a `.xlsx` or `.xls` file (contains tower or unit data) |
| 4 | Open the file | Rows contain unit numbers, floor, status, BHK type, agreement value |

**Pass Criteria:** Download initiates; file is a valid Excel format with non-zero rows.

---

## Summary Table

| TC ID | Title | Priority | Type | Status |
|-------|-------|----------|------|--------|
| TC-TWR-001 | KPI card counts display and sum correctly | P1 | Smoke | ✅ Automated |
| TC-TWR-002 | Unit KPI consistent with grid stats | P2 | Functional | ✅ Automated |
| TC-TWR-003 | All 18 towers in sidebar | P1 | Smoke | ✅ Automated |
| TC-TWR-004 | Tower item name + available count | P2 | Functional | ✅ Automated |
| TC-TWR-005 | Selecting tower loads grid | P1 | Critical | ✅ Automated |
| TC-TWR-006 | Legend indicators correct | P2 | UI | ✅ Automated |
| TC-TWR-007 | Unit cells colour-coded by status | P1 | Functional | ✅ Automated |
| TC-TWR-008 | Floors in descending order | P3 | UI | ✅ Automated |
| TC-TWR-009 | Click available unit → detail drawer | P1 | Critical | ✅ Automated |
| TC-TWR-010 | Drawer unit no. matches clicked cell | P1 | Data Integrity | ✅ Automated |
| TC-TWR-011 | Booked unit opens read-only drawer | P2 | Functional | ✅ Automated |
| TC-TWR-012 | Switching tower resets grid + drawer | P2 | State | ✅ Automated |
| TC-TWR-013 | Download tower unit data as Excel | P1 | Functional | ✅ Automated |
