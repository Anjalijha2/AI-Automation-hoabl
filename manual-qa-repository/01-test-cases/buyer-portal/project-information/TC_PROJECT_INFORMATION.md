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
