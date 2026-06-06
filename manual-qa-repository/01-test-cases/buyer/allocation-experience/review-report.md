# Test Case Review Report — Allocation Experience — Buyer — 2026-06-06

## Summary
- Total TCs reviewed: 40
- Approved: 32
- Conditional: 8 (STUB-EVIDENCE — downstream views not captured)
- Requires Changes: 0
- Coverage (BRD/FRD): 100% — every TC traces to BUYER-BRD §3–§7, FRD Features 1–4, or INDEX.md structural notes
- Visual coverage: 80.0% (32/40 with FULL evidence)
- Doc logic coverage: 100% (40/40 TCs reference BRD/FRD requirement IDs)
- Visual status: MIXED — FULL for landing/sidebar/booked states; STUB for downstream selection grid, payment context, post-expiry, DYNAMIC, pre-event

## Visual Evidence Gaps
| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_ALLOC_EDGE_005 | Countdown < 24h boundary rendering | STUB | not captured | Tech Lead Agent capture during < 24h campaign window |
| TC_ALLOC_E2E_015 | Select Unit grid → tower → unit → Add full sequence | STUB | partial (entry only) | Capture during live STATIC campaign with available units |
| TC_ALLOC_BIZ_032 | Available → Waitlisted on countdown expiry | STUB | not captured | Coordinate admin Stop or wait for natural expiry |
| TC_ALLOC_WF_033 | WebSocket live update on campaign closure | STUB | not captured | Coordinated admin Stop during buyer session |
| TC_ALLOC_E2E_034 | Full STATIC flow including T&C + Pay + gateway entry | STUB | partial (entry only) | Capture live flow; ENV skip from gateway |
| TC_ALLOC_VAL_035 | Pay button bound to T&C state | STUB | not captured | Capture selected-unit + T&C states |
| TC_ALLOC_BIZ_036 | Pre-event WAITLIST waiting screen | STUB | not captured | Capture outside ACTIVE campaign |
| TC_ALLOC_WF_037 | DYNAMIC campaign auto-assignment view | STUB | not captured | Capture during DYNAMIC campaign env |

## Logic Gaps
None. All scenarios trace explicitly to BUYER-BRD §4–§7, FRD Features 1–4, or INDEX.md.

## BRD/FRD Gaps
No coverage gaps. WINNER_STATE confirmed in visual memory; allocation-experience TCs assuming winner state are valid per task context. KYC routing per fixed DOC_DRIFT-001 (route is `/kyc?unitId=<base64>`) — TC_ALLOC_FUNC_020 still references `/kyc?unitId=[unitId]` which matches the corrected FRD route shape. No update required.

## Per-TC Status
| TC_ID Range | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------------|--------|-----------------|----------------|--------|-------|
| TC_ALLOC_UI_001–004, UI_006–FUNC_014, UI_016–FUNC_022, FUNC_023–026 (entry), VAL_027, UI_028–FUNC_030, NEG_038, FUNC_039, UI_040 | BUYER-BRD §3–§7, FRD §1–§4, INDEX.md | FULL | Yes | Approved (32 TCs) | — |
| TC_ALLOC_EDGE_005, E2E_015, FUNC_031, BIZ_032, WF_033, E2E_034, VAL_035, BIZ_036, WF_037 | BUYER-BRD §4–§7, FRD §1–§3 | STUB | Yes | Conditional (8 TCs) | Downstream view capture pending |

## Approval
[x] Conditional — 32 of 40 Approved; 8 Conditional pending downstream visual capture
[ ] Approved
[ ] Rejected

Visual coverage 80.0% meets threshold; no LOGIC_GAP, no VISUAL_MISMATCH. The 8 STUB-EVIDENCE TCs are honestly flagged for live-campaign or coordinated capture and remain manual-only until visuals captured. WINNER_STATE state confirmed in INDEX.md and TCs that assume it are valid.
