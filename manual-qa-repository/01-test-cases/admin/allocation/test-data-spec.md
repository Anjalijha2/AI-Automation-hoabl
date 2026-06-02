# Test Data Spec — Allocation — Admin Portal

**Module:** Allocation
**Portal:** Admin
**Environment:** UAT (https://uat-web.xrportal.in/admin/allocation)
**Generated:** 2026-06-02
**Source:** dual — INDEX.md form selectors + BRD §3 enums, §4 rules, §10.x reconciliations

---

## Valid Inputs

| Field | Selector (from INDEX.md) | Valid Values | Notes |
|-------|-------------------------|--------------|-------|
| Project | `.ant-select.ant-select-lg.fix-select-input-border` placeholder "Select Project" | Any project present in dropdown for UAT (typically projectId=2 per BRD §10.1) | Required `*` |
| Campaign Name | `input.ant-input.ant-input-lg[placeholder="Enter campaign name..."]` | 1–100 chars; suggest `QA_<Type>_<timestamp>` for uniqueness | Required `*` |
| Allocation Type | Ant Select default "Static" | `Static`, `Dynamic`, `Physical Event` (BRD §3) | Required `*` |
| Start Time (IST) | `input[placeholder="Select date"]` | Any date/time ≥ now+3min (BRD §4 Rule 1) | Required `*` |
| End Time (IST) | `input[placeholder="Select date"][disabled]` until Start chosen | Any date/time > Start Time | Required `*`; gated by Start (INDEX.md chronology note) |
| Description | `<textarea class="ant-input">` | 0–255 chars (charcount UI `0 / 255`) | Optional |
| commonPoolExcel | (file upload — surfaced only for Physical Event) | Excel with valid unit pool rows | Mandatory for PHYSICAL_EVENT per BRD §10.2 |
| allotmentExcel | (file upload — surfaced for STATIC/DYNAMIC) | Excel with valid allotment rows | Accepted for STATIC/DYNAMIC per BRD §10.2 |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error | Source |
|-------|--------------|----------------|--------|
| Start Time | now + 1 minute (less than 3min lead) | Validation error referencing 3-min lead | BRD §4 Rule 1 |
| Campaign Name | empty string | Ant Form required-field error | INDEX.md Form required marker |
| Project | unselected | Required-field error (Ant Form); backend silently defaults to UAT projectId=2 if omitted via API | BRD §10.1 |
| End Time | < Start Time | Validation error on End Time | BRD §6.3 + INDEX.md chronology |
| End Time (before Start chosen) | n/a — input is disabled (`aria-disabled="true"`) | Cannot interact | INDEX.md Form note |
| Description | 256+ chars | Charcount enforcement or validation error | INDEX.md "0 / 255" charcount |
| commonPoolExcel (PHYSICAL_EVENT) | missing | HTTP 400 "Common pool units Excel is required for PHYSICAL_EVENT allocation type" | BRD §10.2 |
| Excel rows | duplicate / invalid | HTTP 400 with XLSX binary error file (`physical-event-allocation-errors.xlsx` / `dynamic-allocation-errors.xlsx`) | BRD §10.3 |
| DYNAMIC Excel | unit row with 20 prior registrations | "Max registrations per unit exceeded (20)" | BRD §10.25 |
| New campaign during existing active OR ≤ 2min pre-start | overlapping window | Blocked by `checkAnyActiveCampaignExists` 2-minute pre-start gate | BRD §10.16 |
| typology mismatch in PHYSICAL_EVENT Excel | mismatched typology | Accepted (asymmetry — STATIC would reject) | BRD §10.26 |

---

## Pre-conditions

| Condition | Required For |
|-----------|--------------|
| Admin authenticated; session at `automation-repository/fixtures/.auth/admin.json` | All TCs |
| At least one project exists and is selectable | All FUNC TCs |
| At least one tower Active in Config CMS for the chosen project | TC_ALLOC_FUNC_005–007, FUNC_017, FUNC_020 (campaign must be meaningful — BRD §4 Rule 3) |
| No other Active campaign and no Upcoming campaign with startTime ≤ now+2min | TC_ALLOC_FUNC_005–007 (avoid §10.16 block) |
| A leftover stale Upcoming campaign exists | TC_ALLOC_BIZ_024 |
| Existing DYNAMIC campaign present | TC_ALLOC_FUNC_028 |
| Completed campaign with allotments | TC_ALLOC_FUNC_029 |
| Existing PHYSICAL_EVENT campaign with registrants | TC_ALLOC_FUNC_030 |
| Buyer-side unit in HOLD ≥ 20min without payment | TC_ALLOC_EDGE_031 |
| Buyer payment ended in cancelled/bounced/failed status | TC_ALLOC_EDGE_032 |

---

## Test Data Factory Values

| Variable | Purpose | Example |
|----------|---------|---------|
| `UAT_DEFAULT_PROJECT_ID` | Project selection | `2` (per BRD §10.1) |
| `CAMPAIGN_NAME_PREFIX` | Unique campaign name prefix | `QA_` |
| `TIMESTAMP` | Suffix for unique names | `2026-06-02T12-34-56` |
| `START_TIME_OFFSET_MIN` | Default lead time | `5` (passes §4 Rule 1) |
| `END_TIME_OFFSET_MIN` | Default campaign length | `20` |
| `SHORT_WINDOW_END_OFFSET_MIN` | For auto-transition tests | `3` |
| `commonPoolExcel` fixture | PHYSICAL_EVENT | `fixtures/allocation/physical-event-pool.xlsx` |
| `dynamicExcel` fixture | DYNAMIC | `fixtures/allocation/dynamic-allotment.xlsx` |
| `dynamicExcel_invalid` fixture | NEG_025 | `fixtures/allocation/dynamic-allotment-invalid.xlsx` |
| `dynamicExcel_20cap` fixture | NEG_027 | `fixtures/allocation/dynamic-unit-with-20-regs.xlsx` |

---

## Cleanup / Teardown

| TC | Cleanup Action |
|----|---------------|
| FUNC_005, FUNC_006, FUNC_007 | If campaign reaches Upcoming → Cancel via Actions menu (avoid §4 Rule 2 collisions); if reached Active → Stop |
| FUNC_017, FUNC_020 | Allow auto-Complete OR Stop before teardown |
| BIZ_022 | Cancel any seeded second-attempt campaign |
| BIZ_024 | Allow auto-Failed transition; document state |
| NEG_025, NEG_026, NEG_027 | None — submission rejected, no row created |

**Global cleanup:**
- After each test batch, ensure no Active campaign remains so subsequent tests can run (BRD §4 Rule 2)
- Do NOT manually destroy campaign rows via DB — rely on Stop/Cancel admin actions per BRD §5

---

## Constraints (carried from BRD)

- LeadSquared sync is downstream — out of scope for Allocation TCs (BRD §8 + project-wide constraint)
- Strapi CMS sidebar link is excluded — do not click "CMS" in nav
- `cancelUserAllocation` cross-user negative TC explicitly NOT generated — BRD §10 "KNOWN ISSUE: ownership check broken" advises against testing in UAT
- `FAILED` status is aspirational — BRD §10 destroy-bug means no row to assert against; documented in BIZ_024 caveat
- Stop/Cancel may use single `updateAllocationCampaign` endpoint with `action` field per BRD §10.7 — Stop/Cancel TCs are UI-driven and tolerant of either routing
