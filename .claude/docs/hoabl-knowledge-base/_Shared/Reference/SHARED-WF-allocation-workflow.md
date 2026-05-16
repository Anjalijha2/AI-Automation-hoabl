# Allocation Workflow

**Type:** End-to-End Workflow
**Last Updated:** 2026-05-10
**Tags:** #workflow/allocation #status/complete

---

## Related Notes
- [[Admin-Portal-BRD]]
- [[Buyer-Portal-BRD]]
- [[Realtime-Events-BRD]]
- [[Unit-Status-Flow]]
- [[Payment-Workflow]]

---

## Overview

The Allocation Workflow describes the complete lifecycle from when an admin creates an allocation campaign to when a buyer successfully books a unit. This is the core commercial event of the XR Portal platform.

---

## Allocation Types

### Type 1: STATIC Allocation

**Description:** Open event. All eligible buyers can browse available units simultaneously. First to pay wins.

**End-to-End Flow:**

```
1. ADMIN PREPARATION
   Admin creates AllocationCampaign (type=STATIC)
   Admin sets start time, end time, selects units for the campaign
   Admin starts the campaign (immediate or scheduled)

2. WARMUP (1 minute before start)
   Server loads all units, towers, floors, registrations into Redis
   Campaign status set to RUNNING in Redis

3. BUYER EXPERIENCE (Campaign RUNNING)
   Buyer connects via WebSocket
   Server sends: connection_established (allocation_type=STATIC)
   Buyer requests towers → sees visual heatmap
   Buyer browses units (green = available, red = booked)
   
4. UNIT SELECTION
   Buyer clicks desired unit → pay_now_initiated message
   Server checks unit is AVAILABLE
   Server places HOLD (20 minutes) on unit in Redis
   Server broadcasts tower_refresh to ALL buyers (unit turns orange/reserved)
   
5. PAYMENT
   Buyer is taken to payment gateway
   Payment must complete within 20 minutes
   
6a. PAYMENT SUCCESS
   Backend webhook confirms payment
   Backend calls WebSocket server: /update-payment-status (true)
   Redis: unit → BOOKED, registration → WINNER
   WebSocket broadcasts tower_refresh (red) to ALL users
   WebSocket broadcasts unit_sold to all users EXCEPT winning buyer
   Winning buyer receives user_details_response (WINNER status)
   
6b. PAYMENT FAILURE / TIMEOUT
   Backend detects failure/timeout
   Backend calls WebSocket server: /update-payment-status (false)
   Redis: unit → AVAILABLE, registration → reverts to WAITLIST
   WebSocket broadcasts tower_refresh (green) to ALL users
   Buyer can attempt another unit
   
7. CAMPAIGN END
   Campaign time expires or admin stops campaign
   All remaining HOLD units are released
   Campaign status → STOPPED/COMPLETED
```

---

### Type 2: DYNAMIC Allocation

**Description:** Round-based. System auto-assigns units to buyers. Each round has a fixed time window.

**End-to-End Flow:**

```
1. ADMIN PREPARATION
   Admin creates AllocationCampaign (type=DYNAMIC)
   Admin sets: round_time (minutes per round), users_per_unit
   Admin sets tower sequence and band order (via Strapi/CMS)
   Admin starts the campaign

2. WARMUP
   All data loaded into Redis
   Tower sequence and band_order loaded into meta key

3. ROUND STARTS
   Round status → RUNNING
   System allocates one unit per eligible buyer (round-robin algorithm):
     - For each buyer, find their typology
     - Traverse tower sequence → within each tower traverse band_order
     - Find first AVAILABLE unit matching typology
     - Assign unit to buyer (registration → ALLOCATED, unit allocation list updated)
   All buyers receive user_details_response showing their allocated unit
   
4. BUYER ACTION
   Buyer sees their allocated unit in the portal
   Buyer reviews cost sheet, unit details
   Buyer clicks "Proceed to Pay" → proceed_to_pay WebSocket message
   
5. PAYMENT
   Buyer pays within the round time window
   
6a. PAYMENT SUCCESS (before round ends)
   Registration → WINNER
   Unit → BOOKED
   unit_sold broadcast to other users
   Lost unit history NOT updated (successful booking)
   
6b. PAYMENT FAILURE
   Unit → AVAILABLE (released back to pool)
   System immediately finds next available unit (same typology, round-robin from current position)
   If next unit found: buyer → ALLOCATED to new unit, reallocation_notification sent
   If no unit: buyer → WAITLIST, waitlist notification sent
   Lost unit added to buyer's lost_units history
   
7. ROUND END (timer expires)
   Any remaining ALLOCATED (unpaid) units are released
   Buyers who didn't pay → WAITLIST
   If campaign.stopScheduled = true → campaign stops
   Otherwise → Next round begins with remaining WAITLIST buyers
   
8. CAMPAIGN END
   All rounds complete or campaign stopped
   Campaign → COMPLETED/STOPPED
   All buyer user_details_response updated
```

**Round-Robin Logic:**
1. Get tower_sequence (ordered list of tower IDs)
2. For each tower, get band_order (ordered list of bands)
3. For each band, find AVAILABLE units of the buyer's typology
4. Assign first match to buyer
5. Move to next tower/band if current is exhausted
6. If all towers exhausted → buyer gets WAITLIST

---

### Type 3: PHYSICAL_EVENT Allocation

**Description:** In-person event. Sales Manager selects a unit on behalf of a walk-in customer.

**End-to-End Flow:**

```
1. ADMIN PREPARATION
   Admin creates AllocationCampaign (type=PHYSICAL_EVENT)
   Admin starts the campaign (opens the event)

2. SM PREPARATION
   SM logs into SM Portal
   SM opens Physical Allocation module

3. CUSTOMER SEARCH
   SM searches for the customer by name/phone/registration number
   System finds customer's active registration
   SM verifies identity

4. UNIT SELECTION (by SM on behalf of customer)
   SM views available units for customer's typology
   SM shows customer the floor plan and cost sheet
   SM selects unit on customer's behalf

5. PAYMENT
   Option A — Online: Customer pays via QR code scan or SM's device
   Option B — Offline: SM records offline payment details with proof

6. PAYMENT COMPLETION
   Same flow as STATIC (webhook confirmation or admin offline approval)
   
7. KYC COMPLETION (optional at event)
   SM can immediately complete KYC with customer present
   SM fills applicant details, uploads documents at the counter
```

---

## Unit Hold Rules

- Hold starts when `pay_now_initiated` is sent (STATIC) or `proceed_to_pay` is confirmed (DYNAMIC)
- Hold duration: **exactly 20 minutes**
- `holdAt` timestamp recorded on both `units` and `registration_units` tables
- Cron job checks every N minutes for expired holds
- If payment not received within 20 minutes → automatic hold release

---

## Allocation Eligibility Rules

For a registration to participate in an allocation campaign:
1. Registration must exist and have `status = Open` or `Won`
2. `paymentStatus = success` (registration payment completed)
3. `availableForAllocation = true`
4. Registration must be associated with the correct project

---

## Admin Override Capabilities

- Admin can manually assign a unit (ADMIN_ASSIGN_UNIT) outside of campaigns
- Admin can swap units between two customers (ADMIN_UNIT_SWAP)
- Admin can cancel a unit and return it to available pool (ADMIN_CANCEL_UNIT)
- Admin can bulk refund multiple units (ADMIN_BULK_REFUND_REGISTRATION_UNIT)
- Admin can update transaction details if there's a discrepancy

---

## Post-Allocation Steps

After WINNER status is confirmed:
1. LeadSquared: Booking token activity submitted
2. Mavis: Booking record created, unit status updated
3. Buyer: Prompted to complete KYC
4. Payment schedule: Generated after KYC submission
5. Milestone tracking: Records created for each milestone payment
