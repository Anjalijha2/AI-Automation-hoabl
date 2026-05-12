# Integrations — BRD

**Type:** Integration Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Overview

XR Portal integrates with 13 external and internal systems. This document describes the business purpose and impact of each integration — who triggers it, what it does, and what breaks if it fails.

For technical implementation details (endpoints, auth, error codes), see [[Integrations]].

---

## 2. Integration Summary

| System | Type | Direction | Business Purpose |
|--------|------|-----------|-----------------|
| LeadSquared (LSQ) | CRM | Outbound | Track all buyer lifecycle events in the sales CRM |
| Mavis | ERP | Bidirectional | Create and update unit bookings and milestones in the property ERP |
| Easebuzz | Payment Gateway | Bidirectional | Primary online payment processing (registration, allocation, milestones) |
| Razorpay | Payment Gateway | Bidirectional | Secondary online payment gateway |
| Easiloan | FinTech | Bidirectional | Home loan eligibility checks and bank offer presentation |
| Azure Blob Storage | Cloud Storage | Bidirectional | Store all KYC documents, generated PDFs, payment proofs, project images |
| Kaleyra | Communication | Outbound | SMS and WhatsApp notifications to buyers and SMs |
| Microsoft Teams | Collaboration | Outbound | Auto-generate meeting links for SM-buyer video calls |
| OS Ticket | Support | Bidirectional | External helpdesk ticketing for buyer support requests |
| Strapi CMS | Content | Inbound | Dynamic content and form configuration (project info, KYC fields, allocation banners) |
| Python Allocation Service | Internal | Bidirectional | Real-time unit and campaign state sync during allocation events |
| Redis | Cache | Bidirectional | Real-time unit availability and hold timer management during allocation |
| Nurix | Communication | Embedded | In-portal calling widget for embedded voice calls |

---

## 3. LeadSquared (LSQ)

**What it does:** Tracks all key buyer milestones — registration, booking, KYC, final booking — in the sales CRM so the sales team has a complete view of every buyer's status.

**When it is triggered:**

| Event | What is Synced |
|-------|---------------|
| New buyer OTP login | Lead captured in LSQ |
| Registration payment success | Registration activity created with amount and reg number |
| Allocation payment success (WINNER) | Booking token activity created with unit, tower, floor, booking amount |
| KYC submitted | Booking form activity created with all applicant details; KYC documents uploaded |
| Final booking confirmed | Booking final activity created |
| VC outcome recorded by SM | Call activity synced with outcome code |
| Home loan status change | Opportunity updated |

**What happens if it fails:** LSQ sync failures are non-blocking — the buyer's portal experience is unaffected. A background cron retries all failed operations every 10 minutes in the correct dependency order.

**Key identifiers stored:**
- `prospectId` on User — links buyer to their LSQ lead
- `opportunityId` on Registration — links registration to LSQ opportunity
- `lsqBookingFormActivityId` and `lsqBookingActivityId` on RegistrationUnit

---

## 4. Mavis (Property ERP)

**What it does:** Creates and maintains booking records and milestone schedules in the company's property ERP system (Mavis). Mavis is the system of record for unit inventory, bookings, and payment progress from the developer's side.

**When it is triggered:**

| Event | What is Synced |
|-------|---------------|
| Allocation payment confirmed (WINNER) | Booking record created in Mavis; unit status → Booked |
| KYC submitted | Booking progress status updated to Final in Mavis |
| Milestone payment confirmed | Milestone payment record created; milestone status updated |
| KYC address lookup | Pincode details fetched from Mavis |

**What happens if it fails:** Mavis sync failures are non-blocking. Cron retries every 10 minutes using flag-based tracking (`mavisBookingCreated`, `mavisUnitUpdated`, `mavisBookingFinalUpdated`).

---

## 5. Easebuzz (Payment Gateway)

**What it does:** Primary payment gateway for all online payments. Buyer is redirected to the Easebuzz checkout page where they pay via Card, UPI, NetBanking, Wallet, or EMI.

**Flow:**
1. Backend generates a payment hash (HMAC SHA-512)
2. Buyer is redirected to Easebuzz checkout
3. Buyer pays
4. Easebuzz sends a webhook to the backend
5. Backend validates the hash and updates the payment record

**Critical safeguard:** Only the validated webhook updates payment status. Browser return URL is never trusted.

**What happens if the webhook is missed:** A reconciliation cron runs every 5 minutes to re-check Easebuzz for payments stuck in pending state.

---

## 6. Razorpay (Payment Gateway)

**What it does:** Secondary payment gateway — alternative to Easebuzz. Uses an order-based flow where a Razorpay order is created first, then the buyer pays via the Razorpay SDK frontend modal.

**Key difference from Easebuzz:** Razorpay uses order IDs (stored as `gatewayOrderId`) rather than a hash-based redirect.

**At-least-one rule:** Admin cannot disable both Easebuzz and Razorpay simultaneously. At least one must remain active.

---

## 7. Easiloan (Home Loan Aggregator)

**What it does:** Checks buyer loan eligibility and presents pre-approved offers from partner banks within the XR Portal. Buyer selects a bank and formally applies — all within the portal experience.

**When triggered:** Buyer initiates Home Loan flow in Buyer Portal (post-KYC).

**Business impact:** Completing Easiloan flow may trigger the HOME_LOAN offer discount on the buyer's unit Agreement Value.

**What happens if it fails:** Buyer cannot see bank offers. Buyer can declare self-financing as an alternative (admin manually approves).

---

## 8. Azure Blob Storage

**What it stores:**
- KYC documents (Aadhaar front/back, PAN, photo) — per applicant
- Generated KYC PDFs
- Offline payment proof documents
- Unit, tower, and project images

**Why it matters:** Central document repository for all regulatory and legal documents. Required for LeadSquared document upload and for admin/buyer download of KYC PDFs.

**What happens if it fails:** KYC form cannot be submitted (document upload is a prerequisite — client-side validation blocks submission if upload fails). Buyer must retry the upload.

---

## 9. Kaleyra (SMS and WhatsApp)

**What it does:** Sends SMS and WhatsApp notifications to buyers and SMs at key moments throughout the purchase journey.

**Key notification triggers:**

| Event | Channel | Recipient |
|-------|---------|----------|
| OTP for login | SMS/WhatsApp | Buyer/CP |
| Registration confirmed | WhatsApp | Buyer |
| Allocation campaign goes live | WhatsApp | All eligible buyers |
| Unit booking confirmed | WhatsApp/SMS | Winning buyer |
| Payment failed | SMS | Buyer |
| KYC submitted | WhatsApp | Buyer |
| Callback meeting scheduled | WhatsApp | Buyer |
| Buyer feedback link | SMS/WhatsApp | Buyer (after SM records outcome) |

**What happens if it fails:** Notification failures are logged. Buyer portal experience is unaffected — Kaleyra failures are non-blocking.

---

## 10. Microsoft Teams

**What it does:** Auto-generates Microsoft Teams meeting links when an SM schedules a video call with a buyer. SM does not need to manually create a Teams meeting.

**When triggered:** SM clicks "Schedule Meeting" in the SM Portal and confirms the time slot.

**Data stored:**
- `meetingLink` — shareable URL stored on CallbackRequest
- `teamsMeetingId` — Teams meeting identifier for tracking/cancellation

**What happens if it fails:** SM can still schedule the meeting without a Teams link — the link generation is optional. SM can manually create a Teams meeting as a fallback.

---

## 11. OS Ticket (Support Helpdesk)

**What it does:** External open-source ticketing system. When a buyer creates a support ticket in the Buyer Portal, a corresponding ticket is created in OS Ticket via API. The support team manages resolution in OS Ticket; status updates sync back to the portal.

**Flow:** Buyer Portal → XR Portal backend → OS Ticket API (bidirectional status sync).

**What happens if it fails:** Ticket may not appear in OS Ticket for the support team. Buyer's portal ticket is still created.

---

## 12. Strapi CMS

**What it provides:**
- Project content: gallery, about, amenities, documents, videos
- Registration and KYC form field configuration (labels, validation rules, which fields are mandatory)
- Allocation page configuration: hero slides, banners, marquee text
- DYNAMIC allocation band configuration (tower sequence, band order for unit assignment)
- Announcement popups (homePopup)

**Direction:** Inbound — the XR Portal backend fetches content from Strapi on demand.

**Why it matters:** Form fields and page content can be updated by the admin team in Strapi without any code deployment. This is how KYC form changes and project content updates are made.

**What happens if it fails:** Portal pages that depend on Strapi content may show cached content or blank sections. Core platform functionality (payments, allocation, KYC data) is unaffected.

---

## 13. Python Allocation Service (Internal)

**What it does:** The Python FastAPI WebSocket server is the real-time layer during allocation events. It:
- Maintains WebSocket connections with all connected buyers and admins
- Holds the live unit status grid in Redis
- Broadcasts unit updates (hold, sold, available) to all connected users instantly

**How Node.js interacts with it:** After processing a payment webhook or admin action, the Node.js backend calls Python HTTP endpoints to trigger broadcasts:
- `/update-payment-status` — After payment confirmed or failed
- `/broadcast-registrations` — After registration data changes
- `/campaign/start` and `/campaign/stop` — Campaign lifecycle events
- `/units/status-sync` — After admin unit status changes

**What happens if it fails:** Unit grid updates may not reach buyers in real-time. Node.js operations (payment processing, admin actions) complete successfully even if the broadcast fails. Unit state in Redis may temporarily lag database state until the next explicit sync.

---

## 14. Redis (Real-Time Cache)

**What it does:** In-memory cache that holds all live allocation state during campaign events:
- Current unit availability (sub-millisecond reads — needed for thousands of concurrent buyers)
- 20-minute hold timers
- Campaign status and round state (DYNAMIC)
- Registration-to-unit allocation mapping
- User connection state for WebSocket server

**Why it exists:** Relational database cannot handle the read throughput required during a live allocation event with many concurrent buyers. Redis provides the necessary speed.

**Persistence:** Configured with AOF (Append-Only File) — allocation event state survives a Redis restart.

**What happens if it fails:** Allocation event halts. Unit grid becomes unavailable. Admin must stop the campaign, resolve Redis, and restart. This is a critical dependency during active allocation campaigns.

---

## 15. Cron Jobs (Reliability Layer)

Background crons provide resilience for all integration failures. Key schedules:

| Cron | Runs Every | Purpose |
|------|-----------|---------|
| Allocation LSQ + Mavis retry | 10 minutes | Retry failed LSQ/Mavis post-allocation syncs |
| Allocation payment reconcile | 5 minutes | Catch missed Easebuzz allocation webhooks |
| KYC PDF generation | 10 minutes | Generate KYC PDFs for completed KYC records |
| Milestone payment reconcile | 5 minutes | Catch missed milestone payment webhooks |
| Physical allocation unit release | 1 minute | Release 20-minute holds that expired |
| Registration payment reconcile | 15 minutes | Catch missed registration payment webhooks |
| Self-KYC LSQ update | 15 minutes | Sync self-service KYC track to LSQ |
| Ticker clock | 30 seconds | Backend liveness heartbeat for frontend |

---

## How to Use: Understanding Integration Status

---

### Admin: Checking Integration Health

**LSQ sync failures:** In the customer detail view, if any of the following flags show `false`, the sync failed and will be retried automatically: `bookingTokenActivitySubmitted`, `bookingFormActivitySubmitted`, `bookingActivitySubmitted`, `mavisBookingCreated`, `mavisBookingFinalUpdated`.

**If a sync does not recover in 30 minutes:** Contact technical support. Manual re-sync may be required.

**Payment gateway issues:** If buyers are reporting payment failures during a campaign, check the Payment Transactions module for patterns. If all transactions from a specific gateway are failing, consider disabling that gateway temporarily and switching to the other.

**Redis failure during campaign:** If the allocation event goes dark (buyers cannot see the unit grid), the Python/Redis service may be down. Immediately stop the campaign from the Admin Portal. Contact technical support before restarting.

---

## 16. Related Documents

- [[Integrations]] — Technical integration reference (endpoints, auth, code details)
- [[WebSocket]] — WebSocket system architecture reference
- [[BRD-Allocation-Workflow]] — Real-time allocation context
- [[BRD-Payment-Workflow]] — Payment gateway context
- [[BRD-KYC-Workflow]] — Document upload and LSQ sync context
