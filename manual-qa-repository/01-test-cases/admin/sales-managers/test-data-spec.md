# Test Data Spec — Sales Managers — Admin Portal

**Module:** Sales Managers
**Portal:** Admin
**BRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Sales-Managers.md`
**Visual Memory:** `visual-memory/admin/sales-managers/INDEX.md`

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| First Name | Any non-empty string, ≤ 50 chars (assumed limit) | Required per BRD §7 step 3 |
| Last Name | Any non-empty string, ≤ 50 chars (assumed limit) | Required per BRD §7 step 3 |
| Email | RFC-compliant format, unique across SM records | Required per BRD §7 step 3; uniqueness inferred from operational use |
| Phone | Exactly 10 digits, unique across SM records | Required per BRD §7 step 3; phone is the merge key per BRD §6 rule 5 |
| Role | `Sales Manager` (default per BRD §7 step 3) | Other role options TBD — confirm with Tech Lead Agent when drawer captured |
| Assignable (IS_AVAILABLE) | `ON` or `OFF` (`button.ant-switch`) | BRD §3 — controls dropdown appearance system-wide |
| Is Active (IS_ACTIVE) | `ON` or `OFF` (`button.ant-switch`) | BRD §3 — controls SM portal login |

### Privacy Masking (Settings)

| Toggle | Valid Values | Effect |
|--------|-------------|--------|
| Email Masking | ON / OFF | System-wide — hides customer email from all SMs (BRD §5) |
| Phone Masking | ON / OFF | System-wide — hides customer phone from all SMs (BRD §5) |
| Cost Masking | ON / OFF | System-wide — hides unit pricing from all SMs (BRD §5, §9 risk 2) |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error |
|-------|--------------|---------------|
| First Name | Empty / whitespace-only | Required-field validation; submit blocked |
| Last Name | Empty / whitespace-only | Required-field validation; submit blocked |
| Email | `not-an-email`, missing `@`, missing TLD | Email format validation; submit blocked |
| Email | Empty | Required-field validation; submit blocked |
| Email | Duplicate of existing SM email | Backend duplicate-email error (validation behaviour to confirm — may be allowed if phone differs; treat as soft expectation pending drawer capture) |
| Phone | `12345` (5 digits) | Phone length validation — must be 10 digits |
| Phone | `abcdefghij` | Phone numeric validation |
| Phone | Empty | Required-field validation |
| Phone | Duplicate of existing SM (e.g. `9000000001` if seeded) | BRD §6 rule 5 — phone is merge key; via Add drawer treat as duplicate-blocked (note: bulk upload path would *update*, not error) |
| Search | `zzz-nonexistent-{ts}` | Empty result state (no rows) |

### Boundary / Edge

| Field | Boundary | Expected |
|-------|----------|----------|
| Phone | Leading zeros (`0123456789`) | Confirm acceptance behaviour — likely rejected if validation enforces non-zero leading |
| First Name | Single character `A` | Accepted (no minimum length documented in BRD) |
| First Name | 100+ chars | Likely truncated or rejected — confirm against drawer once captured |
| Search input | Single character | Filter applied; possibly broad match |
| Search input | Empty after typing | All rows restored |
| Toggle | Rapid double-click | Settles on final state per TC_SM_EDGE_001 |

---

## Pre-conditions

### Auth
- Admin session at `automation-repository/fixtures/.auth/admin.json`
- Run `npm run auth:setup` if session expired or missing

### Data
- **Add SM (TC_SM_FUNC_002):** No SM exists with the test phone / email about to be created
- **Edit SM (TC_SM_FUNC_003, FUNC_004):** ≥ 1 SM row already exists in the list
- **Duplicate phone (TC_SM_VAL_004):** SM record with known phone `9000000001` (or designated fixture phone) must pre-exist
- **Toggle persistence (TC_SM_FUNC_005, FUNC_006, EDGE_001):** Test SM must exist; do NOT use a real customer-facing SM
- **Assignable side-effect (TC_SM_INT_001):** Test SM with known assignment-dropdown visibility; at least one customer record reachable for verification
- **Is Active side-effect (TC_SM_INT_002):** Test SM with a known mobile + OTP path on the SM portal (mobile `8888888888` / OTP `258369` for UAT-shared fixtures only)
- **Privacy masking (TC_SM_BIZ_001, BIZ_002):** Cooperating Sales Manager session needed to verify masking effect on a customer record
- **Search by name / email / phone (TC_SM_FUNC_007, FUNC_008, FUNC_009):** ≥ 2 SMs with distinguishable first names / emails / phones must exist

### Environment
- UAT only — `https://uat-web.xrportal.in/admin/sales-managers`
- Browser viewport ≥ 1920×900 to match visual-memory captures
- ENV variable not required for these TCs (no live-gateway gating)

---

## Cleanup / Teardown

| Trigger | Cleanup Action |
|---------|---------------|
| TC_SM_FUNC_002 (Add SM) | Mark the created test SM as Is Active = OFF and Assignable = OFF after run (BRD §6 rule 1 — no delete available). Note: SM record remains in system permanently. |
| TC_SM_FUNC_004 (Edit name) | Revert First Name back to original value via Edit drawer |
| TC_SM_FUNC_005 (Assignable toggle) | Restore Assignable to its original state for the test SM |
| TC_SM_FUNC_006 (Is Active toggle) | Restore Is Active to its original state for the test SM |
| TC_SM_INT_001 (Assignable side-effect) | **Critical:** Toggle Assignable back ON for the affected SM; verify SM reappears in dropdowns; document any customer relationships that may need review |
| TC_SM_INT_002 (Is Active side-effect) | **Critical:** Toggle Is Active back ON for the affected SM; verify SM can log in again on SM portal |
| TC_SM_BIZ_001 / BIZ_002 (Masking) | **Critical:** Restore Email Masking and Cost Masking to their original system-wide state before run; verify with a cooperating SM session |
| TC_SM_EDGE_001 (Rapid double-toggle) | Restore Is Active to original state |

### Reusable Test SM Fixtures (recommended)

To minimise side-effect blast radius, maintain dedicated UAT test SMs:

| Fixture SM | Purpose | Constraint |
|-----------|---------|-----------|
| `test_sm_safe_toggle` | TC_SM_FUNC_005 / FUNC_006 / EDGE_001 | Never assigned to real customers |
| `test_sm_assignable_side_effect` | TC_SM_INT_001 | Never assigned to real customers; OK to drop from dropdowns |
| `test_sm_login_side_effect` | TC_SM_INT_002 | Known OTP; safe to disable login briefly |
| `test_sm_duplicate_phone` | TC_SM_VAL_004 | Phone `9000000001` reserved as duplicate target |

---

## Out-of-Scope Data

- LeadSquared sync payloads — excluded per project constraints
- Strapi-driven content — excluded per project constraints
- Bulk SM upload XLSX (BRD §8) — covered under `admin/config` module test data
