# Test Data Specification — Config / CMS Module (Admin Portal)

**Module:** Config / CMS (Configurations page)
**Portal:** XR Portal Admin
**Source TCs:** `TC_ADMIN_CMS.md` (36 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value |
|------|-------|
| Admin Mobile | `8888888888` |
| Admin OTP | `258369` |
| Storage State | `automation-repository/fixtures/.auth/admin.json` |
| ADMIN_JWT | extracted |

---

## 2. Section-Specific Data

### Section 1 — Tower Configuration
- 18 tower toggles
- UAT default Active: **Crest (Tower 8)**, **Crown (Tower 10)**
- Disposable test tower for FUNC_001-002 / BIZ_001: pick one currently Inactive (e.g., Bright)

### Section 2 — Registration Status CSV
| Col | Header | Valid Values |
|-----|--------|--------------|
| 1 | Registration Number | `GHNG-XXXXXXXX-A` |
| 2 | Allocation Status | `Allow` or `Forbid` (case-insensitive) |

### Section 3 — Unit Status CSV
| Col | Header | Valid Values |
|-----|--------|--------------|
| — | Unit ID / Number | unitId |
| — | Status | `AVAILABLE` or `RESERVED` |
| — | Update | `1` (apply) or `0` (skip) |

### Section 4 — Unit Cost Update XLSX
- Source: download Available Unit Inventory XLSX
- Editable: `Agreement_Value`, `EarlyBird`, `Update` (1/0)

### Section 5 — Bulk Booking Cancellation XLSX
| Col | Header |
|-----|--------|
| — | Registration Number |

### Section 6 — Bulk Registration Cancellation XLSX
| Col | Header | Notes |
|-----|--------|-------|
| 1 | Registration Number | Cascades to all sub-registrations |
| 2 | Update | `1` cancel, `0` skip |

### Section 7 — Sales Managers XLSX
| Col | Header | Notes |
|-----|--------|-------|
| 1 | Role | `Sales Manager` |
| 2 | First Name | text |
| 3 | Last Name | text |
| 4 | Email | email format (duplicates allowed) |
| 5 | Phone | 10-digit — **merge key** |
| 6 | IS_AVAILABLE | `1`/`0` |
| 7 | IS_ACTIVE | `1`/`0` |

### Section 8 — Customer Actions Card
| Control | Test Value | UAT Default |
|---------|-----------|-------------|
| Allow Additional Registrations master | ON/OFF | ON |
| 1 Bed Growth Home checkbox + count | ON, 10 | ON, 15 |
| 2 Bed Growth Home checkbox + count | ON, 17 | ON, 17 |
| 2 Bed Rise Home checkbox + count | ON, 20 | ON, 20 |

### Section 9 — Max Preferences Per Unit
- Default: 6
- Range: 0-255

---

## 3. Invalid / Boundary Inputs

| Section | Invalid Input | Expected |
|---------|--------------|----------|
| 2 | Submit without file | Silent failure (BUG_010) |
| 3 | Status = `BLOCKED` | Row error in result file |
| 3 | All Update=0 | "No rows marked for update" |
| 7 | Phone = `123` | Row error in result |
| 7 | `.txt` / `.csv` file | Rejected |
| 9 | Value > 255 or < 0 | Validation error |
| Bulk error | XLSX with bad rows | HTTP 400 + downloadable error Excel |

---

## 4. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| FUNC_001-002 (tower toggle) | Disposable Inactive tower; restore in afterEach |
| FUNC_004 (Section 2 upload) | Disposable Registration Numbers in CSV |
| FUNC_005 (Section 3) | Disposable unit IDs |
| FUNC_007 (Section 4 cost) | Disposable unit; coordinate (immediate effect) |
| FUNC_008-009 (cancellation) | DISPOSABLE Registration/Booking; gated `ALLOW_DESTRUCTIVE=1` |
| FUNC_010 (SM upload) | Unique phone |
| FUNC_012 (Section 8 master OFF) | Cross-portal access; non-production |
| BIZ_002 (live campaign cost change) | Active campaign + non-prod + ALLOW_DESTRUCTIVE |
| API | ADMIN_JWT populated |

---

## 5. Cleanup / Teardown

- Tower toggles: snapshot all 18 in beforeAll, restore in afterAll
- Customer Actions Card: snapshot before, restore after
- Max Preferences: snapshot, restore
- SM upload: phone merge key — reusable across runs
- Cancellations: NOT reversible — only run on disposable data

---

## 6. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Tower changes lost without Update click | Easy data loss | Always click Update at end of test |
| Unit Cost Update immediate live effect | CRITICAL | Gate behind `ALLOW_DESTRUCTIVE=1`; non-prod only |
| Bulk Booking/Reg Cancellation does NOT auto-refund | Manual refund needed | Cross-module test; document expectation |
| Bulk Registration Cancellation cascades A/B/C/... | Irreversible | Use disposable registrations only |
| BUG_010 — Section 2 silent fail | Expected fix pending | Assert silent fail today; flip expectation when fix lands |
| Section 8 master toggle overrides checkboxes | Easy mistake | Restore master to ON in afterEach |
| `.xlsx` only for Section 7 | Other formats rejected | Use XLSX |
| 9 sections on one long page | Wrong Submit button risk | Scroll to section + scope selector |

---

## 7. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_JWT` | API auth | extracted |
| `ALLOW_DESTRUCTIVE` | Allow cost/cancellation/master-off TCs | unset |
| `UAT_DISPOSABLE_REG_NO` | Registration Number for cancellation tests | per-run |
| `UAT_DISPOSABLE_TOWER` | Tower for toggle tests | `Bright` |
| `UAT_SM_TEST_PHONE` | SM bulk-upload phone | `9000000001` |
