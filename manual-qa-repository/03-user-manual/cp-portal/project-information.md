# CP Portal — Project Information User Guide

**Portal:** Channel Partner (Growth Partner) Portal
**URLs:** `https://uat-web.xrportal.in/project`, `/project1/about`, `/project1/gallery`, `/project1/amenities`, `/project1/documents`, `/project1/keyPoints`, `/project1/videos`
**Sources:** CP-BRD-CP-Portal.md · CP-FS-Project-Information.md
**Last Updated:** 2026-05-22
**Audience:** Channel Partner / Sales Agent

---

## Overview

The Project Information section is your **read-only** marketing kit. It surfaces all admin-published content — project narrative, photo gallery, amenity list, official documents (including RERA registration), quick-reference key points, and video walkthroughs — so you can prepare for and run customer sales conversations with accurate, up-to-date material. Every piece of content here originates from Strapi CMS, which the admin team owns and updates. You cannot edit anything from the CP Portal; you can only browse and share links with prospects.

This section is available at all times regardless of allocation campaign status — content is decoupled from campaign state.

---

## Page Layout (At a Glance)

1. **Project Overview Hub** (`/project`) — top-level navigation tabs across the six sub-sections.
2. **Section Tabs** — About, Gallery, Amenities, Documents, Key Points, Videos.
3. **Content Body** — dynamically rendered from Strapi CMS API responses.
4. **Shareable URLs** — each sub-section has its own URL you can paste into customer messages.

---

## Project Sections

| Section | URL | Content |
|---------|-----|---------|
| Project Overview | `/project` | Top-level project intro and navigation tabs |
| About the Project | `/project1/about` | Background, location, developer information |
| Gallery | `/project1/gallery` | Photos of the project and lifestyle imagery |
| Amenities | `/project1/amenities` | Full list of project amenities and features |
| Documents | `/project1/documents` | RERA registration, approvals, brochures |
| Key Points | `/project1/keyPoints` | Key selling points for sales conversations |
| Videos | `/project1/videos` | Virtual tours, walkthroughs, promotional videos |

---

# Feature 1 — Browse the Project Overview

### What it does
Loads the project's top-level introduction and surfaces the six sub-section tabs as a navigation hub.

### Preconditions
- You are logged in to the CP Portal.

### How to use
1. From the navigation menu, click **Project** (or **Project Information**).
2. The overview hub loads at `/project`.
3. Use the tab strip to jump to any sub-section.

### Result
You see the project's high-level narrative and have a single launchpad to every sub-section.

---

# Feature 2 — About the Project

### What it does
Presents the long-form project narrative: location advantages, developer credentials, project positioning, and key dates.

### How to use
1. From the overview, click the **About** tab (or navigate directly to `/project1/about`).
2. Read the narrative — useful for opening pitches and prospect Q&A about project provenance.

### Result
You have the canonical project story for use in customer conversations.

---

# Feature 3 — Gallery

### What it does
Displays the official photo gallery — project renderings, on-site progress photos, and lifestyle imagery.

### How to use
1. Click the **Gallery** tab (or navigate to `/project1/gallery`).
2. Browse the images.
3. Share the URL (or specific image links, depending on UI) with prospects.

### Result
You have rich visual content to support your sales conversations.

---

# Feature 4 — Amenities

### What it does
Lists every amenity and facility published for the project — clubhouse, pool, gym, landscaping, parking, security, etc.

### How to use
1. Click the **Amenities** tab (or navigate to `/project1/amenities`).
2. Read or screenshot the list to share with prospects.

### Result
You have an exhaustive, admin-approved amenity reference.

---

# Feature 5 — Documents

### What it does
Provides downloadable access to official project documents, **including the RERA registration** (legally required for compliant sales conversations), approvals, and brochures.

### Preconditions
- You are logged in.

### How to use
1. Click the **Documents** tab (or navigate to `/project1/documents`).
2. Click any document to view or download.
3. Share the RERA document and brochures with serious prospects who request legal/compliance proof.

### Result
You can present official, compliant documentation on demand.

### Warning
RERA registration documents are legally significant. Always share the latest version from this section — do not store older copies locally and re-share, since admin may publish updated versions.

---

# Feature 6 — Key Points

### What it does
A curated quick-reference list of the project's top selling points — designed for fast sales-pitch consumption.

### How to use
1. Click the **Key Points** tab (or navigate to `/project1/keyPoints`).
2. Memorise or screenshot for your pitches.

### Result
You have a tight, admin-approved bullet list for use in fast walk-in conversations.

---

# Feature 7 — Videos

### What it does
Hosts virtual tours, walkthroughs, and promotional videos.

### How to use
1. Click the **Videos** tab (or navigate to `/project1/videos`).
2. Play a video to preview it.
3. Share the URL with prospects so they can watch it on their own time.

### Result
You can pre-qualify remote prospects with a video walkthrough before scheduling a site visit.

---

# Feature 8 — Share Section Links with Customers

### What it does
Lets you copy any sub-section's URL and send it to a prospect via WhatsApp, SMS, or email so they can self-browse.

### How to use
1. Navigate to the section you want to share (e.g., Gallery, Videos, Documents).
2. Copy the URL from the browser address bar.
3. Paste the URL into your messaging app and send to the prospect.

### Result
The prospect can browse the published content directly. (Whether they need to authenticate on the public URL depends on the section's access configuration — confirm with your manager.)

---

## Business Rules

1. **Read-only for CPs.** All content is managed via Strapi CMS by admin. CPs cannot edit anything from this portal (BRD §4.10).
2. **RERA documents are mandatory.** The Documents section must always carry valid RERA registration for legal compliance.
3. **Content is role-agnostic.** Both Master/Lead CPs and Member CPs see the same content — there are no role-based content variations.
4. **Always available.** Content is accessible regardless of whether an allocation campaign is OPEN or CLOSED.

---

## Role Restrictions

| Role | Browse content? | Edit content? |
|------|-----------------|---------------|
| Channel Partner | Yes | No |
| Lead/Master CP | Yes | No |
| Member CP | Yes | No |
| Admin | Yes | Yes (via Strapi CMS, not via CP Portal) |

---

## Notifications Dispatched

None. This is a passive content surface — no in-app, SMS, WhatsApp, or email events are triggered by browsing.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| A section is empty / shows no content | Admin has not yet published content for this section in Strapi | Contact your manager to request a content publish |
| Outdated photos / amenities / documents | Strapi content not yet refreshed by admin | Flag the staleness to your manager |
| RERA document missing | Admin has not uploaded / published the current RERA file | Escalate immediately — required for legal compliance |
| Video does not play | Browser codec issue or unsupported format | Try a different browser; if still failing, flag to admin |
| Cannot edit a typo I noticed | CPs are read-only by design | Request the correction from your manager — they will route to admin / Strapi |
| Shared URL prompts customer for login | Public access settings on that URL are gated | Confirm with manager whether the section should be public-shareable |
