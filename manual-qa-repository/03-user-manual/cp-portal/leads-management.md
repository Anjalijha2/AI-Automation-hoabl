# CP Portal — Leads Management User Guide

**Portal:** Channel Partner (Growth Partner) Portal
**URL:** `https://uat-web.xrportal.in/leads`
**Sources:** CP-BRD-CP-Portal.md · CP-FS-Leads-Management.md
**Last Updated:** 2026-05-22
**Audience:** Channel Partner / Sales Agent

---

## Overview

The Leads screen surfaces every CRM lead currently assigned to you in LeadSquared (LSQ). The CP Portal is a read-and-action surface for these leads — it does not author or own the lead pipeline; LSQ does. From here you can review the prospect's contact details, see their current pipeline stage, view the last recorded interaction, and convert a sales-ready lead into a formal Customer Registration in a single click. CP isolation is enforced — you can only see leads assigned to you in LSQ; you cannot see another CP's leads.

The Leads screen is reachable from the left/top navigation menu → **Leads**, or directly at `/leads`.

---

## Page Layout (At a Glance)

1. **Lead Table** — one row per assigned lead, with the columns listed below.
2. **Search/Filter Controls** — narrow the list by name, phone, source, or stage.
3. **Convert Action** — per-row button to move a lead into the formal registration flow.
4. **Empty State** — message shown when you have no LSQ leads assigned to you.

---

## Table Columns

| Column | Description |
|--------|-------------|
| Lead Name | Prospect's full name as recorded in LSQ |
| Contact Details | Phone number and email address |
| Lead Source | How the lead was generated (campaign, walk-in, referral, digital, etc.) |
| Status / Stage | Current stage in the LSQ sales pipeline |
| Last Activity | Most recent interaction logged against the lead |

---

# Feature 1 — View Your Assigned Leads

### What it does
Displays every LSQ lead currently assigned to your CP account so you can plan outreach and prioritise high-intent prospects.

### Preconditions
- You are logged in to the CP Portal.
- Leads have been assigned to you in LeadSquared by your manager or by LSQ's auto-assignment rules.

### How to use
1. From the navigation menu, click **Leads**. The page loads at `/leads`.
2. The lead list is fetched from the backend (which in turn syncs with LeadSquared).
3. Each row shows the lead's name, contact details, source, current stage, and last activity.
4. Scroll through the table or use the search/filter controls to narrow the list.

### Result
You have a live, filtered view of every prospect currently in your name in the CRM.

### Note
Lead data is sourced from LeadSquared. If a lead you expect to see is missing, it has not yet been assigned to you in LSQ — check with your manager before raising a support ticket.

---

# Feature 2 — Search and Filter Leads

### What it does
Narrows the lead table to a specific name, contact, source, or stage so you can quickly find an individual prospect or segment your work-list.

### Preconditions
- You have at least one lead assigned.

### How to use
1. Use the search field to type a name, phone number, or email substring — the table filters as you type.
2. Use the source/stage filters (if available on your build) to slice the list by pipeline stage or origin channel.
3. Clear the filter inputs to restore the full list.

### Result
The visible row set reflects only leads matching your filter criteria.

---

# Feature 3 — Convert a Lead to a Customer Registration

### What it does
Moves a qualified, sales-ready lead out of the CRM pipeline and into a formal XR Portal Customer Registration under your broker account.

### Preconditions
- The lead is assigned to you and is in a stage that is ready for formal registration (verified prospect, paperwork-ready).
- The prospect is willing to complete the registration paperwork.
- The prospect's mobile and email are NOT already used by an existing registration in this project (duplicate check, BRD §4.2).

### How to use
1. Locate the lead row in the table.
2. Click the **Convert** (or equivalent) action in that row.
3. You are taken to the **Customer Registration** form with the lead's known details pre-filled (name, mobile, email).
4. Complete any missing required fields — Purchase Purpose, Home Loan Intent, Budget, Floor Range, Walk-in Source.
5. Tick the **Undertaking / T&C** consent checkbox (mandatory — see BRD §4.3).
6. Click **Submit**.

### Result
- A new `Registration` row is created with `brokerId` = your user ID and `walkInSourceXrCode` = your hvCode.
- Registration number generated in the format `GHNG-XXXXXXXXXX`.
- Customer notified via Kaleyra SMS/WhatsApp.
- The new customer appears in your Dashboard table.
- The original lead's stage in LSQ is updated to reflect the conversion (handled by the backend sync).

### Warning
- The duplicate check will reject the submission if the lead's mobile or email is already on another registration for this project. If this happens, search the Dashboard first — the customer may already be registered under your own or another CP's broker account.
- Once converted, registration data is the source of truth for downstream allocation/KYC flows. Make sure the Purchase Purpose and Budget are correct before submitting.

---

## Business Rules

1. **LSQ is the lead authority.** The CP Portal displays leads — it does not create, edit, reassign, or delete them. All lead lifecycle operations happen in LeadSquared.
2. **CP isolation.** You see only leads where you are the LSQ assignee. You cannot see leads belonging to other CPs.
3. **Conversion creates a new Registration.** Converting a lead does NOT replace or migrate the lead — it spawns a new Registration record. The lead's LSQ state is updated separately via the integration.
4. **No edit in CP Portal.** Lead-level fields (name, phone, stage, activities) cannot be modified from the CP Portal — those edits happen in LSQ.

---

## Role Restrictions

| Role | View leads? | Convert lead? |
|------|-------------|---------------|
| Channel Partner (own assignment) | Yes | Yes |
| Lead/Master CP | Yes (own only — Member CP leads are not surfaced here) | Yes (own only) |
| Member CP | Yes (own only) | Yes (own only) |

---

## Notifications Dispatched

| Action | Channel | Recipient |
|--------|---------|-----------|
| Convert lead → Registration created | Kaleyra SMS / WhatsApp | Customer (the converted lead's mobile) |
| Lead arrival (newly assigned in LSQ) | None in CP Portal | — |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Lead I expected is not in the list | Not yet assigned to you in LSQ | Ask your manager to assign it in LeadSquared |
| Convert button creates duplicate error | Mobile or email already on a registration for this project | Search Dashboard by phone first; the customer may already be registered |
| Lead's stage / last activity looks stale | LSQ sync lag | Wait a few minutes and refresh; if stale > 1 hour, raise with support |
| Empty Leads page | No leads assigned to your CP account | Confirm with manager that auto-assignment / manual assignment is in place |
