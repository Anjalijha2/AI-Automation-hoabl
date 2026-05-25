# Test Cases — Towers
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Towers.md

---

## Tower Page Layout & KPI Cards

### ADM_TWR_001 — Towers page loads at /admin/towers

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Towers" in left sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/towers; KPI cards and tower list render |
| **Priority** | Critical |

---

### ADM_TWR_002 — Total Towers KPI shows 18

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Read Total Towers card |
| **Expected Result** | Card displays "18" (fixed value for Xanadu project) |
| **Priority** | High |

---

### ADM_TWR_003 — Active Towers KPI reflects Config toggle state

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Crest and Crown active in Config |
| **Test Steps** | 1. Read Active Towers card |
| **Expected Result** | Card shows count of currently active towers (e.g. 2) |
| **Priority** | High |

---

### ADM_TWR_004 — Inactive Towers KPI shows remaining count

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | 2 active towers |
| **Test Steps** | 1. Read Inactive Towers card |
| **Expected Result** | Card shows 16 (= 18 - active count) |
| **Priority** | Medium |

---

### ADM_TWR_005 — Total Units KPI shows sum of all units across all towers

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Read Total Units card |
| **Expected Result** | Card displays sum of all units across all 18 towers |
| **Priority** | High |

---

### ADM_TWR_006 — Available Units KPI shows correct count

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Read Available Units card |
| **Expected Result** | Card shows total units with white (available) status |
| **Priority** | High |

---

### ADM_TWR_007 — Sold Units KPI shows count of booked units

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Read Sold Units card |
| **Expected Result** | Card shows count of units with red (sold) status |
| **Priority** | High |

---

### ADM_TWR_008 — Disabled Units KPI shows reserved/blocked count

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Read Disabled Units card |
| **Expected Result** | Card shows count of grey (reserved/blocked/refuge) units |
| **Priority** | Medium |

---

## Tower Sidebar List

### ADM_TWR_009 — Sidebar lists all 18 towers by name

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Inspect tower sidebar list |
| **Expected Result** | All 18 names present: Crest, Crown, Blossom, Bright, Pinnacle, Triumph, Prestige, Horizon, Dawn, Aura, Glory, Pride, Grace, Aspire, Prime, Fortune, Radiance, Grand |
| **Priority** | High |

---

### ADM_TWR_010 — Each tower row shows available unit count

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Inspect a tower row in sidebar |
| **Expected Result** | Row shows tower name and "N Units Available" (e.g. "159 Units Available") |
| **Priority** | High |

---

### ADM_TWR_011 — Inactive tower row shows "(Inactive)" label

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower with Inactive status in Config |
| **Test Steps** | 1. Inspect that tower row in sidebar |
| **Expected Result** | Row name suffixed with "(Inactive)" |
| **Priority** | High |

---

### ADM_TWR_012 — Click tower in sidebar loads its grid

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Click "Crest" in sidebar |
| **Expected Result** | Floor/unit grid for Crest loads in main area within 3 seconds |
| **Priority** | Critical |

---

### ADM_TWR_013 — Selected tower has visual active state in sidebar

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | A tower selected |
| **Test Steps** | 1. Click Crest<br>2. Observe sidebar row |
| **Expected Result** | Selected row highlighted/styled differently from others |
| **Priority** | Medium |

---

## Floor/Unit Grid

### ADM_TWR_014 — Grid header shows tower-specific totals

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Crest selected |
| **Test Steps** | 1. Read header bar above grid |
| **Expected Result** | Header shows Total, Available, Sold, Disabled counts for Crest only |
| **Priority** | High |

---

### ADM_TWR_015 — Grid renders as floor × unit-position matrix

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | A tower selected |
| **Test Steps** | 1. Inspect grid structure |
| **Expected Result** | Each row = a floor; each column = a unit position; cells represent units |
| **Priority** | High |

---

### ADM_TWR_016 — White cell indicates Available unit

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower grid loaded |
| **Test Steps** | 1. Identify a white unit cell<br>2. Note its border color |
| **Expected Result** | White fill with light border indicates Available status |
| **Priority** | High |

---

### ADM_TWR_017 — Red cell indicates Sold unit

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower grid loaded |
| **Test Steps** | 1. Identify a red unit cell |
| **Expected Result** | Red fill indicates Sold (booked and paid) |
| **Priority** | High |

---

### ADM_TWR_018 — Orange cell indicates Being Paid

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Active campaign with buyer in payment |
| **Test Steps** | 1. Identify an orange unit cell |
| **Expected Result** | Orange fill indicates another buyer currently in payment for that unit |
| **Priority** | High |

---

### ADM_TWR_019 — Grey cell indicates Reserved/Blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower grid loaded |
| **Test Steps** | 1. Identify a grey unit cell |
| **Expected Result** | Grey fill indicates Reserved, Blocked, Refuge, or Special allocation |
| **Priority** | Medium |

---

## Unit Detail Panel

### ADM_TWR_020 — Click white unit opens detail panel from right

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Crest grid loaded with white units visible |
| **Test Steps** | 1. Click a white unit cell |
| **Expected Result** | Unit detail panel slides in from right side |
| **Priority** | Critical |

---

### ADM_TWR_021 — Detail panel shows Unit Number

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Unit detail panel open |
| **Test Steps** | 1. Read Unit Number field |
| **Expected Result** | Format shown as "NNNN – TowerName" (e.g. "3502 – Crest") |
| **Priority** | High |

---

### ADM_TWR_022 — Detail panel shows BHK Type

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Unit detail panel open |
| **Test Steps** | 1. Read BHK Type field |
| **Expected Result** | Shows BHK config (e.g. "1 BHK Growth Home") |
| **Priority** | High |

---

### ADM_TWR_023 — Detail panel shows Size in sq.ft.

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Unit detail panel open |
| **Test Steps** | 1. Read Size field |
| **Expected Result** | Size shown with unit "sq.ft." (e.g. "323 sq.ft.") |
| **Priority** | High |

---

### ADM_TWR_024 — Detail panel shows Agreement Value

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Unit detail panel open |
| **Test Steps** | 1. Read Agreement Value field |
| **Expected Result** | Shown formatted with ₹ prefix (e.g. "₹32,99,000") |
| **Priority** | Critical |

---

### ADM_TWR_025 — Detail panel shows Early Bird Discount

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Unit detail panel open |
| **Test Steps** | 1. Read Early Bird Discount field |
| **Expected Result** | Shown with ₹ prefix (e.g. "₹27,000") if discount applies |
| **Priority** | High |

---

### ADM_TWR_026 — Detail panel shows All Inclusive Price

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Unit detail panel open |
| **Test Steps** | 1. Read All Inclusive Price field |
| **Expected Result** | Calculated price shown (Agreement Value minus applicable offers) |
| **Priority** | High |

---

### ADM_TWR_027 — Detail panel can be closed

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Detail panel open |
| **Test Steps** | 1. Click X / close button on panel |
| **Expected Result** | Panel slides out; grid resumes full width |
| **Priority** | Medium |

---

### ADM_TWR_028 — Click red (sold) unit does NOT open detail panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower grid loaded with red units |
| **Test Steps** | 1. Click a red unit cell |
| **Expected Result** | No panel opens; no action triggered |
| **Priority** | High |

---

### ADM_TWR_029 — Click grey (reserved) unit does NOT open detail panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower grid loaded with grey units |
| **Test Steps** | 1. Click a grey unit cell |
| **Expected Result** | No panel opens; no action triggered |
| **Priority** | Medium |

---

### ADM_TWR_030 — Click orange (being paid) unit does NOT open detail panel

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Active campaign with orange unit |
| **Test Steps** | 1. Click an orange unit cell |
| **Expected Result** | No panel opens; cell is non-interactive |
| **Priority** | Medium |

---

## Read-Only & Navigation

### ADM_TWR_031 — No edit/configure controls present on Towers page

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded |
| **Test Steps** | 1. Inspect entire page for any edit/save buttons |
| **Expected Result** | Page is fully read-only; no controls to change tower or unit status |
| **Priority** | High |

---

### ADM_TWR_032 — Switch between towers updates main grid

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Crest currently selected |
| **Test Steps** | 1. Click Crown in sidebar |
| **Expected Result** | Grid replaces Crest with Crown's floor/unit layout; header updates |
| **Priority** | High |

---

### ADM_TWR_033 — Navigate to Towers via "View Tower" link in Config

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Admin on /admin/cms Section 1 |
| **Test Steps** | 1. Locate green "View Tower >" link next to a tower<br>2. Click it |
| **Expected Result** | /admin/towers opens with that tower already selected; its grid visible |
| **Priority** | High |

---

### ADM_TWR_034 — Offer discount reflected in All Inclusive Price

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Active offer applicable to the unit's typology |
| **Test Steps** | 1. Open unit detail<br>2. Compare Agreement Value to All Inclusive Price |
| **Expected Result** | All Inclusive Price = Agreement Value - active offers; difference reflects offers |
| **Priority** | High |

---

### ADM_TWR_035 — Pricing updated in Config Section 4 reflects immediately here

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Admin just uploaded new pricing via Config Section 4 |
| **Test Steps** | 1. Open Towers, navigate to affected tower<br>2. Click an updated unit |
| **Expected Result** | Agreement Value reflects newly uploaded pricing |
| **Priority** | Critical |

---

### ADM_TWR_036 — Tower toggle change in Config updates Active Towers KPI on this page

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Towers page loaded; Active Towers = 2 |
| **Test Steps** | 1. Toggle one more tower active in Config and Update<br>2. Return to Towers page; refresh |
| **Expected Result** | Active Towers KPI now = 3 |
| **Priority** | High |

---

### ADM_TWR_037 — Grid loads units for tower with high inventory in under 3 seconds

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower with 159+ units |
| **Test Steps** | 1. Click tower with high inventory<br>2. Time grid render |
| **Expected Result** | Grid fully renders within 3 seconds |
| **Priority** | Medium |

---

### ADM_TWR_038 — Selecting tower with 0 available units shows full grid still

| Field | Value |
|-------|-------|
| **Module** | ADM – Towers |
| **Pre-conditions** | Tower with all units sold |
| **Test Steps** | 1. Click that tower in sidebar |
| **Expected Result** | Grid loads with all red units; no available white cells |
| **Priority** | Medium |

---
