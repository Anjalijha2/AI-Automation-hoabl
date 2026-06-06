# Test Case Review Report — KYC Assistance — CP Portal — 2026-06-07 (Re-Review)

**Reviewer:** QA Agent (`test-case-reviewer` workflow)
**TC File:** `manual-qa-repository/01-test-cases/cp/kyc-assistance/TestCases.md`
**Visual Memory:** `visual-memory/cp/kyc-assistance/INDEX.md` (CAPTURE_STATUS: FULL — 8 screenshots, refreshed 2026-06-06)
**BRD/FRD:** `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md` (BRD-corrected 2026-06-07 — DOC_DRIFT-CP-KYC-001/002/003 closed)
**Prior review:** 2026-06-06 — Conditional (multiple gaps). See History section below.
**BA Agent fix log:** `manual-qa-repository/01-test-cases/cp/kyc-assistance/doc-change-summary.md`

---

## Trigger for Re-Review

BA Agent applied three FRD corrections on 2026-06-07:
1. **DOC_DRIFT-CP-KYC-001** — 4 documents → 3 documents (PAN Card / GST Certificate / MAHA RERA Certificate)
2. **DOC_DRIFT-CP-KYC-002** — Business Region options added (MMR / Pune / BGLR)
3. **DOC_DRIFT-CP-KYC-003** — validation pattern corrected from click-validation/inline-errors to disabled-Submit gating

The BRD now matches the live UI captured 2026-06-06.

**Critical scope rule (reviewer scope = validate, not rewrite):** The BA Agent did NOT edit `TestCases.md`. The TCs still reflect the pre-correction BRD (4 docs, Aadhaar uploads, inline-error assertions, `type=email`/`type=tel`). Where TC text still contradicts the corrected BRD or live UI, the TC is flagged **NEEDS BA REGEN** rather than silently auto-fixed.

---

## Summary

| Metric | Value | Δ vs 2026-06-06 |
|---|---|---|
| Total TCs reviewed | 30 | — |
| Approved | 11 | +4 |
| Conditional (citation refresh only, no logic issue) | 4 | -17 |
| Needs BA Agent regen (stale post-correction) | 11 | NEW category |
| Still no evidence (capture gap) | 4 | from prior Conditional bucket |
| Rejected | 0 | — |
| BRD/FRD coverage (requirement IDs present) | 100% (30/30) | — |
| Visual evidence — FULL (TC cites real INDEX.md file) | **40% (12/30)** | unchanged at TC-citation level |
| Visual evidence — addressable now (INDEX has the file, TC just needs citation refresh) | 73% (22/30) | +33% — new screenshots cover most blockers |
| Visual evidence — uncapturable until product workflow exercised | 13% (4/30 — post-submit / admin lifecycle) | unchanged |
| LOGIC_GAPs flagged | 11 | -2 (some collapsed under BA-regen flag) |
| VISUAL_MISMATCH flagged | 2 (FUNC_008/009 type attr) | -1 (NEG_018 folded into BA-regen) |
| STUB-EVIDENCE remaining in TC text | 14 | unchanged — TCs not edited |
| NO-VISUAL-EVIDENCE remaining in TC text | 2 | unchanged — TCs not edited |
| Orphan TCs (no BRD/FRD ref) | 0 | — |

**Visual % vs prior 40%:** Strict TC-citation visual coverage is still 40% because `TestCases.md` has not been edited. However, INDEX.md now contains evidence files that would resolve 22 of 30 TCs (73%) on a simple citation refresh by BA Agent. The 80% strict-citation gate for automation candidacy is still NOT cleared — it remains blocked on the TC text update, not on missing visual artefacts.

---

## DOC_DRIFT Status (post-correction)

| DOC_DRIFT | Prior Status | BRD Status (2026-06-07) | TC Status |
|---|---|---|---|
| 001 — 4 docs vs 3 docs | OPEN | **CLOSED** in FRD §1.5/§1.6/§1.7-3 (now states 3: PAN Card / GST / MAHA RERA) | TCs **still reference** 4 docs / Aadhaar — flagged for BA regen |
| 002 — Business Region options | OPEN | **CLOSED** in FRD §1.4 + Step 2 (MMR / Pune / BGLR) | One TC (FUNC_006) needs citation refresh; no new positive-case TCs exist for the 3 regions — flagged as **TC GAP** |
| 003 — click-validation vs disabled-Submit | OPEN | **CLOSED** in FRD §1.7-5 + Step 5 (disabled-Submit, no inline errors) | 6 TCs (NEG_014–019) **still assert** inline errors — flagged for BA regen |

---

## Per-TC Validation Results (30 TCs)

Validation gates applied per TC: (1) BRD/FRD requirement ID present; (2) visual evidence file cited exists in INDEX.md Screens table; (3) Steps reference selectors from INDEX.md Key Structural Notes; (4) Expected Results match corrected BRD; (5) No LOGIC_GAP / VISUAL_MISMATCH / NO-VISUAL-EVIDENCE / STUB-EVIDENCE residual.

| TC_ID | Req ID | Gate 1 | Gate 2 (citation valid?) | Gate 3 (selector OK?) | Gate 4 (matches corrected BRD?) | Gate 5 (no stale flag?) | Outcome |
|---|---|---|---|---|---|---|---|
| TC_CPKYC_UI_001 | CP-BRD §3 / FRD §1.4 | ✓ | ✓ `screenshot-desktop.png` | ✓ heading selector valid | ✓ | ✓ | **APPROVED** |
| TC_CPKYC_UI_002 | CP-FRD Module 4 / FS §1.4 | ✓ | ✓ `screenshot-desktop.png` | ✓ 3 section headers in INDEX.md | ✓ (matches 4-section structure if KYC Document Upload is treated as separate) | ⚠ TC asserts 3 sections; INDEX shows 4 (Firm/Contact/Additional + KYC Document Upload) | **APPROVED** (TC is valid for above-fold view; KYC Document Upload header is below fold and could be a separate TC — informational only) |
| TC_CPKYC_UI_003 | CP-BRD §3 | ✓ | ✓ `screenshot-desktop.png` | ✓ sidebar in INDEX.md (Home/KYC/JBP/Leads/Logout) | ✓ | ✓ | **APPROVED** |
| TC_CPKYC_FUNC_004 | CP-FRD §1.4 | ✓ | ✓ | ✓ `orgName`, `address` selectors in INDEX | ✓ | ✓ | **APPROVED** |
| TC_CPKYC_FUNC_005 | CP-FRD §1.4 | ✓ | ✓ | ✓ `.ant-select` Business Region selector valid | ✓ asterisk + required matches BRD | ✓ | **APPROVED** |
| TC_CPKYC_FUNC_006 | CP-FRD §1.4 | ✓ | ✗ cites `[NO-VISUAL-EVIDENCE]` — INDEX.md now has `kyc-business-region-dropdown.png` showing MMR/Pune/BGLR | ✓ | ⚠ TC expected result is generic ("displays a list of region options") — corrected BRD specifies the 3 regions | ✗ stale `[NO-VISUAL-EVIDENCE]` | **CONDITIONAL — citation refresh** (suggest BA Agent also expand to one TC per region MMR/Pune/BGLR for positive coverage) |
| TC_CPKYC_FUNC_007 | CP-FRD §1.4 | ✓ | ✓ | ✓ `ownerName` selector valid | ✓ | ✓ | **APPROVED** |
| TC_CPKYC_FUNC_008 | CP-FRD §1.4 | ✓ | ✓ image | ✓ `email` selector valid | ✗ TC asserts `type="email"` — INDEX.md §Contact Details verified `type=text` | ✗ VISUAL_MISMATCH on field type | **NEEDS BA REGEN** |
| TC_CPKYC_FUNC_009 | CP-FRD §1.4 | ✓ | ✓ image | ✓ `phone` selector valid | ✗ TC asserts `type="tel"` — INDEX.md verified `type=text` | ✗ VISUAL_MISMATCH on field type | **NEEDS BA REGEN** |
| TC_CPKYC_FUNC_010 | CP-FRD §1.4 | ✓ | ✓ | ✓ `officePincode` selector valid | ✓ | ✓ | **APPROVED** |
| TC_CPKYC_FUNC_011 | CP-FRD §1.7 r1 | ✓ | ✓ | ✓ `panNumber` selector valid | ✓ format ABCDE1234F matches corrected BRD | ✓ | **APPROVED** |
| TC_CPKYC_FUNC_012 | CP-FRD §1.4 | ✓ | ✓ | ✓ `reraNumber` selector valid | ✓ optional + no asterisk matches corrected BRD | ✓ | **APPROVED** |
| TC_CPKYC_VAL_013 | CP-FRD §1.4 | ✓ | ✓ | ✓ all 9 fields enumerated in INDEX.md | ⚠ TC enumerates 8 required (matches corrected BRD's 8-field required set: orgName, address, Business Region, ownerName, email, phone, officePincode, panNumber). RERA optional. | ✓ | **APPROVED** |
| TC_CPKYC_NEG_014 | CP-FRD §1.4 / CP-BRD §4 #9 | ✓ | ✗ cites `[STUB-EVIDENCE]` — INDEX.md now has `kyc-validation-errors.png` + `kyc-validation-full.png` proving disabled-Submit | ⚠ uses generic submit click | ✗ TC asserts "inline error appears under Business Region field". Corrected BRD §1.7-5: Submit stays `disabled=true`; click is no-op; **no inline errors render**. | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_NEG_015 | CP-FRD §1.4 | ✓ | ✗ STUB-EVIDENCE | ⚠ | ✗ same — asserts "Firm Name is required" inline error; live UI has no inline error | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_NEG_016 | CP-FRD §1.7 r1 | ✓ | ✗ STUB-EVIDENCE | ⚠ | ✗ asserts "PAN must be in format ABCDE1234F" inline error; corrected BRD §1.7-5 has no click-triggered validation error display | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_NEG_017 | CP-FRD §1.4 | ✓ | ✗ STUB-EVIDENCE | ⚠ | ✗ asserts inline email validation error; email is `type=text` (no native browser validation) + no app-level inline error | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_NEG_018 | CP-FRD §1.4 | ✓ | ✓ image | ⚠ | ✗ asserts "type=tel constraints reject non-numeric"; INDEX confirms `type=text` — no native browser constraint exists | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_NEG_019 | CP-FRD §1.4 | ✓ | ✗ STUB-EVIDENCE | ⚠ | ✗ asserts "Pin Code must be 6 digits" inline error; no inline errors in live UI | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_FUNC_020 | CP-FRD §1.5 | ✓ | ✗ STUB-EVIDENCE | ✗ "Firm Registration document" upload not in INDEX.md selectors (uploads are PAN Card / GST / MAHA RERA) | ✗ corrected BRD §1.5 lists 3 docs: PAN Card / GST Certificate / MAHA RERA Certificate — no "Firm Registration" doc | ✗ LOGIC_GAP | **NEEDS BA REGEN** |
| TC_CPKYC_FUNC_021 | CP-FRD §1.5 | ✓ | ✗ STUB-EVIDENCE — INDEX has `kyc-below-fold-submit.png` proving PAN Card upload | ✓ `panCardUpload` selector in INDEX | ✓ TC asserts PAN Card upload presence — matches corrected BRD | ✗ STUB citation | **CONDITIONAL — citation refresh** |
| TC_CPKYC_FUNC_022 | CP-FRD §1.5 | ✓ | ✗ STUB-EVIDENCE | ✗ Aadhaar Front/Back not in INDEX.md (uploads are PAN Card / GST / MAHA RERA only) | ✗ corrected BRD §1.5 has no Aadhaar — DOC_DRIFT-001 was specifically the removal of Aadhaar/Passport | ✗ LOGIC_GAP | **NEEDS BA REGEN** (replace with GST + MAHA RERA presence TCs) |
| TC_CPKYC_VAL_023 | CP-FRD §1.5 / §1.7 | ✓ | ✗ STUB-EVIDENCE | ⚠ | ✗ asserts "form rejects submission with error indicating all mandatory documents required"; INDEX.md §Validation Behaviour confirms doc uploads are NOT required to enable Submit at UI gating layer (text fields alone enable it); corrected BRD §1.5 notes "Document uploads are NOT required to enable Submit at the UI gating layer (verified 2026-06-06)" | ✗ LOGIC_GAP | **NEEDS BA REGEN** (or convert to backend-API TC if backend enforcement is product intent — pending product clarification flagged in BRD §1.5) |
| TC_CPKYC_FUNC_024 | CP-FRD §1.8 | ✓ | ✗ STUB-EVIDENCE — INDEX has `kyc-below-fold-submit.png` proving Submit at footer | ✓ `submitBtn` selector valid | ⚠ TC asserts "button is enabled when form is valid" — directionally matches BRD but conflates two checks (visibility + enable-on-valid); could be split | ✗ STUB citation | **CONDITIONAL — citation refresh** (consider splitting visibility check from enable-on-valid check) |
| TC_CPKYC_E2E_025 | CP-FRD §1.8 | ✓ | ✗ STUB-EVIDENCE — post-submit confirmation NOT in INDEX.md | ⚠ multi-system assertions (Azure, LSQ, KYC PDF) need DB/API specs | ✓ logic matches corrected BRD §1.8 system actions | ✗ no visual evidence | **CONDITIONAL — capture gap** (post-submit screen) |
| TC_CPKYC_E2E_026 | CP-FRD §1.9 | ✓ | ✗ STUB-EVIDENCE — INDEX §KYC Status Indicator notes badge is on `/dashboard`, cross-module to `visual-memory/cp/customer-registration/` | ✓ | ✓ matches INDEX.md §KYC Status Indicator | ✗ STUB citation | **CONDITIONAL — citation refresh** (point at cp/customer-registration evidence) |
| TC_CPKYC_E2E_027 | CP-BRD §7 | ✓ | ✗ STUB-EVIDENCE — post-approval state not captured | ⚠ | ✓ matches BRD | ✗ no visual evidence | **CONDITIONAL — capture gap** |
| TC_CPKYC_E2E_028 | CP-FRD §1.8 | ✓ | ✗ STUB-EVIDENCE — rejection state not captured | ⚠ | ✓ matches BRD intent | ✗ no visual evidence | **CONDITIONAL — capture gap** |
| TC_CPKYC_BIZ_029 | CP-BRD §7 | ✓ | ✓ `screenshot-desktop.png` (pre-fill baseline) | ✓ | ✓ INDEX.md §Pre-fill Behaviour confirms; corrected BRD agrees | ✓ | **APPROVED** |
| TC_CPKYC_BIZ_030 | CP-FRD §1.3 | ✓ | ✗ NO-VISUAL-EVIDENCE — cp/login `login-initial.png` reusable | ✓ | ✓ matches corrected BRD §1.3 | ✗ NO-VISUAL citation | **CONDITIONAL — citation refresh** |

### Outcome Tallies

| Outcome | Count | TC IDs |
|---|---|---|
| **APPROVED** (passes all 5 gates) | 11 | UI_001, UI_002, UI_003, FUNC_004, FUNC_005, FUNC_007, FUNC_010, FUNC_011, FUNC_012, VAL_013, BIZ_029 |
| **CONDITIONAL — citation refresh** (logic OK, citation stale, evidence exists in INDEX.md) | 4 | FUNC_006, FUNC_021, FUNC_024, E2E_026, BIZ_030 *(5 actually — see note below)* |
| **CONDITIONAL — capture gap** (evidence not in INDEX.md yet) | 3 | E2E_025, E2E_027, E2E_028 |
| **NEEDS BA AGENT REGEN** (logic gap or VISUAL_MISMATCH against corrected BRD — DO NOT auto-approve) | 11 | FUNC_008, FUNC_009, NEG_014, NEG_015, NEG_016, NEG_017, NEG_018, NEG_019, FUNC_020, FUNC_022, VAL_023 |
| **REJECTED** | 0 | — |
| **TOTAL** | 30 (note: Conditional groups overlap to 8 — corrected below) | |

*Correction:* the two Conditional groups together total **8 TCs**: FUNC_006, FUNC_021, FUNC_024, E2E_025, E2E_026, E2E_027, E2E_028, BIZ_030. Final reconciled totals → **Approved 11 / Conditional 8 / Needs BA Regen 11 / Rejected 0 = 30**.

---

## TC IDs Requiring BA Agent Regeneration

Per the reviewer brief: *"If TCs themselves still have stale references (e.g., still cite 4 documents, still test click-validation), DO NOT silently auto-fix — flag them for BA Agent regen instead."*

The following **11 TCs must be regenerated by BA Agent** to align with the corrected BRD before they can clear the reviewer gates:

| TC_ID | Stale Premise (pre-correction BRD) | Required Regen Direction (post-correction BRD) |
|---|---|---|
| TC_CPKYC_FUNC_008 | Asserts `type="email"` on Email ID input | Re-baseline against INDEX.md verified `type="text"`; drop the type-attribute assertion or rewrite as a field-presence + accepts-email-string TC |
| TC_CPKYC_FUNC_009 | Asserts `type="tel"` on Phone Number input | Re-baseline against INDEX.md verified `type="text"`; drop the type-attribute assertion |
| TC_CPKYC_NEG_014 | Submit-click triggers inline "Business Region is required" error | Rewrite Expected Result: Submit button is `disabled=true` while Business Region empty; click is no-op; no inline error rendered |
| TC_CPKYC_NEG_015 | Submit-click triggers inline "Firm Name is required" error | Same disabled-Submit gating rewrite |
| TC_CPKYC_NEG_016 | Submit-click triggers inline "PAN must be in format ABCDE1234F" error | Either rewrite to disabled-Submit gating, or convert to a backend-API validation TC if PAN format enforcement is server-side |
| TC_CPKYC_NEG_017 | Submit-click triggers inline email-format error | Disabled-Submit gating rewrite (note `type=text` so no browser-native validation either) |
| TC_CPKYC_NEG_018 | Phone Number `type=tel` rejects non-numeric input at field level | Rewrite to disabled-Submit gating OR to a value-pattern assertion only |
| TC_CPKYC_NEG_019 | Submit-click triggers inline "Pin Code must be 6 digits" error | Disabled-Submit gating rewrite |
| TC_CPKYC_FUNC_020 | Asserts "Firm Registration document" upload field present | Remove TC or rewrite to assert PAN Card upload (already covered by FUNC_021), GST upload, or MAHA RERA upload |
| TC_CPKYC_FUNC_022 | Asserts Aadhaar Front + Back upload fields present | Remove TC (Aadhaar is not in corrected BRD §1.5) or convert to a regression-negative TC that asserts Aadhaar uploads are NOT present (DOC_DRIFT-001 closure evidence) |
| TC_CPKYC_VAL_023 | Asserts "form rejects submission" when no documents uploaded | Rewrite Expected Result: Submit can be enabled with empty doc uploads (per INDEX.md §Submit button gating + corrected BRD §1.5). If product intent is to enforce documents, raise as PRODUCT BUG and keep TC as bug-tracker reference |

---

## TC GAPs to Add (new TCs needed per corrected BRD)

The corrected BRD introduces coverage gaps not yet represented in the TC set. BA Agent should add:

1. **Business Region positive coverage** — 3 TCs, one per option: MMR / Pune / BGLR — each verifying selection persists and updates the displayed value. Evidence: `kyc-business-region-dropdown.png`.
2. **Submit button enable transition** — TC asserting Submit transitions from `disabled=true` → enabled as the 8 required text fields are progressively filled. Evidence: combination of `kyc-loaded-full.png` (empty/disabled) + `kyc-below-fold-submit.png` (disabled state) — enabled state needs new capture once 8 fields filled.
3. **GST upload field presence** — analogous to FUNC_021 but for GST. Evidence: `kyc-below-fold-submit.png`.
4. **MAHA RERA upload field presence** — analogous to FUNC_021 but for MAHA RERA. Evidence: `kyc-below-fold-submit.png`.
5. **Section ordering full-page** — UI_002 currently asserts 3 sections; INDEX shows 4 (KYC Document Upload is a 4th). Add TC for the 4th section header presence. Evidence: `kyc-loaded-full.png`.

---

## Citation Refresh Map (BA Agent, low-risk edits)

These 5 TCs need only the Visual Evidence column updated — no logic change. They are CONDITIONAL until refreshed; would become APPROVED on edit alone:

| TC_ID | Current Citation | Target Citation in INDEX.md |
|---|---|---|
| TC_CPKYC_FUNC_006 | `[NO-VISUAL-EVIDENCE]` | `visual-memory/cp/kyc-assistance/kyc-business-region-dropdown.png` |
| TC_CPKYC_FUNC_021 | `[STUB-EVIDENCE] Below fold not captured` | `visual-memory/cp/kyc-assistance/kyc-below-fold-submit.png` |
| TC_CPKYC_FUNC_024 | `[STUB-EVIDENCE] Below fold not captured` | `visual-memory/cp/kyc-assistance/kyc-below-fold-submit.png` |
| TC_CPKYC_E2E_026 | `[STUB-EVIDENCE]` | `visual-memory/cp/customer-registration/dashboard-loaded.png` (cross-module per INDEX.md §KYC Status Indicator) |
| TC_CPKYC_BIZ_030 | `[NO-VISUAL-EVIDENCE]` | `visual-memory/cp/login/login-initial.png` (auth-redirect reused) |

---

## Capture Gaps (Tech Lead Agent — future visual-capture work)

Three TCs cannot resolve without exercising the live submission/admin workflow:

| TC_ID | Capture Needed |
|---|---|
| TC_CPKYC_E2E_025 | Post-submit confirmation/Thank You screen on a fresh CP account after a clean submission |
| TC_CPKYC_E2E_027 | `/dashboard` header state on a CP account whose KYC has been admin-approved (badge absent) |
| TC_CPKYC_E2E_028 | KYC form state on a CP account whose KYC has been admin-rejected (with prior data retained + editable) |

These are separate from BA-regen and from citation-refresh — they require new visual-memory captures before they can be promoted to APPROVED.

---

## Overall Status

[ ] Approved
[x] **CONDITIONAL** — 11 of 30 TCs (37%) need BA Agent regeneration due to stale pre-correction-BRD premises; 8 of 30 (27%) need either citation refresh or new captures. Only 11 (37%) are clear for Automation Sheet 2 today.
[ ] Rejected

**Strict TC-citation visual coverage:** 40% (12/30) — UNCHANGED vs prior review because TCs were not edited.
**Achievable visual coverage on citation refresh alone:** 73% (22/30).
**Visual coverage after BA regen + Tech Lead post-submit capture:** target 100%.

**80% automation-candidacy gate:** still NOT cleared. Will clear automatically once (a) BA Agent regenerates the 11 stale TCs and (b) BA Agent refreshes the 5 citation-only TCs.

---

## Recommended Remediation Order

1. **BA Agent** — regenerate the 11 stale TCs listed in *TC IDs Requiring BA Agent Regeneration*. New Expected Results must reference corrected BRD §1.5 (3 docs), §1.7-5 (disabled-Submit gating), §1.4 (verified `type=text` for email/phone, 8-required-field set, MMR/Pune/BGLR options).
2. **BA Agent** — add the 5 new TCs in *TC GAPs to Add* (3× Business Region positive, Submit enable transition, GST upload, MAHA RERA upload, KYC Document Upload section header).
3. **BA Agent** — refresh the 5 citations in *Citation Refresh Map* (no logic changes needed).
4. **Tech Lead Agent** — `visual-capture` for: (a) Submit-enabled state once 8 fields filled, (b) post-submit confirmation screen, (c) admin-approved CP dashboard, (d) admin-rejected re-editable form.
5. **QA Agent** — re-invoke `test-case-reviewer` after Steps 1–3. Expected promotion: 11 APPROVED → ~26 APPROVED (3 capture-gap TCs remain CONDITIONAL until Step 4).
6. **QA Agent** — scaffold POM + 6 spec types only after Step 5 clears (≥80% strict-citation visual coverage on APPROVED bucket).

---

## History

### 2026-06-06 — Initial Review (Conditional)
Conditional with 5 blocking issues:
1. DOC_DRIFT — BRD said 4 docs, UI shows 3 — **CLOSED** in BA fix 2026-06-07.
2. 14 stale STUB-EVIDENCE citations — **PARTIALLY ADDRESSABLE**: 9 of the 14 can resolve to real screenshots now in INDEX.md (`kyc-loaded-full.png`, `kyc-below-fold-submit.png`, `kyc-business-region-dropdown.png`, `kyc-validation-errors.png`, etc.). The other 5 (E2E_025/027/028 + post-submit states) remain capture-gaps. **TC TEXT UNCHANGED** — flagged for BA Agent.
3. 6 LOGIC_GAPs on NEG_014–019 — **CONFIRMED STILL PRESENT** in TC text; corrected BRD §1.7-5 explicitly documents disabled-Submit gating. TCs need rewrite by BA Agent.
4. 3 field-type mismatches (FUNC_008/009/NEG_018) — **CONFIRMED STILL PRESENT** in TC text; INDEX.md verifies `type=text`. Flagged for BA Agent.
5. NO-VISUAL-EVIDENCE on FUNC_006 (Business Region dropdown) — **EVIDENCE NOW EXISTS** (`kyc-business-region-dropdown.png`). Citation refresh only.

### 2026-06-07 — Re-Review (this report)
Outcome: 11 APPROVED / 8 CONDITIONAL / 11 NEEDS BA REGEN / 0 REJECTED.
Strict visual % unchanged at 40% (because TCs not edited); addressable post-refresh visual % is 73%.
