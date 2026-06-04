# Test Data Spec — Work Progress — Buyer Portal

**Module:** Work Progress
**Portal:** Buyer
**URL:** https://uat.xrportal.in/work-progress
**Generated:** 2026-06-03
**Related:** `TestCases.md` (sibling file)

---

## Valid Inputs

This module has no user input fields (read-only per BUYER-FS-Work-Progress §1.2). "Inputs" below means clickable UI affordances and session state that drive page behaviour.

| Field | Valid Values | Notes |
|---|---|---|
| Buyer session | Active session loaded from `automation-repository/fixtures/.auth/buyer.json` | Required for all TCs except TC_WP_NEG_001 |
| Buyer mobile (auth setup) | `8888888888` | UAT static credential per CLAUDE.md |
| Buyer OTP (auth setup) | `258369` | UAT static OTP |
| Tower tab label | One of `Crest`, `Prestige`, `Triumph`, `Crown`, `Horizon`, `Radiance`, `Aspire`, `Preview` | Exact case as displayed; from `visual-memory/buyer/work-progress/INDEX.md` Key Structural Notes |
| Logout action | Click `button.ant-btn` matching `/logout/i` | Single action button on the page |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Behaviour |
|---|---|---|
| Session state | No session (empty storage state, no cookies for `uat.xrportal.in`) | Direct navigation to `/work-progress` redirects to `/` (TC_WP_NEG_001) |
| Tower tab label | Any label not in the 8-tower list | Not testable via UI — tab does not exist; if forced via DOM script, no content panel updates |
| Page action | Any attempt to input/edit content | Not testable via UI — no input/textarea/comment/upload elements present (TC_WP_BIZ_002) |

---

## Pre-conditions

- **Auth (positive TCs):** valid buyer session in `automation-repository/fixtures/.auth/buyer.json`. Run `npm run auth:setup` if expired.
- **Auth (TC_WP_NEG_001):** new browser context with empty `storageState` — no cookies, no localStorage for `uat.xrportal.in`.
- **Allocation stage (TC_WP_BIZ_003):** TWO buyer accounts required:
  - Buyer A — registered but no unit allocated (pre-allocation)
  - Buyer B — has an allocated unit (post-allocation)
  - If only one is available, mark the missing variant as `not-tested` and rerun when seed data is available.
- **Project / tower data:** test project `HoABL Naigaon` must exist in UAT with exactly the 8 towers above. If CMS removes/renames a tower, TC_WP_UI_002 will fail by design — raise a BUG and consult Admin team before updating expected list.
- **Viewport:** desktop 1920×900 (matches `visual-memory/buyer/work-progress/*.png` baselines).

---

## Cleanup / Teardown

- **No data created** by any TC in this module — Work Progress is read-only. No teardown required.
- **TC_WP_FUNC_009 (Logout):** session file `fixtures/.auth/buyer.json` may need to be refreshed afterwards if the test runner reuses storage state. Best practice: this TC runs in an isolated context that does not write back to the shared session file.
- **TC_WP_NEG_001:** ensure the test does not pollute the shared buyer session — use a fresh context with `storageState: undefined`.

---

## Notes on Content Stability

- Construction progress content is **CMS-driven** (BUYER-FS-Work-Progress §1.5 rule 1). Admin team updates photos and descriptions via Strapi (out of scope for this module's tests).
- Assertions on content text/images must check **presence and per-tab differences**, NOT literal strings. Otherwise tests will false-fail every time the admin team publishes an update.
- Reference body text observed at capture time: `"Building 4 - view test & B..."` — use as a smoke check that *some* content rendered, not as an exact match.

---

## Cross-References

- BRD: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md` (nav item 11)
- FRD: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Work-Progress.md` (Feature 1)
- Visual memory: `visual-memory/buyer/work-progress/INDEX.md` (CAPTURE_STATUS: FULL)
- Test cases: `manual-qa-repository/01-test-cases/buyer/work-progress/TestCases.md`
