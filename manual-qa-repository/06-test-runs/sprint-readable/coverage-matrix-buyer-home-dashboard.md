# Coverage Matrix — Buyer Portal / Home Dashboard

**Module:** Home Dashboard (`/home`, https://uat.xrportal.in/home)
**Master sheet:** `Home Dashboard - Master`
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-HomeDashboard.json`
**Sources (dual-source gate — both present):**
- Visual: `visual-memory/buyer/home-dashboard/INDEX.md` (CAPTURE_STATUS: FULL)
- BRD/FRD/FS: `BUYER-BRD-Buyer-Portal.md`, `BUYER-FRD-Buyer-Portal.md` (Module 2), `BUYER-FS-Home-Dashboard.md`

**Totals:** 106 TCs across 16 sub-modules | 91 baseline IDs preserved verbatim | 15 NEW TCs added (continue `TC_HOMEDASH_*` from 051; legacy `BYR_DASH_*` stops at 041, not extended).

---

## Feature × 11-Dimension Matrix

Legend: ✓ = covered · — = not applicable / out of scope · ▲ = covered with `[VERIFY WITH DEV]` flag

| Feature \ Dimension | 1 Positive | 2 Full-form | 3 Mandatory/Valid | 4 Submit re-check | 5 Negative/Error | 6 Context-sensitive | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth | 10 Integration | 11 Boundary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Login landing & auth gate | ✓ | — | — | — | ✓ | — | — | — | ✓ | — | ▲ |
| Navigation sidebar (7 links) | ✓ | ✓ | — | — | — | ✓ | — | — | ✓ | ✓ | — |
| Status Alert Banner (TopAlert) | ✓ | — | — | — | — | ✓ | — | — | — | ▲ | — |
| Allocation Banner & real-time | ✓ | — | — | — | ▲ | ✓ | — | — | — | ✓ | ▲ |
| Marketing banner / tiles / popup / marquee | ✓ | ✓ | — | — | — | ✓ | — | — | — | ✓ | — |
| Registrations table — structure | ✓ | ✓ | — | — | ✓ | ✓ | — | — | — | ✓ | ✓ |
| Status badges (4 states) | ✓ | ✓ | — | — | — | ✓ | — | — | — | — | — |
| Process status & row actions | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — | — | ✓ | — |
| Allotment table controls (timer, Add Units) | ✓ | ✓ | — | — | — | ✓ | — | — | — | — | ✓ |
| Schedule a Call / Reschedule (DOC_DRIFT-001) | ✓ | ✓ | ✓ | ▲ | ✓ | ✓ | ✓ | — | — | ▲ | ✓ |
| Empty / loading / error states | ✓ | — | — | — | ✓ | ✓ | — | — | — | — | ✓ |
| Responsiveness (mobile-first) | ▲ | — | — | — | — | — | — | — | — | — | ✓ |
| API & backend contract | ✓ | — | ✓ | — | ✓ | — | — | ▲ | ✓ | ✓ | — |
| Security | ✓ | — | — | — | ✓ | — | — | ✓ | ✓ | — | — |
| Notifications (silence-by-design) | — | — | — | — | — | — | ✓ | — | — | ✓ | — |
| Integration / cross-module | ✓ | — | — | — | — | — | — | — | — | ✓ | — |

### Dimension notes
- **2 Full-form / 3 Mandatory:** the only true form on this dashboard is the Schedule-a-Call / Reschedule modal (Preferred Date & Time*, Comment textarea 200-char) — fully covered incl. required-field block (TC_HOMEDASH_NEG_050), 200-char boundary (FUNC_038), past-date reject (EDGE_053). The dashboard is otherwise read-driven, so form dimensions are N/A elsewhere.
- **4 Submit re-check:** N/A for read-only widgets; ▲ on Schedule-a-Call (FUNC_042 reschedule update vs new-request — flagged for dev confirmation).
- **6 Context-sensitive:** the Process-Status control changes per row status — routing case TC_HOMEDASH_FUNC_043 proves the right control per status.
- **7 Notifications:** explicit silence-by-design assertion TC_HOMEDASH_FUNC_063 (dashboard load sends no SMS/WhatsApp/email); Schedule-a-Call submit verifies backend record over toast (silent-UX rule).
- **8 UI-vs-backend:** ▲ BYR_DASH_039 (refund filter case-sensitivity), TC_HOMEDASH_API_058/059 (API contract & token rejection vs UI).
- **9 Role/Auth:** unauth redirect (NEG_002/BYR_DASH_040), expired session (NEG_003), tampered JWT (NEG_061), Buyer-token role isolation (BYR_DASH_041), multi-tenant data isolation (NEG_060), HTTPS-only (NEG_062).
- **10 Integration:** Mavis/allocation booking → Booked row (INT_064); KYC module → KYC-Completed row (INT_065); Strapi-driven banners/tiles/popup/marquee tested at downstream render only (Strapi out of scope at source).
- **11 Boundary:** countdown-to-zero (EDGE_044), long registration list scroll (EDGE_048), Comment 200-char (FUNC_038), mobile/tablet viewport edges (UI_056/057).

---

## New TC IDs (15) — continue `TC_HOMEDASH_*` from 051

| New ID | Type | Sub-module | Dimension filled |
|---|---|---|---|
| TC_HOMEDASH_FUNC_051 | FUNC | Login Landing & Auth Gate | JWT stored after login (session) |
| TC_HOMEDASH_BIZ_052 | BIZ | Status Alert Banner | TopAlert message per journey state |
| TC_HOMEDASH_EDGE_053 | EDGE | Schedule a Call | past preferred date/time rejected |
| TC_HOMEDASH_FUNC_054 | FUNC | Empty/Loading/Error | loading state while fetching |
| TC_HOMEDASH_NEG_055 | NEG | Empty/Loading/Error | WebSocket disconnect handled |
| TC_HOMEDASH_UI_056 | UI | Responsiveness | mobile 375x667 + bottom nav |
| TC_HOMEDASH_UI_057 | UI | Responsiveness | tablet 768x1024 |
| TC_HOMEDASH_API_058 | API | API & Backend Contract | registrations endpoint returns rows |
| TC_HOMEDASH_API_059 | API | API & Backend Contract | endpoint rejects missing/invalid token (401) |
| TC_HOMEDASH_NEG_060 | NEG | Security | multi-tenant data isolation |
| TC_HOMEDASH_NEG_061 | NEG | Security | tampered JWT → redirect to login |
| TC_HOMEDASH_NEG_062 | NEG | Security | HTTPS-only, no token in URL |
| TC_HOMEDASH_FUNC_063 | FUNC | Notifications | dashboard load = no notification (silent) |
| TC_HOMEDASH_INT_064 | INT | Integration | Booked row ↔ Mavis/allocation booking |
| TC_HOMEDASH_INT_065 | INT | Integration | KYC-Completed row ↔ KYC module flag |

---

## Flags

### DOC_DRIFT (live UI wins — authored against observed behaviour)
- **DOC_DRIFT-001** — "Schedule a Call" / "Call Requested" / "Reschedule Call" controls appear on the live dashboard header (INDEX.md) but are NOT in `BUYER-FS-Home-Dashboard.md` §1.4 (they belong to the Callback Request module, BUYER-FRD Module 10 `/call-feedback`). 10 TCs authored against the live control. **Action (within this step):** BUYER-FS-Home-Dashboard.md §1.4 should add the dashboard Schedule-a-Call entry point; deferred to QA/doc-owner write as it edits FS prose — recorded here so it is not lost.
- **DOC_DRIFT-002** — Allocation route is `/alloted` (one 't') per INDEX.md; FRD §6 uses `/alloted` but the FS step list writes `/allotted` (two t's). Sidebar coverage uses the live `/alloted`.
- **DOC_DRIFT-003** — Unit-string format is data-dependent: FS 1.8 sample `3502-Crest | 1 Bed Growth Home | 323 sq.ft.` vs UAT live `1201-Glory 1 Bed (323 sq.ft.)`. Expected results assert the column renders a unit string, not a fixed literal.

### `[VERIFY WITH DEV]` (behaviour not confirmed in BRD/FRD/FS)
TopAlert exact per-state strings (BIZ_052); DYNAMIC-campaign dashboard row presentation (BYR_DASH_037); HOLD-state presentation (BYR_DASH_038); JWT lifetime / at-expiry message & logout server-side invalidation (NEG_003, E2E_011); Know-More CTA target (FUNC_014); Home Popup suppression scope (BYR_DASH_009); Add Units destination (FUNC_034); empty-state / payment-pending / API-error exact copy (BYR_DASH_030/033/031); loading affordance (FUNC_054); WS disconnect banner (NEG_055); mobile/tablet render (UI_056/057 — no mobile baseline in visual-memory); API endpoint paths/field names & refund-filter casing (API_058, BYR_DASH_034/035/039); reschedule updates-vs-creates (FUNC_042); ownership scoping (NEG_060); dashboard↔Mavis/KYC propagation (INT_064/065); no side-channel notification on render (FUNC_063).

### `[TEST_DATA_REQUIRED]` (disposable/state data must be supplied)
Available row + live campaign; Booked / KYC-pending / KYC-completed / Refunded rows; zero-registration buyer; payment-pending registration; admin_rejected home-loan record; scheduled vs live vs DYNAMIC campaign; campaign start/stop control; aged/short-expiry JWT; Buyer API bearer token; second buyer's registration id; message-log / backend-log access; authorisation to submit/reschedule a real callback on UAT.

### Blockers
None. Dual-source gate satisfied (visual FULL + FS/BRD/FRD present). No LSQ/Strapi-source scope touched. No live mutations authored as auto-run (Submit/Pay/Book TCs are capture-only or gated on `[TEST_DATA_REQUIRED]`/authorisation per pipeline rule 7).
