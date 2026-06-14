# Coverage Matrix — Channel Partner / Leads Management

**Module:** Leads Management (CP Portal)
**Master JSON:** `manual-qa-repository/07-execution/_master-json/CP-LeadsManagement.json`
**Target sheet:** `Leads Management - Master` (replaces `Leads Management` + `Leads Management (Exec)`)
**Sources (dual-source gate — both present):**
- Visual: `visual-memory/cp/leads-management/INDEX.md` (CAPTURE_STATUS: FULL) + 7 screenshots + 3 sidecar JSONs
- BRD/FRD/FS: `CP-BRD-CP-Portal.md`, `CP-FRD-CP-Portal.md` (Module 2), `CP-FS-Leads-Management.md`
**Generated:** 2026-06-14 (BA Agent, unattended)

---

## Totals

| Metric | Count |
|--------|-------|
| Total TCs | 76 |
| Sub-modules | 12 |
| Baseline TCs preserved | 66 (zero dropped) |
| New TCs added | 10 |
| `[TEST_DATA_REQUIRED]` TCs | 31 |
| `[VERIFY WITH DEV]` TCs | 32 |
| DOC_DRIFT references | 13 TCs (drifts 002/003/004) |

### New TC IDs (continued series, never renumbered)
- `TC_LEADS_FUNC_021`, `TC_LEADS_FUNC_022`, `TC_LEADS_FUNC_023`, `TC_LEADS_FUNC_024`, `TC_LEADS_FUNC_025` (FUNC series continued from 020)
- `TC_LEADS_NEG_018`, `TC_LEADS_NEG_019` (NEG series continued from 017)
- `CP_LEAD_047`, `CP_LEAD_048`, `CP_LEAD_049` (CP_LEAD series continued from 046)

> Note: baseline `CP_LEAD_008` (FS "Lead Source") and `CP_LEAD_010` (FS "Last Activity") were NOT dropped — they are preserved but **repurposed** to assert the live reality under DOC_DRIFT-002 (those FS columns do not exist live).

---

## Features × 11 Dimensions

Legend: number = TC count covering that cell; `—` = N/A for this feature; `gap` = covered as a documented defect/gap, not a passing case.

| Feature \ Dimension | 1 Positive | 2 Full-form | 3 Mandatory/Val | 4 Re-check/Race | 5 Neg/Error | 6 Context-ctrl | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Login & Landing / Nav | 5 | — | — | — | — | — | — | — | 2 (CP_LEAD_004, TC_LEADS_NEG_017) | — | — |
| Leads Table structure/content | 11 | 11 (all 9 cols) | — | — | — | — | — | — | — | 1 (CP_LEAD_026 draft) | — |
| Status badges | 4 | 3 (Sent/Reg/Refund) | — | — | — | 1 (TC_LEADS_BIZ_013 lifecycle) | — | — | — | — | — |
| Filters (Status / Team Leads) | 7 | 2 dropdowns | — | 1 (CP_LEAD_043 refresh-persist) | — | 1 (Master vs plain CP) | — | — | 1 (CP_LEAD_018 team scope) | — | — |
| Search | 9 | 1 input | 1 (TC_LEADS_NEG_019 whitespace) | — | 2 (CP_LEAD_015, TC_LEADS_NEG_006) | — | — | 1 (CP_LEAD_049 API) | — | — | — |
| Row Actions (Resend / Copy) | 7 | 2 icons | — | 1 (TC_LEADS_FUNC_025 idempotency) | — | — | 1 (Resend = silent, side-effect asserted) | — | 1 (CP_LEAD_030 ownership gap) | 1 (TC_LEADS_FUNC_024 ref URL) | — |
| Pagination & Refresh | 6 | — | — | 1 (CP_LEAD_043) | — | — | — | — | — | 1 (CP_LEAD_046 master fetch) | 2 (TC_LEADS_UI_015, CP_LEAD_025) |
| Lead Conversion | 5 | 1 (prefilled form) | — | — | 1 (CP_LEAD_023 cancel) | 1 (CP_LEAD_020 control presence) | — | — | — | 1 (CP_LEAD_022 brokerId link) | — |
| CP Isolation & Roles | 7 | — | — | — | — | — | — | — | 7 (incl. 403s, token, deep-link) | — | — |
| Notifications | 5 | — | — | — | 2 (gap: CP_LEAD_038 no-rollback, CP_LEAD_039 no-SM) | — | 5 (WA/email/silent) | — | — | 3 (Botspice, NRI email, Kaleyra-not) | — |
| API & Backend | 7 | — | 1 (KPI derivation) | 1 (CP_LEAD_027 dup 409) | 3 (409/500/blocked) | — | — | 2 (CP_LEAD_049 inj, CP_LEAD_048 auth) | 3 (token, isolation 403) | 1 (CP_LEAD_040 KPI) | — |
| Error Handling & Empty States | 3 | — | 1 (whitespace) | — | 3 (empty, stuck spinner, fetch fail) | — | — | — | — | — | 1 (empty/last-page) |

### Dimension roll-up (≥1 TC present for the module)
- [x] 1 Positive / happy path — every feature
- [x] 2 Full-form coverage — all 9 table columns, both filter dropdowns, search input, both row-action icons, convert form fields
- [x] 3 Mandatory & validation — search whitespace, KPI derivation, convert T&C precondition
- [x] 4 Re-check / race — duplicate-capture 409, refresh-persist filter, resend idempotency
- [x] 5 Negative / error — empty search, no-match, 500 fetch, stuck spinner, duplicate/paid-block
- [x] 6 Context-sensitive controls — status pills per state, Master vs plain CP filter, convert-control presence (absent), lifecycle routing
- [x] 7 Notifications — Resend (silent side-effect), WhatsApp template, NRI email, Kaleyra-vs-Botspice, no-SM gap, no-rollback gap
- [x] 8 UI-vs-backend split — search injection at API (CP_LEAD_049), unauth leads-list (CP_LEAD_048)
- [x] 9 Role / auth / security — logged-out redirect, deep-link gate, tampered/expired JWT, Master/Member 403 isolation, send-link ownership gap
- [x] 10 Integration — Registration link (brokerId/hvCode), WhatsApp Botspice, NRI email, referral URL flow, Master sub-CP fetch (LSQ EXCLUDED — downstream effect only)
- [x] 11 Boundary — pagination edges, page-size change, default page size, empty/last page

---

## Flags & Open Items

### DOC_DRIFT (raised this pass — update BRD/FRD/FS to live, do not defer)
- **DOC_DRIFT-002 — Table columns.** FS §1.4 lists Lead Name / Contact Details / Lead Source / Status-Stage / Last Activity. Live UI shows S.No, Applicant Name, Applicant Phone, Status, Date of Sent, CP Name, CP HV Code, CP Mobile, Action. TCs assert the live columns; `CP_LEAD_008`/`CP_LEAD_010` repurposed to assert FS-column absence. **Action: update `CP-FS-Leads-Management.md` §1.4, `CP-FRD-CP-Portal.md` Module 2, `CP-BRD-CP-Portal.md` §1.4 to the live column set.**
- **DOC_DRIFT-003 — No Convert-to-Registration control on /leads.** BRD §1.5.3 / FS §1.5.3 / FRD Module-2 claim convert-on-leads; live screen has only Resend Notification + Copy Link. Convert appears to live on the Dashboard Register flow. TCs `CP_LEAD_020`/`CP_LEAD_021` assert absence + flag entry point `[VERIFY WITH DEV]`. **Action: correct the convert entry-point in BRD/FRD/FS.**
- **DOC_DRIFT-004 — Data source.** FS/BRD say leads "synced from LeadSquared". Live + baseline indicate the list is served from the portal's own registration_drafts / Registration tables (Refresh re-fetches from DB; search uses JSON_EXTRACT). LSQ is out of scope (CLAUDE.md constraint 1) — TCs assert only downstream portal effects. **Action: reword the LSQ-sync language in FS/BRD/FRD as stale / `[VERIFY WITH DEV]`.**

### Silent-UX (handled per CLAUDE.md Pipeline Discipline #6 — NOT filed as bugs)
- `TC_LEADS_FUNC_007` (Resend) and `TC_LEADS_FUNC_008` (Copy Link): pass criterion is the **backend side-effect** (resend API fired / clipboard URL present), NOT a toast.
- Conflict noted: INDEX prose says "no toast observed" but `_leads-action-attempts.json` records `outcome="toast"` for both icons. Toast presence/text marked `[VERIFY WITH DEV]`. **The earlier retracted silent-UX bug is NOT re-encoded as an expected failure.**

### Documented gaps asserted AS gaps (not as passing behaviour)
- `CP_LEAD_030` — send-registration-link has no ownership check (a CP can send a link for another CP's buyer).
- `CP_LEAD_031` / `CP_LEAD_045` — Resend on a Refunded lead silently flips it Refunded → Open with no audit; only visible after refresh.
- `CP_LEAD_028` — two different CPs can both capture the same buyer for the same project (per-CP, not global, dedup).
- `CP_LEAD_035` / `CP_LEAD_049` — `%` wildcard in search returns all the CP's rows (search-injection gap).
- `CP_LEAD_039` — no notification to the mapped SM on lead creation.

### Mutation / authorisation
- 31 TCs are `[TEST_DATA_REQUIRED]`; all WRITE-path TCs (resend, capture, convert, refund-flip, duplicate-capture) carry an explicit "needs user authorisation" note and a disposable-data requirement. No invented buyer mobiles / registration numbers.

### Blockers
- **None.** Dual-source gate cleared (visual FULL + BRD/FRD/FS present). Coverage complete across all 11 dimensions. Outstanding items are `[VERIFY WITH DEV]` confirmations and the three DOC_DRIFT doc updates, not generation blockers.
