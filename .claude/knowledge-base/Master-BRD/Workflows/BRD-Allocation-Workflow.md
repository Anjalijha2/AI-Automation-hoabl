# Allocation Workflow — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Admin Portal, Buyer Portal, SM Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Allocation Workflow is the core commercial event of the XR Portal platform. It describes the complete lifecycle from when an admin creates an allocation campaign to when a buyer successfully books a unit. No unit can be booked outside of this workflow (except via admin offline booking).

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Admin | Creates campaign, monitors, stops or cancels |
| Buyer | Browses units, selects, pays |
| Sales Manager | Conducts in-person allocation during PHYSICAL_EVENT |
| System | Manages unit holds, broadcasts real-time updates, processes payments |

---

## 3. Campaign Types

| Type | Description |
|------|-------------|
| **STATIC** | All eligible buyers see all available units simultaneously. First to pay wins. |
| **DYNAMIC** | Round-based. System auto-assigns a unit to each buyer per round. Timed window per round. |
| **PHYSICAL_EVENT** | In-person event. SM selects unit on behalf of walk-in customer. |

---

## 4. Campaign Status Flow

```
Upcoming → Active (auto, at start time)
Active → Completed (auto, at end time)
Active → Stopped (manual — admin clicks Stop)
Upcoming → Cancelled (manual — admin cancels before start)
Active → Failed (system error)
```

---

## 5. STATIC Allocation — Full Flow

1. Admin creates STATIC campaign with start/end time (minimum 3 minutes from now)
2. At scheduled start: system loads all tower/unit/registration data into Redis
3. Campaign goes ACTIVE — WebSocket broadcasts to all connected buyers
4. Buyers with Available status see the unit selection grid
5. Buyer clicks a unit → 20-minute HOLD is placed on the unit in Redis
6. Unit turns orange for all other buyers (someone is in payment flow)
7. Buyer completes payment in Easebuzz/Razorpay gateway
8. **On payment success (webhook):**
   - Unit → BOOKED (turns red for all buyers)
   - Buyer registration → WINNER
   - All other buyers see "unit_sold" notification
9. **On payment failure or 20-minute timeout:**
   - Unit → AVAILABLE (turns white again)
   - Buyer can try another unit
10. At end time: campaign → COMPLETED; remaining available registrations → WAITLISTED

---

## 6. DYNAMIC Allocation — Full Flow

1. Admin creates DYNAMIC campaign with round duration
2. Campaign starts → system auto-assigns units to buyers via round-robin algorithm
3. Each buyer is assigned one unit from their preferred typology
4. Buyer sees their assigned unit and initiates payment
5. **On payment success within round time:** Buyer → WINNER
6. **On payment failure or round expiry:** System finds next available unit of same typology
   - If found: buyer gets new unit assignment
   - If not found: buyer → WAITLISTED
7. Next round begins with remaining WAITLIST buyers until no units remain

---

## 7. PHYSICAL_EVENT Allocation — Full Flow

1. Admin creates PHYSICAL_EVENT campaign
2. SM logs into SM Portal → goes to Physical Allocation
3. SM searches for walk-in customer by name/phone/registration
4. SM views available units and shows customer the floor plan and cost sheet
5. SM selects unit on customer's behalf → 20-minute hold placed
6. Payment: QR code scan (online) or OfflinePaymentDrawer (offline/cheque)
7. On payment success: unit BOOKED, registration WINNER
8. SM immediately completes KYC with customer present (optional but recommended)

---

## 8. Unit Hold Rules

- Hold duration: **exactly 20 minutes**
- Hold starts when buyer initiates payment (STATIC: `pay_now_initiated`; DYNAMIC: `proceed_to_pay`)
- Cron runs every 1 minute to release holds older than 20 minutes
- No unit can be booked without payment completing within the hold window

---

## 9. Key Business Rules

1. **3-minute lead time:** Campaign start must be at least 3 minutes in the future.
2. **One active campaign at a time:** Only one campaign should run simultaneously on UAT.
3. **Tower prerequisite:** At least one tower must be Active in Config CMS before a campaign is meaningful.
4. **Buyer eligibility:** Registration must have `paymentStatus = success` and `availableForAllocation = true` to participate.
5. **Webhook is source of truth:** Unit BOOKED status is set only after the payment gateway sends a confirmed webhook — not based on the buyer's browser.
6. **Post-campaign:** Buyers who did not complete payment become WAITLISTED. WINNER status is permanent.
7. **Admin override:** Admin can assign, swap, or cancel units outside of campaigns via the Customers module.

---

## How to Use: Allocation Workflow

---

### Admin: Creating and Running a Campaign

**Step 1:** Ensure at least one tower is Active in Config CMS.

**Step 2:** Go to Admin Portal → Allocation → fill in: campaign name, type (STATIC/DYNAMIC/Physical Event), start time (at least 3 minutes from now), end time.

**Step 3:** Click **Save Campaign**. Status shows **Upcoming**.

**Step 4:** At the scheduled start time, the campaign goes Active automatically. Monitor the campaign list and Towers module for live unit bookings.

**Step 5:** At end time, the campaign completes automatically. Or click **Stop** to end early.

**Step 6:** Review results in the Customers module — newly Booked registrations appear with WINNER status.

---

### Buyer: Booking a Unit (STATIC Campaign)

**Step 1:** Log in to the Buyer Portal. When a campaign is live, your Home Dashboard shows Status = **Available**.

**Step 2:** Click **Proceed to Confirm** → **Book Now** → **Select Unit >**

**Step 3:** Browse towers and click an available (white) unit. Review the unit details and pricing in the right panel.

**Step 4:** Click **Add** to confirm selection. Back on the Allotment page, tick the T&C checkbox. The Pay button activates.

**Step 5:** Click **Pay** and complete payment in the Easebuzz gateway. Use Card, UPI, NetBanking, or Wallet.

**Step 6:** On success, your unit is confirmed. Home Dashboard updates: Status = **Booked**, Process Status = **Complete KYC**.

> **20-minute window:** Once you select a unit, you have 20 minutes to complete payment. If the window expires, the unit is released.

---

### SM: Conducting a Physical Allocation Event

**Step 1:** Admin must have created and activated a PHYSICAL_EVENT campaign.

**Step 2:** Log into SM Portal → Physical Allocation. Search for the walk-in customer.

**Step 3:** Select the customer, browse units, show the customer the floor plan and cost sheet.

**Step 4:** Select a unit. Process payment (QR code or offline details).

**Step 5:** After payment, proceed to KYC. Complete the KYC form while the customer is present.

---

## 10. Related Documents

- [[Allocation-Workflow]] — Technical end-to-end allocation flow reference
- [[BRD-Allocation]] — Admin Portal allocation campaign module
- [[BRD-Buyer-Portal]] — Buyer-side allocation experience
- [[BRD-SM-Portal]] — Physical allocation via SM Portal
- [[Feature-Spec - Allocation Experience]] — Buyer Portal Feature-Spec (confirmed step-by-step)
- [[Realtime-Events-BRD]] — WebSocket real-time event details
- [[Payment-Workflow]] — Payment gateway flow during allocation
