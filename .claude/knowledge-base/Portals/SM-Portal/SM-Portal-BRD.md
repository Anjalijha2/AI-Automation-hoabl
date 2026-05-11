# Sales Manager Portal — Business Requirements Document

**Portal:** Sales Manager Portal
**Project:** XR Portal (HoABL Real Estate Platform)
**URL:** `/sales-manager/*`
**Last Updated:** 2026-05-10 (enriched with step-by-step callback and physical allocation flows)
**Sprint Reference:** BRD Reverse Engineering Sprint
**Tags:** #portal/sales-manager #type/brd #status/enriched

---

## Related Notes
- [[Roles-and-Permissions]]
- [[Callback-Request-Workflow]]
- [[Allocation-Workflow]]
- [[KYC-Workflow]]
- [[Admin-Portal-BRD]]

---

## 1. Portal Overview

The Sales Manager Portal is a dedicated interface for the sales team to manage customer callback requests, view inventory, and conduct physical allocation events. It is a mobile-optimized, lightweight portal designed for field use by sales staff at site offices and events.

Unlike the Admin Portal, the Sales Manager Portal is narrowly focused on sales-side operations:
- Managing incoming customer callback/VC requests
- Conducting in-person unit allocation on behalf of customers

---

## 2. User Types

| Role | Role ID | Access Level |
|------|---------|-------------|
| Sales Manager | 5 | Standard access to callbacks and physical allocation |
| Sales Manager Admin | 4 | Same access + some elevated permissions |

Sales Managers log in through `/sales-manager` (a separate login page from the admin and CP portals).

---

## 3. Business Purpose

The Sales Manager Portal exists to:
1. Give the sales team a dedicated workspace for managing customer engagement (calls, video calls)
2. Enable site-level physical allocation events where a sales manager selects a unit on behalf of a walk-in customer
3. Allow sales managers to view the inventory heatmap so they can understand availability when speaking with customers

---

## 4. Module List

```
Sales Manager Portal
├── 1. Callback Requests Management
├── 2. Tower & Unit Heatmap View
└── 3. Physical Allocation (In-Person Allocation Event)
    ├── 3a. Customer Search
    ├── 3b. Unit Allocation
    └── 3c. KYC Completion
```

---

## 5. Module Details

---

### Module 1: Callback Requests Management

**Purpose:** View, manage, and action customer callback and video call requests.

**Screen:** `/sales-manager/callback-requests` (default landing page)

**Key Information:**
- Customer name, phone number
- Requested date/time for the call
- Current status of the request
- Assigned sales manager
- Meeting link (for video calls via Microsoft Teams)
- VC outcome logged after the call
- Feedback submitted by both SM and buyer

**Callback Request Statuses:**
| Status | Description |
|--------|-------------|
| REQUESTED | Customer has submitted a callback request |
| SCHEDULED | Sales manager has confirmed a time slot |
| RESCHEDULED | Time slot was changed after initial scheduling |
| CONFIRMED | Both parties have confirmed the meeting |
| COMPLETED | The call/meeting has taken place |

**VC Outcome Labels (SM records after the call):**
| Code | Label |
|------|-------|
| VC_DONE_PREFERENCE | VC Done with Preference (customer showed unit interest) |
| VC_DONE_NO_PREFERENCE | VC Done, No Preference |
| FUTURE_SCHEDULED | Future meeting scheduled |
| FUTURE_RESCHEDULED | Future meeting rescheduled |
| MISSED_SCHEDULED_NC | Missed Scheduled (No Connect) |
| NOT_INTERESTED_LOST | Not Interested, Lead Lost |
| NEVER_CONNECTED | Never Connected |
| TL_LOST | Team Lead Lost |
| VC_2_DONE | Second VC completed |
| CP_TO_DRIVE_PREFERENCE | CP will drive the preference selection |

**Actors:** Sales Manager, Sales Manager Admin

**Functional Flow:**
1. SM logs in and lands on Callback Requests table
2. SM views incoming requests assigned to them (or all requests for SM Admin)
3. SM selects a request and opens the detail drawer
4. SM schedules a meeting (ScheduleMeetingModal) — optionally creates a Teams meeting link automatically
5. SM can mark the meeting as confirmed (ConfirmMeetingModal)
6. After the call, SM records the VC outcome and submits feedback (FeedbackDrawer/FeedbackModal)
7. Buyer also receives a feedback form link to submit their assessment
8. SM can create a new callback request on behalf of a customer (CreateCallbackRequestDrawer)

**KPI Cards:** The callback requests screen shows aggregate KPI metrics:
- Total requests assigned
- Completed calls
- Pending/scheduled calls
- Conversion rate indicators

**Assignment Logic:**
- Callback requests are assigned to Sales Managers in round-robin order
- The `lastRequestAssignedAt` timestamp determines who gets the next request
- `isAvailable` flag must be true for a SM to receive assignments
- CC email addresses can be added to the meeting invite

**Teams Integration:**
- Microsoft Teams meeting links can be auto-generated for scheduled calls
- Meeting link is stored in `meetingLink` field
- Teams meeting ID is stored in `teamsMeetingId` for tracking
- Previous meeting details are preserved in `previousMeetings` JSON array

**Feedback System:**
- SM submits feedback internally via FeedbackDrawer
- Buyer receives a unique token-based URL to submit their feedback (buyerFeedbackToken)
- Both `isSmFeedbackSubmitted` and `isBuyerFeedbackSubmitted` flags track completion
- SM can link a unit preference to the feedback (UnitPrefSelector)

**Step-by-Step: SM Handling a Callback Request**
1. SM logs in at `/sales-manager` using mobile OTP
2. Lands on Callback Requests table (default page)
3. SM sees their assigned requests filtered by status
4. SM opens a request to view customer details and requested time
5. SM clicks "Schedule Meeting" → ScheduleMeetingModal opens
6. SM picks a date/time and optionally generates a Microsoft Teams meeting link automatically
7. SM can add CC email addresses to the meeting invite
8. SM confirms the meeting → status changes from REQUESTED to SCHEDULED
9. (Optional) SM clicks "Confirm Meeting" → ConfirmMeetingModal → status moves to CONFIRMED
10. After the call, SM clicks "Record Outcome" → FeedbackDrawer opens
11. SM selects a vcOutcome from the 10 available options (see table above)
12. SM submits feedback internally
13. System sends a unique feedback link (buyerFeedbackToken) to the buyer via SMS/WhatsApp
14. Buyer submits feedback via the token-authenticated URL (no login required)
15. Both SM and buyer feedback flags are set to true on completion

**KPI Cards (shown on Callback Requests screen):**
- Total requests assigned to SM
- Completed calls count
- Pending/scheduled calls count
- Conversion rate indicators

**Assignment Logic:**
- Requests are auto-assigned on round-robin basis ordered by `lastRequestAssignedAt` (earliest gets next request)
- SM must have `isAvailable = true` to receive assignments
- SM Admin can manually reassign requests between SMs

**vcOutcome Effect on Offers:**
- When SM records `VC_DONE_PREFERENCE` outcome: the VC_REQUEST offer code may be triggered for the customer
- This offer provides a discount on the customer's unit purchase
- The offer is applied via the RegistrationUnitOffer record

**Validations:**
- vcOutcome selection is required before the feedback form can be submitted
- Meeting link (Teams) is optional — SM can schedule without auto-generating a Teams link
- `isSmFeedbackSubmitted` must be true before the request is fully COMPLETED

**Business Rules:**
- Only assigned SMs see their requests by default
- SM Admin can see all requests
- Once a request is COMPLETED, it cannot be modified
- Feedback submission to LSQ is tracked separately from portal submission
- The `vcOutcome` field syncs with LeadSquared CRM via activity update

---

### Module 2: Tower and Unit Heatmap View

**Purpose:** Allow sales managers to view the current state of tower/unit inventory so they can guide customers about availability.

**Screen:** `/sales-manager/towers`

**Functionality:**
- Visual heatmap of all towers showing unit availability
- Color-coded unit status display (same as admin view)
- Read-only — sales managers cannot change unit status from this view

**Actors:** Sales Manager

**Business Rules:**
- SM view of towers may differ from admin view (inactive towers may be hidden for SM)
- Data refreshes via WebSocket if connected during an active allocation campaign

---

### Module 3: Physical Allocation (In-Person Event)

**Purpose:** Enable a sales manager to conduct a real-time, in-person allocation event where a walk-in customer selects and books a unit at the site office.

**Screens:**
- `/sales-manager/physical-allocation` → Customer Search
- `/sales-manager/physical-allocation/checkout` → Unit Allocation
- `/sales-manager/physical-allocation/kyc` → KYC Completion

**Actors:** Sales Manager

**Physical Allocation Flow:**

**Step 1: Customer Search (CustomerSearchPage)**
1. SM searches for a registered customer by name, phone, or registration number
2. System retrieves the customer's active registration
3. SM verifies the customer's identity before proceeding
4. SM selects the customer to proceed with allocation

**Step 2: Unit Allocation (UnitAllocationPage)**
1. SM views available units for the customer's registered apartment type
2. SM shows the customer the floor plan and unit details (FloorUnitPlan)
3. SM shows the customer the cost sheet (CostSheet)
4. SM selects the unit on behalf of the customer
5. SM initiates payment:
   - Online payment: SM scans QR code (QrScannerModal) or customer pays on their device
   - Offline payment: SM records the offline payment details (OfflinePaymentDrawer)
6. SM views payment schedule (PaymentSchedule)
7. Unit is blocked for 20 minutes while payment is being processed

**Step 3: KYC Completion (KycPage)**
1. After successful unit allocation, SM assists customer with KYC form
2. SM fills in applicant details (primary and co-applicants) — Applicants component
3. SM uploads required documents (Aadhaar front/back, PAN, photo)
4. SM submits KYC for the allocated unit
5. System generates a KYC PDF and stores it
6. KYC completion updates the registration unit status

**Unit Details Displayed:**
- Unit number, floor, tower
- Facing direction
- Typology (apartment type and carpet area)
- Total unit value breakdown
- Allocation amount and GST

**Unit Details Displayed During Physical Allocation:**
| Field | Example Value |
|-------|--------------|
| Unit number | 3502 |
| Floor | 35 |
| Tower | Crest |
| Typology | 1 Bed Growth Home |
| Carpet area | 323 sq.ft. |
| Agreement value | Rs. 32,99,000 |
| Allocation amount (confirmation amount) | Rs. 27,000 |
| GST on allocation amount | Rs. 4,860 (18%) |
| Discounts (if applicable) | HOME_LOAN offer: -Rs. 10,000 |
| All Inclusive Price | Rs. 35,52,960 |

**KYC Document Requirements (confirmed from TC-CST-018/020):**
- Photo (any image file)
- PAN card image
- Aadhaar Front image
- Aadhaar Back image
- All 4 documents are REQUIRED — submission fails validation if any are missing

**Maximum Applicants:** 4 total (1 primary + 3 co-applicants). "Add Applicant" button becomes disabled/hidden when limit is reached. Label shown: "Max. 4 Applicants allowed" (confirmed from TC-CST-019).

**Applicant Relationship Options:** Must be blood relatives. Options include: Father, Mother, Spouse, Son, Daughter, Sibling (full list not confirmed — additional options may exist).

**Payment Flow in Physical Allocation:**
- Online payment: System initiates QR code or redirects to Easebuzz/Razorpay gateway
- Offline payment: SM opens OfflinePaymentDrawer, enters payment details (reference number, amount, date), and uploads proof document
- Unit is placed on HOLD for 20 minutes from the time payment is initiated
- If payment does not complete within 20 minutes, hold is released and unit returns to AVAILABLE

**KYC After Physical Allocation:**
After successful payment, SM proceeds to KYC flow:
1. SM opens KYC form (`/sales-manager/physical-allocation/kyc`)
2. Primary applicant details are auto-filled from the customer's registration record
3. SM verifies and completes remaining fields
4. SM uploads documents for primary applicant and any co-applicants
5. SM submits KYC
6. System: generates KYC PDF (via Puppeteer), stores in Azure Blob, syncs to LeadSquared
7. `isKycSubmitted = true` set on the registration unit record

**Business Rules:**
- Physical allocation only works during a PHYSICAL_EVENT campaign
- SM must find the customer's active registration before proceeding
- The 20-minute hold timer applies during payment processing
- Offline payments require payment proof documentation
- KYC must be completed for the unit to be fully confirmed
- Co-applicants can be added — system supports multiple applicants per unit
- KYC documents are stored in Azure Blob Storage before submission to LSQ

---

## 6. Navigation Structure

```
/sales-manager (redirects to /sales-manager/callback-requests)
├── /sales-manager/callback-requests    → Callback Requests Table
├── /sales-manager/towers               → Tower Inventory Heatmap
├── /sales-manager/physical-allocation  → Customer Search
│   ├── /sales-manager/physical-allocation/checkout → Unit Selection & Payment
│   └── /sales-manager/physical-allocation/kyc     → KYC Form
```

---

## 7. Authentication

- Separate login page at `/sales-manager`
- OTP-based mobile authentication
- JWT token stored in session
- Sales Manager and Sales Manager Admin roles (5 and 4) can access this portal
- Admin (role 1) cannot log in via this portal's login page but can access the same routes

---

## 8. Integration Points

| Integration | Purpose |
|-------------|---------|
| LeadSquared (LSQ) | Callback activity sync, VC outcome recording |
| Microsoft Teams | Automated meeting link generation |
| Easebuzz / Razorpay | Payment processing during physical allocation |
| Azure Blob Storage | KYC document uploads |
| Kaleyra | SMS/WhatsApp notifications to customers |

---

## 9. Error Handling

- Customer not found → display "No records found" message
- Payment failure → unit hold is released, customer is notified
- KYC submission failure → error message with retry option
- Network disconnection during physical event → SM can resume from saved state

---

## 10. Mobile Optimization

The Sales Manager Portal is designed with mobile-first layout:
- Bottom navigation bar for quick tab switching
- Mobile top bar for context display
- Touch-friendly UI components
- QR code scanner modal for mobile payment collection
