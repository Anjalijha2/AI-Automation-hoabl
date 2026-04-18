# TC_CHANNEL_PARTNERS — Channel Partners Module Manual Test Cases

**Module:** Channel Partners (`/admin/channel-partners`)  
**Sprint:** 3  
**Author:** QA  
**Last Updated:** 2026-04-14  
**Total TCs:** 13 (TC-CP-001–006, 008–012; TC-CP-007 removed — Mark as Master deferred)

---

## Page Overview

| Zone | Description |
|------|-------------|
| **Header** | "N Channel Partners" title + Map Master CP / Reset Filters / Refresh buttons |
| **Search Bar** | Phone number input — filters table rows server-side |
| **Table** | Checkbox \| Owner Name \| Firm Name \| HV Code \| Master HV Code \| Business Region \| Pincode \| Phone \| CP Type \| SM Name \| SM Email ID \| SM Mobile Number \| KYC Status \| Actions |
| **Actions** | Eye icon → CP detail drawer · … icon → Mark as Master dropdown |
| **Map Master CP** | Disabled until row(s) selected; opens modal with Master HV Code dropdown |

---

## Section 1 — Page Load & Structure

### TC-CP-001 — Page loads with correct total CP count
**Priority:** P1  
**Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/channel-partners` | Page loads; header title visible |
| 2 | Read title text | Shows "2705 Channel Partners" (pinned baseline) |

**Pass Criteria:** Total count = 2705.

---

### TC-CP-002 — Table displays all required columns
**Priority:** P1  
**Type:** Smoke

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/channel-partners` | Table renders |
| 2 | Read all `<th>` column headers | 13 columns present: Owner Name, Firm Name, HV Code, Master HV Code, Business Region, Pincode, Phone, CP Type, SM Name, SM Email ID, SM Mobile Number, KYC Status, Actions |

**Pass Criteria:** All 13 columns present.

---

## Section 2 — Search

### TC-CP-003 — Search by phone filters results to matching CP
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/channel-partners` | Page loads |
| 2 | Type "8000000002" into Phone search input | Table filters; row with that phone visible |
| 3 | Read row data | Owner Name = "Testing uat CP", HV Code = "HV00026097", Phone contains "8000000002" |

**Pass Criteria:** Matching row found with correct owner name and HV code.

---

### TC-CP-004 — Reset Filters clears search and restores full list
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate and type "8000000002" into Phone search | Input has "8000000002" |
| 2 | Click "Reset Filters" button | Phone input is cleared (empty) |
| 3 | Read total count from header | Count returns to 2705 |

**Pass Criteria:** Input cleared; total = 2705.

---

## Section 3 — View (Eye) Drawer

### TC-CP-005 — Eye icon opens CP detail drawer with correct title and fields
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search by phone "8000000002" | Row visible |
| 2 | Click eye (view) icon on that row | Drawer opens |
| 3 | Check drawer title | "Channel Partner Details" |
| 4 | Read drawer body | Contains HV Code, KYC Status, Owner Name, Phone labels + "HV00026097", "Testing uat CP" values |

**Pass Criteria:** Drawer title and all key field labels/values present.

---

### TC-CP-006 — CP detail drawer shows KYC status and firm details
**Priority:** P2  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search and open drawer for phone "8000000002" | Drawer open |
| 2 | Check section headings in drawer | Basic Information, Firm Details, Contact Details, Additional Details all present |
| 3 | Check KYC status value | One of: Pending / Approved / Rejected / Verified |

**Pass Criteria:** All 4 section headings and a valid KYC status value present.

---

## Section 4 — Map Master CP

### TC-CP-008 — Map Master CP button disabled by default, enabled after row selection
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page | "Map Master CP" button is disabled |
| 2 | Click checkbox on first data row | Row selected |
| 3 | Check button state | "Map Master CP" button is now enabled |

**Pass Criteria:** Button transitions from disabled → enabled on row selection.

---

### TC-CP-009 — Map Master CP modal opens with correct title and Master HV Code selector
**Priority:** P1  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select first row and click "Map Master CP" | Modal opens |
| 2 | Read modal title | "Map CPs to Master" |
| 3 | Read modal body | Contains "Master HV Code" selector + note about mapping N CP(s) |

**Pass Criteria:** Modal title correct; body contains "Master HV Code" and mapping note.

---

## Section 5 — Column Filters

### TC-CP-011 — All filterable columns have icons and CP Type filter returns correct results
**Priority:** P1
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/channel-partners` | Table loads |
| 2 | Inspect column headers for filter/search icons | Owner Name, Firm Name, HV Code, Pincode → search (🔍) icon; Master HV Code, Business Region, CP Type → filter (▼) icon |
| 3 | Click CP Type filter icon → select "Master CP" → click OK | Table shows only Master CP rows |
| 4 | Read CP Type cell of visible rows | All show "Master CP" |
| 5 | Click CP Type filter icon → click Reset | Filter cleared; total count returns to 2706 |

**Pass Criteria:** All 7 filterable columns have correct icon type; CP Type filter shows only Master CP rows; Reset restores full list.

---

## Section 6 — Refresh

### TC-CP-010 — Refresh button reloads data without changing total count
**Priority:** P2  
**Type:** Functional

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate and read total count (2705) | Baseline count noted |
| 2 | Click "Refresh" button | Page reloads data |
| 3 | Read total count again | Count = 2705 (unchanged) |

**Pass Criteria:** Count identical before and after refresh.
