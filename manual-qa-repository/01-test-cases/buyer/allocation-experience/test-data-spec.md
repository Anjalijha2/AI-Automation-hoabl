# Test Data Spec — Allocation Experience — Buyer Portal

**Module:** Allocation Experience
**Portal:** Buyer
**URL:** https://uat.xrportal.in/alloted
**Generated:** 2026-06-03

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Buyer mobile (UAT login) | `8888888888` | Static UAT credential (BRD §4 row 2 / CLAUDE.md) |
| Buyer OTP (UAT login) | `258369` | Static UAT OTP (CLAUDE.md Auth). FRD `BUYER-BRD §4 row 2` lists `147258` — divergence flagged below. |
| Registration ID format | `^GHNG-\d{10}-[A-Z]$` | Example: `GHNG-1000008364-K`. Test account has K, C, D, E, F, G, H. |
| Countdown timer format | `^\d+d :\d{1,2}h :\d{1,2}m :\d{1,2}s$` | Example: `8d :12h :6m :35s` |
| T&C checkbox label | `"I confirm to HoABL Terms & Conditions and Privacy Policy"` | Must be ticked before Pay enables (BRD §4 r4) |
| Confirmation amount | `Rs. 27,000` (UAT default) | Pay button text: `Confirmation Amount Pay Rs. 27,000` |
| Unit colour codes | white=Available, green=Selected, orange=Held, red=Booked | FRD §2.5 |
| Towers (UAT seed) | Crest, Crown, Blossom, Pinnacle, Bright | FRD §2.4 |
| Payment methods (Easebuzz) | Credit Card, Debit Card, UPI, NetBanking, Wallets | FRD §2.7 Phase 3 |
| Hold duration | 20 minutes from `pay_now_initiated` | BRD §4 r5, FRD §2.8 r1 |
| Gateway timer | ~15 minutes (Easebuzz) | FRD §2.7 Phase 3 |
| Buyer status values | WAITLIST, Available, PREALLOCATED, ALLOCATED, WINNER, Booked | BRD §4 r7 |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| Session | No auth cookie / deleted storageState | Redirect to `/` (login) — TC_ALLOCEXP_NEG_001 |
| Pay click | T&C checkbox unchecked | Pay button non-interactive (no gateway opens) — TC_ALLOCEXP_VAL_007 |
| Second unit hold | Click second white unit while already holding one | Second selection rejected — TC_ALLOCEXP_EDGE_001 |
| Hold expiry | Wait > 20 minutes without paying | Unit released; `Select Unit` returns — TC_ALLOCEXP_EDGE_002 |
| Concurrent hold | Two contexts click same unit | Only one succeeds (Redis lock) — TC_ALLOCEXP_EDGE_003 |
| Post-campaign action | Click anywhere expecting `Select Unit` after campaign close | "Allocation window is closed for now." (red text) — TC_ALLOCEXP_NEG_009 |
| Timer boundary | Timer field values | hours must be 0–23, minutes 0–59, seconds 0–59 — TC_ALLOCEXP_VAL_001 |

---

## Pre-conditions

- **Auth:** Buyer logged in via UAT static OTP; storageState saved at `automation-repository/fixtures/.auth/buyer.json` (run `npm run auth:setup` if missing or expired).
- **Account state:** Test buyer must have ≥1 registration with Status = Available for STATIC happy-path TCs.
- **Campaign state:**
  - Active STATIC campaign required for FUNC_003–009, E2E_001–002, EDGE_001–003.
  - Active DYNAMIC campaign required for FUNC_010.
  - No active campaign required for FUNC_011 (pre-event waiting state).
  - Campaign in ended state required for NEG_009.
- **Held unit (pre-existing):** Required for FUNC_008 and EDGE_002 — provision via DB seed or prior test step.
- **Two distinct buyer accounts:** Required for EDGE_003 (race condition test) — both Available, eligible for same campaign.
- **Network:** WebSocket connection to UAT backend must be reachable for INT_001 and E2E flows.
- **Viewport:** 1920×900 (matches visual-memory capture) for UI-class TCs.

---

## Cleanup / Teardown

- **Unit holds:** After any TC that holds a unit but does not pay (EDGE_001, EDGE_002, partial E2E_001), explicitly release via API or wait out the 20-minute window before the next test in the same campaign.
- **Booked unit:** Tests that complete payment (E2E_002) consume the test buyer's registration. Either: (a) skip on UAT to preserve the seed account, or (b) coordinate with seed reset before next run.
- **Browser state:** For NEG_001, use `browser.newContext()` (no storageState) and dispose after assertion.
- **Logout:** NEG_002 invalidates the saved session — must re-run `npm run auth:setup` before subsequent protected TCs in the same execution.
- **WebSocket listeners:** Detach `page.on('websocket', ...)` listeners between tests to avoid leakage.
- **Test artefacts:** Screenshots and traces under `test-results/`; do not delete during a run — collected by `generate-report` skill.

---

## Environment Skip Guards

| TC_ID | Reason to skip on UAT |
|-------|-----------------------|
| TC_ALLOCEXP_FUNC_009 | Opens live Easebuzz gateway — `test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway')` |
| TC_ALLOCEXP_E2E_001 | Live gateway interaction at final step |
| TC_ALLOCEXP_E2E_002 | Requires completed real payment |
| TC_ALLOCEXP_EDGE_002 | 20-minute wait — gate behind a long-run flag, not ENV |

---

## Open Data Questions (GAPs)

| GAP | Description | Action |
|-----|-------------|--------|
| DATA-GAP-01 | BUYER-BRD §4 r2 documents UAT OTP as `147258`; CLAUDE.md states `258369`. Both cannot be correct simultaneously. | Confirm which is the live UAT static OTP for buyer accounts; update the conflicting document. |
| DATA-GAP-02 | DYNAMIC campaign seed data not documented — which buyer accounts are eligible, which round, which band? | Tech Lead Agent / QA Agent to document DYNAMIC test seed in `automation-repository/constants/testData.js`. |
| DATA-GAP-03 | Concurrent buyer accounts for EDGE_003 not enumerated. | Provision two Available-status buyer accounts; add to test data registry. |
| DATA-GAP-04 | Mechanism to fast-forward the 20-minute hold for EDGE_002 (DB ttl override) is not documented. | Add a DB query helper under `db/queries/booking.js` to expire a hold for test purposes, gated to non-prod. |
