# Backend — Functional Business Requirements Document

**Component:** Backend API Server
**Technology:** Node.js with Express, Sequelize ORM, MySQL database
**Last Updated:** 2026-05-10
**Sprint Reference:** BRD Reverse Engineering Sprint
**Tags:** #component/backend #type/brd #status/complete

---

## Related Notes
- [[Admin-Portal-BRD]]
- [[Buyer-Portal-BRD]]
- [[Roles-and-Permissions]]
- [[Payment-Workflow]]
- [[Allocation-Workflow]]
- [[Milestone-Payments]]
- [[Realtime-Events-BRD]]

---

## 1. Overview

The backend is the central business logic engine for the XR Portal platform. It serves as the API layer connecting all portals (Admin, SM, CP, Buyer) and orchestrates:
- Authentication and authorization
- Registration and allocation workflows
- Payment processing and reconciliation
- KYC data management
- Third-party integrations (CRM, ERP, Payment Gateways, Communication)
- Scheduled automation tasks (cron jobs)
- Audit logging

---

## 2. Architecture

```
backend/src/
├── controllers/     → HTTP request handlers (thin layer)
├── services/        → Core business logic
├── models/          → Database entity definitions
├── routes/          → URL routing by portal/domain
├── middleware/      → Auth, rate limiting, validation
├── cron/            → Scheduled automated tasks
├── validations/     → Request input validation schemas
├── utils/           → Helper utilities, logger
└── config/          → Database, payment, third-party config
```

---

## 3. User Roles and Access Control

### Roles (from database):
| Role ID | Role Name | Portal |
|---------|-----------|--------|
| 1 | admin | Admin Portal |
| 2 | user | Buyer Portal |
| 3 | cp | CP Portal |
| 4 | sales_manager_admin | SM Portal (elevated) |
| 5 | sales_manager | SM Portal |

### Route Protection:
- All protected routes require a valid JWT token
- Role-based access is enforced at the route level via middleware
- Admin routes (`/admin/*`) require role 1 or 4
- SM routes require role 4 or 5
- User routes (`/user/*`) require role 2
- CP routes (`/cp/*`) require role 3

---

## 4. Core Business Domains

---

### Domain 1: Authentication

**File:** `auth.controller.js`, `auth.routes.js`

**Flows:**

**OTP Login (Buyers and CPs):**
1. User submits mobile number
2. System generates a 6-digit OTP
3. OTP is sent via **Epinet SMS** (NOT Kaleyra — Kaleyra imports commented out in `communication.service.js:8-9`) <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js -->
4. User submits OTP
5. System validates OTP and expiry
6. JWT token is issued with user ID and role ID
7. Token is returned to the client

**Admin Login (Email/Password):**
1. Admin submits email and password
2. System looks up user by email
3. Password is verified against bcrypt hash
4. JWT token issued with admin role

**OTP Rules:**
- OTP stored as 6-character string in `users.otp`
- Expiry stored in `users.otpExpires`
- `lastOtpSentAt` prevents OTP spam
- Rate limiter middleware (rate-limiter.middleware.js) limits requests per IP

---

### Domain 2: Registration Management

**File:** `registration.controller.js`, `registration.service.js`

**Registration Fields:**
- userId (the buyer)
- projectId (the project they're registering for)
- projectName
- opportunityId (from LeadSquared)
- activityId (from LeadSquared)
- registrationNumber (unique, system-generated)
- walkInSourceId, walkInSourceXrCode (referral tracking)
- brokerId (CP who registered them)
- details (JSON: all form data)
- purchasePurpose, homeLoanIntent, budgetAmount
- preferredFloorMin, preferredFloorMax
- status: Open / Won / Lost / Refund
- stage (from LSQ pipeline stage)
- paymentStatus: pending / success / failed
- availableForAllocation (boolean)

**Registration Lifecycle:**
```
Open (payment pending)
  → payment successful → Won
  → unit cancelled → Open again or Lost
  → refund processed → Refund (soft-excluded from default queries)
```

**Registration Number:**
- Unique identifier generated at registration time
- Format: system-generated unique string
- Used as the primary key for all downstream operations

**Business Rules:**
- One active registration per buyer per project (enforced at application level)
- Default scope excludes Refund status registrations
- `scope('withRefunded')` must be explicitly used to include refunded registrations
- Admin can override `availableForAllocation` to exclude a buyer from an active campaign

---

### Domain 3: Allocation Engine

**Files:** `allocation.service.js`, `allocation-campaign.service.js`, `allocation-batch.service.js`

**Allocation Campaign:**
- Admin creates a campaign specifying type, time window, and units
- Campaign types: STATIC, DYNAMIC, PHYSICAL_EVENT
- Campaign statuses: NOT_STARTED → RUNNING → STOPPED/COMPLETED/FAILED/CANCELLED

**STATIC Allocation Logic:**
- All eligible buyers can see and select available units simultaneously
- First buyer to pay for a unit wins it
- No rounds — open window during campaign duration
- Unit is placed on HOLD (20 min) when payment is initiated
- On payment success: unit → BOOKED, registration unit → WINNER
- On payment failure/timeout: unit → AVAILABLE, registration unit → WAITLIST

**DYNAMIC Allocation Logic (Round-Robin):**
- System assigns one unit per buyer per round
- Round time is configurable (e.g., 20 minutes)
- Assignment uses round-robin by tower sequence and band configuration
- Each tower has a `band_order` that defines the unit assignment sequence
- When a round starts:
  1. Each buyer in the campaign gets assigned one available unit in their typology
  2. Units are assigned round-robin across towers (respecting active tower status)
  3. Buyer has the round duration to pay
- On payment failure:
  1. System finds the next available unit in the same typology
  2. If found: buyer is reassigned (ALLOCATED status)
  3. If not found: buyer goes to WAITLIST
- Lost units history is tracked in Redis (`lost_units` key)
- Persisted to AOF file for recovery

**PHYSICAL_EVENT Allocation Logic:**
- Sales manager manually selects a unit for a walk-in customer
- Similar to STATIC but initiated by SM, not buyer
- SM uses the SM Portal's Physical Allocation flow

**Unit Status During Allocation:**
| Status | Timing |
|--------|--------|
| AVAILABLE | Open for selection |
| HOLD | Buyer initiated payment (20-min window) |
| BOOKED | Payment completed |
| RESERVED | Admin-reserved (not available) |

**RegistrationUnit Statuses:**
| Status | Meaning |
|--------|---------|
| WAITLIST | Buyer is waiting — no allocation yet |
| PREALLOCATED | Pre-assigned (before campaign starts) |
| ALLOCATED | Unit is assigned but payment not yet complete |
| WINNER | Payment completed — unit confirmed |
| HOLD | Payment initiated — waiting for completion |
| REFUND | Unit was allocated and then refunded |

**Hold Timer Logic:**
- When a buyer initiates payment, `holdAt` timestamp is recorded on both unit and registration unit
- A cron job (`allocation-payment-reconcile.cron.js`) checks for expired holds
- After 20 minutes: hold is released, unit is made AVAILABLE again

**Payment Reconciliation (Cron):**
- `payment-reconcile.cron.js` runs periodically to reconcile pending payments with gateway status
- Prevents orphaned transactions where gateway processed but webhook was missed

---

### Domain 4: Payment Processing

**Files:** `payment.controller.js`, `payment-gateway.controller.js`, `easebuzz.service.js`, `razorpay.service.js`, `payment-gateway.service.js`

**Payment Gateways:**
- **Easebuzz**: Default gateway. Uses hash-based authentication.
- **Razorpay**: Alternative gateway. Uses order-based flow.

**Payment Transaction Lifecycle:**
```
initiated → pending → completed / failed / cancelled / dropped / bounced
                                                ↓
                                            refunded
```

**Transaction Types:**
| Type ID | Name |
|---------|------|
| 1 | REGISTRATION (initial registration payment) |
| 2 | UNIT_ALLOCATION (allocation amount payment) |

**Payment Flow — Online (Buyer-Initiated):**
1. Buyer clicks "Pay Now"
2. Backend creates a PaymentIntent (stores transaction details)
3. Backend creates payment link/order with gateway
4. Buyer is redirected to gateway checkout
5. Buyer completes payment on gateway
6. Gateway sends webhook to backend
7. Backend validates webhook signature
8. Backend updates transaction status to completed/failed
9. If completed: triggers allocation confirmation flow
10. Backend notifies WebSocket server to update buyers

**Payment Flow — Offline (Admin-Initiated):**
1. Admin records offline payment details
2. Uploads payment proof
3. Transaction created with `isOffline = true`, `paymentSource = admin`
4. Admin manually confirms the payment

**Payment Notification Service:**
- `payment-notification.service.js` handles post-payment notifications to buyers
- WhatsApp and SMS messages sent via Kaleyra

**Webhook Log:**
- All gateway webhooks are logged in `payment_webhook_logs` table
- Provides audit trail for debugging payment discrepancies

**Overpayment Handling:**
- `overpaidAmount` field captures any amount paid in excess of what was due

---

### Domain 5: KYC Management

**Files:** `custom-submit-kyc.service.js`, `kyc-booking-pdf.service.js`

**KYC Process:**
1. After payment success, buyer completes KYC form
2. Documents uploaded to Azure Blob Storage
3. Documents synced to LeadSquared (LSQ) via file upload API
4. KYC PDF generated server-side using Puppeteer
5. PDF stored in Azure Blob Storage
6. Various activity flags updated in LSQ (booking token activity, booking form activity)

**Applicants Model:**
- One registration unit can have multiple applicants (primary + co-applicants)
- Each applicant has: name, DOB, PAN, Aadhaar, address, occupation, income
- Stored in `applicants` table with `registrationUnitId` FK

**KYC Status Tracking (all flags on RegistrationUnit):**
- `isKycSubmitted` — form data submitted
- `eVerificationCompleted` — OTP verification done
- `isKycPdfSubmitted` — PDF generated and stored
- `selfKycSubmitted` — self-service KYC form submitted
- `selfKycFinalSubmitted` — final confirmation
- `bookingTokenActivitySubmitted` — activity synced to LSQ
- `bookingFormActivitySubmitted` — booking form synced to LSQ
- `bookingActivitySubmitted` — booking activity synced to LSQ

**KYC Cron Job (`kyc-booking-pdf.cron.js`):**
- Periodically generates KYC PDFs for units where KYC is submitted but PDF not yet generated
- Ensures no KYC records are missed even if the real-time generation fails

---

### Domain 6: Milestone Payments

**Files:** `milestone-payment.controller.js`, `milestone-payment-tracking.model.js`, `registration-unit-payment-schedule.js`

**Milestone Payment Lifecycle:**
- After KYC, a payment schedule is created based on the selected payment plan
- Each schedule item becomes a milestone payment tracking record
- Buyer pays each milestone as construction progresses

**Payment Schedule Types (RegistrationUnitPaymentSchedule):**
- Construction-linked: Payments tied to specific construction stages
- Time-linked: Payments at fixed intervals
- Down payment: Large upfront, smaller trailing amounts

**Milestone Keys and Amount Types:**
| Milestone Key | Due Amount Type |
|---------------|----------------|
| ml-or / ml-ual | BOOKING_AMOUNT (fixed registration amount) |
| ml-hcf | FIRST_DEMAND_PAYMENT (first construction demand) |
| ml-rou | SDR (Stamp Duty and Registration charges) |
| ml-otdb | FIRST_DISBURSEMENT (home loan first disbursement) |
| Others | PERCENT (percentage of agreement value) |

**Payment Type Options:**
| Type ID | Description |
|---------|-------------|
| 1 | FULL_PRINCIPAL — Pay full principal amount |
| 2 | HALF_PRINCIPAL — Pay half the principal |
| 3 | GST_ONLY — Pay GST portion only |
| 4 | FULL_PRINCIPAL_GST — Pay principal + GST |
| 5 | HALF_PRINCIPAL_GST — Pay half principal + GST |

**MilestonePaymentTracking fields:**
- totalAmount: Full amount due
- totalPaid: Amount paid so far
- balanceAmount: Outstanding balance
- gstPaid: Boolean — is GST cleared
- status: pending / partial / paid
- paymentStatus: VERIFICATION / PAID

---

### Domain 7: Home Loan Processing

**Files:** `homeloan.controller.js`, `easiloan.service.js`, `registration-home-loan.model.js`

**Registration Home Loan Fields:**
- registrationId FK
- loanApprovalStatus (pending/approved/rejected/admin_rejected)
- Linked bank details
- Loan amount
- Disbursement tracking

**Easiloan Integration:**
- External API for home loan eligibility check
- Returns pre-approved loan offers from partner banks
- Buyer selects a bank offer
- Application is formally submitted

**Business Rules:**
- HOME_LOAN offer code is triggered when home loan process is completed
- If buyer opts out of Easiloan (has external sanction letter), `homeLoanOptedOut = true`
- Records with `loanApprovalStatus = admin_rejected` are hidden from admin's default customer view

---

### Domain 8: Offers Engine

**Files:** `offer.controller.js`, `offer.service.js`, `offer.model.js`

**Offer Structure:**
- name, description
- offerCode: HOME_LOAN or VC_REQUEST (system-triggered) or custom
- offerType: AMOUNT (rupee discount) or PERCENTAGE (% of unit value)
- amount / percentage (mutually exclusive based on offerType)
- startDate, endDate (validity window)
- isActive (can be deactivated without deleting)
- unitTypologyId (optional — typology-specific offer)

**Offer Application:**
- When a customer qualifies for an offer, a `RegistrationUnitOffer` record is created
- Links the offer to the specific registration unit
- Offer amount is reflected in the cost sheet

**Special Triggered Offers:**
- HOME_LOAN: Auto-applied when buyer completes home loan application
- VC_REQUEST: Applied when buyer completes a video call with an SM

---

### Domain 9: Callback Request System

**Files:** `callback-request.controller.js`, `callback-request.service.js`, `callback-request-sm.controller.js`

**Callback Request Flow:**
1. Buyer submits callback request (from buyer portal)
2. System assigns to available Sales Manager via **least-loaded algorithm** (round-robin disabled) <!-- FSD-CORRECTION 2026-05-25 // Source: callback-request-sm.service.js:338-349 -->
3. SM schedules meeting via SM Portal
4. Teams meeting auto-created (optional)
5. SM records outcome after call
6. Buyer submits feedback via token-based URL

**Assignment Algorithm:**
- Find all active SMs (`isActive = true`, `isAvailable = true`)
- Sort by `lastRequestAssignedAt` (oldest last assignment first)
- Assign to the SM with the oldest timestamp
- Update `lastRequestAssignedAt` for that SM

**CC Email:**
- Additional email addresses can be CC'd on meeting invites
- Stored as JSON array in `ccEmails`

---

### Domain 10: Support Ticket System

**Files:** `support-ticket.controller.js`, `support-ticket.service.js`, `os-ticket-api.service.js`

**Ticket Categories:**
- GENERAL
- CAR_PARKING
- CANCELLATION
- LOAN

**OS Ticket Integration:**
- External ticketing system (OS Ticket open-source)
- Backend creates tickets in OS Ticket via API
- Status and updates sync back from OS Ticket

---

### Domain 11: Channel Partner Management

**Files:** `admin-cp.controller.js`, `cp.controller.js`

**CP Registration Flow:**
1. CP registers with basic details
2. Admin reviews and approves/activates the CP
3. CP gets their unique XR code (hvCode)
4. CP can start referring buyers

**Broker Referral Status:**
- pending: CP referral submitted but not yet reviewed
- approved: CP's referral is active and tracked
- rejected: CP's referral was rejected

**Master CP / Member CP:**
- Master CP can have multiple Member CPs (sub-brokers)
- Commissions can be structured at both levels
- Member CP's transactions are associated with the Member CP's brokerId

---

### Domain 12: JBP Management

**Files:** (admin JBP routes), `jbp-cycles.model.js`, `jbp-submission.model.js`, `jbp-edit-request.model.js`

**JBP Cycle:**
- Admin creates cycles with start/end dates
- Status: OPEN (accepting submissions) or CLOSED

**JBP Submission:**
- CP submits business plan within open cycle
- Fields: manpower, investment range, marketing materials needed, digital channels, commitments
- Version tracking: each edit creates a new version (previous = EXPIRED, new = ACTIVE)
- Edit requires admin approval via edit request flow

---

### Domain 13: Parking Management

**Files:** `parking-inventory.model.js`, admin routes

**Parking Inventory:**
- Each parking slot is a separate record
- Status: AVAILABLE / HOLD / BOOKED
- Linked to a RegistrationUnit when allocated
- `holdAt` tracks temporary hold time
- Amount: price per parking slot

**Parking Selection:**
- `isParkingSelected` flag on RegistrationUnit
- `parkingCount` number of slots selected
- `parkingAmount` total cost per slot

**Business Rules:**
- Parking is separate from unit pricing
- Admin manages parking assignment (ADMIN_UPDATE_PARKING audit event)
- Parking slots can be HOLD during payment processing

---

## 5. Scheduled Automation (Cron Jobs)

| Cron File | Purpose |
|-----------|---------|
| `allocation-lsq-operations.cron.js` | Sync allocation events to LeadSquared |
| `allocation-payment-reconcile.cron.js` | Release expired 20-min payment holds |
| `kyc-booking-pdf.cron.js` | Generate missing KYC PDFs |
| `payment-reconcile.cron.js` | Reconcile pending payments with gateway |
| `physical-allocation-release-units.cron.js` | Release held units from physical events |
| `reconcile.cron.js` | General data reconciliation tasks |
| `self-kyc-lsq-update.cron.js` | Sync self-KYC status to LeadSquared |
| `tickerClock.cron.js` | Heartbeat/timing signals for real-time events |

---

## 6. Third-Party Integrations

### LeadSquared (LSQ)
**File:** `leadSquared.service.js`
- **Purpose:** CRM system for lead and activity tracking
- **Integration Type:** REST API
- **Key Operations:**
  - Create/update lead (customer prospect)
  - Create/update activities (registration, booking, KYC events)
  - Upload documents to LSQ
  - Sync payment activity records
- **Impact:** All major customer actions create activity records in LSQ for sales team visibility

### Mavis
**File:** `mavis.service.js`
- **Purpose:** ERP system for property booking management
- **Key Operations:**
  - Create booking record when unit is allocated
  - Update unit status in Mavis
  - Update booking to Final status after KYC
  - Fetch unit master data
- **Sync Flags:** `mavisBookingCreated`, `mavisUnitUpdated`, `mavisBookingFinalUpdated`

### Easiloan
**File:** `easiloan.service.js`
- **Purpose:** Home loan eligibility and bank offer platform
- **Key Operations:**
  - Check loan eligibility based on income data
  - Return pre-approved bank offers
  - Submit formal loan application

### Kaleyra (SMS and WhatsApp)
**Files:** `kaleyra.service.js`, `kaleyra-sms.service.js`, `kaleyra-whatsapp.service.js`, `whatsapp.service.js`
- **Purpose:** Customer communication platform
- **Key Operations:**
  - Send OTP for login
  - Send registration confirmation
  - Send allocation success/failure notifications
  - Send payment reminders

### Azure Blob Storage
**File:** `azure-blob.service.js`
- **Purpose:** Document and file storage
- **Key Operations:**
  - Upload KYC documents
  - Store generated KYC PDFs
  - Store payment proofs
  - Serve images for units and project

### Python Allocation Service
**File:** `python.service.js`
- **Purpose:** Sync payment status with the WebSocket/allocation server
- **Operations:** Update payment status after gateway webhook confirms payment

### Microsoft Teams
**File:** `teams.service.js`
- **Purpose:** Auto-create meeting links for callback requests
- **Operations:** Create Teams meeting, store meeting ID and link

### OS Ticket
**File:** `os-ticket-api.service.js`
- **Purpose:** External support ticket system
- **Operations:** Create and sync support tickets

### Strapi CMS
**File:** `strapi.service.js`
- **Purpose:** Fetch CMS content for portals
- **Operations:** Retrieve project content, form definitions, allocation page configuration

### Xanadu/Internal Services
**File:** `xanadu.service.js`
- **Purpose:** Internal XR-specific service calls

---

## 7. Database Models Summary

| Model | Table | Purpose |
|-------|-------|---------|
| User | users | All users (buyers, CPs, SMs, admins) |
| Role | roles | Role definitions (1-5) |
| Permission | permissions | Feature-level permissions |
| RolePermission | role_permissions | Role-to-permission mapping |
| Project | projects | Real estate project |
| Tower | towers | Tower inventory |
| Floor | floors | Floor within a tower |
| Unit | units | Individual unit inventory |
| TowerUnitDetail | tower_unit_details | Tower-level unit summary |
| UnitTypology | unit_typologies | LSQ typology mapping |
| TypologyMaster | typologies | Typology definitions with area specs |
| TypologyMilestone | typology_milestones | Payment milestones per typology |
| Registration | registrations | Buyer registration records |
| RegistrationDraft | registration_drafts | Incomplete registrations |
| RegistrationUnit | registration_units | Allocated unit per registration |
| RegistrationPreference | registration_preferences | Buyer's preferred unit choices |
| RegistrationUnitOffer | registration_unit_offers | Offers applied to a unit |
| RegistrationUnitPaymentSchedule | reg_unit_payment_schedules | Payment schedule for a unit |
| RegistrationHomeLoan | registration_home_loans | Home loan tracking |
| Applicant | applicants | KYC applicant details |
| AllocationCampaign | allocation_campaigns | Allocation event |
| AllocationCampaignUnit | allocation_campaign_units | Units in a campaign |
| AllocationBatch | allocation_batches | Batch operations |
| DynamicRound | dynamic_rounds | Round tracking for DYNAMIC campaigns |
| InitialAllotment | initial_allotments | Winner record (unit + registration) |
| LostUnitHistory | lost_unit_history | DYNAMIC: history of missed units |
| ParkingInventory | parking_inventory | Parking slot inventory |
| PaymentTransaction | payment_transactions | All payment transactions |
| PaymentTransactionType | payment_transaction_types | Transaction type definitions |
| PaymentIntent | payment_intents | Pre-payment intent records |
| PaymentLink | payment_links | Generated payment links |
| PaymentRefund | payment_refunds | Refund tracking |
| PaymentWebhookLog | payment_webhook_logs | Gateway webhook audit log |
| PaymentGateway | payment_gateways | Gateway configuration |
| MilestonePaymentTracking | milestone_payment_tracking | Construction payment milestones |
| MasterConfig | master_configs | Key-value system configuration |
| Offer | offers | Discount offers |
| CallbackRequest | callback_requests | Customer callback/VC requests |
| CallbackRequestFeedback | callback_request_feedbacks | SM/buyer feedback |
| JbpCycle | jbp_cycles | JBP planning cycles |
| JbpSubmission | jbp_submissions | CP business plan submissions |
| JbpEditRequest | jbp_edit_requests | Edit requests for JBP submissions |
| WalkInSource | walk_in_sources | Customer walk-in source types |
| UserScore | user_scores | CP/SM scoring/ranking data |
| SupportTicket | support_tickets | Customer support tickets |
| AuditLog | audit_logs | Admin action audit trail |
| Action | actions | Action type definitions |
| Module | modules | System module definitions |

---

## 8. Data Configuration System (MasterConfig)

**Table:** `master_configs`

A flexible key-value store for system-wide configuration:
- **key**: Unique identifier for the configuration item
- **dataType**: string / number / boolean / json / date / datetime / array / object
- **value fields**: valueJson, valueText, valueNumber, valueBoolean, valueDatetime (one is populated based on dataType)
- **projectId**: Optional — project-specific configuration
- **description**: Human-readable description

Used for:
- Feature flags
- System-wide settings
- Project-specific parameters
- Allocation configuration values

---

## 9. Audit Logging System

**Table:** `audit_logs`

All sensitive admin actions are logged with:
- Action type (from `auditActions` constants)
- User who performed the action
- Timestamp
- Before/after values
- Associated record IDs

---

## 10. Export Functionality

**Files:** `export.controller.js`, `export.service.js`, `allocation-campaign.export.js`

- Admin can export allocation campaign data to Excel/CSV
- Export format: XLSX using ExcelJS
- Data includes registration details, unit assignments, payment status

---

## 11. Business Rules Summary

1. **No Duplicate Registration:** One active registration per buyer per project
2. **Hold Timer:** 20 minutes maximum for unit hold during payment
3. **Refund Exclusion:** Refunded registrations are soft-excluded from default queries
4. **Audit Everything:** All admin actions create audit log records
5. **Soft Deletes:** All major entities use `deletedAt` (paranoid mode) — no hard deletes
6. **Gateway Fallback:** System supports both Easebuzz and Razorpay
7. **Offline Payment:** Admin can record offline payments with proof uploads
8. **Real-time Sync:** After payment completion, Redis and DB must both be updated
9. **KYC Before Milestone:** Payment schedule is created only after KYC submission
10. **LSQ Activity:** Every major customer action creates an activity in LeadSquared CRM
