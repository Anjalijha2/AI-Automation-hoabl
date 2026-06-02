# Test Data Spec — Config — Admin Portal

**Module:** Config (`/admin/cms`)
**Generated:** 2026-06-02
**Sources:** `visual-memory/admin/config/INDEX.md` (FULL) + `ADMIN-BRD-Config-CMS.md`

---

## Pre-conditions (apply to ALL TCs)

- **Auth:** Admin role session — `automation-repository/fixtures/.auth/admin.json`
- **Base URL:** `https://uat-web.xrportal.in/admin/cms`
- **Viewport:** 1920×900 (matches visual-memory capture)
- **Environment:** UAT (Mavis bookingNumber prefix `U` per BRD §11.5)
- **No active allocation campaign** unless TC explicitly requires one (Section 2, Section 5 cancellation are blocked during active campaigns per BRD §11.4, §11.7)

---

## Section 1 — Tower Configuration

### Valid Inputs
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Tower toggle | ON / OFF | 18 cards: 1-Dawn, 2-Aura, 3-Glory, 4-Pride, 5-Grace, 6-Aspire, 7-Blossom, 8-Crest, 9-Triumph, 10-Crown, 11-Prime, 12-Pinnacle, 13-Prestige, 14-Horizon, 15-Radiance, 16-Fortune, 17-Bright, 18-Grand |

### Baseline UAT State
- INDEX.md observed Inactive: Horizon, Pinnacle, Bright
- BRD §5 Section 1 noted: Tower 8 (Crest), Tower 10 (Crown) Active default
- Use these to seed toggle TCs

### Cleanup
- After test, reset toggles to original baseline and click Update Tower Configuration

---

## Section 2 — Registration Status

### Valid Inputs (CSV)
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Registration Number | e.g. `GHNG-1000008563-A` | Must be existing registration |
| Allocation Status | `Allow`, `Forbid` (case-insensitive: `allow`, `ALLOW`, `forbid`) | BRD §5 Section 2 |

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| (no file) | Submit clicked with no file selected | **BUG_010 (Open):** silent failure expected; should error per BRD §7 |
| Allocation Status | `Maybe`, `Pending` | Row rejected with error in result |
| Registration Number | Non-existent number | Row skipped/errored |
| Row status WINNER or HOLD | (existing record) | Row silently excluded per BRD §11.7 |

### Side-effects to verify
- ALLOW → DB `status=PREALLOCATED`, `availableForAllocation=true`
- FORBID → DB `status=WAITLIST`, `availableForAllocation=false`
- Redis sync triggered
- Python `/broadcast-registrations` triggered

### Cleanup
- Revert any updated registrations to original status via DB or repeated upload

---

## Section 3 — Unit Status

### Valid Inputs (CSV)
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Unit Number | Existing unit IDs | |
| Status | `AVAILABLE`, `RESERVED` | Strict per BRD §11.8 |
| Update | `1` (apply) or `0` (skip) | BRD §6 Rule 4 |

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| Status | `BLOCKED`, `SOLD`, `BOOKED` (as target) | Row errored per BRD §7 |
| All rows | Update = 0 across the board | HTTP 400 "No rows marked for update" |
| Source status | BOOKED unit → AVAILABLE | Rejected; only AVAILABLE↔RESERVED per BRD §11.8 |

### Cleanup
- Revert affected units to original status

---

## Section 4 — Unit Cost Update

### Valid Inputs (XLSX)
| Field | Valid Values | Notes |
|-------|--------------|-------|
| allocationCalcType | `PERCENT` or `AMOUNT` | BRD §11.8 |
| allocationPercent | Numeric ≥ 0 (required when calcType=PERCENT) | |
| allocationAmount | Numeric ≥ 0 (required when calcType=AMOUNT) | |
| Update | `1` or `0` | |

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| calcType | `MIXED`, blank | Rejected |
| PERCENT mode | allocationPercent missing | Validation error per chunk |
| AMOUNT mode | allocationAmount missing | Validation error per chunk |
| Many bad rows | 2+ failing chunks | Process aborts mid-file per BRD §11.8 |

### Behaviour to verify
- Pricing changes apply immediately, even during active campaigns (BRD §6 Rule 2)
- Sample download excludes BOOKED/HOLD/REFUGE/PBT statuses (BRD §11.8)
- Chunk size = 250 rows
- Abort after 2 chunk failures

### Cleanup
- Restore original pricing via repeat upload or DB

---

## Section 5 — Bulk Booking Cancellation

### Valid Inputs (XLSX)
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Registration Number | Existing booking with `RegistrationUnit.status = WINNER` | BRD §11.4 |

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| Source state | Allocation campaign currently active | HTTP 400 "Cannot cancel booking when campaign is active" |
| Source state | Mavis booking exists for bookingNumber (env-prefixed `U` for UAT) | HTTP 400 "Mavis booking still exists..." |
| RegistrationUnit.status | non-WINNER (PREALLOCATED, WAITLIST, etc.) | Row error "Not cancelable" in result |

### Cascade to verify (BRD §11.6)
- `registration_units`: 20+ columns cleared
- `payment_transactions`: soft-delete
- `MilestonePaymentTracking`: soft-delete
- `RegistrationUnitPaymentSchedule`: soft-delete
- `RegistrationUnitOffer`: soft-delete
- `ParkingInventory`: HOLD/BOOKED rows released to AVAILABLE

### Cleanup
- Hard restore is not possible (soft-deletes only) — use a disposable seed booking

---

## Section 6 — Bulk Registration Cancellation

### Valid Inputs (XLSX)
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Registration Number | Root registration ID (without sub-letter) | |
| Update | `1` (cancel) or `0` (skip) | BRD §6 Rule 4 |

### Behaviour to verify
- ALL sub-registrations (A, B, C…) for matched root are cancelled (BRD §6 Rule 6)
- No automatic refund (BRD §6 Rule 5)

### Cleanup
- Use disposable seed registrations — operation is irreversible

---

## Section 7 — Sales Managers

### Valid Inputs (XLSX)
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Role | SM-recognised role string | |
| First Name | non-empty string | |
| Last Name | non-empty string | |
| Email | any string (uniqueness NOT enforced — BRD §7) | |
| Phone | 10-digit numeric — used as merge key (BRD §6 Rule 7) | |
| IS_AVAILABLE | `1` or `0` | |
| IS_ACTIVE | `1` or `0` | |

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| File format | `.csv`, `.pdf`, `.docx`, `.txt` | Rejected per BRD §6 Rule 8 |
| Phone | Less than 10 digits (e.g. `12345`) | Row error in result XLSX |
| Email | Same email twice | Allowed — duplicate OK per BRD §7 |

### Cleanup
- Soft-delete created SMs via DB or admin UI (if possible) — phone-based merge key means re-running with new phone creates new records

---

## Section 8 — Customer Actions Card

### Valid Inputs
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Allow Additional Registrations toggle | ON / OFF | Master switch (BRD §6 Rule 9) |
| Allow 1 Bed Growth Home checkbox | ON / OFF | |
| Allow 2 Bed Growth Home checkbox | ON / OFF | |
| Allow 2 Bed Rise Home checkbox | ON / OFF | |
| Count per checkbox | integer ≥ 0 | UAT baseline: 15 / 17 / 20 |

### Backend constraints (BRD §11.2)
- "2 Bed Peak Home" → force-overridden to `isAllowed=false, countAllowed=0` server-side regardless of UI submission

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| Unchanged Submit | identical to current state | HTTP 400 "No Change Detected" per BRD §11.3 |
| dataType (API-level) | any value not in `string|number|boolean|json|date|datetime|array|object` | Rejected per BRD §11.1 |

### Cleanup
- Restore baseline: master ON, all 3 ticked, 15/17/20

---

## Section 9 — Max Preferences Per Unit

### Valid Inputs
| Field | Valid Values | Notes |
|-------|--------------|-------|
| Value | 0–255 integer | BRD §6 Rule 10 |

### Invalid / Boundary Inputs
| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| Value | -1 | Rejected |
| Value | 256 | Rejected |
| Value | Non-integer (e.g. 6.5, "abc") | Rejected |

### Behaviour to verify
- Lower cap does NOT invalidate existing preferences (BRD §6 Rule 10)
- New preferences blocked above the cap

### Cleanup
- Reset to UAT baseline value 6

---

## Cross-Module Cleanup

| TC | Cleanup Action |
|----|----------------|
| TC_CONFIG_XMOD_001 (Tower → Towers + Customers KPI) | Revert tower toggle and click Update Tower Configuration |
| TC_CONFIG_XMOD_002 (SM provisioned → list page) | Inactivate created SM via DB or admin |
| TC_CONFIG_XMOD_003 (Unit Cost → Offers) | Restore previous price via repeat upload |

---

## Fixture Files Required (to be created by Tech Lead Agent / QA Agent)

| Fixture File | Used By |
|-------------|---------|
| `automation-repository/fixtures/data/config/registration-status-valid.csv` | TC_CONFIG_FUNC_004 |
| `automation-repository/fixtures/data/config/unit-status-valid.csv` | TC_CONFIG_FUNC_005 |
| `automation-repository/fixtures/data/config/unit-status-all-zero.csv` | TC_CONFIG_NEG_005 |
| `automation-repository/fixtures/data/config/unit-status-invalid.csv` | TC_CONFIG_NEG_006 |
| `automation-repository/fixtures/data/config/unit-cost-percent.xlsx` | TC_CONFIG_FUNC_007 |
| `automation-repository/fixtures/data/config/unit-cost-amount.xlsx` | TC_CONFIG_FUNC_008 |
| `automation-repository/fixtures/data/config/booking-cancellation.xlsx` | TC_CONFIG_FUNC_009, FUNC_010 |
| `automation-repository/fixtures/data/config/registration-cancellation.xlsx` | TC_CONFIG_FUNC_011, NEG_011 |
| `automation-repository/fixtures/data/config/sm-bulk-upload.xlsx` | TC_CONFIG_FUNC_012, NEG_012/13/14 |
| `automation-repository/fixtures/data/config/non-xlsx-format.csv` | TC_CONFIG_NEG_012 |

---

## Notes for Tech Lead Agent

- Locators in `locators/admin/locator-map.json` should be sourced from INDEX.md §Key Structural Notes and §Containers & CSS Classes (e.g., `.tower-configuration-wrapper`, `.tower-configuration-section`, `.tower-configuration-switch .ant-switch`).
- Counter-text assertions (e.g. "Total active registration: 8677") should use regex to tolerate live-data drift.
- Mavis env-prefix `U` (UAT) vs `D` (dev) vs raw (prod) — encode in `constants/testData.js`.
