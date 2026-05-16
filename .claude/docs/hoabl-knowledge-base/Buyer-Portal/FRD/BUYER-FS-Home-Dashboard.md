# Feature-Spec: Home Dashboard

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/home`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Home Dashboard

### 1.1 Objective

Provide buyers with a central hub showing the current status of their registration(s), upcoming allocation events, and quick access to key actions throughout their purchase journey.

### 1.2 Scope

Primary landing page after login. The content adapts dynamically based on the buyer's current journey state — from registration pending through to post-booking completion.

### 1.3 Preconditions

- Buyer must be logged in

### 1.4 Dashboard Components

| Component | Description |
|-----------|-------------|
| Status Alert Banner (TopAlert) | Shows buyer's current journey state — changes based on registration/allocation status |
| Allocation Banner | Countdown to allocation event or live event status if campaign is running |
| Registrations Table | All registrations for this buyer with status details |
| Creative Tiles | Marketing imagery and project highlights from Strapi CMS |
| Home Popup | Configurable announcement popup (admin-managed via Strapi) |
| Marquee | Scrolling text banner for announcements |

### 1.5 Registration Table Columns

| Column | Description |
|--------|-------------|
| Registration Number | Unique GHNG-XXXXXXXXXX identifier |
| Home Loan | Whether a home loan application is linked |
| Allotted Unit | Unit number if allocated (blank until allocation) |
| Status | Current registration status (see table below) |
| Process Status | Next action required (e.g., "Complete KYC", "Pay Now") |
| Payment Schedule | Link to view milestone payments |

### 1.6 Registration Status Values

| Status | Badge Style | Meaning |
|--------|------------|---------|
| Available | Green | Eligible to book during active campaign |
| Waitlisted | Dark | On waitlist — no unit available in current campaign |
| Booked | Green with checkmark | Unit payment completed |
| Refunded | Red | Registration cancelled with refund |

### 1.7 Dashboard States Based on Journey

| Journey State | What Buyer Sees |
|---------------|-----------------|
| Registration complete, no campaign | Waiting state — "Allocation hasn't started yet" |
| Campaign running, buyer status = Available | "Proceed to Confirm" CTA in Process Status |
| Campaign running, buyer on waitlist | Waitlisted badge — no action available |
| Unit selected, payment pending | "Pay Now" action visible |
| Unit booked (WINNER) | Booked badge + "Complete KYC" alert |
| KYC pending | "Complete KYC" in Process Status with warning alert |

### 1.8 Post-Booking Dashboard State

After unit payment:
- **Allotted Unit column** shows: "3502-Crest | 1 Bed Growth Home | 323 sq.ft."
- **Process Status** shows: "Complete KYC" (red/orange button)
- Warning text: "Required to complete the allotment!"
- **Payment Schedule column**: "Pay >" button for future milestone payments

### 1.9 Business Rules

1. Allocation Banner content is managed via Strapi (hero-slides)
2. Creative Tiles content is managed via Strapi
3. Home Popup is configurable via Strapi — may show announcements
4. Dashboard refreshes to reflect real-time campaign status changes
5. Multiple registrations are shown as separate rows in the table

---

## How to Use: Understanding Your Home Dashboard

**Who does this:** Buyer (any stage of the journey)

---

**Step 1 — Log in and view the Dashboard**

After logging in, you land on your Home Dashboard. This is your main overview screen.

**Step 2 — Check the Status Banner**

The coloured banner at the top tells you where you are in the process:
- **Waiting** — no allocation event is running yet
- **Live** — an allocation event is running right now — you can act

**Step 3 — Read your Registration Table**

Each row in the table is one of your registrations. Look at:
- **Status** — whether you are Available, Waitlisted, or Booked
- **Process Status** — what action you need to take next (e.g., "Proceed to Confirm", "Complete KYC")
- **Allotted Unit** — your unit details once a booking is confirmed

**Step 4 — Take action when needed**

When the Process Status column shows a button or link, that is your next required step:
- Click **Proceed to Confirm** when an allocation is live and you are Available
- Click **Complete KYC** after your unit payment is confirmed
- Click **Pay >** in the Payment Schedule column when a milestone payment is due

> **Tip:** After your booking is confirmed, you will see an orange warning: "Required to complete the allotment!" — this means your KYC must be completed. Click the KYC button to start.
