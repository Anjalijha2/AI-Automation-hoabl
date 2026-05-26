# Test Cases — Project Information
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Project-Information.md

---

## Navigation and Access

### CP_PROJ_001 — Open Project Information from main nav

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP logged in |
| **Test Steps** | 1. Click **Project** in the navigation menu |
| **Expected Result** | URL updates to `/project`; project overview page renders with section tabs |
| **Priority** | High |

---

### CP_PROJ_002 — Section tabs are visible

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Project overview open |
| **Test Steps** | 1. Inspect tab bar |
| **Expected Result** | Tabs displayed: About, Gallery, Amenities, Documents, Key Points, Videos |
| **Priority** | High |

---

### CP_PROJ_003 — Direct URL `/project1/about` loads About page

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `https://uat.xrportal.in/project1/about` |
| **Expected Result** | About page loads with project background, location, developer info |
| **Priority** | Critical |

---

### CP_PROJ_004 — Direct URL `/project1/gallery` loads Gallery

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/gallery` |
| **Expected Result** | Gallery page loads with project photos |
| **Priority** | High |

---

### CP_PROJ_005 — Direct URL `/project1/amenities` loads Amenities

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/amenities` |
| **Expected Result** | Amenities list renders with feature names and possible icons |
| **Priority** | High |

---

### CP_PROJ_006 — Direct URL `/project1/documents` loads Documents

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/documents` |
| **Expected Result** | Documents page shows RERA, approvals, brochures with download links |
| **Priority** | Critical |

---

### CP_PROJ_007 — Direct URL `/project1/keyPoints` loads Key Points

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/keyPoints` |
| **Expected Result** | Key selling points list renders |
| **Priority** | Medium |

---

### CP_PROJ_008 — Direct URL `/project1/videos` loads Videos

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/videos` |
| **Expected Result** | Video gallery renders with embedded players or thumbnails |
| **Priority** | High |

---

### CP_PROJ_009 — Logged-out user redirected from project pages

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | No session |
| **Test Steps** | 1. Open `/project1/about` directly in a fresh browser |
| **Expected Result** | Redirect to `/login` |
| **Priority** | High |

---

## About Section

### CP_PROJ_010 — About displays project background text

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | About page open |
| **Test Steps** | 1. Scroll through About content |
| **Expected Result** | Paragraphs describing project background, location, and developer are visible |
| **Priority** | High |

---

### CP_PROJ_011 — About is read-only — no edit controls present

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | About page open |
| **Test Steps** | 1. Inspect page for Edit / Save / Delete actions |
| **Expected Result** | No edit controls; content is read-only |
| **Priority** | Critical |

---

## Gallery

### CP_PROJ_012 — Gallery loads project photos in grid

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Gallery page open |
| **Test Steps** | 1. Scroll Gallery grid |
| **Expected Result** | Photos render in a grid layout; images load without 404s |
| **Priority** | High |

---

### CP_PROJ_013 — Click a photo opens larger view

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Gallery has at least one image |
| **Test Steps** | 1. Click any thumbnail |
| **Expected Result** | Lightbox / modal opens displaying the full-size image with close control |
| **Priority** | Medium |

---

### CP_PROJ_014 — Empty Gallery shows placeholder

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Strapi returns no images |
| **Test Steps** | 1. Open Gallery |
| **Expected Result** | Empty-state message such as "No photos available yet" is displayed |
| **Priority** | Low |

---

## Amenities

### CP_PROJ_015 — Amenities list renders with names

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Amenities page open |
| **Test Steps** | 1. Read items in the amenities list |
| **Expected Result** | Amenity names displayed; categories or icons present per Strapi configuration |
| **Priority** | High |

---

### CP_PROJ_016 — Amenities content is read-only

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Amenities open |
| **Test Steps** | 1. Look for any input or edit action |
| **Expected Result** | No editable controls available |
| **Priority** | Medium |

---

## Documents

### CP_PROJ_017 — RERA document is listed

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Documents page open |
| **Test Steps** | 1. Scan the document list |
| **Expected Result** | At least one entry labelled RERA Registration is present |
| **Priority** | Critical |

---

### CP_PROJ_018 — Download a document

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Documents page lists items |
| **Test Steps** | 1. Click Download on a document |
| **Expected Result** | Browser initiates download or opens the document in a new tab |
| **Priority** | High |

---

### CP_PROJ_019 — Documents are read-only — no upload control

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Documents page open |
| **Test Steps** | 1. Look for any Upload / Delete control |
| **Expected Result** | No upload/edit controls visible — content fully read-only |
| **Priority** | Critical |

---

## Key Points

### CP_PROJ_020 — Key Points list is displayed

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Key Points page open |
| **Test Steps** | 1. Scroll list |
| **Expected Result** | Bullet/numbered list of key selling points renders as content |
| **Priority** | High |

---

### CP_PROJ_021 — Key Points are read-only

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Key Points page open |
| **Test Steps** | 1. Look for Edit/Add controls |
| **Expected Result** | No edit controls present |
| **Priority** | Medium |

---

## Videos

### CP_PROJ_022 — Videos page lists video thumbnails

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Videos page open |
| **Test Steps** | 1. Scroll list of videos |
| **Expected Result** | Video thumbnails or embeds render |
| **Priority** | High |

---

### CP_PROJ_023 — Click a video plays it inline

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Video page has at least one item |
| **Test Steps** | 1. Click a video<br>2. Click play |
| **Expected Result** | Video plays inline using the embedded player; controls work |
| **Priority** | Medium |

---

## Sharing and Content Source

### CP_PROJ_024 — Copy / share section link

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Any project subpage open |
| **Test Steps** | 1. Copy the URL from the address bar<br>2. Paste into a new tab while logged in |
| **Expected Result** | Same section page loads from the copied URL |
| **Priority** | Medium |

---

### CP_PROJ_025 — Content reflects latest Strapi publish

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Admin has published an update in Strapi CMS |
| **Test Steps** | 1. Open the affected section in CP portal<br>2. Hard refresh |
| **Expected Result** | Updated content is visible reflecting the latest Strapi publish |
| **Priority** | High |

---

### CP_PROJ_026 — All sections accessible regardless of allocation campaign state

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Allocation campaign is closed for the project |
| **Test Steps** | 1. Open each project section |
| **Expected Result** | All sections remain accessible to CPs regardless of campaign status |
| **Priority** | Medium |

---

### CP_PROJ_027 — Master CP and Member CP have identical access (no per-CP project assignment)

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Master CP M; Member CP N |
| **Test Steps** | 1. Login as M, monitor Strapi requests<br>2. Login as N, monitor Strapi requests |
| **Expected Result** | Both fetch identical content from `<StrapiBase>/api/projects/1?populate=deep`. There is NO CP-project assignment table — every CP sees the same project (CP-PI-003). Document. |
| **Priority** | Medium |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/cp-portal/fsd-project-information.md`

### CRITICAL CORRECTION — There is NO XR backend endpoint for CP project info
All project content is fetched **DIRECTLY from Strapi by the CP browser** at `${BaseURL}/api/projects/1?populate=deep` (admin-sm-cp-portal/src/utils/Urls.js:7). The XR backend has NO `/api/v1/cp/project*`, `/towers`, `/units`, `/brochure`, `/documents`, `/gallery`, `/videos` routes (FSD §6.1).

The shared `commonRoutes` (`/api/v1/towers`, `/api/v1/projects/:id/unit-typologies`) explicitly EXCLUDE the `cp` role from `restrictTo` whitelist (common.routes.js:8 — only `user, admin, sales_manager_admin, sales_manager`). A CP token calling those will be rejected with 403.

### Corrections to existing TCs
- **CP_PROJ_001-009** — Routes are FRONTEND-only (`/project`, `/project1/about` etc. served by Next.js / Vite app shell). No backend endpoint. All data comes from Strapi.
- **CP_PROJ_003-008** — Hardcoded `project1` in URL maps to hardcoded `projects/1` in Strapi (CP-PI-002). Even if backend operational projectId is 2 (UAT), Strapi content always comes from project 1 (drift).
- **CP_PROJ_011 / CP_PROJ_016 / CP_PROJ_019 / CP_PROJ_021** — Confirmed: no backend mutation routes exist. Read-only by design (BR §4.3).
- **CP_PROJ_017-019** — Documents page sources from Strapi `data.brochure.data.attributes.url` and similar — raw Strapi asset URLs, unsigned, cacheable (CP-PI-005). Anyone with URL can share externally — not gated by CP login.
- **CP_PROJ_025** — No ISR / no caching by XR backend — every CP browser hit goes to Strapi. Hard refresh shows latest published content immediately, but Strapi `populate=deep` returns DRAFT + PUBLISHED — verify only published shows (CP-PI-008, QA-Risk-14).

### New TCs added below

### CP_PROJ_028 — XR backend has NO CP project route (verify by 404)

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP JWT |
| **Test Steps** | 1. `GET /api/v1/cp/project` with CP JWT<br>2. `GET /api/v1/cp/brochure`<br>3. `GET /api/v1/cp/documents` |
| **Expected Result** | All return 404 — no such routes mounted (FSD §6.1, cp.routes.js verified). |
| **Priority** | High |

---

### CP_PROJ_029 — CP token rejected on shared commonRoutes

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Valid CP JWT |
| **Test Steps** | 1. `GET /api/v1/towers` with CP JWT<br>2. `GET /api/v1/projects/2/unit-typologies` |
| **Expected Result** | 403 — `cp` role NOT in `restrictTo('user', 'admin', 'sales_manager_admin', 'sales_manager')` (common.routes.js:8). |
| **Priority** | High (Security) |

---

### CP_PROJ_030 — Frontend fetches Strapi directly (no XR proxy)

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP logged in, network tab open |
| **Test Steps** | 1. Open `/project1/about`<br>2. Inspect network requests |
| **Expected Result** | Direct `GET <BaseURL>/api/projects/1?populate=deep` to Strapi host. NO request to XR backend `/api/v1/*` for project content (Urls.js:7). |
| **Priority** | High |

---

### CP_PROJ_031 — Project ID hardcoded to `1` regardless of env

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | UAT (backend projectId=2) |
| **Test Steps** | 1. Inspect Strapi URL |
| **Expected Result** | URL = `<StrapiBase>/api/projects/1?populate=deep` (CP-PI-002, Urls.js:7). Mismatched with backend project resolution — drift if Strapi project 1 differs from backend project 2. |
| **Priority** | Medium |

---

### CP_PROJ_032 — Strapi outage breaks CP project pages silently

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Block Strapi URL in browser |
| **Test Steps** | 1. Open `/project1/about` |
| **Expected Result** | Frontend fails to render — no XR-side circuit breaker / cache (CP-PI-007). UI may white-screen. Document accessibility implications. |
| **Priority** | Medium |

---

### CP_PROJ_033 — `information` field XSS via Strapi WYSIWYG (potential)

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Admin can write to Strapi `information` field |
| **Test Steps** | 1. Insert `<script>alert(1)</script>` via Strapi admin<br>2. Open `/project1/projectInfo` |
| **Expected Result** | Script executes in CP browser — frontend uses `dangerouslySetInnerHTML` without sanitization (CP-PI-004, projectInfo.jsx:14). Trust boundary depends entirely on Strapi authoring controls. Document as security gap. |
| **Priority** | High (Security) |

---

### CP_PROJ_034 — Brochure URL is unsigned Strapi asset (shareable externally)

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Project info page open with brochure published |
| **Test Steps** | 1. Copy brochure URL from `data.brochure.data.attributes.url`<br>2. Open in incognito (no CP session) |
| **Expected Result** | PDF downloads without auth — raw Strapi URL, no presigned/expiry (CP-PI-005). Confirm with security if acceptable. |
| **Priority** | Medium (Security) |

---

### CP_PROJ_035 — Single-newline whitespace in `information` collapses (UX gap)

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Author writes content with single newlines between sentences |
| **Test Steps** | 1. Render Project Info page |
| **Expected Result** | Single `\n` is dropped; only `\n\n` converted to `<br /><br />` (CP-PI-009, projectInfo.jsx:14). Authors must use double-newline. |
| **Priority** | Low |

---

### CP_PROJ_036 — No analytics / view tracking on project pages

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP browses project pages |
| **Test Steps** | 1. Browse all sections<br>2. Check XR DB / logs for view tracking |
| **Expected Result** | No tracking exists in XR Portal (QA-Risk-10). If engagement metrics needed, file as gap. |
| **Priority** | Low |
