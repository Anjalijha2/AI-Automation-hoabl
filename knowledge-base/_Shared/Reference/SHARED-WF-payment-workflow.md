# Payment Workflow

**Type:** End-to-End Workflow
**Last Updated:** 2026-05-10
**Tags:** #workflow/payment #status/complete

---

## Related Notes
- [[Backend-Functional-BRD]]
- [[Allocation-Workflow]]
- [[Unit-Status-Flow]]
- [[Integrations]]
- [[Business-Rules]]

---

## Overview

XR Portal handles two distinct payment flows: Registration Payment (buyer pays to register for an allocation event) and Unit Allocation Payment (buyer pays the booking token amount when a unit is confirmed). Both flows share the same gateway infrastructure but have different business outcomes.

---

## Payment Gateways

| Gateway | Identifier | Flow Type | Key Mechanism |
|---------|-----------|-----------|--------------|
| Easebuzz | `easebuzz` / `eazypay` (legacy) | Hash-redirect | HMAC SHA-512 hash, redirect to checkout page |
| Razorpay | `razorpay` | Order-based SDK | Razorpay order created, frontend SDK handles UI |

The system uses a **Gateway Facade** (`PaymentGatewayService`) that resolves the correct gateway automatically from the `gateway` field on the PaymentTransaction record. Business logic never calls Easebuzz or Razorpay directly.

---

## Flow 1: Registration Payment

### Purpose
A buyer pays the registration amount to become eligible to participate in an allocation event. This is a one-time payment per registration.

### End-to-End Flow

```
1. BUYER INITIATES REGISTRATION
   Buyer fills registration form (personal details, typology preference)
   System creates a Registration record with:
     - status = Open
     - paymentStatus = pending
   
2. PAYMENT INITIATION
   Backend calls PaymentGatewayService.initiatePayment()
   A PaymentTransaction record is created:
     - transactionType = 1 (Registration)
     - status = initiated
     - gateway = easebuzz (default)
   
   For Easebuzz:
     - Backend generates HMAC SHA-512 hash from payment fields
     - Hash includes: key + txnid + amount + product + name + email + phone + surl + furl
     - Buyer is redirected to Easebuzz checkout page
   
   For Razorpay:
     - Backend creates a Razorpay Order (stores gatewayOrderId on transaction)
     - Frontend loads Razorpay SDK with the order ID
     - Buyer completes payment in the Razorpay modal

3. BUYER COMPLETES PAYMENT
   Buyer pays via their preferred method:
   - Credit Card / Debit Card / UPI / Net Banking / Wallet / EMI (Easebuzz)
   - Card / UPI / Net Banking (Razorpay)
   
4. GATEWAY WEBHOOK RECEIVED
   Gateway sends webhook to backend callback URL
   
   For Easebuzz:
     - Backend validates HMAC SHA-512 hash of incoming payload
     - Invalid hash = webhook rejected (no DB update)
     - Valid hash = proceed to update
   
   For Razorpay:
     - Backend verifies Razorpay webhook signature
     - Invalid signature = rejected
     - Valid signature = proceed
   
5. TRANSACTION STATUS UPDATE
   PaymentTransaction record updated:
     - payment success: status = completed
     - payment failure: status = failed / cancelled / dropped / bounced
   
6. REGISTRATION STATUS UPDATE (on success)
   Registration.paymentStatus = success
   Registration.status remains Open (not Won — that happens after unit allocation)
   availableForAllocation = true (buyer is now eligible for campaigns)
   
7. LEADSQUARED SYNC
   LSQ Registration Activity created:
     - Captures registration details and payment amount
   
8. PYTHON/WEBSOCKET NOTIFICATION
   Backend calls Python service /broadcast-registrations
   Buyer receives updated user_details_response via WebSocket (if connected)
   
9. KALEYRA NOTIFICATION
   Registration confirmation WhatsApp message sent to buyer
```

---

## Flow 2: Unit Allocation Payment

### Purpose
After a buyer selects a unit (STATIC) or is assigned a unit (DYNAMIC) during an allocation campaign, they pay the booking token amount to secure the unit.

### End-to-End Flow

```
1. UNIT HOLD PLACED
   
   For STATIC:
     Buyer clicks unit → sends pay_now_initiated WebSocket message
     WebSocket server places HOLD on unit in Redis
     holdAt timestamp recorded
   
   For DYNAMIC:
     Buyer clicks Proceed to Pay → sends proceed_to_pay WebSocket message
     Server validates allocation, confirms unit assignment
   
   For PHYSICAL_EVENT:
     SM selects unit on buyer's behalf
     System places HOLD

2. PAYMENT INITIATION
   Backend creates PaymentTransaction:
     - transactionType = 2 (Unit Allocation)
     - status = initiated
     - metadata.formData.unitRequested = [{ registrationNumber, unitId }]
       (array supports multiple registrations in one transaction)
   
   RegistrationUnit.status set to HOLD in database
   Unit.status set to HOLD in database
   holdAt timestamp set on both records

3. BUYER COMPLETES PAYMENT (within 20-minute window)
   Same gateway flow as Registration Payment
   Buyer must complete payment before 20-minute hold expires

4. HOLD EXPIRY HANDLING (if payment not completed)
   Background cron detects hold older than 20 minutes:
   
   a. ParkingInventory released:
      status = AVAILABLE, registrationUnitId = null, holdAt = null
   
   b. RegistrationUnit reset:
      status = ALLOCATED (DYNAMIC) or WAITLIST (STATIC)
      unitId = null, towerId = null
   
   c. Unit master reset:
      status = AVAILABLE
   
   d. Python service notified:
      POST /update-payment-status { payment_status: false }
   
   e. WebSocket broadcast:
      tower_refresh sent to ALL buyers (unit shows green/available again)

5. GATEWAY WEBHOOK RECEIVED (payment completed or failed)

   5a. PAYMENT SUCCESS
       Transaction status = completed
       
       RegistrationUnit.status = WINNER
       Unit.status = BOOKED
       Registration.status = Won (if not already)
       
       Python service called:
       POST /update-payment-status { payment_status: true, registration_detail: [...] }
       
       WebSocket broadcasts:
       - tower_refresh to ALL users (unit shows red)
       - unit_sold to ALL users EXCEPT the winning buyer (masked registration number)
       - user_details_response to the winning buyer (shows WINNER status)
       
       LeadSquared:
       - Booking Token Activity created (bookingTokenActivitySubmitted = true)
       
       Mavis ERP:
       - Booking record created (mavisBookingCreated = true)
       - Unit status updated (mavisUnitUpdated = true)
       
       Kaleyra:
       - Unit allocation success WhatsApp + SMS to buyer
   
   5b. PAYMENT FAILURE
       Transaction status = failed / dropped / cancelled / bounced
       
       resetUnitStatuses() called:
       - Parking released
       - RegistrationUnit reset
       - Unit reset to AVAILABLE
       
       Python service called:
       POST /update-payment-status { payment_status: false }
       
       WebSocket broadcasts:
       - tower_refresh (unit shows green again)
       
       Kaleyra:
       - Payment failure SMS to buyer
       
       For DYNAMIC allocation failure:
       - System immediately finds next available unit of same typology
       - If found: buyer gets new ALLOCATED unit, reallocation_notification sent
       - If not found: buyer placed on WAITLIST

6. RECONCILIATION CRON (edge cases)
   For transactions stuck in pending state:
   checkAndProcessAllocationByReferenceService() runs periodically
   
   Steps:
   a. Verify payment status directly with gateway (no DB write)
   b. If gateway confirms success AND DB still shows pending:
      - Update transaction to completed
      - Trigger same success flow as webhook (Python notification, etc.)
   c. If gateway confirms failure AND DB still shows pending:
      - Update transaction to failed
      - Trigger reset flow
```

---

## Flow 3: Offline Payment

### Purpose
For PHYSICAL_EVENT scenarios or exceptional cases where buyers pay via cash, cheque, or bank transfer outside the payment gateway.

### End-to-End Flow

```
1. SM / ADMIN RECORDS OFFLINE PAYMENT
   isOffline = true set on PaymentTransaction
   Payment proof document uploaded to Azure Blob
   paymentProof field stores blob path
   paymentSource = 'admin'

2. ADMIN REVIEW AND APPROVAL
   Admin views pending offline payment in Payment Transactions screen
   Admin verifies payment proof
   Admin manually approves or rejects

3. ON APPROVAL
   Same status update and downstream flow as online payment success:
   - RegistrationUnit → WINNER
   - Unit → BOOKED
   - LSQ, Mavis, Kaleyra notifications triggered
```

---

## Flow 4: Milestone Payment

### Purpose
After KYC, buyers make construction-linked payments as the project progresses.

### End-to-End Flow

```
1. MILESTONE SCHEDULE GENERATION
   After KYC submission, insertPaymentScheduleandUpdateMilestone() runs
   MilestonePaymentTracking records created for all milestone keys (ml-or, ml-ual, ml-hcf, etc.)
   Each record: status = pending, totalAmount set, totalPaid = 0

2. DEMAND LETTER TRIGGER
   Admin marks a construction milestone as reached
   System generates demand letters for all buyers at that milestone stage
   Buyers receive notification to make payment

3. BUYER MAKES PAYMENT
   Buyer initiates payment from Payment Schedule in Buyer Portal
   Same gateway flow (Easebuzz or Razorpay)
   
4. PAYMENT RECEIVED
   MilestonePaymentTracking updated:
     - totalPaid incremented
     - balanceAmount recalculated
     - status = partial (if balance > 0) or paid (if balance = 0)
     - paymentStatus = VERIFICATION → PAID after admin verification

5. GST AND HOME LOAN TRACKING
   GST payment tracked separately (gstPaid, gstPaidAmount fields)
   Home loan disbursement tracked (homeLoanAmount field)
   Admin can record bank disbursements directly
```

---

## Transaction Status Reference

| Status | Meaning | Next Possible States |
|--------|---------|---------------------|
| `initiated` | Transaction created, payment not yet attempted | pending, failed |
| `pending` | Payment submitted, awaiting gateway confirmation | completed, failed, cancelled, dropped, bounced |
| `completed` | Payment confirmed by gateway | refunded |
| `failed` | Payment explicitly failed | (terminal) |
| `cancelled` | Payment cancelled by buyer | (terminal) |
| `dropped` | Connection dropped during payment | (terminal) |
| `bounced` | Bank/card rejection | (terminal) |
| `refunded` | Refund processed | (terminal) |

---

## Payment Methods Supported

### Easebuzz
- CC (Credit Card)
- DC (Debit Card)
- UPI
- NB (Net Banking)
- MW (Mobile Wallet)
- EMI

### Razorpay
- Card
- UPI
- Net Banking
- Wallets

---

## Transaction Types Reference

| Type ID | Name | Trigger |
|---------|------|---------|
| 1 | Registration | Buyer registration payment |
| 2 | Unit Allocation | Booking token payment |

---

## Key Business Safeguards

1. **Webhook is source of truth** — Return URL from browser is never used for payment confirmation
2. **Hash/signature validation before any DB update** — Prevents fraudulent webhook injection
3. **20-minute hold auto-release** — Prevents units being locked indefinitely
4. **Reconciliation cron** — Catches missed webhooks and stuck pending transactions
5. **Atomic DB transactions** — Unit status and registration status updates happen in one DB transaction
6. **LSQ/Mavis failures non-blocking** — Integration failures are retried via cron; do not block the buyer's confirmation
7. **Soft deletes only** — No transaction records are ever deleted; full audit trail preserved
