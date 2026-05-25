# Buyer Portal — Project Information User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/project`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Project-Information.md
**Last Updated:** 2026-05-22

---

## Overview

The Project Information section is your read-only hub for everything about the development — overview copy, tower specifications, photo gallery, official documents (including RERA), and walkthrough videos. All content is curated by the developer's team and published via Strapi CMS.

This section is open to every registered buyer from day one — before allocation, during allocation, and after booking. You do not need a WINNER status or completed KYC to browse it.

---

## Page Layout (At a Glance)

1. **Top bar (TopBarProject)** — project name and section navigation tabs.
2. **Overview** — general description and project highlights.
3. **Towers** — tower-wise specifications and configurations.
4. **Gallery** — photo gallery.
5. **Documents** — RERA, approvals, brochures (downloadable).
6. **Videos** — virtual tours and promotional content.

---

# Feature 1 — Project Overview

### What it does
Presents the project's headline description and key highlights — location, scale, vision, and unique selling points.

### Preconditions
- You are logged in.

### How to use
1. Open the main navigation and tap **Project** to land at `/project`.
2. The Overview tab loads by default.
3. Read the description and scroll through highlight cards.

### Result
You have a clear understanding of the project's positioning and headline facts.

---

# Feature 2 — Tower Specifications

### What it does
Lists every tower in the project with structural and typology details — number of floors, configurations, and per-tower specifications. Driven by the `TowerSection` and `TowerTabs` components.

### Preconditions
- You are logged in.

### How to use
1. From the Project page, tap the **Towers** tab.
2. The tower list renders (e.g. Crest, Crown, Blossom, Pinnacle, Bright).
3. Tap a tower to expand its specifications — floor count, available typologies, carpet areas, configurations.

### Result
You understand the composition of each tower and can pick the one that fits your preference before an allocation event.

### Note
Tower data here is informational. The actual real-time availability of units (white / orange / green / red) is only visible during a live allocation event in the Allocation Experience section.

---

# Feature 3 — Photo Gallery

### What it does
Displays curated photography of the project — exteriors, interiors, amenities, and surroundings. Managed entirely via Strapi CMS.

### Preconditions
- You are logged in.

### How to use
1. From the Project page, tap the **Gallery** tab.
2. Browse the photo grid.
3. Tap any photo to view it in full-screen.
4. Swipe (mobile) or use arrow keys (desktop) to move between photos.

### Result
You have a visual feel for the project, its amenities, and the lifestyle on offer.

---

# Feature 4 — Project Documents (incl. RERA)

### What it does
Provides downloadable copies of the project's official documents — RERA registration certificate, statutory approvals, project brochures, and other legal documents required for compliance.

### Preconditions
- You are logged in.

### How to use
1. From the Project page, tap the **Documents** tab.
2. Each document is listed with a title and a view/download action.
3. Tap a document to open it in a new tab.
4. Use the browser download button to save a copy locally.

### Result
You have a personal archive of all the legal and regulatory documents you need — useful for sharing with your bank, lawyer, or financial advisor.

### Note
RERA registration documents are mandatory under Indian real-estate law (RERA Act, 2016) — keep a copy for your records.

---

# Feature 5 — Project Videos

### What it does
Lists virtual tours, walkthroughs, drone footage, and promotional videos for the project. Managed via Strapi.

### Preconditions
- You are logged in.

### How to use
1. From the Project page, tap the **Videos** tab.
2. Tap a video tile to play.
3. Use video controls — play / pause, fullscreen, volume.

### Result
You can take a virtual walkthrough of the project before or after booking — useful for sharing with family members or co-applicants.

---

## Business Rules — Quick Lookup

1. Content is **read-only** for buyers — you cannot edit or upload.
2. All content is managed by the admin team via **Strapi CMS**.
3. Available at every stage — before registration confirms, during allocation, and after WINNER.
4. RERA documents are mandatory and always included.
5. Gallery, documents, and videos refresh whenever the admin publishes new content in Strapi.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Tab loads but is empty | Admin has not yet published content for that section in Strapi | Contact your Channel Partner or Sales Manager to escalate |
| Document download fails | Network drop or expired CDN link | Retry, or contact Sales Manager if persistent |
| Photo gallery is slow | Large image sizes on a low-bandwidth connection | Switch to Wi-Fi or reduce browser zoom |
| Tower spec missing for one tower | Tower not yet published in Strapi | Escalate to your CP / SM |
| Video does not play | Browser autoplay blocked or unsupported codec | Tap play manually; try a different browser if it persists |
| Outdated RERA / brochure | Admin has not refreshed the asset | Contact CP / SM to request a CMS update |
