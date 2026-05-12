# Status Flows — BRD

**Type:** Status Flow Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

This document is the authoritative reference for every status value used across the XR Portal. When a status badge appears on a screen, this document defines exactly what it means, what caused it, and what comes next.

---

## 2. Unit Status Flow

Units move through these statuses during their lifecycle:

```
AVAILABLE
    │
    │ Buyer initiates payment / Admin holds
    ▼
  HOLD ──── (20 min expires / payment fails) ────► AVAILABLE
    │
    │ Payment confirmed via webhook
    ▼
 BOOKED
    │
    │ Admin cancels booking
    ▼
AVAILABLE (back in pool)

Admin-Only States:
AVAILABLE ──► RESERVED   (admin reserves for a specific buyer)
RESERVED  ──► AVAILABLE  (admin releases reservation)
AVAILABLE ──► REFUGE     (permanent — unit is not for sale)
```

| Status | Visible Colour | Meaning |
|--------|---------------|---------|
| AVAILABLE | White | Open for selection |
| HOLD | Orange | Payment in progress — held for up to 20 minutes |
| BOOKED | Red | Confirmed sold |
| RESERVED | Blue | Admin-reserved — not available to buyers |
| REFUGE | — | Permanently removed from sale inventory |

---

## 3. Registration Status Flow

```
Registration Created
    │ status = Open, paymentStatus = pending
    │
    │ Payment successful
    ▼
  Won (status = Won)
    │
    │ Allocation → KYC → Milestone Payments
    │
    │ Cancellation requested
    ▼
  Lost (status = Lost)
    │
    │ Refund processed
    ▼
  Refund (status = Refund) ← excluded from all default queries
```

| Status | Meaning |
|--------|---------|
| Open | Registration created, payment pending or payment failed |
| Won | Registration payment confirmed |
| Lost | Booking cancelled |
| Refund | Refund processed — record preserved but hidden from default views |

---

## 4. Registration Unit (Buyer-to-Unit) Status Flow

Tracks the allocation relationship between a buyer registration and a specific unit:

```
WAITLIST
    │ Campaign starts — system assigns unit
    ▼
ALLOCATED ──── (20 min / payment failure) ────► WAITLIST (or next unit in DYNAMIC)
    │
    │ Buyer initiates payment
    ▼
  HOLD ──── (20 min / payment failure) ────► WAITLIST
    │
    │ Payment success (webhook confirmed)
    ▼
 WINNER ─────────── (final confirmed state)
    │
    │ Admin cancels unit (post-booking)
    ▼
 REFUND
```

Special pre-campaign state:
```
PREALLOCATED ← Admin pre-assigns unit before campaign starts
```

| Status | Meaning |
|--------|---------|
| WAITLIST | No unit assigned yet |
| PREALLOCATED | Admin pre-assigned before campaign |
| ALLOCATED | Unit assigned during campaign — payment not yet started |
| HOLD | Buyer initiated payment — hold timer running |
| WINNER | Payment confirmed — unit booking finalised |
| REFUND | Unit was booked then cancelled/refunded |

---

## 5. Allocation Campaign Status Flow

```
NOT_STARTED ──► RUNNING ──► COMPLETED
                    │
                    ├──► STOPPED (graceful admin stop)
                    │
                    └──► FAILED (error during campaign)

NOT_STARTED ──► CANCELLED (cancelled before it started)
STOPPED ──► RUNNING (restarted by admin)
```

| Status | Meaning |
|--------|---------|
| NOT_STARTED | Campaign configured, not yet live |
| RUNNING | Campaign active — buyers can participate |
| COMPLETED | Campaign ended normally |
| STOPPED | Admin stopped the campaign early |
| FAILED | Technical failure during campaign |
| CANCELLED | Campaign cancelled before it started |

---

## 6. Payment Transaction Status Flow

```
initiated → pending → completed
                  └──► failed
                  └──► cancelled
                  └──► dropped
                  └──► bounced

completed ──► refunded (if refund is processed)
```

| Status | Meaning |
|--------|---------|
| initiated | Payment process begun |
| pending | Awaiting gateway webhook confirmation |
| completed | Payment confirmed by validated webhook |
| failed | Gateway rejected the payment |
| cancelled | Payment was cancelled |
| dropped | Connection dropped during payment |
| bounced | Payment returned by bank |
| refunded | Payment reversed after completion |

---

## 7. Milestone Payment Status Flow

```
pending → partial → paid

Offline payment verification:
null → VERIFICATION → PAID
```

| Status | Meaning |
|--------|---------|
| pending | Amount due, no payment received |
| partial | Some amount paid, balance remaining |
| paid | Full amount confirmed |
| VERIFICATION | Offline payment submitted, awaiting admin approval |
| PAID | Admin confirmed offline payment |

---

## 8. Callback Request Status Flow

```
REQUESTED → SCHEDULED → CONFIRMED → COMPLETED
     │
     └── RESCHEDULED → SCHEDULED → CONFIRMED → COMPLETED
```

| Status | Meaning |
|--------|---------|
| REQUESTED | Buyer submitted callback request |
| SCHEDULED | SM scheduled a time slot |
| RESCHEDULED | SM changed the time slot |
| CONFIRMED | Meeting confirmed |
| COMPLETED | Call done, SM has recorded outcome |

---

## 9. Home Loan Approval Status Flow

```
(not applied) → pending → approved
                       └──► admin_rejected
```

| Status | Meaning |
|--------|---------|
| pending | Application submitted, awaiting processing |
| approved | Approved via Easiloan bank flow |
| admin_approved | Manually approved by admin (self-financing path) |
| admin_rejected | Admin rejected — hidden from home loan indicator in customer list |

---

## 10. JBP Status Flow

```
Cycle: OPEN → CLOSED

Submission: PENDING → APPROVED
                  └──► REJECTED

Submission version: ACTIVE → EXPIRED (when replaced by new version)
```

---

## 11. Parking Inventory Status Flow

```
AVAILABLE ──► HOLD ──► BOOKED
HOLD ──────────────────────────► AVAILABLE (payment fails or expires)
BOOKED ────────────────────────► AVAILABLE (admin releases)
```

---

## 12. CP Broker Referral Status Flow

```
pending → approved
      └──► rejected
```

---

## How to Use: Reading Status Across the Admin Portal

---

### Admin: What to Do For Each Status

**Unit is HOLD and has been for more than 20 minutes:**
- The cron job releases holds automatically every 1 minute.
- If a unit appears stuck on HOLD after 30 minutes, check Payment Transactions for the associated pending transaction.
- Reconciliation cron will catch missed webhooks within 5–15 minutes.

**Registration Unit is ALLOCATED but not WINNER after campaign:**
- Buyer was assigned a unit but did not complete payment in time.
- In DYNAMIC campaigns: system may have reallocated them to a new unit.
- Check Registration Unit record for current status and any WAITLIST entries.

**Payment Transaction is pending for more than 15 minutes:**
- Reconciliation cron checks every 5 minutes (allocation) or 15 minutes (registration).
- If still pending after 30 minutes: check the gateway dashboard for the transaction.
- Do not manually update payment status — let reconciliation handle it.

**Milestone is VERIFICATION:**
- Offline payment recorded by SM, waiting for admin approval.
- Review the payment proof document before approving.

---

### Buyer: What Your Statuses Mean

**Registration status = Registered:**
- You have paid registration. Wait for campaign to go live.

**Registration Unit status = HOLD:**
- Your unit is held. You have 20 minutes to complete payment. Act immediately.

**Registration Unit status = WINNER:**
- Congratulations — your unit is confirmed. Proceed to KYC.

**Registration Unit status = WAITLIST:**
- You were not allocated a unit in this round. Admin may run another campaign or contact you.

**Milestone status = partial:**
- You have made some payments. Balance is still due. No action required immediately unless a demand letter has been sent.

---

## 13. Related Documents

- [[BRD-Allocation-Workflow]] — Campaign lifecycle and unit hold rules
- [[BRD-Payment-Workflow]] — Payment transaction flow
- [[BRD-KYC-Workflow]] — Post-WINNER flow
- [[BRD-Business-Rules]] — Rules governing each status transition
- [[BRD-Glossary]] — One-line definitions for all status values
