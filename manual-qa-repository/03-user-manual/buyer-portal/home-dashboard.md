# Buyer Portal — Home Dashboard User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/home`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Home-Dashboard.md
**Last Updated:** 2026-05-22

---

## Overview

The Home Dashboard is your central hub after login. It adapts dynamically to where you are in the home-buying journey — from "waiting for an allocation event" through to "Booked, please complete KYC" and beyond. Every registration you hold sits as a row in the registrations table, and the dashboard tells you, in plain language, what your next action is.

The dashboard loads automatically after OTP login and is reachable at any time from the left/main navigation as **Home**.

---

## Page Layout (At a Glance)

1. **Status Alert Banner (TopAlert)** — top of page; coloured message describing your current journey state.
2. **Allocation Banner** — countdown to the next allocation event or live-event indicator if a campaign is running.
3. **Registrations Table** — one row per registration with Status, Process Status, and unit/payment links.
4. **Creative Tiles** — Strapi-managed marketing tiles and project highlights.
5. **Home Popup** — admin-configurable announcement popup (managed via Strapi).
6. **Marquee** — scrolling text banner for announcements.

---

# Feature 1 — Status Alert Banner (TopAlert)

### What it does
Tells you, in a single line at the top of the screen, where you currently stand in the journey. The banner colour and copy change based on your status.

### Preconditions
- You are logged in.

### How to use
1. After login, look at the topmost coloured banner.
2. Read the message — it indicates your current state:
   - **Waiting** — no allocation event running yet.
   - **Live** — a campaign is live, immediate action available.
   - **Booked** — your unit payment is complete; KYC is the next action.
   - **KYC pending** — orange/red warning urging you to complete KYC.

### Result
You always know what state you are in without scrolling.

---

# Feature 2 — Allocation Banner (Countdown / Live)

### What it does
Either counts down to the next scheduled allocation event, or shows that a campaign is currently live and you can act now.

### Preconditions
- An allocation campaign exists for your project (configured by Admin).

### How to use
1. Look at the allocation banner area below the alert banner.
2. If the campaign has not started, you see a countdown timer.
3. When the campaign starts, the banner switches to a live indicator automatically (no refresh needed).

### Result
You can plan your day around the allocation event, and you can act the moment it opens.

### Note
Banner content (hero slides, copy, imagery) is managed by the admin team via Strapi CMS.

---

# Feature 3 — Registrations Table

### What it does
Lists every registration you hold (you may have more than one) with all the operational columns you need: Registration Number, Home Loan, Allotted Unit, Status, Process Status, and Payment Schedule.

### Preconditions
- You have at least one active registration.

### How to use
1. Scroll to the registrations table on the dashboard.
2. Read each column for every registration row:
   - **Registration Number** — your unique GHNG-XXXXXXXXXX identifier.
   - **Home Loan** — whether a home loan application is linked to this registration.
   - **Allotted Unit** — your unit (blank until allocation is confirmed).
   - **Status** — Available / Waitlisted / Booked / Refunded.
   - **Process Status** — the next action you need to take.
   - **Payment Schedule** — a `Pay >` link when a milestone payment is due.
3. Take the action shown in **Process Status** when one is available.

### Result
You see all your registrations at a glance and you know what to do next on each.

### Registration Status Reference
| Status | Badge | Meaning |
|--------|-------|---------|
| Available | Green | Eligible to book during an active campaign |
| Waitlisted | Dark | On waitlist — no unit available in the current campaign |
| Booked | Green with checkmark | Unit payment completed |
| Refunded | Red | Registration cancelled with refund |

---

# Feature 4 — Process Status Actions

### What it does
The **Process Status** column converts your current state into a concrete next action — a clickable CTA that opens the right screen for that step.

### Preconditions
- Your registration is in a state that requires an action.

### How to use
| Process Status CTA | When it appears | What clicking it does |
|--------------------|-----------------|------------------------|
| **Proceed to Confirm** | Campaign live, your status = Available | Opens the Allotment / Unit Selection flow |
| **Pay Now** | Unit selected, payment pending | Opens the payment gateway |
| **Complete KYC** | You are Booked but KYC is pending (orange/red warning) | Opens KYC flow |
| **Pay >** (Payment Schedule column) | A milestone payment is due | Opens the Payment Schedule for that milestone |

### Result
The right screen opens for the action you need to take. No need to remember the URL.

### Warning
After your booking is confirmed you will see an orange warning: **"Required to complete the allotment!"** That is the KYC reminder — until you complete KYC, the booking is not fully consumed for downstream operations (milestone schedule generation, agreement, etc.).

---

# Feature 5 — Post-Booking Dashboard State

### What it does
After successful payment, the dashboard reorganises to show what you have booked and what is next.

### Preconditions
- You completed unit payment during an allocation event (WINNER status).

### How to use
1. Return to the dashboard after the Payment Successful screen.
2. Check the **Allotted Unit** column — it shows your unit in the format `<UnitNo>-<Tower> | <Typology> | <CarpetArea>` (e.g. `3502-Crest | 1 Bed Growth Home | 323 sq.ft.`).
3. Check the **Process Status** column — it shows **Complete KYC** with an orange/red warning.
4. Check the **Payment Schedule** column — a `Pay >` button is now available for future milestone payments.

### Result
You have a single-screen summary of your booking, your next action (KYC), and a way to access future milestone payments.

---

# Feature 6 — Creative Tiles, Home Popup, Marquee

### What it does
Three Strapi-managed content areas that surface marketing imagery, announcements, and scrolling text.

### Preconditions
- The admin team has published content via Strapi.

### How to use
- **Creative Tiles** — scroll down the dashboard; tap or click a tile to open the linked content.
- **Home Popup** — appears on page load if active; close with the X icon.
- **Marquee** — read the scrolling text banner; it announces project events, offer windows, or service messages.

### Result
You stay informed of project announcements without leaving the dashboard.

### Note
These three areas are 100% admin-controlled via Strapi — they are not personalised to your registration. Treat them as portal-wide announcements.

---

## Business Rules — Quick Lookup

1. Dashboard refreshes to reflect real-time campaign status changes.
2. Multiple registrations appear as separate rows in the table.
3. Status flow: Available → Waitlisted (if campaign closes) OR Booked (on successful payment) → Refunded (only on cancellation with refund).
4. Strapi content drives the Allocation Banner, Creative Tiles, Home Popup, Marquee.
5. The "Required to complete the allotment!" warning persists until KYC is submitted.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Status shows Waitlisted instead of Available | Campaign ended before you completed booking, or you registered after caps were full | Wait for the next campaign — Waitlisted buyers are prioritised |
| Process Status is empty for a registration | No action is currently required (waiting for next event) | No action needed |
| Allotted Unit column blank after payment | Backend WebSocket has not yet flipped status to WINNER | Wait 10–30 seconds and refresh; if still blank, contact CP |
| `Pay >` link in Payment Schedule does nothing | Milestone is not yet "due" (no demand letter raised) | Wait for the milestone trigger; you will be notified |
| Allocation Banner shows live but Proceed to Confirm is missing | Your registration status is Waitlisted, not Available | Waitlisted buyers cannot act in this round; wait for next |
| Home Popup keeps reopening | The popup is admin-published as `sticky` | Dismiss with X; if persistent, ignore (managed via Strapi) |
