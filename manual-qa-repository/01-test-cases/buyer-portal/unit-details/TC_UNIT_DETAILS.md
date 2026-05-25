# Test Cases — Unit Details
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Unit-Details.md

---

## Unit Details — Access & Navigation

### BYR_UNIT_001 — Unit Details accessible only after WINNER status

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Try opening `/allotted-units` while not WINNER<br>2. Then assign WINNER and retry |
| **Expected Result** | Non-WINNER: blocked / redirected to dashboard. WINNER: page loads. |
| **Priority** | Critical |

---

### BYR_UNIT_002 — "My Unit" nav item visible post-allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER status |
| **Test Steps** | 1. Inspect main nav |
| **Expected Result** | My Unit / Allotted Unit menu item visible and clickable |
| **Priority** | High |

---

### BYR_UNIT_003 — Click My Unit navigates to /allotted-units

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER status |
| **Test Steps** | 1. Click My Unit from nav |
| **Expected Result** | URL = `/allotted-units`; page renders unit information |
| **Priority** | Critical |

---

## Unit Details — Unit Details Section

### BYR_UNIT_004 — Unit number rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Unit Details card |
| **Expected Result** | Unit number visible (e.g., "3502") matching allocation |
| **Priority** | Critical |

---

### BYR_UNIT_005 — Floor and Tower name shown

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Floor and Tower fields |
| **Expected Result** | Floor number (e.g., "35") and Tower name (e.g., "Crest") rendered |
| **Priority** | High |

---

### BYR_UNIT_006 — Apartment configuration rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect BHK/typology field |
| **Expected Result** | Configuration shown (e.g., "1 Bed Growth Home") |
| **Priority** | High |

---

### BYR_UNIT_007 — Carpet and saleable area rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Carpet Area and Saleable Area fields |
| **Expected Result** | Both areas shown in sq.ft. (e.g., "323 sq.ft.") |
| **Priority** | High |

---

### BYR_UNIT_008 — Facing direction rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Facing field |
| **Expected Result** | Facing direction shown (East/West/North/South) |
| **Priority** | Medium |

---

### BYR_UNIT_009 — Floor plan image loads

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect floor plan image element |
| **Expected Result** | Image fetched and rendered without 404; alt text present |
| **Priority** | High |

---

## Unit Details — Cost Sheet

### BYR_UNIT_010 — Cost Sheet section visible

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Scroll to Cost Sheet |
| **Expected Result** | Itemised cost sheet section renders |
| **Priority** | Critical |

---

### BYR_UNIT_011 — Basic price line rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Inspect Basic Price row |
| **Expected Result** | Label "Basic Price" with numeric ₹ value > 0 |
| **Priority** | Critical |

---

### BYR_UNIT_012 — Floor rise / Premium / Infra / Society / Clubhouse / Possession lines rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Verify each line item is present |
| **Expected Result** | All 6 charge lines render with their labels and amounts (or 0 if not applicable) |
| **Priority** | High |

---

### BYR_UNIT_013 — GST line shown separately

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Locate GST row |
| **Expected Result** | GST amount displayed separately from principal |
| **Priority** | High |

---

### BYR_UNIT_014 — Parking charge rendered if applicable

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer's unit has parking charge |
| **Test Steps** | 1. Locate Parking row |
| **Expected Result** | Parking amount shown; if zero, row shows 0 or is hidden by config |
| **Priority** | Medium |

---

### BYR_UNIT_015 — Total Unit Value equals sum of charges

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Sum all charge rows<br>2. Compare to Total Unit Value |
| **Expected Result** | Total Unit Value equals computed sum within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_016 — Offer/discount deduction shown if applied

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | HOME_LOAN or VC_REQUEST offer applied |
| **Test Steps** | 1. Locate Offer/Discount row |
| **Expected Result** | Discount line with negative value (e.g., "− ₹X") with offer name |
| **Priority** | High |

---

### BYR_UNIT_017 — Early bird benefit shown if eligible

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer eligible for early bird |
| **Test Steps** | 1. Locate Early Bird row |
| **Expected Result** | Early bird discount line displayed with amount |
| **Priority** | Medium |

---

### BYR_UNIT_018 — Net Payable Amount = Total − all deductions

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Compute Total − offers − early bird<br>2. Compare to Net Payable |
| **Expected Result** | Net Payable matches computed amount within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_019 — Cost sheet frozen at allocation time

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Admin changes offer config after this buyer's booking |
| **Test Steps** | 1. Reload Unit Details |
| **Expected Result** | Cost sheet unchanged; matches values at time of allocation |
| **Priority** | Critical |

---

## Unit Details — Tower View & Floor Plans

### BYR_UNIT_020 — Tower View shows buyer's unit position

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Scroll to Tower View section |
| **Expected Result** | Tower diagram renders; buyer's unit visually highlighted |
| **Priority** | High |

---

### BYR_UNIT_021 — Floor & Unit Plans section renders

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Scroll to FloorUnitPlans |
| **Expected Result** | Floor plan and unit plan images load; can be zoomed/clicked |
| **Priority** | High |

---

### BYR_UNIT_022 — Plan images open in lightbox/full view

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Plans visible |
| **Test Steps** | 1. Click plan image |
| **Expected Result** | Lightbox/modal opens with zoomable larger view |
| **Priority** | Medium |

---

## Unit Details — Payment Schedule Detail (embedded)

### BYR_UNIT_023 — Payment Schedule section embedded at bottom

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Scroll to bottom |
| **Expected Result** | Embedded Payment Schedule renders milestone-by-milestone breakdown |
| **Priority** | High |

---

### BYR_UNIT_024 — Embedded schedule matches /paymentschedule

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Payment Schedule section visible |
| **Test Steps** | 1. Compare embedded schedule against `/paymentschedule` |
| **Expected Result** | Identical milestone list, amounts and statuses |
| **Priority** | Medium |

---

## Unit Details — Negative & Edge Cases

### BYR_UNIT_025 — Page handles missing floor plan image gracefully

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Floor plan asset unavailable |
| **Test Steps** | 1. Load page with broken plan URL |
| **Expected Result** | Placeholder/fallback shown; no broken image icon; rest of page renders |
| **Priority** | Low |

---

### BYR_UNIT_026 — Pre-allocation buyer cannot access cost sheet via API

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer not WINNER |
| **Test Steps** | 1. Call cost sheet API with this buyer's token |
| **Expected Result** | 403/401 or empty response — no unit data leaked |
| **Priority** | High |

---
