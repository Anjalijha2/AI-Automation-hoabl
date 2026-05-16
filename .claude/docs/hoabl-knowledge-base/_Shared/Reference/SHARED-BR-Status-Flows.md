# Unit and Registration Status Flows

**Type:** Status Flow Documentation
**Last Updated:** 2026-05-10
**Tags:** #status-flow #domain/inventory #domain/registration #status/complete

---

## Related Notes
- [[Allocation-Workflow]]
- [[Payment-Workflow]]
- [[Admin-Portal-BRD]]
- [[Buyer-Portal-BRD]]

---

## 1. Unit Status Flow

Units in the `units` table follow this status lifecycle:

```
AVAILABLE ──────────────────────────────────────────────►  
     │                                                    
     │ (buyer initiates payment / admin holds)            
     ▼                                                    
  HOLD ──── (20 min timer expires / payment fails) ───► AVAILABLE
     │                                                    
     │ (payment completed)                                
     ▼                                                    
  BOOKED ◄──────────────────────────────────────────────
     │
     │ (admin cancels)
     ▼
AVAILABLE (back in pool)

Special Admin States:
AVAILABLE ──► RESERVED  (admin reserves for specific buyer)
RESERVED  ──► AVAILABLE (admin releases reservation)
AVAILABLE ──► REFUGE    (permanent designation — not for sale)
AVAILABLE ──► PREBOOKED (pre-booking state)
AVAILABLE ──► PBT       (pre-booking token state)
```

**Database Enum Values:**
```
ENUM('AVAILABLE', 'HOLD', 'BOOKED', 'REFUGE', 'PREBOOKED', 'PBT', 'RESERVED')
```

**Audit Events:**
- ADMIN_UNIT_STATUS_UPDATE: Any admin-initiated status change
- ADMIN_CANCEL_UNIT: Unit cancelled and returned to AVAILABLE

---

## 2. Registration Status Flow

Registrations in the `registrations` table:

```
Registration Created (payment initiated)
     │
     │ status = Open, paymentStatus = pending
     ▼
Payment Successful
     │
     │ status = Won, paymentStatus = success (though won early stages)
     ▼
Unit Allocated → KYC → Milestone Payments
     │
     │ (cancellation requested)
     ▼
     Lost (status = Lost)
     │
     │ (refund processed)
     ▼
     Refund (status = Refund) ← soft-excluded from all default queries
```

**Database Enum Values:**
```
status: ENUM('Open', 'Won', 'Lost', 'Refund')
paymentStatus: ENUM('pending', 'success', 'failed')
```

---

## 3. Registration Unit Status Flow

Registration units in `registration_units` track the buyer-to-unit relationship:

```
WAITLIST ──────────────────────────────────────────────
     │ (campaign starts, buyer assigned unit)           
     ▼                                                  
PREALLOCATED (admin pre-assigns before campaign)        
     │                                                  
     │ OR                                               
     │                                                  
ALLOCATED (system assigns during campaign)              
     │                                                  
     │ (buyer initiates payment)                        
     ▼                                                  
  HOLD ──── (20 min / payment failure) ───► WAITLIST   
     │                                                  
     │ (payment success)                                
     ▼                                                  
  WINNER ────────────────────────────────────────────── (final confirmation)
     │
     │ (if unit later cancelled/refunded)
     ▼
  REFUND
```

**Database Enum Values:**
```
status: ENUM('WAITLIST', 'PREALLOCATED', 'ALLOCATED', 'WINNER', 'HOLD', 'REFUND')
```

**Legacy allocationStatus field (also on registration_units):**
```
allocationStatus: ENUM('confirmed', 'available', 'waiting', 'cancelled', 'refunded')
```

---

## 4. Parking Inventory Status Flow

```
AVAILABLE ──► HOLD ──► BOOKED
HOLD ──────────────────────────► AVAILABLE (if payment fails or hold expires)
BOOKED ────────────────────────► AVAILABLE (admin releases)
```

**Database Enum Values:**
```
status: ENUM('AVAILABLE', 'HOLD', 'BOOKED')
```

---

## 5. Callback Request Status Flow

```
REQUESTED → SCHEDULED → CONFIRMED → COMPLETED
     │
     └── RESCHEDULED → SCHEDULED → CONFIRMED → COMPLETED
```

**Database Enum Values:**
```
status: ENUM('REQUESTED', 'RESCHEDULED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED')
```

---

## 6. Payment Transaction Status Flow

```
initiated → pending → completed
                 └──► failed
                 └──► cancelled
                 └──► dropped
                 └──► bounced
completed → refunded (if refund processed)
```

**Database Enum Values:**
```
status: ENUM('initiated', 'pending', 'completed', 'failed', 'cancelled', 'dropped', 'bounced', 'refunded')
```

---

## 7. Allocation Campaign Status Flow

```
NOT_STARTED ──► RUNNING ──► COMPLETED
                    │
                    ├──────► STOPPED (graceful stop)
                    │
                    └──────► FAILED (error during campaign)

NOT_STARTED ──► CANCELLED (cancelled before starting)
STOPPED     ──► RUNNING   (restarted)
```

**Database Enum Values:**
```
status: ENUM('RUNNING', 'COMPLETED', 'NOT_STARTED', 'FAILED', 'CANCELLED', 'STOPPED')
```

---

## 8. JBP Cycle Status Flow

```
OPEN → CLOSED
```

**JBP Submission Status:**
```
ACTIVE → EXPIRED (when cycle closes or new version created)
```

---

## 9. Milestone Payment Status Flow

```
pending → partial → paid
```

**Payment Verification Status:**
```
null → VERIFICATION → PAID
```

---

## 10. Home Loan Approval Status Flow

```
null (not applied) → pending → approved
                            └──► rejected
                            └──► admin_rejected (admin manually rejected from portal)
```

---

## 11. Broker Referral Status Flow

```
pending → approved
      └──► rejected
```

---

## 12. WebSocket Registration Status (Redis-Based)

During allocation events, Redis maintains its own status for speed:

| Redis Status | Meaning |
|-------------|--------|
| WAITLIST | No unit assigned |
| ALLOCATED | Unit assigned, payment not done |
| WINNER | Payment complete, unit confirmed |
| HOLD | Payment in progress |
| REFUND | Unit refunded |
