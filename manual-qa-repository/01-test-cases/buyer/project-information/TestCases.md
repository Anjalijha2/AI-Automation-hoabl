# TestCases — Buyer Portal / Project Information

**Portal:** Buyer
**Module:** Project Information
**URL:** `https://uat.xrportal.in/project`
**BRD/FRD:** `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Project-Information.md`
**Visual Memory:** `visual-memory/buyer/project-information/INDEX.md` (CAPTURE_STATUS: FULL)
**Generated:** 2026-06-03
**Reviewer:** Pending (QA Agent → `test-case-reviewer`)

---

## Source Reconciliation Note

The FRD (BUYER-FS-Project-Information.md §1.4) describes a tabbed layout with five sections — Overview, Towers, Gallery, Documents, Videos. The captured visual memory shows a **single-page scrollable layout** with the project name "HoABL Naigaon" and content sections organised as video/walkthrough cards under headings: *See the Vision Come Alive*, *LOCATION*, *PROJECT WALKTHROUGH*, *SCIENCE BEHIND EVERY DETAIL (1 BHK)*, *SCIENCE BEHIND EVERY DETAIL (2 BHK)*. **Steps and Expected Results in this batch are grounded in the visual memory (live UI).** FRD references are retained for business intent (read-only, Strapi-managed, RERA compliance per §1.5).

**GAP flagged for FRD update:** FRD should be revised to reflect the scrollable single-page structure observed on UAT. Tabbed layout is not present in the captured UI.

---

## Sheet 1 — Manual Test Cases

| TC_ID | BRD/FRD Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|----------------|--------|--------|------|----------|---------------|-------|-----------------|-----------------|-----------|----------|--------|
| TC_PROJINFO_FUNC_001 | BUYER-FS-PROJINFO §1.3 / BUYER-BRD §3 (#8) | Buyer | Project Information | FUNC | Page loads successfully for authenticated buyer | Buyer logged in with valid session (`fixtures/.auth/buyer.json`) | 1. Open browser at viewport 1920×900<br>2. Navigate to `https://uat.xrportal.in/project` | Page loads with HTTP 200. URL remains `/project`. Sidebar visible (Home, Registration, Allotment, Homeloan, Project, Work Progress, Logout). Logout button (`button.ant-btn` with text "Logout") rendered. | `project-information-loaded.png` | Auth session: buyer.json | High | Draft |
| TC_PROJINFO_UI_002 | BUYER-FS-PROJINFO §1.1 | Buyer | Project Information | UI | Project name "HoABL Naigaon" rendered as primary h2 heading | Buyer on `/project` | 1. Inspect top of page<br>2. Locate primary project heading | `h2` element with exact text "HoABL Naigaon" is visible at top of page content area. | `project-information-loaded.png` | — | High | Draft |
| TC_PROJINFO_FUNC_003 | BUYER-FS-PROJINFO §1.5 (#2) — RERA compliance | Buyer | Project Information | FUNC | RERA ID displayed for legal compliance | Buyer on `/project` | 1. Locate RERA identifier text below/near project name | Text "RERA ID: P99000080106" is visible on the page. Value matches FRD §1.5 #2 — RERA compliance is mandatory. | `project-information-loaded.png` | Expected RERA ID: `P99000080106` | High | Draft |
| TC_PROJINFO_UI_004 | BUYER-FS-PROJINFO §1.4 (Videos) | Buyer | Project Information | UI | "See the Vision Come Alive" hero video section is present | Buyer on `/project` | 1. Locate the first content section under the project header<br>2. Verify h2 text and subtitle | `h2` with text "See the Vision Come Alive" is visible. Subtitle "Explore Project Videos & Walkthrough" is rendered. Video duration label "06:45" appears on the video card. | `project-information-loaded.png` | — | High | Draft |
| TC_PROJINFO_UI_005 | BUYER-FS-PROJINFO §1.4 (Videos / Project Overview) | Buyer | Project Information | UI | LOCATION section renders with sub-heading and video | Buyer on `/project`, scrolled enough to view LOCATION section | 1. Scroll down ~400px or until LOCATION section is in viewport | `h3` "LOCATION" visible. `h5` "Epicentre of Growth" visible directly under it. Video card with duration "03:39" rendered. | `project-info-scrolled.png` | — | High | Draft |
| TC_PROJINFO_UI_006 | BUYER-FS-PROJINFO §1.4 (Videos) | Buyer | Project Information | UI | PROJECT WALKTHROUGH section renders | Buyer on `/project`, scrolled to walkthrough region | 1. Scroll further until PROJECT WALKTHROUGH section is in viewport | `h3` "PROJECT WALKTHROUGH" visible. `h5` "Your Future Growth Home – Development Walkthrough" visible underneath. | `project-info-scrolled.png`, `project-information-full.png` | — | High | Draft |
| TC_PROJINFO_UI_007 | BUYER-FS-PROJINFO §1.4 (Tower Specifications / Project Overview) | Buyer | Project Information | UI | SCIENCE BEHIND EVERY DETAIL — 1 BHK card renders | Buyer on `/project`, scrolled to science section | 1. Scroll until first "SCIENCE BEHIND EVERY DETAIL" block is in viewport | `h3` "SCIENCE BEHIND EVERY DETAIL" visible. `h5` "Integrated Project Planning for 1 BHK" rendered directly under it. | `project-information-full.png` | — | Medium | Draft |
| TC_PROJINFO_UI_008 | BUYER-FS-PROJINFO §1.4 (Tower Specifications / Project Overview) | Buyer | Project Information | UI | SCIENCE BEHIND EVERY DETAIL — 2 BHK card renders | Buyer on `/project`, scrolled to second science card | 1. Scroll until second "SCIENCE BEHIND EVERY DETAIL" block is visible | Second `h3` "SCIENCE BEHIND EVERY DETAIL" visible. `h5` "Integrated Project Planning for 2 BHK" rendered directly under it. | `project-information-full.png` | — | Medium | Draft |
| TC_PROJINFO_FUNC_009 | BUYER-FS-PROJINFO §1.4 (all sections) | Buyer | Project Information | FUNC | All five content sections present in correct vertical order | Buyer on `/project` | 1. Load page<br>2. Scroll top → bottom<br>3. Capture order of headings encountered | Headings appear in this order from top to bottom: (a) HoABL Naigaon + RERA, (b) See the Vision Come Alive, (c) LOCATION → Epicentre of Growth, (d) PROJECT WALKTHROUGH → Your Future Growth Home, (e) SCIENCE BEHIND EVERY DETAIL → 1 BHK, (f) SCIENCE BEHIND EVERY DETAIL → 2 BHK. | `project-information-loaded.png`, `project-info-scrolled.png`, `project-information-full.png` | — | High | Draft |
| TC_PROJINFO_UI_010 | BUYER-FS-PROJINFO §1.2 (read-only) | Buyer | Project Information | UI | Page is read-only — no form inputs or data-entry components | Buyer on `/project` | 1. Inspect full page DOM<br>2. Query for `input`, `textarea`, `select`, `form` elements in main content area | No editable form controls (`input`, `textarea`, `select`) present in main content area outside global nav/search. Confirms FRD §1.2 read-only scope. | `project-information-full.png` | — | High | Draft |
| TC_PROJINFO_FUNC_011 | Visual memory — Navigation Sidebar | Buyer | Project Information | FUNC | Sidebar navigation links visible | Buyer on `/project` | 1. Observe left/top sidebar | Sidebar shows: Home, Registration, Allotment, Homeloan, Project (active), Work Progress, Logout. "Project" link is highlighted/active. | `project-information-loaded.png` | — | Medium | Draft |
| TC_PROJINFO_FUNC_012 | BUYER-BRD §3 (#8) | Buyer | Project Information | FUNC | Logout button visible and reachable on Project page | Buyer on `/project` | 1. Locate Logout button | `button.ant-btn` with text matching `/logout/i` is visible and enabled. | `project-information-loaded.png` | — | Medium | Draft |
| TC_PROJINFO_E2E_013 | BUYER-FS-PROJINFO §1.3 / How to Use Step 1 | Buyer | Project Information | E2E | Navigate to Project from sidebar from another page | Buyer logged in, currently on `/home` | 1. From `/home`, click "Project" link in sidebar<br>2. Wait for page load | URL transitions to `/project`. Page renders HoABL Naigaon heading, RERA ID, and at least one content section without errors. | `project-information-loaded.png` | — | High | Draft |
| TC_PROJINFO_NEG_014 | BUYER-FS-PROJINFO §1.3 — auth precondition | Buyer | Project Information | NEG | Unauthenticated access redirects to login | No active session (clear cookies/storage) | 1. Clear `fixtures/.auth/buyer.json` cookies in browser context<br>2. Navigate directly to `https://uat.xrportal.in/project` | User is redirected to root login page `https://uat.xrportal.in/`. Project content is not rendered. (INDEX.md §Page/Route confirms redirect to `/`.) | `project-information-loaded.png` (baseline) | No auth session | High | Draft |
| TC_PROJINFO_FUNC_015 | Visual memory — scrollable layout | Buyer | Project Information | FUNC | Scroll behaviour — full page reachable end-to-end | Buyer on `/project` | 1. Use mouse wheel or Page Down to scroll to bottom<br>2. Use Ctrl+Home or scroll-up to return to top | Page scrolls smoothly. Bottom of page is reachable (last visible content: SCIENCE BEHIND EVERY DETAIL — 2 BHK). Scroll-up returns to HoABL Naigaon heading without layout breakage. | `project-information-full.png` | — | Medium | Draft |
| TC_PROJINFO_UI_016 | BUYER-FS-PROJINFO §1.5 (#1) — Strapi-managed, no edit | Buyer | Project Information | UI | No edit / upload / delete controls on any content card | Buyer on `/project` | 1. Inspect each content card (videos, walkthrough, science blocks)<br>2. Look for edit/upload/delete icons or buttons | No edit, upload, delete, or admin controls present on any card. Content is display-only. Validates FRD §1.5 #1 — buyers cannot edit. | `project-information-full.png` | — | High | Draft |
| TC_PROJINFO_UI_017 | Visual memory — video durations | Buyer | Project Information | UI | Video duration overlays visible on hero and LOCATION video cards | Buyer on `/project` | 1. Locate hero video ("See the Vision Come Alive")<br>2. Locate LOCATION video ("Epicentre of Growth") | Duration "06:45" overlay visible on hero video card. Duration "03:39" overlay visible on Epicentre of Growth video card. | `project-information-loaded.png`, `project-info-scrolled.png` | — | Low | Draft |
| TC_PROJINFO_FUNC_018 | BUYER-FS-PROJINFO §1.3 (available pre/post allocation) | Buyer | Project Information | FUNC | Page accessible regardless of allocation status | Buyer with allocation status = not allocated (or any status) | 1. Log in as buyer with Status = Available (pre-allocation) on Home Dashboard<br>2. Navigate to `/project` | Page loads identically — HoABL Naigaon, RERA ID, all five sections render. Confirms FRD §1.5 #3 — content available from registration onward. | `project-information-loaded.png` | Buyer mobile: 8888888888 / OTP 258369 | Medium | Draft |
| TC_PROJINFO_REG_019 | Composite — page render integrity | Buyer | Project Information | REG | Regression — page renders without JS errors or 404s on assets | Buyer on `/project` | 1. Open DevTools → Console<br>2. Open DevTools → Network<br>3. Reload page | No red Console errors. No 4xx/5xx in Network for page assets (videos, images, JS, CSS) belonging to `uat.xrportal.in` origin. | `project-information-loaded.png` | — | High | Draft |
| TC_PROJINFO_EDGE_020 | Visual memory — viewport baseline | Buyer | Project Information | EDGE | Page layout intact at captured baseline viewport 1920×900 | Buyer on `/project` | 1. Set viewport to 1920×900<br>2. Compare rendered layout against `project-information-full.png` | Layout matches captured baseline — no overflow, no overlap, all headings and cards positioned as in screenshot. | `project-information-full.png` | Viewport: 1920×900 | Low | Draft |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Visual Evidence Status | Playwright Suite | Notes |
|-------|--------|------|-------------|------------|------------------------|------------------|-------|
| TC_PROJINFO_FUNC_001 | Project Information | FUNC | Yes | Low | FULL | e2e | Auth via storageState, URL + sidebar assertion |
| TC_PROJINFO_UI_002 | Project Information | UI | Yes | Low | FULL | ui-ux | `getByRole('heading', { name: 'HoABL Naigaon' })` |
| TC_PROJINFO_FUNC_003 | Project Information | FUNC | Yes | Low | FULL | e2e | `getByText('RERA ID: P99000080106')` assertion |
| TC_PROJINFO_UI_004 | Project Information | UI | Yes | Low | FULL | ui-ux | Heading + subtitle + duration text assertions |
| TC_PROJINFO_UI_005 | Project Information | UI | Yes | Low | FULL | ui-ux | Scroll-into-view then assert |
| TC_PROJINFO_UI_006 | Project Information | UI | Yes | Low | FULL | ui-ux | Scroll-into-view then assert |
| TC_PROJINFO_UI_007 | Project Information | UI | Yes | Low | FULL | ui-ux | First occurrence of "SCIENCE BEHIND EVERY DETAIL" |
| TC_PROJINFO_UI_008 | Project Information | UI | Yes | Low | FULL | ui-ux | Second occurrence using `.nth(1)` |
| TC_PROJINFO_FUNC_009 | Project Information | FUNC | Yes | Medium | FULL | e2e | Collect all headings, assert order |
| TC_PROJINFO_UI_010 | Project Information | UI | Yes | Low | FULL | ui-ux | Assert `input, textarea, select` count = 0 in `<main>` |
| TC_PROJINFO_FUNC_011 | Project Information | FUNC | Yes | Low | FULL | e2e | Sidebar link list assertion + active state |
| TC_PROJINFO_FUNC_012 | Project Information | FUNC | Yes | Low | FULL | e2e | Logout button visible/enabled |
| TC_PROJINFO_E2E_013 | Project Information | E2E | Yes | Low | FULL | e2e | Cross-page nav from /home → /project |
| TC_PROJINFO_NEG_014 | Project Information | NEG | Yes | Medium | FULL | e2e | Fresh `context()` without storageState, expect redirect |
| TC_PROJINFO_FUNC_015 | Project Information | FUNC | Yes | Medium | FULL | ui-ux | `page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))` |
| TC_PROJINFO_UI_016 | Project Information | UI | Yes | Medium | FULL | ui-ux | Assert no buttons matching /edit|upload|delete/i on cards |
| TC_PROJINFO_UI_017 | Project Information | UI | Yes | Low | FULL | ui-ux | Text contains "06:45" and "03:39" |
| TC_PROJINFO_FUNC_018 | Project Information | FUNC | Partial | Medium | FULL | e2e | Requires buyer with Available status — data-dependent |
| TC_PROJINFO_REG_019 | Project Information | REG | Yes | Medium | FULL | regression | `page.on('console')`, `page.on('response')` listeners |
| TC_PROJINFO_EDGE_020 | Project Information | EDGE | Partial | Medium | FULL | ui-ux | Visual diff vs baseline — needs `toHaveScreenshot()` baseline |

**Automation Coverage Summary**
- Total TCs: 20
- Fully automatable: 18 (90%)
- Partially automatable: 2 (10%)
- Visual evidence coverage: 20/20 = **100% (≥80% target met)**

---

## Sheet 3 — Bug Report Template

| Field | Value |
|-------|-------|
| Bug ID | BUG_NNN |
| TC_ID | TC_PROJINFO_XXX_NNN |
| Severity | Critical / High / Medium / Low |
| Module | Buyer / Project Information |
| Steps to Reproduce | 1. ...<br>2. ... |
| Actual Result | (what happened) |
| Expected Result | (per TC Expected Result column) |
| Environment | UAT — `https://uat.xrportal.in/project` |
| Browser / Viewport | Chrome / 1920×900 |
| Screenshot | (attach) |
| Visual Memory Reference | `visual-memory/buyer/project-information/<file>.png` |
| Status | Open / In Progress / Fixed / Verified / Closed |
| Reported By | |
| Reported On | YYYY-MM-DD |

---

## Test Data Spec

**Auth**
- Buyer mobile: `8888888888`
- OTP (UAT static): `258369` (per CLAUDE.md) — note BRD §4 #2 lists `147258`; reconcile before test execution. Flagged as **DATA_GAP** for QA Agent confirmation.
- Session file: `automation-repository/fixtures/.auth/buyer.json`

**Expected static content (Strapi-managed snapshot for HoABL Naigaon on UAT)**
- Project name: `HoABL Naigaon`
- RERA ID: `P99000080106`
- Hero video duration: `06:45`
- LOCATION video duration: `03:39`
- Section headings (in order): `See the Vision Come Alive`, `LOCATION`, `PROJECT WALKTHROUGH`, `SCIENCE BEHIND EVERY DETAIL` (×2)
- Sub-headings: `Epicentre of Growth`, `Your Future Growth Home – Development Walkthrough`, `Integrated Project Planning for 1 BHK`, `Integrated Project Planning for 2 BHK`

**Viewport**
- Desktop baseline: 1920×900

**Cleanup**
- None — read-only page, no state mutation

---

## Gaps and Flags

1. **FRD_GAP — Layout mismatch**: FRD §1.4 describes tabbed sections (Overview/Towers/Gallery/Documents/Videos). UAT UI is a scrollable single-page layout. Update FRD §1.4 to reflect captured structure.
2. **DATA_GAP — OTP mismatch**: BUYER-BRD §4 #2 says UAT OTP is `147258`; project CLAUDE.md says `258369`. Confirm correct value before automation.
3. **STRAPI_DEPENDENCY**: Content (videos, durations, headings) is Strapi-managed (FRD §1.5 #1, §1.5 #4). If admin republishes content, expected values in TC_PROJINFO_UI_004/005/006/007/008/017 must be re-baselined. Flag for QA Agent — consider asserting structural shape only (heading presence) vs exact text for re-baseline resilience.
4. **OUT_OF_SCOPE**: Video playback interaction (play/pause/seek) is not tested — INDEX.md §Note on Content states videos not interactive in test scope.

---

## Dual-Source Confirmation

| Source | Path | Status |
|--------|------|--------|
| Visual Memory | `visual-memory/buyer/project-information/INDEX.md` | FULL — present |
| BRD | `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` | present |
| FRD | `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Project-Information.md` | present |
| Dual-source gate | — | **PASSED** |

---

## Handoff

- **Next:** QA Agent → call `test-case-reviewer` skill with this file + INDEX.md path + FRD path
- **Then:** Tech Lead Agent → ensure locators for `h2`, `h3`, `h5`, `button.ant-btn` exist in `locators/buyer/locator-map.json` under `projectInformation` key
- **Then:** QA Agent → scaffold `automation-repository/pages/buyer/ProjectInformationPage.js` and `tests/{e2e,ui-ux,regression}/buyer/project-information.spec.js`
