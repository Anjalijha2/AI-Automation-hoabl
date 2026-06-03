# Test Cases — Admin Portal / Sales Managers

**Portal:** Admin
**Module:** Sales Managers
**URL:** `https://uat-web.xrportal.in/admin/sales-managers`
**BRD Source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Sales-Managers.md`
**Visual Memory:** `visual-memory/admin/sales-managers/INDEX.md` (CAPTURE_STATUS: FULL — 4 screens)
**Generated:** 2026-06-03
**Status:** Approved (subject to QA Agent `test-case-reviewer` validation)

---

## Notes on Visual Coverage

- List page, header, table, toggles, search, Edit row action: covered by `sales-managers-loaded.png` and `sales-managers-full.png` (FULL)
- Add SM drawer / Edit SM drawer: NOT captured in this batch — drawer-level form fields carry `[STUB-EVIDENCE]` per INDEX.md note
- Settings (privacy masking) modal/drawer: NOT captured in this batch — TCs carry `[STUB-EVIDENCE]`

**Coverage estimate (page-level):** 4 of 4 captured states referenced (100%). Form drawer + Settings UI are documented gaps flagged for Tech Lead Agent follow-up.

---

## Sheet 1 — Manual Test Cases

| TC_ID | BRD Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|-----------|--------|--------|------|----------|---------------|-------|-----------------|-----------------|-----------|----------|--------|
| TC_SM_UI_001 | BRD §1, §3 | admin | Sales Managers | UI | Sales Managers list page renders with all expected structural elements per BRD purpose (admins manage SM accounts) | Admin logged in; session at `automation-repository/fixtures/.auth/admin.json` | 1. Navigate to `/admin/sales-managers`<br>2. Wait for `h5` "Sales Managers" to render<br>3. Inspect page header and table | Page heading `h5` "Sales Managers" visible; header buttons `Settings` and `Add Sales Manager` (both `button.ant-btn-primary`) visible; search input `input[placeholder="Search by name, email, or phone"]` visible; table renders columns: First Name, Last Name, Email, Phone, Role, Assignable, Is Active, Created At, Actions | `visual-memory/admin/sales-managers/sales-managers-full.png` | n/a | P1 | Approved |
| TC_SM_UI_002 | BRD §1 | admin | Sales Managers | UI | Existing SM list loads with rows and per-row controls (BRD §1 — admins manage existing SM accounts) | Admin logged in; ≥1 SM exists | 1. Navigate to `/admin/sales-managers`<br>2. Wait for table rows to render | At least 1 row rendered; each row shows First Name, Last Name, Email, Phone, Role columns; Assignable column shows `button.ant-switch`; Is Active column shows `button.ant-switch`; Actions column shows `button:has-text("Edit")` with class `ant-btn-text view-action` | `visual-memory/admin/sales-managers/sales-managers-loaded.png` | n/a | P1 | Approved |
| TC_SM_FUNC_001 | BRD §4, §7 | admin | Sales Managers | FUNC | Add Sales Manager drawer opens when admin clicks the Add button (BRD §4 — single-add flow) | Admin logged in | 1. Navigate to `/admin/sales-managers`<br>2. Click `button.ant-btn-primary:has-text("Add Sales Manager")`<br>3. Wait for `.ant-drawer-content` to be visible | An Ant Drawer opens (`.ant-drawer-content` present); drawer title contains "Add Sales Manager"; form fields render: First Name, Last Name, Email, Phone, Role, Assignable toggle, Is Active toggle | `[STUB-EVIDENCE]` — drawer not in INDEX.md screens; ref `visual-memory/admin/sales-managers/sales-managers-full.png` for entry point | n/a | P1 | Approved |
| TC_SM_FUNC_002 | BRD §4, §7 | admin | Sales Managers | FUNC | Admin creates a new SM via the Add drawer with all required fields valid (BRD §7 — Admin Workflow) | Admin logged in; valid unique phone + email available | 1. Navigate to `/admin/sales-managers`<br>2. Click `button.ant-btn-primary:has-text("Add Sales Manager")`<br>3. In `.ant-drawer-content`, fill First Name = "Test", Last Name = "SM01", Email = unique valid email, Phone = unique 10-digit, Role = "Sales Manager"<br>4. Toggle Assignable ON; toggle Is Active ON<br>5. Click drawer Submit button | New SM created; drawer closes; new row appears in table with the entered name/email/phone; both Assignable and Is Active switches show ON; per BRD §6 rule 2 the changes apply immediately | `[STUB-EVIDENCE]` — drawer form not captured | First Name: `Test`; Last Name: `SM01`; Email: `test.sm01.{ts}@uat.example.com`; Phone: `99{8-random-digits}`; Role: `Sales Manager` | P1 | Approved |
| TC_SM_VAL_001 | BRD §7 step 3 | admin | Sales Managers | VAL | Add SM submit blocked when First Name is empty (required-field validation) | Admin logged in; Add SM drawer open | 1. Open Add Sales Manager drawer<br>2. Leave First Name empty; fill Last Name, Email, Phone, Role<br>3. Click Submit | Submit blocked; required-field validation message shown next to First Name; drawer remains open; no new row added to table | `[STUB-EVIDENCE]` — drawer form not captured | First Name: empty; rest valid | P2 | Approved |
| TC_SM_VAL_002 | BRD §7 step 3 | admin | Sales Managers | VAL | Add SM rejects invalid email format | Admin logged in; Add SM drawer open | 1. Open Add Sales Manager drawer<br>2. Fill First Name, Last Name; Email = "not-an-email"<br>3. Fill Phone, Role; click Submit | Submit blocked; email format error shown; drawer remains open; no new row added | `[STUB-EVIDENCE]` — drawer form not captured | Email: `not-an-email` | P2 | Approved |
| TC_SM_VAL_003 | BRD §7 step 3 | admin | Sales Managers | VAL | Add SM rejects phone shorter than 10 digits | Admin logged in; Add SM drawer open | 1. Open Add Sales Manager drawer<br>2. Fill First Name, Last Name, Email, Role<br>3. Phone = "12345"; click Submit | Submit blocked; phone validation error indicating 10-digit requirement; drawer remains open | `[STUB-EVIDENCE]` — drawer form not captured | Phone: `12345` | P2 | Approved |
| TC_SM_VAL_004 | BRD §6 rule 5 | admin | Sales Managers | VAL | Add SM rejects duplicate phone (phone is merge key per BRD §6 rule 5) | Admin logged in; SM with phone `9000000001` exists | 1. Open Add Sales Manager drawer<br>2. Fill all fields with valid data; Phone = `9000000001` (already exists)<br>3. Click Submit | Submit blocked or backend rejects with duplicate-phone error message; no duplicate row created in table | `[STUB-EVIDENCE]` — drawer form not captured | Phone: `9000000001` (pre-existing) | P2 | Approved |
| TC_SM_FUNC_003 | BRD §1 | admin | Sales Managers | FUNC | Edit Sales Manager drawer opens when admin clicks Edit on a row | Admin logged in; ≥1 SM row exists | 1. Navigate to `/admin/sales-managers`<br>2. Click `button:has-text("Edit")` (class `ant-btn-text view-action`) on first row<br>3. Wait for `.ant-drawer-content` to be visible | Ant Drawer opens (`.ant-drawer-content`); drawer title contains "Edit"; form fields pre-populated with the selected SM's First Name, Last Name, Email, Phone, Role | `visual-memory/admin/sales-managers/sales-managers-loaded.png` (Edit button visible) + `[STUB-EVIDENCE]` for drawer content | Use row index 0 | P1 | Approved |
| TC_SM_FUNC_004 | BRD §1, §6 rule 2 | admin | Sales Managers | FUNC | Admin edits SM First Name and saves — change persists immediately | Admin logged in; ≥1 SM row exists | 1. Navigate to `/admin/sales-managers`<br>2. Click Edit on first row<br>3. In `.ant-drawer-content`, update First Name field<br>4. Click Submit | Drawer closes; the edited row now shows the updated First Name; per BRD §6 rule 2 the change applies immediately | `[STUB-EVIDENCE]` — drawer form not captured | First Name: `EditedName_{ts}` | P1 | Approved |
| TC_SM_FUNC_005 | BRD §3 (Assignable) | admin | Sales Managers | FUNC | Toggling Assignable switch in row updates row state and persists | Admin logged in; SM row visible with Assignable = ON | 1. Navigate to `/admin/sales-managers`<br>2. Locate target row; click `button.ant-switch` in Assignable column<br>3. Observe toggle state change<br>4. Reload page | Toggle state changes (ON → OFF); state persists after reload; per BRD §3 the SM is now flagged IS_AVAILABLE = OFF | `visual-memory/admin/sales-managers/sales-managers-loaded.png` (Assignable column visible) | n/a | P1 | Approved |
| TC_SM_INT_001 | BRD §3, §6 rule 3, §9 risk 1 | admin | Sales Managers | INT | **[MANUAL-ONLY]** Setting Assignable = OFF removes SM from customer assignment dropdowns system-wide immediately (destructive side-effect) | Admin logged in. **Prerequisite:** at least one buyer/customer record exists with the assignment dropdown reachable; chosen SM is currently ON and was visible in that dropdown. Note that this TC mutates dropdown state across portals. | 1. Verify chosen SM appears in a customer assignment dropdown (note baseline)<br>2. Navigate to `/admin/sales-managers`<br>3. Toggle Assignable switch OFF for that SM (`button.ant-switch` in Assignable column)<br>4. Without page reload, return to a customer/buyer assignment dropdown and refresh the list<br>5. Confirm SM is no longer in the dropdown<br>6. Per BRD §6 rule 3 — existing customer-SM relationships are NOT auto-reassigned; verify any current assignment to that SM is unchanged on the customer record | SM removed from all customer assignment dropdowns immediately (no admin save / no portal restart); existing customer assignments to that SM remain intact (no auto-reassignment); per BRD §9 risk 1 — manual reassignment is required for ongoing customer relationships | `visual-memory/admin/sales-managers/sales-managers-loaded.png` (Assignable column) — dropdown-removal side-effect carries `[STUB-EVIDENCE]` for the dropdown view | Test SM with no critical active assignments | P1 | Approved |
| TC_SM_FUNC_006 | BRD §3 (Is Active) | admin | Sales Managers | FUNC | Toggling Is Active switch in row updates row state and persists | Admin logged in; SM row visible with Is Active = ON | 1. Navigate to `/admin/sales-managers`<br>2. Locate target row; click `button.ant-switch` in Is Active column<br>3. Observe toggle state change<br>4. Reload page | Toggle state changes (ON → OFF); state persists after reload; per BRD §3 the SM is now flagged IS_ACTIVE = OFF | `visual-memory/admin/sales-managers/sales-managers-loaded.png` (Is Active column visible) | n/a | P1 | Approved |
| TC_SM_INT_002 | BRD §3, §6 rule 2, §6 rule 1 | admin | Sales Managers | INT | **[MANUAL-ONLY]** Setting Is Active = OFF immediately disables SM portal login (destructive side-effect) | Admin logged in. **Prerequisite:** chosen SM has a known mobile + OTP login path on the SM portal; do NOT run on a production-shared SM account. Note this TC blocks the SM from logging in for the duration of the test. Reset Is Active back ON in teardown. | 1. Confirm chosen SM can currently reach OTP screen on SM portal (`https://uat-web.xrportal.in/sales-manager`)<br>2. Navigate to `/admin/sales-managers`<br>3. Toggle Is Active switch OFF for that SM (`button.ant-switch` in Is Active column)<br>4. Without delay, attempt SM login on the SM portal using the SM's mobile + OTP<br>5. Per BRD §6 rule 1 — verify the SM record is NOT deleted (still present in the admin list, just deactivated) | SM login attempt is rejected immediately (no admin save / no portal restart) with appropriate disabled / unauthorized message; SM row remains present in the admin Sales Managers list (BRD §6 rule 1 — no delete, only deactivate) | `visual-memory/admin/sales-managers/sales-managers-loaded.png` (Is Active column) — SM portal login-blocked screen carries `[STUB-EVIDENCE]` | Test SM only | P1 | Approved |
| TC_SM_FUNC_007 | BRD §1 | admin | Sales Managers | FUNC | Search filter narrows table by name | Admin logged in; ≥2 SMs exist with distinguishable first names | 1. Navigate to `/admin/sales-managers`<br>2. Type a known SM first name into `input[placeholder="Search by name, email, or phone"]`<br>3. Wait for table to filter | Only rows where First Name matches the entered query are displayed; non-matching rows hidden | `visual-memory/admin/sales-managers/sales-managers-full.png` (search input visible) | Query: known SM first name | P2 | Approved |
| TC_SM_FUNC_008 | BRD §1 | admin | Sales Managers | FUNC | Search filter narrows table by email substring | Admin logged in; ≥2 SMs with different emails | 1. Navigate to `/admin/sales-managers`<br>2. Type a known SM email substring into search input | Only rows where Email matches the substring are displayed | `visual-memory/admin/sales-managers/sales-managers-full.png` | Query: email substring | P2 | Approved |
| TC_SM_FUNC_009 | BRD §1 | admin | Sales Managers | FUNC | Search filter narrows table by phone | Admin logged in; ≥2 SMs with different phones | 1. Navigate to `/admin/sales-managers`<br>2. Type a known SM phone into search input | Only rows where Phone matches the query are displayed | `visual-memory/admin/sales-managers/sales-managers-full.png` | Query: known phone | P2 | Approved |
| TC_SM_NEG_001 | BRD §1 | admin | Sales Managers | NEG | Search with no match shows empty result | Admin logged in | 1. Navigate to `/admin/sales-managers`<br>2. Type `zzz-nonexistent-{ts}` into search input | Table displays empty / no-results state (no rows rendered) | `visual-memory/admin/sales-managers/sales-managers-full.png` (search input baseline) | Query: `zzz-nonexistent-{ts}` | P3 | Approved |
| TC_SM_FUNC_010 | BRD §5 | admin | Sales Managers | FUNC | Settings button opens privacy masking configuration (BRD §5 — system-wide masking) | Admin logged in | 1. Navigate to `/admin/sales-managers`<br>2. Click `button.ant-btn-primary:has-text("Settings")`<br>3. Wait for modal or drawer to be visible | Privacy masking UI opens; controls visible for Email Masking, Phone Masking, Cost Masking (per BRD §5) | `[STUB-EVIDENCE]` — Settings UI not captured in INDEX.md; entry button visible in `visual-memory/admin/sales-managers/sales-managers-full.png` | n/a | P1 | Approved |
| TC_SM_BIZ_001 | BRD §5, §6 rule 4 | admin | Sales Managers | BIZ | **[MANUAL-ONLY]** Toggling Email Masking applies system-wide to all SMs (no per-SM granularity per BRD §6 rule 4) | Admin logged in. **Prerequisite:** at least one SM can be logged in to verify the masking effect on a customer record. This TC affects every SM simultaneously. Reset to original masking state in teardown. | 1. Note current Email Masking state in Settings<br>2. Open Settings UI; toggle Email Masking ON (or OFF); save<br>3. Have a Sales Manager open a customer record on the SM portal<br>4. Verify customer email is hidden (or revealed) on the SM view<br>5. Confirm change applies to every SM, not just one | Email Masking state changes system-wide; every SM sees the same masked / unmasked state on customer records; no per-SM override available (BRD §6 rule 4) | `[STUB-EVIDENCE]` — Settings UI + SM portal customer view not captured | Toggle Email Masking ON/OFF | P1 | Approved |
| TC_SM_BIZ_002 | BRD §5, §9 risk 2 | admin | Sales Managers | BIZ | **[MANUAL-ONLY]** Toggling Cost Masking OFF immediately reveals unit pricing to all SMs (BRD §9 risk 2 — confirm before changing in live env) | Admin logged in. **Prerequisite:** must be UAT only; verify confirmation step / save mechanism before applying. Reset to original state in teardown. | 1. Note current Cost Masking state<br>2. Open Settings; toggle Cost Masking; save<br>3. Have a Sales Manager open a unit/inventory view on the SM portal<br>4. Verify unit pricing is hidden / revealed accordingly | Cost Masking change applies immediately and system-wide; SM view of unit prices reflects the new masking state | `[STUB-EVIDENCE]` — Settings UI + SM unit view not captured | Toggle Cost Masking ON/OFF | P1 | Approved |
| TC_SM_BIZ_003 | BRD §6 rule 1 | admin | Sales Managers | BIZ | No delete control is present — SMs can only be deactivated (BRD §6 rule 1) | Admin logged in; ≥1 SM row exists | 1. Navigate to `/admin/sales-managers`<br>2. Inspect every row's Actions column<br>3. Inspect Edit drawer for any Delete button | No Delete control rendered on any row or in the Edit drawer; only Edit action and Is Active / Assignable toggles control SM lifecycle | `visual-memory/admin/sales-managers/sales-managers-loaded.png` (Actions column shows only Edit) | n/a | P2 | Approved |
| TC_SM_EDGE_001 | BRD §6 rule 2 | admin | Sales Managers | EDGE | Rapid double-toggle of Is Active settles on final state and persists | Admin logged in; target SM row visible | 1. Navigate to `/admin/sales-managers`<br>2. Click Is Active `button.ant-switch` twice in quick succession on target row<br>3. Wait briefly; reload page | Toggle settles on a single, stable state (no flicker); reloaded state matches the last-clicked target state; no row duplication or error toast | `visual-memory/admin/sales-managers/sales-managers-loaded.png` | Target SM | P3 | Approved |

---

## Sheet 2 — Automation Candidates

Only TCs with FULL visual evidence at the page/table level are recommended for first-wave automation. TCs marked `[STUB-EVIDENCE]` are tracked but blocked from automation until evidence is upgraded. `[MANUAL-ONLY]` destructive side-effect TCs are excluded from automation by design.

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence Status | Notes |
|-------|--------|------|-------------|------------|------------------|-----------------------|-------|
| TC_SM_UI_001 | Sales Managers | UI | Yes | Low | ui-ux | FULL | Pure layout assertion against `sales-managers-full.png` |
| TC_SM_UI_002 | Sales Managers | UI | Yes | Low | ui-ux | FULL | Row-control assertion against `sales-managers-loaded.png` |
| TC_SM_FUNC_001 | Sales Managers | FUNC | Yes | Low | e2e | STUB (drawer) | Asserts drawer opens; drawer field set carries STUB — refine after Tech Lead Agent captures drawer |
| TC_SM_FUNC_002 | Sales Managers | FUNC | Partial | Medium | e2e | STUB (drawer) | Implementable when drawer captured; needs cleanup of created SM |
| TC_SM_VAL_001 | Sales Managers | VAL | Partial | Low | e2e | STUB (drawer) | Implementable when drawer captured |
| TC_SM_VAL_002 | Sales Managers | VAL | Partial | Low | e2e | STUB (drawer) | Implementable when drawer captured |
| TC_SM_VAL_003 | Sales Managers | VAL | Partial | Low | e2e | STUB (drawer) | Implementable when drawer captured |
| TC_SM_VAL_004 | Sales Managers | VAL | Partial | Medium | e2e | STUB (drawer) | Needs a pre-seeded duplicate phone fixture |
| TC_SM_FUNC_003 | Sales Managers | FUNC | Yes | Low | e2e | FULL (button) + STUB (drawer) | Edit button assertion is FULL; drawer content carries STUB |
| TC_SM_FUNC_004 | Sales Managers | FUNC | Partial | Medium | e2e | STUB (drawer) | Implementable when drawer captured |
| TC_SM_FUNC_005 | Sales Managers | FUNC | Yes | Low | e2e | FULL | Toggle + reload assertion is non-destructive at row level |
| TC_SM_INT_001 | Sales Managers | INT | **No (MANUAL-ONLY)** | High | n/a | FULL + STUB | Destructive system-wide side-effect — manual only per task spec |
| TC_SM_FUNC_006 | Sales Managers | FUNC | Yes | Low | e2e | FULL | Toggle + reload assertion |
| TC_SM_INT_002 | Sales Managers | INT | **No (MANUAL-ONLY)** | High | n/a | FULL + STUB | Destructive login-disable side-effect — manual only per task spec |
| TC_SM_FUNC_007 | Sales Managers | FUNC | Yes | Low | e2e | FULL | Search by name |
| TC_SM_FUNC_008 | Sales Managers | FUNC | Yes | Low | e2e | FULL | Search by email |
| TC_SM_FUNC_009 | Sales Managers | FUNC | Yes | Low | e2e | FULL | Search by phone |
| TC_SM_NEG_001 | Sales Managers | NEG | Yes | Low | e2e | FULL | Empty result on unmatched search |
| TC_SM_FUNC_010 | Sales Managers | FUNC | Partial | Low | e2e | STUB (Settings UI) | Implementable when Settings UI captured |
| TC_SM_BIZ_001 | Sales Managers | BIZ | **No (MANUAL-ONLY)** | High | n/a | STUB | System-wide masking change — manual only |
| TC_SM_BIZ_002 | Sales Managers | BIZ | **No (MANUAL-ONLY)** | High | n/a | STUB | System-wide pricing reveal — manual only |
| TC_SM_BIZ_003 | Sales Managers | BIZ | Yes | Low | regression | FULL | Asserts absence of Delete control |
| TC_SM_EDGE_001 | Sales Managers | EDGE | Yes | Medium | regression | FULL | Race-condition assertion on toggle |

---

## Sheet 3 — Bug Report Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_NNN | TC_SM_*_NNN | Critical / High / Medium / Low | Repro steps | What actually happened | What should have happened | UAT — `https://uat-web.xrportal.in/admin/sales-managers` | Open / In Progress / Fixed / Closed |

---

## Traceability — BRD ↔ TC

| BRD Section | TCs |
|-------------|-----|
| §1 Purpose | TC_SM_UI_001, TC_SM_UI_002, TC_SM_FUNC_003, TC_SM_FUNC_004, TC_SM_FUNC_007, TC_SM_FUNC_008, TC_SM_FUNC_009, TC_SM_NEG_001 |
| §3 SM Account Flags — Assignable | TC_SM_FUNC_005, TC_SM_INT_001 |
| §3 SM Account Flags — Is Active | TC_SM_FUNC_006, TC_SM_INT_002 |
| §4 Two ways to create — single add | TC_SM_FUNC_001, TC_SM_FUNC_002 |
| §5 Privacy Masking Settings | TC_SM_FUNC_010, TC_SM_BIZ_001, TC_SM_BIZ_002 |
| §6 rule 1 No delete | TC_SM_BIZ_003, TC_SM_INT_002 |
| §6 rule 2 Immediate effect | TC_SM_FUNC_004, TC_SM_INT_001, TC_SM_INT_002, TC_SM_EDGE_001 |
| §6 rule 3 Assignable OFF impact | TC_SM_INT_001 |
| §6 rule 4 Masking system-wide | TC_SM_BIZ_001 |
| §6 rule 5 Phone is merge key | TC_SM_VAL_004 |
| §7 Admin workflow add SM (validation) | TC_SM_VAL_001, TC_SM_VAL_002, TC_SM_VAL_003 |
| §9 risk 1 Assignable OFF | TC_SM_INT_001 |
| §9 risk 2 Cost Masking | TC_SM_BIZ_002 |

**BRD §8 (Bulk SM Upload):** Out of scope for this module — owned by `admin/config` (CMS Section 7). No TCs here. To be covered in `admin/config` test cases.

---

## Out-of-Scope (Excluded)

- LeadSquared (LSQ): excluded per project constraints
- Strapi: excluded per project constraints
- BRD §8 Bulk SM upload: belongs to `admin/config` module — covered separately
