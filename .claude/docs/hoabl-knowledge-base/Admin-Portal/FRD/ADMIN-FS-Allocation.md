---
type: feature-spec
portal: Admin Portal
module: Allocation
updated: 2026-05-11
status: complete
---

# Admin Portal — Allocation Module Feature Specifications

---

# Feature 1: Create Allocation Campaign

## 1. Objective
Enable admins to create a time-bound allocation campaign that opens the unit selection window for eligible registered buyers, controlling when and how buyers can choose and book units.

## 2. Scope
Campaign creation form at the top of the `/admin/allocation` page. Three campaign types are supported: Static, Dynamic, and Physical Event.

## 3. Eligibility / Preconditions
- Admin session required.
- No more than one Active campaign should run simultaneously on UAT.
- At least one tower must be Active (toggled ON in Config → Tower Configuration).

## 4. UI Changes
- Campaign creation form is the top section of the Allocation page.
- Below the form: existing campaigns table.

## 5. Form Details

| Field | Type | Mandatory | Notes |
|-------|------|-----------|-------|
| Project | Dropdown | Yes | Select project (e.g., Xanadu Test Project) |
| Campaign Name | Text | Yes | Must be unique per project run |
| Allocation Type | Dropdown | Yes | **Static** (default) / Dynamic / Physical Event |
| Start Time IST | Datetime picker | Yes | Must be at least 3 minutes from the time of creation |
| End Time IST | Datetime picker | Yes | Must be after Start Time |
| Description / Notes | Textarea | No | Internal notes for campaign reference |

**Buttons:** Save Campaign | Reset

## 6. Validations & Business Rules
1. Start Time must be at least 3 minutes from now. If violated: red banner — *"Start time must be at least 3 minutes from now. Please select start and end time again."*
2. End Time must be after Start Time.
3. Campaign Name must not duplicate an existing campaign name for the same project.
4. Allocation Type selection determines buyer experience (see Campaign Type Behaviours below).

### Campaign Type Behaviours

| Type | How Buyers Participate |
|------|----------------------|
| Static | All eligible buyers see all available units simultaneously; buyer selects their preferred unit |
| Dynamic | Round-based; system assigns buyers to rounds; only the active round can see the unit grid |
| Physical Event | Walk-in on-site event; admin or SM assigns units offline on behalf of buyers |

## 7. System Actions on Submit
1. `POST /api/v1/admin/allocation/campaigns` with campaign details.
2. Campaign record created with `status = 'Upcoming'`.
3. Campaign scheduler monitors start/end times:
   - At Start Time: status → `Active`; Python WebSocket service loads unit data into Redis real-time cache.
   - At End Time (if not manually stopped): status → `Completed`; cache cleared.
4. Campaign appears in campaign list with "Upcoming" badge.
5. Toast: *"Campaign created successfully"*

## 8. Notifications
<!-- FSD-CORRECTION 2026-05-25 -->
- **NONE on campaign creation or activation.** No automatic buyer notification fires when a campaign is created or transitions to Running. The only notification path for campaign launch is the explicit admin action `POST /campaigns/:campaignId/notify` (PHYSICAL_EVENT type only). // Source: allocation-campaign.service.js:530-1010

## 9. Audit & Logging
- Admin user ID, timestamp, campaign name, allocation type, start/end times logged.

## How to Use

1. **Navigate to Allocation:** Go to `/admin/allocation` from the left sidebar.
2. **Fill in the campaign form** at the top of the page:
   - **Project:** Select the project (e.g., Xanadu Test Project).
   - **Campaign Name:** Enter a unique name for this campaign run.
   - **Allocation Type:** Select Static (all buyers see units simultaneously), Dynamic (round-based), or Physical Event (walk-in on-site).
   - **Start Time IST:** Select a start date and time at least 3 minutes from now.
   - **End Time IST:** Select when the campaign should close automatically.
   - **Description (optional):** Add internal notes.
3. **Click "Save Campaign":** The campaign is created with status "Upcoming" and appears in the campaign list below.
4. **Wait for start time:** At the scheduled start time, the campaign automatically becomes Active and buyers can begin unit selection.

---

# Feature 2: Monitor Campaign List

## 1. Objective
Provide admins a real-time view of all campaigns across all statuses, with filtering capability to track ongoing and past allocation events.

## 2. Scope
Campaign list table in the lower section of the `/admin/allocation` page.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Table with filter bar above it.
- Each row shows campaign details and available actions based on current status.

## 5. Table Columns

| Column | Description |
|--------|-------------|
| Campaign Name | Name given at creation |
| Allocation Type | Static / Dynamic / Physical Event |
| Start Time | Scheduled campaign open time |
| End Time | Scheduled campaign close time |
| Status | Current status badge |
| Actions | View / Stop / Cancel (status-dependent) |

## 6. Filters

| Filter | Options |
|--------|---------|
| Project | Dropdown |
| Status | Dropdown (Upcoming / Active / Completed / Stopped / Cancelled / Failed) |
| Type | Dropdown (Static / Dynamic / Physical Event) |
| Search | Campaign Name text search |
| Refresh | Reloads list from server |

## 7. Campaign Status Flow

```
Upcoming ──► Active ──► Completed  (automatic — end time passed)
   │             │
   └──► Cancelled  (manual — admin cancels before start)
                 └──► Stopped  (manual — admin stops during Active)
                 └──► Failed   (system error)
```

### Status and Available Actions

| Status | Meaning | Actions Available |
|--------|---------|------------------|
| Upcoming | Created, start time not yet reached | View · Cancel |
| Active | Running — between start and end time | View · Stop |
| Completed | Ended automatically at end time | View only |
| Stopped | Manually stopped before end time | View only |
| Cancelled | Cancelled before campaign started | View only |
| Failed | System error during campaign | View only |

## How to Use

1. **View the campaign list:** Scroll to the lower section of the Allocation page to see all campaigns.
2. **Check campaign status:** Each row shows a coloured status badge — Upcoming, Active, Completed, Stopped, Cancelled, or Failed.
3. **Filter campaigns:** Use the Status, Type, or Project dropdowns to narrow the list. Search by campaign name in the text field.
4. **Take action:** Based on status, click View (all statuses), Stop (Active only), or Cancel (Upcoming only) in the Actions column.
5. **Refresh:** Click the Refresh button to reload the latest campaign states from the server.

---

# Feature 3: Stop Active Campaign

## 1. Objective
Allow admins to manually end a running allocation campaign before its scheduled end time, immediately closing the unit selection window for all buyers.

## 2. Scope
"Stop" action available on Active campaigns in the campaign list.

## 3. Eligibility / Preconditions
- Campaign must be in `Active` status.

## 4. UI Changes
- "Stop" action link/button on Active campaign rows.

## 5. Confirmation Modal

| Element | Content |
|---------|---------|
| Title | "Stop Allocation Now?" |
| Body | "Campaign will move to Stopped." |
| Confirm | "Yes, Stop Now" (red) |
| Cancel | "Close" |

## 6. Validations & Business Rules
1. Only Active campaigns can be stopped.
2. Stopped campaigns and Completed (auto-ended) campaigns produce the same result for buyers — Customer Portal shows: *"Allocation window is closed for now."*
3. Registrations that were `available` during the campaign revert to `waiting` (Waitlisted) after campaign ends.
4. Registrations that completed payment during the campaign remain `confirmed` (Booked).

## 7. System Actions on Confirm
1. `PUT /api/v1/admin/allocation/campaigns/:id/stop`
2. Campaign `status` → `Stopped`
3. Python WebSocket service clears real-time unit cache for this campaign
4. All active buyer WebSocket sessions receive a session close event
5. Remaining `RegistrationUnit.allocationStatus = 'available'` → set to `waiting`

## 8. Notifications
<!-- FSD-CORRECTION 2026-05-25 -->
- **NONE.** `terminateAllocationCampaign` only calls Python `/campaign/stop` and writes audit log. No buyer notification path exists on campaign stop/terminate. // Source: allocation-campaign.service.js:1012-1075

## 9. Audit & Logging
- Admin user ID, campaign ID, stop timestamp logged.

## How to Use

1. **Find the Active campaign** in the campaign list (Status = "Active").
2. **Click "Stop"** in the Actions column.
3. **Review the confirmation modal:** The popup confirms that the campaign will move to "Stopped" status.
4. **Click "Yes, Stop Now"** (red button) to confirm.
5. **Result:** The campaign ends immediately. All buyer unit selection sessions are closed. Buyers who had not yet paid are moved to the Waitlist. Buyers who completed payment during the campaign retain their confirmed bookings. Buyers on the Customer Portal see: "Allocation window is closed for now."

---

# Feature 4: Cancel Upcoming Campaign

## 1. Objective
Allow admins to cancel a campaign that has not yet started, removing it from the active schedule.

## 2. Scope
"Cancel" action available on Upcoming campaigns only.

## 3. Eligibility / Preconditions
- Campaign must be in `Upcoming` status (start time not yet reached).

## 4. UI Changes
- "Cancel" action on Upcoming campaign rows.

## 5. Confirmation
Simple confirmation prompt before cancellation.

## 6. Validations & Business Rules
1. Only Upcoming campaigns can be cancelled.
2. Cancellation is immediate — no campaign runs.
3. No buyer impact (buyers were not yet in an allocation window).

## 7. System Actions on Confirm
1. `PUT /api/v1/admin/allocation/campaigns/:id/cancel`
2. Campaign `status` → `Cancelled`

## 8. Notifications
None — campaign never went live.

## 9. Audit & Logging
- Admin user ID, campaign ID, cancellation timestamp logged.

## How to Use

1. **Find the Upcoming campaign** in the campaign list (Status = "Upcoming" — campaign has not yet started).
2. **Click "Cancel"** in the Actions column.
3. **Confirm the cancellation** in the prompt that appears.
4. **Result:** The campaign is cancelled and no allocation window opens. No buyers are affected since the campaign never went live. The campaign row status changes to "Cancelled".

---

# Feature 5: Customer Unit Selection (Buyer-Side, during Active Campaign)

## 1. Objective
Allow registered buyers to browse available towers, select a unit, view pricing with applicable offer discounts, and initiate payment during an active allocation window.

## 2. Scope
Customer Portal (`https://uat.xrportal.in`) — buyer-facing side of the allocation flow. Admin monitors via campaign dashboard.

## 3. Eligibility / Preconditions
- Buyer must be registered with `allocationStatus = 'available'`.
- An Allocation Campaign must be Active.
- Buyer must log in to Customer Portal using their registered mobile + OTP.

## 4. Unit Selection Grid

Buyers see a grid of floors and units for each active tower:

| Colour | Status | Action |
|--------|--------|--------|
| White | Available | Click to view details and select |
| Green | Selected (current session) | — |
| Red | Sold/Booked | Not clickable |
| Orange | Being paid by another buyer | Not clickable |
| Grey | Refuge / Reserved / Blocked | Not clickable |

## 5. Unit Detail Panel (on Available unit click)

| Field | Example |
|-------|---------|
| Unit No | 3502 – Crest |
| BHK Type | 1 BHK Growth Home |
| Size | 323 sq.ft. |
| Agreement Value | ₹32,99,000 |
| Home Loan Offer Discount | -₹10,000 (if HOME_LOAN offer active) |
| Early Bird Benefit Discount | -₹27,000 (if early bird offer active) |
| All Inclusive Price | ₹35,52,960 |
| Total Discount Badge | ₹37,000 |
| Confirmation Amount (Pay) | ₹27,000 |

**Pricing formula:**
```
Agreement Value
  – Offer Discounts (all active, applicable offers)
= All Inclusive Price
Confirmation Amount = allocationAmount from Unit record
```

## 6. Offer Application Logic
- Offers are queried live at the moment buyer clicks "Proceed to Pay" (not at page load).
- Any offer with `isActive = 1 AND startDate ≤ today AND endDate ≥ today` and matching typology is applied.
- Race condition: if an offer is toggled OFF between the buyer viewing the price and submitting payment, the offer disappears from the final booking amount.

## 7. Payment Flow
1. Buyer clicks "Proceed to Pay" → Easebuzz payment popup opens.
2. Buyer completes payment (₹27,000 or as configured).
3. Easebuzz webhook confirms payment → `PaymentTransaction.status` → `completed`.
4. `RegistrationUnit.allocationStatus` → `confirmed`.
5. Unit status → `BOOKED`.
6. Mavis + LSQ synced.
7. Buyer redirected to booking confirmation screen.

**Note:** Easebuzz bot detection prevents automated browser completion of payment on UAT. Manual testing required for the payment step.

## 8. Notifications
<!-- FSD-CORRECTION 2026-05-25 -->
- **WhatsApp + SMS only. No email.** On payment success: WhatsApp template `congrates_payment_success_27sept` + SMS `ALLOTMENT_PAYMENT_SUCCESS` (Indian phones only, `countryCode === '+91'`). On failure: WhatsApp template `payment_unsuccessful_27sept` + SMS `ALLOTMENT_PAYMENT_FAILED`. // Source: allocation.service.js:1796-1833

## 9. Audit & Logging
- Allocation transaction logged: buyer ID, unit ID, amount, campaign ID, timestamp.

## How to Use

*This feature is on the Customer Portal (buyer-facing), not the Admin Portal. Admin monitors in real time via the campaign dashboard.*

**Buyer flow during an Active campaign:**
1. **Buyer logs in** to the Customer Portal (`https://uat.xrportal.in`) using their registered mobile and OTP.
2. **Buyer sees the tower grid:** White units are available, red are sold, orange are being paid by someone else, grey are reserved.
3. **Buyer clicks an available (white) unit** to view details: unit number, BHK type, size, Agreement Value, applicable discounts, and Confirmation Amount.
4. **Buyer clicks "Proceed to Pay":** Pricing is calculated live including all active applicable offers. The Easebuzz payment popup opens.
5. **Buyer completes payment:** After successful payment, the unit is marked Booked and the buyer sees a booking confirmation screen.
6. **Admin can monitor:** The Allocation campaign dashboard updates in real time as units are selected and booked.

---

# Backend Gap Reconciliation (2026-05-21)

Controller- and service-layer audit findings against the Allocation surface. These notes override conflicting statements in the features above. See parent BRD §10 for full narrative; this section restates spec-level points.

### ⚠️ KNOWN ISSUE — CRITICAL: `cancelUserAllocation` ownership check broken
<!-- BA correction: GAP-TL-008, 2026-05-21 -->
Any authenticated user can cancel any `registrationUnit` by ID (`allocation.controller.js:56-62`). Do not document the endpoint until fixed.

### ⚠️ KNOWN ISSUE — CRITICAL: `markAllocationCampaignFailed` destroys the row
<!-- BA correction: GAP-DEV-011, 2026-05-21 -->
The service does `destroy()` not status-update. The "FAILED" status filter in Feature 2 will always be empty. Treat FAILED as aspirational.

### ⚠️ KNOWN ISSUE — CRITICAL: Double-booking race window
<!-- BA correction: GAP-DEV-034, 2026-05-21 -->
No DB-level uniqueness on assigned `unit_id` for WINNER/HOLD. Concurrent requests can both pass the app-level check.

### Feature 1 corrections (Campaign Create)
- **§6 / §7:** `projectId` is env-defaulted to 1 (prod) / 2 (UAT) when omitted. <!-- BA correction: GAP-TL-001, GAP-DEV-001, 2026-05-21 -->
- **§5 / §7:** PHYSICAL_EVENT requires `commonPoolExcel` file; STATIC/DYNAMIC accept `allotmentExcel`. Missing → HTTP 400. <!-- BA correction: GAP-TL-002, 2026-05-21 -->
- **§7 errors:** Excel validation failures return HTTP 400 with XLSX binary body (filenames `physical-event-allocation-errors.xlsx` / `dynamic-allocation-errors.xlsx`), NOT JSON. <!-- BA correction: GAP-TL-003, 2026-05-21 -->
- **DYNAMIC Excel:** 20-registration-per-unit hard cap, separate from configurable `allocationsPerUnit`. <!-- BA correction: GAP-DEV-012, 2026-05-21 -->
- **PHYSICAL_EVENT asymmetry:** typology-match check and assigned-vs-pool overlap check are both commented out (STATIC enforces typology-match). <!-- BA correction: GAP-DEV-013, GAP-DEV-014, 2026-05-21 -->
- **Stale campaign cleanup:** Past-window non-terminal campaigns are forced to `status='FAILED'` on next create. <!-- BA correction: GAP-DEV-007, 2026-05-21 -->

### New Feature — Dynamic Campaign Rounds <!-- BA correction: GAP-TL-004, 2026-05-21 -->
- **Endpoint:** `GET /api/v1/admin/allocation/campaign/:campaignId/rounds`
- **Defaults:** `page=1`, `limit=20`
- **Returns:** paginated rounds list for the campaign.

### New Feature — Campaign Allotments Export <!-- BA correction: GAP-TL-005, 2026-05-21 -->
- **Endpoint:** `GET /api/v1/admin/allocation/campaign/:campaignId/allotments/export`
- **Returns:** Excel stream of all allotments for the campaign.

### New Feature — Notify Physical Event Registrants <!-- BA correction: GAP-TL-006, 2026-05-21 -->
- **Endpoint:** `POST /api/v1/admin/allocation/campaigns/:campaignId/notify`
- **Action:** Triggers Kaleyra notifications to all physical-event registrants.

### Feature 3 / 4 corrections (Stop / Cancel)
- **Route surface:** Likely a single `updateAllocationCampaign` PUT endpoint that takes an `action` field (values include stop/cancel). The doc's separate `/stop` and `/cancel` route claims are unverified. <!-- BA correction: GAP-TL-007, 2026-05-21 -->
- **Status flip is async:** `terminateAllocationCampaign` does NOT update `AllocationCampaign.status` synchronously — it calls Python `/campaign/stop` and waits for callback. <!-- BA correction: GAP-DEV-010, 2026-05-21 -->

### Feature 5 corrections (Pricing / Buyer Booking)
- **finalAgreementValue formula:** `agreementValue + totalParkingAmount − earlyBirdBenefit − (homeLoanDiscountAmount if eligible) − offerDiscountAmount`. <!-- BA correction: GAP-TL-015, 2026-05-21 -->
- **Home-loan eligibility:** `RegistrationHomeLoan.status='completed' AND loanApprovalStatus != 'admin_rejected'` OR `loanApprovalStatus='admin_approved'`. <!-- BA correction: GAP-TL-015, 2026-05-21 -->
- **GST:** 1% if finalAgreementValue < ₹45 lakh, else 5%. <!-- BA correction: GAP-TL-010, 2026-05-21 -->
- **TDS:** suppressed (₹0) when finalAgreementValue < ₹45 lakh. <!-- BA correction: GAP-TL-010, 2026-05-21 -->
- **Stamp duty:** hard-coded 7%. <!-- BA correction: GAP-DEV-020, 2026-05-21 -->
- **Hold expiry:** 20 minutes; payment statuses `cancelled`/`bounced`/`failed` release immediately. <!-- BA correction: GAP-DEV-015, GAP-DEV-016, 2026-05-21 -->
- **STATIC InitialAllotment:** rows created post-payment at booking finalize, not at campaign start. <!-- BA correction: GAP-DEV-017, 2026-05-21 -->
- **DYNAMIC orphan WINNER:** if no PREALLOCATED/ALLOCATED row, fallback to last `dynamicRoundId`; if still none, log+skip (booking still succeeds). <!-- BA correction: GAP-DEV-018, 2026-05-21 -->
- **migrateUnassignedUnitsAfterBooking:** disabled in source. PHYSICAL_EVENT buyer's other units do not auto-release. <!-- BA correction: GAP-DEV-019, 2026-05-21 -->

### KYC sub-feature corrections
- **submitKyc partial-success response:** HTTP 207 Multi-Status when some units succeed. <!-- BA correction: GAP-TL-011, 2026-05-21 -->
- **submitKyc SM proxy:** `reqFromSm=true` switches operating user to `userId` in payload with no caller-role check. <!-- BA correction: GAP-TL-012, 2026-05-21 -->
- **verifyKycEsignOtp master OTP:** `otpConfig.adminMasterOtp` accepted for any user, skipping expiry/value validation. <!-- BA correction: GAP-TL-014, 2026-05-21 -->
- **Admin overrides:** `forcedCancel` (bool) and `fallbackStatus` (string) accepted from admin role only. <!-- BA correction: GAP-TL-013, 2026-05-21 -->

### Status enum reference <!-- BA correction: GAP-TL-016, 2026-05-21 -->
RegistrationUnit.status ∈ { `WINNER`, `PREALLOCATED`, `WAITLIST`, `HOLD`, `CANCELLED` }.

### Campaign pre-start blackout <!-- BA correction: GAP-DEV-008, 2026-05-21 -->
`checkAnyActiveCampaignExists` returns true for any RUNNING campaign OR any NOT_STARTED campaign with `startTime <= now + 2 min`. Unit Swap, Cancel Unit, Assign Unit, Bulk Refund are blocked during this window.

### Bulk refund dynamic-membership check disabled <!-- BA correction: GAP-DEV-009, 2026-05-21 -->
The per-registration `activeCampaignRegistrationSet.has(unitNumber)` block is commented out. Only the global 2-min blackout protects against refunding mid-dynamic-campaign units.

### createPaymentIntent undocumented endpoint <!-- BA correction: GAP-TL-009, 2026-05-21 -->
Stores any string into PaymentIntent. Hard-codes `transactionType=2`. No referential validation. Candidate for removal — do not write functional tests against it.
