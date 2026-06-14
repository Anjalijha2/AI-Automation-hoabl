# Coverage Matrix — Buyer Portal / KYC (Master)

**Module:** Buyer → KYC
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-KYC.json`
**Sheet:** `KYC - Master` (replaces `KYC`, `KYC (Exec)`)
**Sources (dual-gate, both present):**
- Visual: `visual-memory/buyer/kyc/INDEX.md` (CAPTURE_STATUS: FULL)
- Docs: `BUYER-FS-KYC.md`, `BUYER-WF-KYC.md`, `BUYER-BRD-Buyer-Portal.md`, `BUYER-FRD-Buyer-Portal.md`

**Total TCs:** 99 · **New:** 1 (`BYR_KYC_067`) · **[TEST_DATA_REQUIRED]:** 97 · **[VERIFY WITH DEV]:** 61 · **DOC_DRIFT-tagged:** 12

---

## Features × 11 Coverage Dimensions

Legend: ✅ covered · ⚠️ covered-but-flagged ([VERIFY WITH DEV]/DOC_DRIFT) · N/A justified

| Feature \ Dimension | 1 Positive | 2 Full-form | 3 Mandatory/Valid | 4 Submit re-check | 5 Negative/Error | 6 Context controls | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Access & WINNER gating | ✅ 001,002 | — | ✅ 003 | — | ✅ 003 | ✅ 001 | — | — | ✅ 067, EDGE_002 | ✅ 001 | — |
| Step 1 Add Applicants UI | ✅ UI_001-005 | ✅ UI_004,005 | — | — | — | ✅ FUNC_006 | — | — | — | ✅ UI_002 | — |
| Co-applicants (add/remove/limit) | ✅ 013,016 | ✅ 013 | ✅ 015 | ✅ 041,042 | ✅ 035 | ✅ FUNC_007 | — | ✅ 040 | — | — | ✅ 014,040 |
| Drawer fields & validation | ✅ FUNC_001 | ✅ FUNC_001 | ✅ 006,008,009,010,VAL_001,VAL_002 | — | ✅ 061,062,063,064 | — | — | ✅ 061 | — | — | ✅ FUNC_008,009 |
| Document upload (4 mandatory) | ✅ 017,019 | ✅ 017,018 | ✅ 022 | ✅ 043 | ✅ 020,021 | — | — | ✅ 045,FUNC_012 | — | ✅ 033 | ✅ 020,021,FUNC_010 |
| Step 3 Summary / T&C | ✅ 024,051 | ✅ 024,052,053,054 | ✅ 025,026 | ✅ 055 | — | ✅ 026,052 | — | — | — | ✅ 051 | — |
| E-Verification (OTP) ⚠️DRIFT-001 | ⚠️ 027,029 | ⚠️ 056,057 | ⚠️ 056,057 | ⚠️ 029 | ⚠️ 028,059 | ⚠️ 058,060 | — | — | — | ⚠️ 029 | ⚠️ 056 |
| Step 4 Success | ✅ 030,FUNC_004 | ✅ 030 | — | — | — | — | — | — | — | ✅ 031,050,FUNC_013 | — |
| Status transitions / downstream | ✅ BIZ_001 | — | — | ✅ 037 | ✅ 038,047,066 | — | ✅ BIZ_004,FUNC_011 | ✅ 045 | ✅ 036 | ✅ BIZ_002,003,004,046,047,048 | — |
| API & backend contract | ✅ 037 | ✅ 043 | ✅ 044 | ✅ 037 | ✅ 038,NEG_001,002,003 | — | — | ✅ 045,FUNC_012,039 | ✅ 036,NEG_001 | ✅ 039 | ✅ 040 |
| Edge / state / error | ✅ FUNC_005 | — | — | ✅ 066 | ✅ 066,EDGE_002 | ✅ 065 | ✅ FUNC_011 | — | ✅ EDGE_002 | — | ✅ EDGE_001,FUNC_008,FUNC_014(N/A) |
| Cross-portal CP/SM | ⚠️ WF_001,WF_002 | — | — | — | — | — | — | — | — | ⚠️ WF_001,WF_002 | — |

---

## Dimension roll-up

| # | Dimension | Status | Notes |
|---|---|---|---|
| 1 | Positive / happy path | ✅ | Per-step happy path + E2E via WF cases |
| 2 | Full-form coverage | ✅ | Every captured drawer field + Summary control has ≥1 case |
| 3 | Mandatory / validation | ✅ | Name/PAN/Aadhaar/address/pincode/mobile/email + 4-doc rule |
| 4 | Submit-time re-check / race | ✅ | Idempotency (037), uniqueness at add (041,042), submit gating (022,026,055) |
| 5 | Negative / error handling | ✅ | Wrong/expired OTP, bad files, partial docs, 401, network fail, 207-bug |
| 6 | Context-sensitive controls | ✅ | Confirm-button gating (FUNC_006), Verify-Details routing (FUNC_007), Edit/Back |
| 7 | Notifications | ✅ | WhatsApp-on-submit (BIZ_004) + silent-by-design capture-only (FUNC_011) |
| 8 | UI-vs-backend split | ✅ | UI size cap vs API no-cap (FUNC_012/045); UI PAN block vs API (061); cap (040) |
| 9 | Role / auth / security | ✅ | Unauth redirect (067), ownership (036), tampered unitId (EDGE_002), 401 (NEG_001) |
| 10 | Integration | ✅ | Azure, LSQ, Mavis, payment-schedule, PDF cron, Kaleyra — all assert documented effect only |
| 11 | Boundary | ✅ (pagination N/A) | Max-4, file type/size, field lengths; pagination N/A justified (FUNC_014) |

---

## New TC

| TC_ID | Sub-Module | Why new |
|---|---|---|
| `BYR_KYC_067` | KYC Access & Gating | Unauthenticated /kyc access → login redirect. Split out of a baseline `BYR_KYC_005` collision (005 retained for its baseline scenario "primary applicant prefilled"); continues BYR_KYC series at next free number (highest was 066). |

> Repurposed (not new IDs): `TC_KYC_FUNC_006`–`TC_KYC_FUNC_014` and `TC_KYC_UI_001`–`005` existed in the workbook as EMPTY placeholder rows (no scenario/steps/expected). They were filled with real content (not dropped, not renumbered) per the contract — IDs preserved.

---

## Flags / blockers

- **DOC_DRIFT-001 (step count):** FS/BRD/WF describe a 5-step flow with an OTP e-verification step; visual capture shows only 4 on-screen steps with NO OTP screen for buyer self-KYC. Live UI wins for steps/expected. All 8 E-Verification TCs (`BYR_KYC_027,028,029,056,057,058,059,060`) retained but tagged `[VERIFY WITH DEV]` — confirm whether OTP applies to buyer self-KYC or only the SM physical-allocation path.
- **DOC_DRIFT-002 (drawer fields):** FS lists DOB / Occupation / Income as required; captured drawer has none of them. Field cases `BYR_KYC_007,011,063,064` retained but tagged `[VERIFY WITH DEV]`.
- **DOC_DRIFT-003 (route):** Unit Details / Digital Booking Form is at `/kyc?unitId=<base64>`, not `/allotted-units` (BRD already corrected 2026-06-06). TCs use the observed route.
- **Mutation safety:** 97 of 99 TCs carry `[TEST_DATA_REQUIRED]`; every upload/add/submit/e-verify carries a user-authorisation requirement (KYC submission is one-way: sets isKycSubmitted, generates payment schedule, marks Mavis Final). No live mutations without user OK.
- **Scope exclusions honoured:** LSQ never called directly (assert sync flag only); Strapi-configurable labels treated as `[VERIFY WITH DEV]`; Mavis/Easebuzz/Azure/Kaleyra asserted by documented effect only.
- **Not run:** builder not executed and xlsx not touched, per instruction.
