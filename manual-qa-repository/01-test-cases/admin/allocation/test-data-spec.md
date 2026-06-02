# Test Data Spec — Allocation — Admin Portal

**Module:** Allocation
**Portal:** Admin
**Environment:** UAT (https://uat-web.xrportal.in/admin/allocation)
**Generated:** 2026-06-02 (re-run, supersedes previous Conditional spec)
**Source:** dual — INDEX.md form selectors + 9 captured screens (FULL) + BRD §3 enums, §4 rules, §10.x reconciliations

---

## Valid Inputs

| Field | Selector (from INDEX.md) | Valid Values | Notes |
|-------|-------------------------|--------------|-------|
| Project | `.ant-select.ant-select-lg.fix-select-input-border` placeholder "Select Project" | Any project in dropdown (UAT default `Xanadu Test Project`, projectId typically `2` per BRD §10.1) | Required `*` |
| Campaign Name | `input.ant-input.ant-input-lg[placeholder="Enter campaign name..."]` | 1–100 chars; suggest `QA_<Type>_<timestamp>` | Required `*` |
| Allocation Type | Ant Select default "Static" | `Static`, `Dynamic`, `Physical Event` (BRD §3) | Required `*`. Observed table values: `STATIC`, `PHYSICAL_EVENT`, `DYNAMIC` |
| Start Time (IST) | `input[placeholder="Select date"]` | Any date/time ≥ now+3min (BRD §4 Rule 1) | Required `*` |
| End Time (IST) | `input[placeholder="Select date"][disabled]` until Start chosen | Any date/time > Start Time | Required `*`; gated by Start (INDEX.md chronology note) |
| Description | `<textarea class="ant-input">` | 0–255 chars (charcount UI `0 / 255`) | Optional |
| commonPoolExcel | (file upload — surfaced only for Physical Event) | Excel with valid unit pool rows | Mandatory for PHYSICAL_EVENT per BRD §10.2 |
| allotmentExcel | (file upload — surfaced for STATIC/DYNAMIC) | Excel with valid allotment rows | Accepted for STATIC/DYNAMIC per BRD §10.2 |

---

## Campaign Status Enum (filter dropdown — authoritative)

Asserted by `TC_ALLOC_UI_005`.

| Value | Visible in filter | Allowed campaign-list state? |
|-------|-------------------|------------------------------|
| `All Status` | Yes (pseudo) | filter only |
| `Active` | Yes | Yes |
| `Upcoming` | Yes | Yes |
| `Completed` | Yes | Yes |
| `Stopped` | Yes | Yes |
| `Cancelled` | Yes | Yes |
| `Failed` | Yes | Yes (aspirational — see BRD §10 known issue: row may be destroyed) |
| `Approved` | **No** | **No** — not a campaign-list status. Belongs to buyer-allocation context in Customers module |

---

## UAT Seeded Reference Campaigns (used in TCs)

| Campaign id | Name | Type | Status | Used by TC |
|-------------|------|------|--------|------------|
| `288` | `test` (Physical Event Completed) | PHYSICAL_EVENT | Completed | UI_036, UI_038, FUNC_039, FUNC_040, UI_041, NEG_044 |
| `289` | `PE QA : Camp Test 4` | STATIC | Active | UI_005, UI_021, UI_037, FUNC_023, NEG_027, NEG_044 |
| `291` | `Test dynamic campaign` | DYNAMIC | Active | UI_043, NEG_044 |
| `282` | (STATIC stopped) | STATIC | Stopped | UI_038 |
| `"Test"` | (STATIC upcoming, manually created by user with future startTime) | STATIC | Upcoming | UI_022, FUNC_025 |

For destructive TCs (`FUNC_024`, `FUNC_026`, `FUNC_042`) a **disposable** campaign must be created per run — do NOT use the shared seeded ones above.

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error / UI Behaviour | Source |
|-------|--------------|------------------------------|--------|
| Project | unselected, submit | Inline error `Project is required` under field (red `.ant-form-item-explain-error`) — visible in `allocation-form-validation-errors.png` | INDEX.md form-validation capture + BRD §6.3 |
| Campaign Name | empty, submit | Inline error `Campaign name is required` | INDEX.md form-validation capture |
| Start Time | unselected, submit | Inline error `Start time is required` | INDEX.md form-validation capture |
| End Time | unselected, submit | Inline error `End time is required` | INDEX.md form-validation capture |
| Start Time | now + 1 minute (less than 3min lead) | Validation error referencing 3-min lead | BRD §4 Rule 1 |
| End Time | < Start Time | Validation error on End Time | BRD §6.3 + INDEX.md chronology |
| End Time (before Start chosen) | n/a — input is disabled (`aria-disabled="true"`) | Cannot interact | INDEX.md Form note |
| Description | 256+ chars | Charcount enforcement or validation error | INDEX.md "0 / 255" charcount |
| commonPoolExcel (PHYSICAL_EVENT) | missing | HTTP 400 "Common pool units Excel is required for PHYSICAL_EVENT allocation type" | BRD §10.2 |
| Excel rows | duplicate / invalid | HTTP 400 with XLSX binary error file (`physical-event-allocation-errors.xlsx` / `dynamic-allocation-errors.xlsx`) | BRD §10.3 |
| DYNAMIC Excel | unit row with 20 prior registrations | "Max registrations per unit exceeded (20)" | BRD §10.25 |
| New campaign during existing active OR ≤ 2min pre-start | overlapping window | Blocked by `checkAnyActiveCampaignExists` 2-min gate | BRD §10.16 |
| typology mismatch in PHYSICAL_EVENT Excel | mismatched typology | Accepted (asymmetry — STATIC would reject) | BRD §10.26 |
| Stop modal dismiss selector | `button:has-text("Cancel")` | Returns 0 elements — label is **Close**, not Cancel | INDEX.md Stop modal naming note |
| Campaign filter status value | `Approved` | Does not exist in dropdown — selector returns 0 options | INDEX.md Status Filter section |

---

## Pre-conditions (TC → required state)

| Condition | Required For |
|-----------|--------------|
| Admin authenticated; session at `automation-repository/fixtures/.auth/admin.json` | All TCs |
| At least one project exists and is selectable | All FUNC TCs |
| At least one tower Active in Config CMS for the chosen project | FUNC_006–008, FUNC_020, BIZ_031 (BRD §4 Rule 3) |
| No other Active campaign and no Upcoming campaign with startTime ≤ now+2min | FUNC_006–008 (avoid §10.16 block) |
| Existing Active campaign (id 289) | UI_005, UI_021, UI_037, FUNC_023, NEG_027 |
| Existing Upcoming campaign (e.g. "Test") | UI_022, FUNC_025 |
| Existing DYNAMIC campaign Active (id 291) | UI_043, NEG_044 |
| Existing Completed Physical Event campaign (id 288) | UI_036, UI_038, FUNC_039, FUNC_040, UI_041 |
| Stopped STATIC campaign (id 282) | UI_038 |
| **Disposable** Active campaign created this run | FUNC_024 (Stop confirm destructive) |
| **Disposable** Upcoming campaign created this run | FUNC_026 (Cancel confirm destructive) |
| **Disposable** Physical Event campaign with test registrants | FUNC_042 (Notify confirm destructive) |
| A leftover stale Upcoming campaign exists | BIZ_032 |
| Buyer-side unit in HOLD ≥ 20min without payment | EDGE_047 |
| Buyer payment ended in cancelled/bounced/failed status | EDGE_048 |

---

## Test Data Factory Values

| Variable | Purpose | Example |
|----------|---------|---------|
| `UAT_DEFAULT_PROJECT_ID` | Project selection | `2` (per BRD §10.1) |
| `CAMPAIGN_NAME_PREFIX` | Unique campaign name prefix | `QA_` |
| `TIMESTAMP` | Suffix for unique names | `2026-06-02T12-34-56` |
| `START_TIME_OFFSET_MIN` | Default lead time | `5` (passes §4 Rule 1) |
| `END_TIME_OFFSET_MIN` | Default campaign length | `20` |
| `SHORT_WINDOW_END_OFFSET_MIN` | Auto-transition tests | `3` |
| `STOP_CANCEL_POLL_TIMEOUT_MS` | Async §10.18 polling cap | `30000` |
| `STOP_CANCEL_POLL_INTERVAL_MS` | Async §10.18 poll interval | `2000` |
| `commonPoolExcel` fixture | PHYSICAL_EVENT | `fixtures/allocation/physical-event-pool.xlsx` |
| `dynamicExcel` fixture | DYNAMIC | `fixtures/allocation/dynamic-allotment.xlsx` |
| `dynamicExcel_invalid` fixture | NEG_033 | `fixtures/allocation/dynamic-allotment-invalid.xlsx` |
| `dynamicExcel_20cap` fixture | NEG_035 | `fixtures/allocation/dynamic-unit-with-20-regs.xlsx` |

---

## Async Stop / Cancel Pattern (BRD §10.18)

`terminateAllocationCampaign` calls Python `/campaign/stop`; status flip is callback-driven, NOT synchronous.

Any destructive TC that expects status change after confirm (`FUNC_024`, `FUNC_026`) must:

1. Click confirm button (`Yes, Stop Now` / `Yes, Cancel`)
2. `await page.waitForLoadState('networkidle')`
3. Click filter-bar `Refresh`
4. Poll the row's Status cell up to `STOP_CANCEL_POLL_TIMEOUT_MS` (30 s) every `STOP_CANCEL_POLL_INTERVAL_MS` (2 s)
5. Fail the TC if status has not flipped within the window

Do NOT write `expect(status).toBe('Stopped')` synchronously after clicking confirm — it will race.

---

## Cleanup / Teardown

| TC | Cleanup Action |
|----|---------------|
| FUNC_006, FUNC_007, FUNC_008 | If campaign reached Upcoming → Cancel via row action (avoid §4 Rule 2 collisions); if Active → Stop |
| FUNC_020, FUNC_028 | Allow auto-Complete OR Stop before teardown |
| FUNC_024 | Disposable campaign already Stopped — no further teardown |
| FUNC_026 | Disposable campaign already Cancelled — no further teardown |
| FUNC_042 | Disposable campaign — leave; notification logs are downstream |
| BIZ_030 | Cancel any seeded second-attempt campaign |
| BIZ_032 | Allow auto-Failed transition; document state |
| NEG_033, NEG_034, NEG_035 | None — submission rejected, no row created |

**Global cleanup:**
- After each test batch, ensure no Active campaign remains so subsequent tests can run (BRD §4 Rule 2)
- Do NOT manually destroy campaign rows via DB — rely on Stop/Cancel admin actions per BRD §5
- Reset filter bar Status filter to `All Status` between tests so subsequent TCs see the full row set

---

## Constraints (carried from BRD)

- LeadSquared sync is downstream — out of scope for Allocation TCs (BRD §8 + project-wide constraint)
- Strapi CMS sidebar link is excluded — do not click "CMS" in nav
- `cancelUserAllocation` cross-user negative TC explicitly NOT generated — BRD §10 "KNOWN ISSUE: ownership check broken" advises against testing in UAT
- `FAILED` status is aspirational — BRD §10 destroy-bug means no row to assert against; documented in BIZ_032 caveat
- Stop/Cancel may use single `updateAllocationCampaign` endpoint with `action` field per BRD §10.7 — TCs are UI-driven and tolerant of either routing
- Destructive TCs (`FUNC_024`, `FUNC_026`, `FUNC_042`) MUST run on disposable campaigns created in the same run — never on shared seeded data
