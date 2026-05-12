---
module: Allocation
url: https://uat-web.xrportal.in/admin/allocation
sprint: 3
status: Automated
spec: tests/ui/allocation.spec.js
tcs: SETUP-01–03 + TC-ADM-001–010 + TC-CST-001–030 (44 total)
updated: 2026-05-10
---

# Module — Allocation

## 1. Overview

Two-sided module: Admin campaign management (create, monitor, stop campaigns) and Customer portal unit selection flow (browse towers, select unit, pay, KYC).

**Admin URL:** `https://uat-web.xrportal.in/admin/allocation`
**Customer Portal URL:** `https://uat.xrportal.in`
**Auth:** Admin session for admin side; Customer OTP login for customer portal
**Page Object:** `src/pages/AllocationPage.js`
**Selectors:** `docs/selectors/allocation.json` (90+ selectors across 10 sections)

## 2. Navigation

Left sidebar → "Allocation" → `/admin/allocation`

## 3. Page Layout

### Admin — Campaign Management Page (`/admin/allocation`)

**Top section:** New Allocation Campaign form
**Bottom section:** Campaign list table with filters

**Create Campaign Form:**

| Field | Type | Required | Rule |
|-------|------|----------|------|
| Project | Dropdown | Yes | Select: Xanadu Test Project |
| Campaign Name | Text input | Yes | Must be unique per run — pattern: `Static Camp-Automation Test [N]` |
| Allocation Type | Dropdown | Yes | Default: **Static** — DO NOT change |
| Start Time IST | Datetime picker | Yes | Must be ≥ 3 minutes from now — recommended: now + 4 min |
| End Time IST | Datetime picker | Yes | Must be after Start Time — recommended: Start + 5 min |
| Description / Notes | Textarea | No | Optional |

**Buttons:** Save Campaign | Reset

**Validation:**
- Start time < 3 min from now → red banner: "Start time must be at least 3 minutes from now. Please select start and end time again."
- Success toast: "Campaign created successfully"

**Campaign List Table Columns:** Campaign Name | Allocation Type | Start Time | End Time | Status | Actions

**Pagination:** Total X campaigns count shown; 10/page selector at bottom right.

**Filters:** Project | Status | Type | Search (Campaign Name) | Refresh

**Stop Confirmation Popup:**
- Title: "Stop Allocation Now?"
- Message: "Campaign will move to Stopped."
- Buttons: "Close" | "Yes, Stop Now" (red)

### Campaign Status Flow

```
Upcoming ──► Active ──► Completed  (End time passed automatically)
   │             │
   └──► Cancelled  (manual — Cancel from Upcoming only)
                 └──► Stopped  (manual — Stop from Active before End Time)
                 └──► Failed  (system error)
```

**Status values and available actions:**

| Status | Badge | Meaning | Actions |
|--------|-------|---------|---------|
| Active | Green | Running — start reached, end not yet | View · Stop |
| Upcoming | Grey | Created, start not reached | View · Cancel |
| Completed | Light green | Ended automatically after End Time | View |
| Stopped | — | Manually stopped before End Time | View |
| Cancelled | — | Cancelled before campaign started | View |
| Failed | — | System error during campaign | View |

> Stopped (manual) and Completed (auto) produce the **same closed state** on the customer portal.

### Customer Portal — Login

**URL:** `https://uat.xrportal.in`

Login flow: Select "Indian National" tab → Enter mobile → Send OTP → Enter OTP → Verify OTP → Home dashboard

**Test account (Mamta Solanki):** Mobile `1111111207`, OTP `147258`

### Customer Portal — Home Dashboard

Left nav: Home | Registration | Allotment | Homeloan | Project | Work Progress

**Table columns:** Registration Number | Home Loan | Allotted Unit | Status | Process Status | Payment Schedule

**Mamta's registration states during active campaign:**

| Registration | Status | Process Status |
|-------------|--------|----------------|
| GHNG-1000000063-A | Available (green) | "Proceed to Confirm" button |
| GHNG-1000000063-B | Waitlisted | — |
| GHNG-1000000063-C | Refunded | — |
| GHNG-1000000063-D | Refunded | — |
| GHNG-1000000063-E | Refunded | — |
| GHNG-1000000063-F | Waitlisted | — |
| GHNG-1000000063-G | Waitlisted | — |

After campaign Stops or Completes: A → Booked; others remain Waitlisted.

### Customer Portal — Unit Selection

**URL:** `https://uat.xrportal.in/unitselection`

**Available towers during campaign:**

| Tower | Available Units |
|-------|----------------|
| Crest | ~159 |
| Crown | — |
| Blossom | — |
| Pinnacle | — |
| Bright | — |

**Unit grid:** Floors 1–35 visible; 8 unit columns per floor.

**Unit colour coding:**

| Colour | Status | Selectable |
|--------|--------|------------|
| White/light border | Available | Yes |
| Green | Selected (current session) | — |
| Red | Sold | No |
| Orange | Paying now (another session) | No |
| Grey | Refuge / Reserved / Blocked | No |

**Unit Detail Panel (right side — appears on available unit click):**

| Field | Example (Unit 3502 · Crest) |
|-------|---------------------------|
| Unit No | 3502 – Crest |
| BHK | 1 BHK Growth Home |
| Size | 323 sq.ft. |
| Agreement Value | Rs. 32,99,000 |
| Home Loan Offer Discount | -Rs. 10,000 |
| Early Bird Benefit Discount | -Rs. 27,000 |
| All Inclusive Price | Rs. 35,52,960 |
| Total Discount badge | Rs. 37,000 |
| Confirmation Amount (Pay) | Rs. 27,000 |

Clicking a Sold (red) unit: no action — detail panel does NOT open.

### Customer Portal — KYC

**URL:** `https://uat.xrportal.in/kyc`

| Rule | Value |
|------|-------|
| Maximum Applicants | 4 total (primary + 3 co-applicants) |
| Allowed Relationships | Parents / Spouse / Siblings / Children (blood relatives only) |
| Mandatory Documents (per applicant) | Photo + PAN Card + Aadhaar Front + Aadhaar Back |
| PAN Number Format | ABCDE1234F |
| Aadhaar Number Format | 1234 5678 9012 (12 digits) |

Primary applicant fields are pre-filled. When 4 applicants reached → "Add Applicant" disabled + "Max. 4 Applicants allowed" label shown.

### Payment Gateway (Easebuzz)

**Merchant:** Impactum Lands Private Limited
**Confirmation Amount:** Rs. 27,000
**UAT Test Amount:** Rs. 100 (shown at bottom of Easebuzz popup)
**Link Validity:** ~15 minutes

**Bot detection active on UAT** — automated browsers cannot complete payment. `navigator.webdriver`, CDP fingerprint, and no browser history cause Easebuzz to never render payment method options. Anti-bot mitigations (slowMo, CDP flags, mouse movement) are insufficient. Manual testing required for payment success.

### Milestone Payments

| Column | Description |
|--------|-------------|
| MILESTONE | Payment stage name |
| % DUE | Percentage of total |
| GST | GST amount |
| AMOUNT | Principal |
| TOTAL AMOUNT | Principal + GST |
| TOTAL OUTSTANDING | Amount yet to be paid |
| PAYMENT STATUS | Paid / Pending |
| PAY | Pay button (Pending milestones) |
| TRANSACTION DETAILS | View link (Paid milestones) |

## 4. Features

- Campaign creation with validation (3-minute minimum start buffer)
- Campaign lifecycle management (Stop, Cancel, View)
- Campaign list filtering by Status, Type, Project
- Customer portal login (separate OTP auth)
- Tower/unit browsing with colour-coded availability grid
- Unit selection with pricing detail
- Payment via Easebuzz gateway
- KYC form with multi-applicant support
- Milestone payment schedule view

## 4a. How to Use

### Creating an Allocation Campaign

1. Left sidebar → click **"Allocation"** → `/admin/allocation`
2. Fill in the top form:
   - **Project:** Select "Xanadu Test Project"
   - **Campaign Name:** Enter a unique name (e.g. "Launch Campaign June")
   - **Allocation Type:** Leave as **Static** (default)
   - **Start Time IST:** Set to **at least 3 minutes from now** (recommended: now + 4 min)
   - **End Time IST:** Set to after the Start Time (recommended: Start + 5 min or more)
   - **Description:** Optional notes
3. Click **"Save Campaign"**
4. Toast "Campaign created successfully" → campaign appears in the list below with status **Upcoming**

> Start time **must be ≥ 3 minutes** from creation. Earlier start times show a red error banner.

### Monitoring Active Campaigns

1. Scroll down to the Campaign List table
2. Use Status filter to show only **Active** campaigns
3. Active campaigns (green badge) are live — buyers can select units now

### Stopping a Campaign Early

1. Find the Active campaign in the list
2. Click **"Stop"** in the Actions column
3. Confirmation popup: "Stop Allocation Now?" → click **"Yes, Stop Now"** (red)
4. Campaign moves to **Stopped** status; buyer portal shows "Allocation window is closed"

### Cancelling an Upcoming Campaign (Before It Starts)

1. Find the Upcoming campaign
2. Click **"Cancel"** in the Actions column
3. Confirm → status changes to **Cancelled**

### Viewing Campaign Details

- Click **"View"** on any campaign to see full details

### What Buyers Experience (Customer Portal Side)

During an Active campaign:
1. Buyer logs in to `https://uat.xrportal.in` → sees available unit on their dashboard
2. Clicks **"Proceed to Confirm"** → navigates to unit selection grid
3. Selects an available (white) unit → pricing detail panel opens on right
4. Clicks **Pay** → Easebuzz payment gateway opens
5. After payment → unit is locked as Booked; KYC form becomes available
6. Buyer fills KYC form (up to 4 applicants) → submits

---

## 5. Business Rules

1. Campaign start time must be at least 3 minutes from creation time
2. Only ONE active campaign allowed at a time on UAT
3. Stopped (manual) and Completed (auto) are identical from the customer portal perspective — both show "Allocation window is closed for now."
4. After campaign ends, Available registrations → Waitlisted; already Booked stay Booked
5. Unit selection detail panel does NOT open on clicking a Sold (red) unit
6. KYC allows max 4 applicants; only blood relatives allowed as co-applicants
7. Confirmation Amount = Early Bird Benefit Discount amount (Rs. 27,000 = Rs. 27,000)
8. Payment gateway (Easebuzz) detects automated browser fingerprint — cannot be automated on UAT

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| Config CMS | Registration Status + Unit Status control campaign eligibility and unit availability grid |
| Towers | Active towers (from Config) appear in customer unit selection tower list |
| Offers | Active offers appear as line-item discounts on unit selection detail panel |
| Customers | Customer booking status and Allotted Unit reflected in admin Customers table |
| Payment Transactions | Allocation payment creates a transaction record in Payment Transactions module |

## 7. Domain Red Flags

| Flag | Severity | Impact |
|------|----------|--------|
| Easebuzz bot detection blocks payment automation | HIGH | Payment success tests permanently ENV SKIP on UAT without test-mode payment endpoint |
| No available Sold units for testing | INFO | TC-CST-009 (Sold unit behavior) skipped — no Sold units in UAT state |
| No available Available registration for testing | INFO | TC-CST-013 skipped — no Available registrations outside active campaign window |

## 8. Open Clarifications

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-ALLOC-001 | Easebuzz bot detection blocks automated payment — is there a test-mode or mock payment endpoint for UAT? | Payment flow TCs permanently ENV SKIP without this | ⏳ Open |
| Q-ALLOC-002 | TC-CST-009 skipped — no Sold units on UAT. Can the team seed a Sold unit for testing? | Sold unit TC | ⏳ Open |

## 9. Test Coverage

| Area | TCs | Result |
|------|-----|--------|
| Campaign creation + validation | SETUP-01–03 + TC-ADM-001–004 | ✅ Pass |
| Campaign lifecycle (Stop, Cancel) | TC-ADM-005–007 | ✅ Pass |
| Campaign list + filters | TC-ADM-008–010 | ✅ Pass (some ENV SKIP) |
| Customer login + home dashboard | TC-CST-001–010 | ✅ Pass (some ENV SKIP) |
| Unit selection + pricing detail | TC-CST-011–020 | ✅ Pass (payment ENV SKIP) |
| KYC flow | TC-CST-021–025 | ✅ Pass |
| Post-campaign state | TC-CST-026–030 | ✅ Pass |

**ENV SKIP guards:**

| TC | Reason |
|----|--------|
| TC-CST-009 | No Sold units on UAT |
| TC-CST-013 | No Available registration in UAT state |
| TC-CST-016, TC-CST-028 | Live Easebuzz gateway — bot detection blocks payment |
| TC-ADM-008 | No auto-completed campaign on UAT |
| TC-ADM-010 | No campaigns in specific state on UAT |

**Key technical notes:**
- Date picker: Must click date cell + time scroll (NOT type into input) to enable OK button
- Campaign filter dropdown: Two project selectors on page (top = create form, bottom = filter); always target filter using `.ant-select-selection-placeholder`
- Add Units drawer leak: After paying, drawer stays open; close via `.ant-drawer-close` before counting rows
- 1 Active campaign limit on UAT — TC-ADM-007 reuses TC-ADM-006's Active campaign

---

## 10. Data Model

### AllocationCampaign (allocation_campaigns table)

| Field | Type | Notes |
|-------|------|-------|
| `id` | PK | |
| `campaignName` | STRING | Must be unique per project |
| `projectId` | FK → projects | |
| `allocationType` | ENUM('STATIC','DYNAMIC','PHYSICAL_EVENT') | STATIC = all registrations participate simultaneously; DYNAMIC = round-based; PHYSICAL_EVENT = walk-in site event |
| `startTime` | DATETIME | Campaign open time (IST) |
| `endTime` | DATETIME | Campaign close time (IST) |
| `status` | ENUM('Upcoming','Active','Completed','Stopped','Cancelled','Failed') | |
| `description` | TEXT | Optional notes |
| `createdBy` | FK → users | Admin who created |

### Campaign Type Behaviors

| Type | How Customers Participate |
|------|--------------------------|
| STATIC | All eligible registrations enter simultaneously; unit grid shown immediately when campaign opens |
| DYNAMIC | Round-based; customers assigned to rounds; only their round is shown the unit grid |
| PHYSICAL_EVENT | Walk-in allocation at a physical venue; admin assigns units offline |

### RegistrationUnit Status Flow (during allocation)

```
WAITLIST  (before campaign — not allocated)
  → PREALLOCATED  (during DYNAMIC round — slot reserved)
  → ALLOCATED     (unit assigned, payment pending)
  → WINNER        (payment completed successfully)
  → HOLD          (unit on hold during payment session)
  → REFUND        (unit refunded after booking)
```

`allocationStatus` (buyer-facing):
```
waiting → available (campaign opens, buyer eligible)
  → confirmed  (payment completed)
  → cancelled  (admin cancel)
  → refunded   (refund processed)
  → waiting    (campaign ends without buyer booking)
```

### Python Service Sync

When registration units are cancelled, the backend fires a **fire-and-forget** call to the Python FastAPI service to sync the freed unit IDs:

```js
pythonService.post('/units/status-sync', { reserved: [], available: [unitIds] })
```

Python service manages the real-time Redis cache used by the customer unit selection grid. Failure is logged but does NOT block the admin cancellation operation.

---

## 11. API Reference

### Campaign Routes (`/api/v1/admin/allocation/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/allocation/campaigns` | List campaigns with filters |
| POST | `/api/v1/admin/allocation/campaigns` | Create new campaign |
| GET | `/api/v1/admin/allocation/campaigns/:id` | Campaign detail |
| PUT | `/api/v1/admin/allocation/campaigns/:id/stop` | Stop active campaign |
| PUT | `/api/v1/admin/allocation/campaigns/:id/cancel` | Cancel upcoming campaign |
| GET | `/api/v1/admin/allocation/unit-details` | Dynamic template data |
| POST | `/api/v1/admin/allocation/transaction/check` | Check allocation transaction status by reference |

### Offline Unit Assignment Route

```
PUT /api/v1/admin/registration-units/:registrationUnitId/assign-unit
```
Admin can assign a unit offline (bypassing payment gateway). Requires payment proof file upload (Azure Blob). Sets `allocationPaymentSource = 'admin'`.

### Refund Routes

```
PUT /api/v1/admin/registration-units/:registrationUnitId/refund    (single)
POST /api/v1/admin/registration-units/refund-bulk                  (Excel upload)
GET /api/v1/admin/bulk-refund-sample                               (sample Excel download)
```
