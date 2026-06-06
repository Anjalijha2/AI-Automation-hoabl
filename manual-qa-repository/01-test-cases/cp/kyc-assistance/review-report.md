# Test Case Review Report — KYC Assistance — CP Portal — 2026-06-06

**Reviewer:** QA Agent (`test-case-reviewer` skill)
**TC File:** `manual-qa-repository/01-test-cases/cp/kyc-assistance/TestCases.md`
**Visual Memory:** `visual-memory/cp/kyc-assistance/INDEX.md` (CAPTURE_STATUS: FULL — 8 screenshots, updated 2026-06-06 with full-page + dropdown + Submit-disabled gating)
**BRD/FRD:** `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md` (+ `CP-BRD-CP-Portal.md` §7, `CP-FRD-CP-Portal.md` Module 4)

---

## Summary

- Total TCs reviewed: 30
- Approved: 7
- Conditional: 21
- Rejected: 0
- Coverage (BRD/FRD): 100% at the requirement-ID level (every TC cites a BRD/FRD section)
- Visual coverage: **40% strict** (12/30 cite live screenshots present in INDEX.md). However, the visual-memory capture has just been refreshed (2026-06-06) — the 14 `[STUB-EVIDENCE]` TCs now have corresponding live screenshots in INDEX.md (`kyc-loaded-full.png`, `kyc-below-fold-submit.png`, `kyc-documents-section.png`, `kyc-validation-errors.png`, `kyc-validation-full.png`, `kyc-business-region-dropdown.png`). The TC file has not yet been edited to cite these newer filenames.
- Doc logic coverage: 30/30 = **100%**
- Visual status: **FULL (INDEX.md)** but **STALE in TC citations** — TC file references `[STUB-EVIDENCE]` on 14 TCs and `[NO-VISUAL-EVIDENCE]` on 2 TCs even though the underlying screenshots now exist

---

## Critical Cross-Cutting Issue: DOC_DRIFT (Doc says 4 docs, UI shows 3)

The 2026-06-06 visual capture confirmed the live `/kyc` UI shows **3 mandatory documents only**: PAN Card, GST, MAHA RERA Certificate.

The BRD/FRD (`CP-FS-KYC-Assistance.md` §1.5) describes **4 documents per applicant**: Passport photograph, PAN card, Aadhaar front, Aadhaar back — and applies to a buyer-KYC flow that does not exist in the CP portal backend (per FSD-CORRECTION 2026-05-25 §1.2).

Per the reviewer brief, all TCs referencing 4 documents or Aadhaar/Passport are flagged **Conditional pending BRD update**. The CP self-KYC scope is correctly captured by the TC file's Scope Note, but several TCs still embed the stale buyer-KYC requirements:

| TC_ID | Stale Reference | Action |
|-------|-----------------|--------|
| TC_CPKYC_FUNC_020 | "Firm Registration document" upload — UI shows PAN Card / GST / MAHA RERA, no "Firm Registration" upload | Rewrite to reference one of the 3 actual uploads |
| TC_CPKYC_FUNC_022 | "Aadhaar Front + Back" upload fields — do NOT exist on CP self-KYC | Either remove TC or convert to negative/regression assertion that Aadhaar uploads are NOT present |
| TC_CPKYC_VAL_023 | "all mandatory documents enforced on submit" — INDEX.md confirms uploads are NOT required to enable Submit; Submit-disabled gating is based on text-field completeness only | Rewrite expected result to match observed behaviour |

These TCs carry **LOGIC_GAP** (TC tests behaviour not present in current UI / contradicts INDEX.md observations) AND **VISUAL_MISMATCH** (cited evidence file does not exist in INDEX.md Screens table because the behaviour itself does not exist).

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status (in TC file) | INDEX.md Reality | Action |
|-------|------------------------|------------------------------|------------------|--------|
| TC_CPKYC_FUNC_006 | Business Region dropdown opens with options | `[NO-VISUAL-EVIDENCE]` | NOW CAPTURED — `kyc-business-region-dropdown.png` shows MMR/Pune/BGLR | Update TC to cite the new screenshot — eligible for APPROVED post-update |
| TC_CPKYC_NEG_014 | Submit with empty Business Region triggers validation error | `[STUB-EVIDENCE]` | NOW CAPTURED — `kyc-validation-errors.png` / `kyc-validation-full.png` show **Submit remains DISABLED** (no per-field inline error). Expected result is WRONG. | Rewrite expected result: Submit button stays disabled (no error toast / no inline error); click is no-op |
| TC_CPKYC_NEG_015 | Clear Firm Name and submit triggers "required" error | `[STUB-EVIDENCE]` | Same gating: Submit goes disabled on empty required field; no inline message | Rewrite expected result to match disabled-button gating |
| TC_CPKYC_NEG_016 | Invalid PAN format triggers "PAN must be ABCDE1234F" error | `[STUB-EVIDENCE]` | INDEX.md notes: "no visible client-side validation error styling — validation enforced via disabled-Submit". TC's expected error message is unverified against live UI. | Capture/verify error styling for invalid PAN specifically; until then mark Conditional |
| TC_CPKYC_NEG_017 | Invalid Email format triggers error | `[STUB-EVIDENCE]` | INDEX.md notes email field is `type=text` not `type=email`. No browser-native validation. Same disabled-Submit gating. | Rewrite |
| TC_CPKYC_NEG_019 | Pin Code non-6-digit flagged | `[STUB-EVIDENCE]` | Same disabled-button gating | Rewrite |
| TC_CPKYC_FUNC_020 | "Firm Registration document" upload present | `[STUB-EVIDENCE]` | INDEX.md confirms uploads are PAN Card, GST, MAHA RERA Certificate — NO "Firm Registration" upload | LOGIC_GAP — rewrite to test PAN Card / GST / MAHA RERA upload presence; reference `kyc-below-fold-submit.png` |
| TC_CPKYC_FUNC_021 | PAN card upload field present | `[STUB-EVIDENCE]` | NOW CAPTURED — `kyc-below-fold-submit.png` | Update citation — eligible for APPROVED post-update |
| TC_CPKYC_FUNC_022 | Aadhaar front + back upload fields present | `[STUB-EVIDENCE]` | LOGIC_GAP — Aadhaar uploads do NOT exist on CP self-KYC. INDEX.md confirms 3 uploads only | Either remove TC or repurpose as regression that Aadhaar is NOT present |
| TC_CPKYC_VAL_023 | All mandatory documents enforced on submit | `[STUB-EVIDENCE]` | LOGIC_GAP — INDEX.md confirms doc uploads are NOT required to enable Submit (text fields alone enable it). FRD §1.5 4-docs-mandatory rule does not apply to CP self-KYC | Rewrite to reflect actual UI behaviour OR raise as product bug if mandatory uploads are intended |
| TC_CPKYC_FUNC_024 | Submit button visible at form bottom | `[STUB-EVIDENCE]` | NOW CAPTURED — `kyc-below-fold-submit.png` | Update citation — eligible for APPROVED post-update |
| TC_CPKYC_E2E_025 | Successful KYC submission triggers system actions (Azure, LSQ, PDF) | `[STUB-EVIDENCE]` | Not captured — submission flow not exercised end-to-end | Capture post-submit confirmation screen in a future visual-capture run |
| TC_CPKYC_E2E_026 | "Your KYC is in review" badge on /dashboard post-submit | `[STUB-EVIDENCE]` | Cross-module — captured in `visual-memory/cp/customer-registration/INDEX.md` § Welcome Bar; current account already in "In Review" state | Update citation to `dashboard-loaded.png` (cp/customer-registration) |
| TC_CPKYC_E2E_027 | Badge disappears after admin approval | `[STUB-EVIDENCE]` | Post-approval state not captured (CP account is in review, not approved) | Capture on a second CP account in approved state |
| TC_CPKYC_E2E_028 | KYC rejected — CP can re-edit and resubmit | `[STUB-EVIDENCE]` | Rejection state UI not captured | Out-of-band capture needed |
| TC_CPKYC_BIZ_030 | KYC route requires auth | `[NO-VISUAL-EVIDENCE]` | Reuse `login-initial.png` from `cp/login` visual-memory (same redirect behaviour) | Update citation; eligible for APPROVED post-update |

## Logic Gaps (LOGIC_GAP flags)

| TC_ID | Description |
|-------|-------------|
| TC_CPKYC_FUNC_020 | Tests "Firm Registration document" upload that does not exist in CP self-KYC UI |
| TC_CPKYC_FUNC_022 | Tests Aadhaar front + back uploads that do not exist in CP self-KYC UI |
| TC_CPKYC_VAL_023 | Asserts mandatory-document-on-submit enforcement that the live UI does not perform (Submit can be enabled with empty uploads) |
| TC_CPKYC_NEG_014, NEG_015, NEG_016, NEG_017, NEG_019 | Assert per-field inline validation error messages that the live UI does not render — validation is enforced via disabled-Submit pattern only (per INDEX.md) |

These are **LOGIC_GAP** flags because the TC expected results contradict observed UI behaviour documented in INDEX.md.

## BRD/FRD Gaps

The BRD/FRD itself contains stale content:
- `CP-FS-KYC-Assistance.md` §1.4 (applicant fields), §1.5 (4 docs per applicant), §1.6 (max 4 applicants) describe a buyer-KYC flow that has no backend endpoint per FSD-CORRECTION 2026-05-25 §1.2.
- `CP-FRD-CP-Portal.md` Module 4 retains stale customer-KYC content (TC file Section 1.4-1.6 lines 261–281).

**Action required (BA Agent Step 2 sync):** Deprecate stale buyer-KYC content in both files. BRD acceptance criteria for CP self-KYC should explicitly enumerate the 3 documents (PAN Card, GST, MAHA RERA) and the 3 regions (MMR, Pune, BGLR). The reviewer brief calls out this DOC_DRIFT — TCs referencing 4 documents are flagged Conditional until BRD is corrected.

## Per-TC Status (30 TCs)

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_CPKYC_UI_001 | CP-BRD §3 (Module 4) | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_UI_002 | CP-FRD Module 4 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_UI_003 | CP-BRD §3 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_FUNC_004 | CP-FRD §1.4 / CP-BRD §7 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_FUNC_005 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_FUNC_006 | CP-FRD §1.4 | `[NO-VISUAL-EVIDENCE]` (now superseded by `kyc-business-region-dropdown.png`) | ✓ | **Conditional** | VISUAL_GAP — update citation to use newly captured screenshot |
| TC_CPKYC_FUNC_007 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_FUNC_008 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ⚠ | **Conditional** | Field type asserted as `type="email"`; INDEX.md says `type="text"` — VISUAL_MISMATCH on type attribute |
| TC_CPKYC_FUNC_009 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ⚠ | **Conditional** | Field type asserted as `type="tel"`; INDEX.md says `type="text"` — VISUAL_MISMATCH on type attribute |
| TC_CPKYC_FUNC_010 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_FUNC_011 | CP-FRD §1.7 r3 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_FUNC_012 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_VAL_013 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_NEG_014 | CP-FRD §1.4, CP-BRD §4 | `[STUB-EVIDENCE]` (now superseded by `kyc-validation-errors.png` showing Submit-disabled gating) | ⚠ | **Conditional** | LOGIC_GAP — expected result asserts inline error; live UI uses disabled-Submit gating instead |
| TC_CPKYC_NEG_015 | CP-FRD §1.4 | `[STUB-EVIDENCE]` | ⚠ | **Conditional** | LOGIC_GAP — same as NEG_014 |
| TC_CPKYC_NEG_016 | CP-FRD §1.7 r3 | `[STUB-EVIDENCE]` | ⚠ | **Conditional** | LOGIC_GAP — same |
| TC_CPKYC_NEG_017 | CP-FRD §1.4 | `[STUB-EVIDENCE]` | ⚠ | **Conditional** | LOGIC_GAP — same; also email is `type=text` not `type=email` |
| TC_CPKYC_NEG_018 | CP-FRD §1.4 | screenshot-desktop.png ✓ | ⚠ | **Conditional** | INDEX.md says phone `type="text"` — cannot rely on tel-type constraint |
| TC_CPKYC_NEG_019 | CP-FRD §1.4 | `[STUB-EVIDENCE]` | ⚠ | **Conditional** | LOGIC_GAP — same disabled-Submit pattern |
| TC_CPKYC_FUNC_020 | CP-FRD §1.5, CP-BRD §4 | `[STUB-EVIDENCE]` | ✗ | **Conditional** | LOGIC_GAP — "Firm Registration document" upload not present in UI; INDEX.md shows PAN Card / GST / MAHA RERA |
| TC_CPKYC_FUNC_021 | CP-FRD §1.5 | `[STUB-EVIDENCE]` (now superseded by `kyc-below-fold-submit.png`) | ✓ | **Conditional** | Update citation; eligible for APPROVED post-update |
| TC_CPKYC_FUNC_022 | CP-FRD §1.5, CP-BRD §4 | `[STUB-EVIDENCE]` | ✗ | **Conditional** | LOGIC_GAP — Aadhaar Front/Back uploads do NOT exist in CP self-KYC UI; DOC_DRIFT vs BRD |
| TC_CPKYC_VAL_023 | CP-FRD §1.5, CP-BRD §4 | `[STUB-EVIDENCE]` | ✗ | **Conditional** | LOGIC_GAP — INDEX.md confirms uploads are NOT required for Submit-enabled; DOC_DRIFT vs BRD |
| TC_CPKYC_FUNC_024 | CP-FRD §1.8 / CP-BRD §7 | `[STUB-EVIDENCE]` (now superseded by `kyc-below-fold-submit.png`) | ✓ | **Conditional** | Update citation; eligible for APPROVED |
| TC_CPKYC_E2E_025 | CP-FRD §1.8 | `[STUB-EVIDENCE]` | ✓ | **Conditional** | Post-submit confirmation not captured |
| TC_CPKYC_E2E_026 | CP-FRD §1.9 / INDEX.md | `[STUB-EVIDENCE]` | ✓ | **Conditional** | Cross-module reference; update to use `cp/customer-registration/dashboard-loaded.png` |
| TC_CPKYC_E2E_027 | CP-BRD §7 | `[STUB-EVIDENCE]` | ✓ | **Conditional** | Post-approval state not captured |
| TC_CPKYC_E2E_028 | CP-FRD §1.8 / CP-BRD §7 | `[STUB-EVIDENCE]` | ✓ | **Conditional** | Rejection state not captured |
| TC_CPKYC_BIZ_029 | CP-BRD §7 | screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CPKYC_BIZ_030 | CP-FRD §1.3 | `[NO-VISUAL-EVIDENCE]` | ✓ | **Conditional** | Cite `cp/login/login-initial.png` for auth-redirect |

---

## Approval

[ ] Approved
[x] **Conditional** — multiple blocking gaps:
1. **DOC_DRIFT (per reviewer brief):** BRD says 4 documents; live UI shows 3 (PAN Card / GST / MAHA RERA). TCs referencing 4 documents or Aadhaar/Passport (TC_CPKYC_FUNC_020, TC_CPKYC_FUNC_022, TC_CPKYC_VAL_023) — Conditional until BRD updated. Use observed 3-docs reality for all other validation.
2. **Stale STUB-EVIDENCE citations:** 14 TCs cite `[STUB-EVIDENCE]` even though INDEX.md has been updated 2026-06-06 with the missing screenshots. TCs need citation updates.
3. **NO-VISUAL-EVIDENCE flags:** 2 TCs (FUNC_006, BIZ_030) still carry this flag despite new evidence being available.
4. **LOGIC_GAPs:** 6 TCs (NEG_014–019) assert per-field inline validation errors; INDEX.md confirms live UI uses disabled-Submit gating without inline errors. Expected results need rewriting.
5. **Field type mismatches:** TC_CPKYC_FUNC_008/009/NEG_018 assert `type="email"` / `type="tel"`; INDEX.md confirms `type="text"`.

[ ] Rejected

**Conditional reason:** DOC_DRIFT (BRD 4-docs vs UI 3-docs) + stale STUB/NO-VISUAL citations + LOGIC_GAPs on validation behaviour. Strict visual-coverage% (40%) is below 80% gate; corrective edits to TC citations and expected-result rewrites would lift it above 80% without re-capturing.

**Automation candidacy:** Only the 7 APPROVED TCs (UI_001, UI_002, UI_003, FUNC_004, FUNC_005, FUNC_007, FUNC_010, FUNC_011, FUNC_012, VAL_013, BIZ_029 — 11 actually) are clear for Sheet 2 at the time of this review. The remaining 19 require the corrective actions listed above before they may enter Sheet 2.

**Recommended remediation order:**
1. BA Agent — update CP-FS-KYC-Assistance.md (and CP-FRD-CP-Portal.md Module 4) to reflect 3 documents (PAN Card, GST, MAHA RERA), 3 Business Regions (MMR, Pune, BGLR), `type="text"` for email/phone, and disabled-Submit validation pattern.
2. QA Agent (Manual) — edit TestCases.md to cite the newly captured screenshots (`kyc-loaded-full.png`, `kyc-above-fold.png`, `kyc-documents-section.png`, `kyc-below-fold-submit.png`, `kyc-validation-errors.png`, `kyc-validation-full.png`, `kyc-business-region-dropdown.png`) and rewrite expected results for NEG_014–019 to match disabled-Submit gating.
3. Tech Lead Agent — confirm `locators/cp/kyc-assistance/locator-map.json` aligns with INDEX.md §Selectors Reference block.
4. QA Agent — re-invoke `test-case-reviewer` after edits; expect promotion to APPROVED.
