# Test Data Spec — Payment Transactions — Admin Portal

**Module:** Payment Transactions
**Portal:** Admin
**Environment:** UAT (`https://uat-web.xrportal.in/admin/payment-transactions`)
**Generated:** 2026-06-03

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Start Date | `01/05/2026` (and any past date ≥ system epoch) | Format `DD/MM/YYYY` — confirm format from live datepicker behaviour on first run |
| End Date | `31/05/2026` (must be ≥ Start Date) | Same format as Start Date |
| Search by Name | Any UAT-seeded customer full or partial name | Case-insensitive expected; debounce applies — wait for table refresh |
| Search by Phone | `8888888888` (UAT auth seed mobile) | Also accepts any 10-digit Indian mobile present in UAT data |
| Search by Registration No. | Any known UAT registration number (e.g., obtained from prior reconciliation export) | Exact or prefix match expected |
| Gateway toggle target tower | Any tower from UAT seed where Easebuzz AND Razorpay are currently Active | Pre-select via TC_PAYTX_UI_016 |
| Payment Type (display values) | `Allocation` \| `Milestone` \| `Registration` \| `Offline` | BRD §3 — closed enum |
| Source (display values) | `Easebuzz` \| `Razorpay` \| `Offline` | BRD §4 — closed enum |
| Status (display values) | `initiated` \| `pending` \| `completed` \| `failed` \| `cancelled` \| `dropped` \| `bounced` \| `refunded` | BRD §5 — closed enum |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error / Behaviour |
|-------|--------------|----------------------------|
| End Date | Earlier than Start Date (e.g., Start `31/05/2026` / End `01/05/2026`) | Either: input rejects the value, OR table renders zero rows gracefully (no crash, no console error) — TC_PAYTX_NEG_021 |
| Search by Name/Phone/Reg | Non-existent string `ZZZ_NO_MATCH_12345` | Empty result set; "No data" empty state; clearing input restores full list — TC_PAYTX_EDGE_022 |
| Gateway settings | Disable BOTH Easebuzz AND Razorpay for the same tower simultaneously, then click Update | Update blocked OR explicit error shown — at-least-one-gateway rule per BRD §6 rule 3 — TC_PAYTX_NEG_019 |
| Header buttons (read-only enforcement) | Any element matching `/^(Create|Add|New|\+)/i` other than Refresh / Export / Settings | Must not exist on the main list view — TC_PAYTX_BIZ_012 |
| Row Actions (read-only enforcement) | Any Edit / Delete / Remove / Cancel button on transaction rows | Must not exist on row Actions column — TC_PAYTX_BIZ_013 |

---

## Pre-conditions

- **Auth state:** Admin authenticated via `automation-repository/fixtures/.auth/admin.json` (mobile `8888888888` / OTP `258369`)
- **Data state:**
  - ≥ 10 transaction records visible at default load (UAT shows "Total 10302 Payment Transactions" — well exceeds threshold)
  - For gateway settings TCs: at least one tower exists with both Easebuzz AND Razorpay toggles currently Active (required for TC_PAYTX_NEG_019)
  - For name/phone/reg search TCs: at least one known seeded customer record with stable identifying fields
  - For Export TC: browser context must allow downloads (Playwright default OK)

---

## Cleanup / Teardown

- **TC_PAYTX_FUNC_017 / 018 (gateway toggle):** Restore the original Active/Inactive state of the test tower's toggles at end of test. Capture pre-state in `beforeEach`, restore in `afterEach`. Click Update to persist the restored state.
- **TC_PAYTX_NEG_019 (at-least-one-gateway):** If the test successfully reaches the "disable both" attempt, ensure at least one gateway is re-enabled before exiting. The system should prevent the bad save — but restore state defensively.
- **TC_PAYTX_FUNC_005 (Export):** Delete the downloaded CSV file from temp/download directory after assertion (avoid disk accumulation across runs).
- **Filter TCs:** Clear all filters at end of test (clear date inputs, clear search input) so the next test starts from a clean state.
- **No DB cleanup required:** module is read-only for transactions; only gateway settings mutations need restore.

---

## Environment Guards

All TCs that **mutate** gateway settings (TC_PAYTX_FUNC_017, 018, NEG_019) must include the ENV skip guard per CLAUDE.md convention:

```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway config; would affect real buyers per BRD §9');
```

Per BRD §9 CRITICAL: disabling a payment gateway takes effect immediately and affects buyers mid-payment. Mutation TCs must NOT run unguarded on UAT.

---

## Fixture Data References

- Auth: `automation-repository/fixtures/.auth/admin.json`
- Test data constants: `automation-repository/constants/testData.js` — add `PAYMENT_TRANSACTIONS` namespace with seeded customer name, phone, reg number, and target tower ID before automation
