# Admin Portal — Business Requirements Document

**Portal:** Admin Portal
**Project:** XR Portal (HoABL Real Estate Platform)
**URL:** `/admin/*`
**Last Updated:** 2026-05-10 (enriched with step-by-step working, validations, edge cases from TC docs)
**Sprint Reference:** BRD Reverse Engineering Sprint + Sprint 2/3/4 TC validation
**Tags:** #portal/admin #type/brd #status/enriched

---

## Related Notes
- [[Roles-and-Permissions]]
- [[Unit-Status-Flow]]
- [[Allocation-Workflow]]
- [[Payment-Workflow]]
- [[Module - Offers]]
- [[Module - JBP Management]]
- [[Module - Channel Partners]]
- [[Module - Sales Managers]]
- [[Milestone-Payments]]
- [[Module - Config CMS]]
- [[Backend-Functional-BRD]]

---

## 1. Portal Overview

The Admin Portal is the central command and control interface for the XR Portal real estate platform. It is operated by the internal administration team to manage all aspects of the property sale lifecycle — from inventory setup and customer registrations to allocation campaigns, payment tracking, and channel partner management.

The Admin Portal is a dedicated single-page web application accessible at `/admin`. It is separate from the CP (Channel Partner) Portal and the Sales Manager Portal, each of which has its own login page.

---

## 2. User Types

| Role | Role ID | Description |
|------|---------|-------------|
| Admin | 1 | Full access to all admin portal modules |
| Sales Manager Admin | 4 | Admin-level sales manager with elevated privileges |

All other roles (User=2, CP=3, Sales Manager=5) cannot access this portal.

---

## 3. Business Purpose

The Admin Portal serves as the operational backbone for the real estate sales process. Its core purposes are:

- **Inventory Control**: Manage towers, floors, units, and their availability/pricing
- **Customer Management**: View, search, and manage registered buyers
- **Allocation Management**: Run and monitor allocation campaigns (Static, Dynamic, Physical Event types)
- **Revenue Tracking**: Monitor payment transactions and milestone payments
- **Offer Management**: Create and manage discount offers for buyers
- **Partner Management**: Onboard and manage channel partners and sales managers
- **Business Planning**: Review and approve JBP (Joint Business Plan) submissions from channel partners
- **CMS Configuration**: Manage content, forms, and display settings for the buyer and CP portals

---

## 4. Module List

```
Admin Portal
├── 1. Customer Management (Dashboard)
├── 2. Inventory Management (Towers & Units)
├── 3. Allocation Campaign Management
├── 4. Channel Partner Management
├── 5. Sales Manager Management
├── 6. Milestone Payments
├── 7. Payment Transactions
├── 8. Offers Management
├── 9. JBP Management
└── 10. CMS (Content Management System)
```

---

## 5. Module Details

---

### Module 1: Customer Management (Dashboard)

**Purpose:** View all registered customers, search/filter them, and access individual customer details including their registration, unit allocation, KYC, and payment status.

**Screen:** `/admin/customers`

**Key Information Displayed:**
- Customer name, phone number
- Registration number
- Allocated unit details (tower, floor, unit number)
- Apartment type (1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Rise Home / 2 Bed Peak Home)
- Carpet area
- Allocation status (WAITLIST / PREALLOCATED / ALLOCATED / WINNER / HOLD / REFUND)
- KYC completion status
- Payment date
- Car parking count
- Home loan status
- Whether the registration is an additional unit booking

**Actors:** Admin

**Functional Flow:**
1. Admin opens the customers page
2. System loads all registrations for the project (filtered by project ID)
3. Registrations with status REFUND are excluded by default (soft-filtered)
4. Admin can search by customer name, registration number, or stage
5. Admin can view individual customer records
6. System enriches data from Mavis (external ERP) for unit/typology details

**Allocation Status Logic (shown to Admin):**
- If registration unit status is WINNER, HOLD, or REFUND — show that status directly
- If no allocation campaign is running — show WAITLIST
- If campaign is running (STATIC type) and customer is not marked available for allocation — show WAITLIST
- If campaign is DYNAMIC and no active round — show based on actual unit allocation

**Business Rules:**
- Registrations with status=Refund are excluded from default view
- Admin can see all customers across all channel partners and sales managers
- The system pulls carpet area from the typology master, not the unit record directly
- Home loan records with `loanApprovalStatus = admin_rejected` are excluded from the home loan indicator

**Validation Rules:**
- Search is partial match on first name, last name, registration number, and stage fields

---

### Module 2: Inventory Management (Towers & Units)

**Purpose:** Manage the physical inventory of towers and units, including unit statuses, pricing, and visual heatmap views.

**Screens:** `/admin/towers`, Tower Detail View

**Key Data Points:**
- Tower name, tower ID, number of floors
- Unit statuses: AVAILABLE, HOLD, BOOKED, REFUGE, PREBOOKED, PBT, RESERVED
- Unit pricing: Basic price, society charge, clubhouse charge, possession charge, premium charge, infrastructure charge, floor rise, stamp duty, GST, parking charge, early bird benefit, allocation amount
- Unit attributes: Facing direction, band, floor number, unit number, typology

**Actors:** Admin

**Functional Flow:**
1. Admin views all towers for the project
2. Admin selects a tower to drill down into floor/unit view
3. System displays a visual heatmap of units color-coded by status
4. Admin can update unit status, pricing, and other attributes
5. Changes are audit-logged (ADMIN_UNIT_STATUS_UPDATE, ADMIN_UNIT_PRICE_UPDATE)

**Admin Actions Available:**
- Update unit status (e.g., mark as AVAILABLE, HOLD, RESERVED)
- Update unit price
- Assign a unit directly to a customer (ADMIN_ASSIGN_UNIT)
- Cancel a unit (ADMIN_CANCEL_UNIT)
- Swap units between customers (ADMIN_UNIT_SWAP)
- Update tower active/inactive status (ADMIN_TOWER_STATUS_UPDATE)
- Manage parking assignment (ADMIN_UPDATE_PARKING)

**Allocation Amount Calculation:**
- `allocationCalcType` determines whether the allocation amount is a fixed amount or a percentage of the unit's Final Agreement Value (FAV)
- If PERCENT: allocation amount = FAV × allocationPercent / 100
- If AMOUNT: allocation amount is the direct fixed value stored in `allocationAmount`

**Unit Status Definitions:**
| Status | Meaning |
|--------|---------|
| AVAILABLE | Unit is open for selection |
| HOLD | Unit is temporarily reserved (20-minute timer) |
| BOOKED | Unit has a completed booking payment |
| PREBOOKED | Unit is in pre-booking state |
| PBT | Pre-Booking Token state |
| RESERVED | Admin-reserved unit (not for sale) |
| REFUGE | Designated refuge area / not for allocation |

**Business Rules:**
- When a unit is placed on HOLD during an offline payment, the `holdAt` timestamp is recorded
- If 20 minutes elapse from hold time without payment completion, the system releases the hold automatically
- Unit audit logging captures every admin-level change (who, what, when)
- Tower active/inactive status controls whether units in that tower appear during allocation campaigns

---

### Module 1 (Extended): Customer Management — Step-by-Step Working

**User Journey (Admin perspective):**
1. Admin logs in and is redirected to `/admin/customers` (default landing page)
2. Admin sees a table of all registered customers for the active project
3. Admin uses the search bar to find a specific customer by name, registration number, or stage
4. Admin clicks a row to open the customer detail drawer
5. Admin reviews the customer's registration history, allocation status, KYC completion, and payment record

**Validations:**
- Search is a partial match across: first name, last name, registration number, and stage
- Registration with `status = Refund` are excluded from the default view (they exist in DB but are soft-filtered)
- Home loan records with `loanApprovalStatus = admin_rejected` are excluded from the home loan indicator shown to admin

**Edge Cases:**
- A customer with multiple registrations (additional units) appears once per registration, not once per customer
- The `isAdditionalUnit` flag distinguishes primary bookings from additional unit bookings
- Car parking count reflects linked parking units — a customer can have 0, 1, or 2 parking spaces depending on typology and availability
- Carpet area shown is pulled from the typology master record, not the unit record directly — if typology data is missing in Mavis sync, carpet area shows blank

**Dependencies:**
- Mavis ERP (unit/typology data sync)
- LeadSquared CRM (registration activity history)
- Allocation campaign state (determines status logic)

**Expected Behavior:**
- Page loads all registrations on open; does not require a search to show data
- Total count of customers is displayed in the header
- A customer with WINNER allocation status shows green status badge; WAITLIST shows grey
- Admin cannot create new registrations from this page — registration originates from the CP portal or buyer portal

---

### Module 2 (Extended): Inventory Management — Step-by-Step Working

**User Journey:**
1. Admin navigates to `/admin/towers`
2. Admin sees all towers for the project listed with their name and active/inactive status
3. Admin clicks a tower name to drill into the floor-by-floor unit view
4. Admin sees a visual heatmap where each unit is color-coded by current status
5. Admin can click a unit to view its details and available actions
6. Admin can update unit status, pricing, assign units, or cancel units from this view

**Step-by-Step: Changing Unit Status**
1. Admin clicks the unit in the heatmap
2. Unit detail panel opens showing current status, price, and available admin actions
3. Admin selects new status from dropdown (AVAILABLE / HOLD / RESERVED)
4. Admin clicks Save
5. System logs the action as `ADMIN_UNIT_STATUS_UPDATE` in the audit trail
6. WebSocket broadcasts `tower_refresh` message to all connected buyers
7. Heatmap updates in real-time for all active sessions

**Step-by-Step: Assigning a Unit Directly to a Customer (Admin Assign)**
1. Admin selects unit and chooses "Assign to Customer" action
2. Admin searches for and selects the target customer by registration number
3. System validates: unit must be AVAILABLE, customer must have a valid registration
4. Admin confirms the assignment
5. System logs `ADMIN_ASSIGN_UNIT` in audit trail
6. Unit status changes to BOOKED; RegistrationUnit record created with WINNER status
7. Customer is notified via SMS/WhatsApp

**Step-by-Step: Unit Price Update**
1. Admin opens unit detail
2. Admin edits pricing fields (basic price, floor rise, premiums, etc.)
3. Admin saves
4. System logs `ADMIN_UNIT_PRICE_UPDATE`
5. Updated price reflects immediately in customer-facing unit selection panel

**Validations:**
- A unit with status BOOKED cannot be directly reassigned without cancellation first
- Unit swap between two customers requires both registrations to be in WINNER status
- Admin cannot set a unit to AVAILABLE if it is currently in a HOLD state from an active payment session
- Tower active/inactive toggle requires explicit "Update Tower Configuration" button click — toggling without clicking Update does not persist

**Edge Cases:**
- If unit is on HOLD (20-minute timer active) and admin attempts to reassign, the hold must be released first
- Units with status REFUGE cannot be changed to any other status by admin — they are structural (refuge areas in building, not for sale)
- Cancelling a unit (`ADMIN_CANCEL_UNIT`) does not automatically trigger a refund — refund is a separate manual step

**Expected Behavior:**
- Heatmap updates in real-time during active allocation campaigns
- Admin sees ALL towers including inactive ones; buyers see only active towers
- All admin changes are immediately visible to other admin sessions

---

### Module 3: Allocation Campaign Management

**Purpose:** Create and manage allocation campaigns that control when and how customers can select and pay for units.

**Screens:** `/admin/allocation`, `/admin/allocation/campaigns/:campaignId`

**Campaign Types:**
| Type | Description |
|------|-------------|
| STATIC | All eligible customers see and select units simultaneously; no rounds |
| DYNAMIC | Timed rounds where customers are assigned units automatically using round-robin logic |
| PHYSICAL_EVENT | In-person event where sales managers allocate units manually on behalf of customers |

**Campaign Statuses:** NOT_STARTED → RUNNING → STOPPED / COMPLETED / FAILED / CANCELLED

**Actors:** Admin

**Functional Flow:**
1. Admin creates an allocation campaign by specifying:
   - Name
   - Allocation type (STATIC / DYNAMIC / PHYSICAL_EVENT)
   - Start and end times
   - Description
   - For DYNAMIC: round time (minutes per round) and users per unit
2. Admin can start the campaign immediately or schedule it
3. When starting, the system triggers a warmup process (loads data into Redis)
4. Once RUNNING, customers can connect via WebSocket and participate
5. Admin monitors live progress via the campaign detail screen
6. Admin can stop the campaign gracefully (waits for current round) or forcefully

**Campaign Detail Screen:**
- Shows all units assigned to the campaign
- Shows registration-to-unit mapping
- Allows admin to update allocation transaction details (ADMIN_ALLOCATION_TXN_UPDATE)
- Shows refund-eligible registrations

**Step-by-Step: Creating a STATIC Campaign**
1. Admin fills the campaign creation form: Project, Campaign Name, Allocation Type (Static), Start Time, End Time, Description
2. Admin clicks "Save Campaign"
3. System validates: Start Time must be at least 3 minutes from now
4. On success: toast "Campaign created successfully"; campaign appears in list with status Upcoming
5. System schedules a Redis TTL key to trigger warmup 1 minute before start time
6. At warmup time: all unit, tower, registration, and floor data is pre-loaded into Redis
7. At start time: campaign status changes from Upcoming to Active
8. Admin can monitor live progress from campaign detail screen
9. Admin can stop the campaign at any time (click Stop → confirm popup → campaign moves to Stopped)

**Status Transitions (confirmed from TC-ADM-005):**
Status filter options on campaign list: All Status | Active | Upcoming | Completed | Stopped | Cancelled | Failed

| Status | Meaning | Available Actions |
|--------|---------|------------------|
| Upcoming | Created, start time not yet reached | View, Cancel |
| Active | Running — start reached, end not yet | View, Stop |
| Completed | Ended automatically at end time | View only |
| Stopped | Manually stopped before end time | View only |
| Cancelled | Cancelled before start | View only |
| Failed | System error during campaign | View only |

**Validation Rules:**
- Start time must be at least 3 minutes from now — error: "Start time must be at least 3 minutes from now. Please select start and end time again."
- Cannot create a campaign if an Active campaign is already running — error shown in red banner
- Cannot create if an Upcoming campaign already exists — must cancel the existing one first
- All form fields (Project, Campaign Name, Start Time, End Time) are required — inline validation fires on Save

**Stop Confirmation Popup:**
- Title: "Stop Allocation Now?"
- Message: "Campaign will move to Stopped."
- Buttons: "Close" (dismiss) | "Yes, Stop Now" (red — confirms stop)

**Edge Cases:**
- If Stop is clicked and campaign has already auto-completed (end time passed), status will be Completed not Stopped
- Cancelling an Upcoming campaign uses the Cancel button in Actions; the campaign moves to Cancelled status
- A campaign can only be cancelled when in Upcoming status — Active campaigns can only be Stopped
- Pre-warmup failure (Redis error) causes campaign to move to Failed status

**Business Rules:**
- Only NOT_STARTED or STOPPED campaigns can be started
- A STATIC campaign stops immediately when stop is requested
- A DYNAMIC campaign waits for the current round to complete before stopping (unless force=true)
- Campaign warmup pre-loads all unit, tower, registration, and floor data into Redis for real-time performance
- The system uses Redis TTL keys to trigger scheduled campaign starts (pre-warmup runs 1 minute before start)
- Registrations must have `availableForAllocation = true` to participate

---

### Module 3 (Extended): Allocation Campaign — Customer Experience

During an active STATIC campaign, from the customer's perspective:

1. Customer logs into buyer portal at `https://uat.xrportal.in`
2. Home dashboard shows "Proceed to Confirm" button for registrations with Available status
3. Customer clicks Proceed to Confirm → redirected to Allotment page (`/allotted`)
4. Customer clicks "Book Now" for their eligible registration
5. Customer clicks "Select Unit >" to open unit selection screen
6. Customer sees all towers listed in left panel with available unit counts
7. Customer browses tower floors and clicks an AVAILABLE unit (shown as white)
8. Right panel shows unit details: number, typology, carpet area, agreement value, discounts, total price
9. Customer clicks "Add" to confirm unit selection
10. Customer sees the Allotment page with selected unit shown and T&C checkbox
11. T&C checkbox must be ticked before Pay button becomes enabled
12. Customer clicks "Confirmation Amount Pay Rs. XX,XXX" — Easebuzz/Razorpay gateway opens
13. Customer completes payment within 20-minute hold window
14. On success: unit status changes to BOOKED; customer sees congratulations screen
15. Customer proceeds to KYC completion

**Unit Selection Color Legend (confirmed from TC-CST-006):**
| Color | Status Meaning |
|-------|---------------|
| White | AVAILABLE — can be selected |
| Green | Currently selected by this customer |
| Red | BOOKED/Sold — cannot be selected |
| Orange | Another customer is in payment process (paying now) |
| Grey | REFUGE — not for sale |
| Blue | RESERVED (admin hold) |

---

### Module 4: Channel Partner Management

**Purpose:** Manage channel partners (CPs) who bring in buyer leads and earn commissions on bookings.

**Screen:** `/admin/channel-partners`

**Key Data Points:**
- CP name, RERA registration number, XR code
- Organization name, address, city, zone, region
- PAN number
- CP type: Lead CP (Master) or Member CP
- Master CP linkage (for Member CPs)
- Sales manager assignment
- Registration completion status
- Active/inactive status
- Broker referral status (pending/approved/rejected)

**Actors:** Admin

**Functional Flow:**
1. Admin views all registered channel partners
2. Admin can register a new CP by filling in details (RERA number, PAN, organization, address)
3. Admin can view CP details including their registered leads
4. Admin can map a Member CP to a Master CP (MapMasterModal)
5. Admin can edit CP details and update status

**CP Hierarchy:**
- Lead CP (isLeadCp = true): A master CP who can have member CPs under them
- Member CP: A CP who is associated with a master CP (leadCpId links to master)
- smUserId: Each CP can be assigned to a specific sales manager

**Step-by-Step: Registering a New Channel Partner**
1. Admin navigates to `/admin/channel-partners`
2. Admin clicks the button to open the CP registration form
3. Admin enters: RERA number, PAN, organization name, address, city, zone, region, phone, email
4. Admin assigns a sales manager to the CP (smUserId)
5. Admin selects CP type: Lead CP or Member CP
6. For Member CP: Admin selects the Master CP (uses MapMasterModal with Master HV Code dropdown)
7. Admin submits the form
8. System creates the CP record and generates a unique HV code (hvCode) for the CP
9. CP receives login credentials and can access the CP portal

**Step-by-Step: Mapping a Member CP to a Master CP**
1. Admin selects one or more Member CP rows in the table (checkboxes)
2. "Map Master CP" button becomes enabled in the header
3. Admin clicks "Map Master CP" — MapMasterModal opens
4. Admin selects the Master HV Code from dropdown
5. Admin submits
6. System updates the `leadCpId` and `masterHvCode` on the selected Member CPs

**Table Structure (confirmed from TC-CP tests):**
Table has 13 columns: Owner Name | Firm Name | HV Code | Master HV Code | Business Region | Pincode | Phone | CP Type | SM Name | SM Email ID | SM Mobile Number | KYC Status | Actions

Phone number search is the primary search mechanism (server-side filter). Column-level filters available for: Owner Name, Firm Name, HV Code, Pincode, Master HV Code, Business Region, CP Type.

CP Type values: Master CP, Member CP

**Validations:**
- RERA number format must be valid for registration
- PAN number must follow standard Indian PAN format
- Phone number must be valid (10-digit Indian format)
- A CP cannot be their own Master CP

**Edge Cases:**
- If a CP's `brokerReferralStatus = rejected`, their referral links stop crediting them for new registrations
- If CP has not completed registration (isCpRegistrationCompleted = false), they cannot log in to the CP portal
- A CP who is a Master CP cannot be mapped as a Member under another CP simultaneously

**Business Rules:**
- A CP's XR code (hvCode) is used as the referral identifier in customer registrations
- The `brokerReferralStatus` controls whether a CP's referral is active (pending / approved / rejected)
- CPs must complete registration (isCpRegistrationCompleted) before they can operate
- When a customer registers through a CP's link, the walkInSourceXrCode is set to the CP's XR code

---

### Module 5: Sales Manager Management

**Purpose:** Manage the sales team who handle customer callback requests and physical allocation events.

**Screen:** `/admin/sales-managers`

**Key Data Points:**
- Sales manager name, email, phone
- Role (sales_manager_admin = 4 or sales_manager = 5)
- Active/inactive status
- Availability for callback assignment
- Round-robin assignment timestamp (lastRequestAssignedAt)

**Actors:** Admin

**Functional Flow:**
1. Admin views all sales managers
2. Admin creates a new sales manager (SalesManagerForm)
3. Admin can edit/deactivate a sales manager
4. Admin can configure settings per sales manager (SettingsDrawer)

**Two Management Surfaces:**
Surface 1 — `/admin/sales-managers`: Standalone list page showing all SMs with search by name or phone, column filters, add/edit modal per SM, and a Settings drawer for PII/pricing masking configuration.
Surface 2 — `/admin/cms` Section 7 (Sales Managers bulk upload): Bulk create/update SMs via Excel upload.

**Step-by-Step: Adding a Sales Manager via Bulk Upload (confirmed from TC_CFG_041)**
1. Admin navigates to `/admin/cms` → scrolls to "Sales Managers" section
2. Admin clicks "Sample File Download" to get the Excel template
3. Admin fills the template with one row per SM: Role | First Name | Last Name | Email | Phone | IS_AVAILABLE | IS_ACTIVE
4. Role value must be `"Sales Manager"` (text)
5. IS_AVAILABLE: `1` = assignable for callbacks, `0` = not assignable
6. IS_ACTIVE: `1` = active, `0` = inactive (deactivated)
7. Phone must be exactly 10 digits — error if not: "Invalid phone number format. Must be 10 digits"
8. Admin uploads the file (.xlsx format) and clicks Submit
9. System processes each row and returns a Final Excel download with result per row
10. Result column shows: "Created" for new SM, "Updated" for existing SM (matched by phone), "Error" with message for failures

**Merge Key (confirmed from TC_CFG_048):** Phone number is the merge key. If a row's phone matches an existing SM, the system updates that record. If not matched, a new SM is created. Email is NOT the merge key — duplicate emails create new records if phone differs.

**Step-by-Step: Configuring SM Settings (PII Masking)**
1. Admin navigates to `/admin/sales-managers`
2. Admin finds the target SM in the list
3. Admin opens the Settings drawer for that SM
4. Admin configures masking toggles (whether SM can see customer phone numbers, pricing, etc.)
5. Admin saves settings

**Note (Q-SM-002 still open):** Whether settings auto-save on toggle or require an explicit Save button click has not been confirmed by automated tests. Check the Settings drawer UI directly.

**Business Rules:**
- Sales managers are assigned callback requests in round-robin order based on `lastRequestAssignedAt`
- `isAvailable` flag controls whether the sales manager receives new ticket assignments
- Sales Manager Admin (role 4) has more privileges than Sales Manager (role 5)

---

### Module 6: Milestone Payments

**Purpose:** Track and manage construction-linked milestone payments due from customers after unit allocation.

**Screen:** `/admin/milestone`

**Key Data Points:**
- Milestone key (registration, unit allocation, home confirmation, TDS, stamp duty/registration)
- Total amount due, amount paid, balance
- GST paid status and GST amount
- Parking amount, home loan amount, early bird discount
- Payment status: pending / partial / paid
- Payment verification status: VERIFICATION / PAID

**Payment Types:**
| Type ID | Name |
|---------|------|
| 1 | FULL_PRINCIPAL |
| 2 | HALF_PRINCIPAL |
| 3 | GST_ONLY |
| 4 | FULL_PRINCIPAL_GST |
| 5 | HALF_PRINCIPAL_GST |

**Milestone Keys:**
| Key | Milestone |
|-----|---------|
| ml-or-ual | Registration AND Unit Allocation (combined) |
| ml-or | Registration only |
| ml-ual | Unit Allocation only |
| ml-hcf | Home Confirmation (first demand payment) |
| ml-tds | TDS |
| ml-rou | Stamp Duty and Registration |

**Actors:** Admin

**Functional Flow:**
1. Admin views all pending/partial milestone payments
2. Admin can initiate a payment on behalf of a customer (PayDrawer)
3. Admin can view details of a specific milestone payment (ViewDetails)
4. Admin can configure a new milestone via MilestoneDrawer
5. System tracks payment reconciliation through scheduled cron jobs

**Step-by-Step: Viewing and Managing Milestone Payments**
1. Admin navigates to `/admin/milestone`
2. Page displays all registrations with pending or partial milestone payments
3. Admin can filter by milestone key, payment status, or search by customer name/registration number
4. Admin clicks on a milestone row to open the detail view (ViewDetails)
5. Admin can see: total amount due, amount already paid, outstanding balance, GST status
6. To make a payment on behalf of a customer: Admin clicks "Pay" to open PayDrawer
7. Admin selects payment type (FULL_PRINCIPAL, HALF_PRINCIPAL, GST_ONLY, etc.)
8. Admin selects payment mode (Online or Offline)
9. For Offline: Admin enters payment reference and uploads proof document
10. Admin submits — payment record created, milestone status updated

**Payment Types (confirmed — 5 types):**

| Type ID | Name | Description |
|---------|------|-------------|
| 1 | FULL_PRINCIPAL | Full principal amount only (no GST) |
| 2 | HALF_PRINCIPAL | Half the principal amount |
| 3 | GST_ONLY | GST component only |
| 4 | FULL_PRINCIPAL_GST | Full principal + GST |
| 5 | HALF_PRINCIPAL_GST | Half principal + GST |

**Customer Payment Schedule (from buyer portal — confirmed TC-CST-025):**
Payment Schedule page shows columns: MILESTONE | % DUE | GST | AMOUNT | TOTAL AMOUNT | TOTAL OUTSTANDING | PAYMENT STATUS | PAY | TRANSACTION DETAILS

Status values: Pending | Paid | Partial

**Validations:**
- A milestone payment cannot be made if the registration's KYC is incomplete (KYC must be submitted before payment schedule is generated)
- Offline payment requires proof document upload before submission
- Partial payment reduces the outstanding balance but does not change status to Paid until fully settled

**Edge Cases:**
- If a customer makes a partial payment and then the agreement value changes (due to admin price update), the outstanding balance reflects the new agreement value minus already paid amount
- Registration milestone (ml-or-ual) is a combined milestone — if registration and allocation happen simultaneously, a single combined payment is collected; if split, two separate milestones exist

**Business Rules:**
- Due amount type is determined by the milestone key
- Registration milestones (ml-or, ml-ual) → BOOKING_AMOUNT
- Home Confirmation (ml-hcf) → FIRST_DEMAND_PAYMENT
- Stamp Duty/Registration (ml-rou) → SDR (Stamp Duty and Registration)
- First disbursement (ml-otdb) → FIRST_DISBURSEMENT
- All others → PERCENT of agreement value

---

### Module 7: Payment Transactions

**Purpose:** View, search, and reconcile all payment transactions in the system.

**Screen:** `/admin/payment-transactions`

**Key Data Points:**
- Reference number (unique per transaction)
- Gateway order ID (Razorpay/Easebuzz specific)
- Transaction ID (returned by payment gateway after completion)
- Transaction type: 1=Registration, 2=Unit Allocation
- Amount, currency (INR)
- Payment source: user (online) or admin (offline)
- Payment method: Credit Card, Debit Card, UPI, Net Banking, Mobile Wallet, EMI
- Status: initiated / pending / completed / failed / cancelled / dropped / bounced / refunded
- Gateway: easebuzz / razorpay
- Whether offline (admin-entered)
- Customer name, email, phone
- Created by (admin ID if admin-initiated)

**Actors:** Admin

**Functional Flow:**
1. Admin views paginated list of all transactions
2. Admin can filter by status, date range, payment method, gateway
3. Admin can search by reference number, customer name, or registration number
4. Admin can update transaction details if needed (ADMIN_ALLOCATION_TXN_UPDATE)
5. System includes payment gateway configuration management (PaymentGatewaySettingsDrawer)

**Payment Gateways Supported:**
- Easebuzz (default)
- Razorpay

**Step-by-Step: Viewing and Filtering Transactions**
1. Admin navigates to `/admin/payment-transactions`
2. Page header shows total count: "Total 10226 Payment Transactions" (live, updates with filters)
3. Admin applies filters: date range, Source (Online Easebuzz / Online Razorpay / Offline), Status (completed/cancelled/initiated)
4. Admin uses search box to find by customer name, phone, or registration number
5. Admin clicks Refresh to reload latest data
6. Admin can export the filtered or full transaction list (Q-TXN-001: format and scope unconfirmed)
7. Transaction Detail view shows "Coming soon" — not yet implemented (Q-TXN-007)

**Payment Gateway Configuration:**
1. Admin clicks the Settings button (gear icon) in the page header
2. PaymentGatewaySettingsDrawer opens
3. Admin can enable or disable Easebuzz and/or Razorpay gateways
4. Changes take effect system-wide immediately — affects all new payment sessions

**Critical Open Questions (block TC execution):**
- Q-TXN-004: If a gateway is disabled while a customer has an open payment session, are pending orders invalidated?
- Q-TXN-005: Is there a guard preventing both Easebuzz and Razorpay from being disabled simultaneously?

**Transaction Table Columns (confirmed from Module - Payment Transactions.md):**
Sr. No. | Registration No. | Transaction ID | Source | Status | (additional columns)

Status values observed: completed | cancelled | initiated

Source values: Online easebuzz | Online razorpay | Offline

**Validations:**
- Offline payment records require admin to upload proof before the transaction is recorded as complete
- Each transaction has a globally unique `referenceNo` — duplicates are not allowed
- GST amounts are tracked as separate flag (`isGst`) — not added to the same transaction record

**Business Rules:**
- Each transaction has a unique `referenceNo`
- Overpaid amounts are tracked separately (`overpaidAmount`)
- Offline payments require an admin to upload proof (paymentProof field)
- isAdditionalUnit flag indicates if this transaction relates to an additional unit booking (beyond the customer's primary unit)
- GST transactions are tracked separately (isGst flag)

---

### Module 8: Offers Management

**Purpose:** Create and manage time-bound discount offers applicable to customers during the booking process.

**Screen:** `/admin/offers`

**Key Data Points:**
- Offer name, description
- Offer code (HOME_LOAN, VC_REQUEST) — system-triggered offers
- Offer type: AMOUNT (fixed rupee discount) or PERCENTAGE (% of unit value)
- Amount or percentage value
- Start date, end date
- Active/inactive status
- Linked typology (optional — offer can be specific to a unit type)

**Actors:** Admin

**Functional Flow:**
1. Admin creates a new offer (OfferDrawer)
2. Admin sets offer validity period and type
3. Offer is optionally linked to a specific unit typology
4. Offers are displayed in the OffersTable
5. Admin can edit or deactivate existing offers
6. When a customer qualifies for an offer, it is linked via RegistrationUnitOffer

**Special Offer Codes:**
- HOME_LOAN: Automatically applied when a customer completes the home loan process
- VC_REQUEST: Applied when a customer completes a video call (VC) with a sales manager

**Step-by-Step: Creating a New Offer**
1. Admin navigates to `/admin/offers`
2. Admin sees Offers Management page with list of all existing offers (active and inactive)
3. Admin clicks "Add New Offer" button — OfferDrawer opens
4. Admin enters: Offer Name, Description (optional), Offer Type (AMOUNT or PERCENTAGE), Value, Start Date, End Date
5. Admin optionally links the offer to a specific typology (1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Peak Home / 2 Bed Rise Home)
6. Admin submits — offer appears in table
7. Offer is immediately active if today's date is within the start-end range

**Step-by-Step: Editing an Existing Offer**
1. Admin finds the offer in the table
2. Admin clicks the Edit button (pencil icon) in the Action column
3. OfferDrawer opens pre-filled with current values
4. Admin modifies fields and submits
5. Changes take effect immediately

**Step-by-Step: Toggling Offer Active/Inactive**
1. Admin finds the offer row in the table
2. Admin clicks the toggle switch in the Action column
3. Offer immediately activates or deactivates
4. Deactivating an offer removes it from new customer discount calculations (active selections may be affected — Q-OFFERS-003 open)

**Step-by-Step: Deleting an Offer**
1. Admin clicks the Delete button (trash icon) for the offer
2. Confirmation dialog: "Are you sure you want to delete this offer?" with "Yes, delete" button
3. Admin confirms — offer is soft-deleted (removed from display but retained in DB)

**Table Structure (confirmed from Module - Offers.md):**
Sr.No | Offer Name | Description | Amount | Percentage | Start Date | End Date | Created By | Action (Toggle + Edit + Delete)

Amount column shows "₹ X,XX,XXX" format. Percentage column shows "-" when offer is Amount Based type.

**Special System Offers:**
- `HOME_LOAN` code: Automatically applied when customer completes the home loan eligibility flow. Admin does not manually assign this.
- `VC_REQUEST` code: Applied after a customer completes a video call with a sales manager and SM records a qualifying outcome.

**Validations (confirmed from TC_OFFERS tests):**
- Offer name is free text up to 100 characters — not enforced as unique (multiple "VC request" rows confirmed on UAT — Q-OFFERS-002 open)
- Description is optional, up to 500 characters
- AMOUNT type: `amount` field is required; `percentage` field is hidden
- PERCENTAGE type: `percentage` field is required; `amount` field is hidden
- Start Date and End Date are both required
- Linked typology is optional — if not specified, offer applies to all typologies

**Edge Cases:**
- An offer whose end date has passed is still visible in the admin table but cannot be applied to new customers
- Deleting an offer that is currently applied to a WINNER customer's RegistrationUnitOffer record — behavior is determined by soft delete (existing customer record retains the offer reference, future customers cannot receive it)
- Multiple offers can be active simultaneously — all applicable offers stack as line-item discounts on the cost sheet

**Business Rules:**
- An offer can be either AMOUNT or PERCENTAGE type — not both simultaneously
- AMOUNT offers store the rupee value in `amount` (percentage is null)
- PERCENTAGE offers store the percentage in `percentage` (amount is null)
- Expired offers (endDate < today) remain in the system but cannot be newly applied
- Soft delete is used — offers are not permanently removed

---

### Module 9: JBP Management

**Purpose:** Manage the Joint Business Plan cycle where channel partners submit their quarterly/periodic business plans for admin review and approval.

**Screen:** `/admin/jbp-management`

**JBP Cycle Statuses:** OPEN, CLOSED

**JBP Submission Fields:**
- Manpower count
- Investment range
- Inserts required (marketing collateral)
- Standees required
- Kiosk required
- Telecallers required
- SMS blast count
- WhatsApp blast count
- Growth Hub participation (yes/no)
- Registration commitment (number of registrations committed)
- Brokerage amount
- Net booking commitment
- Activities (JSON: marketing activities planned)
- Digital channels (JSON: digital marketing channels)

**JBP Edit Request Statuses:** Implicit (admin can review and respond to edit requests)

**Actors:** Admin (reviews), CP (submits — see CP Portal BRD)

**Functional Flow:**
1. Admin creates a JBP cycle with a name, start date, end date, and status
2. The cycle is published (OPEN status) and visible to CPs
3. CPs submit their business plans within the cycle period
4. Admin views all submissions in the SubmissionsPanel
5. Admin reviews individual submissions (ViewSubmissionModal)
6. Admin reviews and approves/rejects edit requests (ReviewEditRequestModal)
7. Admin can close a cycle (status changes to CLOSED)

**Step-by-Step: Admin Creating a JBP Cycle**
1. Admin navigates to `/admin/jbp-management`
2. Default tab is "Cycle Management"
3. If an existing OPEN cycle is blocking creation, admin clicks "Close Cycle" → confirms in popup → toast "Cycle closed successfully"
4. Admin clicks "+ Create Cycle"
5. Admin fills: Cycle Name, Start Date, End Date
6. Admin clicks "Create Cycle"
7. On success: toast "Cycle created successfully"; new cycle appears at top of table with Status = OPEN
8. An "Active Cycle Detected" popup may appear if another OPEN cycle already exists — admin can confirm to proceed anyway

**JBP Table Columns (confirmed from TC-JBP-001):**
Cycle Name | Start Date | End Date | Status | Action

Status values: OPEN | CLOSED
Action values: "Close Cycle" (when OPEN) | "Closed" label (when CLOSED)

**Tabs (confirmed from TC-JBP-001):**
Three tabs: Cycle Management (default, underlined) | Submissions | Edit Requests
Content of Submissions and Edit Requests tabs not yet tested — Q-JBP-001 partially resolved.

**Date Range Filter:**
Two date picker inputs (Start Date, End Date) that filter the cycle table. Clearing the filter (× button) restores all rows.

**Step-by-Step: Admin Reviewing a JBP Submission (from Portal BRD source)**
1. Admin clicks the "Submissions" tab
2. Admin sees all CP submissions for all cycles
3. Admin clicks a submission to open ViewSubmissionModal
4. Admin reviews the submitted business plan fields
5. Admin can see edit requests in the "Edit Requests" tab and approve/reject via ReviewEditRequestModal

**JBP Form Fields Submitted by CP (14 fields — confirmed from TC-JBP-004):**
1. Brokerage to be Earned (dropdown: 10,00,000 / 25,00,000 / 50,00,000 / 75,00,000 / 1,00,00,000+)
2. Net Booking Commitment (dropdown)
3. Manpower to deploy (number + slider, default 1)
4. List of activities (checkboxes: Tele-calling, WhatsApp Blast, Email Blast, SMS Blast, Personal Connect Calling, Digital, Portal Listing, Expo, Society Activity, Corporate Activity, Newspaper Insert, Club Activities, Mall Activity, Association Activity, Others)
5. Go live on digital (checkboxes: Google, Meta, Webpage, Portal listing, Others — Google selection adds Google Budget input)
6. Total investment (radio: Upto 1 lakhs / 1 to 3 lakhs / 3 to 5 lakhs / 5 to 7 lakhs / 7+ lakhs)
7. Inserts Required (Yes/No radio, default No)
8. Standees Required (Yes/No radio, default No)
9. Kiosk Required (Yes/No radio, default No)
10. Tele Callers Required (Yes/No radio, default No)
11. SMS Blast (Yes/No radio, default No)
12. WhatsApp Blast (Yes/No radio, default No)
13. Growth Hub (Yes/No radio, default No)
14. Registration Commitment — Count (number field)

**Business Rules:**
- Each CP can have one ACTIVE submission per cycle (version tracking for edits)
- Expired submissions are marked EXPIRED when the cycle closes
- JBP cycles are per-project scoped

---

### Module 10: CMS (Content Management System)

**Purpose:** Configure dynamic content, form fields, project information, and display settings that control what buyers and CPs see in their portals.

**Screen:** `/admin/cms`

**CMS Sections (from Strapi integration):**
- Band configuration (pricing bands for units)
- Registration form field configuration (default form fields)
- Form definitions (buyer registration, KYC forms)
- General project settings
- Project-level configuration
- Steps master (multi-step flow definitions)
- Project content (about us, amenities, gallery, documents, videos, key points)
- Allocation page configuration (hero slides, header messages)

**Actors:** Admin

**Functional Flow:**
1. Admin navigates to CMS
2. Admin selects a content section to configure
3. Admin edits content through structured forms
4. Changes are saved to Strapi CMS
5. Buyer/CP portals reflect changes in real time

**Step-by-Step: Admin Configuring Tower Active/Inactive Status (confirmed from TC_CFG_001-006)**
1. Admin navigates to `/admin/cms`
2. Admin scrolls to "Tower Configuration" section
3. Page displays all towers with a toggle switch (green = Active, grey = Inactive)
4. Admin clicks a toggle to change a tower's state
5. Toggle state changes visually but is NOT saved yet
6. Admin clicks "Update Tower Configuration" button to persist the change
7. Success toast: "Tower Status Updated Successfully"
8. If admin navigates away without clicking Update, the toggle reverts to its original state (confirmed by TC_CFG_004)

**Step-by-Step: Bulk Registration Status Update via CSV**
1. Admin navigates to `/admin/cms` → Registration Status section
2. Admin clicks "Sample File Download" to get the template
3. Template has 2 columns: Registration Number | Allocation Status
4. Valid Allocation Status values: `Allow` or `Forbid` (NOT case-sensitive — confirmed from TC-2.1/TC-2.5)
5. Admin fills the CSV with registration numbers and desired status
6. Admin clicks "Upload File" and selects the prepared file (.xlsx or .csv only)
7. Admin clicks Submit
8. Success toast: "File Uploaded Successfully!"
9. Admin clicks "Final Excel Download" to get row-by-row results
10. Results column shows: success or "Registration not found or not eligible" (for invalid reg numbers) or "Only Allow or Forbid allowed" (for invalid status values)
11. NOTE: Upload is BLOCKED if an active allocation campaign is running — toast shows campaign message

**Step-by-Step: Bulk Unit Status Update via CSV**
1. Admin navigates to `/admin/cms` → Unit Status section
2. Admin clicks "Sample File Download"
3. Template has 7 columns: Tower Name | Typology Id | Typology Name | Unit Id | Unit No | Status | Update
4. Valid Status values: `AVAILABLE` or `RESERVED` only (confirmed from TC-3.1/TC-3.2/TC-3.6)
5. Update column: `1` = process this row, `0` = skip this row
6. Admin fills the CSV and uploads
7. Success: Final Excel shows "Updated RESERVED → AVAILABLE" or "Updated AVAILABLE → RESERVED"
8. Rows with Update=0 are skipped — toast: "No rows marked for update"
9. Invalid status (e.g., BLOCKED) → toast: "No rows marked for update" (row rejected silently)

**Step-by-Step: Max Preferences Per Unit Configuration (confirmed from TC_CFG_050-053)**
1. Admin navigates to `/admin/cms` → Max Preferences section
2. Dropdown shows current value (1-9 options available)
3. Admin selects desired value from dropdown
4. Admin clicks Update
5. Success toast: "Max preferences per unit updated successfully"
6. Value persists after page refresh

**Step-by-Step: Bulk Booking Cancellation**
1. Admin navigates to `/admin/cms` → Bulk Booking Cancellation section
2. Admin downloads sample file — contains 1 column: `Registration Number` (confirmed from TC_CFG_035)
3. Admin adds registration-unit numbers to cancel (format: GHNG-XXXXXXXXX-Z suffix for unit)
4. Admin uploads the file and clicks Submit
5. Confirmation modal appears: admin must tick confirmation checkboxes and click Submit
6. Toast indicates success or "No valid units available for cancellation" if registration not eligible

**Step-by-Step: Bulk Registration Cancellation**
1. Admin navigates to `/admin/cms` → Bulk Registration Cancellation section
2. Admin downloads sample file — contains 2 columns: `Registration Number` | `Update` (1/0) (confirmed from TC_CFG_038)
3. Admin fills file: Update=1 to cancel, Update=0 to skip
4. Admin uploads and submits
5. Confirmation modal: "Confirm Refund" dialog appears (admin selects "Cancel Registration")
6. Final Excel shows: Success | Skipped | Already refunded | Not found

**Customer Actions Card — Additional Registrations**
Admin can enable/disable additional unit registrations for customers and configure limits per typology:
- Toggle Active/Inactive to enable/disable Add Units feature
- Dropdowns for max units per typology: 1 Bed Growth Home, 2 Bed Growth Home, 2 Bed Rise Home

**File Upload Validation Rules (confirmed across all CMS upload TCs):**
- Accepted formats: `.xlsx` and `.csv` only — error: "You can only upload Excel (.xlsx) or CSV (.csv) files!" (shown immediately on selection)
- Empty file (headers only): error toast "No data found in file"
- Upload blocked during active campaign (for Registration Status section): toast includes "campaign" keyword

**Business Rules:**
- CMS content is managed in Strapi, a headless CMS system
- The backend fetches CMS content via Strapi API and serves it to portals
- Project configuration in CMS controls allocation page behavior (hero slides, messaging)
- Band configuration controls which pricing band a unit belongs to (used in DYNAMIC allocation round-robin)

---

## 6. Navigation Structure

```
/admin (redirects to /admin/customers)
├── /admin/customers          → Customer Management
├── /admin/towers             → Inventory Management
├── /admin/allocation         → Allocation Campaign List
│   └── /admin/allocation/campaigns/:id → Campaign Detail
├── /admin/channel-partners   → CP Management
├── /admin/sales-managers     → Sales Manager Management
├── /admin/milestone          → Milestone Payment Tracking
├── /admin/payment-transactions → All Transactions
├── /admin/offers             → Offer Management
├── /admin/jbp-management     → JBP Cycle Management
└── /admin/cms                → Content Management
```

---

## 7. Authentication

- Admin portal has a dedicated login page at `/admin` (public)
- Authentication uses mobile OTP (no password for buyers, but admin uses email/password login)
- JWT token is issued on successful login and stored in local storage
- All admin routes are protected by RequireAuth component (role check)
- Role ID 1 (admin) and Role ID 4 (sales_manager_admin) can access admin routes

---

## 8. Audit Trail

All significant admin actions are recorded in the audit log system. Actions tracked:

| Action Code | Description |
|-------------|-------------|
| ADMIN_UNIT_SWAP | Unit swap between two customers |
| ADMIN_ALLOCATION_TXN_UPDATE | Update to allocation transaction |
| ADMIN_ALLOCATION_CAMPAIGN_UPDATE | Change to campaign settings |
| ADMIN_REGISTRATION_STATUS_UPDATE | Change to registration status |
| ADMIN_UNIT_STATUS_UPDATE | Change to unit availability/status |
| ADMIN_UNIT_PRICE_UPDATE | Change to unit pricing |
| ADMIN_ASSIGN_UNIT | Direct admin assignment of a unit |
| ADMIN_REFUND_REGISTRATION_UNIT | Refund of a single unit |
| ADMIN_BULK_REFUND_REGISTRATION_UNIT | Bulk refund operation |
| ADMIN_UPDATE_PARKING | Parking assignment update |
| ADMIN_CANCEL_UNIT | Unit cancellation |
| ADMIN_TOWER_STATUS_UPDATE | Tower active/inactive change |

---

## 9. Integration Points

| Integration | Purpose |
|-------------|---------|
| LeadSquared (LSQ) | CRM sync — customer lead updates, booking activities |
| Mavis | ERP system — unit master data, booking creation |
| Easebuzz | Payment gateway (default) |
| Razorpay | Payment gateway (alternative) |
| Azure Blob Storage | Document/image storage |
| Python Allocation Service | Payment status sync after allocation |
| WebSocket Server | Real-time unit status broadcast to buyers |
| Strapi CMS | Content management |
| Kaleyra | SMS and WhatsApp notifications |

---

## 10. Error Handling Behavior

- Invalid routes redirect to `/admin/customers`
- Unauthorized access shows AccessRestricted component
- API errors display toast notifications via the Notification helper
- Rate limiting is enforced by middleware (prevents abuse)
- Token expiry triggers redirect to admin login

---

## 11. Real-time Behavior

The Admin Portal connects to the WebSocket server during allocation campaigns:
- Admin users (role_id=1) receive live unit status updates regardless of campaign type or status
- Admin receives `tower_refresh` messages when units are booked/released
- Admin sees live unit heatmap updates during active allocation events
- Admin receives all towers data including inactive towers (buyers only see active towers)
