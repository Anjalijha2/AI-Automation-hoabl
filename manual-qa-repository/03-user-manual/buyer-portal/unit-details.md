# Buyer Portal — Unit Details User Guide

**Audience:** Buyer / Customer (post-booking only)
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/allotted-units`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Unit-Details.md
**Last Updated:** 2026-05-22

---

## Overview

The Unit Details section is your single source of truth for your booked unit. It shows the unit's physical specifications (tower, floor, area, facing), the **frozen** cost sheet with every line item and discount, the floor and unit plans, the tower-view visualisation, and a shortcut to the construction-linked payment schedule.

This section is gated — you can only see it after your unit booking is confirmed (WINNER status). If you have just paid and the page still says "no unit," wait a moment for the backend to propagate WINNER status.

---

## Page Layout (At a Glance)

1. **UnitDetails card** — unit number, floor, tower, type, carpet area, facing, floor plan thumbnail.
2. **CostSheet** — full itemised pricing breakdown with discounts and net payable.
3. **towerView** — visual showing where your unit sits in the tower.
4. **FloorUnitPlans** — architectural plans of your floor and your specific unit layout.
5. **PaymentSchedule (embedded)** — milestone breakdown, same as the dedicated Payment Schedule page.

---

# Feature 1 — Unit Specifications

### What it does
Displays the physical attributes of your booked unit — what you own, where it is, and what size it is.

### Preconditions
- You are logged in.
- Your registration is in **WINNER** status (unit payment confirmed).

### How to use
1. From the navigation menu, tap **My Unit** (or navigate to `/allotted-units`).
2. Read the top card for:
   - **Unit number** — e.g. `3502`
   - **Floor** — e.g. `35`
   - **Tower name** — e.g. `Crest`
   - **Apartment type** — e.g. `1 Bed Growth Home`
   - **Carpet area** — e.g. `323 sq.ft.`
   - **Saleable area** — total including common spaces
   - **Facing direction** — e.g. East / West / North
   - **Floor plan thumbnail** — quick visual reference

### Result
You have a clear, single-card summary of your unit's physical identity.

---

# Feature 2 — Cost Sheet (Frozen at Allocation)

### What it does
Shows every line item that makes up your unit's price — base price, premiums, statutory charges, GST, parking, discounts, and the final net payable. This cost sheet is **frozen at the moment of allocation** — any offer changes the admin team makes afterwards do **not** change your price.

### Preconditions
- WINNER status confirmed.
- Cost sheet generated during the allocation booking flow.

### How to use
1. From the Unit Details page, scroll to the **Cost Sheet** section.
2. Read each row top-to-bottom:
   - **Basic price** — core unit price.
   - **Floor rise charge** — premium for higher floors.
   - **Premium charge** — unit-specific premium (e.g. view, corner).
   - **Infrastructure charge** — infrastructure cost component.
   - **Society charge** — society formation fee.
   - **Clubhouse charge** — clubhouse membership.
   - **Possession charge** — possession-related fee.
   - **GST amount** — applicable GST.
   - **Parking charge** — parking space cost (if selected).
   - **Total unit value** — sum of the above.
   - **Offer / discount deduction** — HOME_LOAN, VC_REQUEST, or admin-applied offers.
   - **Early bird benefit** — if you registered in the early-bird window.
   - **Net payable amount** — final amount after all deductions.

### Result
You have full transparency on every rupee of your unit's price, with discounts itemised separately.

### Note
If you complete the Home Loan flow via Easiloan, a **HOME_LOAN** discount may appear here as a separate deduction. If you had a video call with a Sales Manager that resulted in an approved offer, a **VC_REQUEST** discount may appear similarly.

### Warning
**The cost sheet is frozen.** Even if the admin updates the project's offer matrix tomorrow, your numbers do not change. This is by design — booked buyers are protected from later price movements.

---

# Feature 3 — Tower View

### What it does
Renders a visual of the tower with your unit highlighted so you can see exactly where in the building your home sits.

### Preconditions
- WINNER status confirmed.

### How to use
1. From the Unit Details page, scroll to the **Tower View** section.
2. Look at the tower visualisation — your unit is highlighted (typically with a marker or different colour).
3. Note the floor position and the orientation within the tower.

### Result
You can show family members exactly where your unit sits in the tower — useful for orientation and view assessment.

---

# Feature 4 — Floor and Unit Plans

### What it does
Provides the architectural floor plan of your floor and the dedicated unit layout showing room sizes and configuration.

### Preconditions
- WINNER status confirmed.

### How to use
1. From Unit Details, scroll to the **Floor and Unit Plans** section.
2. View the **floor plan** — shows your entire floor, with your unit identified.
3. View the **unit plan** — shows the internal layout of your unit with room dimensions.
4. Tap / click any plan to open it in full-screen for closer inspection.

### Result
You can plan interiors, furniture placement, and any customisation work using the architectural source documents.

---

# Feature 5 — Payment Schedule (Embedded)

### What it does
Surfaces the construction-linked milestone payment list directly inside the Unit Details page, so you don't have to switch screens to check upcoming milestones.

### Preconditions
- WINNER status confirmed.
- KYC ideally submitted (schedule generation completes post-KYC).

### How to use
1. From Unit Details, scroll to the bottom — the **Payment Schedule** section is embedded.
2. Read each milestone: trigger event, principal, GST, parking, status (Pending / Partial / Paid).
3. When a milestone shows a **Pay** button, click it to settle that milestone via the payment gateway.

### Result
You have a unified screen showing your unit, your costs, and your payment plan — all the documents you need for a bank conversation are on one page.

### Note
The full Payment Schedule page (`/paymentschedule`) shows the same data with additional drilldowns. Use whichever surface is more convenient.

---

## Business Rules — Quick Lookup

1. Unit Details is **only visible** after WINNER status is confirmed.
2. The cost sheet is **frozen at the moment of allocation**.
3. All applied discounts (HOME_LOAN, VC_REQUEST, admin offers, early bird) are itemised separately.
4. Floor / unit plans are architectural source documents — use for interior planning.
5. Payment Schedule shown here mirrors `/paymentschedule`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Page says "no unit" after payment | WINNER status not yet propagated by backend | Wait 30–60 seconds and refresh |
| Cost sheet missing the HOME_LOAN discount | Home loan flow not yet completed in `/homeloan` | Complete the Home Loan flow — the discount applies post-completion |
| Cost sheet shows different numbers from my booking screen | Cost sheet is frozen at booking — booking screen is the source of truth at the time | Compare against your Payment Successful screen / booking PDF |
| Floor plan image fails to load | CDN drop or asset not published | Retry; escalate to CP if persistent |
| Embedded Payment Schedule is empty | KYC not yet submitted — schedule generation depends on KYC | Complete KYC first; the schedule generates after submission |
| Tower View does not highlight my unit | Visualisation asset not yet refreshed for your tower | Escalate to CP / SM |
