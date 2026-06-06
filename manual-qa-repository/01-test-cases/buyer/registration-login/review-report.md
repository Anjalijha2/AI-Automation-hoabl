# Test Case Review Report — Registration & Login — Buyer — 2026-06-06

## Summary
- Total TCs reviewed: 14
- Approved: 13
- Conditional: 1 (VISUAL_GAP — NO-VISUAL-EVIDENCE)
- Requires Changes: 0
- Coverage (BRD/FRD): 87.5% (7 of 8 FRD sub-features covered; FRD 1.6 first-login consent deferred)
- Visual coverage: 92.8% (13/14)
- Doc logic coverage: 100% (14/14 TCs cite BRD/FRD req IDs in scenarios)
- Visual status: FULL

## Visual Evidence Gaps
| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_BUYER_LOGIN_NEG_005 | Wrong OTP — stays on `/`, no JWT, error toast | NO-VISUAL-EVIDENCE | none | Tech Lead Agent to capture wrong-OTP error state; promote to e2e once screenshot present |

## Logic Gaps
None. All TCs reference FRD/BRD requirement IDs and reflect business purpose.

## BRD/FRD Gaps
| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|
| First-login T&C consent modal | FRD 1.6 | E2E + NEG | Deferred — needs fresh mobile or historical screenshot capture |
| Referral entry `/ref/:hvCode` | FRD 1.8.2 | FUNC | Out of scope this batch — covered by Channel Partner flow |

## Per-TC Status
| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_BUYER_LOGIN_UI_001 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_FUNC_002 | FRD 1.5, BRD §4.2 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_FUNC_003 | FRD 1.4, 1.8 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_FUNC_004 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_NEG_005 | FRD 1.5 | NO-EVIDENCE | Yes | Conditional | VISUAL_GAP; exclude from Sheet 2 |
| TC_BUYER_LOGIN_VAL_006 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_VAL_007 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_VAL_008 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_EDGE_009 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_NEG_010 | BRD §2 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_FUNC_011 | FRD 1.4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_E2E_012 | FRD 1.7 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_REG_013 | FRD 1.7, BRD §4 | FULL | Yes | Approved | — |
| TC_BUYER_LOGIN_UI_014 | FRD 1.4 | FULL | Yes | Approved | — |

## Approval
[x] Conditional — proceed with 13 approved TCs to automation; TC_BUYER_LOGIN_NEG_005 blocked pending Tech Lead Agent visual capture
[ ] Approved
[ ] Rejected

Visual coverage 92.8% (>80%), no LOGIC_GAP, no VISUAL_MISMATCH — but presence of 1 NO-VISUAL-EVIDENCE TC caps overall status at Conditional per skill gate rules.
