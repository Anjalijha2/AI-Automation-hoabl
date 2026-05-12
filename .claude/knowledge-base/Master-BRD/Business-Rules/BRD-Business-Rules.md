# Business Rules — BRD

**Type:** Platform-Wide Business Rules Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

This document defines the core business rules that govern all XR Portal behaviour across every portal (Admin, Buyer, CP, SM). These rules are enforced by the system automatically — they are not optional guidelines. Understanding them helps all stakeholders avoid confusion when the platform behaves in ways that may seem restrictive.

---

## 2. Who Uses This

| Audience | Why They Need This |
|----------|-------------------|
| Admin | Understand what they can and cannot override; how status changes cascade |
| Buyer | Understand what gates which action (e.g., KYC before loan, booking before ticket) |
| Channel Partner | Understand registration limits, commission eligibility, JBP rules |
| Sales Manager | Understand assignment logic, callback outcomes, offline payment approvals |
| Product / QA Team | Authoritative source of validation logic for all portals |

---

## 3. Registration Rules

| Rule | What It Means |
|------|--------------|
| **REG-001** | Each buyer (mobile number) can register only once per project. Duplicate attempts are blocked. |
| **REG-002** | Registration payment is non-refundable except in specific cancellation scenarios approved by admin. |
| **REG-003** | Registration number format: `GHNG-XXXXXXXXXX`. A buyer who wins multiple units in one campaign gets additional suffixes: `-A`, `-B`, `-C`. |
| **REG-004** | A registered buyer's status is computed from their actual allocation outcome — it is not manually set by admin. |
| **REG-005** | CP-initiated registrations attribute commission and allocation tracking to the CP who registered the buyer. |

**Allocation Status Reference (auto-computed):**

| Status | Condition |
|--------|-----------|
| WINNER | Has at least one RegistrationUnit with status = WINNER |
| WAITLISTED | Participated in campaign, no WINNER unit |
| REGISTERED | Paid registration, campaign not yet run |
| NOT_PARTICIPATED | Did not join the campaign |
| CANCELLED | Booking cancelled by admin |

---

## 4. Unit Status Rules

| Rule | What It Means |
|------|--------------|
| **UNIT-001** | Unit statuses (Available, Hold, Booked, Reserved) are the source of truth for the allocation heatmap. |
| **UNIT-002** | A unit on Hold is locked for 20 minutes. If payment is not confirmed within 20 minutes, the hold is released automatically. |
| **UNIT-003** | A Booked unit cannot be reassigned without admin cancellation of the existing booking. |
| **UNIT-004** | A Reserved unit is set manually by admin — it is not available for buyer selection. |
| **UNIT-005** | Hold timer is managed in Redis. A cron job releases expired holds every 1 minute. |
| **UNIT-006** | Heatmap colour = unit status: White (Available), Orange (Hold), Red (Booked), Blue (Reserved). |

---

## 5. Pricing Rules

| Rule | What It Means |
|------|--------------|
| **PRICE-001** | Base Price = BSP × carpet area. This is the starting point before any additions or discounts. |
| **PRICE-002** | Final Agreement Value (FAV) = Base Price + all applicable additions (floor rise, parking, amenities, GST) − offer discounts. |
| **PRICE-003** | Floor rise is a per-floor surcharge. It applies on top of BSP and varies by floor. |
| **PRICE-004** | Offer discounts reduce FAV. Discounts are applied at specific trigger points (allocation payment, KYC, home loan completion, VC preference). |

**Cost Sheet Components:**

| Component | Description |
|-----------|-------------|
| BSP | Basic Sale Price per sq.ft |
| Carpet Area | Unit carpet area in sq.ft |
| Floor Rise | Per-floor surcharge |
| Parking Charges | Per-slot charge |
| Amenity Charges | Fixed per-unit |
| GST | Tax applied to eligible components |
| Offer Discounts | Deducted from FAV |

---

## 6. Allocation Rules

| Rule | What It Means |
|------|--------------|
| **ALLOC-001** | Three allocation types: STATIC (first-come-first-served), DYNAMIC (round-robin auto-assign), PHYSICAL_EVENT (SM-assisted walk-in). |
| **ALLOC-002** | Campaign must be in LIVE status for buyers to select or be assigned units. |
| **ALLOC-003** | Buyer must have REGISTERED status (paid registration) to participate in allocation. |
| **ALLOC-004** | Hold = 20 minutes. Buyer must complete payment before hold expires. |
| **ALLOC-005** | STATIC: Buyer selects their own unit. DYNAMIC: System assigns a unit from the next available band based on round-robin order. |
| **ALLOC-006** | DYNAMIC warmup: SMs pre-enter buyer preferences before campaign goes live. |
| **ALLOC-007** | Payment must be confirmed via gateway webhook before unit status changes from Hold to Booked. Browser confirmation alone is never trusted. |
| **ALLOC-008** | Admin can manually override unit status (mark available/reserved/booked) outside of normal campaign flow. |

---

## 7. KYC Rules

| Rule | What It Means |
|------|--------------|
| **KYC-001** | KYC is available only after a buyer achieves WINNER status (confirmed unit booking). |
| **KYC-002** | Four documents required per applicant: Photo, PAN card, Aadhaar front, Aadhaar back. All are mandatory. |
| **KYC-003** | Maximum 4 applicants: 1 primary + 3 co-applicants. |
| **KYC-004** | TDS applies if unit agreement value ≥ ₹50 lakh. TDS = 1% of FAV. |
| **KYC-005** | KYC submission triggers: milestone payment schedule generation, LSQ booking form activity, Mavis status update to Final, any KYC-gated offer discounts. |
| **KYC-006** | KYC PDF is auto-generated by a cron running every 10 minutes after submission. |

---

## 8. Payment Rules

| Rule | What It Means |
|------|--------------|
| **PAY-001** | Payment status is only updated via gateway webhook. Browser redirect / return URL is never trusted. |
| **PAY-002** | Payment hash (HMAC SHA-512 for Easebuzz) is validated on every webhook before any record is updated. |
| **PAY-003** | At least one payment gateway (Easebuzz or Razorpay) must remain active at all times. Admin cannot disable both. |
| **PAY-004** | Offline payments (NEFT/Cheque/Cash) require admin approval before they are reflected as confirmed in the system. |
| **PAY-005** | Reconciliation crons re-check gateway status for any payment stuck in pending state (every 5 minutes for allocation/milestone, every 15 minutes for registration). |
| **PAY-006** | Payment amount submitted to the gateway must match the amount stored in the database. Amount tampering is detected and rejected. |
| **PAY-007** | Transaction records are never hard-deleted. Cancelled or failed transactions are preserved for audit. |
| **PAY-008** | Multiple payments can be made against a single milestone (partial payments). |

---

## 9. Milestone Payment Rules

| Rule | What It Means |
|------|--------------|
| **ML-001** | Milestone schedule is generated only after KYC is submitted. No KYC = no payment schedule. |
| **ML-002** | Amounts are frozen at schedule generation time — they do not change if the typology template is later updated. |
| **ML-003** | Partial payments are allowed. A milestone moves to `partial` status when some — but not all — of the amount is paid. |
| **ML-004** | Admin updating the milestone template does not affect existing buyer schedules. Only new schedules use the new template. |
| **ML-005** | Home loan bank disbursements are credited to the FIRST_DISBURSEMENT milestone automatically. |
| **ML-006** | Milestone records are soft-deleted (not hard-deleted) when a booking is cancelled. Audit trail is preserved. |

---

## 10. Offer Rules

| Rule | What It Means |
|------|--------------|
| **OFFER-001** | Each offer has a trigger event. Discount is applied automatically when the trigger occurs — no manual application. |
| **OFFER-002** | Offers stack — a buyer can receive multiple discounts (e.g., EARLY_BIRD + HOME_LOAN + VC_REQUEST). All are deducted from FAV. |
| **OFFER-003** | VC_REQUEST offer is triggered only by VC outcomes: `VC_DONE_PREFERENCE` or `VC_2_DONE`. No other VC outcome triggers a discount. |
| **OFFER-004** | HOME_LOAN offer is triggered by completing the Easiloan flow (not the self-financing path). |
| **OFFER-005** | Offers are admin-configured per campaign. Not all offers are available in every campaign. |

**Offer Trigger Reference:**

| Offer | Trigger |
|-------|---------|
| EARLY_BIRD | Admin manually applies to eligible registrations |
| HOME_LOAN | Easiloan flow completed and approved |
| VC_REQUEST | SM records VC_DONE_PREFERENCE or VC_2_DONE outcome |
| SUBVENTION | Specific financing arrangement — admin configured |

---

## 11. Channel Partner Rules

| Rule | What It Means |
|------|--------------|
| **CP-001** | CP must be registered and approved in the system before they can register buyers. |
| **CP-002** | CP can register buyers on behalf of the buyer — the buyer's mobile number is still the unique identifier. |
| **CP-003** | CP registration associates the buyer permanently with that CP for commission tracking. |
| **CP-004** | CP can view only their own leads. They cannot see other CPs' buyers. |
| **CP-005** | JBP submission requires 14 mandatory fields. Incomplete submissions are rejected. |
| **CP-006** | CP can assist buyers with KYC document uploads but cannot submit KYC on their behalf without buyer consent. |
| **CP-007** | NRI buyers registered by a CP require additional processing — the NRI flag is set at registration time and cannot be changed. |

---

## 12. Sales Manager Rules

| Rule | What It Means |
|------|--------------|
| **SM-001** | SM assignment to callback requests uses round-robin ordering by `lastRequestAssignedAt` — the SM with the oldest last assignment gets the next request. |
| **SM-002** | SM can record exactly 10 possible VC (video call) outcomes. Only 2 of these trigger an offer discount. |
| **SM-003** | SM must confirm a time slot when scheduling a video call. Teams meeting link is auto-generated. |
| **SM-004** | In a Physical Allocation Event, SM assists the buyer through all 3 screens (unit selection, payment, confirmation). |
| **SM-005** | Offline milestone payments recorded by SM require admin approval before they are credited. |

**VC Outcome Reference:**

| Outcome | Triggers VC_REQUEST Offer? |
|---------|---------------------------|
| VC_DONE_PREFERENCE | Yes |
| VC_2_DONE | Yes |
| NOT_PICKED | No |
| BUSY | No |
| CALL_LATER | No |
| SWITCHED_OFF | No |
| INVALID_NUMBER | No |
| DISCONNECTED | No |
| VC_NOT_DONE | No |
| NOT_INTERESTED | No |

---

## 13. Admin Permission Rules

| Rule | What It Means |
|------|--------------|
| **ADMIN-001** | Admin (role 1) has full access to all portals and all data. |
| **ADMIN-002** | Admin can manually override unit status, allocation outcomes, and offer assignments. |
| **ADMIN-003** | Admin can enable/disable payment gateways — but cannot disable both simultaneously (PAY-003). |
| **ADMIN-004** | Admin can approve or reject offline payments and home loan self-declarations. |
| **ADMIN-005** | Admin manages milestone templates. Template changes do not retroactively affect existing schedules. |
| **ADMIN-006** | Admin can stop an active allocation campaign at any time (DYNAMIC campaigns have a graceful stop option). |

---

## 14. Home Loan Rules

| Rule | What It Means |
|------|--------------|
| **HL-001** | Home loan flow is available only post-KYC. |
| **HL-002** | Two paths: Easiloan (via portal) or Self (buyer declares own financing). |
| **HL-003** | Only Easiloan path triggers the HOME_LOAN offer discount. Self-financing path does not. |
| **HL-004** | `admin_rejected` home loan records are excluded from the home loan status indicator in admin views. |

---

## 15. Support Ticket Rules

| Rule | What It Means |
|------|--------------|
| **TICKET-001** | Only buyers with an active unit booking can raise support tickets. Registered-only buyers cannot. |
| **TICKET-002** | A CANCELLATION ticket starts a manual review process — it does NOT automatically cancel the booking. |
| **TICKET-003** | CANCELLATION tickets require 4 documents: Aadhaar, PAN, transaction proof, cancelled cheque. |

---

## 16. WebSocket / Real-Time Rules

| Rule | What It Means |
|------|--------------|
| **WS-001** | Authentication: JWT token is embedded in the WebSocket URL. Invalid/expired tokens are rejected (close code 4001). |
| **WS-002** | Reconnection: Portal retries up to 5 times at 3-second intervals. After 5 failures, a connection error is shown. |
| **WS-003** | Hold timers live in Redis. A cron releases expired holds. Redis AOF ensures hold state survives restarts. |
| **WS-004** | Python WebSocket service failure is non-blocking — Node.js operations continue; real-time updates may lag. |
| **WS-005** | All WebSocket messages are stored to the database — full audit trail. |
| **WS-006** | Admin receives all broadcast messages. Buyers receive only updates relevant to their session. |

---

## 17. Data Integrity Rules

| Rule | What It Means |
|------|--------------|
| **DATA-001** | Soft deletes only — no hard deletes in normal platform flows. Deleted records remain in database with a `deletedAt` timestamp. |
| **DATA-002** | All audit-critical entities have full change logs. |
| **DATA-003** | Integration sync failures (LSQ, Mavis) are non-blocking and retried by cron. Buyer experience is unaffected. |
| **DATA-004** | Payment amounts are locked at transaction creation. They cannot be modified post-creation. |
| **DATA-005** | Webhook payments are validated via HMAC before any database update occurs. |

---

## 18. Configuration Rules

| Rule | What It Means |
|------|--------------|
| **CONFIG-001** | CMS content (forms, banners, project info) is managed in Strapi. Changes take effect without code deployment. |
| **CONFIG-002** | Campaign type (STATIC/DYNAMIC/PHYSICAL_EVENT) is set at campaign creation and cannot be changed once the campaign is LIVE. |
| **CONFIG-003** | At-least-one gateway rule: Admin UI prevents disabling both Easebuzz and Razorpay simultaneously. |

---

## How to Use: Business Rules by Role

---

### Admin: Key Rules You Must Know

**Before stopping a campaign:**
- DYNAMIC campaigns: use graceful stop (wait for current round to complete) unless urgent.
- After stopping: unit statuses reset; buyers in payment flow will have holds released within 20 minutes.

**Before disabling a payment gateway:**
- You cannot disable both Easebuzz and Razorpay simultaneously. Keep at least one active.
- If one gateway is failing, disable it and let the other handle payments.

**When a buyer claims their payment went through but the portal doesn't show it:**
- Check Payment Transactions module for the transaction status.
- If stuck in pending, the reconciliation cron will re-check within 5–15 minutes.
- If it has been more than 30 minutes: check gateway dashboard and escalate to technical support.

**When approving offline payments:**
- Offline payments (NEFT/Cheque/Cash) submitted by SMs or buyers are in VERIFICATION status until you approve them.
- Approve only after verifying the transaction proof document.

**When a buyer's LSQ or Mavis sync is failing:**
- Look for the sync flags in the customer detail view. Failed flags will show `false`.
- The cron retries every 10 minutes. Wait 30 minutes before escalating to technical support.

---

### Buyer: Key Rules You Must Know

**What you need before you can do each step:**

| Action | What's Required |
|--------|----------------|
| Participate in allocation | Registration payment confirmed |
| Select/be assigned a unit | Active campaign in LIVE status |
| Complete KYC | WINNER status (unit booking confirmed) |
| Apply for home loan | KYC submitted |
| Pay milestones | KYC submitted (payment schedule generated after KYC) |
| Raise a support ticket | Active unit booking |

**On hold timers:**
- Once you select a unit or are assigned one, you have 20 minutes to complete payment.
- If the timer expires, the unit is released and you may need to select again.

**On partial milestone payments:**
- You do not have to pay a milestone in full at once.
- Partial payments are accepted. The milestone moves to Partial status and the balance is tracked.

**On cancellation:**
- A CANCELLATION support ticket does NOT cancel your booking immediately.
- It starts a manual review. A team member will contact you.

---

### Channel Partner: Key Rules You Must Know

**When registering a buyer:**
- The buyer's mobile number is their unique identifier. You cannot register the same mobile number twice.
- NRI flag must be set at registration — it cannot be changed later.
- Your name is permanently associated with this registration for commission tracking.

**On JBP submissions:**
- All 14 fields are mandatory. Incomplete submissions are blocked.
- Submit JBP from the JBP Submission section — it cannot be submitted from the leads list.

**On visibility:**
- You can only see your own leads. Other CPs' buyers are not visible to you.

---

### Sales Manager: Key Rules You Must Know

**On callback assignment:**
- You are assigned callbacks in round-robin order. The SM who was assigned a request longest ago gets the next one.
- You cannot manually claim or reassign callbacks.

**On VC outcomes:**
- You must record one of 10 possible outcomes after every call attempt.
- Only `VC_DONE_PREFERENCE` and `VC_2_DONE` trigger the VC_REQUEST offer discount for the buyer.

**On offline payments:**
- When you record an offline payment, it is in VERIFICATION status until admin approves it.
- Do not tell the buyer their payment is confirmed until admin has approved it.

**On physical allocation:**
- You guide the buyer through 3 screens: unit selection, payment initiation, confirmation.
- The 20-minute hold rule applies — buyer must complete payment before it expires.

---

## 19. Related Documents

- [[Business-Rules]] — Technical business rules reference (database field names, enforcement points)
- [[BRD-Allocation-Workflow]] — Allocation rules in workflow context
- [[BRD-Payment-Workflow]] — Payment validation rules in workflow context
- [[BRD-KYC-Workflow]] — KYC gates and triggers
- [[BRD-Integrations]] — Non-blocking integration failure handling
- [[BRD-Glossary]] — Term definitions for all status values and domain terms
