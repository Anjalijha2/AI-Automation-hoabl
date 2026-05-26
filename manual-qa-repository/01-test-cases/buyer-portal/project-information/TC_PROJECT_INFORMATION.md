# Test Cases — Project Information
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Project-Information.md

---

## Project Info — Access & Navigation

### BYR_PROJ_001 — Project section accessible from main navigation

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Inspect main nav<br>2. Click Project menu item |
| **Expected Result** | Navigation succeeds; URL = `/project`; project page renders |
| **Priority** | Critical |

---

### BYR_PROJ_002 — Available pre- and post-allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Buyer logged in (any status: pre-allocation, Available, WINNER, Waitlisted) |
| **Test Steps** | 1. Open `/project` |
| **Expected Result** | Page loads for all buyer journey states |
| **Priority** | High |

---

### BYR_PROJ_003 — Top bar shows tab navigation

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Project page open |
| **Test Steps** | 1. Inspect TopBarProject tabs |
| **Expected Result** | Tabs visible: Overview, Towers, Gallery, Documents, Videos |
| **Priority** | High |

---

## Project Info — Overview Tab

### BYR_PROJ_004 — Overview tab is default selected

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Project page loaded |
| **Test Steps** | 1. Check which tab is active on load |
| **Expected Result** | Overview tab active by default; overview content visible |
| **Priority** | Medium |

---

### BYR_PROJ_005 — Overview renders Strapi-managed content

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Strapi has overview content published |
| **Test Steps** | 1. Inspect overview text/images |
| **Expected Result** | Project description, hero image and highlights render per Strapi config |
| **Priority** | High |

---

## Project Info — Towers Tab

### BYR_PROJ_006 — Click Towers tab loads tower specs

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Project page open |
| **Test Steps** | 1. Click Towers tab |
| **Expected Result** | TowerSection renders; tower list (Crest, Crown, Blossom, Pinnacle, Bright, etc.) visible |
| **Priority** | High |

---

### BYR_PROJ_007 — Each tower tab shows its specifications

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Towers tab active |
| **Test Steps** | 1. Click each TowerTabs entry<br>2. Inspect specs panel |
| **Expected Result** | Per-tower data renders: height, typologies, configurations, total units |
| **Priority** | High |

---

### BYR_PROJ_008 — Tower specs are read-only

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Tower specs visible |
| **Test Steps** | 1. Try clicking values / editing |
| **Expected Result** | No editable inputs; everything read-only |
| **Priority** | Medium |

---

## Project Info — Gallery Tab

### BYR_PROJ_009 — Click Gallery tab loads photo grid

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Project page open, Gallery content published |
| **Test Steps** | 1. Click Gallery tab |
| **Expected Result** | Photo thumbnails render in grid layout |
| **Priority** | High |

---

### BYR_PROJ_010 — Gallery image opens lightbox on click

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Gallery loaded |
| **Test Steps** | 1. Click any thumbnail |
| **Expected Result** | Lightbox/modal opens with larger image, prev/next controls |
| **Priority** | Medium |

---

### BYR_PROJ_011 — Lightbox navigation prev/next works

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Lightbox open |
| **Test Steps** | 1. Click Next arrow<br>2. Click Prev arrow |
| **Expected Result** | Image cycles through gallery in both directions |
| **Priority** | Low |

---

### BYR_PROJ_012 — Lightbox closes on X or ESC

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Lightbox open |
| **Test Steps** | 1. Press ESC<br>2. Reopen and click X |
| **Expected Result** | Both close the lightbox |
| **Priority** | Low |

---

### BYR_PROJ_013 — Gallery empty state when no images published

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Strapi gallery empty |
| **Test Steps** | 1. Open Gallery tab |
| **Expected Result** | Empty state message ("No images yet") rendered; no broken thumbnails |
| **Priority** | Low |

---

## Project Info — Documents Tab

### BYR_PROJ_014 — Click Documents tab lists all documents

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Documents published in Strapi |
| **Test Steps** | 1. Click Documents tab |
| **Expected Result** | List of documents renders (RERA, approvals, brochures) with titles |
| **Priority** | Critical |

---

### BYR_PROJ_015 — RERA document available for legal compliance

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | RERA document published |
| **Test Steps** | 1. Locate "RERA Registration" document<br>2. Inspect availability |
| **Expected Result** | RERA document listed and downloadable |
| **Priority** | Critical |

---

### BYR_PROJ_016 — Document view/download works

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Document list visible |
| **Test Steps** | 1. Click View or Download on a document |
| **Expected Result** | PDF opens in new tab or downloads to disk |
| **Priority** | High |

---

### BYR_PROJ_017 — Project brochure download works

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Brochure published |
| **Test Steps** | 1. Click brochure download |
| **Expected Result** | Brochure PDF downloaded |
| **Priority** | Medium |

---

## Project Info — Videos Tab

### BYR_PROJ_018 — Click Videos tab lists project videos

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Videos published in Strapi |
| **Test Steps** | 1. Click Videos tab |
| **Expected Result** | Video thumbnails render with titles and play button |
| **Priority** | High |

---

### BYR_PROJ_019 — Video plays inline on click

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Videos tab loaded |
| **Test Steps** | 1. Click thumbnail / play button |
| **Expected Result** | Video player loads and starts streaming |
| **Priority** | High |

---

### BYR_PROJ_020 — Video player has standard controls

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Video playing |
| **Test Steps** | 1. Inspect controls (play/pause, volume, fullscreen, scrub) |
| **Expected Result** | All controls functional |
| **Priority** | Medium |

---

### BYR_PROJ_021 — Videos empty state when none published

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Strapi videos empty |
| **Test Steps** | 1. Open Videos tab |
| **Expected Result** | Empty state shown; no broken video boxes |
| **Priority** | Low |

---

## Project Info — Content Refresh & Negative Cases

### BYR_PROJ_022 — Strapi content publish reflects on reload

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | New content published in Strapi |
| **Test Steps** | 1. Reload project page |
| **Expected Result** | New content visible without code deploy |
| **Priority** | High |

---

### BYR_PROJ_023 — Strapi outage shows graceful fallback

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Strapi API simulated unreachable |
| **Test Steps** | 1. Open `/project` |
| **Expected Result** | Page does not crash; cached content or empty-state with retry |
| **Priority** | Medium |

---

### BYR_PROJ_024 — Tab state preserved on browser back

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Documents tab open, navigated to another page |
| **Test Steps** | 1. Click browser Back |
| **Expected Result** | Returns to Documents tab specifically (deep-link or state preserved) |
| **Priority** | Low |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-project-information.md`

### Corrections to existing TCs
- **BYR_PROJ_001 / BYR_PROJ_003 / BYR_PROJ_005-021** — There is NO buyer-facing backend endpoint for project info, amenities, gallery, brochure, documents, or videos. `GET /project`, `GET /amenities`, `GET /gallery`, `GET /brochure`, `GET /specifications` do NOT exist (FSD §6.3 "Endpoints NOT found"). The frontend MUST hit Strapi directly OR these TCs are testing fictional UI features. Verify with frontend team whether the buyer client calls Strapi from the browser (CORS, token exposure risk).
- **BYR_PROJ_007 / BYR_PROJ_015** — `mahareraNumber` IS exposed via `getDynamicTemplateData` (allocation/unit-details endpoint) — but only inside the cost-sheet response for a specific unit. There is no project-level endpoint returning it.
- **BYR_PROJ_022** — Strapi has only ONE server-side consumer: `strapiService.getStrapiDetails` called via `GET <STRAPI_BASE_URL>/api/projects/1?populate=deep` for apartment-config validation in `submitEoi` (services/strapi.service.js:115-132). The `1` is hardcoded — Strapi serves project ID 1 regardless of env (this differs from backend DB which uses 2 on non-prod).
- **BYR_PROJ_023** — Confirmed: Strapi outage returns 500 to `submitEoi`, blocking EOI submission. There is no graceful fallback / cache (BR-PI-005).

### New TCs added below

### BYR_PROJ_025 — registrationNumberPrefix missing blocks EOI

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Seed Project row with `registrationNumberPrefix=NULL` for active projectId |
| **Test Steps** | 1. `POST /api/v1/registration/order` (EOI submit) |
| **Expected Result** | 400 "Invalid project" (controllers/registration.controller.js:1213-1218) |
| **Priority** | High |

---

### BYR_PROJ_026 — Strapi project ID is hardcoded to 1

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | UAT environment (backend DB projectId=2) |
| **Test Steps** | 1. Monitor outbound calls to Strapi during EOI submit |
| **Expected Result** | Strapi URL = `GET <STRAPI_BASE>/api/projects/1?populate=deep` (services/strapi.service.js:117). Hardcoded `1` — does NOT match backend project resolution. Document drift. |
| **Priority** | Medium |

---

### BYR_PROJ_027 — Project.isActive=false NOT enforced

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Set `projects.is_active=false` for active projectId |
| **Test Steps** | 1. Login and submit EOI |
| **Expected Result** | EOI still processes — `isActive` is NOT filtered in buyer paths (BUG GAP, FSD §7.2). Document as risk. |
| **Priority** | Medium |

---

### BYR_PROJ_028 — Unknown apartmentType during EOI returns 400 from Strapi gate

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Strapi master does not contain apartmentType "5BHK Penthouse" |
| **Test Steps** | 1. Submit EOI with `apartmentType: "5BHK Penthouse"` |
| **Expected Result** | 400 "Invalid Apartment Type" (controllers/registration.controller.js:1123-1137) |
| **Priority** | High |

---

### BYR_PROJ_029 — projectId hardcoded by NODE_ENV

| Field | Value |
|-------|-------|
| **Module** | BYR – Project Info |
| **Pre-conditions** | Any environment |
| **Test Steps** | 1. Inspect backend env<br>2. Compare projectId in registration flows |
| **Expected Result** | production → 1, non-prod → 2 (controllers/registration.controller.js:1170, 2337). Documented as known constraint — multi-project rollout requires code change, not config (BUG-DASH-004). |
| **Priority** | Medium |
