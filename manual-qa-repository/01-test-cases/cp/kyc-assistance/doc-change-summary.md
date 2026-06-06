# Doc Change Summary — CP / KYC Assistance

**Date:** 2026-06-07
**Owner:** BA Agent
**Trigger:** test-case-reviewer DOC_DRIFT report (3 items)
**FRD updated:** `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md`

---

## Dual-Source Confirmation

| Source | Status | Path |
|---|---|---|
| Visual memory | FULL (refreshed 2026-06-06) | `visual-memory/cp/kyc-assistance/INDEX.md` |
| BRD/FRD | Present (updated this change) | `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md` |
| Dual-source confirmation | YES | both sources verified before edits |

---

## What Changed

Three concrete DOC_DRIFT corrections were applied to bring the FRD into alignment with the live UI captured on 2026-06-06. All historical buyer-KYC artefacts (4-doc, 4-applicant, click-validation patterns) have been removed from the CP self-KYC sections; they were inherited from an earlier buyer-KYC draft and never matched the implemented CP portal endpoint.

### DOC_DRIFT-CP-KYC-001 — Document count corrected from 4 to 3
- **Was:** FRD §1.5, §1.6, §1.7-4, Step 3, Step 4 all stated "4 documents per applicant" (Passport photograph, PAN, Aadhaar front, Aadhaar back).
- **Now:** Documents table lists the 3 slots actually rendered in the live UI — **PAN Card**, **GST Certificate**, **MAHA RERA Certificate**.
- **Annotation:** `<!-- DOC_DRIFT-CP-KYC-001 corrected 2026-06-07: 3 documents, not 4 -->` added at §1.5, §1.6, §1.7, and the "How to Use" header.
- **Evidence:** `visual-memory/cp/kyc-assistance/kyc-below-fold-submit.png` and `_kyc-dom-inspect.json` (3 hidden file inputs only).

### DOC_DRIFT-CP-KYC-002 — Business Region options added
- **Was:** FRD did not mention the Business Region field or its allowed values.
- **Now:** §1.4 Firm Details lists "Business Region (select): **MMR / Pune / BGLR**" with mapping to Mumbai Metropolitan Region, Pune, Bengaluru. The "How to Use" Step 2 also calls out the three options explicitly.
- **Annotation:** `<!-- DOC_DRIFT-CP-KYC-002 added 2026-06-07: Business Region options from live capture -->` added at §1.4 and the "How to Use" header.
- **Evidence:** `visual-memory/cp/kyc-assistance/kyc-business-region-dropdown.png` and `_kyc-region-options.json`.

### DOC_DRIFT-CP-KYC-003 — Validation pattern corrected to disabled-button gating
- **Was:** FRD §1.7 and Step 5 implied per-field inline error rendering on Submit click ("You will not be able to submit without all of them").
- **Now:** §1.7-5 and Step 5 state that the Submit button is `disabled=true` at the DOM level until all required text fields have values; clicking the disabled button is a no-op; **no inline field errors render**.
- **Annotation:** `<!-- DOC_DRIFT-CP-KYC-003 corrected 2026-06-07: disabled-button gating, not click-validation -->` added at §1.7 and the "How to Use" header.
- **Evidence:** `visual-memory/cp/kyc-assistance/kyc-validation-errors.png` and `kyc-validation-full.png` (post-Submit-click viewport — Submit remains disabled, no error styling on any field).

---

## Nature of Change

**BRD/FRD corrected to match live implementation.** No application code change is implied. The FRD had carried over assumptions from an earlier buyer-KYC draft (4 applicants, 4 documents, click-validation) that never matched the CP self-KYC endpoint that was actually shipped. Live UI capture on 2026-06-06 surfaced the mismatch and the FRD is now the source of truth aligned with what is built.

The FSD-CORRECTION 2026-05-25 banner (unauthenticated `POST /cp/registration`) is unchanged and remains a separate, still-open security flag.

---

## Visual Memory Status

**FULL** — `visual-memory/cp/kyc-assistance/INDEX.md` (CAPTURE_STATUS: FULL, refreshed 2026-06-06). Eight screenshots cover: empty form full-page, above-fold, mid-page, below-fold + Submit-disabled footer, Business Region dropdown open with 3 options, post-Submit-click viewport (Submit still disabled, no inline errors), and full-page validation-state capture. Plus three sidecars: `_kyc-dom-inspect.json`, `_kyc-region-options.json`, `_kyc-capture-results.json`.

---

## Impact on TCs

Approximately **14 Conditional TCs** in `manual-qa-repository/01-test-cases/cp/kyc-assistance/TestCases.md` are affected and require re-review by QA Agent (`test-case-reviewer` skill) before automation:

| Affected area | Why TCs need re-review |
|---|---|
| Document-count TCs (any TC that uploads or asserts presence of "4 documents", "Passport photograph", "Aadhaar front/back") | Document list is now 3: PAN Card / GST / MAHA RERA Certificate. Drop Aadhaar/passport TCs; convert to GST + MAHA RERA. |
| Co-applicant TCs (Add Applicant, max 4 applicants, blood-relative validation) | Not applicable to CP self-KYC. Move to buyer-KYC test scope or mark out-of-scope for this module. |
| Business Region TCs | New positive TCs needed: select MMR, select Pune, select BGLR. New negative TC: leave region unselected → Submit stays disabled. |
| Submit-validation TCs (any TC that clicks Submit on empty/partial form and asserts an inline error toast/message) | Expected Result must change from "inline error appears" to "Submit button remains `disabled=true`; click is a no-op; no error styling renders". |
| Required-field TCs | Re-baseline against the verified required set: `orgName`, `address`, `Business Region`, `ownerName`, `email`, `phone`, `officePincode`, `panNumber`. `reraNumber` is optional. |

**Handoff:** QA Agent — please re-run `test-case-reviewer` on `TestCases.md` with the updated FRD + the FULL visual memory before progressing to automation scaffolding.

---

## Files Touched (this change)

| File | Change |
|---|---|
| `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md` | §1.4 rewritten with verified field list + Business Region options; §1.5 rewritten with 3 documents; §1.6 clarified (co-applicants N/A for CP self-KYC); §1.7 validation rules rewritten for disabled-button gating; "How to Use" steps 1–6 rewritten end-to-end. All three DOC_DRIFT annotations inserted. |
| `manual-qa-repository/01-test-cases/cp/kyc-assistance/doc-change-summary.md` | This file (new). |

**Out of scope (not touched by BA Agent):** `TestCases.md`, `review-report.md`, any spec or POM files. QA Agent owns those updates.
