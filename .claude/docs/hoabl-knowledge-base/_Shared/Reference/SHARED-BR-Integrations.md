---
**Type:** Integration Reference
**Last Updated:** 2026-05-11
**Tags:** #integrations #third-party #status/complete
---

## Related Notes
- [[Backend-Functional-BRD]]
- [[Buyer-Portal-BRD]]
- [[Admin-Portal-BRD]]

---

## Integration Overview

| System                    | Type          | Direction     | Purpose                               |
| ------------------------- | ------------- | ------------- | ------------------------------------- |
| LeadSquared (LSQ)         | CRM           | Outbound      | Lead and activity tracking            |
| Mavis                     | ERP           | Bidirectional | Unit booking and inventory sync       |
| Easebuzz                  | Payment       | Outbound      | Primary payment gateway               |
| Razorpay                  | Payment       | Outbound      | Secondary payment gateway             |
| Easiloan                  | FinTech       | Bidirectional | Home loan eligibility and application |
| Azure Blob Storage        | Cloud Storage | Bidirectional | Document and file storage             |
| Kaleyra                   | Communication | Outbound      | WhatsApp messaging (NOT OTP)          |
| Epinet                    | Communication | Outbound      | OTP SMS delivery for all portals      |
| Microsoft Teams           | Collaboration | Outbound      | Meeting link generation               |
| OS Ticket                 | Support       | Bidirectional | Support ticket management             |
| Strapi CMS                | Content       | Inbound       | Dynamic content and configuration     |
| Python Allocation Service | Internal      | Bidirectional | Real-time allocation state sync       |
| Redis                     | Cache         | Bidirectional | Real-time event state management      |
| Nurix                     | Communication | Embedded      | In-portal calling widget              |

---

## 1. LeadSquared (LSQ)

**Type:** CRM (Customer Relationship Management)
**File:** `src/services/api/leadSquared.service.js`
**Direction:** Backend → LSQ (mostly outbound)
**Auth:** `accessKey` + `secretKey` as query params on every request

---

### 1.1 Lead API Calls

| Function | LSQ Endpoint | HTTP | Trigger | Data Sent |
|----------|-------------|------|---------|-----------|
| `captureLead` | `LeadManagement.svc/Lead.Capture` | POST | New user mobile OTP registration; new CP registration; re-registration attempt | Name, phone, email, source, UTM params |
| `updateLead` | `LeadManagement.svc/Lead.Update` | POST | After KYC submission; after unit assignment; after final booking confirmed | Updated lead fields (stage, status, custom fields) |
| `getLeadById` | `LeadManagement.svc/Leads.GetById` | GET | Fetch lead details during registration sync checks | `id` = prospectId |
| `searchLeads` | `LeadManagement.svc/Leads.Search` | POST | Lookup existing lead by phone/email before creating duplicate | Search criteria object |
| `getLeadActivities` | `LeadManagement.svc/Leads.GetActivities` | GET | Fetch activity history for a lead | `leadId`, optional filter options |

---

### 1.2 Activity API Calls

| Function | LSQ Endpoint | HTTP | Trigger | Activity Type / Data Sent |
|----------|-------------|------|---------|--------------------------|
| `createActivity` | `ProspectActivity.svc/Create` | POST | Registration payment success (transactionType 1) | Registration activity — amount paid, registration number, project details |
| `createActivityV2` | `ProspectActivity.svc/Create` | POST | Allocation payment success — booking token created (WINNER status) | Booking token activity — unit number, tower, floor, booking amount, confirmation number |
| `createActivityV2` | `ProspectActivity.svc/Create` | POST | KYC submitted + all prior flags true — booking form activity (if first time) | Booking form activity — all applicant details, KYC fields, loan type |
| `createActivityV2` | `ProspectActivity.svc/Create` | POST | Booking form activity done — booking final activity (if first time) | Booking final activity — complete booking confirmation data |
| `updateActivityV2` | `ProspectActivity.svc/CustomActivity/Update` | POST | KYC re-submitted / booking form updated (if `lsqBookingFormActivityId` already set) | Updated booking form fields |
| `updateActivityV2` | `ProspectActivity.svc/CustomActivity/Update` | POST | Booking activity update (if `lsqBookingActivityId` already set) | Updated booking confirmation data |

**Activity ID fields on RegistrationUnit:**

| DB Field | LSQ Activity | Set When |
|----------|-------------|---------|
| `bookingTokenActivitySubmitted` | Booking Token activity | Allocation payment confirmed |
| `lsqBookingFormActivityId` | Booking Form activity ID | KYC submitted |
| `bookingFormActivitySubmitted` | Booking Form submitted flag | KYC submitted |
| `lsqBookingActivityId` | Booking final activity ID | Final booking stage |
| `bookingActivitySubmitted` | Booking Activity flag | Final booking stage |

---

### 1.3 Opportunity API Calls

| Function | LSQ Endpoint | HTTP | Trigger | Data Sent |
|----------|-------------|------|---------|-----------|
| `captureOpportunity` | `OpportunityManagement.svc/Capture` | POST | New user OTP registration — creates new opportunity; Registration payment confirmed — links opportunity to registration | prospectId, project, amount, registration number |
| `updateOpportunity` | `OpportunityManagement.svc/Update` | POST | Registration record updated (e.g., home loan status change, SM assignment) | opportunityId + updated fields |
| `getOpportunityDetails` | `OpportunityManagement.svc/GetOpportunityDetails` | GET | Fetch opportunity for sync checks / reconciliation | `OpportunityId` |

**Opportunity ID fields on Registration:**

| DB Field | Description |
|----------|-------------|
| `opportunityId` | LSQ Opportunity GUID stored on Registration record |
| `activityId` | LSQ Registration activity ID stored on Registration record |

---

### 1.4 Document API Calls

| Function | LSQ Endpoint | HTTP | Trigger | Data Sent |
|----------|-------------|------|---------|-----------|
| `uploadFile` | `File/Upload` | POST multipart | KYC submission — uploads Aadhaar front, Aadhaar back, PAN, photo to LSQ prospect | `FormData` with file buffer + `prospectId` + `accessKey` + `secretKey` |
| `getFileDetail` | `LeadManagement.svc/GenerateUrlsForProspectDocument` | POST | Retrieve download URLs for previously uploaded KYC documents | `prospectId` + document type filter |

---

### 1.5 LSQ Identifiers Summary

| Identifier | Stored On | Purpose |
|-----------|----------|---------|
| `prospectId` | User model | LSQ lead identifier — links XR user to LSQ lead |
| `opportunityId` | Registration model | LSQ opportunity — tracks sales pipeline per registration |
| `activityId` | Registration model | LSQ registration activity ID |
| `lsqBookingActivityId` | RegistrationUnit model | Booking final activity ID |
| `lsqBookingFormActivityId` | RegistrationUnit model | Booking form (KYC) activity ID |

---

### 1.6 LSQ Failure Handling

- All LSQ calls are wrapped in try/catch; failures are logged but do NOT block buyer-facing flows
- Boolean flags (`bookingTokenActivitySubmitted`, `bookingFormActivitySubmitted`, `bookingActivitySubmitted`) are set to `false` on failure
- Cron `allocation-lsq-operations.cron.js` retries all failed operations every 10 minutes in dependency order

---

## 2. Mavis (ERP)

**Type:** Property ERP System
**File:** `src/services/api/mavis.service.js`
**Direction:** Bidirectional (XR Portal ↔ Mavis)
**Auth:** `x-api-key` header on every request

---

### 2.1 Unit API Calls

| Function | Mavis Endpoint (table) | HTTP | Trigger | Data Sent / Returned |
|----------|----------------------|------|---------|---------------------|
| `findUnitRowId` | `tab20220610104541354` (Units) | POST query | Before updating unit status — find Mavis rowId by unit identifier | Filter by unit ID/name → returns `mv_RowId` |
| `updateMavisUnitStatus` | `tab20220610104541354` (Units) | PUT | After booking token activity submitted — mark unit as `Booked` in Mavis inventory | `rowId`, `status = 'Booked'`, `opportunityId` |
| `fetchAllocationByOpportunity` | `tab20250904112424740` (Allocation) | POST query | Allocation verification / reconciliation by opportunity+batch | Returns allocation rows with unit, tower, floor, status, booking ID |

---

### 2.2 Booking API Calls

| Function | Mavis Endpoint (table) | HTTP | Trigger | Data Sent |
|----------|----------------------|------|---------|-----------|
| `insertMavisBooking` | `tab20220718013529562` (Bookings) | POST | Allocation payment confirmed (WINNER) — create booking record in Mavis | opportunityId, transactionId, bookingDate, unitId, towerId, bookingId, bookingAmount, agreementValue, GST, stampDuty, registrationCharges, numberOfParking, finalAgreementValue, finalUnitValue, applicationNumber, scheduleIds |
| `findBookingRowId` | `tab20220718013529562` (Bookings) | POST query | Before updating booking — find Mavis rowId by bookingId filter | Filter → returns `mv_RowId` |
| `updateBooking` | `tab20220718013529562` (Bookings) | PUT | After KYC final submission — update booking progress status; admin offline booking updates | `rowId` + `Data` array of column updates |

**Booking status values written to Mavis:**

| Stage | Value written to `Booking_Progress_Status` |
|-------|------------------------------------------|
| Allocation payment confirmed | `Booking Token` |
| KYC submitted (booking form) | `Booking Form Submitted` (via updateBooking) |
| Booking final activity done | `Booking` (via updateBooking) |

---

### 2.3 Milestone / Payment Schedule API Calls

| Function | Mavis Endpoint (table) | HTTP | Trigger | Data Sent |
|----------|----------------------|------|---------|-----------|
| `fetchPaymentSchedules` | `tab20220624021833445` (Payment Schedules) | POST query | Fetch payment schedule templates for a booking | Filter by schedule criteria |
| `fetchMilestones` | `tab20220624025336139` (Milestones) | POST query | Fetch milestone list for a booking | Filter payload |
| `findMilestoneRowId` | `tab20220624025336139` (Milestones) | POST query | Before updating a milestone — find rowId | Filter → returns `mv_RowId` |
| `insertMavisMilestone` | `tab20220624025336139` (Milestones) | POST | At booking creation — insert full milestone schedule into Mavis | Array of milestones: milestoneId, scheduleId, title, sequence, amount, dueAmountType, paid, finalDate |
| `updateMavisMilestone` | `tab20220624025336139` (Milestones) | PUT | After milestone payment confirmed — mark milestone as paid | `RowIds[]` + `Data` array |
| `insertMavisMilestonePayment` | `tab20260212115549451` (Milestone Payments) | POST | After milestone payment confirmed — create payment record in Mavis | bookingId, unitMilestoneId, scheduleId, milestoneTitle, unitId, towerId, principalAmount, gstAmount, paymentMode, dateOfPayment, transactionRef |

---

### 2.4 Utility API Calls

| Function | Mavis Endpoint | HTTP | Trigger | Data |
|----------|--------------|------|---------|------|
| `fetchPincodeDetails` | `tab20240528040952715` (Pincode) | POST query | KYC address lookup — user enters pincode | Returns: Suburb, District, Zone, State, Country |

---

### 2.5 Mavis Sync Flags on RegistrationUnit

| Flag | Type | Meaning |
|------|------|---------|
| `mavisBookingCreated` | BOOLEAN (nullable) | NULL = not attempted; TRUE = success; FALSE = failed |
| `mavisUnitUpdated` | BOOLEAN (nullable) | NULL = not attempted; TRUE = unit status updated in Mavis; FALSE = failed |
| `mavisBookingFinalUpdated` | BOOLEAN (nullable) | NULL = not attempted; TRUE = booking marked final; FALSE = failed |

Cron `allocation-lsq-operations.cron.js` retries all FALSE flags every 10 minutes.

---

### 2.6 Mavis Booking ID Env Prefix

Booking IDs sent to Mavis are prefixed by environment to avoid collision:

| Env | Prefix Example |
|-----|---------------|
| `development` | `D<bookingId>` |
| `uat` | `U<bookingId>` |
| `production` | `<bookingId>` (no prefix) |

---

## 3. Easebuzz (Payment Gateway)

**Type:** Payment Gateway
**File:** `easebuzz.service.js`, `config/easebuzz.config.js`
**Direction:** Bidirectional (initiate + receive webhook)

**Flow:**
1. Backend creates payment hash using Easebuzz algorithm
2. Buyer is redirected to Easebuzz checkout
3. Buyer pays via CC/DC/UPI/NB/Wallet/EMI
4. Easebuzz sends webhook to backend
5. Backend validates hash and updates transaction status

**Hash Validation:** Uses HMAC SHA-512 for payment hash verification

**Payment Methods Supported:**
- CC (Credit Card)
- DC (Debit Card)
- UPI
- NB (Net Banking)
- MW (Mobile Wallet)
- EMI

**Configuration:** API key, secret, and hash key from environment variables

---

## 4. Razorpay (Payment Gateway)

**Type:** Payment Gateway
**File:** `razorpay.service.js`, `config/razorpay.config.js`
**Direction:** Bidirectional

**Flow:**
1. Backend creates Razorpay order (stores `gatewayOrderId`)
2. Frontend uses Razorpay SDK to initiate payment
3. Payment completed on Razorpay side
4. Razorpay sends webhook to backend
5. Backend verifies signature and updates transaction

**Unique Feature:** Razorpay uses order-based flow (vs. Easebuzz's hash-based redirect)

---

## 5. Easiloan (Home Loan Platform)

**Type:** FinTech / Loan Marketplace
**File:** `easiloan.service.js`
**Direction:** Bidirectional

**Flow:**
1. Buyer enters employment and income details
2. Backend calls Easiloan eligibility API
3. Easiloan returns pre-approved loan offers from partner banks
4. Buyer selects preferred bank/offer
5. Formal application submitted to Easiloan
6. Easiloan tracks application progress

**Business Impact:**
- Completing Easiloan flow may trigger the HOME_LOAN offer discount on the unit
- Bank selection stored in `homeLoanBankSelected` JSON field on User

---

## 6. Azure Blob Storage

**Type:** Cloud File Storage
**File:** `azure-blob.service.js`, `config/azure.js`
**Direction:** Bidirectional (upload and download)

**What is Stored:**
- KYC documents (Aadhaar front/back, PAN, photos)
- Generated KYC PDFs
- Payment proof images (offline payments)
- Unit images
- Project images
- Tower images

**Naming Convention:**
- Documents organized by user ID and document type
- `documents.phoneQrCode` on User model stores the blob path

**Business Impact:**
- Central document repository for all regulatory and legal documents
- Documents are accessed by both admin and backend for LSQ uploads

---

## 7. Kaleyra (WhatsApp — NOT OTP)

<!-- FSD-CORRECTION 2026-05-25 -->
> **OTP SMS is NOT sent via Kaleyra.** Kaleyra imports are commented out in `communication.service.js:8-9`. OTP delivery uses **Epinet** (see §7a below). // Source: communication.service.js; auth.controller.js

**Type:** Communication Platform
**Files:** `kaleyra.service.js`, `kaleyra-sms.service.js`, `kaleyra-whatsapp.service.js`, `whatsapp.service.js`
**Direction:** Outbound

**Triggered Communications:**

| Event | Channel | Recipient |
|-------|---------|----------|
| ~~OTP for login~~ | ~~SMS / WhatsApp~~ | ~~Buyer/CP~~ — **CORRECTED: Epinet, not Kaleyra** |
| Registration confirmation | WhatsApp | Buyer |
| Allocation event start | WhatsApp | All eligible buyers |
| Unit allocation success | WhatsApp / SMS | Winning buyer |
| Payment failure | SMS | Buyer |
| KYC submitted | WhatsApp | Buyer |
| Callback scheduled | WhatsApp | Buyer |

**Templates:** WhatsApp messages use pre-approved templates (required by WhatsApp Business API)

---

## 7a. Epinet (OTP SMS)

<!-- FSD-CORRECTION 2026-05-25 -->
**Type:** SMS Gateway
**Files:** `communication.service.js`
**Direction:** Outbound
**Endpoint:** `https://epinetinfo.in/api/pushsms`
**Sender ID:** `THOAL`
**Auth:** Hardcoded API key in `communication.service.js:8-9`

**Triggered Communications:**

| Event | Channel | Recipient |
|-------|---------|----------|
| OTP for login | SMS | Admin, SM, Buyer, CP |

// Source: communication.service.js; auth.controller.js

---

## 8. Microsoft Teams

**Type:** Collaboration Platform
**File:** `teams.service.js`, `config/teams.js`
**Direction:** Outbound

**Purpose:** Auto-generate Microsoft Teams meeting links for scheduled video calls between Sales Managers and buyers.

**Data Stored:**
- `meetingLink`: Shareable meeting URL stored on CallbackRequest
- `teamsMeetingId`: Teams-specific meeting identifier for tracking/cancellation
- `meetingDetails`: Full meeting JSON (participants, timing, etc.)

**Business Impact:**
- Eliminates manual meeting link creation
- Meeting links are automatically included in buyer notification messages

---

## 9. OS Ticket

**Type:** Support Ticketing System
**File:** `os-ticket-api.service.js`
**Direction:** Bidirectional

**Purpose:** External open-source ticketing system for managing buyer support requests.

**Flow:**
1. Buyer creates a ticket in the Buyer Portal
2. Backend creates a corresponding ticket in OS Ticket via API
3. Support team manages tickets in OS Ticket
4. Status updates sync back to the XR Portal

---

## 10. Strapi CMS

**Type:** Headless CMS
**File:** `strapi.service.js`
**Direction:** Inbound (backend fetches from Strapi)

**What is Fetched:**
- Project content (about, gallery, amenities, documents)
- Registration and KYC form field configuration
- Allocation page configuration (hero slides, messages)
- Band configuration for DYNAMIC allocation
- Steps master (multi-step form definitions)

**Authentication:** API token in request header

**Caching:** Backend may cache Strapi responses

---

## 11. Python Allocation Service (Internal)

**Type:** Internal microservice
**File:** `python.service.js`
**Direction:** Outbound (Node.js → Python WebSocket server)

**Purpose:** After a payment gateway webhook is processed by the Node.js backend, the backend notifies the Python WebSocket server to update Redis state and broadcast to connected buyers.

**Key Calls:**
- `/update-payment-status` — After payment confirmed/failed
- `/broadcast-registrations` — After registration data changes
- `/units/status-sync` — After admin updates unit reservations
- `/broadcast-towers` — After tower data changes
- `/campaign/start` — After admin starts a campaign
- `/campaign/stop` — After admin stops a campaign

---

## 12. Redis

**Type:** In-memory Cache
**File:** `redis.service.js`, `config/redis.js`
**Direction:** Bidirectional

**Usage:**
- Real-time unit status during allocation events (sub-millisecond reads)
- Registration data cache during campaigns
- Hold timer management
- Campaign status and round management
- User connection state (WebSocket server)
- Message queuing (optional, via Bull)

**Key Business Reason:** Relational database cannot serve thousands of concurrent buyers in real-time during an allocation event — Redis provides the necessary throughput

---

## 13. Queue System (Bull + Redis)

**File:** `queue.service.js`, `config/queue.js`
**Direction:** Internal

**Purpose:** Background job processing for operations that can be deferred:
- LSQ activity submissions
- Mavis sync operations
- Communication sends
- PDF generation

**Business Impact:** Prevents blocking user-facing operations with slow third-party API calls

---

## 14. Cron Jobs

All cron jobs run on `Asia/Kolkata` timezone. All use a `running` guard to prevent concurrent tick overlap.

---

### 14.1 `allocation-lsq-operations.cron.js`

**Schedule:** Every 10 minutes (`*/10 * * * *`)
**File:** `src/cron/allocation-lsq-operations.cron.js`
**Purpose:** Retry failed post-allocation LSQ and Mavis sync operations

Runs 6 steps **in order** (each step depends on previous):

| Step | Function | Condition | Action |
|------|----------|-----------|--------|
| 1 | `processPendingBookingTokenActivities` | `status = WINNER` AND `bookingTokenActivitySubmitted = false` | Submit LSQ booking token activity (`createActivityV2`) |
| 2 | `processPendingMavisBookings` | `bookingTokenActivitySubmitted = true` AND `mavisBookingCreated = false` | Create Mavis booking (`insertMavisBooking`) |
| 3 | `processPendingUnitUpdates` | `bookingTokenActivitySubmitted = true` AND `mavisUnitUpdated = false` | Update unit status in Mavis to `Booked` (`updateMavisUnitStatus`) |
| 4 | `processPendingBookingFormActivities` | `isKycSubmitted = true` AND all prior flags true AND `bookingFormActivitySubmitted = false` | Submit LSQ booking form activity (create or update) |
| 5 | `processPendingBookingActivities` | `bookingFormActivitySubmitted = true` AND `bookingActivitySubmitted = false` | Submit LSQ booking final activity (create or update) |
| 6 | `processPendingFinalUpdates` | `bookingFormActivitySubmitted = true` AND `mavisBookingCreated = true` AND `mavisBookingFinalUpdated = false` | Update Mavis booking to final status (`updateBooking`) |

Batch limit: 20 per step. 1-second delay between items.

**DB updates on success:**
- Sets respective boolean flag to `true` on `RegistrationUnit`
- Stores LSQ activity IDs (`lsqBookingFormActivityId`, `lsqBookingActivityId`) on `RegistrationUnit`

---

### 14.2 `allocation-payment-reconcile.cron.js`

**Schedule:** Every 5 minutes (`*/5 * * * *`)
**File:** `src/cron/allocation-payment-reconcile.cron.js`
**Purpose:** Safety net for Easebuzz allocation payments where webhook was missed

**Condition:** `PaymentTransaction` where:
- `transactionType = 2` (allocation)
- `gateway = 'easebuzz'`
- `status` NOT IN `[completed, failed, cancelled, bounced]`
- `createdAt` between 15 minutes and 6 hours ago

**Action:** Calls `checkAndProcessAllocationByReferenceService(referenceNo)` — re-checks payment status with Easebuzz gateway and processes if successful.

**DB updates on success:**
- Updates `PaymentTransaction.status` to `completed`
- Triggers full post-payment allocation flow (unit assignment, LSQ activities, Mavis sync)

---

### 14.3 `kyc-booking-pdf.cron.js`

**Schedule:** Every 10 minutes (`*/10 * * * *`)
**File:** `src/cron/kyc-booking-pdf.cron.js`
**Purpose:** Generate KYC booking PDFs for registrations that have completed KYC but PDF not yet generated

**Action:** Calls `cronPdfGenerationJob()` in `kyc-booking-pdf.service.js`

**DB updates on success:**
- Sets `isKycPdfSubmitted = true` on `RegistrationUnit`
- Stores PDF blob path on the record
- Uploads generated PDF to Azure Blob Storage

---

### 14.4 `payment-reconcile.cron.js`

**Schedule:** Every 5 minutes (`*/5 * * * *`)
**File:** `src/cron/payment-reconcile.cron.js`
**Purpose:** Reconcile pending milestone payments (all transaction types EXCEPT 1 and 2)

**Condition:** `PaymentTransaction` where:
- `transactionType` NOT IN `[1, 2]` (milestone payments, HCF, etc.)
- `status` NOT IN `[completed, failed, cancelled, bounced]`
- `createdAt` between 15 minutes and 6 hours ago

**Action:** Calls `processMilestoneReconciliation(referenceNo)` — re-checks payment status and processes if successful.

**DB updates on success:**
- Updates `PaymentTransaction.status` to `completed`
- Inserts milestone payment record in Mavis (`insertMavisMilestonePayment`)
- Updates milestone status in Mavis (`updateMavisMilestone`)
- Updates `RegistrationUnitPaymentSchedule` record as paid

---

### 14.5 `physical-allocation-release-units.cron.js`

**Schedule:** Every 1 minute (`*/1 * * * *`)
**File:** `src/cron/physical-allocation-release-units.cron.js`
**Purpose:** Release HOLD units in physical allocation events that have been on hold past 20 minutes

**Condition:** `RegistrationUnit` where:
- `status = 'HOLD'`
- `holdAt < now - 20 minutes`
- `unitId IS NOT NULL`

**Action:** Calls `updateUnitStatus(null, units, 'RELEASE')` in `physical-event-allocation.service.js`

**DB updates on success:**
- Sets `RegistrationUnit.status` back to available state
- Releases unit in Redis via Python service sync

---

### 14.6 `reconcile.cron.js`

**Schedule:** Every 15 minutes (`*/15 * * * *`)
**File:** `src/cron/reconcile.cron.js`
**Purpose:** Reconcile pending and stuck registration payments (transactionType 1 only)

**Two pass strategy:**
1. **Pending payments pass** — finds `transactionType = 1` transactions with non-final status, 16 min–6 hr old
2. **Completed payment backfill pass** — finds `Registration` records where `paymentStatus != success` but a `completed` transaction exists and no `RegistrationUnit` was created (handles race condition where webhook processed but DB write failed)

**Action:** Calls `reconcileByReferenceNo({ referenceNo, ... })` in `registration.controller.js`

**DB updates on success:**
- Updates `Registration.paymentStatus` to `success`
- Creates `RegistrationUnit` record
- Fires LSQ opportunity capture (`captureOpportunity`)
- Fires LSQ registration activity (`createActivity`)
- Sends WhatsApp confirmation to buyer

---

### 14.7 `self-kyc-lsq-update.cron.js`

**Schedule:** Every 15 minutes (`*/15 * * * *`)
**File:** `src/cron/self-kyc-lsq-update.cron.js`
**Purpose:** Process self-KYC LSQ updates for buyers who completed unit selection but are going through self-service KYC (not formal admin KYC flow)

**Condition:** `RegistrationUnit` where:
- `isKycSubmitted = false`
- `unitId IS NOT NULL`
- `bookingTokenActivitySubmitted = true`
- ANY of: `selfKycSubmitted = false` OR `selfKycBookingActivitySubmitted = false` OR `selfKycFinalSubmitted = false`

**Action:** Calls `processSelfKycUnit(regUnit)` in `custom-submit-kyc.service.js`

**DB updates on success:**
- Sets `selfKycSubmitted`, `selfKycBookingActivitySubmitted`, `selfKycFinalSubmitted` to `true`
- Submits / updates LSQ activities for self-KYC track
- Attempts Mavis booking final update if not already done

---

### 14.8 `tickerClock.cron.js`

**Schedule:** Every 30 seconds (`*/30 * * * * *`)
**File:** `src/cron/tickerClock.cron.js`
**Purpose:** Heartbeat counter — increments `Project.tickerClock` field each tick

**Condition:** Project with `id = 1` (prod) or `id = 2` (non-prod)

**DB updates:**
- Increments `Project.tickerClock` by 1 each tick
- Used by the buyer portal frontend to detect backend liveness / force page refresh

---

### Cron Summary Table

| Cron File | Schedule | Purpose | Key DB Writes |
|-----------|----------|---------|---------------|
| `allocation-lsq-operations` | Every 10 min | Retry failed LSQ + Mavis post-allocation | RegistrationUnit flags, LSQ activity IDs |
| `allocation-payment-reconcile` | Every 5 min | Reconcile missed Easebuzz allocation webhooks | PaymentTransaction.status → completed |
| `kyc-booking-pdf` | Every 10 min | Generate KYC booking PDFs | RegistrationUnit.isKycPdfSubmitted |
| `payment-reconcile` | Every 5 min | Reconcile pending milestone payments | PaymentTransaction.status, Mavis milestone payment |
| `physical-allocation-release-units` | Every 1 min | Release expired HOLD units (20-min threshold) | RegistrationUnit.status → released |
| `reconcile` | Every 15 min | Reconcile stuck registration payments | Registration.paymentStatus, RegistrationUnit created |
| `self-kyc-lsq-update` | Every 15 min | Self-KYC LSQ sync for self-service KYC track | selfKyc* flags, LSQ activities |
| `tickerClock` | Every 30 sec | Backend liveness heartbeat | Project.tickerClock +1 |
