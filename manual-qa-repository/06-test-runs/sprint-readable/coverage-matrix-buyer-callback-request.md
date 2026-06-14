# Coverage Matrix — Buyer / Callback Request (Master)

**Module:** Buyer Portal → Callback Request
**Master sheet:** `Callback Request - Master` (replaces `Callback Request` + `Callback Request (Exec)`)
**Sources:** visual-memory/buyer/callback-request/INDEX.md (FULL) + BUYER-FS-Callback-Request.md + BUYER-FRD/BRD-Buyer-Portal.md
**Totals:** 85 TCs (74 baseline preserved, 11 new) · 14 sub-modules · 50 carry `[TEST_DATA_REQUIRED]`
**Generated:** 2026-06-14

---

## Dual-source confirmation
- Visual evidence: **YES (FULL)** — schedule modal, reschedule modal, header state machine, char counter all captured.
- BRD/FRD/FS: **YES** — FS Feature 1 (request) + Feature 2 (feedback), FRD Module 10, BRD Module 11 + Rule set.
- Dual-source gate: **PASSED**.

---

## Features × 11 Coverage Dimensions

Legend: ✓ covered · — N/A by design · ! covered but flagged `[VERIFY WITH DEV]`/DOC_DRIFT

| Feature / Surface | 1 Positive | 2 Full-form | 3 Mandatory/Val | 4 Submit re-check | 5 Neg/Error | 6 Context-sensitive | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Header button state machine | ✓ | ✓ | — | — | — | ✓ (FUNC_009 routing) | — | — | ✓ | — | — |
| Schedule modal structure | ✓ | ✓ | — | — | — | — | — | — | — | — | — |
| Preferred Date & Time picker | ✓ | ✓ | ✓ (VAL_003) | — | ! (CB_010/035 past) | — | — | ! (CB_051) | — | — | ! (CB_054/055) |
| Comment field | ✓ | ✓ | ✓ (VAL_001/002) | — | ✓ (CB_056 XSS) | — | — | ! (CB_043) | — | — | ✓ (CB_007 200-char, EDGE_001) |
| Submit Request | ✓ (FUNC_004/005, CB_016) | ✓ | ✓ (VAL_003, CB_051/052) | ✓ (CB_048 double, CB_033 dup) | ✓ (CB_053 net) | — | ✓ (CB_050) | ! (CB_015) | ✓ | ! (CB_045) | — |
| Modal dismissal/lifecycle | ✓ | ✓ | — | ✓ (CB_049 in-flight) | — | — | ✓ (INT_001 no-fire) | — | — | — | — |
| Reschedule Call | ✓ (FUNC_006/007) | ✓ (UI_004) | ✓ (VAL_004) | — | ✓ | ✓ (CB_036 status-gated) | — | — | ✓ (API_002) | — | — |
| Status lifecycle & assignment | ✓ (CB_019) | — | — | — | ! (CB_031 NULL SM) | ✓ (CB_018 least-loaded) | ✓ (CB_020 notify) | ! (CB_030) | — | ✓ (CB_017 link) | — |
| Notifications | — | — | — | — | — | — | ✓ (CB_045, INT_001/002) | — | — | ✓ (INT_002 feedback link) | — |
| Call Feedback (token page) | ✓ (CB_028) | ✓ (UI_005) | ✓ (CB_027 rating) | ✓ (CB_026 reuse, CB_039 dup) | ✓ (CB_025 invalid token) | ✓ (CB_038/040 eligibility) | ✓ (INT_002) | ! (CB_040) | ✓ (CB_024 no-login) | — | — |
| API & backend | ✓ (API_001) | — | ✓ (CB_051/052) | — | ✓ (CB_034 404) | — | — | ! (CB_043/042/041) | ✓ (API_001/002) | ! (CB_044) | — |
| Auth & security | — | — | — | — | ✓ (NEG_001/002) | — | — | — | ✓ (NEG_001/002, API_001/002) | — | — |
| Responsiveness/A11y | ✓ (UI_006) | — | — | — | — | — | — | — | — | — | ✓ (UI_006 375px, UI_007 kbd) |
| End-to-end | ✓ (E2E_001/002) | — | — | — | — | — | ✓ (E2E_002) | — | ✓ | ✓ (E2E_002 cross-surface) | — |

**Dimension coverage:** all 11 dimensions have at least one TC. Dimensions 7 (notifications), 8 (UI-vs-backend), 10 (integration) lean heavily on `[VERIFY WITH DEV]` because behaviour is SM-side/backend and not observable from the buyer UI alone.

---

## Sub-module TC counts

| Sub-module | TCs |
|---|---|
| Header Entry & Button State | 4 |
| Schedule a Call Modal — Open & Structure | 8 |
| Preferred Date & Time Picker | 8 |
| Comment Field & Validation | 6 |
| Submit Request | 11 |
| Modal Dismissal & Lifecycle | 9 |
| Reschedule Call | 7 |
| Status Lifecycle & Assignment | 6 |
| Notifications | 3 |
| Call Feedback (Token Page) | 10 |
| API & Backend | 5 |
| Auth & Security | 4 |
| Responsiveness & Accessibility | 2 |
| End-to-End | 2 |
| **Total** | **85** |

---

## New TC IDs (11) — gray-fill candidates

Series continued from highest existing per type (UI→005, FUNC→009, NEG→002; INT/API/E2E new series from 001):

```
TC_CALLBACK_FUNC_009   Header button routes by state (state machine)
TC_CALLBACK_UI_005     Call Feedback form fields (rating required + comments optional)
TC_CALLBACK_UI_006     Modal renders on 375px mobile viewport
TC_CALLBACK_UI_007     Modal keyboard accessibility / focus trap
TC_CALLBACK_NEG_002    Tampered/expired JWT blocks the callback action (401)
TC_CALLBACK_INT_001    No notification fires on Cancel/close (non-submit path)
TC_CALLBACK_INT_002    Feedback-link notification dispatched after call completion
TC_CALLBACK_API_001    create-callback requires a valid token (401)
TC_CALLBACK_API_002    Buyer cannot reschedule another buyer's request (403/404)
TC_CALLBACK_E2E_001    Full request -> reschedule buyer journey
TC_CALLBACK_E2E_002    request -> SM schedule -> token feedback E2E (cross-surface)
```

Written to `manual-qa-repository/07-execution/_new-tcs-buyer-callback-request.txt` (NEW file; shared tracker untouched).

---

## Flags

### DOC_DRIFT (live UI wins — fix BRD/FRD within this pass)
- **DOC_DRIFT-001** — FS/FRD list Callback Request at `/call-feedback` & `/call-feedback/:code`. Live: it is a **modal on `/home`** (no route change). `/call-feedback/:code` is the post-call **feedback** page only. → BRD Module 10 URL `/call-feedback` and FRD Module 10 entry description should be corrected to "modal on Home Dashboard (`/home`); `/call-feedback/:code` is the feedback surface".
- **DOC_DRIFT-002** — FS 1.4 lists 3 fields (description / preferred date / preferred time, all optional). Live: **2 controls** — one combined **required** `Preferred Date & Time` picker (red asterisk, pre-filled) + optional `Comment` (200 chars). → FS 1.4 field table should be corrected.
- **DOC_DRIFT-003** — FRD/FS mention a "Schedule VC"/video-call option. Not present in live UI (only "Schedule a Call"). → FS/FRD should mark the VC path as not-in-current-build or remove it.

> Per BA Agent constraint 8, these are raised and should be applied to BRD/FRD within the same pipeline step (live values authoritative). TC generation proceeded using observed values; no DOC_DRIFT blocked TC authoring.

### Blockers
- **None.** Dual-source gate PASSED (visual FULL + FS/FRD/BRD present). No `VISUAL_GATE_BLOCK`, no `DOC_MISSING`, no unresolved `GAP`.

### Open `[VERIFY WITH DEV]` (carried in TCs, not blocking)
- Past-date picker restriction (CB_010) vs backend rejection (CB_035).
- All-blank submit behaviour (CB_015) given UI marks date/time required.
- COMPLETED status unreachable / stays CONFIRMED (CB_030, CB_044) — schema drift.
- No-SM-available → silent `manager_id=NULL` (CB_031) — possible bug.
- description column 750 vs validator 500 vs UI comment 200 (CB_043).
- improvement-comments validator 900 but message says 1000 (CB_042) — SM-side downstream edge.
- public-token vs in-app feedback eligibility divergence (CB_040) — possible bug.
- WhatsApp template/provider: BRD says Kaleyra; baseline says Botspice `expert_customer_inform` (CB_045) — reconcile.
