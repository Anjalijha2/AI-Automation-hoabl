# Coverage Matrix — CP Portal / KYC Assistance

**Module:** Channel Partner → KYC Assistance (CP firm-level self-KYC)
**Master JSON:** `manual-qa-repository/07-execution/_master-json/CP-KYCAssistance.json`
**Sheet:** `KYC Assistance - Master` (replaces `KYC Assistance` + `KYC Assistance (Exec)`)
**Sources (dual-source gate — both present):** `visual-memory/cp/kyc-assistance/INDEX.md` (CAPTURE_STATUS: FULL) · `CP-FS-KYC-Assistance.md` + `CP-BRD-CP-Portal.md` + `CP-FRD-CP-Portal.md`
**Total TCs:** 79 (70 preserved + 9 new) · **[TEST_DATA_REQUIRED]:** 26 · **Deprecated/superseded (preserved):** 17

---

## Feature × 11-Dimension Matrix

Legend: TC IDs listed where covered · `—` = N/A (with reason) · `[VWD]` = covered but flagged [VERIFY WITH DEV]

| Feature \ Dimension | 1 Positive | 2 Full-form | 3 Mandatory/Validation | 4 Submit re-check | 5 Negative/Error | 6 Context-sensitive | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth/Security | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Page load & navigation | CP_KYC_001, UI_001, UI_003 | — | — | — | — | — | — | — | CP_KYC_004, BIZ_030 | — | — |
| Form structure / sections | UI_002, CP_KYC_006[VWD] | VAL_013 | VAL_013 | — | — | — | — | — | — | — | FUNC_025 (scroll/fold) |
| Firm Details | FUNC_004 | FUNC_004, FUNC_005, FUNC_006 | FUNC_005 | — | — | — | — | — | — | — | FUNC_026 (exactly MMR/Pune/BGLR) |
| Contact Details | FUNC_007, FUNC_008, FUNC_009 | FUNC_007/008/009 | VAL_013 | — | NEG_017[VWD], NEG_018[VWD] | — | — | FUNC_008/009 (type=text not email/tel)[VWD] | — | — | — |
| Additional Details | FUNC_010, FUNC_011, FUNC_012, CP_KYC_008 | FUNC_010/011/012 | FUNC_011, VAL_013 | — | CP_KYC_007[VWD], NEG_016[VWD], NEG_019[VWD] | — | — | — | — | — | NEG_019 (pincode len not client-enforced)[VWD] |
| KYC Document Upload | FUNC_021, FUNC_020, FUNC_022, CP_KYC_015, CP_KYC_016 | FUNC_020/021/022 (3 slots) | VAL_023 (docs NOT gating) | — | CP_KYC_019[VWD], CP_KYC_020[VWD], CP_KYC_021[VWD] | — | — | API_001 (no accept attr → server-only) | — | — | CP_KYC_019/020 (type/size — no client cap)[VWD] |
| Submit gating | FUNC_023, VAL_024 | FUNC_023 | NEG_014, NEG_015, NEG_016[VWD], NEG_017[VWD], NEG_019[VWD], NEG_021 | FUNC_023 (8-field enable), VAL_023 (docs not required) | NEG_020 (no inline error styling) | — | — | VAL_023 (UI enables zero-doc; backend?)[VWD] | — | — | NEG_021 (partial fill) |
| Cancel & submission outcome | CP_KYC_028, E2E_025, FUNC_027 | — | — | CP_KYC_028 | CP_KYC_030[VWD] | CP_KYC_030 (post-submit state)[VWD] | — | — | — | E2E_025 (Azure Blob + LSQ + PDF, FS 1.8) | — |
| KYC status & E2E journey | E2E_026, E2E_027, E2E_028, BIZ_029 | — | — | E2E_028 (re-edit/resubmit) | E2E_028 (rejection path)[VWD] | E2E_026/027 (in-review badge appears/clears) | — | — | — | E2E_026/027 (admin-approval cross-flow) | — |
| Notifications | — | — | — | — | — | — | CP_KYC_029[VWD], CP_KYC_036, API_002 (BUG-CPK-03) | — | — | CP_KYC_036 (WhatsApp suppressed on kyc:true) | — |
| API & backend | CP_KYC_031, CP_KYC_035 | — | CP_KYC_032 (NULL prospectId → 400) | CP_KYC_038 (no rollback), CP_KYC_040 (pincode 500) | CP_KYC_032, CP_KYC_037 (panDoc null BUG), CP_KYC_038, CP_KYC_040 | — | API_002 | API_001, API_002 | CP_KYC_031 (auth read) | CP_KYC_031 (LSQ), CP_KYC_038 (LSQ), CP_KYC_040 (Mavis pincode) | — |
| Security gaps | — | — | — | — | — | — | — | — | CP_KYC_033 (UNAUTH POST), CP_KYC_034 (priv-esc CP-A→CP-B), CP_KYC_039 (JWT rotation) | — | — |
| Deprecated buyer-KYC (preserved) | CP_KYC_002/003/005 | CP_KYC_006/013/014/022/025 | CP_KYC_009/010/011/012/026/027 | CP_KYC_026/027 | CP_KYC_009/010/011 | CP_KYC_002/003 (WINNER gate) | — | — | — | — | CP_KYC_023 (max 4) |

---

## Dimension Self-Check (live CP firm self-KYC model)

| # | Dimension | Status | Key TC(s) |
|---|---|---|---|
| 1 | Positive / happy path | Covered | CP_KYC_001, FUNC_023, CP_KYC_028, E2E_025 |
| 2 | Full-form coverage (every field/control) | Covered | FUNC_004–012 (9 fields), FUNC_020/021/022 (3 docs), FUNC_024/027 (Cancel/Submit), FUNC_026 (region options) |
| 3 | Mandatory-field & validation | Covered | VAL_013, NEG_014/015, FUNC_005, FUNC_011 |
| 4 | Submit-time re-check / gating | Covered | FUNC_023 (disabled-button enable), VAL_023/024, CP_KYC_038/040 (server re-check) |
| 5 | Negative / error handling | Covered | NEG_016–021, CP_KYC_019/020/032/037/038/040 |
| 6 | Context-sensitive controls | Covered (limited) | E2E_026/027 (in-review badge state), CP_KYC_030 (post-submit form state)[VWD] |
| 7 | Notifications (incl. silence) | Covered | CP_KYC_029[VWD], CP_KYC_036 (silent on kyc:true), API_002 (BUG-CPK-03) |
| 8 | UI-vs-backend validation split | Covered | API_001 (no accept attr), VAL_023 (UI enables zero-doc), FUNC_008/009 (type=text) |
| 9 | Role / auth / security | Covered | CP_KYC_004/BIZ_030 (route guard), CP_KYC_033 (UNAUTH), CP_KYC_034 (priv-esc), CP_KYC_039 (JWT) |
| 10 | Integration / cross-module | Covered | E2E_025 (Azure Blob/LSQ/PDF), CP_KYC_031/038 (LSQ), CP_KYC_040 (Mavis), E2E_026/027 (admin approval) |
| 11 | Boundary | Covered (limited) | FUNC_026 (exactly 3 region options), CP_KYC_019/020 (file type/size — no client cap), NEG_019/021 |

No dimension left without a TC or a justified N/A.

---

## New TC IDs (9) — continue series, never renumbered

| TC_ID | Sub-Module | Why added (gap closed) |
|---|---|---|
| TC_CPKYC_FUNC_023 | Submit Gating & Validation | Happy-path disabled-button gating (8-field enable) — the core verified UX had no positive TC. |
| TC_CPKYC_FUNC_025 | Form Structure & Static Content | Above/below-fold scroll layout (scrollHeight ~1589px). |
| TC_CPKYC_FUNC_026 | Firm Details | Business Region lists EXACTLY MMR/Pune/BGLR (boundary on option set; DOC_DRIFT-002). |
| TC_CPKYC_FUNC_027 | Cancel & Submission Outcome | Cancel button abandons form (footer control had no TC). |
| TC_CPKYC_NEG_020 | Submit Gating & Validation | No inline error styling on Submit click (disabled-button gating; DOC_DRIFT-003). |
| TC_CPKYC_NEG_021 | Submit Gating & Validation | Partial-fill keeps Submit disabled. |
| TC_CPKYC_VAL_024 | Submit Gating & Validation | Well-formed PAN contributes to enabling Submit (non-mutating). |
| TC_CPKYC_API_001 | API & Security | UI-vs-backend split: file inputs have no `accept`/MIME cap (server-only enforcement). |
| TC_CPKYC_API_002 | API & Security | kyc:false first-submit notification + BUG-CPK-03 ('91<phone>' missing '+'). |

---

## Flags

### DOC_DRIFT (live UI vs BRD — FS wins; observed values used)
- **DOC_DRIFT-CP-KYC-001** — BRD §3 Rule 9 / §7 still say "4 KYC documents (Photo/PAN/Aadhaar F+B), co-applicants (max 4), WINNER prerequisite". Live UI + FS = 3 firm docs (PAN Card/GST/MAHA RERA), no co-applicants, no WINNER gate, CP firm self-KYC. FS file already carries the FSD-CORRECTION and wins. 17 legacy TCs preserved under "Deprecated Buyer-KYC Model (superseded)" and flagged; not executed against the live form.
- **DOC_DRIFT-CP-KYC-002** — Business Region options (MMR/Pune/BGLR) enumerated from live capture; older spec did not list them. Recorded in FS 1.4.
- **DOC_DRIFT-CP-KYC-003** — Submission gated by disabled-Submit button, NOT by click-time inline field errors. Legacy TCs asserting inline "X is required" errors flagged [VERIFY WITH DEV] (NEG_014/015/016/017/019, CP_KYC_007/012/026/027).

### [VERIFY WITH DEV] open items
- Whether ANY inline field-error is rendered (vs disabled-button only): NEG_014/015/016/017/019, CP_KYC_007.
- Email field is type=text (not email) and Phone is type=text (not tel) — native format/numeric enforcement is absent; confirm form-logic enforcement (FUNC_008/009, NEG_017/018).
- Backend enforcement of mandatory documents when UI enables zero-doc submit (VAL_023, CP_KYC_026).
- Pincode length enforcement (FS says NOT client-enforced) (NEG_019, CP_KYC_012).
- Post-submit form state — read-only vs editable for re-upload (CP_KYC_030).
- Customer-notification channel and rejection-reason UI surfacing (CP_KYC_029, E2E_028).
- Pre-fill is non-deterministic (empty for same CP on a later capture) — confirm GET /cp/kyc before trusting exact pre-filled values (FUNC_004/007/010/011, BIZ_029).

### Documented backend defects / security gaps (assert as documented, do NOT re-log)
- KB-CPK-02: POST /cp/registration UNAUTHENTICATED (CP_KYC_033).
- KB-CPK-09: privilege escalation via req.body.phone (CP_KYC_034).
- KB-CPK-07: panDoc filename keyword ('pan card' vs 'pan') returns null (CP_KYC_037).
- KB-CPK-08: no rollback on partial document-upload failure (CP_KYC_038).
- BR-CPK-03/KB-CPK-10: NULL prospectId → generic 400 (CP_KYC_032).
- QA-Risk-7: unconditional pincode fetch 500s a re-upload (CP_KYC_040).
- QA-Risk-12: JWT minted on every successful registration (CP_KYC_039).
- BUG-CPK-03: success_registercp WhatsApp renders '91<phone>' missing '+' (CP_KYC_036, API_002).

### Mutation-authorisation gate
26 TCs carry [TEST_DATA_REQUIRED]. All submit/upload/approve TCs (CP_KYC_028/035/036/038/040, CP_KYC_033/034/039, E2E_025/028, API_002, document-upload CP_KYC_015/016/019/020/021) require disposable UAT data + EXPLICIT USER AUTHORISATION before execution — KYC writes to LeadSquared + Azure Blob and flips isKycSubmitted (CLAUDE.md Pipeline Discipline rule 7). No PII/PAN/RERA/documents invented.

### Blockers
None. Dual-source gate satisfied (visual FULL + BRD/FRD/FS present). Builder not run and xlsx not touched per instructions.
