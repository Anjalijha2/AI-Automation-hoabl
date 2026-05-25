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
