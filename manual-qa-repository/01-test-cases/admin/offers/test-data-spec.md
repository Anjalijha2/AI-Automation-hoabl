# Test Data Spec — Offers — Admin Portal

**Generated:** 2026-06-03
**Module:** Admin / Offers
**Source:**
- Visual: `visual-memory/admin/offers/INDEX.md`
- BRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Offers.md`

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Offer Name | Free-text string, ≤ ~100 chars (UAT-observed practical cap) | Suggested format `QA_<Type>_<timestamp>` for traceability |
| Offer Type | `Amount Based`, `Percentage Based` | Enum — exactly two options per BRD §3 |
| Amount (INR) | Integer ≥ 1 (e.g. 27000, 15000, 5000) | Required when Offer Type = Amount Based; displayed as `₹ X,XXX` in table |
| Percentage | Integer or decimal 1–100 (typical UAT values: 5, 10) | Required when Offer Type = Percentage Based; displayed as `X%` |
| Start Date | Today or future date (ISO `YYYY-MM-DD`) | Must be ≤ End Date per BRD §5.4 |
| End Date | Date ≥ Start Date | Offer applies only when Start ≤ today ≤ End |
| Description | Free-text, optional | No visible charcount in INDEX.md notes; treat as optional |
| Typology (`unitTypologyId`) | Scalar — single typology ID (e.g. `1` for 1 Bed, `2` for 2 Bed) | Per BRD §10.1 — SCALAR not multi-select; for multi-typology coverage, create multiple offers |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error |
|-------|--------------|---------------|
| Offer Name | Empty `""` | Required-field inline error in drawer (`.ant-form-item-explain-error`) |
| Offer Type | Not selected | Required-field error |
| Amount | Empty when Type=Amount Based | Required-field error on Amount field |
| Amount | `0` or negative | Validation error (zero discount not meaningful per BRD §3) |
| Amount | Non-numeric `abc` | Input rejected or validation error |
| Percentage | Empty when Type=Percentage Based | Required-field error |
| Percentage | `0`, negative, or > 100 | Validation error (out-of-range) |
| Start Date | Empty | Required-field error |
| End Date | Empty | Required-field error |
| End Date | Earlier than Start Date | Date-order validation error per BRD §5.4 — Note: BRD §10.6 flags that the service layer lacks this check; controller/validator middleware should enforce it |
| Offer Code (if/when exposed) | `HOME_LOAN` or `VC_REQUEST` | Should be rejected — but per BRD §10.2 controller audit, today these strings are accepted with no whitelist. Document observed behaviour |

---

## Boundary Conditions

| Scenario | Value | Expected Behaviour |
|----------|-------|--------------------|
| Start Date = today, End Date = today | Same-day validity | Offer applies for today only (BRD §5.4) |
| Start Date = today+1, End Date = today+1 | Future single-day | Offer does NOT apply today; applies only on the set date |
| End Date = Start Date | Equal dates | Allowed (single-day validity) |
| End Date = Start Date − 1 day | Reverse order | Rejected (BRD §5.4) |
| Amount = 1 INR | Minimum positive | Accepted; row shows `₹ 1` |
| Percentage = 100 | Maximum (full discount) | Accepted; row shows `100%` — extreme edge per BRD §5.5 pricing formula |

---

## Pre-conditions

### Auth
- Admin storage state: `automation-repository/fixtures/.auth/admin.json`
- Login: Mobile `8888888888` / OTP `258369` (static UAT)
- URL: `https://uat-web.xrportal.in/admin/offers`

### Data State

| TC Group | Pre-existing Data Required |
|----------|---------------------------|
| UI_001–005 | None (page render only) |
| UI_006 | At least 1 Active + 1 Inactive offer in list to assert both toggle states |
| UI_007 | A `HOME_LOAN` system-generated offer must exist in DB (created automatically when a buyer's home loan is approved in Customers module per BRD §4) |
| FUNC_008–010 | None |
| FUNC_014–015 | At least 1 Active offer (for FUNC_014 deactivate) and 1 Inactive offer (for FUNC_015 re-activate) |
| FUNC_016–017 | At least 1 admin-created offer to edit |
| FUNC_018 | At least 1 offer in list (safe — no deletion) |
| FUNC_019 `[MANUAL-ONLY]` | **Disposable offer** created at start of run, NOT referenced by any `RegistrationUnitOffer` row; do NOT use shared/seeded offers per BRD §10.4 (no FK guard, no soft-delete) |
| BIZ_023–026 | Cross-portal — requires Buyer-side session with units, payment flow access (out of Admin Offers in-page scope) |
| EDGE_027 | Admin API token; ≥1 offer for `projectId=2` |
| EDGE_029, EDGE_030 | DB read access to audit log table and `RegistrationUnitOffer` table |

---

## Cleanup / Teardown

| Item | Action |
|------|--------|
| Disposable offer created during FUNC_019 test | Already destroyed by the TC itself (hard delete via `offer.destroy()` per BRD §10.4). Verify the row is gone post-run; no further cleanup needed |
| Disposable offers from FUNC_008 / FUNC_009 (created but not deleted) | Manual cleanup: toggle OFF + delete via FUNC_019 flow on a separate disposable, OR leave with naming convention `QA_<timestamp>` so later runs/regressions can filter and clean |
| Edits from FUNC_017 | Re-edit back to original value, OR document the changed offer in run notes for next session |
| Toggle state changes from FUNC_014/015 | Restore original ON/OFF state at end of run — toggles have live-effect impact on UAT campaigns (BRD §5.1 + §8) |
| **CRITICAL safety** (BRD §8) | NEVER run FUNC_014 (toggle OFF) on a high-value offer during an active UAT allocation campaign — buyer sessions are affected instantly. Coordinate with allocation TCs |

---

## System-Generated Offers (Not Created by Admin)

| Code | How Created | Visible in UI? | Admin Can Edit? | Admin Can Delete? |
|------|-------------|----------------|----------------|-------------------|
| `HOME_LOAN` | Auto-created by system when admin approves a buyer's home loan in Customers module (BRD §4) | YES (appears in offers list) | Per BRD §10.2 controller audit, no enforcement — likely yes but flagged as risk |  Per BRD §10.4, no audit / no FK guard — possible but DANGEROUS; should be blocked by future hardening |
| `VC_REQUEST` | Auto-created when SM records VC call outcome `VC_DONE_PREFERENCE` or `VC_2_DONE` | YES (appears in offers list) | Same risk profile as HOME_LOAN | Same risk profile |

**Negative test scope:** TC_OFFERS_NEG_021 verifies the UI does NOT expose a way to create `HOME_LOAN` via Add New Offer flow. If a future UI patch exposes an Offer Code field, TC_OFFERS_EDGE_028 covers the whitelist gap.

---

## Selector Quick Reference (from INDEX.md Key Structural Notes)

| Element | Selector |
|---------|----------|
| Page heading | `h5:has-text("Offers Management")` |
| Refresh button | `button:has-text("Refresh")` |
| Add New Offer button | `button.ant-btn-primary:has-text("Add New Offer")` |
| Add/Edit drawer container | `.ant-drawer-content` (NOT `.ant-modal-content`) |
| Drawer title | `.ant-drawer-title` |
| Active toggle (ON) | `button.ant-switch.ant-switch-checked` |
| Active toggle (OFF) | `button.ant-switch` (without `ant-switch-checked`) |
| Edit icon | `button.ant-btn-icon-only` (2nd in flex row of Action cell) |
| Delete icon | `button.ant-btn-icon-only` (3rd in flex row of Action cell) |
| Table column count | 9 (`Sr.no`, `Offer Name`, `Description`, `Amount`, `Percentage`, `Start Date`, `End Date`, `Created By`, `Action`) |
| Amount-Based row | Amount cell `₹ X,XXX` / Percentage cell `-` |
| Percentage-Based row | Amount cell `-` / Percentage cell `X%` |

---

## Test Environment

| Item | Value |
|------|-------|
| Portal | Admin |
| Environment | UAT |
| Base URL | https://uat-web.xrportal.in/admin |
| Module URL | https://uat-web.xrportal.in/admin/offers |
| Viewport (desktop) | 1920×900 |
| Auth | Mobile OTP — static UAT (8888888888 / 258369) |
| Storage state | `automation-repository/fixtures/.auth/admin.json` |
| Locator map (when added) | `locators/admin/locator-map.json` → `offers` key |

---

## Data Lifecycle Notes

1. **Active by default** (BRD §6.4): Newly created offers appear with toggle ON. Tests should expect `ant-switch-checked` on the new row immediately post-create.
2. **Live effect** (BRD §5.1): Toggle changes apply immediately to active buyer sessions — coordinate with Allocation runs.
3. **Hard delete** (BRD §10.4): No soft-delete, no audit, no FK guard. Always run destructive deletes on disposable offers only.
4. **No audit on toggle** (BRD §10.5): Cannot retrieve historical activation timeline from audit log — document run state in execution notes.
5. **Date-order validation gap** (BRD §10.6): Service layer does not check `startDate ≤ endDate`. UI/validator middleware must enforce. Test boundary via HTTP layer, not direct service.
