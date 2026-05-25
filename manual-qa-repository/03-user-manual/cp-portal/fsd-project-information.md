# FSD — CP Portal: Project Information
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

Project Information is the CP Portal's read-only marketing/sales kit (project narrative, about, gallery, amenities, documents, key points, videos, brochure). It is **not served by XR Portal's backend** — the CP frontend fetches it directly from the Strapi CMS API.

Key architectural facts (source-verified):
- **No CP-facing project-info endpoint exists in the XR backend.** A `Grep` over `routes/cp.routes.js` for `project|tower|unit|brochure|floor|strapi` returns no matches. // Source: source-code/backend/src/routes/cp.routes.js (only registration, JBP, cp-user-* and KYC routes mounted)
- **The shared `commonRoutes` (towers / units / typologies) are restricted away from CP.** `common.routes.js:8` uses `restrictTo('user', 'admin', 'sales_manager_admin', 'sales_manager')` — the `'cp'` role is **not** in the allow-list. // Source: source-code/backend/src/routes/common.routes.js:8
- **`strapiService.getStrapiDetails()` is invoked only by `registration.controller.js`** (for buyer EOI pricing of apartments), **not from any CP controller**. // Source: Grep over `controllers/` for `strapiService` → only `registration.controller.js:23, 1090`; no hits in `cp.controller.js`.
- **CP frontend calls Strapi directly** at `${BaseURL}/api/projects/1?populate=deep` via the shared `Urls.js`. // Source: source-code/admin-sm-cp-portal/src/utils/Urls.js:7
- **There is no CP-specific project filtering or assignment table in the source.** Project access in `cp.controller.js` flows always use either `slug`-lookup or the hard-coded fallback `id: 2` (UAT) / `id: 1` (production via `app.production ? 1 : 2`). // Source: cp.controller.js:48, 529-531, 942

Therefore, this FSD documents:
1. The Strapi-served front-end content surfaces consumed by the CP UI.
2. The single XR-backend tangent that affects what CP sees: the master config + a Strapi token configured in `config/api.js`.
3. The brochure download path (Strapi-served URL surfaced by the CP UI).

---

## 2. Data Model

### 2.1 XR Portal backend — does NOT model project info for CP
There is no `project_info`, `project_documents`, `project_gallery`, `tower_listing_for_cp`, or similar table. // Source: directory listing of `source-code/backend/src/models/` (verified — no such files).

The only XR Portal Project model used by CP flows is the operational `projects` table:
// Source: source-code/backend/src/models/jbp-submission.model.js:42-51 (FK reference to `projects`)
- Used by CP only for lookup by `slug` in JBP & registration flows.
- Not exposed to CP via a `getProject` endpoint.

### 2.2 Strapi CMS — content surfaces consumed by CP frontend
Source for the data shape is the frontend components (the backend has no schema for these objects):
// Source: source-code/admin-sm-cp-portal/src/routes/Private/project1/

| UI surface | Field path consumed | Frontend file:line |
|------------|---------------------|--------------------|
| About — hero image | `data.aboutImage.data.attributes.url` | about.jsx:8 |
| Project Info — broker text | `data.brokerText` | projectInfo.jsx:10 |
| Project Info — long copy | `data.information` (HTML, newlines → `<br><br>`) | projectInfo.jsx:14 |
| Project Info — brochure | `data.brochure.data.attributes.url` | projectInfo.jsx:15-19 |
| Gallery / Amenities / Videos | (sibling files in same dir) | gallery.jsx, amenities.jsx, videos.jsx |

Frontend tab routes: `/project`, `/project1/about`, `/project1/gallery`, `/project1/amenities`, `/project1/documents`, `/project1/keyPoints`, `/project1/videos`. // Source: file listing of source-code/admin-sm-cp-portal/src/routes/Private/project1/ + project/

### 2.3 Strapi connection (configured in XR backend but not used for CP project fetch)
- `strapiClient` axios instance: baseUrl + token from `config/api.js → api.strapi`. // Source: source-code/backend/src/services/strapi.service.js:8, 19-25
- Auth: `Authorization: Bearer ${config.token}`. // Source: strapi.service.js:111-113
- Endpoint hit by `getStrapiDetails()`: `GET /api/projects/1?populate=deep`. // Source: strapi.service.js:117
- The CP frontend bypasses the XR backend and hits the same `/api/projects/1?populate=deep` directly. // Source: admin-sm-cp-portal/src/utils/Urls.js:7

---

## 3. State Machines

**Not applicable — there is no CP-side project state managed by the XR backend.**

The only state surface relevant to the CP "project view" is the master-config `allocation_status` and related keys (read via `/master-config/fetch`), which gate allocation visibility — those are out of scope for Project Information per BRD; documented under FSD-Allocation. // Source: source-code/backend/src/routes/index.js:84; constants used at admin-sm-cp-portal/src/utils/Urls.js:168-185.

---

## 4. Business Rules

### 4.1 Access control
- The CP frontend mounts the project routes (`/project*`) inside the authenticated app shell — gated by client-side auth state (the CP login token). // Source: route directory under `admin-sm-cp-portal/src/routes/Private/`
- No XR-backend authorization is applied to Strapi content fetch, because the CP browser calls Strapi directly with the public Strapi base URL + (optional) token. // Source: admin-sm-cp-portal/src/utils/Urls.js:7 — uses `BaseURL` which points at the Strapi host, not the XR API host
- No CP-project assignment / membership check exists anywhere in the XR backend. Any logged-in CP sees the same single project's content (project `id=1` in Strapi). // Source: NOT FOUND — verified by absence of assignment table/middleware

### 4.2 Project selection
- Strapi side: hard-coded `projects/1`. // Source: admin-sm-cp-portal/src/utils/Urls.js:7
- XR backend side (operational lookups): `Project.findOne({ where: { slug: projectSlug } })` or fallback `{ id: app.production ? 1 : 2 }`. // Source: cp.controller.js:529-531, 942; registration.controller.js (various)

### 4.3 Read-only contract
- All CP project surfaces are read-only by design — there is no `POST`, `PUT`, or `DELETE` route in `cp.routes.js` that mutates project content. // Source: source-code/backend/src/routes/cp.routes.js (verified — only registration/JBP/CP-user/KYC mutations)
- Content edits flow through Strapi admin (Strapi excluded from this FSD scope).

### 4.4 Brochure download
- The CP UI exposes a "Download Brochure" anchor when `data.brochure.data.attributes.url` is present. The URL points directly at the Strapi-hosted asset. // Source: admin-sm-cp-portal/src/routes/Private/project1/projectInfo.jsx:15-19
- No proxy / no presigned URL through XR backend. // Source: NOT FOUND — no `/cp/brochure` or `/cp/documents` route exists in cp.routes.js

### 4.5 HTML injection surface
- `projectInfo.jsx:14` injects `data.information` via `dangerouslySetInnerHTML` after a simple `replace(/\n\n/g, '<br /><br />')`. The content is trusted as it originates from Strapi admin authoring. // Source: admin-sm-cp-portal/src/routes/Private/project1/projectInfo.jsx:14

---

## 5. Notification Dispatch

**Not applicable — no notifications are sent for project-information events.**

Verified by:
- No `sendWhatsAppMessage`, `sendSMS`, or `emailService.*` calls in `cp.controller.js` outside of `submitJbp` (line 714) and `sendRegistrationLink` (line 1570, 1580). // Source: Grep over `cp.controller.js`
- No project-content controller exists to dispatch from. // Source: NOT FOUND

---

## 6. API Endpoints

### 6.1 CP-facing XR backend endpoints related to project content
**None.** There is no `/api/v1/cp/project*`, `/api/v1/cp/towers`, `/api/v1/cp/units`, `/api/v1/cp/brochure`, `/api/v1/cp/documents`, `/api/v1/cp/gallery`, or `/api/v1/cp/videos` route. // Source: source-code/backend/src/routes/cp.routes.js (full file inspected; 72 lines)

### 6.2 Shared routes the CP role is excluded from
| Method | Path | Allowed roles | Source |
|--------|------|---------------|--------|
| GET | `/api/v1/towers` | user, admin, sales_manager_admin, sales_manager | common.routes.js:8, 10 |
| GET | `/api/v1/towers/:towerId/units` | user, admin, sales_manager_admin, sales_manager | common.routes.js:8, 11 |
| GET | `/api/v1/projects/:projectId/unit-typologies` | user, admin, sales_manager_admin, sales_manager | common.routes.js:8, 12 |

→ A CP token calling any of the above will be rejected by `restrictTo`. // Source: common.routes.js:8

### 6.3 External Strapi endpoints the CP frontend calls directly
| Method | URL | Purpose | Source |
|--------|-----|---------|--------|
| GET | `${BaseURL}/api/projects/1?populate=deep` | Fetch all project content (about, gallery, amenities, documents, key points, videos, brochure) | admin-sm-cp-portal/src/utils/Urls.js:7 |
| GET | `${BaseURL}/api/forms?populate=deep` | Fetch form metadata | admin-sm-cp-portal/src/utils/Urls.js:5 |

Note: `BaseURL` is `import.meta.env.NEXT_PUBLIC_BASE_URL` and is the Strapi host (NOT `apiUrls` which target the XR backend). // Source: admin-sm-cp-portal/src/utils/Urls.js:1, 10

### 6.4 XR backend → Strapi (server-to-server)
Used by `registration.controller.js` only, not by CP project info. Documented here for completeness.
- `GET ${strapi.baseUrl}/api/projects/1?populate=deep` (Bearer token). // Source: strapi.service.js:115-122

---

## 7. Known Bugs / Gaps

| ID | Bug / Gap | Source |
|----|-----------|--------|
| CP-PI-001 | **Strapi token validity not logged on CP fetch.** Token presence is warned only when XR backend boots (`strapi.service.js:11-15`). The CP browser-side fetch carries no XR-issued auth — if Strapi token expires or auth changes, CP UI silently breaks with no XR-side observability. // Source: strapi.service.js:11-15 + admin-sm-cp-portal/src/utils/Urls.js:7 |
| CP-PI-002 | **Hard-coded project id `1` in CP frontend.** When a second project ships in Strapi, every CP will continue to see project 1. No `projectSlug` parameterization. // Source: admin-sm-cp-portal/src/utils/Urls.js:7 |
| CP-PI-003 | **No CP-project assignment.** Any CP can read any project content; cannot scope by partner agreement. // Source: NOT FOUND — verified absence |
| CP-PI-004 | **`dangerouslySetInnerHTML` on Strapi-authored `information` field.** Trusts authors completely; an admin XSS via Strapi WYSIWYG would execute in CP browsers. // Source: admin-sm-cp-portal/src/routes/Private/project1/projectInfo.jsx:14 |
| CP-PI-005 | **Brochure URL unsigned & cacheable.** `data.brochure.data.attributes.url` is the raw Strapi asset URL — anyone with the URL can share it externally; not gated by CP login. // Source: projectInfo.jsx:15-19 |
| CP-PI-006 | **`commonRoutes` are mounted at root via `router.use(commonRoutes)` without prefix.** CP-restricted routes (`/towers`, `/towers/:id/units`, `/projects/:id/unit-typologies`) sit at the API root and return 403 to CP — confirm the CP UI never assumes these. // Source: routes/index.js:77; common.routes.js:8-12 |
| CP-PI-007 | **No fallback when Strapi is unreachable.** `getStrapi()` in `registration.controller.js:1088-1144` throws and surfaces a generic error; CP frontend (direct fetch) will show a broken UI with no XR-side circuit breaker. // Source: registration.controller.js:1088-1144 |
| CP-PI-008 | **No documented schema contract between Strapi and CP UI.** Frontend accesses deeply-nested paths like `data.aboutImage.data.attributes.url`; any Strapi v4→v5-style flattening will silently render blanks. // Source: about.jsx:8, projectInfo.jsx:10-19 |
| CP-PI-009 | **`information` whitespace conversion is naive.** Only `\n\n` (double newline) is converted to `<br /><br />`; single newlines are dropped. Authors using a single Enter will see runs of text collapsed. // Source: projectInfo.jsx:14 |

---

## 8. QA Risk Areas

1. **Direct-to-Strapi fetch reliability** — CP browser calls Strapi outside the XR backend. Test the failure modes: Strapi down, slow, 401, 5xx — confirm no white-screen, ideally a friendly error.
2. **Hard-coded project id `1`** (CP-PI-002) — verify by checking the CP UI continues to render project 1 even after admin adds a project 2 in Strapi.
3. **Role gating** — confirm CP tokens are rejected by `/api/v1/towers` and `/api/v1/projects/:projectId/unit-typologies` (CP-PI-006). // Source: common.routes.js:8
4. **Brochure download** — verify `Download Brochure` button is hidden when `data.brochure.data.attributes.url` is null/undefined and works when present. // Source: projectInfo.jsx:15
5. **Brochure URL leak** (CP-PI-005) — confirm whether the brochure URL needs to be gated; if yes, file as a security gap.
6. **HTML/XSS injection** (CP-PI-004) — attempt content with `<script>` tags via Strapi to confirm WYSIWYG sanitization; current frontend does not sanitize.
7. **Single-newline rendering** (CP-PI-009) — verify author guidance: must use double-newline between paragraphs.
8. **Network call isolation** — record CP browser network tab; confirm only Strapi `/api/projects/1?populate=deep`, `/api/forms?populate=deep`, plus XR `/api/v1/*` calls are made for the project pages. No accidental calls into Admin/SM endpoints.
9. **Long copy / large image rendering** — `populate=deep` may return large payloads; measure first-paint with realistic Strapi content size.
10. **No backend audit trail** — content views are not logged in XR Portal. If business wants engagement metrics, file as gap.
11. **Auth-shell only** — `Private` route group depends on CP session being valid; verify deep-link to `/project1/gallery` redirects to login when token absent/expired.
12. **Cross-portal route reuse** — same `admin-sm-cp-portal` codebase serves admin, SM and CP roles. Verify CP build/feature flag does NOT expose admin/SM-only sub-pages (e.g., Customers, Tower Listing) on the CP role. // Source: admin-sm-cp-portal/src/routes/Private/ (mixed-role directory structure)
13. **Strapi v4 attribute path coupling** (CP-PI-008) — write a smoke check parsing the deep nesting; will alert on any Strapi shape regression.
14. **CMS author preview parity** — Strapi `populate=deep` returns draft + published; confirm CP only sees published content (verify Strapi publication state in fetched payload).
