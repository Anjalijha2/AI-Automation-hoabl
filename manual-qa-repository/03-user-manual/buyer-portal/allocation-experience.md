# Buyer Portal — Allocation Experience User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/alloted`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Allocation-Experience.md
**Last Updated:** 2026-05-22

---

## Overview

The Allocation Experience is the centrepiece of the Buyer Portal. It is where you select your unit (STATIC allocation) or accept an auto-assigned unit (DYNAMIC allocation), agree to the Terms & Conditions, and pay the confirmation amount to lock the unit in your name. The entire flow is real-time — the portal uses WebSocket connections so the unit grid updates the instant another buyer books, holds, or releases a unit.

There are four states this section may render in: **Waiting** (no campaign open), **STATIC live** (you pick), **DYNAMIC live** (system assigns), and **Closed** (campaign ended).

---

## Page Layout (At a Glance)

| State | Centre panel content |
|-------|----------------------|
| Waiting (no campaign) | `WaitingForUnit` + `AllocationEndTimer` + `NextChanceTime` |
| STATIC live | "Select Unit >" → tower / floor / unit grid |
| DYNAMIC live | `OpenAllottedUnit` with auto-assigned unit + Proceed to Pay |
| Closed | "Allocation window is closed for now." (red) |

---

# Feature 1 — Waiting Screen (Pre-Event)

### What it does
Shows you that no allocation campaign is currently running and counts down to the next scheduled opportunity.

### Preconditions
- You are logged in.
- No active allocation campaign for your project.

### How to use
1. On the Home Dashboard, click **Proceed to Confirm** on any registration outside a live campaign window.
2. The Allotment page opens in the waiting state.
3. Read the **AllocationEndTimer** for the countdown.
4. Read the **NextChanceTime** card to understand when your next opportunity opens.

### Result
You know exactly when the next event begins. When it starts, the screen updates automatically — no refresh required.

---

# Feature 2 — STATIC Allocation Unit Selection

### What it does
During a STATIC campaign, all eligible buyers see all available units simultaneously and compete in real-time. You browse the tower / floor / unit grid, pick a white (available) unit, review pricing, and add it to your cart.

### Preconditions
- You are logged in with **Status = Available**.
- A STATIC campaign is **ACTIVE**.
- You are on the Allotment page.

### How to use
1. On the Home Dashboard, find the registration row with **Status = Available**.
2. Click **Proceed to Confirm** → Allotment page opens.
3. Click **Book Now** (green badge).
4. Click **Select Unit >** → the unit selection screen opens with three panels:
   - **Left panel** — all towers (Crest, Crown, Blossom, Pinnacle, Bright) with live available unit counts.
   - **Centre panel** — floor-by-floor grid of units, colour-coded.
   - **Right panel** — selected unit details.
5. Click a tower in the left panel → centre panel shows that tower's floor grid.
6. Click a **white** unit — it turns **green** to confirm selection.
7. Read the right panel for: Unit No, BHK type, carpet area, agreement value, applicable discounts, total price.
8. Optional drilldowns before payment:
   - **Floor & Unit Plan >** — architectural plan.
   - **Cost Sheet >** — full itemised pricing.
   - **Payment Schedule >** — milestone list.
   - **Cancel** — deselects without releasing the hold.
   - **Change Unit** — re-pick a different unit.
9. Click **Add** to confirm selection. You return to the Allotment page with the unit attached.

### Result
The selected unit is held for you for **20 minutes**, during which you must complete payment.

### Unit Colour Codes
| Colour | Meaning |
|--------|---------|
| White | Available — can be selected |
| Green | Selected by you |
| Orange | Another buyer is in the payment flow (hold) |
| Red | Booked / sold |

### Warnings
- The 20-minute hold starts when you click **Add** (the WebSocket `pay_now_initiated` event is sent).
- Only **one unit hold** per buyer at a time.
- If you and another buyer click the same unit simultaneously, the first to be accepted wins; you will see the unit flip to Orange or Red.

---

# Feature 3 — Pay (STATIC) — T&C and Easebuzz Gateway

### What it does
After unit selection, this step locks you to the unit by collecting the confirmation amount (typically Rs. 27,000) through the Easebuzz payment gateway. **The Pay button is disabled until the T&C checkbox is ticked.**

### Preconditions
- A unit is selected and held.
- The 20-minute hold has not expired.

### How to use
1. Back on the Allotment page after **Add**, locate the T&C section.
2. **The T&C checkbox is unchecked by default.** The Pay button is **disabled** in this state.
3. Tick the checkbox: **"I confirm to HoABL Terms & Conditions and Privacy Policy"**.
4. The Pay button enables.
5. Click **Confirmation Amount Pay Rs. 27,000** (or the amount shown).
6. The Easebuzz gateway opens:
   - Merchant: **Impactum Lands Private Limited**
   - Payment validity timer (~15 minutes inside the gateway)
   - Payment methods: **Credit Card / Debit Card / UPI / NetBanking / Wallets**
7. Complete the payment with your preferred method.

### Result
- You land on the **Payment Successful** screen with a green checkmark.
- Unit details and applicant list are displayed.
- Your Home Dashboard updates: **Status = Booked**, **Allotted Unit = <unit>**, **Process Status = Complete KYC**.

### Warnings
- **Webhook is the source of truth.** Payment status is determined by the gateway's webhook to our backend, not by what the browser shows. If you close the browser mid-payment but the gateway already debited and webhook fired, you may still be **WINNER**. Check the dashboard before assuming failure.
- **20-minute hold is hard.** If payment does not complete within 20 minutes of `pay_now_initiated`, the hold releases and another buyer can take the unit.
- **No T&C, no Pay.** This is enforced client-side; testing confirmed (TC-CST-012).

---

# Feature 4 — DYNAMIC Allocation (Auto-Assigned)

### What it does
In a DYNAMIC campaign, the system assigns a unit to you on a round-robin basis. You don't pick — you accept or pass.

### Preconditions
- DYNAMIC campaign is live.
- You are logged in with an eligible registration.

### How to use
1. Navigate to the Allotment section.
2. The **OpenAllottedUnit** card shows the unit assigned to you — tower, floor, typology, price, discounts.
3. Review the details.
4. Click **Proceed to Pay**. The portal sends the `proceed_to_pay` WebSocket event.
5. Easebuzz gateway opens.
6. Complete payment **within the round's time window** (typically 20 minutes).

### Result
- On success → **WINNER** status.
- On timeout or payment failure → the system may **reallocate** you to a different unit in the same typology, or move you to **WAITLIST** if no inventory remains.

### Components You May See
| Component | Purpose |
|-----------|---------|
| WatchingUnitList | Units you have seen / been assigned |
| YourMissedChances | Units you missed (Redis lost_units history) |
| HurryUnitsBookingFaster | Urgency indicator for fast-moving inventory |
| MissedYourUnit | Alert when an assigned unit was taken |
| UnitSoldNotification | Real-time popup when another unit is sold |

---

# Feature 5 — Post-Campaign (Closed) State

### What it does
After the campaign closes, the Allotment page communicates that the window is over and revokes the Book Now / Select Unit actions.

### Preconditions
- The active campaign has ended.

### How to use
1. Navigate to the Allotment section.
2. The centre panel shows: **"Allocation window is closed for now."** (red text).
3. No **Select Unit** or **Book Now** button is visible.
4. Your Home Dashboard registration status flips from **Available → Waitlisted** (for unfulfilled rows).
5. **Booked** rows are unaffected — your booking remains.

### Result
You understand that no further action is possible until the next campaign. Watch for notifications about the next event.

---

## Real-Time WebSocket Events — Quick Lookup

| Direction | Message | Meaning |
|-----------|---------|---------|
| Received | `connection_established` | Campaign info confirmed; portal is live |
| Received | `towers_response` | All towers and unit availability snapshot |
| Received | `tower_units_response` | Units for the tower you just clicked |
| Received | `unit_sold` | Another buyer just booked a unit |
| Received | `reallocation_notification` | DYNAMIC: a new unit is assigned to you, or you missed one |
| Sent | `pay_now_initiated` | You started payment on a unit (STATIC) |
| Sent | `proceed_to_pay` | You started payment on the auto-assigned unit (DYNAMIC) |

---

## Business Rules — Quick Lookup

1. **20-minute hold** from `pay_now_initiated`. Hard cap.
2. **One unit hold per buyer** at any time.
3. **T&C must be ticked** before Pay enables (STATIC).
4. **Webhook is the source of truth** for payment status — not the browser.
5. **WINNER is the only confirmed state** — WAITLIST, PREALLOCATED, ALLOCATED are pre-payment.
6. **First to pay wins** when two buyers race on the same unit.
7. Redis manages real-time unit state during allocation; persisted to DB via AOF.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Waiting screen forever even though campaign should be live | Browser-WebSocket disconnect | Refresh the page once |
| Unit turns Orange before I click Add | Another buyer entered hold first | Pick a different white unit |
| Pay button disabled after I selected a unit | T&C checkbox not ticked | Tick the T&C checkbox |
| Easebuzz gateway times out | Gateway 15-min timer elapsed | Restart payment from the Allotment page — note your hold timer |
| Browser closed mid-payment, status not updated | Webhook still firing | Wait 30–60 seconds; check Home Dashboard for **Booked** status |
| Hold released after 20 minutes | You did not complete payment in time | Re-select a unit if any remain available; you compete from scratch |
| Status moved to Waitlisted after campaign | Campaign ended before booking completed | Wait for next campaign — Waitlisted buyers are prioritised |
| DYNAMIC: assigned unit changed to a different one | System reallocated after a missed window | Accept the new unit or wait for the next round |
| Booked but Process Status not showing Complete KYC | UI lag; status is WINNER but dashboard cache stale | Refresh the Home Dashboard |
