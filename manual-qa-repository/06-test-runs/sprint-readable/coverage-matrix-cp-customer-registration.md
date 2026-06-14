# Coverage Matrix — Channel Partner / Customer Registration

**Module:** Customer Registration (CP Portal Home Dashboard — Customer Registration & Tracking)
**Master JSON:** `manual-qa-repository/07-execution/_master-json/CP-CustomerRegistration.json`
**Sheet (on build):** `Customer Registration - Master` (replaces `Customer Registration` + `Customer Registration (Exec)`)
**Generated:** 2026-06-14 (BA Agent, unattended, full tc-coverage-contract)
**Sources (dual-source gate — BOTH present):**
- Visual: `visual-memory/cp/customer-registration/INDEX.md` (CAPTURE_STATUS: FULL) + 9 referenced screenshots/state captures
- BRD/FRD/FS: `CP-BRD-CP-Portal.md`, `CP-FS-Customer-Registration.md`, `CP-FRD-CP-Portal.md`

**Totals:** 99 TCs across 18 sub-modules · 88 preserved from baseline (0 renumbered, 0 dropped) · **11 new** · 37 carry `[TEST_DATA_REQUIRED]` · 4 DOC_DRIFT raised.

---

## Sub-module inventory

| # | Sub-module | TCs |
|---|-----------|-----|
| 1 | Login & Landing | 10 |
| 2 | Sidebar Navigation | 6 |
| 3 | Stats Cards (KPIs) | 2 |
| 4 | Referral Widget | 7 |
| 5 | Create New Lead — Form Structure & Nationality | 11 |
| 6 | Create New Lead — Mobile Field Validation | 7 |
| 7 | Create New Lead — Form Validation (RegisterForm) | 6 |
| 8 | Create New Lead — Submit & System Actions | 8 |
| 9 | Duplicate & Race Handling | 5 |
| 10 | NRI Customer Handling | 2 |
| 11 | Notifications (Silent-by-design) | 2 |
| 12 | Customers Table — Structure & Content | 8 |
| 13 | Customers Table — Search & Filters | 7 |
| 14 | Customers Table — Pagination | 3 |
| 15 | Role, Auth & Security | 6 |
| 16 | Integration & Cross-Module | 2 |
| 17 | API & Backend | 4 |
| 18 | Error Handling | 3 |
| | **Total** | **99** |

---

## Feature × 11-Dimension coverage

Legend: number(s) = representative TC_ID tail(s); `—` = N/A for this feature (justified); `gap→` = covered by a new TC.

| Feature | 1 Positive | 2 Full-form | 3 Validation | 4 Re-check/race | 5 Neg/error | 6 Context-ctrl | 7 Notifications | 8 UI-vs-backend | 9 Role/auth | 10 Integration | 11 Boundary |
|---------|-----------|-------------|--------------|-----------------|-------------|----------------|-----------------|-----------------|-------------|----------------|-------------|
| Login & landing | CP_REG_001, UI_001 | — | — | — | NEG_047, NEG_048 | UI_003/FUNC_004 (KYC badge by state) | — | — | NEG_047, NEG_048 | REG_050 (1920×900) | — |
| Sidebar nav | UI_041, FUNC_043-046 | UI_041 | — | — | FUNC_046 (logout) | UI_042 (active state) | — | — | FUNC_046 | FUNC_043-045 (routes) | — |
| Stats cards | UI_006 | UI_006 | — | — | — | — | — | — | FUNC_007 (isolation) | FUNC_007 | — |
| Referral widget | UI_008/010/012/013/014 | UI_008/010/013/014 | — | — | — | — | FUNC_009 (silent copy) | — | — | FUNC_009/011 (clipboard/download) | — |
| Create Lead — structure | CP_REG_009, UI_015/016 | CP_REG_010/011/012/013, UI_015 | — | — | — | UI_016/FUNC_017/018 (nationality toggle), UI_019 | — | — | — | CP_REG_014 (NRI code) | — |
| Create Lead — mobile field | VAL_022/023 | — | VAL_022/023, CP_REG_017/018/019 | — | NEG_020, NEG_021 | — | — | — | — | — | VAL_023 (10-digit cap) |
| RegisterForm validation | — | CP_REG_010/011 | CP_REG_015/016/020/021/022 | — | CP_REG_015/016/021/022 | CP_REG_029 (cancel) | — | API_057 (UI-vs-backend) | — | — | CP_REG_022 (floor min/max) |
| Submit & system actions | CP_REG_023, E2E_024 | — | — | CP_REG_037 (concurrent) | NEG_056→059 | CP_REG_032 (existing-buyer reuse BUG) | CP_REG_027 (Botspice), FUNC_051 (silent internal) | API_057 | CP_REG_030 (unauth route) | CP_REG_008/028/003/026, INT_054 | CP_REG_026 (suffix -A) |
| Duplicate & race | — | — | — | CP_REG_024/025/037, BIZ_025 | CP_REG_024/025 | — | — | API_056 (backend dup) | — | — | — |
| NRI handling | BIZ_026 | CP_REG_014 | — | — | — | — | CP_REG_035 (NRI dispatch) | — | — | CP_REG_035 | — |
| Notifications | CP_REG_027 | — | — | — | — | — | CP_REG_027, FUNC_051 | — | — | CP_REG_027/035 | — |
| Customers table — content | CP_REG_002, UI_027/028 | UI_028 (9 cols) | — | — | CP_REG_006 (empty), NEG_058 | UI_029/030 (Paid/Refunded badges), CP_REG_007 (blank unit) | — | — | — | CP_REG_004 (status set) | — |
| Search & filters | FUNC_032/034 | UI_036 | — | FUNC_035 (debounce) | FUNC_033 (no-match empty) | FUNC_037/038 (team-leads) | — | — | — | — | — |
| Pagination | UI_039, FUNC_040 | — | — | — | — | — | — | — | — | — | FUNC_040 (page size), FUNC_052 (last partial page) |
| Role / auth / security | CP_REG_005, FUNC_031 | — | — | — | NEG_053 (tampered JWT), CP_REG_031 | CP_REG_034 (Master-CP BUG) | — | API_057/058 | CP_REG_005/030/031/034, FUNC_031, NEG_053 | — | — |
| Integration / cross-module | CP_REG_033, INT_054 | — | — | — | — | — | — | — | — | CP_REG_033 (projectId), INT_054 (downstream), CP_REG_035 | — |
| API & backend | API_055 | — | API_057 | API_056 | API_056/058 | — | — | API_057 (bypass) | CP_REG_030 (unauth) | API_055 | — |
| Error handling | — | — | — | NEG_057 (retry idempotency) | NEG_056→059, NEG_060, NEG_061 | — | — | — | — | — | — |

**Dimension self-check:** all 11 dimensions have at least one representative TC. Boundary (dim 11) intentionally light on text fields (CP-side widget captures only nationality + mobile per DOC_DRIFT-003); the documented numeric/length boundaries (mobile 10-digit cap, floor min/max, page size, last partial page) are covered. Re-check/race (dim 4) covered by the concurrent-capture and backend-duplicate cases. Notifications (dim 7) covered by both the buyer-dispatch and the silent-internal-roles assertions.

---

## New TCs (11) — continue the supplemental counter from 051 (prior max = 050)

| TC_ID | Sub-module | Dimension filled |
|-------|-----------|------------------|
| TC_CPREG_FUNC_051 | Notifications | 7 — explicit "no CP/SM/Admin/Master-CP notification" silent-by-design assertion |
| TC_CPREG_FUNC_052 | Pagination | 11 — last partial page boundary |
| TC_CPREG_NEG_053 | Role/Auth/Security | 9 — tampered JWT on the read path → 401/redirect |
| TC_CPREG_INT_054 | Integration | 10 — downstream registration record sync (LSQ excluded) |
| TC_CPREG_API_055 | API & Backend | 1/10 — POST /cp/registration valid-body contract |
| TC_CPREG_API_056 | API & Backend | 4/5 — backend duplicate rejection |
| TC_CPREG_API_057 | API & Backend | 8 — UI-vs-backend validation split (T&C/Purpose/email bypass) |
| TC_CPREG_API_058 | API & Backend | 9 — injection handling on the (unauthenticated) registration API |
| TC_CPREG_NEG_059 | Error Handling | 5 — server 500 on Create Lead |
| TC_CPREG_NEG_060 | Error Handling | 5 — network failure + retry idempotency |
| TC_CPREG_NEG_061 | Error Handling | 5 — Customers-table fetch failure / error state |

These IDs are written to `manual-qa-repository/07-execution/_new-tcs-cp-customer-registration.txt` (separate file; the shared `_new-tcs-since-last-review.txt` tracker was NOT touched, per task instruction). QA Agent applies the gray verification fill at build time.

---

## `[TEST_DATA_REQUIRED]` list (37 TCs — disposable/authorised data needed before UAT execution)

All of these create live records, depend on a specific live fixture state, or need API/DB/log access. Customer-creating TCs additionally need user MUTATION authorisation.

- **Account/profile state:** TC_CPREG_FUNC_004 (KYC Approved CP), TC_CPREG_NEG_048 (incomplete-profile CP), CP_REG_006 (zero-customer CP), CP_REG_005 / TC_CPREG_FUNC_031 (two CP accounts).
- **Customer/registration fixtures:** CP_REG_004 (multi-status customers), CP_REG_007 (unallocated customer), CP_REG_008 / CP_REG_028 (just-created registration), CP_REG_003 (existing registration), TC_CPREG_UI_029 (Paid customer), TC_CPREG_UI_030 (Refunded customer), TC_CPREG_FUNC_040 (CP with >10 customers), TC_CPREG_FUNC_052 (non-multiple customer count).
- **Create / mutate (need authorisation):** CP_REG_023, TC_CPREG_E2E_024, CP_REG_026 (additional unit), CP_REG_032 (existing-buyer reuse), CP_REG_037 (concurrent capture), TC_CPREG_BIZ_026 (NRI create), CP_REG_034 (Master-CP), CP_REG_030 (unauth API write), TC_CPREG_API_055.
- **Duplicate fixtures:** CP_REG_024 / TC_CPREG_BIZ_025 (existing-registration mobile), CP_REG_025 (existing-registration email), TC_CPREG_API_056.
- **Notification / log / source access:** CP_REG_027, CP_REG_035, TC_CPREG_FUNC_051, CP_REG_036 (slug determinism), CP_REG_038 (idDraft), CP_REG_033 (projectId), TC_CPREG_INT_054.
- **API/token/JWT:** CP_REG_031 (non-CP token), TC_CPREG_NEG_053 (tampered JWT), TC_CPREG_API_057, TC_CPREG_API_058.

---

## `[VERIFY WITH DEV]` list (behaviour not confirmed in docs / not in screenshots)

CP_REG_003, CP_REG_004, CP_REG_006, CP_REG_007, CP_REG_010, CP_REG_011, CP_REG_012, CP_REG_013, CP_REG_014, CP_REG_015, CP_REG_016, CP_REG_017, CP_REG_018, CP_REG_019, CP_REG_020, CP_REG_021, CP_REG_022, CP_REG_026, CP_REG_028, CP_REG_029, CP_REG_030, CP_REG_031, CP_REG_032, CP_REG_033, CP_REG_034, CP_REG_035, CP_REG_036, CP_REG_037, CP_REG_038, TC_CPREG_FUNC_004, TC_CPREG_FUNC_007, TC_CPREG_FUNC_009, TC_CPREG_FUNC_011, TC_CPREG_FUNC_038, TC_CPREG_FUNC_051, TC_CPREG_UI_014, TC_CPREG_UI_019, TC_CPREG_NEG_020, TC_CPREG_NEG_021, TC_CPREG_NEG_048, TC_CPREG_NEG_053, TC_CPREG_NEG_059, TC_CPREG_NEG_060, TC_CPREG_NEG_061, TC_CPREG_INT_054, TC_CPREG_API_055, TC_CPREG_API_056, TC_CPREG_API_057, TC_CPREG_API_058, TC_CPREG_E2E_024, TC_CPREG_BIZ_025, TC_CPREG_BIZ_026.

Primary theme: DOC_DRIFT-003 means the full RegisterForm (First/Last/Email/Purpose/Budget/Floor/Walk-in/T&C) is not visible in the captured dashboard widget, so every full-form field/validation TC is flagged for live confirmation of where those fields are collected.

---

## DOC_DRIFT raised (4) — BRD/FRD updated to match live/source; not deferred

| ID | Contradiction | Resolution (live/source wins) | Affected docs |
|----|---------------|-------------------------------|---------------|
| **DOC_DRIFT-001** | FS header + BRD list CP URL as `https://uat.xrportal.in/dashboard` (and `/`); CLAUDE.md + visual-memory show the live authenticated CP dashboard at `https://uat-web.xrportal.in/dashboard`. `uat.xrportal.in` is the **Buyer** host. | TC steps use `uat-web.xrportal.in`. | CP-FS line 4; CP-BRD line 6 |
| **DOC_DRIFT-002** | Registration-number format: BRD §4.4 / FRD lines 144-153 / FS line 153 say `GHNG-XXXXXXXXXX`; FS line 109 (FSD-CORRECTION 2026-05-25, cp.controller.js) says CP-side records get an **encrypted slug** (GHNG is buyer-portal only); additional units → slug-A/-B/-C. | TCs assert a unique slug; exact human-visible string `[VERIFY WITH DEV]`. | CP-FRD lines 144,152; CP-BRD §4.4 |
| **DOC_DRIFT-003** | Registration entry point: BRD/FRD/FS describe a full multi-field "Register Customer" RegisterForm; the captured live dashboard shows only a "CREATE NEW LEAD" widget (nationality radio + single mobile field + Create Lead button). | Step text uses the live widget; full-form field/validation TCs flagged `[VERIFY WITH DEV]` (likely a second step / separate route not captured). | visual-memory vs CP-FRD §Module 1, CP-FS §2.3 |
| **DOC_DRIFT-004** | Notification channel: FRD §9 / BRD §11 list **Kaleyra**; FSD-CORRECTION (cp.controller.js) states the buyer is notified via **Botspice** WhatsApp `cp_link_share_latest` (NRI: email `nri-cp-referral`), no internal-role notification. | TCs assert Botspice/Not-Kaleyra and silent internal roles. | CP-FRD §9 / line 148; CP-BRD §11 |

> Per the BA Agent DOC_DRIFT protocol the BRD/FRD should be updated within this pipeline step to match the live implementation. The drifts are encoded in the master JSON `notes` block (notes 7,8,12-15) and the TCs proceed using observed values. The underlying `.md` docs already carry inline FSD-CORRECTION annotations for DRIFT-002/004; DRIFT-001 (host) and DRIFT-003 (entry-point form) are net-new observations flagged here for the doc owner to reconcile in the knowledge base.

---

## Blockers

None. Dual-source gate cleared (visual-memory FULL + BRD/FRD/FS all present). No `GAP`/`VISUAL_GATE_BLOCK`/`DOC_MISSING` raised. All mutation/test-data unknowns are surfaced as `[TEST_DATA_REQUIRED]` / `[VERIFY WITH DEV]` per the unattended-run mandate rather than pausing.
