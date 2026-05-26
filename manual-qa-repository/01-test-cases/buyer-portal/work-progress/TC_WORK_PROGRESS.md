# Test Cases — Work Progress
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Work-Progress.md

---

## Work Progress — Access & Navigation

### BYR_WRK_001 — Work Progress menu visible to all logged-in buyers

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Buyer logged in (any status) |
| **Test Steps** | 1. Inspect main nav |
| **Expected Result** | Work Progress menu item visible regardless of allocation status |
| **Priority** | High |

---

### BYR_WRK_002 — Click Work Progress navigates to /work-progress

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Nav visible |
| **Test Steps** | 1. Click Work Progress |
| **Expected Result** | URL = `/work-progress`; page loads |
| **Priority** | Critical |

---

### BYR_WRK_003 — Available pre- and post-allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Buyer in any journey state |
| **Test Steps** | 1. Open `/work-progress` in pre-allocation and post-allocation states |
| **Expected Result** | Same content accessible in both states |
| **Priority** | Medium |

---

### BYR_WRK_004 — Page header / title rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Page open |
| **Test Steps** | 1. Inspect H1 / header |
| **Expected Result** | Title clearly identifies "Work Progress" / "Construction Updates" |
| **Priority** | Low |

---

## Work Progress — Content Rendering

### BYR_WRK_005 — Milestones listed with photos

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | CMS has at least one milestone published |
| **Test Steps** | 1. Scroll through page |
| **Expected Result** | Each milestone card shows photo, title and description |
| **Priority** | Critical |

---

### BYR_WRK_006 — Milestone photos load without 404

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Page open |
| **Test Steps** | 1. Inspect network requests for image loads |
| **Expected Result** | All images return 200; no broken image icons |
| **Priority** | High |

---

### BYR_WRK_007 — Milestone date label visible per card

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Page open |
| **Test Steps** | 1. Inspect milestone cards |
| **Expected Result** | Date label rendered (e.g., "March 2026") for each milestone |
| **Priority** | High |

---

### BYR_WRK_008 — Stage description text rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Page open |
| **Test Steps** | 1. Read description per card |
| **Expected Result** | Text describes the construction stage as configured in CMS |
| **Priority** | High |

---

### BYR_WRK_009 — Milestones rendered in chronological order

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Multiple milestones exist |
| **Test Steps** | 1. Inspect date order of cards |
| **Expected Result** | Cards sorted (typically newest first or chronological per CMS config) |
| **Priority** | Medium |

---

### BYR_WRK_010 — Photo gallery within a milestone navigable

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Milestone has multiple photos |
| **Test Steps** | 1. Use next/prev arrows or thumbnails |
| **Expected Result** | Photo cycles through that milestone's set |
| **Priority** | Medium |

---

### BYR_WRK_011 — Click photo opens enlarged view / lightbox

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Photo visible |
| **Test Steps** | 1. Click a photo |
| **Expected Result** | Lightbox opens with full-size image; controls to close and navigate |
| **Priority** | Medium |

---

### BYR_WRK_012 — Lightbox closes on X or ESC

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Lightbox open |
| **Test Steps** | 1. Press ESC<br>2. Reopen, click X |
| **Expected Result** | Both close the lightbox |
| **Priority** | Low |

---

## Work Progress — Read-Only Constraint

### BYR_WRK_013 — No comment / edit affordances rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Page open |
| **Test Steps** | 1. Scan UI for input boxes, edit/delete icons |
| **Expected Result** | No editable controls; buyer cannot add content |
| **Priority** | High |

---

### BYR_WRK_014 — No comment API endpoint accessible

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Buyer token in hand |
| **Test Steps** | 1. Attempt to POST to a comment/edit endpoint for work progress |
| **Expected Result** | 404 or 403 — no buyer-write endpoint exists |
| **Priority** | High |

---

## Work Progress — CMS Sync & Content Refresh

### BYR_WRK_015 — New milestone published in CMS appears on reload

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Admin publishes new milestone in CMS |
| **Test Steps** | 1. Reload `/work-progress` |
| **Expected Result** | New milestone card visible without code deploy |
| **Priority** | High |

---

### BYR_WRK_016 — Removed milestone disappears on reload

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Admin unpublishes a milestone |
| **Test Steps** | 1. Reload page |
| **Expected Result** | Card no longer rendered |
| **Priority** | Medium |

---

### BYR_WRK_017 — Updated description reflected on reload

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Admin edits milestone description |
| **Test Steps** | 1. Reload page |
| **Expected Result** | New text shown |
| **Priority** | Medium |

---

## Work Progress — Negative & Edge Cases

### BYR_WRK_018 — Empty state when no milestones published

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | CMS has zero milestones |
| **Test Steps** | 1. Open page |
| **Expected Result** | Empty state ("No updates yet") shown; no broken layout |
| **Priority** | Medium |

---

### BYR_WRK_019 — CMS outage shows graceful fallback

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | CMS API simulated down |
| **Test Steps** | 1. Open page |
| **Expected Result** | Friendly error or cached content; no app crash |
| **Priority** | Medium |

---

### BYR_WRK_020 — Page responsive on mobile viewport

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Resize to mobile (≤480px) |
| **Test Steps** | 1. Inspect layout |
| **Expected Result** | Cards stack vertically; photos resize without overflow |
| **Priority** | Medium |

---

### BYR_WRK_021 — Slow image load shows progressive placeholder

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Throttle network to 3G |
| **Test Steps** | 1. Reload page |
| **Expected Result** | Placeholder/skeleton shown while images load |
| **Priority** | Low |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-work-progress.md`

### Corrections to existing TCs
- **BYR_WRK_005-009** — The data model is **per-tower**, NOT per-milestone. Strapi returns `towerImages[]` with `{towerId, name, images[]}` containing only `url` + `caption`. There is NO concept of "milestone", "stage", "percent complete", "expected date", "actual date", or "phase" in the consumed data. Tests asserting milestone date labels or stage descriptions are testing non-existent data.
- **BYR_WRK_007-008** — Per-card date and stage description fields do NOT exist in Strapi response. Only `caption` (2-line ellipsis-clipped) is shown below each image (TowerTabs.js:65, 68-79).
- **BYR_WRK_010-011** — Gallery uses Swiper with Ant Design `<Image>` previews. Auto-play 2500ms delay; arrows enabled, dots disabled. Swiper drag may conflict with AntD Image preview onClick (KB-7).
- **BYR_WRK_014** — No backend API exists for work-progress at all — buyer write attempts return 404 because there is no route (FSD §6). Data sourced entirely from `GET <strapi>/api/projects/1?populate=deep`.
- **BYR_WRK_015-017** — Page uses Next.js ISR with `revalidate=10` seconds. New CMS content surfaces after 10s, not immediately. Don't refresh-and-assert without waiting.
- **BYR_WRK_018** — Empty state behavior: if `project-section.tower-gallery` missing, TowerSection NOT rendered AT ALL (silently absent — KB-4). If `towerImages[]` empty, TowerTabs short-circuits and renders nothing. NO "No updates yet" message.
- **BYR_WRK_019** — On Strapi outage: error logged to console only (`console.error('Tower fetch failed:', err)`). Error UI is commented out (KB-5, TowerSection.js:11, 33-34). Page silently shows placeholder "Loading tower data..." indefinitely.

### New TCs added below

### BYR_WRK_022 — projectId hardcoded to 1 — non-prod still hits project 1

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Buyer allocated to project ≠ 1 |
| **Test Steps** | 1. Open `/work-progress`<br>2. Monitor network for Strapi URL |
| **Expected Result** | URL = `<strapi>/api/projects/1?populate=deep` regardless of buyer's actual project (KB-1, urls.js:8). Document multi-project rollout BUG. |
| **Priority** | High |

---

### BYR_WRK_023 — Per-buyer tower filter is dead code — buyer sees ALL towers

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Buyer allocated to one tower (e.g., Crest) |
| **Test Steps** | 1. Open `/work-progress`<br>2. Inspect tower tab list |
| **Expected Result** | ALL towers configured in Strapi shown, not just buyer's. Filter logic at TowerSection.js:14-31 is commented out (KB-2). |
| **Priority** | Medium |

---

### BYR_WRK_024 — Strapi outage leaves "Loading tower data..." placeholder forever

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Block Strapi URL in network |
| **Test Steps** | 1. Open `/work-progress` |
| **Expected Result** | Banner section renders (or doesn't, depending on cache). Tower section shows "Loading tower data..." indefinitely; error state is commented out (KB-5, TowerSection.js:11). |
| **Priority** | Medium |

---

### BYR_WRK_025 — Banner video autoplays muted+looped with no controls

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | `data.attributes.workBannerVideo.data.attributes.url` populated in Strapi |
| **Test Steps** | 1. Inspect `<video>` element |
| **Expected Result** | Attributes: `muted, autoplay, loop, playsInline, preload="auto"`, NO `controls`. Buyer cannot pause/seek (KB-6, work-progress/page.js:37-48). |
| **Priority** | Low |

---

### BYR_WRK_026 — Banner title/subtitle from workBannerVideo VideoTitleConfig

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Strapi has `projectSection[?].__component === 'project-section.video-caption-configration'` with `VideoName='workBannerVideo'` |
| **Test Steps** | 1. Inspect H2 + P below video |
| **Expected Result** | H2 = `.title`, P = `.subtitle` from that entry. If absent: H2 and P render empty without showing "undefined" (work-progress/page.js:17-19, 25-26). |
| **Priority** | Medium |

---

### BYR_WRK_027 — Swiper responsive breakpoints

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Tower with ≥4 images |
| **Test Steps** | 1. Resize viewport to 320 / 640 / 1024 / 1200 / 1600 px |
| **Expected Result** | slidesPerView = 1 / 2 / 3 / 4 / 4 respectively (TowerTabs.js:36-56). |
| **Priority** | Low |

---

### BYR_WRK_028 — Autoplay continues after manual swipe (disableOnInteraction=false)

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Tower carousel visible |
| **Test Steps** | 1. Manually drag a slide<br>2. Wait 3 seconds |
| **Expected Result** | Autoplay resumes at 2500ms delay (TowerTabs.js:31-34). |
| **Priority** | Low |

---

### BYR_WRK_029 — No notification mechanism for new uploads (functional gap)

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Admin uploads new tower image in Strapi |
| **Test Steps** | 1. Check email inbox<br>2. Check WhatsApp<br>3. Check in-app notifications |
| **Expected Result** | NO buyer notification on any channel. No mailer, push, WebSocket, or in-app badge for work-progress events (KB-9, FSD §5). Buyer must visit page to see updates. Document as missing-feature. |
| **Priority** | Medium |

---

### BYR_WRK_030 — No timestamp / "last updated" indicator

| Field | Value |
|-------|-------|
| **Module** | BYR – Work Progress |
| **Pre-conditions** | Tower carousel visible |
| **Test Steps** | 1. Inspect page for last-updated text |
| **Expected Result** | None rendered (KB-8). Buyer cannot tell whether images are current. Document UX gap. |
| **Priority** | Low |
