# Business Rules Reference

**Type:** Business Rules
**Last Updated:** 2026-05-10
**Tags:** #business-rules #domain/all #status/complete

---

## Related Notes
- [[Admin-Portal-BRD]]
- [[Backend-Functional-BRD]]
- [[Allocation-Workflow]]
- [[Unit-Status-Flow]]
- [[Roles-and-Permissions]]

---

## Overview

This document captures all confirmed business rules extracted from the XR Portal source code. Rules are organized by domain area. Each rule includes the governing condition, the enforced behavior, and the system layer where enforcement happens.

---

## 1. Registration Rules

### REG-001: One Active Registration Per Project
A buyer may have multiple registrations in the system, but only one may be in `status=Open` or `status=Won` per project at any given time. Duplicate active registrations are prevented at the service layer.

### REG-002: Payment Required Before Allocation
A registration's `paymentStatus` must be `success` before the buyer becomes eligible for allocation. Buyers whose payment is still `pending` or `failed` are excluded from campaigns.

### REG-003: Registration Default Scope Excludes Refunds
All standard database queries for registrations automatically exclude records with `status=Refund`. The `withRefunded` scope must be explicitly used when refunded records need to be visible (e.g., admin reconciliation views).

### REG-004: Allocation Eligibility Flag
The `availableForAllocation` boolean on each registration is the master eligibility switch. Even if `paymentStatus=success`, a buyer can be excluded from a campaign by setting this flag to false. Admin can control this.

### REG-005: Registration Payment Gateway — Easebuzz Default
Registration payments use Easebuzz as the default gateway. Legacy records may have `gateway=eazypay` which the system normalizes to Easebuzz behavior.

---

## 2. Unit Status Rules

### UNIT-001: Hold Duration — Exactly 20 Minutes
When a buyer initiates payment for a unit, the unit moves to HOLD status. The hold is valid for exactly 20 minutes from the `holdAt` timestamp. If payment is not confirmed within 20 minutes, the unit automatically reverts to AVAILABLE.

### UNIT-002: Cron Job Enforces Hold Expiry
A background cron job periodically scans for registration units in HOLD status where `holdAt` is more than 20 minutes ago. It calls `resetUnitStatuses()` which:
1. Releases the parking inventory (if any was reserved with the unit)
2. Resets the registration unit status to ALLOCATED (for DYNAMIC) or WAITLIST (for STATIC)
3. Resets the unit master record to AVAILABLE
4. Notifies the WebSocket server so the live heatmap updates

### UNIT-003: Double-Allocation Prevention
A unit in HOLD or BOOKED status cannot be allocated to another buyer. The WebSocket server checks unit availability in Redis before placing a hold. Any concurrent request for the same unit is rejected with an error response.

### UNIT-004: REFUGE Units Are Permanently Off Market
Units with status REFUGE cannot be transitioned to any other status through normal business flows. REFUGE is a permanent designation applied by admin for operational reasons (e.g., model apartments, utility spaces).

### UNIT-005: Unit Swap Blocked During Active Campaign
Admin cannot perform a unit swap between two customers while an active allocation campaign is running. The system checks `AllocationCampaignService.checkAnyActiveCampaignExists()` and rejects the swap if a campaign is live.

### UNIT-006: Parking Released With Unit
When a unit hold expires or payment fails, any parking inventory that was reserved alongside that unit is also released back to AVAILABLE status in the same transaction.

---

## 3. Pricing Rules

### PRICE-001: Net Unit Price Calculation
The full price of a unit is calculated as:

```
Net Price = Basic Price
          + Society Charge
          + Club House Charge
          + Premium Charge (facing premium, corner premium, etc.)
          + Infrastructure Charge
          + Floor Rise (varies by floor level)
          + Parking Charge (if parking selected)
          − Early Bird Benefit (if applicable offer)
          − Other Offer Discounts
```

All price fields are stored directly on the unit record. The pricing calculation is performed by `calculatePricingDetails()` in `allocation.service.js`.

### PRICE-002: Allocation Amount Calculation Types
The booking token amount (paid at time of allocation) is calculated in one of two ways, controlled by `allocationCalcType` on the unit:

- **PERCENT**: `allocationAmount = FAV (Full Agreement Value) × allocationPercent / 100`
- **AMOUNT**: `allocationAmount = fixed value stored in allocationAmount field`

The GST is added on top: `Payable = allocationAmount + allocationAmountGst`

### PRICE-003: Floor Rise Per Floor
Floor rise is stored per unit and represents the premium charged for higher floors. This is set during unit master data configuration and synced from Mavis (the ERP).

### PRICE-004: Offer Discounts Applied at Allocation Time
Active offers (HOME_LOAN, VC_REQUEST) reduce the net payable amount. The offer service checks active, non-expired offers for the buyer at the time of cost sheet calculation. Expired or inactive offers are not applied.

---

## 4. Allocation Campaign Rules

### ALLOC-001: Campaign Warmup Required
A campaign cannot start serving buyers until warmup is complete. Warmup loads all towers, floors, units, and registrations into Redis. The system sets the campaign to RUNNING in Redis only after warmup completes successfully.

### ALLOC-002: Scheduled Campaign Warmup Timing
For scheduled campaigns (not immediate start), a Redis TTL key (`pre_warmup_trigger`) is set to expire exactly 1 minute before the scheduled start time. When this key expires, Redis fires the warmup automatically, ensuring Redis is populated before buyers connect.

### ALLOC-003: DYNAMIC Round Completion Before Stop
When admin requests a graceful stop of a DYNAMIC campaign, the system does NOT stop immediately. It sets `stopScheduled=true` and waits for the current round to complete before stopping. Forced stop skips this and halts immediately (not recommended as it may leave buyers in ambiguous states).

### ALLOC-004: DYNAMIC Round-Robin Assignment Order
In DYNAMIC allocation, units are assigned to buyers in round-robin order following:
1. Tower sequence (ordered list of tower IDs set by admin via CMS/Strapi)
2. Within each tower, band order (ordered list of floor bands set via Strapi band-config)
3. Within each band, first available unit matching the buyer's typology

If no units remain across all towers for a buyer's typology, the buyer is placed on WAITLIST.

### ALLOC-005: STATIC First-Come-First-Served
In STATIC allocation, all eligible buyers see all available units simultaneously. The first buyer to send `pay_now_initiated` for a unit gets the hold. All other buyers attempting the same unit receive a rejection response.

### ALLOC-006: PHYSICAL_EVENT SM-Assisted Selection
In PHYSICAL_EVENT allocation, a Sales Manager searches for a buyer by phone/name/registration number and selects a unit on their behalf. The payment can be online (QR scan) or offline (manual recording with proof upload).

### ALLOC-007: Admin Pre-Assignment (PREALLOCATED)
Admin can manually assign a unit to a buyer outside of any campaign. This creates a RegistrationUnit with status PREALLOCATED. The buyer can then proceed to pay for this pre-assigned unit.

### ALLOC-008: Buyer Must Have Typology Match
In DYNAMIC allocation, the system only assigns units that match the buyer's registered typology. The typology is stored on the RegistrationUnit and cross-referenced with UnitTypology during assignment.

---

## 5. KYC Rules

### KYC-001: KYC Required After Unit Booking
KYC must be completed after a buyer reaches WINNER status. The payment schedule and milestone tracking records are only generated after KYC is submitted (`isKycSubmitted=true`).

### KYC-002: Mandatory Document Upload
KYC requires at minimum: Aadhaar card (front + back), PAN card, and passport photo. All documents are uploaded to Azure Blob Storage before submission.

### KYC-003: LSQ Sync After KYC Submission
After KYC is submitted, two LeadSquared activities are triggered:
1. Booking Form Activity — captures applicant details
2. Documents uploaded to LSQ lead record

### KYC-004: Mavis Final Booking After KYC
After KYC submission, `mavisBookingFinalUpdated` is set to true once the Mavis ERP is successfully updated. This marks the booking as final in the property ERP system.

### KYC-005: KYC PDF Generation
After KYC data is submitted, the system generates a KYC PDF using Puppeteer. This PDF is stored in Azure Blob and its path is recorded for future download/access.

### KYC-006: E-Verification Separate From Document Upload
The `eVerificationCompleted` flag tracks electronic verification of identity, separate from the document upload flow (`isKycSubmitted`). Both must be complete for full KYC compliance.

---

## 6. Payment Flow Rules

### PAY-001: Webhook Is the Source of Truth
Payment status is confirmed exclusively via the gateway webhook (Easebuzz or Razorpay). The system does NOT trust the client's return URL for payment confirmation.

### PAY-002: Hash Validation Required
For Easebuzz, the system validates the HMAC SHA-512 hash of the incoming webhook payload before updating any database records. An invalid hash results in the webhook being rejected.

### PAY-003: Signature Verification for Razorpay
For Razorpay, the system verifies the webhook signature using the Razorpay secret before processing any status updates.

### PAY-004: Transaction Status Terminal States
Once a transaction reaches `completed` status, it cannot be moved backwards. The only valid transition from `completed` is to `refunded` if admin processes a refund.

### PAY-005: Offline Payment Admin Approval
For offline payments (cash, cheque, bank transfer), an admin must upload the payment proof and manually approve the transaction. The `isOffline=true` flag and `paymentProof` field are used.

### PAY-006: Reconciliation Cron
A background cron job periodically calls `checkAndProcessAllocationByReferenceService()` for pending transactions. This handles cases where the webhook was delayed or failed — the cron verifies the payment status directly with the gateway and updates the database accordingly.

### PAY-007: Multiple Registrations in One Transaction
A single payment transaction can cover multiple registrations (e.g., family booking). The `metadata.formData.unitRequested` field stores an array of registration-unit pairs, all confirmed in one atomic operation.

### PAY-008: Gateway Facade Pattern
The system uses a `PaymentGatewayService` facade that automatically resolves whether to use Easebuzz or Razorpay based on the `gateway` field stored on the PaymentTransaction record. This allows the business logic to be gateway-agnostic.

---

## 7. Milestone Payment Rules

### ML-001: Schedule Generated After KYC
The payment schedule (milestone records) is generated only after KYC submission is confirmed. The function `insertPaymentScheduleandUpdateMilestone()` creates all milestone tracking records.

### ML-002: Construction-Linked Milestones
Milestone payments are triggered by construction events. Each milestone has a key (ml-or, ml-ual, ml-hcf, ml-rou, ml-tds) that maps to a specific construction stage.

### ML-003: Milestone Keys and Their Meanings
| Key | Milestone Name | Typical Trigger |
|-----|---------------|----------------|
| ml-or | On Registration | Immediate (registration payment) |
| ml-ual | Unit Allocation | Upon unit booking confirmation |
| ml-hcf | Home Confirmation | Construction milestone |
| ml-rou | Registration of Unit (Stamp Duty) | Agreement/registration stage |
| ml-tds | TDS | Tax deduction at source |

### ML-004: Demand Letter Triggers Payment Tracking
When admin marks a construction milestone as reached, the system triggers a demand letter to all buyers with units at that milestone stage. The milestone payment tracking record moves from `pending` to tracking actual receipts.

### ML-005: Partial Payment Tracking
Milestone payments support partial payment. A milestone can be in `partial` status when some amount has been paid but not the full amount. The system tracks `totalAmount`, `totalPaid`, and `balanceAmount` separately.

### ML-006: Home Loan Deduction From Milestone
If a buyer has an approved home loan, the `homeLoanAmount` field on MilestonePaymentTracking records the portion to be paid by the bank. This reduces the amount the buyer must pay directly.

---

## 8. Offers and Discounts Rules

### OFFER-001: System-Triggered Offer Codes
Only two offer codes exist: `HOME_LOAN` and `VC_REQUEST`. These are applied automatically by the system when the triggering event occurs — they cannot be manually entered by buyers.

### OFFER-002: HOME_LOAN Offer Trigger
The HOME_LOAN offer discount is applied automatically when a buyer completes the Easiloan home loan eligibility flow. Completing step 1 (eligibility check) and selecting a bank offer triggers this discount.

### OFFER-003: VC_REQUEST Offer Trigger
The VC_REQUEST offer discount is applied when a Sales Manager records a VC (video call) outcome that confirms buyer engagement. Specific VC outcome codes trigger this offer.

### OFFER-004: Offer Date Validity
Offers have `startDate` and `endDate` fields. The system checks that the current date falls within the offer validity window before applying the discount. Expired offers are not applied even if the buyer technically qualified.

### OFFER-005: Offer Type — Amount vs Percentage
Each offer specifies whether the discount is a fixed `AMOUNT` or a `PERCENTAGE` of the net price. The calculation is applied accordingly at cost sheet generation.

---

## 9. Channel Partner Rules

### CP-001: Master CP Hierarchy
Each Channel Partner is either a Master CP (`isLeadCp=true`) or a Member CP (`isLeadCp=false`). Member CPs have `leadCpId` referencing their Master CP's user ID.

### CP-002: Customer Visibility Isolation
A CP can only see customers they personally registered (matching `brokerId` on the registration). CPs cannot see each other's customers.

### CP-003: HV Code Assignment
Each CP is assigned a unique HV (High Value) code (`hvCode`). For Member CPs, `masterHvCode` stores their Master CP's HV code. This is used for tracking and commission calculations.

### CP-004: CP-to-SM Assignment
Each CP can be assigned to a specific Sales Manager (`smUserId` on User). This governs which SM handles callback requests from that CP's customers.

### CP-005: RERA Registration Requirement
Channel Partners must have valid RERA registration to operate. The RERA number is stored and validated during CP onboarding. CPs without confirmed RERA cannot be assigned inventory pools.

### CP-006: JBP Submission Per Cycle
Each CP submits one JBP per open cycle. A CP cannot submit a new JBP while their current cycle's JBP is in ACTIVE status without requesting an edit.

### CP-007: JBP Edit Requires Admin Approval
CPs cannot directly edit a submitted JBP. They must raise an edit request, which admin reviews and either approves or rejects. If approved, the CP can submit a revised version and the JBP version number increments.

---

## 10. Sales Manager Rules

### SM-001: Callback Request Auto-Assignment
Incoming callback requests are automatically assigned to the SM with `isAvailable=true` who has the oldest `lastRequestAssignedAt` timestamp (round-robin assignment).

### SM-002: SM Admin vs SM Visibility
- SM Admin (role=4): Can see ALL callback requests across all SMs
- SM (role=5): Can see ONLY their own assigned callback requests

### SM-003: VC Outcome Recording
After completing a video call with a buyer, the SM must record one of 10 possible outcomes. The outcome is stored on the CallbackRequest and may trigger an offer discount (VC_REQUEST offer) and LSQ activity update.

### SM-004: Teams Meeting Auto-Generation
When a callback request is confirmed and scheduled, the system automatically generates a Microsoft Teams meeting link via the Teams API. The meeting link is included in the WhatsApp notification sent to the buyer.

### SM-005: Physical Allocation SM Authority
During a PHYSICAL_EVENT campaign, SMs can select units on behalf of customers. The SM verifies the customer's identity and typology before selecting a unit. The SM can also complete KYC at the event site if the customer is present.

---

## 11. Admin Permission Rules

### ADMIN-001: Tower Management Admin Only
Only admin (role=1) can create, modify, or delete tower and unit master data. SM Admin (role=4) has read-only access to tower data.

### ADMIN-002: Campaign Management Admin Only
Only admin (role=1) can create, start, stop, or configure allocation campaigns. SM Admin cannot manage campaigns.

### ADMIN-003: Offer Management Admin Only
Only admin (role=1) can create or modify offers. SM Admin has view access only.

### ADMIN-004: CMS Access Admin Only
The CMS/Config section of the Admin Portal is accessible only to admin (role=1). SM Admin cannot access or modify system configuration.

### ADMIN-005: Audit Trail Immutable
All admin actions that modify critical data (unit status changes, unit swaps, cancellations, refunds) are recorded in the audit log. Audit records cannot be modified or deleted. The `auditActions` constant defines all auditable event types.

### ADMIN-006: Bulk Operations With Guards
Bulk operations (bulk refund, bulk unit status update) include safety checks: the system validates each record individually before committing the batch. If any record fails validation, the entire batch is rejected.

---

## 12. Home Loan Rules

### HL-001: Opt-Out Option Available
Buyers can opt out of the home loan flow by setting `homeLoanOptedOut=true`. Once opted out, the home loan section is hidden and the HOME_LOAN offer is not applicable.

### HL-002: Employment Type Determines Income Fields
- Salaried buyers (`homeLoanEmpType=salaried`): Provide `homeLoanMonthlyIncome`
- Self-employed buyers (`homeLoanEmpType=self_employed`): Provide `homeLoanAnnualProfit` and `homeLoanAnnualTurnover`

### HL-003: Two-Step Flow
The home loan process has two steps tracked by `homeLoanStep`:
- Step 1: Eligibility check with Easiloan, bank offers returned
- Step 2: Buyer selects a bank and formally applies
`homeLoanBankSelected` (JSON field) stores the selected bank and offer details.

### HL-004: Home Loan Approval Status
Admin can track and update the home loan approval status per registration unit. Admin can set status to `admin_rejected` to manually reject a loan application that the buyer claims was approved.

---

## 13. Support Ticket Rules

### TICKET-001: Ticket Created in Both Systems
When a buyer raises a support ticket in the Buyer Portal, the system creates the ticket simultaneously in the XR Portal database AND in OS Ticket (external support system) via API. The OS Ticket ID is stored for reference.

### TICKET-002: Ticket Categories
Ticket categories are predefined and stored in the `TicketCategories` constant. Buyers select a category when raising a ticket; freeform categories are not allowed.

### TICKET-003: Ticket Lifecycle in OS Ticket
Once created, ticket management (replies, status updates, resolution) happens in OS Ticket. Status changes in OS Ticket are synced back to the XR Portal.

---

## 14. WebSocket and Real-Time Rules

### WS-001: Admin Always Receives Updates
Admin users connected to the WebSocket server receive ALL broadcast messages regardless of campaign state. Buyers only receive updates when the campaign is RUNNING.

### WS-002: Campaign Middleware Enforcement
Most WebSocket message types require the campaign to be in RUNNING state. The always-allowed messages (no campaign check) are: `user_details`, `towers`, `tower_units`, `proceed_to_pay`.

### WS-003: DYNAMIC Requires Both Campaign and Round Running
For DYNAMIC allocation, gated messages require BOTH the campaign status to be RUNNING AND the current round status to be RUNNING. Buyers cannot perform actions between rounds.

### WS-004: unit_sold Privacy Masking
When a unit is successfully booked, the `unit_sold` broadcast message includes a masked version of the buyer's registration number (privacy protection). Other buyers see the unit sold without knowing exactly who bought it.

### WS-005: AOF Durability for Winners
Every WINNER event (successful booking confirmation) is written to the Append-Only File (AOF) on disk in addition to Redis. This provides recovery capability if Redis restarts during an allocation event.

### WS-006: JWT Required for WebSocket Connection
WebSocket connections require a valid JWT token in the connection URL (`ws://<host>/ws/:token`). Invalid or expired tokens result in immediate connection rejection with error codes 4001/4003. Non-existent users get 4002.

---

## 15. Data Integrity Rules

### DATA-001: Soft Delete Everywhere
All major entities (users, registrations, units, offers, campaigns, etc.) use Sequelize paranoid mode with `deletedAt` timestamps. Hard deletes do not occur in normal business flows.

### DATA-002: Optimistic Locking on Critical Updates
Unit status updates and registration unit updates use database-level locking (`LOCK.UPDATE` in Sequelize transactions) to prevent race conditions during concurrent allocation operations.

### DATA-003: Mavis as Unit Master Data Source of Truth
Unit master data (pricing, areas, specifications) originates from Mavis ERP. The XR Portal syncs this data periodically. Direct edits to unit master data in XR Portal are overwritten on the next Mavis sync.

### DATA-004: Registration Number Uniqueness
Registration numbers are system-generated and globally unique. They serve as the primary identifier for buyers across the WebSocket server, Redis cache, and all integration systems.

### DATA-005: LSQ Failure Non-Blocking
LeadSquared sync failures do not block the main business flow. If an LSQ API call fails, the failure is recorded via boolean flags (e.g., `bookingTokenActivitySubmitted=false`) and a background cron retries the failed sync.

---

## 16. Configuration Rules

### CONFIG-001: MasterConfig Key-Value Store
System configuration is stored in the `master_configs` table as typed key-value pairs. Config values can be of type: string, number, boolean, json, date, datetime, array, or object. Each type maps to a different storage column.

### CONFIG-002: Strapi CMS Controls Allocation Behavior
The band configuration for DYNAMIC allocation (band order, tower sequence) is fetched from Strapi CMS, not stored directly in the database. Changes to allocation behavior require updating Strapi content.

### CONFIG-003: Environment-Aware Behavior
The system detects production vs non-production environment via `app.production`. Booking numbers in production use a different prefix pattern (`environmentPrefix()`) to avoid data conflicts.
