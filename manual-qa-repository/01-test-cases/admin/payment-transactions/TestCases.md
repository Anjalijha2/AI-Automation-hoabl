# Test Cases — Admin Portal / Payment Transactions

**Portal:** Admin
**Module:** Payment Transactions
**URL:** `https://uat-web.xrportal.in/admin/payment-transactions`
**Visual Memory:** `visual-memory/admin/payment-transactions/INDEX.md` (CAPTURE_STATUS: FULL — 6 screens)
**BRD:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Payment-Transactions.md`
**Generated:** 2026-06-03
**Status:** Pending Review

---

## Header

- Dual-source gate: PASSED (FULL visual evidence + BRD complete)
- Visual coverage target: ≥ 80%
- Total TCs: 24 (Sheet 1) — 17 automation candidates (Sheet 2)
- Read-only module enforcement: 3 dedicated TCs assert absence of create/edit/delete on main list

---

## Sheet 1 — Manual Test Cases

| TC_ID | BRD/FRD Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|----------------|--------|--------|------|----------|---------------|-------|-----------------|-----------------|-----------|----------|--------|
| TC_PAYTX_UI_001 | BRD-PAYTX-§1 | admin | Payment Transactions | UI | Page header renders with title and dynamic total count — finance team must see read-only ledger landing state | Admin authenticated; `admin.json` session active | 1. Navigate to `/admin/payment-transactions` 2. Wait for table load (networkidle) 3. Read `h5` heading text 4. Read total count label | Heading `h5` shows "Transactions"; subtitle shows "Total 10302 Payment Transactions" (or current count); both visible in viewport | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | n/a | P1 | Pending |
| TC_PAYTX_UI_002 | BRD-PAYTX-§7 | admin | Payment Transactions | UI | Filter bar exposes Start Date, End Date, and Search inputs required for reconciliation workflow | Admin on `/admin/payment-transactions` | 1. Verify `input[placeholder="Start Date"]` exists 2. Verify `input[placeholder="End Date"]` exists 3. Verify `input[placeholder="Search by Name, Phone, Registration No."]` exists | All three filter inputs render in filter bar, are enabled, and accept focus | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | n/a | P1 | Pending |
| TC_PAYTX_UI_003 | BRD-PAYTX-§7, §8 | admin | Payment Transactions | UI | Header action buttons (Refresh, Export, Settings) render for admin user — required for reconciliation and gateway config | Admin on `/admin/payment-transactions` | 1. Verify `button:has-text("Refresh")` exists 2. Verify `button:has-text("Export")` exists 3. Verify `button.ant-btn-primary:has-text("Settings")` exists | All three buttons render in header strip; Settings is primary-styled, Refresh and Export are default-styled | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | n/a | P1 | Pending |
| TC_PAYTX_UI_004 | BRD-PAYTX-§3, §4, §5 | admin | Payment Transactions | UI | Transaction table renders all 14 documented columns required for audit and reconciliation | Admin on `/admin/payment-transactions`; ≥ 1 transaction exists | 1. Inspect table header row 2. Verify columns in order: Sr. No., Registration No., Transaction ID, Source, Status, Unit Reg No., Customer Name, Phone, Payment Type, Amount Paid, Payment Date, Method, Created By, Actions | All 14 column headers render in documented order | `visual-memory/admin/payment-transactions/payment-transactions-full.png` | n/a | P1 | Pending |
| TC_PAYTX_FUNC_005 | BRD-PAYTX-§7 step 4 | admin | Payment Transactions | FUNC | Export button triggers CSV download — required for offline reconciliation | Admin on `/admin/payment-transactions`; transactions loaded | 1. Click `button:has-text("Export")` 2. Wait for browser download event 3. Capture downloaded filename | A CSV file download is triggered (download event fires); file is non-empty | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | n/a | P1 | Pending |
| TC_PAYTX_FUNC_006 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | FUNC | Date range filter — both Start Date and End Date populated returns filtered set | Admin on `/admin/payment-transactions` | 1. Click `input[placeholder="Start Date"]` 2. Enter `01/05/2026` 3. Click `input[placeholder="End Date"]` 4. Enter `31/05/2026` 5. Trigger filter apply (blur/Enter or auto-apply) 6. Observe total count change | Table refreshes; row count reflects only transactions whose Payment Date falls in `01/05/2026 – 31/05/2026`; total count label updates | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Start: `01/05/2026`, End: `31/05/2026` | P1 | Pending |
| TC_PAYTX_FUNC_007 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | FUNC | Name search filter — entering a known customer name narrows results | Admin on `/admin/payment-transactions`; known customer name available | 1. Click `input[placeholder="Search by Name, Phone, Registration No."]` 2. Type valid customer name 3. Wait for debounce/auto-apply | Table shows only rows whose Customer Name column matches the typed value; total count drops accordingly | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Search: known customer name from UAT seed | P1 | Pending |
| TC_PAYTX_FUNC_008 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | FUNC | Phone search filter — entering valid mobile number narrows results | Admin on `/admin/payment-transactions` | 1. Focus `input[placeholder="Search by Name, Phone, Registration No."]` 2. Type valid 10-digit phone | Table shows only rows whose Phone column matches | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Search: `8888888888` | P2 | Pending |
| TC_PAYTX_FUNC_009 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | FUNC | Registration number search filter narrows results | Admin on `/admin/payment-transactions` | 1. Focus search input 2. Type valid registration number | Table shows only rows whose Registration No. column matches | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Search: known reg no. | P2 | Pending |
| TC_PAYTX_FUNC_010 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | FUNC | Combined filter — date range + search applied simultaneously yields intersection | Admin on `/admin/payment-transactions` | 1. Apply Start Date `01/05/2026`, End Date `31/05/2026` 2. Type customer name in search input 3. Wait for results | Table shows only rows matching BOTH the date range AND the name search; count reflects intersection | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Date: `01/05/2026–31/05/2026`; Name: known customer | P1 | Pending |
| TC_PAYTX_FUNC_011 | BRD-PAYTX-§7 step 3 | admin | Payment Transactions | FUNC | Refresh button reloads transaction list with current filters preserved | Admin on `/admin/payment-transactions`; filter applied | 1. Apply a date range filter 2. Click `button:has-text("Refresh")` 3. Wait for table reload | Table reloads; date range filter remains applied; count consistent with applied filter | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | n/a | P2 | Pending |
| TC_PAYTX_BIZ_012 | BRD-PAYTX-§2, §6 rule 5 | admin | Payment Transactions | BIZ | Read-only enforcement on main list — no Create / Add / New buttons exist on header strip | Admin on `/admin/payment-transactions` | 1. Inspect header strip 2. Assert ZERO buttons with text matching `/^(Create|Add|New|\+)/i` (other than Refresh / Export / Settings) | No Create/Add/New buttons present; only Refresh, Export, Settings are exposed | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | n/a | P1 | Pending |
| TC_PAYTX_BIZ_013 | BRD-PAYTX-§2 | admin | Payment Transactions | BIZ | Read-only enforcement on rows — no Edit / Delete buttons exist on any transaction row | Admin on `/admin/payment-transactions`; ≥ 1 row visible | 1. Inspect Actions column of any visible row 2. Assert NO buttons/icons with text or aria-label matching `Edit`, `Delete`, `Remove`, `Cancel` | Actions column contains only view-style affordance (eye icon — see BRD §9); no Edit/Delete present | `visual-memory/admin/payment-transactions/payment-transactions-full.png` | n/a | P1 | Pending |
| TC_PAYTX_BIZ_014 | BRD-PAYTX-§9 note | admin | Payment Transactions | BIZ | Detail view (eye icon) is documented as NOT YET IMPLEMENTED — clicking shows "Detail view coming soon" | Admin on `/admin/payment-transactions`; ≥ 1 row visible | 1. Click eye icon in Actions column of any row 2. Observe response | A "Detail view coming soon" message/placeholder is shown; no row-level edit/detail screen opens (per BRD §9 known limitation) | `visual-memory/admin/payment-transactions/payment-transactions-full.png` | n/a | P3 | Pending |
| TC_PAYTX_FUNC_015 | BRD-PAYTX-§1, §8 step 1 | admin | Payment Transactions | FUNC | Settings button toggles gateway settings panel inline — URL must not change | Admin on `/admin/payment-transactions` | 1. Capture current URL 2. Click `button.ant-btn-primary:has-text("Settings")` 3. Wait for panel render 4. Read URL | URL remains `/admin/payment-transactions` (no navigation); gateway settings panel renders inline showing per-tower rows with View Tower buttons and Active/Inactive toggles | `visual-memory/admin/payment-transactions/payment-gateway-settings.png` | n/a | P1 | Pending |
| TC_PAYTX_UI_016 | BRD-PAYTX-§8 | admin | Payment Transactions | UI | Gateway Settings panel exposes per-tower rows with View Tower button + Active toggle + Update button | Admin on `/admin/payment-transactions`; Settings panel open | 1. Verify ≥ 1 `button:has-text("View Tower")` exists 2. Verify ≥ 1 `button.ant-switch` exists (Active/Inactive toggle) 3. Verify `button:has-text("Update")` exists | All three element types render in the panel | `visual-memory/admin/payment-transactions/payment-gateway-settings.png` | n/a | P1 | Pending |
| TC_PAYTX_FUNC_017 | BRD-PAYTX-§8 steps 2–3 | admin | Payment Transactions | FUNC | Gateway toggle Active → Inactive flips the switch visual state | Admin on `/admin/payment-transactions`; Settings panel open; chosen tower toggle is currently Active (`button.ant-switch.ant-switch-checked`) | 1. Identify a tower row whose toggle has class `ant-switch-checked` 2. Click that `button.ant-switch` 3. Observe state | Toggle class `ant-switch-checked` is removed; switch renders in Inactive position; Update button remains visible | `visual-memory/admin/payment-transactions/payment-settings-page.png` | Target tower: any Active tower from UAT seed | P1 | Pending |
| TC_PAYTX_FUNC_018 | BRD-PAYTX-§8 step 4, §6 rule 4 | admin | Payment Transactions | FUNC | Update button persists gateway settings change immediately without confirmation dialog | Admin in Settings panel; toggle flipped per TC_PAYTX_FUNC_017 | 1. After toggle flip, click `button:has-text("Update")` 2. Watch for any confirmation modal 3. Reload page 4. Re-open Settings panel | NO confirmation dialog appears (per BRD §6 rule 4); update is saved; on reload + re-open, the toggle persists in its new state | `visual-memory/admin/payment-transactions/payment-settings-page.png` | n/a | P1 | Pending |
| TC_PAYTX_NEG_019 | BRD-PAYTX-§6 rule 3 | admin | Payment Transactions | NEG | At-least-one-gateway rule — system must prevent disabling both Easebuzz AND Razorpay simultaneously | Admin in Settings panel; both gateway toggles currently Active for at least one tower | 1. Disable Easebuzz toggle for the test tower 2. Disable Razorpay toggle for the same tower 3. Click `button:has-text("Update")` | Update is blocked OR an error/warning is shown; system does not allow both gateways to be disabled simultaneously (BRD §6 rule 3) | `visual-memory/admin/payment-transactions/payment-gateway-settings.png` | Tower with both gateways currently Active | P1 | Pending |
| TC_PAYTX_XMOD_020 | BRD-PAYTX-§8 | admin | Payment Transactions | XMOD | View Tower button on a gateway settings row navigates to the Towers module for that tower | Admin in Settings panel | 1. Click any `button:has-text("View Tower")` 2. Wait for URL change | URL changes to a Towers module route for the corresponding tower (e.g. `/admin/towers/...`); tower detail loads | `visual-memory/admin/payment-transactions/payment-gateway-settings.png` | n/a | P2 | Pending |
| TC_PAYTX_NEG_021 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | NEG | Date range filter — End Date earlier than Start Date is rejected or yields zero results gracefully | Admin on `/admin/payment-transactions` | 1. Enter Start Date `31/05/2026` 2. Enter End Date `01/05/2026` 3. Wait for filter apply | Either the End Date input rejects the value (validation), OR table renders zero rows with no error/crash; no console errors | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Start: `31/05/2026`, End: `01/05/2026` | P2 | Pending |
| TC_PAYTX_EDGE_022 | BRD-PAYTX-§7 step 2 | admin | Payment Transactions | EDGE | Search filter with no matching results renders empty state cleanly | Admin on `/admin/payment-transactions` | 1. Focus search input 2. Type random non-existent string e.g. `ZZZ_NO_MATCH_12345` | Table renders empty / "No data" state; count label reflects zero matches; no crash; filter clears restore full list | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png` | Search: `ZZZ_NO_MATCH_12345` | P2 | Pending |
| TC_PAYTX_BIZ_023 | BRD-PAYTX-§3, §4, §5 | admin | Payment Transactions | BIZ | Documented enums render — Payment Type, Source, Status values match BRD | Admin on `/admin/payment-transactions`; ≥ 10 rows visible | 1. Inspect Payment Type column values across visible rows 2. Inspect Source column values 3. Inspect Status column values | Payment Type values are subset of {Allocation, Milestone, Registration, Offline}; Source values are subset of {Easebuzz, Razorpay, Offline}; Status values are subset of {initiated, pending, completed, failed, cancelled, dropped, bounced, refunded} | `visual-memory/admin/payment-transactions/payment-transactions-full.png` | n/a | P1 | Pending |
| TC_PAYTX_REG_024 | BRD-PAYTX-§1, §7 | admin | Payment Transactions | REG | Smoke regression — landing page, filter bar, table, header buttons, and Settings toggle all functional in one pass | Admin authenticated | 1. Navigate `/admin/payment-transactions` 2. Confirm heading, count, filter bar, table 3. Type in search, clear search 4. Click Settings → confirm panel renders 5. Click Settings again → confirm panel collapses (or list returns) | All elements render correctly; search applies and clears; Settings panel opens then closes without page reload | `visual-memory/admin/payment-transactions/payment-transactions-loaded.png`, `payment-gateway-settings.png` | n/a | P1 | Pending |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence Status | Notes |
|-------|--------|------|-------------|------------|------------------|------------------------|-------|
| TC_PAYTX_UI_001 | Payment Transactions | UI | Yes | Low | ui-ux | FULL | Static heading + count assertion |
| TC_PAYTX_UI_002 | Payment Transactions | UI | Yes | Low | ui-ux | FULL | Element presence assertions |
| TC_PAYTX_UI_003 | Payment Transactions | UI | Yes | Low | ui-ux | FULL | Element presence assertions |
| TC_PAYTX_UI_004 | Payment Transactions | UI | Yes | Low | ui-ux | FULL | Table header order check |
| TC_PAYTX_FUNC_005 | Payment Transactions | FUNC | Yes | Medium | e2e | FULL | Use Playwright `waitForEvent('download')` |
| TC_PAYTX_FUNC_006 | Payment Transactions | FUNC | Yes | Medium | e2e | FULL | Date format may need explicit format; verify post-filter count change |
| TC_PAYTX_FUNC_007 | Payment Transactions | FUNC | Yes | Medium | e2e | FULL | Requires UAT seed customer; use known fixture |
| TC_PAYTX_FUNC_008 | Payment Transactions | FUNC | Yes | Medium | e2e | FULL | Use `8888888888` (auth seed mobile) |
| TC_PAYTX_FUNC_009 | Payment Transactions | FUNC | Yes | Medium | e2e | FULL | Requires known reg number from UAT |
| TC_PAYTX_FUNC_010 | Payment Transactions | FUNC | Yes | Medium | e2e | FULL | Combined filter — sequence + intersection assertion |
| TC_PAYTX_FUNC_011 | Payment Transactions | FUNC | Yes | Low | regression | FULL | Refresh preserves filter state |
| TC_PAYTX_BIZ_012 | Payment Transactions | BIZ | Yes | Low | regression | FULL | Negative-presence assertion |
| TC_PAYTX_BIZ_013 | Payment Transactions | BIZ | Yes | Low | regression | FULL | Negative-presence assertion on rows |
| TC_PAYTX_FUNC_015 | Payment Transactions | FUNC | Yes | Low | e2e | FULL | URL invariance check + panel render |
| TC_PAYTX_UI_016 | Payment Transactions | UI | Yes | Low | ui-ux | FULL | Settings-mode element presence |
| TC_PAYTX_BIZ_023 | Payment Transactions | BIZ | Yes | Medium | regression | FULL | Enum-domain assertion across rows |
| TC_PAYTX_REG_024 | Payment Transactions | REG | Yes | Medium | regression | FULL | Smoke regression composite |
| TC_PAYTX_FUNC_017 | Payment Transactions | FUNC | Partial | Medium | e2e | FULL | **CAUTION:** mutates UAT state — guard with `ENV=uat` skip per BRD §9 critical risk |
| TC_PAYTX_FUNC_018 | Payment Transactions | FUNC | Partial | Medium | e2e | FULL | **CAUTION:** mutates live gateway config — guard with `test.skip(process.env.ENV === 'uat', ...)` |
| TC_PAYTX_NEG_019 | Payment Transactions | NEG | Partial | Medium | e2e | FULL | **CAUTION:** dual-toggle disable — guard with ENV skip; restore state in teardown |
| TC_PAYTX_XMOD_020 | Payment Transactions | XMOD | Yes | Low | e2e | FULL | Navigation assertion |
| TC_PAYTX_NEG_021 | Payment Transactions | NEG | Yes | Low | e2e | FULL | Invalid date range — validation or zero-result |
| TC_PAYTX_EDGE_022 | Payment Transactions | EDGE | Yes | Low | e2e | FULL | Empty state render |
| TC_PAYTX_BIZ_014 | Payment Transactions | BIZ | No | Low | manual-only | FULL | Detail view is documented as not implemented (BRD §9); revisit when feature ships |

---

## Sheet 3 — Bug Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_NNN | TC_PAYTX_xxx_NNN | Critical / High / Medium / Low | (paste TC steps that reproduced the issue) | (observed) | (expected per TC) | UAT — Chrome 1920×900 | Open |

---

## Coverage Summary

| Source | Coverage | Notes |
|--------|----------|-------|
| BRD sections cited | §1, §2, §3, §4, §5, §6 (rules 3, 4, 5), §7, §8, §9 | 100% — every BRD section mapped to ≥ 1 TC |
| Visual evidence usage | 4 of 6 screens actively cited | `payment-transactions-loaded.png`, `payment-transactions-full.png`, `payment-gateway-settings.png`, `payment-settings-page.png` (4/6 = 67% of screen files cited; legacy stubs `screenshot-desktop.png` and `screenshot-ui.png` are pre-INDEX.md baselines and not required for TC steps) |
| TC visual-evidence coverage | 24 / 24 (100%) | Every TC carries a `visual-memory/...png` reference |
| Read-only enforcement TCs | 3 (TC_PAYTX_BIZ_012, 013, 014) | Covers header strip, row Actions, and documented eye-icon limitation |
| Gateway settings TCs | 6 (TC_PAYTX_FUNC_015 through TC_PAYTX_XMOD_020) | Toggle, Update, at-least-one-gateway rule, View Tower navigation |
| Export TC | 1 (TC_PAYTX_FUNC_005) | Download event assertion |
| Filter TCs | 6 (TC_PAYTX_FUNC_006 through 011, plus 021, 022) | Date range, name, phone, reg no., combined, edge / invalid |
