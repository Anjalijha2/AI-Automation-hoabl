# Payment Workflow — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Buyer Portal, SM Portal, Admin Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Payment Workflow covers all money movement on the XR Portal platform: registration payment, unit booking (allocation) payment, offline payments, and construction milestone payments. All payment types share the same gateway infrastructure but have different business outcomes.

---

## 2. Payment Gateways

| Gateway | Type | Payment Methods |
|---------|------|----------------|
| Easebuzz | Hash-redirect | Credit Card, Debit Card, UPI, NetBanking, Wallet, EMI |
| Razorpay | Order-based SDK | Card, UPI, NetBanking, Wallets |

The system uses a Gateway Facade that automatically routes to the correct gateway — business flows never call Easebuzz or Razorpay directly.

---

## 3. Payment Types

| Type | When | Trigger |
|------|------|---------|
| **Registration** | Buyer pays to register as eligible for campaigns | On submission of registration form |
| **Unit Allocation** | Buyer pays booking token to lock a unit | During active allocation campaign |
| **Offline** | Cash, cheque, RTGS recorded manually by SM/admin | Physical event or exceptional cases |
| **Milestone** | Construction-linked instalments after KYC | Triggered by construction stage completion |

---

## 4. Flow 1: Registration Payment

1. Buyer fills registration form
2. System creates Registration (status = Open, paymentStatus = pending) and PaymentTransaction (status = initiated)
3. Buyer is redirected to Easebuzz checkout (or Razorpay modal)
4. Buyer pays via preferred method
5. Gateway sends webhook to backend
6. Backend validates hash/signature — invalid = webhook rejected
7. **On success:** paymentStatus = success, availableForAllocation = true
8. **On failure:** registration remains pending; buyer can retry
9. LeadSquared synced; WhatsApp confirmation sent to buyer

---

## 5. Flow 2: Unit Allocation Payment

1. Buyer selects unit (STATIC) or is assigned unit (DYNAMIC)
2. Unit placed on 20-minute HOLD in Redis; holdAt timestamp recorded
3. System creates PaymentTransaction (transactionType = 2, status = initiated)
4. Buyer completes payment in Easebuzz/Razorpay gateway
5. **On success (webhook):**
   - RegistrationUnit → WINNER, Unit → BOOKED
   - WebSocket broadcasts unit_sold to all connected buyers
   - LeadSquared booking token activity submitted
   - Mavis ERP booking record created
   - WhatsApp confirmation sent to buyer
6. **On failure or 20-minute timeout:**
   - Unit hold released → AVAILABLE
   - WebSocket broadcasts unit availability restored
   - For DYNAMIC: system immediately tries to reassign next available unit
7. **Reconciliation cron** runs every 5 minutes to catch missed Easebuzz webhooks

---

## 6. Flow 3: Offline Payment

1. SM opens OfflinePaymentDrawer (SM Portal) or admin enters offline payment
2. SM/admin records: reference number, amount, date, payment method, uploads proof document
3. Transaction marked `isOffline = true`; proof stored in Azure Blob
4. Admin verifies proof → manually approves
5. On approval: same downstream flow as online payment success (WINNER, BOOKED, LSQ, Mavis, Kaleyra)

---

## 7. Flow 4: Milestone Payment

1. Milestone schedule generated after KYC submission — one record per milestone per buyer
2. Construction stage is completed → admin triggers demand letter
3. Buyer receives notification to pay
4. Buyer initiates payment from Payment Schedule in Buyer Portal
5. Same gateway flow (Easebuzz or Razorpay)
6. On success: MilestonePaymentTracking updated (totalPaid incremented, status = partial or paid)
7. Mavis milestone record updated; payment history preserved

---

## 8. Transaction Status Reference

| Status | Meaning |
|--------|---------|
| `initiated` | Payment created, not yet attempted |
| `pending` | Submitted to gateway, awaiting confirmation |
| `completed` | Confirmed by gateway webhook |
| `failed` | Explicitly failed |
| `cancelled` | Buyer cancelled |
| `dropped` | Connection dropped during payment |
| `bounced` | Bank/card rejected |
| `refunded` | Refund processed |

---

## 9. Key Business Rules

1. **Webhook is source of truth:** Browser return URL is never used for payment confirmation. Only the gateway webhook (with validated hash) updates payment status.
2. **Hash/signature validation:** Backend validates HMAC SHA-512 (Easebuzz) or signature (Razorpay) before any DB update. Invalid signatures = rejected.
3. **20-minute hold auto-release:** Background cron releases holds older than 20 minutes. Units cannot be locked indefinitely.
4. **Reconciliation safety net:** Separate crons run every 5–15 minutes to catch stuck pending transactions and missed webhooks.
5. **At-least-one gateway:** Admin cannot disable both Easebuzz and Razorpay simultaneously — at least one must remain active.
6. **Offline payments require proof:** Document upload is mandatory for all offline payment records.
7. **Soft deletes only:** No transaction record is ever deleted. Full audit trail is permanently preserved.
8. **LSQ/Mavis failures non-blocking:** Integration sync failures do not block buyer-facing payment confirmation. They are retried by cron.

---

## How to Use: Payment Workflow

---

### Buyer: Paying the Registration Fee

**Step 1:** After submitting your registration form, you will be taken to the payment screen.

**Step 2:** Select your payment method (Card, UPI, NetBanking, Wallet, or EMI) and complete payment in the Easebuzz gateway.

**Step 3:** On success, you will receive a WhatsApp confirmation. Your registration is now active and you are eligible for the next allocation campaign.

> **If payment fails:** Return to the portal and try again. Your registration remains pending until payment is confirmed.

---

### Buyer: Paying the Booking Token (During Allocation)

**Step 1:** Select a unit during the allocation event. Once selected, you have **20 minutes** to complete payment.

**Step 2:** Tick the T&C checkbox. Click **Pay Confirmation Amount**.

**Step 3:** Complete payment in the Easebuzz gateway. Do not close the browser window during payment.

**Step 4:** On success, your unit is confirmed. The gateway may take a few seconds to process — wait for the Payment Successful screen.

> **If you close the browser mid-payment:** Payment status is determined by the gateway, not your browser. If your bank debited the amount, the system will confirm your booking once the gateway sends confirmation (within minutes).

---

### SM: Recording an Offline Payment

**Step 1:** During a physical allocation event, click **Record Offline Payment** on the unit selection screen.

**Step 2:** Enter: reference number, amount, date, payment method (Cash/NEFT/RTGS/Cheque/UPI/Card Swipe).

**Step 3:** Upload the payment proof document (bank receipt, transfer screenshot, etc.).

**Step 4:** Submit. The payment is recorded as pending admin verification.

**Step 5:** Admin reviews and approves the payment via the Payment Transactions module. On approval, the unit is confirmed as BOOKED.

---

### Admin: Checking Payment Gateway Configuration

**Step 1:** Go to Payment Transactions → click **Settings**.

**Step 2:** Review the current status of each gateway (Easebuzz, Razorpay).

**Step 3:** To enable or disable a gateway, check/uncheck the box and click **Update**.

> **Warning:** Changes take effect immediately system-wide. Never disable a gateway during an active allocation campaign.

---

## 10. Related Documents

- [[Payment-Workflow]] — Technical payment flow reference with code-level details
- [[BRD-Payment-Transactions]] — Admin Portal payment transactions module
- [[BRD-Allocation-Workflow]] — Allocation payment context
- [[BRD-Milestone-Payments]] — Construction milestone payment workflow
- [[Integrations]] — Easebuzz and Razorpay integration details
