# Buyer Portal — Work Progress User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/work-progress`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Work-Progress.md
**Last Updated:** 2026-05-22

---

## Overview

The Work Progress section is your window into the construction site. It shows milestone photos, stage-wise progress descriptions, and the dates each construction milestone was reached. All content is curated by the developer's team via CMS — you cannot post or comment.

This section is available at every stage of your journey. You do not need to be Booked or have completed KYC to browse it. Use it to stay informed on how your future home is progressing, and to plan possession-related decisions.

---

## Page Layout (At a Glance)

1. **Milestone gallery** — chronological photos of construction stages.
2. **Progress descriptions** — short text describing what was completed at each stage.
3. **Milestone dates** — when each stage was reached.

---

# Feature 1 — Browse Construction Progress

### What it does
Renders the construction milestone gallery with site photos, descriptions, and dates so you can track real-world progress at the project site.

### Preconditions
- You are logged in.

### How to use
1. From the navigation menu, click **Work Progress**.
2. Scroll through the gallery — each milestone shows:
   - One or more **site photos**.
   - A short **description** of the stage (e.g. "Foundation poured", "Slab cast on floor 12", "Brickwork complete on tower Crest").
   - The **date** the stage was reached.
3. Tap any photo to view it in full-screen.

### Result
You have a continuous record of construction progress with visual proof — useful for personal records, family updates, and bank disbursement conversations (some banks request site evidence before milestone disbursement).

---

# Feature 2 — Use Work Progress to Validate Construction-Linked Payments

### What it does
While not a payment screen itself, Work Progress is a natural cross-reference for your construction-linked payment plan. When a milestone trigger fires in your Payment Schedule (e.g. "Foundation completion"), the matching photos appear here.

### Preconditions
- You are on a construction-linked payment plan (see Payment Schedule).
- The developer has published the milestone here.

### How to use
1. Open Payment Schedule and note the trigger for an upcoming or just-raised milestone.
2. Open Work Progress in another tab.
3. Cross-reference the trigger label with the gallery to see the site evidence for that milestone.

### Result
You can independently verify that the milestone trigger has been hit at the site before settling the payment, and you can share the photos with your bank / loan officer if they request evidence.

### Note
Photos here are typically uploaded by the site team after a stage is signed off. There may be a short delay between an internal milestone trigger and the photos appearing in Work Progress.

---

## Business Rules — Quick Lookup

1. Content is **managed via CMS** by the admin team.
2. Read-only — buyers cannot add comments or content.
3. Available at **every stage** — pre- and post-allocation, before and after KYC.
4. Photos and descriptions are not personalised; they are project-wide updates.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Page is empty | No milestones published yet, or CMS sync delay | Check back later; contact CP if no updates for an extended period |
| Photos slow to load | Large images on slow network | Switch to Wi-Fi; reduce browser zoom |
| Missing a recent milestone I expected | Site team has not yet uploaded the photos | Contact your SM or raise a Support Ticket (GENERAL) |
| Photo opens then closes immediately on mobile | Browser autoplay / modal conflict | Tap again; try a different browser |
| Updates do not match my Payment Schedule trigger | Milestone trigger fired internally but site photos not yet published | This is normal — operations may run slightly ahead of media publishing |
| Need bank-grade evidence | Photos may not be sufficient — bank wants signed Architect's Certificate | Raise a Support Ticket (LOAN) asking for the formal certificate |
