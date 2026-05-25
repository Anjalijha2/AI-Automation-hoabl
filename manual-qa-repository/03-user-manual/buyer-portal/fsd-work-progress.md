# FSD — Buyer Portal: Work Progress
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Work Progress module is a **read-only marketing/construction-update page** rendered by the Next.js buyer portal at `/work-progress`. It shows a project-level banner video and a tabbed gallery of tower-wise construction images. All content originates from Strapi CMS — there is no dedicated work-progress entity, controller, route, service, or model in the XR Portal Node backend (`source-code/backend/src/`). Per project constraints, Strapi source code is excluded from scans; this FSD documents only the buyer-portal-side consumption.

- Frontend route: `/work-progress` (Next.js server component, `revalidate = 10` seconds) // Source: source-code/buyer-portal/src/app/work-progress/page.js:1-11
- Sidebar entry: `{ title: 'Work Progress', link: '/work-progress' }` // Source: source-code/buyer-portal/src/components/Sidebar.js:170-171
- Bottom-nav entry: active-state aware link to `/work-progress` // Source: source-code/buyer-portal/src/components/BottomNavigationBar.jsx:140-149
- Page composition:
  1. Sidebar // Source: work-progress/page.js:30
  2. Marquee banner // Source: work-progress/page.js:31
  3. MobileTopBar + TopBarProject // Source: work-progress/page.js:34-35
  4. Full-bleed muted autoplay looping banner video with title + subtitle overlay // Source: work-progress/page.js:36-53
  5. `<TowerSection>` → `<TowerTabs>` gallery (the actual "work progress" content) // Source: work-progress/page.js:55, source-code/buyer-portal/src/components/project/TowerSection.js, source-code/buyer-portal/src/components/project/TowerTabs.js
  6. BottomNavigationBar // Source: work-progress/page.js:58-60
- **No XR Portal backend module exists** for `workProgress`, `constructionUpdate`, `milestone-update`, `siteUpdate`, or any synonym in `source-code/backend/src/`. // Source: grep over backend/src for `work.progress|workProgress|construction.update|site.update` — no matches

---

## 2. Data Model

There is no XR Portal Node DB table for work progress. All data is sourced from Strapi via a single GET call.

### Data sourced from Strapi (read-only)
// Source: source-code/buyer-portal/src/utils/urls.js:7-8, source-code/buyer-portal/src/app/work-progress/page.js:13-19

Endpoint hit:
- `GET {strapi_base_url}/api/projects/1?populate=deep` // Source: urls.js:7-8

Strapi-side schema **NOT FOUND — verify manually** (Strapi is excluded from source scans per project constraint). The buyer portal *reads* the following shape:

| Field path on response | Used as | Source |
|---|---|---|
| `data.attributes.workBannerVideo.data.attributes.url` | `<video src>` for top banner | work-progress/page.js:24, 39 |
| `data.attributes.projectSection[?].__component === 'project-section.video-caption-configration'` → `VideoTitleConfig[?].VideoName === 'workBannerVideo'` → `.title` | Banner heading text | work-progress/page.js:17-18, 25, 50 |
| ...same node `.subtitle` | Banner sub-heading | work-progress/page.js:18, 26, 51 |
| `data.attributes.projectSection[?].__component === 'project-section.tower-gallery'` | `ourTowerData` (passed to TowerSection) | work-progress/page.js:16, 55 |
| `ourTowerData.towerImages[]` | Array of tower entries | TowerSection.js:27, 32 |
| `towerImages[i].towerId` | Tab key + filter key | TowerTabs.js:22 |
| `towerImages[i].name` | Tab label | TowerTabs.js:23 |
| `towerImages[i].images.data[].attributes.url` | Per-slide `<Image src>` | TowerTabs.js:58, 63 |
| `towerImages[i].images.data[].attributes.caption` | Image title + caption shown below slide | TowerTabs.js:65, 78 |

There is no concept of "percent complete," "milestone name," "expected date," "actual date," or "phase" in the data the page consumes. The buyer sees images + captions only.

---

## 3. State Machines

**Not applicable.** Work Progress is a stateless read-only content surface. No status fields, no transitions, no client-managed lifecycle other than:

- Local React state inside `TowerSection`: `towers` (array), `loading` (boolean) — both used only to gate the placeholder text `"Loading tower data..."` until the towerData prop is processed in `useEffect`. // Source: TowerSection.js:9-11, 13-42, 43-45
- Tabs default active key = `towerData[0]?.towerId` (Ant Design Tabs internal state). // Source: TowerTabs.js:18
- Swiper autoplay state (3rd-party). // Source: TowerTabs.js:27-34

---

## 4. Business Rules

1. **Page revalidation:** Next.js ISR with `revalidate = 10` — the rendered page is cached for 10 seconds before re-fetching from Strapi. // Source: work-progress/page.js:11
2. **Empty / missing data graceful fallback:**
   - If no `project-section.tower-gallery` component is present, the `<TowerSection>` is not rendered at all. // Source: work-progress/page.js:55 (`data?.ourTowerData && ...`)
   - If `towerImages` array is empty after processing, `<TowerTabs>` short-circuits and renders nothing. // Source: TowerSection.js:45, TowerTabs.js:11
3. **Per-user / per-unit filtering is currently disabled.** The code that would intersect the Strapi tower list with the buyer's allotted `towerIds` is **commented out**. Every authenticated buyer therefore sees every tower configured in Strapi for the project. // Source: TowerSection.js:14-31 (lines 17-24 and 28-30 are commented)
4. **Project scope is hard-coded.** Strapi is always queried for project id `1` (`/api/projects/1?populate=deep`). The page does not vary by buyer's actual project allocation. // Source: urls.js:8
5. **Banner video behaviour:** muted, autoplay (`autoplay`), looped, no controls, `playsInline`, `preload="auto"`, `object-cover` full-width. // Source: work-progress/page.js:37-48
6. **Banner caption resolution:** title/subtitle come from the Strapi entry whose `VideoName === 'workBannerVideo'` inside `VideoTitleConfig`. If absent, both render empty. // Source: work-progress/page.js:17-19, 25-26
7. **Tower tab construction:** one tab per element of `towerImages`, default tab is the first one. // Source: TowerTabs.js:17-22
8. **Swiper responsive breakpoints (slides per view):**
   - ≥320 px: 1 slide
   - ≥640 px: 2
   - ≥1024 px: 3
   - ≥1200 px: 4
   - ≥1400 px: 4
   - ≥1600 px: 4 (spaceBetween 30)
   // Source: TowerTabs.js:36-56
9. **Swiper autoplay:** 2500 ms delay, `disableOnInteraction: false` — autoplay continues even after the user manually swipes. Navigation arrows enabled, pagination dots disabled. // Source: TowerTabs.js:29-34
10. **Caption text styling:** clamped to 2 lines with ellipsis below each slide. // Source: TowerTabs.js:68-79
11. **Heading text shown on the page:** `"Work Progress"` (rendered inside `<TowerTabs>`). // Source: TowerTabs.js:15
12. **No buyer write actions.** Buyer cannot upload, comment, rate, share, or download images via this module — there are no event handlers, no `onClick`, no API mutations in the reviewed code. // Source: work-progress/page.js, TowerSection.js, TowerTabs.js (entire files)
13. **Update authorship:** images are uploaded/managed in Strapi CMS by content editors, not via the XR Portal admin app. // Source: NOT FOUND — verify manually (Strapi admin scope is excluded)
14. **Per-tower vs per-unit granularity:** the data model is per **tower** (`towerId`, `name`, `images[]`). There is no per-unit progress data exposed to the buyer. // Source: TowerTabs.js:22-23, 58, TowerSection.js:27

---

## 5. Notification Dispatch

- **In-app:** None. The page renders silently; there are no toasts, banners, badges, or "new update" indicators. // Source: work-progress/page.js, TowerSection.js, TowerTabs.js (no `message`, `notification`, `Badge`, or notification import)
- **Push notification:** **NOT FOUND — verify manually.** No push registration / send code path for work-progress events in `source-code/backend/src/`. // Source: NOT FOUND — verify manually
- **Email on new progress upload:** **NOT FOUND — verify manually.** No mailer call associated with project images or Strapi content updates in `source-code/backend/src/`. // Source: NOT FOUND — verify manually
- **WebSocket broadcast:** **NOT FOUND — verify manually.** The repository contains a `web-socket` service directory; whether it emits a work-progress event is outside the scope of `backend/src/` and was not found in the reviewed source. // Source: NOT FOUND — verify manually

---

## 6. API Endpoints

### XR Portal Node backend
- **None.** No work-progress endpoint exists in `source-code/backend/src/routes/`. // Source: grep on backend/src — no `work-progress` / `work_progress` / `workProgress` route definitions

### External upstream actually called by the page
- **`GET {strapi_base_url}/api/projects/1?populate=deep`** — called server-side from the Next.js page via `req(REQ_TYPE.GET, urls.getProjectDetails)`. // Source: work-progress/page.js:13-14, urls.js:8
- Auth header / Strapi token configuration: **NOT FOUND — verify manually** (lives outside the reviewed files; `req()` helper not fully traced here). // Source: NOT FOUND — verify manually
- An alternate (commented-out) variant `{BaseURL}/api/projects?populate=deep` exists, suggesting earlier plans to fetch a list rather than the hard-coded project 1. // Source: urls.js:7

### Image asset delivery
- Image `src` values are absolute URLs returned by Strapi (`img.attributes.url`). No XR Portal proxy. // Source: TowerTabs.js:63

---

## 7. Known Bugs / Gaps

1. **Hard-coded project id `1`.** Buyers on any other project still see project 1's banner and tower images. // Source: urls.js:8
2. **No per-buyer tower filtering.** The block that would limit visible towers to the buyer's allotted units is commented out — every buyer sees every tower configured in Strapi. // Source: TowerSection.js:14-31
3. **`'use client'` + `useEffect` for synchronous data shuffling.** `TowerSection` runs an empty try block (the real network call is commented out) and just copies the prop into local state inside `useEffect`. The component briefly shows `"Loading tower data..."` even though nothing is being loaded. // Source: TowerSection.js:1, 13-42
4. **No empty-state UI** when `towerImages` is empty or `tower-gallery` component is missing — page silently omits the section, giving no signal to the buyer. // Source: work-progress/page.js:55, TowerTabs.js:11
5. **No error UI.** Network failure on the Strapi fetch is logged to console only (`console.error('Tower fetch failed:', err)`); the error path that would set an error state is commented out (`// const [error, setError] = useState(null);`). // Source: TowerSection.js:11, 33-34
6. **Banner video lacks `controls` and `playsInline` may be insufficient on some iOS versions** — buyer cannot pause / mute / seek. Combined with autoplay + loop + muted, this is intentional but may surface accessibility complaints. // Source: work-progress/page.js:37-48
7. **`<Image>` from Ant Design is used inside Swiper** — `Image` component opens its own preview/zoom on click, while the slide also has a Swiper drag handler; click-vs-drag interactions may conflict. // Source: TowerTabs.js:2, 61-66
8. **No timestamp / "last updated" indicator** is rendered. Buyers cannot tell whether images are current. // Source: TowerTabs.js (entire file)
9. **No notification mechanism** for new progress updates — buyers must visit the page to see changes. // Source: backend/src grep, work-progress/page.js (no notification primitives)
10. **`revalidate = 10` may be too aggressive** for a CMS-driven page rarely updated; high traffic will result in continuous SSR refetches against Strapi. // Source: work-progress/page.js:11
11. **No analytics / view tracking** instrumented on this page in the reviewed code. // Source: work-progress/page.js (no analytics import)

---

## 8. QA Risk Areas

1. **Project-mismatch sanity** — log in as a buyer who is allocated to a non-`1` project; confirm the page still displays project 1's banner and towers (current bug per Section 7.1). // Source: urls.js:8
2. **Empty-state behaviour** — Strapi returns no `project-section.tower-gallery`: verify the tower section is silently absent and the banner-only page still renders. // Source: work-progress/page.js:55
3. **Strapi outage** — kill Strapi or block its URL; observe whether the page errors out, renders partially, or shows the placeholder forever. // Source: TowerSection.js:33-37
4. **ISR cache behaviour** — change Strapi data; confirm new content surfaces only after the 10-second `revalidate` window. // Source: work-progress/page.js:11
5. **Sidebar / bottom-nav active state** — navigate to `/work-progress` and confirm both nav locations highlight correctly (icon switches to green variant on bottom nav). // Source: Sidebar.js:170-171, BottomNavigationBar.jsx:140-149
6. **Tower tab switching** — verify clicking each tower tab swaps the Swiper to that tower's images; verify default tab is the first one. // Source: TowerTabs.js:17-22
7. **Swiper responsive layout** — resize viewport across breakpoints 320 / 640 / 1024 / 1200 / 1600 px; verify correct slidesPerView. // Source: TowerTabs.js:36-56
8. **Autoplay + manual swipe** — manually drag a slide; confirm autoplay continues per `disableOnInteraction: false`. // Source: TowerTabs.js:31-34
9. **Caption rendering** — captions over 2 lines must be clipped with ellipsis; very short captions must not stretch layout; missing caption must not error. // Source: TowerTabs.js:65, 68-79
10. **Banner video fallbacks** — when `workBannerVideo.data.attributes.url` is missing, confirm the `<video>` tag renders without `src` and does not break the layout. When title/subtitle missing, confirm `<h2>` and `<p>` render empty without showing `undefined`. // Source: work-progress/page.js:24-26, 49-52
11. **Image click behaviour** — confirm Ant Design `Image` preview opens correctly inside the Swiper slide without breaking the carousel. // Source: TowerTabs.js:61-66
12. **Auth requirement on the route** — verify whether `/work-progress` is gated by login (no `protect`/middleware reference in the page itself was reviewed; check `middleware.js` / layout). // Source: NOT FOUND — verify manually
13. **Mobile vs desktop layout** — `Sidebar` (desktop) + `BottomNavigationBar` (mobile) + `MobileTopBar` are all rendered; verify responsive visibility classes hide each on the opposite breakpoint. // Source: work-progress/page.js:30, 34, 58-60
14. **CORS / mixed-content on Strapi image URLs** — confirm `img.attributes.url` is served over HTTPS in UAT and prod. // Source: TowerTabs.js:63
15. **Performance** — `populate=deep` on Strapi is a known heavy query; measure first-byte timing of the page after cache invalidation. // Source: urls.js:8, work-progress/page.js:11
16. **Notification gap** — confirm with product whether buyers should be notified on new progress uploads; if yes, raise as missing-feature. // Source: NOT FOUND — verify manually
