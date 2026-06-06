# Doc Change Summary — Buyer / Unit Details — 2026-06-06

## DOC_DRIFT-001 Resolution

**Issue:** BRD/FRD referenced `/allotted-units` as the Unit Details page route.
**Actual implementation:** `/kyc?unitId=<base64>` (confirmed via live portal capture).
**Root cause:** Route was renamed/restructured in implementation; FRD not updated.

## Files Updated
- BUYER-FS-Unit-Details.md — URL definition corrected
- BUYER-FRD-Buyer-Portal.md — 2 screen definitions corrected
- BUYER-BRD-Buyer-Portal.md — Unit Details table reference corrected

## Impact on TCs
- TC_BUYUD_* series: Steps already use correct route (generated from visual-memory, not FRD URL)
- No TC regeneration needed — only documentation corrected
- Visual evidence and selectors unaffected

## Dual-Source Status
- Visual memory: `visual-memory/buyer/unit-details/INDEX.md` — FULL
- BRD/FRD: NOW CORRECT — DOC_DRIFT-001 resolved
