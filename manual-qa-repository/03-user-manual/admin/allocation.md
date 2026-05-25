# Admin Portal — Allocation Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/allocation`
**Sources:** ADMIN-BRD-Allocation.md · ADMIN-FS-Allocation.md
**Last Updated:** 2026-05-22

---

## Overview

The Allocation module is where you create and manage time-bound campaigns during which registered buyers can select and book units. No buyer can book a unit online without an active campaign (offline bookings are handled via the Customers module). Three campaign types are supported: **Static** (all eligible buyers see all available units simultaneously), **Dynamic** (round-based with system-assigned buyer rounds), and **Physical Event** (walk-in on-site with admin/SM assigning units offline).

Reach the page from the left sidebar → **Allocation** or directly at `/admin/allocation`.

---

## Page Layout (At a Glance)

1. **Campaign Creation Form** (top): fields for Project, Name, Type, Start/End times, Description.
2. **Campaign List Table** (lower): filterable list of all campaigns with status badges and actions.
3. **Filter Bar** (above table): Project, Status, Type, Search-by-name, Refresh.

---

# Feature 1 — Create Allocation Campaign

### What it does
Creates a scheduled campaign that opens the buyer unit-selection window between a Start Time and an End Time.

### Preconditions
- Admin session.
- At least one tower is Active in Config CMS → Tower Configuration.
- No other Active campaign is currently running (single-campaign assumption on UAT).
- For Physical Event: a `commonPoolExcel` file is ready for upload.
- For Static / Dynamic: an `allotmentExcel` file is ready (when applicable).

### How to use
1. Open `/admin/allocation`.
2. Fill in the form at the top:
   - **Project** — dropdown (e.g. Xanadu Test Project).
   - **Campaign Name** — must be unique per project.
   - **Allocation Type** — Static (default) / Dynamic / Physical Event.
   - **Start Time IST** — at least **3 minutes** in the future.
   - **End Time IST** — after Start Time.
   - **Description** — optional internal notes.
   - For PHYSICAL_EVENT, upload the `commonPoolExcel`. For STATIC/DYNAMIC, upload `allotmentExcel` as applicable.
3. Click **Save Campaign**.

### Result
- Backend hits `POST /api/v1/admin/allocation/campaigns`.
- Campaign created with `status = Upcoming`.
- Campaign appears in the list with the "Upcoming" badge.
- Toast: **"Campaign created successfully"**.
- At the scheduled Start Time, the campaign auto-transitions to `Active`; Python WebSocket service loads unit data into Redis. At End Time it auto-transitions to `Completed` (unless Stopped manually first).

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Start Time < now + 3 min | Red banner: "Start time must be at least 3 minutes from now. Please select start and end time again." |
| End Time ≤ Start Time | Validation error |
| Campaign Name duplicates an existing one in the same project | Validation error |
| PHYSICAL_EVENT without `commonPoolExcel` | HTTP 400 "Common pool units Excel is required for PHYSICAL_EVENT allocation type" |
| Excel validation fails | HTTP 400 with **XLSX binary body** (Content-Disposition attachment) — filenames `physical-event-allocation-errors.xlsx` or `dynamic-allocation-errors.xlsx`. NOT JSON. |
| DYNAMIC Excel — more than 20 registrations against one unit | Rejected with "Max registrations per unit exceeded (20)" |

### Warnings — backend gaps
- **`projectId` env-defaulted** (GAP-TL-001): if omitted, backend silently substitutes `1` (prod) or `2` (UAT). The "Project ID is required" check is dead code.
- **Stale campaigns auto-FAILED** (GAP-DEV-007): when creating a new campaign, any past-window non-terminal campaign is force-updated to `status='FAILED'`. This contradicts the documented auto-`Completed` transition. Behave accordingly when designing tests.
- **PHYSICAL_EVENT asymmetry** (GAP-DEV-013/014): unlike STATIC, PHYSICAL_EVENT does NOT enforce typology-match between buyer and unit, and does NOT reject overlap between the assigned-mapping unit set and the common pool. Both checks are commented out in source.

---

# Feature 2 — Monitor Campaign List

### What it does
Shows all campaigns across all statuses with filterable, searchable rows and status-dependent actions.

### Preconditions
- Admin session.

### How to use
1. Scroll to the campaign list under the form.
2. Read each row: Campaign Name, Allocation Type, Start Time, End Time, Status badge, Actions.
3. Filter or search:
   - **Project** dropdown
   - **Status** dropdown (Upcoming / Active / Completed / Stopped / Cancelled / Failed)
   - **Type** dropdown (Static / Dynamic / Physical Event)
   - **Search** by Campaign Name
   - **Refresh** to reload from server
4. Per row, the Actions column shows status-appropriate options:

| Status | Meaning | Actions |
|--------|---------|---------|
| Upcoming | Created; start time not yet reached | View · Cancel |
| Active | Running — between start and end time | View · Stop |
| Completed | Auto-ended at End Time | View |
| Stopped | Manually stopped before End Time | View |
| Cancelled | Cancelled before campaign started | View |
| Failed | System error during campaign | View |

### Result
You can quickly find any campaign by status, type, or name and trigger its allowed action.

### Warning — FAILED status (GAP-DEV-011)
The service method `markAllocationCampaignFailed` calls `destroy()` on the row instead of setting `status='FAILED'`. As a result the **FAILED filter will always be empty** — there is no observable FAILED row in the UI. Treat FAILED as aspirational in §5 of the BRD until source is fixed.

---

# Feature 3 — Stop Active Campaign

### What it does
Ends a running campaign before its scheduled End Time, immediately closing the buyer unit-selection window.

### Preconditions
- Campaign is in `Active` status.

### How to use
1. Find the Active row in the campaign list.
2. Click **Stop** in the Actions column.
3. A confirmation modal appears:
   - Title: **"Stop Allocation Now?"**
   - Body: **"Campaign will move to Stopped."**
   - Confirm: red **"Yes, Stop Now"** button
   - Cancel: **"Close"**
4. Click **Yes, Stop Now**.

### Result
- Backend hits `PUT /api/v1/admin/allocation/campaigns/:id/stop` (route surface — see backend note below).
- Python service is asked to flip status; status update is async.
- Python WebSocket service clears the real-time unit cache.
- All active buyer WebSocket sessions receive a session-close event.
- Remaining `RegistrationUnit.allocationStatus = 'available'` flips to `waiting` (Waitlisted).
- Buyers who completed payment stay `confirmed` (Booked).
- Buyers on the Customer Portal see: *"Allocation window is closed for now."*
- Buyers receive a Kaleyra notification that the campaign has ended.

### Warning — async status flip (GAP-DEV-010)
`terminateAllocationCampaign` does NOT update `AllocationCampaign.status` synchronously. It calls Python `/campaign/stop` and waits for the Python callback. The status badge in the admin list may lag by seconds. Refresh if necessary.

### Note — route surface (GAP-TL-007)
Stop and Cancel likely route through a single `updateAllocationCampaign` PUT endpoint with an `action` field, not the separate `/stop` and `/cancel` routes documented above. API testers should validate both shapes.

---

# Feature 4 — Cancel Upcoming Campaign

### What it does
Cancels a campaign before its Start Time so it never goes live.

### Preconditions
- Campaign is in `Upcoming` status.

### How to use
1. Find the Upcoming row in the campaign list.
2. Click **Cancel** in the Actions column.
3. Confirm in the prompt.

### Result
- Backend hits `PUT /api/v1/admin/allocation/campaigns/:id/cancel` (or the unified action endpoint).
- Status flips to `Cancelled`.
- No buyer impact — campaign never went live.
- No notifications dispatched.

---

# Feature 5 — Customer Unit Selection (Buyer-side; admin monitors)

### What it does
The buyer-facing flow during an Active campaign. Admin monitors via the campaign dashboard.

### Buyer flow
1. Buyer logs in to Customer Portal (`https://uat.xrportal.in`) using mobile + OTP.
2. Buyer sees tower grid with colour-coded cells (white = available, red = sold, orange = being paid, grey = reserved).
3. Buyer clicks a white unit → details panel shows Unit No, BHK Type, Size, Agreement Value, applicable Home Loan / Early Bird discount, All Inclusive Price, and Confirmation Amount.
4. Buyer clicks **Proceed to Pay**. Offers are queried **live** at this moment (not at page load) — an offer toggled OFF between view and submit will disappear from the booking.
5. Easebuzz payment popup opens. Buyer completes payment.
6. Easebuzz webhook confirms → `PaymentTransaction.status='completed'`, `RegistrationUnit.allocationStatus='confirmed'`, `Unit.status='BOOKED'`. Mavis + LSQ synced.
7. Buyer sees booking confirmation; Kaleyra Email + WhatsApp sent.

### Admin monitoring
Open `/admin/allocation` during an Active campaign. The dashboard updates in real time as units are selected and booked.

### Pricing formula (corrected — GAP-TL-015)
```
finalAgreementValue =
    agreementValue
  + totalParkingAmount
  − earlyBirdBenefit
  − (homeLoanDiscountAmount  IF home-loan eligible)
  − offerDiscountAmount
```

**Home-loan eligibility:** `RegistrationHomeLoan.status='completed' AND loanApprovalStatus != 'admin_rejected'` OR `loanApprovalStatus='admin_approved'`.

**GST (GAP-TL-010):** 1% if `finalAgreementValue < ₹45 lakh`, else 5%.
**TDS (GAP-TL-010):** suppressed to ₹0 when `finalAgreementValue < ₹45 lakh`.
**Stamp duty (GAP-DEV-020):** hard-coded at 7% of `finalAgreementValue` (not config-driven).

### Warnings
- **Easebuzz bot detection** prevents automated browser completion of payment on UAT. Manual testing required for the payment step.
- **Hold expiry** (GAP-DEV-015): unit HOLD auto-releases to AVAILABLE 20 minutes after the hold timestamp.
- **Immediate release** (GAP-DEV-016): payment statuses `cancelled`, `bounced`, `failed` release the unit immediately; all other terminal payment statuses wait for the 20-minute timeout.
- **STATIC InitialAllotment** (GAP-DEV-017): rows are bulk-created post-payment at booking finalize — not at campaign start.
- **DYNAMIC orphan WINNER** (GAP-DEV-018): if no PREALLOCATED/ALLOCATED row exists, code falls back to last `dynamicRoundId`; if none, logs a warning and skips — booking still succeeds with no campaign trace.

---

# Feature 6 — Dynamic Campaign Rounds (API)

### What it does
Lists the rounds (and their pagination) for a Dynamic campaign.

### How to use
- API: `GET /api/v1/admin/allocation/campaign/:campaignId/rounds`
- Defaults: `page=1`, `limit=20`.

### Result
Paginated rounds list for the campaign. (Surfaced via API; UI may render this as a side panel — confirm in spec/locator map.)

---

# Feature 7 — Campaign Allotments Export

### What it does
Streams a full Excel export of all allotments for a given campaign.

### How to use
- API: `GET /api/v1/admin/allocation/campaign/:campaignId/allotments/export`
- Response: XLSX stream.

### Result
Downloadable Excel of all allotments — useful for offline analysis and reconciliation.

---

# Feature 8 — Notify Physical Event Registrants

### What it does
Triggers a Kaleyra notification batch to all registrants of a Physical Event campaign.

### How to use
- API: `POST /api/v1/admin/allocation/campaigns/:campaignId/notify`
- Admin-triggered (no buyer self-service equivalent).

### Result
All physical-event registrants receive notifications.

---

## Campaign Status Flow

```
Upcoming ──► Active ──► Completed   (automatic — end time reached)
   │              │
   └──► Cancelled  └──► Stopped     (manual)
                  └──► Failed        (system — see backend note)
```

**Status enum (RegistrationUnit.status):** `WINNER`, `PREALLOCATED`, `WAITLIST`, `HOLD`, `CANCELLED`.

---

## Business Rules

1. Start Time must be ≥ 3 minutes from creation time.
2. Only one Active campaign should run at a time on UAT.
3. At least one Active tower (in Config CMS) is required for a meaningful campaign.
4. After campaign end, unpaid buyers → `Waitlisted`; paid buyers → `Confirmed` (Booked).
5. **Stop** ends an Active campaign; **Cancel** removes an Upcoming campaign.
6. A **2-minute pre-start blackout** (GAP-DEV-008): Unit Swap, Cancel Unit, Assign Unit, and Bulk Refund are blocked for the 2 minutes preceding any scheduled campaign start.

---

## Role Restrictions

- Create / Stop / Cancel campaigns: Admin role (`roleId=1`).
- Monitoring / read-only access: Admin and Sales Manager Admin (`roleId=4`).

---

## Integrations

| System | Role |
|--------|------|
| Python WebSocket Server | Real-time unit-grid updates during active campaign; status flip callback for Stop/Cancel |
| Redis | Campaign state cache and 20-min unit hold timers |
| Easebuzz | Online payment gateway for buyer confirmation |
| Kaleyra | SMS / Email / WhatsApp notifications on Active / End / Notify-registrants events |
| Mavis | Booking + unit-status sync after payment |
| LeadSquared | Booking activity logged to CRM |

---

## Known Critical Issues (do not write passing tests against)

1. **`cancelUserAllocation` ownership broken** (GAP-TL-008) — any authenticated user can cancel any registrationUnit by ID. Endpoint is unsafe to test on UAT.
2. **`markAllocationCampaignFailed` destroys the row** (GAP-DEV-011) — no observable FAILED row.
3. **Double-booking race** (GAP-DEV-034) — no DB-level UNIQUE on `unit_id` for WINNER/HOLD; concurrent writes can both succeed.
4. **`createPaymentIntent` has no validation** (GAP-TL-009) — undocumented; candidate for removal.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Start time must be at least 3 minutes from now" | Lead time violated | Pick a Start Time ≥ now + 3 min |
| PHYSICAL_EVENT create returns XLSX binary error | Excel validation failed | Open the downloaded XLSX — error rows are listed inside |
| FAILED filter shows nothing despite failures | Service destroys failed rows instead of setting status | Known issue — escalate; do not assert FAILED in tests |
| Stop click does not flip status immediately | Status flip is async via Python callback | Refresh after a few seconds |
| Unit Swap / Cancel Unit blocked in Customers | 2-minute pre-start campaign blackout | Wait for the upcoming campaign to start or pass |
| Buyer paid but unit not BOOKED | Easebuzz webhook lag | Allow time; verify in Payment Transactions module |
| Buyer sees "Allocation window is closed for now." | Campaign was Stopped or auto-Completed | By design — create a new campaign if needed |
