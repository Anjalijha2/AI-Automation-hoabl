# BF-001 — Allocation Campaign Lifecycle

**Type:** Business Flow
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

This document maps the end-to-end lifecycle of an allocation campaign — from pre-campaign setup through live event to post-allocation close-out. It covers all three allocation types (STATIC, DYNAMIC, PHYSICAL_EVENT) and all actors involved.

---

## 2. Actors

| Actor | Role in This Flow |
|-------|-----------------|
| Admin | Configures campaign, starts and stops event, monitors, overrides |
| Buyer | Registers, participates in allocation, completes payment |
| Sales Manager (SM) | Assists in Physical Events; records warmup preferences in DYNAMIC |
| Python WebSocket Server | Broadcasts real-time unit updates to all connected users |
| Redis | Holds live unit state and 20-min hold timers |
| Easebuzz / Razorpay | Processes online payments; sends webhook confirmation |
| Node.js Backend | Validates webhook; updates DB; triggers Python broadcasts |

---

## 3. Phase 1 — Pre-Campaign Setup

```
Admin
  │
  ├─ 1. Configure towers and units in Admin Portal
  │      Set unit status = AVAILABLE for all allocatable units
  │      Reserve specific units if needed (status = RESERVED)
  │
  ├─ 2. Configure allocation campaign
  │      Set: campaign type (STATIC / DYNAMIC / PHYSICAL_EVENT)
  │      Set: campaign window (start date/time, end date/time)
  │      Set: eligible typologies
  │      Set: round duration (DYNAMIC only)
  │
  ├─ 3. Configure offers (optional)
  │      Enable EARLY_BIRD, HOME_LOAN, VC_REQUEST offers if applicable
  │
  ├─ 4. Update Strapi CMS
  │      Upload allocation hero slides and header messages
  │      Verify band config aligns with unit structure (DYNAMIC only)
  │
  └─ 5. Verify buyer eligibility
         All registered buyers must have paymentStatus = success
         Admin can toggle availableForAllocation = false to exclude specific buyers
```

---

## 4. Phase 2 — Buyer Registration (Pre-Campaign)

```
Buyer (or CP on buyer's behalf)
  │
  ├─ 1. Fill registration form in Buyer Portal / CP Portal
  │      Provide personal details, preferences, purchase purpose
  │
  ├─ 2. Pay registration fee
  │      Gateway: Easebuzz or Razorpay
  │      Status: pending → success (via webhook)
  │
  ├─ 3. Registration confirmed
  │      Registration status = Won
  │      Buyer allocation status = REGISTERED
  │      LSQ: registration activity created
  │
  └─ 4. Buyer waits for campaign to go live
         Receives WhatsApp/SMS notification when campaign opens
```

---

## 5. Phase 3 — Campaign Warmup (DYNAMIC Only)

```
Admin
  │
  └─ Opens WARMUP phase before campaign goes live

SM (for each buyer)
  │
  └─ Enters buyer unit preferences via SM Portal warmup screen
     Preferences recorded against buyer registration

Python WebSocket Server
  │
  └─ Loads all towers, floors, units, registrations into Redis
     Campaign NOT yet RUNNING — buyers cannot select units
```

---

## 6. Phase 4 — Campaign Goes Live

```
Admin
  │
  └─ Clicks "Start Campaign" in Admin Portal

Node.js Backend
  │
  └─ Calls Python /campaign/start

Python WebSocket Server
  │
  ├─ Runs warmup (if not already done):
  │    Loads all data into Redis
  │    Sets campaign status = RUNNING in Redis
  │
  └─ Broadcasts connection_established to all connected buyers
     Buyers see unit grid / receive unit assignment
```

---

## 7. Phase 5A — STATIC Live Allocation

```
Buyer
  │
  ├─ Loads tower list → sees all active towers
  ├─ Selects tower → sees floor-by-floor unit grid (white/orange/red/blue)
  ├─ Clicks available unit (white) → sends pay_now_initiated
  │
Python WebSocket Server
  │
  ├─ Unit → HOLD in Redis
  ├─ Broadcasts tower_refresh to ALL buyers (unit turns orange)
  │
Buyer
  │
  ├─ Redirected to Easebuzz / Razorpay checkout
  ├─ Completes payment
  │
Gateway
  │
  └─ Sends webhook to Node.js Backend

Node.js Backend
  │
  ├─ Validates HMAC signature
  ├─ Updates DB: transaction = completed, registration unit = WINNER, unit = BOOKED
  ├─ Calls Python /update-payment-status
  │
Python WebSocket Server
  │
  ├─ Redis: unit → BOOKED
  ├─ Broadcasts tower_refresh (unit turns red) to ALL buyers
  ├─ Broadcasts unit_sold to ALL buyers EXCEPT winner
  └─ Sends user_details_response to winning buyer (confirms WINNER)

--- IF PAYMENT FAILS OR 20 MIN EXPIRES ---

Node.js Backend / Cron
  │
  └─ Calls Python /update-payment-status (payment_status = false)

Python WebSocket Server
  │
  └─ Redis: unit → AVAILABLE
     Broadcasts tower_refresh (unit turns white) to ALL buyers
```

---

## 7. Phase 5B — DYNAMIC Live Allocation

```
Python WebSocket Server
  │
  └─ Round 1 RUNNING — assigns one unit per buyer (round-robin)
     Assignment follows: tower sequence → band order → available units

Each Buyer
  │
  └─ Receives user_details_response showing their assigned unit
     Clicks "Proceed to Pay"

Buyer pays (same gateway flow as STATIC)

--- PAYMENT SUCCESS ---
  → WINNER confirmed
  → unit_sold broadcast to all other buyers

--- PAYMENT FAILURE ---
  → System finds next available unit (same typology, next band position)
  → If found: buyer reassigned → receives reallocation_notification
  → If not found: buyer → WAITLIST → receives reallocation_notification (MISSED)
  → Lost unit recorded in Redis and AOF file

Round 1 timer expires
  → Round 2 RUNNING
  → WAITLIST buyers from Round 1 get new unit assignments
  → Process repeats until all buyers are WINNER or no units remain
```

---

## 7. Phase 5C — Physical Event Allocation

```
Buyer arrives at project site
  │
  └─ Receives HV Code at registration desk

SM (in SM Portal)
  │
  ├─ Screen 1: Enters buyer's HV Code → buyer registration identified
  ├─ Screen 2: Shows unit grid → SM selects unit for buyer
  │             Unit → HOLD (20-min timer starts)
  └─ Screen 3: Initiates payment on buyer's behalf
               Same gateway flow as STATIC
               WINNER confirmed on webhook success
```

---

## 8. Phase 6 — Post-Allocation (Per Winning Buyer)

```
Winning Buyer (WINNER status confirmed)
  │
  ├─ Receives WhatsApp/SMS: "Unit booking confirmed"
  │
  ├─ LSQ: booking token activity created
  ├─ Mavis: booking record created, unit status → Booked
  │
  ├─ Buyer logs into Buyer Portal → KYC flow begins
  │    Uploads: photo, PAN, Aadhaar front, Aadhaar back (per applicant)
  │    Max 4 applicants (1 primary + 3 co-applicants)
  │
  ├─ KYC submitted
  │    → Milestone payment schedule generated
  │    → LSQ: booking form activity created
  │    → Mavis: booking status → Final
  │    → KYC PDF generated (within 10 min by cron)
  │    → Any KYC-gated offer discounts applied
  │
  └─ Buyer begins milestone payments (construction-linked instalments)
```

---

## 9. Phase 7 — Campaign Close-Out

```
Admin
  │
  ├─ STATIC/PHYSICAL_EVENT: Clicks "Stop Campaign"
  │    All AVAILABLE units → WAITLISTED
  │    Campaign status → STOPPED/COMPLETED
  │
  ├─ DYNAMIC — Graceful stop:
  │    System waits for current round to complete
  │    Then closes campaign
  │
  ├─ DYNAMIC — Force stop (emergency only):
  │    Immediate stop regardless of round state
  │    Buyers mid-payment may lose their unit
  │
  └─ Post-campaign:
       Export allocation results (XLSX)
       Review WAITLISTED buyers — decide on next steps
       Check LSQ and Mavis sync flags — retry any failures
       (Cron retries automatically every 10 minutes)
```

---

## 10. Status Summary at Each Phase

| Phase | Unit Status | Registration Unit Status | Buyer Allocation Status |
|-------|------------|------------------------|------------------------|
| Pre-campaign | AVAILABLE | WAITLIST | REGISTERED |
| Payment initiated | HOLD | HOLD | REGISTERED |
| Payment success | BOOKED | WINNER | WINNER |
| Payment failed | AVAILABLE | WAITLIST / ALLOCATED (next unit in DYNAMIC) | REGISTERED |
| Campaign closed, not allocated | WAITLISTED | WAITLIST | WAITLISTED |

---

## 11. Key Business Rules for This Flow

| Rule | Impact on Flow |
|------|---------------|
| 20-minute hold | Buyer must complete payment before hold expires or unit is lost |
| Webhook is source of truth | Unit status only changes to BOOKED after validated webhook — never on browser redirect |
| At-least-one gateway | Admin cannot disable both Easebuzz and Razorpay simultaneously |
| KYC gates payment schedule | Milestone schedule only generated after KYC is submitted |
| DYNAMIC warmup required | Campaign cannot go RUNNING without warmup completing first |
| Redis failure halts campaign | If Redis goes down during LIVE event, stop campaign immediately |

---

## 12. Related Documents

- [[BRD-Allocation-Workflow]] — Allocation workflow with business rules
- [[BRD-Realtime-Events]] — WebSocket and Redis technical detail
- [[BRD-Payment-Workflow]] — Payment gateway processing
- [[BRD-KYC-Workflow]] — Post-winner KYC flow
- [[BRD-Status-Flows]] — Unit and registration status transitions
- [[BRD-Integrations]] — LSQ and Mavis post-allocation sync
