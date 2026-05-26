# Buyer Portal — Business Requirements Document

**Portal:** Buyer / Customer Portal
**Project:** XR Portal (HoABL Real Estate Platform)
**URL:** Dedicated buyer-facing Next.js application
**Last Updated:** 2026-05-10 (enriched with confirmed STATIC allocation step-by-step, KYC validations, payment flow)
**Sprint Reference:** BRD Reverse Engineering Sprint + Sprint 3 TC validation
**Tags:** #portal/buyer #type/brd #status/enriched

---

## Related Notes
- [[Roles-and-Permissions]]
- [[Allocation-Workflow]]
- [[KYC-Workflow]]
- [[Home-Loan-Workflow]]
- [[Payment-Workflow]]
- [[Callback-Request-Workflow]]
- [[Support-Ticket-Module]]
- [[Milestone-Payments]]
- [[Realtime-Events-BRD]]

> All linked notes resolve by filename in Obsidian. Files live under `Workflows/` subfolder.

---

## 1. Portal Overview

The Buyer Portal is the customer-facing application where registered buyers experience the property purchase journey from registration through to allocation, KYC, payment scheduling, and home loan processing. It is built using Next.js and is fully mobile-optimized.

This portal is the primary touchpoint for buyers during allocation events, where they compete in real-time to select their preferred unit.

---

## 2. User Types

| Role | Role ID | Description |
|------|---------|-------------|
| User (Buyer) | 2 | Registered homebuyer who has completed registration payment |

---

## 3. Business Purpose

The Buyer Portal provides the complete end-to-end home buying experience:
1. **Registration** — Buyer enrolls with a booking amount payment
2. **Allocation** — Buyer participates in a real-time unit selection event
3. **KYC** — Buyer completes identity verification and document submission
4. **Home Loan** — Buyer explores and applies for home loan options
5. **Payment Schedule** — Buyer tracks construction-linked payments
6. **Project Information** — Buyer learns about the project
7. **Support** — Buyer raises and tracks grievances

---

## 4. Module List

```
Buyer Portal
├── 1. Registration & Login
├── 2. Home Dashboard
├── 3. Allocation Experience
│   ├── 3a. Waiting for Allocation
│   ├── 3b. Live Unit Selection (STATIC/DYNAMIC)
│   ├── 3c. Payment Flow
│   └── 3d. Post-Allocation
├── 4. KYC (Know Your Customer)
├── 5. Home Loan
├── 6. Payment Schedule
├── 7. Unit Details (Post-Allocation)
├── 8. Project Information
├── 9. Support Tickets
├── 10. Callback Request
└── 11. Call Feedback
```

---

## 5. Module Details

---

### Module 1: Registration and Login

**Purpose:** Allow buyers to create an account and log in using mobile OTP.

**Screens:** `/` (root/login), `/register`

**Login Flow:**
1. Buyer visits the portal
2. Buyer enters their mobile number
3. System sends OTP via **Epinet SMS** (NOT Kaleyra — Kaleyra imports commented out) <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js -->
4. Buyer enters OTP to authenticate
5. JWT token is issued and stored
6. Buyer is redirected to the home dashboard

**Registration Page (for new buyers):**
- New buyers cannot self-register on the buyer portal — they must be registered by a CP or admin
- If a buyer arrives via a referral link (`/ref/:hvCode`), their CP code is captured automatically
- The `/ref/:hvCode` route captures the referral code and stores it for registration attribution

**OTP Rules:**
- OTP expires within a configured time window
- Rate limiting prevents abuse (lastOtpSentAt tracks timing)
- For NRI buyers, international country code is supported

**Consent Flow:**
- First login prompts the buyer to view and accept Terms and Conditions
- Consent is recorded: `isConsented = 1` (agreed), `0` (disagreed), `null` (undecided)
- Buyers who disagree with T&C may have restricted access

---

### Module 2: Home Dashboard

**Purpose:** The buyer's primary dashboard showing the status of their registration, upcoming events, and key actions.

**Screen:** `/home`

**Dashboard Sections:**

**Status Alert Banner (TopAlert):**
- Shows the current state of the buyer's journey
- Changes based on registration/allocation status

**Allocation Banner (when campaign is running):**
- Shows a countdown to allocation event start
- Or live event status if currently running
- Banner image/message configured via CMS (Strapi hero-slides)

**Home Tab Bar:**
- Navigates between different home sections (allocations, project info, etc.)

**Creative Tiles (CreativesTiles):**
- Marketing creatives configured via Strapi CMS
- Project highlights, promotions, lifestyle imagery

**Home Popup:**
- Configurable popup for announcements (homePopup) — managed via Strapi

**Marquee:**
- Scrolling text banner for announcements

**KPI Tables:**
- Data tables showing project progress indicators

**Key Business States that Affect Dashboard:**
| State | What Buyer Sees |
|-------|----------------|
| Registration pending payment | Pay registration amount prompt |
| Registration complete, no campaign | Waiting state |
| Campaign running, buyer on waitlist | Waitlist indicator |
| Campaign running, buyer allocated | Unit selection CTA |
| Unit selected, payment pending | Pay now CTA |
| Unit booked (WINNER) | Congratulations + unit details |
| KYC pending | KYC completion CTA |

---

### Module 3: Allocation Experience

**Purpose:** The heart of the buyer journey — the real-time event where a buyer selects and pays for their unit.

**Screen:** `/alloted` (allotted unit section)

**The Allotted Section has Multiple States:**

#### State 1: Waiting for Allocation (Pre-Event)

**Components:** `WaitingForUnit`, `AllocationEndTimer`, `NextChanceTime`

- Buyer is on the waitlist (status = WAITLIST)
- Shows: "Allocation hasn't started yet" or "You're on the waitlist"
- Countdown timer shows when the next allocation round begins
- `AllocationEndTimer` shows a live countdown

#### State 2: Allocation Opening (Campaign Starts)

**Component:** `AllocationOpenedBanner`, `AllocationOpenedTabs`

- Campaign changes to RUNNING
- WebSocket broadcasts campaign start to all connected buyers
- Banner announces the event is live
- Buyer can see their allocated unit OR unit options (depending on allocation type)

#### State 3: STATIC Allocation — Unit Selection

**Components:** `AllocationOpenedTabsCard`, `SelectUnitBox`, `UnitSection`

**STATIC Allocation Flow:**
1. When campaign is RUNNING (STATIC type), buyer can see available units
2. Buyer browses towers using the tower heatmap
3. Buyer selects a preferred unit (pay_now_initiated WebSocket message sent)
4. System places a 20-minute HOLD on the unit
5. Buyer is shown the payment screen
6. Buyer completes payment (Easebuzz/Razorpay gateway)
7. On payment success:
   - Unit status changes to BOOKED
   - Registration unit status changes to WINNER
   - Buyer sees congratulations screen (PaidYourUnit)
   - `unit_sold` message is broadcast to all other connected buyers
8. On payment failure:
   - Unit hold is released
   - Buyer is returned to unit selection
   - Other buyers can see the unit as AVAILABLE again

#### State 4: DYNAMIC Allocation — Auto-Assignment

**Components:** `OpenAllottedUnit`, `ConfirmationAmount`

**DYNAMIC Allocation Flow:**
1. System automatically assigns units to registered buyers using round-robin logic
2. Each round has a configurable time window (e.g., 20 minutes)
3. Within the round, each buyer sees their allocated unit
4. Buyer initiates payment (proceed_to_pay WebSocket message)
5. Payment must be completed within the round time
6. On payment success → WINNER status
7. On payment failure/timeout → system reallocates the buyer to the next available unit in the same typology
8. If no units available → buyer is placed on WAITLIST

**Unit Display for Dynamic Allocation:**
- `WatchingUnitList` — shows units being watched
- `YourMissedChances` — shows units the buyer missed (lost_units history from Redis)
- `HurryUnitsBookingFaster` — urgency indicator
- `MissedYourUnit` — notification when a unit was taken
- `UnitSoldNotification` — real-time popup when another unit is sold

#### State 5: Sold Out

**Component:** `AllSoldOutUnit`

- All units in the buyer's typology are BOOKED
- Buyer is informed that the category is sold out
- May offer waitlist option for cancellations

#### State 6: Post-Payment (Winner)

**Component:** `PaidYourUnit`

- Buyer has successfully booked a unit
- Shows booking confirmation details
- Prompts buyer to complete KYC
- Shows next steps

**Allocation Payment Drawer:** `AllocationPaymentDrawer`

- Integrates with Easebuzz or Razorpay payment gateway
- Shows amount breakdown (allocation amount + GST)
- Supports: Credit Card, Debit Card, UPI, Net Banking, Wallet, EMI

**Overlay Component:** `Overlay`

- Full-screen overlay during active payment processing to prevent duplicate submissions

**Confirmed Step-by-Step STATIC Allocation from Buyer's Perspective (TC-CST-001 through TC-CST-016):**

**Phase 1: Login and Home Dashboard**
1. Buyer visits `https://uat.xrportal.in`
2. Selects nationality (Indian National or NRI tab)
3. Enters mobile number → clicks "Send OTP"
4. Enters OTP (static on UAT: 147258) → clicks "Verify OTP"
5. Lands on Home dashboard — welcome message shows: "Welcome, [Name]"
6. Home dashboard shows Details table with all registrations
7. Table columns: Registration Number | Home Loan | Allotted Unit | Status | Process Status | Payment Schedule
8. Each registration row shows its current status and available action

**Status Values on Home Dashboard:**
| Status | Badge Style | Meaning |
|--------|------------|---------|
| Available | Green | Eligible to book during active campaign |
| Waitlisted | Dark | On waitlist — no unit available |
| Booked | Green with checkmark | Unit payment completed |
| Refunded | Red | Registration cancelled with refund |

**Phase 2: Unit Selection**
1. Find registration with Status = Available
2. Click "Proceed to Confirm" under Process Status column
3. Allotment page loads (`/allotted`) with congratulations message
4. Click "Book Now" (green badge) for the eligible registration
5. Click "Select Unit >" in center panel — Unit Selection screen opens
6. Left panel: all towers listed with available unit counts (Crest | Crown | Blossom | Pinnacle | Bright)
7. Center panel: grid of floors and units color-coded by status
8. Click any white (Available) unit → turns green (Selected)
9. Right panel shows unit details: Unit No, BHK type, carpet size, agreement value, discounts, total price
10. Click "Add" to confirm unit selection — returns to Allotment page
11. Center panel now shows selected unit details and registration number
12. "Change Unit" link available to re-select
13. T&C checkbox visible (unchecked by default)

**Phase 3: T&C and Payment**
1. Pay button is DISABLED until T&C checkbox is ticked (confirmed TC-CST-012)
2. Tick T&C: "I confirm to HoABL Terms & Conditions and Privacy Policy"
3. Pay button becomes ENABLED
4. Click "Confirmation Amount Pay Rs. 27,000"
5. Easebuzz gateway opens
6. Gateway shows: Merchant name (Impactum Lands Private Limited), payment validity timer (~15 minutes), 5 payment methods: Credit Card | Debit Card | UPI | NetBanking | Wallets
7. Buyer completes payment
8. On success: redirected to Payment Successful screen
9. Confirmation screen shows: green checkmark, "Payment successful!" message, unit details, applicant list

**Additional Actions Available Before Payment:**
- "Floor & Unit Plan >" button: opens floor plan showing unit position
- "Cost Sheet >" button: opens itemized pricing breakdown
- "Payment Schedule >" button: opens milestone list
- "Cancel" button: deselects unit without releasing the hold

**Phase 4: Post-Payment State**
After payment:
- Home dashboard shows: Status = Booked (green badge), Allotted Unit = "3502-Crest | 1 Bed Growth Home | 323 sq.ft.", Process Status = "Complete KYC" (red/orange button with alert)
- Warning: "Required to complete the allotment!"
- Payment Schedule column shows "Pay >" button for future milestones

**Post-Campaign State (after campaign stops):**
- All Available registrations revert to Waitlisted status
- Allotment page center panel shows RED text: "Allocation window is closed for now."
- No "Select Unit" or "Book Now" buttons visible for Waitlisted registrations
- Booked status remains unchanged for completed bookings

**Business Rules:**
- Unit HOLD lasts exactly 20 minutes during online payment
- Buyer can only hold one unit at a time
- If two buyers attempt to hold the same unit simultaneously, only one succeeds
- Payment must complete within the hold window or the unit is released
- Redis manages real-time unit state during allocation (not DB — for performance)
- Redis state is persisted to DB (AOF mechanism) for durability

---

### Module 4: KYC (Know Your Customer)

**Purpose:** Buyers complete identity verification and submit documents required for legal property registration.

**Screen:** `/kyc`

**KYC Steps:**

**Step 1: Applicant Information (KycForm)**
- Primary applicant details: Name, date of birth, address, PAN, Aadhaar number, occupation, income details
- Add co-applicants if needed (up to system-defined limit)

**Step 2: Document Upload (KycTable/KycTable2)**
- Aadhaar card — front and back
- PAN card
- Passport photograph
- Additional documents as required

**Step 3: Review and Submit (kycSummary)**
- Buyer reviews all entered information
- Confirms accuracy

**Step 4: E-Verification**
- Buyer completes digital OTP verification to authenticate the submission
- `eVerificationCompleted` flag is set to true

**Step 5: Confirmation (kycSuccess/paymentCongo)**
- KYC submission confirmed
- Next steps displayed

**KYC Status Tracking:**
| Flag | Meaning |
|------|--------|
| isKycSubmitted | KYC form data submitted |
| eVerificationCompleted | OTP e-verification completed |
| isKycPdfSubmitted | KYC PDF generated and stored |
| selfKycSubmitted | Self-service KYC submitted |
| selfKycFinalSubmitted | Final self-KYC confirmed |
| bookingFormActivitySubmitted | Booking form synced to LSQ |
| bookingActivitySubmitted | Booking activity synced to LSQ |

**Step-by-Step KYC Completion (confirmed from TC-CST-017 through TC-CST-023):**

1. After payment success, buyer clicks "Verify Details" for the primary applicant (Mamta Solanki / Self) on the KYC/Add Applicants screen
2. Primary applicant form opens with all fields auto-filled from registration record: Name, Mobile, Email, Full Address, Pincode, Relationship = Self
3. Buyer verifies details and submits
4. Buyer can add co-applicants — click "+ Add Applicant" button:
   - Fill: First Name, Last Name, Mobile, Email, Full Current Address, Pincode, Relationship (must be blood relative)
   - Upload: Photo, PAN Card image, Aadhaar Front image, Aadhaar Back image
   - ALL 4 document uploads are REQUIRED — submission blocked if any missing (TC-CST-020)
   - Toast on successful co-applicant save: "Applicant details saved successfully"
   - Maximum 4 applicants total (primary + 3 co-applicants) — "+Add Applicant" button disappears at limit
   - Label shown at limit: "Max. 4 Applicants allowed" (TC-CST-019)
5. Buyer clicks "Confirm" → KYC Summary page loads
6. Summary shows: Registration Details, Booking Number, Selected Unit, Applicant count
7. T&C checkbox present on Summary (unchecked by default)
8. Buyer ticks T&C checkbox → clicks "Confirm"
9. KYC Submitted Successfully screen shows:
   - Table: Registration No | KYC Number | Unit | No. of Applicants
   - Process Status = "KYC Completed"
   - "Download your Unit Details" link
   - "Go to Home" button

**KYC Status Flags (in priority order):**
| Flag | When Set | Meaning |
|------|---------|---------|
| isKycSubmitted | After Step 9 | KYC form data submitted |
| eVerificationCompleted | After OTP verification | E-verification completed (optional step) |
| isKycPdfSubmitted | After PDF generation | KYC PDF generated and stored in Azure |
| selfKycSubmitted | If buyer self-submitted | Self-service KYC flag |
| bookingFormActivitySubmitted | After LSQ sync | Booking form synced to LeadSquared |

**KYC Validations:**
- KYC form is only accessible after buyer has WINNER status (confirmed unit booking with payment)
- Each co-applicant requires all 4 documents — partial document submission is NOT accepted
- Aadhaar number format: 12 digits (e.g., 1234 5678 9012)
- PAN number format: ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
- Relationship must be blood relative — non-blood relationships may be rejected (specific validation rule not confirmed)

**Digital Booking Form Download:**
Available after KYC submission via "Download your Unit Details" link.
Shows: Registration No, Transaction IDs, Unit Number, Tower Name, all applicant details (Name, Mobile, Email, Address, Relationship, PAN, Aadhaar).
Can be printed or saved as PDF from browser print preview.

**Business Rules:**
- KYC can only begin after the buyer has a confirmed unit (WINNER status)
- Documents are uploaded to Azure Blob Storage
- After upload, documents are synced to LeadSquared
- KYC PDF is generated server-side using Puppeteer and stored in Azure
- E-verification OTP is sent to the buyer's registered mobile number

---

### Module 5: Home Loan

**Purpose:** Buyers explore home loan eligibility and apply for pre-approved loans through the Easiloan integration.

**Screen:** `/homeloan`

**Home Loan Flow:**

**Step 1: Loan Eligibility (LoanEligibilityCheck)**
- Buyer selects employment type: Salaried or Self-Employed
- Salaried: Enters monthly income and existing EMI obligations
- Self-Employed: Enters annual profit, annual turnover, and existing EMI obligations
- System submits to Easiloan API for eligibility assessment

**Step 2: Loan Offers Review (LoanOffersReview)**
- Easiloan returns pre-approved loan offers from partner banks
- Buyer reviews offers with details: loan amount, interest rate, EMI, bank name
- Buyer selects preferred loan offer
- Selected offer is stored in `homeLoanBankSelected`

**Step 3: Apply Loan (ApplyLoan)**
- Buyer confirms selection and proceeds with formal application

**Step 4: Pre-Approved Loan (PreapprovedLoan)**
- If buyer already has a sanction letter, they can opt out of Easiloan flow
- `homeLoanOptedOut = true` marks this choice

**Step 5: Congratulations (Congratulations)**
- Loan application submitted successfully
- HOME_LOAN offer is automatically applied to the buyer's unit (if eligible)

**HomeLoanData Component:**
- Displays loan summary and linked bank details
- Shows NOC requirements for bank disbursement

**Home Loan Tracking:**
| Field | Description |
|-------|-------------|
| homeLoanStep | 1 = Completed eligibility, 2 = Completed bank selection |
| homeLoanOptedOut | True if buyer bypassed Easiloan (has external sanction letter) |
| homeLoanEmpType | salaried / self_employed |
| homeLoanMonthlyIncome | For eligibility calculation |
| homeLoanAnnualProfit | For self-employed eligibility |
| homeLoanBankSelected | JSON of selected bank offer from Easiloan |

**Business Rules:**
- Home loan flow is available after unit allocation
- Completing the home loan flow may unlock the HOME_LOAN offer discount on the unit
- `RegistrationHomeLoan` records track the formal loan application (loanApprovalStatus field)
- Records with `loanApprovalStatus = admin_rejected` are excluded from the customer list view

---

### Module 6: Payment Schedule

**Purpose:** Buyers track the construction-linked payment plan for their allocated unit.

**Screen:** `/paymentschedule`

**Key Information Displayed:**
- List of all payment milestones
- Amount due at each milestone
- Payment status: pending / partial / paid
- GST breakdown
- Already paid amount
- Outstanding balance
- Home loan linked amount (disbursed at certain milestones)
- Early bird discount applied

**Payment Schedule Component (paymentSection):**
- Organized by milestone type
- Shows principal amount, GST amount, parking amount separately
- Payment schedule is tied to the selected payment plan type (construction-linked, time-linked, down payment)

**Business Rules:**
- Payment schedule is generated after KYC is completed and unit is confirmed
- Each milestone has a specific trigger (construction stage completion)
- Demand letters are generated when a milestone is triggered
- Payment can be made via the portal's online payment gateway

---

### Module 7: Unit Details (Post-Allocation)

**Purpose:** Buyers view comprehensive details about their allocated unit.

**Screen:** `/allotted-units` and allocation-details components

**Sections (allocationDetails):**

**Unit Details (UnitDetails):**
- Unit number, floor, tower name
- Apartment type and configuration
- Carpet area, saleable area
- Facing direction
- Floor plan image

**Cost Sheet (CostSheet):**
- Basic price
- Floor rise charge
- Premium charge
- Infrastructure charge
- Society charge
- Clubhouse charge
- Possession charge
- GST amount
- Parking charge
- Total unit value
- Offer/discount deduction
- Early bird benefit
- Net payable amount

**Tower View (towerView):**
- Visual representation of the buyer's unit location in the tower

**Floor and Unit Plans (FloorUnitPlans):**
- Architectural floor plan of the buyer's floor
- Unit layout

**Payment Schedule Detail (PaymentSchedule):**
- Milestone-by-milestone payment breakdown

**Business Rules:**
- Unit details are visible only after WINNER status is confirmed
- Cost sheet reflects the pricing at the time of allocation (frozen)
- Offers applied to the unit are included in the cost sheet

---

### Module 8: Project Information

**Purpose:** Buyers access comprehensive information about the real estate project.

**Screen:** `/project`

**Sections:**
- Project overview (TopBarProject)
- Tower section with specifications (TowerSection, TowerTabs)
- Gallery (Gallery) — photos managed via Strapi
- Project documents (Documents) — RERA, approvals, brochures
- Project videos (Videos) — virtual tours

**Business Rules:**
- Content is managed via Strapi CMS
- Available to all registered buyers regardless of allocation status

---

### Module 9: Support Tickets

**Purpose:** Buyers raise and track grievance/support tickets for post-purchase issues.

**Screens:** `/support-tickets`, `/support-tickets/categories`, `/support-tickets/create`, `/support-tickets/:id`

**Ticket Categories:**
| Category | Description |
|----------|-------------|
| GENERAL | General inquiries |
| CAR_PARKING | Parking-related issues |
| CANCELLATION | Cancellation requests |
| LOAN | Home loan-related issues |

**Support Ticket Flow:**
1. Buyer navigates to support tickets
2. Buyer selects a category
3. Buyer describes the issue
4. Ticket is created and assigned a ticket ID
5. Buyer can track the ticket status
6. Buyer can view ticket history

**Integration:** Tickets are synced with OS Ticket (external support system) via `os-ticket-api.service.js`

**Business Rules:**
- Cancellation requests go through the CANCELLATION category
- All ticket categories are tracked separately for reporting
- Buyers can view their ticket history and current status

---

### Module 10: Callback Request

**Purpose:** Buyers request a callback or schedule a video call with a sales manager.

**Components:** `CallbackRequestButton`, `CallbackRequestModal`, `CallbackFeedbackForm`

**Flow:**
1. Buyer clicks "Request Callback" or "Schedule VC" button
2. Buyer fills in the request modal (description, preferred time)
3. Request is submitted
4. System assigns to a sales manager via **least-loaded algorithm** (round-robin disabled) <!-- FSD-CORRECTION 2026-05-25 // Source: callback-request-sm.service.js:338-349 -->
5. SM schedules and completes the call
6. Buyer receives a feedback form URL (buyerFeedbackToken-based)
7. Buyer submits post-call feedback (SubmitFeedbackModal)

**Call Feedback Pages:**
- `/call-feedback` — Main feedback landing page
- `/call-feedback/:code` — Token-authenticated feedback form for a specific call

**Business Rules:**
- Callback requests are linked to the buyer's registration
- Buyer feedback is submitted via a unique token URL (no login required)
- Feedback must be submitted before the request is fully COMPLETED

---

### Module 11: Work Progress

**Purpose:** Buyers view the current construction progress of the project.

**Screen:** `/work-progress`

**Content:** Construction milestone photos and progress updates — managed via CMS

---

## 6. Navigation Structure

```
Buyer Portal
├── / (login)
├── /home              → Dashboard
├── /alloted           → Allocation experience (pre/during/post)
├── /allotted-units    → Allocated unit details
├── /kyc               → KYC form
├── /homeloan          → Home loan flow
├── /paymentschedule   → Payment schedule tracking
├── /project           → Project information
├── /support-tickets/*  → Support ticket management
├── /call-feedback/*   → Call feedback forms
├── /work-progress     → Construction progress
├── /account           → Buyer account/profile
├── /register          → Registration page
└── /ref/:hvCode       → CP referral entry point
```

---

## 7. Authentication

- Login at root `/` with mobile OTP
- JWT token used for all API calls
- Session management via SessionManager component
- Token refresh handled automatically
- NurixCallWidget is initialized post-login for embedded calling functionality

---

## 8. Real-time Behavior

The Buyer Portal is heavily real-time during allocation events:

**WebSocket Connection:**
- Established on login when a campaign is detected
- Authenticated via JWT token in WebSocket URL: `/ws/:token`
- Connection sends welcome message with allocation type and status

**Real-time Messages Received by Buyer:**
| Message Type | Description |
|-------------|-------------|
| `connection_established` | Initial connection confirmation with campaign info |
| `user_details_response` | Buyer's current registration and allocation state |
| `towers_response` | List of all towers and their unit availability |
| `tower_units_response` | Units for a specific tower with color-coded status |
| `unit_details_response` | Details of a specific unit |
| `tower_refresh` | Real-time update when a unit status changes |
| `unit_sold` | Notification when another buyer books a unit |
| `reallocation_notification` | DYNAMIC: New unit assigned / MISSED / WAITLIST |

**Messages Sent by Buyer:**
| Message Type | Purpose |
|-------------|---------|
| `user_details` | Request own registration status |
| `towers` | Request all towers list |
| `tower_units` | Request units for a specific tower |
| `unit_details` | Request details of a specific unit |
| `pay_now_initiated` | Signal buyer is initiating payment for a unit |
| `proceed_to_pay` | Confirm buyer wants to proceed with payment for allocated unit(s) |

**Unit Color Coding (Visual Heatmap):**
| Color | Status |
|-------|--------|
| Green (#00FF00) | AVAILABLE |
| Orange (#FFA500) | Selected/Proceeding to pay |
| Red (#FF0000) | BOOKED |
| Blue (#0000FF) | RESERVED (admin hold) |

---

## 9. Integration Points

| Integration | Purpose |
|-------------|---------|
| Easebuzz | Primary payment gateway for registration and allocation |
| Razorpay | Alternative payment gateway |
| Easiloan | Home loan eligibility and offers |
| LeadSquared (LSQ) | Lead/activity tracking, document upload |
| Mavis | Unit/booking creation |
| Kaleyra | SMS and WhatsApp notifications |
| Azure Blob Storage | Document uploads for KYC |
| OS Ticket | Support ticket management |
| WebSocket Server | Real-time allocation event communication |
| Strapi CMS | Project content |
| Nurix | Embedded calling widget |

---

## 10. PDF Generation

The Buyer Portal generates PDFs for official documentation:
- **Digital Booking PDF (DigitalBookingPdf):** Formal booking confirmation document
- **KYC PDF:** Summary of submitted KYC information

PDFs are generated using the PdfGenerator / SimplePdfGenerator components and may be stored in Azure Blob Storage.

---

## 11. Error Handling

- Network errors display user-friendly messages
- Payment gateway timeouts handled gracefully with retry options
- Session expiry prompts re-login
- WebSocket disconnection is handled transparently (reconnection logic)
- If allocation campaign ends during buyer's payment flow, appropriate messaging is shown

---

## 12. Accessibility and UX

- Mobile-first design (primary device for buyers is smartphone)
- Bottom navigation bar (BottomNavigationBar) for quick section switching
- Mobile top bar (mobileTopBar) for context and navigation
- Lottie animations used for loading states and celebrations
- Countdown timers (TickerCount) for real-time urgency during allocation events
