# Backend — BRD

**Type:** System Component Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The backend is the central business logic engine for the XR Portal. It serves every portal (Admin, SM, CP, Buyer) and is responsible for authentication, payment processing, allocation workflows, KYC management, third-party integrations, scheduled automation, and audit logging.

This document is the business-level reference for the backend's 13 domains. For technical implementation details (file names, API routes, database schema), the source is `Backend-Functional-BRD.md`.

---

## 2. What the Backend Does

| Domain | What It Handles |
|--------|----------------|
| Authentication | OTP login for buyers/CPs; email/password for admin/SM |
| Registration | Buyer registration records, payment status, LSQ sync |
| Allocation | STATIC, DYNAMIC, PHYSICAL_EVENT campaign logic, hold timers, unit assignment |
| Payments | Easebuzz and Razorpay gateway processing, webhook validation, offline payments |
| KYC | Document uploads, applicant records, PDF generation, LSQ sync flags |
| Milestone Payments | Construction-linked payment schedules, partial payments, offline recording |
| Home Loan | Easiloan integration, self-financing path, admin approval |
| Offers | Offer engine — auto-application of discounts at trigger events |
| Callback Requests | Round-robin SM assignment, VC outcome recording, Teams meeting creation |
| Support Tickets | Ticket creation, OS Ticket sync, status updates |
| Channel Partners | CP registration, approval, HV code assignment, Master/Member hierarchy |
| JBP Management | Cycle management, submission versioning, edit request flow |
| Parking | Parking slot inventory, hold and booking flow |

---

## 3. Authentication

**Buyers and CPs — OTP Login:**
1. Submit mobile number
2. System generates 6-digit OTP, sends via SMS/WhatsApp (Kaleyra)
3. Submit OTP
4. System validates OTP and expiry
5. JWT token issued with user ID and role ID

**Admin and SM — Email/Password:**
1. Submit email and password
2. Password verified against bcrypt hash
3. JWT token issued

**OTP spam protection:** `lastOtpSentAt` prevents rapid re-requests. Rate limiter middleware limits per IP.

---

## 4. Allocation Engine

Three allocation types, all managed by the backend:

### STATIC (First-Come-First-Served)
- Buyers see and select available units simultaneously
- First buyer to pay wins the unit
- Unit → HOLD when payment initiated (20-min timer)
- Payment webhook confirms → HOLD → BOOKED, registration unit → WINNER
- Payment failure/timeout → unit → AVAILABLE

### DYNAMIC (Round-Robin Auto-Assign)
- System assigns one unit per buyer per round
- Assignment follows tower sequence and band order configured in Strapi CMS
- Round duration configurable (e.g., 20 minutes)
- Payment failure → system finds next available unit in same typology
- If no unit found → buyer → WAITLIST
- Lost unit history tracked in Redis per buyer

### PHYSICAL_EVENT (SM-Assisted Walk-In)
- SM selects a unit for a walk-in customer using the SM Portal
- Same hold and payment logic as STATIC

---

## 5. Payment Processing

**Two gateways, always at least one active:**

| Gateway | Flow Type |
|---------|-----------|
| Easebuzz (primary) | Hash-based redirect; buyer redirected to Easebuzz checkout |
| Razorpay (secondary) | Order-based; buyer pays via Razorpay modal |

**Payment status is only ever updated via webhook.** Browser return URL is never trusted.

**Offline payments:**
- Admin or SM records: payment method, transaction ID, amount, proof document
- Stored with `isOffline = true`
- Admin approves → status confirmed

**Reconciliation crons** catch missed webhooks:
- Allocation payments: every 5 minutes
- Registration payments: every 15 minutes
- Milestone payments: every 5 minutes

---

## 6. KYC

After a buyer achieves WINNER status:
1. Buyer completes KYC form (primary + up to 3 co-applicants)
2. Documents uploaded to Azure Blob Storage (photo, PAN, Aadhaar front, Aadhaar back — all mandatory)
3. Documents synced to LeadSquared
4. KYC PDF generated server-side (Puppeteer)
5. PDF stored in Azure Blob Storage
6. Tracking flags updated: `isKycSubmitted`, `bookingTokenActivitySubmitted`, `bookingFormActivitySubmitted`, `bookingActivitySubmitted`
7. Milestone payment schedule generated
8. Mavis updated to Final status

**KYC PDF cron:** Runs every 10 minutes to generate any missing PDFs.

---

## 7. Milestone Payments

Payment schedule structure:

| Milestone Key | Due Amount Type |
|--------------|----------------|
| `ml-or` / `ml-ual` | BOOKING_AMOUNT |
| `ml-hcf` | FIRST_DEMAND_PAYMENT |
| `ml-rou` | SDR (Stamp Duty and Registration) |
| `ml-otdb` | FIRST_DISBURSEMENT (home loan tranche) |
| All others | PERCENT of FAV |

Payment options per milestone:
- FULL_PRINCIPAL — pay full principal
- HALF_PRINCIPAL — pay half principal
- GST_ONLY — pay GST only
- FULL_PRINCIPAL_GST — pay principal + GST
- HALF_PRINCIPAL_GST — pay half principal + GST

---

## 8. Offers Engine

Offers are configured by admin with a trigger code. When the trigger event occurs, the system auto-applies the offer to the buyer's unit (RegistrationUnitOffer record created):

| Offer Code | Trigger |
|-----------|---------|
| HOME_LOAN | Easiloan home loan application completed |
| VC_REQUEST | SM records VC_DONE_PREFERENCE or VC_2_DONE outcome |
| Custom offers | Admin manually applies to eligible registrations |

Offer types: AMOUNT (fixed rupee discount) or PERCENTAGE (% of unit value).

---

## 9. Callback Request Assignment

Round-robin algorithm:
1. Find all active, available SMs (`isActive = true`, `isAvailable = true`)
2. Sort by `lastRequestAssignedAt` ascending (oldest last assignment first)
3. Assign to that SM
4. Update `lastRequestAssignedAt` for that SM

After call: SM records one of 10 VC outcomes. Only `VC_DONE_PREFERENCE` and `VC_2_DONE` trigger the VC_REQUEST offer.

---

## 10. Scheduled Automation (Cron Jobs)

| Cron | Frequency | Purpose |
|------|-----------|---------|
| Allocation LSQ + Mavis retry | 10 minutes | Retry failed post-allocation CRM and ERP syncs |
| Allocation payment reconcile | 5 minutes | Release expired holds; catch missed webhooks |
| KYC PDF generation | 10 minutes | Generate missing KYC PDFs |
| Payment reconcile (general) | 5 minutes | Catch missed milestone payment webhooks |
| Physical allocation unit release | 1 minute | Release expired physical event holds |
| Self-KYC LSQ update | 15 minutes | Sync self-service KYC to LSQ |
| Ticker clock | 30 seconds | Backend liveness heartbeat for frontend |

---

## 11. Parking Management

- Each parking slot is a separate inventory record (AVAILABLE / HOLD / BOOKED)
- Linked to a RegistrationUnit when allocated
- `holdAt` tracks temporary hold time
- Parking is priced separately from unit cost
- Admin manages parking assignment

---

## 12. Data Integrity

| Rule | Enforcement |
|------|------------|
| No hard deletes | Sequelize paranoid mode — all records use `deletedAt` |
| All admin actions logged | `audit_logs` table records every sensitive change |
| Payment amounts locked | Cannot be modified after transaction creation |
| One active registration per buyer per project | Enforced at application level |
| Refunded registrations excluded | Default queries use `scope` that excludes Refund status |

---

## 13. Configuration System (MasterConfig)

Key-value store for system-wide and project-specific settings:
- Feature flags
- System-wide parameters
- Allocation configuration values
- Project-specific settings

Changes via MasterConfig take effect without code deployment.

---

## How to Use: Backend Concepts for Admin

---

### Understanding Integration Failures

All major integration failures are non-blocking and retried automatically:

| Integration | Retry Cron | Retry Interval |
|-------------|-----------|---------------|
| LSQ (post-allocation) | allocation-lsq-operations.cron.js | 10 minutes |
| Mavis (post-allocation) | Same cron | 10 minutes |
| Easebuzz payments | payment-reconcile.cron.js | 5 minutes |
| Registration payments | reconcile.cron.js | 15 minutes |

**If a sync flag stays false after 30 minutes:** Contact technical support for manual re-sync.

---

### Understanding Audit Logs

Every sensitive admin action is recorded:
- Who did it
- What changed (before and after values)
- When
- Which record was affected

Audit logs are read-only and permanent. They cannot be deleted.

---

### Understanding Soft Deletes

No records are ever permanently deleted in the XR Portal. When something is "deleted":
- A `deletedAt` timestamp is set
- The record is excluded from all normal queries
- The record can be retrieved with an explicit include-deleted scope

This applies to: registrations, registration units, units, payments, users, offers, tickets.

---

## 14. Related Documents

- [[BRD-Integrations]] — All 13 third-party integrations
- [[BRD-Allocation-Workflow]] — Full allocation business flow
- [[BRD-Payment-Workflow]] — Payment processing detail
- [[BRD-KYC-Workflow]] — KYC triggers and flags
- [[BRD-Business-Rules]] — All 16 business rule domains
- [[BRD-Realtime-Events]] — WebSocket server and Redis layer
