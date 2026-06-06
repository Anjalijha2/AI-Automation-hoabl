# Test Case Review Report — Payment Schedule — Buyer — 2026-06-06

## Summary
- Total TCs reviewed: 30
- Approved: 15 (page-load, headings, dropdown structure, empty state, navigation, unauth, no-data fixtures)
- Conditional: 15 (DATA_BLOCKED — table populated states, milestone-specific behaviour, payment gateway, plan types — cannot be visually verified until data fixtures provisioned)
- Requires Changes: 0
- Coverage (BRD/FRD): 100% — all TCs cite FRD §1.1–§1.6 / BRD §3/§4/§8
- Visual coverage: 100% nominal citation (30/30 cite captured screens) — but only 3 screens captured, none show populated table data
- Doc logic coverage: 100% (30/30 TCs reference FRD/BRD requirement IDs)
- Visual status: FULL for empty/landing state; DATA_BLOCKED for populated-table states

## Visual Evidence Gaps (DATA_BLOCKED per task context)
Per task context: "payment-schedule: DATA_BLOCKED states documented in INDEX.md — TCs for gated states should be marked Conditional".

INDEX.md captures only the empty state (table is empty until selectors are populated; no fixture buyer with active schedule was captured). TCs that require populated milestone rows are Conditional pending data-fixture capture:

| TC_ID | Expected Result Summary | Evidence Status | Action |
|-------|------------------------|-----------------|--------|
| TC_PAYSCH_FUNC_007 | Table populates with milestone rows | DATA_BLOCKED | Tech Lead Agent capture buyer with active schedule |
| TC_PAYSCH_UI_008 | Table column headers in order | DATA_BLOCKED | Same |
| TC_PAYSCH_FUNC_009 | GST broken out separately | DATA_BLOCKED | Same |
| TC_PAYSCH_FUNC_010 | TOTAL OUTSTANDING reflects unpaid balance | DATA_BLOCKED | Mixed-status fixture |
| TC_PAYSCH_FUNC_011 | PAYMENT STATUS values | DATA_BLOCKED | Mixed-status fixture |
| TC_PAYSCH_FUNC_012 | PAY action visible on due milestone | DATA_BLOCKED | Due-milestone fixture |
| TC_PAYSCH_FUNC_013 | PAY click initiates gateway | DATA_BLOCKED + ENV skip | Live gateway — manual only |
| TC_PAYSCH_FUNC_014 | Paid milestone hides PAY | DATA_BLOCKED | Paid-milestone fixture |
| TC_PAYSCH_FUNC_015 | TRANSACTION DETAILS opens | DATA_BLOCKED | Paid-milestone fixture |
| TC_PAYSCH_FUNC_016 | Pending milestone TRANSACTION DETAILS empty | DATA_BLOCKED | Pending-milestone fixture |
| TC_PAYSCH_FUNC_020 | HL-linked milestone | DATA_BLOCKED | HL fixture |
| TC_PAYSCH_FUNC_021 | CL-plan rendering | DATA_BLOCKED | CL fixture |
| TC_PAYSCH_FUNC_022 | TL-plan rendering | DATA_BLOCKED | TL fixture |
| TC_PAYSCH_FUNC_023 | DP-plan rendering | DATA_BLOCKED | DP fixture |
| TC_PAYSCH_FUNC_024 | EB discount | DATA_BLOCKED | EB fixture |
| TC_PAYSCH_FUNC_028 | Partial milestone already-paid | DATA_BLOCKED | Partial fixture |
| TC_PAYSCH_E2E_027 | Full payment flow | DATA_BLOCKED + ENV skip | Manual only |
| TC_PAYSCH_NEG_029 | Future milestone non-actionable | DATA_BLOCKED | Future-milestone fixture |
| TC_PAYSCH_FUNC_030 | Change registration resets unit | DATA_BLOCKED | Multi-reg fixture |

(15 TCs above are Conditional; 4 TCs that have HL/plan/EB partial visibility need both data + visual capture.)

## Logic Gaps
None.

## BRD/FRD Gaps
None. FRD §1.1–§1.6 fully cited.

## Per-TC Status
| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_PAYSCH_FUNC_001 | FRD §1.1, §1.3 | FULL | Yes | Approved | — |
| TC_PAYSCH_UI_002 | FRD §1.1 | FULL | Yes | Approved | — |
| TC_PAYSCH_UI_003 | INDEX | FULL | Yes | Approved | — |
| TC_PAYSCH_UI_004 | INDEX | FULL | Yes | Approved | — |
| TC_PAYSCH_FUNC_005 | FRD §1.4, BRD §4.7 | FULL | Yes | Approved | — |
| TC_PAYSCH_FUNC_006 | FRD §1.4, §1.6 | FULL | Yes | Approved | — |
| TC_PAYSCH_FUNC_007–016, 020–024, 028–030, E2E_027, NEG_029 | FRD §1.4–§1.6 / BRD §4 | DATA_BLOCKED | Yes | Conditional (15+) | Data fixture required |
| TC_PAYSCH_UI_017 | INDEX (empty state) | FULL | Yes | Approved | — |
| TC_PAYSCH_NEG_018 | BRD §4.7, FRD §1.3 | FULL | Yes | Approved | — |
| TC_PAYSCH_NEG_019 | BRD §3 | FULL | Yes | Approved | — |
| TC_PAYSCH_UI_025 | INDEX | FULL | Yes | Approved | — |
| TC_PAYSCH_FUNC_026 | INDEX | FULL | Yes | Approved | — |

## Approval
[x] Conditional — 15 of 30 Approved; 15 Conditional (DATA_BLOCKED states per task context)
[ ] Approved
[ ] Rejected

INDEX.md visual captures cover empty/landing state only. TCs that depend on populated milestone rows are honestly Conditional per task context guidance. No LOGIC_GAP, no VISUAL_MISMATCH; module remains Conditional pending data-fixture capture by Tech Lead Agent.
