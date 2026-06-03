# Test Data Spec — JBP Management — Admin Portal

**Module:** JBP Management
**Portal:** Admin
**URL:** `https://uat-web.xrportal.in/admin/jbp-management`
**BRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-JBP-Management.md`
**Visual source:** `visual-memory/admin/jbp/INDEX.md`
**Generated:** 2026-06-03

---

## 1. Pre-conditions

### Auth
- Admin session: `automation-repository/fixtures/.auth/admin.json`
- Login flow: mobile OTP — Mobile `8888888888` / OTP `258369` (static UAT)
- Run `npm run auth:setup` if session file expired or missing

### Environment State
- UAT environment with JBP Management endpoint reachable
- At least 1 CLOSED cycle in the cycles table (for TC_JBP_BIZ_013, TC_JBP_UI_005)
- At least 1 submission row in Submissions tab (for TC_JBP_UI_014, TC_JBP_FUNC_016, TC_JBP_BIZ_018)
- At least 1 edit request row in Edit Requests tab (for TC_JBP_UI_019, TC_JBP_UI_020, TC_JBP_FUNC_021, TC_JBP_BIZ_022)

### Conditional state
| TC | State required |
|----|----------------|
| TC_JBP_E2E_008 | **NO** OPEN cycle exists in cycles table |
| TC_JBP_NEG_011 | **EXACTLY ONE** OPEN cycle exists in cycles table |
| TC_JBP_BIZ_023 | One Pending edit request exists for a CP+Cycle that has a submission |

---

## 2. Valid Inputs — Create Cycle Modal

| Field | Selector | Valid Values | Notes |
|-------|----------|--------------|-------|
| Cycle Name | `input[placeholder="e.g., September 2026"]` | Free text, ≥ 3 chars, recommend `JBP_AUTO_<timestamp>` or `<MonthName> <Year>` | Per BRD §8 step 3 |
| Start Date | `input[placeholder="Select Start Date"]` | Any date ≥ today | Date picker — pick from calendar UI |
| End Date | `input[placeholder="Select End Date"]` | Any date > Start Date | Date picker — pick from calendar UI |

### Recommended automation test data
```js
const cycleName = `JBP_AUTO_${Date.now()}`;
const startDate = '2026-06-10'; // today+7
const endDate   = '2026-07-10'; // today+37
```

---

## 3. Invalid / Boundary Inputs — Create Cycle Modal

| Field | Invalid Value | Expected Error | Linked TC |
|-------|---------------|----------------|-----------|
| Cycle Name | `""` (empty) | Submit blocked OR field validation error | TC_JBP_VAL_009 |
| Start Date | `""` (empty) | Submit blocked OR field validation error | TC_JBP_VAL_010 |
| End Date | `""` (empty) | Submit blocked OR field validation error | TC_JBP_VAL_010 |
| (state) | Creating cycle while OPEN cycle exists | "Active Cycle Detected" popup per BRD §7.1 | TC_JBP_NEG_011 |

### Untested boundary candidates (out of current scope — flag for future)
| Field | Boundary | Note |
|-------|----------|------|
| Cycle Name | Maximum length | BRD does not specify — recommend BA flag for product clarification |
| Start Date | Past date | BRD §4 implies future-only (lifecycle starts on creation) — not explicitly stated |
| Start vs End | End ≤ Start | Logical constraint not explicitly in BRD — recommend BA flag |
| Cycle Name | Duplicate name with existing OPEN/CLOSED cycle | BRD §7 does not address uniqueness — recommend BA flag |

---

## 4. Date Filter Inputs (Cycle Management tab)

| Field | Selector | Valid Values |
|-------|----------|--------------|
| Filter Start | `input[placeholder="Start Date"]` | Any valid date |
| Filter End | `input[placeholder="End Date"]` | Any valid date ≥ Filter Start |

---

## 5. Cleanup / Teardown

### TC_JBP_E2E_008 (mutates state — creates a cycle)
- **Manual:** After execution, the created cycle persists as OPEN. If subsequent tests assume no OPEN cycle, the created cycle must be closed via UI (Close Cycle action) or via direct DB cleanup.
- **Automation:** Wrap in `test.afterEach` that captures the created cycle name and closes it via UI OR gate the test with `test.skip(process.env.ENV === 'uat', 'Mutates UAT cycle state')`.
- **DB cleanup (optional):** If a `db/queries/jbp.js` query is added, delete the cycle row by name pattern `JBP_AUTO_%`.

### TC_JBP_FUNC_007 (safe — closes modal without submitting)
- No teardown required. Modal closes without persisting any data.

### All other TCs
- Read-only — no teardown required.

---

## 6. Out of Scope

- **CP Portal submission journey** — covered separately under CP Portal BRD section (this TC batch only covers admin-side review of submissions, not the CP form fill at `https://uat.xrportal.in/jbp`)
- **View detail modal/page content for submissions and edit requests** — clicking View opens detail; the detail panel was not captured in the 8 screens. Recommend Tech Lead Agent re-capture for next TC batch.
- **Close Cycle action button behaviour** — no OPEN cycle existed in UAT at capture time; full Close-Cycle journey (incl. irreversibility per BRD §7.2) deferred to next batch
- **"Active Cycle Detected" popup verification** — popup not visually captured; TC_JBP_NEG_011 flagged as `[NO-VISUAL-EVIDENCE]`
- **CP notification of edit request decision** (BRD §6 step 4) — admin-side test surface ends at the decision; CP notification verification belongs in CP Portal BRD
- **LeadSquared and Strapi** — excluded per project constraints

---

## 7. Visual Evidence Index

| Screenshot | Used By |
|-----------|---------|
| `visual-memory/admin/jbp/screenshot-desktop.png` | (baseline — pre-INDEX stub) |
| `visual-memory/admin/jbp/screenshot-ui.png` | (baseline — pre-INDEX stub) |
| `visual-memory/admin/jbp/jbp-loaded.png` | TC_JBP_UI_001, TC_JBP_UI_002, TC_JBP_UI_005, TC_JBP_BIZ_013 |
| `visual-memory/admin/jbp/jbp-tab-cycle-management.png` | TC_JBP_UI_002, TC_JBP_UI_005, TC_JBP_E2E_008, TC_JBP_FUNC_012, TC_JBP_BIZ_013 |
| `visual-memory/admin/jbp/jbp-tab-submissions.png` | TC_JBP_FUNC_003, TC_JBP_UI_014, TC_JBP_UI_015, TC_JBP_FUNC_016, TC_JBP_FUNC_017, TC_JBP_BIZ_018, TC_JBP_BIZ_023 |
| `visual-memory/admin/jbp/jbp-tab-edit-requests.png` | TC_JBP_FUNC_004, TC_JBP_UI_019, TC_JBP_UI_020, TC_JBP_FUNC_021, TC_JBP_BIZ_022, TC_JBP_BIZ_023 |
| `visual-memory/admin/jbp/jbp-create-cycle-modal.png` | TC_JBP_FUNC_006, TC_JBP_FUNC_007, TC_JBP_E2E_008, TC_JBP_VAL_009, TC_JBP_VAL_010 |
| `visual-memory/admin/jbp/jbp-full.png` | TC_JBP_UI_001 |
