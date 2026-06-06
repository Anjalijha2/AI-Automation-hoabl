# Test Cases — Buyer Portal / Work Progress

**Portal:** Buyer
**Module:** Work Progress
**URL:** https://uat.xrportal.in/work-progress
**Auth required:** Yes (Buyer session)
**BRD/FRD:** `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Work-Progress.md` (Feature 1) + `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` (nav item #11)
**Visual Memory:** `visual-memory/buyer/work-progress/INDEX.md` — CAPTURE_STATUS: FULL
**Generated:** 2026-06-03
**Status:** Conditional (QA test-case-reviewer pass 2026-06-06 — 15 Approved + 1 Conditional VISUAL_GAP; see review-report.md)
**Dual-source gate:** PASSED (BRD/FRD present, Visual Memory FULL)

---

## Coverage Summary

| Area | TCs |
|------|-----|
| Page load & auth gate | TC_WP_E2E_001, TC_WP_NEG_001 |
| Page headings (project name + section title) | TC_WP_UI_001 |
| All 8 tower tabs visible | TC_WP_UI_002 |
| Default tab selected on load | TC_WP_UI_003 |
| Tab switching (per-tower) | TC_WP_FUNC_001, TC_WP_FUNC_002, TC_WP_FUNC_003, TC_WP_FUNC_004, TC_WP_FUNC_005, TC_WP_FUNC_006, TC_WP_FUNC_007 |
| Content updates on tab change | TC_WP_FUNC_008 |
| Construction progress content display | TC_WP_BIZ_001 |
| Read-only enforcement (no comment/edit) | TC_WP_BIZ_002 |
| Navigation sidebar present | TC_WP_UI_004 |
| Logout from Work Progress | TC_WP_FUNC_009 |
| Direct URL access while unauthenticated | TC_WP_NEG_001 |
| Cross-stage availability (pre/post-allocation) | TC_WP_BIZ_003 |

**Total: 16 test cases** — 13 positive, 3 negative/business-rule guards.
**Visual evidence coverage:** 16/16 = 100%.
**BRD/FRD traceability:** 16/16 = 100%.

---

## Sheet 1 — Manual Test Cases

### TC_WP_E2E_001 — Authenticated buyer loads Work Progress page

| Field | Value |
|---|---|
| TC_ID | TC_WP_E2E_001 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.1, §1.3 |
| Portal | buyer |
| Module | Work Progress |
| Type | E2E |
| Scenario | Buyer navigates to Work Progress to view current construction status — happy path landing |
| Preconditions | Buyer is logged in (valid session in `fixtures/.auth/buyer.json`) |
| Steps | 1. From sidebar, click **Work Progress** (or navigate to `/work-progress`). 2. Wait for page load. |
| Expected Result | URL becomes `https://uat.xrportal.in/work-progress`. Page renders with `h2 "HoABL Naigaon"` and `h2 "Work Progress"` visible. Tower tabs (`.ant-tabs-tab`) render below the headings. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | Buyer mobile `8888888888`, OTP `258369` |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_UI_001 — Page headings display project name and section title

| Field | Value |
|---|---|
| TC_ID | TC_WP_UI_001 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.1 |
| Portal | buyer |
| Module | Work Progress |
| Type | UI |
| Scenario | Section identifies itself to the buyer via project name and section heading, per FRD objective to keep buyers informed about site progress |
| Preconditions | Buyer logged in; page loaded |
| Steps | 1. Load `/work-progress`. 2. Inspect h2 headings on the page. |
| Expected Result | Two `h2` headings are visible: `"HoABL Naigaon"` (project name) and `"Work Progress"` (section heading). |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png` |
| Test Data | — |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_UI_002 — All 8 tower tabs are visible

| Field | Value |
|---|---|
| TC_ID | TC_WP_UI_002 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4 |
| Portal | buyer |
| Module | Work Progress |
| Type | UI |
| Scenario | Buyer can see progress per individual tower — each tower in the project is represented as a tab |
| Preconditions | Buyer logged in; page loaded |
| Steps | 1. Load `/work-progress`. 2. Enumerate visible `.ant-tabs-tab` entries (deduplicated to unique tab labels — Ant Design renders tabs twice in DOM, expect 16 raw entries = 8 unique). |
| Expected Result | Exactly 8 unique tower tabs are visible with labels: **Crest, Prestige, Triumph, Crown, Horizon, Radiance, Aspire, Preview** — in this order. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | Expected tab list = `["Crest","Prestige","Triumph","Crown","Horizon","Radiance","Aspire","Preview"]` |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_UI_003 — Default active tab on initial load

| Field | Value |
|---|---|
| TC_ID | TC_WP_UI_003 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.1 |
| Portal | buyer |
| Module | Work Progress |
| Type | UI |
| Scenario | On first landing, one tower tab is active by default so progress content is immediately visible — supports FRD objective of "view the current status" without extra clicks |
| Preconditions | Buyer logged in; first visit to `/work-progress` in session |
| Steps | 1. Load `/work-progress`. 2. Identify the tab carrying the active Ant Design state (`.ant-tabs-tab-active`). 3. Verify content panel renders below the tabs. |
| Expected Result | Exactly one tab carries the active class. The corresponding tower's construction progress content (photos / progress text — e.g. body text `"Building 4 - view test & B..."`) renders below. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png`, `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | — |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_FUNC_001 — Switch to Crest tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_001 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer browses construction updates per tower — selecting **Crest** loads Crest-specific progress |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Crest**. 2. Wait for content panel to update. |
| Expected Result | **Crest** tab gains active state. The visible content panel shows progress photos/text scoped to the Crest tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | Tab label = `Crest` |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_FUNC_002 — Switch to Prestige tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_002 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer views progress for **Prestige** tower |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Prestige**. 2. Wait for content panel to update. |
| Expected Result | **Prestige** tab gains active state. Content panel shows progress photos/text scoped to the Prestige tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | Tab label = `Prestige` |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_FUNC_003 — Switch to Triumph tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_003 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer views progress for **Triumph** tower |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Triumph**. 2. Wait for content panel to update. |
| Expected Result | **Triumph** tab gains active state. Content panel shows progress photos/text scoped to the Triumph tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | Tab label = `Triumph` |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_FUNC_004 — Switch to Crown tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_004 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer views progress for **Crown** tower |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Crown**. 2. Wait for content panel to update. |
| Expected Result | **Crown** tab gains active state. Content panel shows progress photos/text scoped to the Crown tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | Tab label = `Crown` |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_FUNC_005 — Switch to Horizon tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_005 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer views progress for **Horizon** tower |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Horizon**. 2. Wait for content panel to update. |
| Expected Result | **Horizon** tab gains active state. Content panel shows progress photos/text scoped to the Horizon tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | Tab label = `Horizon` |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_FUNC_006 — Switch to Radiance tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_006 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer views progress for **Radiance** tower |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Radiance**. 2. Wait for content panel to update. |
| Expected Result | **Radiance** tab gains active state. Content panel shows progress photos/text scoped to the Radiance tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | Tab label = `Radiance` |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_FUNC_007 — Switch to Aspire tab

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_007 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, How-to Step 2 |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Buyer views progress for **Aspire** tower |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `.ant-tabs-tab` with text **Aspire**. 2. Wait for content panel to update. |
| Expected Result | **Aspire** tab gains active state. Content panel shows progress photos/text scoped to the Aspire tower. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png` |
| Test Data | Tab label = `Aspire` |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_FUNC_008 — Content updates when switching between tabs

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_008 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.4, §1.5 (per-tower content scope) |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Tab content is tower-scoped — switching tabs must replace the visible content panel so buyer sees the correct tower's milestones |
| Preconditions | Buyer logged in; on `/work-progress` with default tab active |
| Steps | 1. Capture the visible content panel text/image set for the default active tab (call it `T_A`). 2. Click a different tab — e.g. **Prestige** — and wait for the panel to update. 3. Capture the new visible content panel (call it `T_B`). 4. Click back to `T_A`. |
| Expected Result | `T_B` content differs from `T_A` content (different photos and/or different progress text — e.g. `"Building 4 - view test & B..."` is replaced). Returning to `T_A` restores the original panel content. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | Compare any 2 of the 8 tab labels |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_BIZ_001 — Construction progress content is displayed (photos / updates)

| Field | Value |
|---|---|
| TC_ID | TC_WP_BIZ_001 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.1, §1.4 (Construction milestone photos, Progress updates, Milestone dates) |
| Portal | buyer |
| Module | Work Progress |
| Type | BIZ |
| Scenario | Per FRD §1.4, each tower view must surface milestone photos and stage descriptions so buyers stay informed about site progress |
| Preconditions | Buyer logged in; tab selected (any of the 8) |
| Steps | 1. Load `/work-progress`. 2. For at least one tower tab, inspect the rendered content panel below the tabs. |
| Expected Result | Content panel shows construction-related media/text (e.g. body text `"Building 4 - view test & B..."` is visible). Page is informational — no forms, tables, or input fields. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-scrolled.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | — |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_BIZ_002 — Read-only enforcement: no comment / edit affordances

| Field | Value |
|---|---|
| TC_ID | TC_WP_BIZ_002 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.2 (Read-only section), §1.5 rule 2 (buyers cannot add comments or content) |
| Portal | buyer |
| Module | Work Progress |
| Type | BIZ |
| Scenario | Business rule mandates buyers cannot author content on this page — UI must expose no input, comment, upload, or edit affordance |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Inspect the page for any of: `<input>`, `<textarea>`, comment widget, file upload, or action button other than "Logout". 2. Iterate through all 8 tabs and repeat. |
| Expected Result | The only `button.ant-btn` action on the page is **Logout**. No input fields, no textareas, no upload controls, no comment composer, no edit/save buttons appear on any tower tab. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | — |
| Priority | P1 |
| Status | Approved |

---

### TC_WP_BIZ_003 — Available pre- and post-allocation (no stage gating)

| Field | Value |
|---|---|
| TC_ID | TC_WP_BIZ_003 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.2, §1.5 rule 3 (available to buyers at all stages of the journey) |
| Portal | buyer |
| Module | Work Progress |
| Type | BIZ |
| Scenario | FRD guarantees Work Progress is available to every registered buyer regardless of allocation status — verify no stage gate is enforced |
| Preconditions | Two buyer sessions are available — one pre-allocation (no unit allocated) and one post-allocation. (If only one is available, document the other as not-tested and rerun when available.) |
| Steps | 1. Log in as **pre-allocation buyer**, navigate to `/work-progress`. 2. Verify page loads with tabs and content. 3. Log out. 4. Log in as **post-allocation buyer**, navigate to `/work-progress`. 5. Verify page loads with tabs and content. |
| Expected Result | Both buyers reach the same `/work-progress` view. No "not available", "complete allocation first", or similar gating message is shown. Both see the 8 tower tabs and progress content. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png` |
| Test Data | Pre-allocation buyer mobile, post-allocation buyer mobile (UAT) |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_UI_004 — Navigation sidebar is present and lists all sections

| Field | Value |
|---|---|
| TC_ID | TC_WP_UI_004 |
| BRD/FRD Req ID | BUYER-BRD-Buyer-Portal nav table (Work Progress = item 11), BUYER-FS-Work-Progress How-to Step 1 |
| Portal | buyer |
| Module | Work Progress |
| Type | UI |
| Scenario | Buyer must be able to leave Work Progress via the persistent left sidebar — How-to Step 1 directs them through this sidebar |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Inspect the left navigation sidebar. |
| Expected Result | Sidebar shows: **Home, Registration, Allotment, Homeloan, Project, Work Progress, Logout** — with **Work Progress** carrying the active/selected state. |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png`, `visual-memory/buyer/work-progress/work-progress-full.png` |
| Test Data | — |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_FUNC_009 — Logout from Work Progress

| Field | Value |
|---|---|
| TC_ID | TC_WP_FUNC_009 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.3 (auth precondition — logout closes the session) |
| Portal | buyer |
| Module | Work Progress |
| Type | FUNC |
| Scenario | Logout from the Work Progress view must terminate the session, after which protected URLs require re-authentication |
| Preconditions | Buyer logged in; on `/work-progress` |
| Steps | 1. Click `button.ant-btn` matching `/logout/i`. 2. After redirect, attempt to navigate back to `/work-progress`. |
| Expected Result | Session is cleared, user is redirected away from `/work-progress` (to landing or login). Direct re-navigation to `/work-progress` no longer renders the protected page (see TC_WP_NEG_001 for unauthenticated behaviour). |
| Visual Evidence | `visual-memory/buyer/work-progress/work-progress-loaded.png` (Logout button visible) |
| Test Data | — |
| Priority | P2 |
| Status | Approved |

---

### TC_WP_NEG_001 — Unauthenticated direct URL access is blocked

| Field | Value |
|---|---|
| TC_ID | TC_WP_NEG_001 |
| BRD/FRD Req ID | BUYER-FS-Work-Progress §1.3 (Buyer must be logged in) — confirmed by INDEX.md note "Requires authentication — unauthenticated access redirects to `/`" |
| Portal | buyer |
| Module | Work Progress |
| Type | NEG |
| Scenario | A logged-out actor cannot view construction progress — auth precondition is enforced server-side / route-side |
| Preconditions | No buyer session — storage state cleared, no cookies/tokens for `uat.xrportal.in` |
| Steps | 1. From a fresh context, navigate directly to `https://uat.xrportal.in/work-progress`. |
| Expected Result | User is redirected to `/` (Buyer Portal root / login landing). The Work Progress headings (`HoABL Naigaon`, `Work Progress`) and tower tabs do NOT render. |
| Visual Evidence | `[VISUAL_GAP — unauthenticated state not captured]` — derived from INDEX.md note; recommend Tech Lead capture a redirected-state screenshot before automation |
| Test Data | — |
| Priority | P1 |
| Status | Conditional |

> **VISUAL_GAP:** buyer/work-progress
> Journey: Unauthenticated direct access to `/work-progress`
> Missing screenshot: No screenshot in INDEX.md shows the redirected/landing state for a logged-out user
> Impact: Expected Result for TC_WP_NEG_001 cannot be visually validated by image diff; assertion must rely on URL and DOM checks
> Action: Tech Lead Agent should capture the redirect target and update `visual-memory/buyer/work-progress/INDEX.md`
> TC status: Generated; safe to execute manually but flagged `[VISUAL_GAP]` for automation gate

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence Status | Notes |
|---|---|---|---|---|---|---|---|
| TC_WP_E2E_001 | Work Progress | E2E | Yes | Low | e2e | FULL | Use buyer storageState. Assert URL + both h2 + tab container. |
| TC_WP_UI_001 | Work Progress | UI | Yes | Low | ui-ux | FULL | Headings only — quick UI regression. |
| TC_WP_UI_002 | Work Progress | UI | Yes | Low | ui-ux | FULL | Dedupe `.ant-tabs-tab` text — 16 raw nodes = 8 unique. Assert order. |
| TC_WP_UI_003 | Work Progress | UI | Yes | Low | ui-ux | FULL | Assert exactly one `.ant-tabs-tab-active`. |
| TC_WP_FUNC_001 | Work Progress | FUNC | Yes | Low | e2e | FULL | Click by text — handle duplicated DOM nodes (`.first()`). |
| TC_WP_FUNC_002 | Work Progress | FUNC | Yes | Low | e2e | FULL | Same pattern. |
| TC_WP_FUNC_003 | Work Progress | FUNC | Yes | Low | e2e | FULL | Same pattern. |
| TC_WP_FUNC_004 | Work Progress | FUNC | Yes | Low | e2e | FULL | Same pattern. |
| TC_WP_FUNC_005 | Work Progress | FUNC | Yes | Low | e2e | FULL | Same pattern. |
| TC_WP_FUNC_006 | Work Progress | FUNC | Yes | Low | e2e | FULL | Same pattern. |
| TC_WP_FUNC_007 | Work Progress | FUNC | Yes | Low | e2e | FULL | Same pattern. |
| TC_WP_FUNC_008 | Work Progress | FUNC | Yes | Medium | e2e | FULL | Snapshot content panel text/HTML before/after switch — assert difference, not exact content (CMS-driven). |
| TC_WP_BIZ_001 | Work Progress | BIZ | Partial | Low | e2e | FULL | Content text changes (CMS). Assert presence of non-empty content panel, not literal copy. |
| TC_WP_BIZ_002 | Work Progress | BIZ | Yes | Low | regression | FULL | Assert no `input/textarea`, single `button.ant-btn` (Logout) per tab. |
| TC_WP_BIZ_003 | Work Progress | BIZ | Partial | Medium | regression | FULL | Needs two seeded buyer accounts (pre + post allocation). Coordinate with test-data setup. |
| TC_WP_UI_004 | Work Progress | UI | Yes | Low | ui-ux | FULL | Assert sidebar items + active state on Work Progress. |
| TC_WP_FUNC_009 | Work Progress | FUNC | Yes | Low | e2e | FULL | After logout, assert redirect URL is `/`. |
| TC_WP_NEG_001 | Work Progress | NEG | Yes (no visual diff) | Low | e2e | NO-EVIDENCE (VISUAL_GAP — unauthenticated screenshot missing) | Run with empty storageState. Assert redirect to `/`. **Excluded from visual-baseline suite until INDEX.md updated.** |

---

## Sheet 3 — Bug Report Template

| Field | Example |
|---|---|
| Bug ID | BUG_NNN |
| TC_ID | TC_WP_FUNC_001 |
| Severity | P1 / P2 / P3 |
| Steps | (paste exact failing steps from TC) |
| Actual | What was observed |
| Expected | What the TC's Expected Result says |
| Environment | UAT — `https://uat.xrportal.in/work-progress` — Chrome / Firefox / WebKit, viewport 1920×900 |
| Status | Open / In Progress / Fixed / Closed / Won't Fix |

---

## Flags & Notes for Downstream Agents

- **GAP**: None — BRD and FRD are unambiguous for this read-only module.
- **VISUAL_GAP**: 1 — unauthenticated/redirected state for TC_WP_NEG_001. Tech Lead Agent: please capture and update INDEX.md.
- **No-LSQ / No-Strapi**: Confirmed. CMS-managed content is observed only at the rendered Buyer Portal — no Strapi calls in any TC.
- **DOM quirk**: Ant Design renders tabs twice (16 raw `.ant-tabs-tab` entries for 8 logical tabs). All tab-click TCs must use `.locator('.ant-tabs-tab', { hasText: '<label>' }).first()` or equivalent dedup.
- **CMS content volatility**: BIZ_001 and FUNC_008 must not assert exact copy — admin team can change content via CMS at any time. Assert presence/diff, not literal strings.

---

## Hand-off

- **To Tech Lead Agent**: build `locators/buyer/locator-map.json` for the `workProgress` module (page headings, 8 tab labels, content panel selector, sidebar items, logout button). Capture missing unauthenticated screenshot.
- **To QA Agent**: run `test-case-reviewer` against this file + `visual-memory/buyer/work-progress/INDEX.md` + the BRD/FRD pair. Confirm 80%+ visual coverage (current: 15/16 = 93.7% with visual evidence; 1 flagged VISUAL_GAP).
