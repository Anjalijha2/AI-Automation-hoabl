# Coverage Matrix — Buyer Portal / Payment Schedule

**Module:** Payment Schedule (`https://uat.xrportal.in/paymentschedule`)
**Master sheet:** `Payment Schedule - Master`
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-PaymentSchedule.json`
**Sources (dual-source gate — BOTH present):**
- Visual: `visual-memory/buyer/payment-schedule/INDEX.md` (CAPTURE_STATUS: FULL)
- BRD: `BUYER-BRD-Buyer-Portal.md` · FRD: `BUYER-FRD-Buyer-Portal.md` (Module 6) · FS: `BUYER-FS-Payment-Schedule.md` · Workflow: `BUYER-WF-Milestone-Payments.md`

**Totals:** 76 TCs · 58 preserved (IDs never renumbered) · 18 new · 14 sub-modules · 65 carry `[TEST_DATA_REQUIRED]`
**Generated:** 2026-06-14 (BA Agent, unattended)

---

## Features × 11 Coverage Dimensions

Legend: ✅ covered · ⚠ covered with `[VERIFY WITH DEV]` flag · N/A not applicable to this read-and-action screen

| # | Feature | 1 Positive | 2 Full-form | 3 Mandatory/Val | 4 Re-check/Race | 5 Negative/Error | 6 Context-ctrl | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| F1 | Access & navigation to schedule | ✅ | N/A | N/A | N/A | ✅ | ✅ | — | — | ✅ | — | — |
| F2 | Page structure & selectors (heading, dropdowns, columns) | ✅ | ✅ | N/A | N/A | — | — | — | — | — | — | — |
| F3 | Registration/Unit dependent selectors | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | — | — | — | — | — |
| F4 | Milestone list & ordering | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| F5 | Amounts (principal/GST/parking/total/outstanding/already-paid) | ✅ | ✅ | — | — | — | — | — | ⚠(API_001) | — | — | — |
| F6 | Payment status (Pending/Partial/Paid) | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — | — | — |
| F7 | Home loan disbursement & discounts | ✅ | ✅ | — | — | — | ✅ | — | — | — | ✅ | — |
| F8 | Payment plan variants (constr/time/down) | ✅ | ✅ | — | — | — | ✅ | — | — | — | — | — |
| F9 | Pay action / gateway (live-guarded) | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | — |
| F10 | Partial payments | ✅ | — | — | ✅ | — | ✅ | — | — | — | — | ✅ |
| F11 | Transaction details / receipts / demand letter | ✅ | — | — | — | ✅ | ✅ | — | — | — | — | — |
| F12 | Empty / error / negative states | ✅ | — | ✅ | — | ✅ | — | — | — | ✅ | — | — |
| F13 | Notifications (due / silent on pay) | ✅ | — | — | — | — | — | ✅ | — | — | ✅ | — |
| F14 | Integration (Mavis, reconciliation, webhook truth) | ✅ | — | — | ✅ | ✅ | — | — | — | — | ✅ | ✅ |
| F15 | API & backend (schedule, isolation, model/ENUM, soft-delete) | ✅ | — | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | — |

**11-dimension self-check (module level):**
- [x] Positive happy path — TC_PAYSCH_FUNC_007, BYR_PAY_020, TC_PAYSCH_E2E_027
- [x] Every field/control on screen — heading, both dropdowns, all 9 columns, PAY, TRANSACTION DETAILS, demand letter, download (F2/F3/F5/F9/F11)
- [x] Required/empty + dependent-control — TC_PAYSCH_FUNC_031, TC_PAYSCH_UI_017
- [x] Numeric/amount derivations — BYR_PAY_008/012/013, TC_PAYSCH_FUNC_010
- [x] Submit-time re-validation / race — TC_PAYSCH_EDGE_001 (browser-close), TC_PAYSCH_INT_003 (missed webhook), TC_PAYSCH_FUNC_032/033
- [x] 500 / empty-state / each error path — TC_PAYSCH_NEG_031, TC_PAYSCH_UI_017, TC_PAYSCH_NEG_018/019/030, BYR_PAY_023
- [x] Row-state variants + routing — Pending/Partial/Paid (BYR_PAY_009/010/011), Pay visibility by trigger/paid state (BYR_PAY_016/024, TC_PAYSCH_NEG_029), home-loan vs non (BYR_PAY_025)
- [x] Silent-notification assertion — BYR_PAY_FSD_028 (silent on pay success/failure)
- [x] API-layer / backend-vs-UI — TC_PAYSCH_API_001/002/003, BYR_PAY_FSD_027 (model ENUM), TC_PAYSCH_DB_001/002/003
- [x] 401/403 / data isolation — TC_PAYSCH_NEG_019, TC_PAYSCH_API_002/003
- [x] Named downstream integrations — Mavis (INT_002), reconciliation cron (INT_003), webhook-as-truth (EDGE_001), due notification (INT_001)
- [x] Boundary / cycle edges — chronological ordering (BYR_PAY_005), final handover milestone (TC_PAYSCH_EDGE_003), overdue (TC_PAYSCH_EDGE_002)

---

## New TC IDs (18) — continue existing type series, gray-fill on import

| TC_ID | Sub-module | Dimension filled |
|-------|------------|------------------|
| TC_PAYSCH_UI_026 | Page Structure & Selectors | Due date / demand-letter exposure (⚠ DOC_DRIFT-003) |
| TC_PAYSCH_FUNC_031 | Selector Behaviour | Registration with no allocated unit → empty unit dropdown |
| TC_PAYSCH_FUNC_032 | Partial Payments | Pay milestone in multiple tranches |
| TC_PAYSCH_FUNC_033 | Partial Payments | Remaining-balance payment moves Partial → Paid |
| TC_PAYSCH_NEG_030 | Empty/Error/Negative | Booked-but-no-KYC buyer → no schedule |
| TC_PAYSCH_NEG_031 | Empty/Error/Negative | Backend 500 on schedule load → friendly error |
| TC_PAYSCH_INT_001 | Notifications | Due-milestone notification dispatched |
| TC_PAYSCH_INT_002 | Integration | Confirmed payment → Mavis record |
| TC_PAYSCH_INT_003 | Integration | Reconciliation cron catches missed webhook |
| TC_PAYSCH_EDGE_001 | Integration | Webhook is truth on browser-close mid-payment |
| TC_PAYSCH_API_001 | API & Backend | Schedule API returns milestone list |
| TC_PAYSCH_API_002 | API & Backend | Schedule API rejects unauthenticated request |
| TC_PAYSCH_API_003 | API & Backend | Tenant isolation — no cross-buyer read |
| TC_PAYSCH_DB_001 | API & Backend | One MilestonePaymentTracking row per milestone, pending/0 |
| TC_PAYSCH_DB_002 | API & Backend | Amounts frozen; template versionId update no retroactive change |
| TC_PAYSCH_DB_003 | API & Backend | Soft-delete of milestones on booking cancellation |
| TC_PAYSCH_EDGE_002 | Status Variants & Edge | Overdue/past-due milestone still payable (⚠ DOC_DRIFT-002) |
| TC_PAYSCH_EDGE_003 | Status Variants & Edge | Final handover milestone behaviour |

---

## Flags

### DOC_DRIFT (raised this pass — live UI wins; do not defer)
- **DOC_DRIFT-001** — FS 1.4 names "Already paid amount" / "Outstanding balance" as separate fields, but the live table surfaces TOTAL AMOUNT + TOTAL OUTSTANDING + a "% DUE" column. TCs assert the on-screen column set; "Already Paid" is verified as derived (Total − Outstanding) or via Transaction Details. (Notes block #15)
- **DOC_DRIFT-002** — No "Overdue" Buyer-facing status documented (only Pending/Partial/Paid). Overdue treated as Pending-with-Pay-available; TC_PAYSCH_EDGE_002 flagged `[VERIFY WITH DEV]`. (Notes block #16)
- **DOC_DRIFT-003** — FS references due dates / demand letters, but visual-memory does not transcribe a DUE DATE column. TC_PAYSCH_UI_026 and BYR_PAY_021 flagged `[VERIFY WITH DEV]` pending confirmation of where these appear live. (Notes block #17)

### Live-payment / live-gateway guarded TCs (need user authorisation + ENV skip guard)
BYR_PAY_017, BYR_PAY_018, BYR_PAY_019, BYR_PAY_020, BYR_PAY_022, BYR_PAY_023, TC_PAYSCH_FUNC_013, TC_PAYSCH_FUNC_032, TC_PAYSCH_FUNC_033, TC_PAYSCH_EDGE_001, TC_PAYSCH_E2E_027 — all carry `test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway')` and `[TEST_DATA_REQUIRED]`. **Do NOT run unattended.**

### Known bug referenced
- **BUG-PAY-001** (BYR_PAY_FSD_027) — milestone status FAILED unsupported by model ENUM → MySQL "Data truncated for column status". Backend-only; Buyer-facing milestone correctly stays Pending (BYR_PAY_023).

### Blockers
None. Dual-source gate satisfied (visual FULL + BRD/FRD/FS/Workflow present). All 11 dimensions covered or justified N/A. 65/76 TCs require user-supplied test data / fixtures before execution (expected for a read-and-action payment module on a stateful UAT account with a live gateway).
