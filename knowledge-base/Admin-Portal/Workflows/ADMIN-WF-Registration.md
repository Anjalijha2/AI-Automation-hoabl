# Registration Workflow — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Buyer Portal, CP Portal, Admin Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

Registration is the process by which a buyer formally enters the XR Portal system and pays the registration fee, becoming eligible to participate in allocation campaigns. Without a completed registration, a buyer cannot book a unit.

Registration can be initiated by the buyer directly or by a Channel Partner on their behalf.

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Buyer | Provides details, pays registration fee |
| Channel Partner | Registers buyer via CP Portal on their behalf |
| Admin | Views, manages, cancels registrations |
| System | Creates records, syncs to LeadSquared, notifies buyer |

---

## 3. Two Registration Paths

### Path A — Buyer Self-Registration

1. Buyer visits Buyer Portal, authenticates via OTP
2. Buyer fills registration form: personal details, typology preference, co-applicant (optional)
3. Buyer accepts Terms and Conditions
4. System creates Registration record (status = Open, paymentStatus = pending)
5. Buyer pays registration fee via Easebuzz or Razorpay
6. Gateway webhook confirms payment
7. Registration becomes active (paymentStatus = success, availableForAllocation = true)
8. System syncs to LeadSquared, sends WhatsApp confirmation to buyer

### Path B — CP-Initiated Registration

1. CP logs into CP Portal, opens registration form
2. CP enters buyer's personal details and typology preference
3. CP ticks T&C consent on buyer's behalf (required)
4. Registration is tagged to CP (`brokerId` = CP's user ID, `walkInSourceXrCode` = CP's hvCode)
5. Payment flow is same as Path A
6. CP can track the buyer's progress in their dashboard

---

## 4. Registration Status Lifecycle

| Status | Meaning |
|--------|---------|
| Open + paymentStatus pending | Created, awaiting payment |
| Open + paymentStatus success | Active — buyer eligible for campaigns |
| Won | Unit booking confirmed (WINNER) |
| Lost | Cancellation initiated |
| Refund | Cancellation complete, refund processed |

**Registration number format:** GHNG-XXXXXXXXXX (10 digits)
Additional units for same buyer: GHNG-XXXXXXXXXX-A, -B, -C

---

## 5. Key Business Rules

1. **Payment gates eligibility:** `availableForAllocation = true` is only set after payment webhook confirms success. Browser redirect alone never changes status.
2. **Webhook is source of truth:** Backend validates the payment gateway's hash/signature before updating any record. Fraudulent webhooks are rejected.
3. **Refund exclusion:** Records with status = Refund are excluded from all standard admin views. Only visible when admin explicitly requests them.
4. **Multiple registrations:** A buyer can have multiple registrations (different projects, or multiple units for the same project). Each is tracked separately.
5. **CP isolation:** CP sees only customers where `brokerId` = their user ID. They cannot view other CPs' customers.
6. **Cancellation is multi-step:** Admin must process refund separately after setting status = Lost. Setting Lost does not auto-process any refund.
7. **Reconciliation safety net:** A cron runs every 15 minutes to catch registration payments where the webhook was missed — buyers who paid but were not marked as active are corrected automatically.

---

## 6. Admin Workflow — Managing Registrations

| Action | Where |
|--------|-------|
| View all registrations | Admin Portal → Customers module |
| Search by name, registration number, or stage | Customers module search |
| Cancel a registration | Customer detail → Cancel Registration |
| Download registrations list | Customers module → Download |

---

## How to Use: Registration Workflow

---

### Buyer: Registering Yourself

**Step 1:** Go to the Buyer Portal and log in with your mobile OTP.

**Step 2:** Complete the registration form — enter your name, contact details, address, and typology preference (which apartment type you want).

**Step 3:** Accept the Terms and Conditions, then proceed to payment.

**Step 4:** Pay the registration fee via the payment gateway (Card, UPI, NetBanking, Wallet).

**Step 5:** On successful payment, you will receive a WhatsApp confirmation message with your registration number (GHNG-XXXXXXXXXX). You are now registered and eligible to participate in the next allocation campaign.

---

### Channel Partner: Registering a Customer

**Step 1:** Log in to the CP Portal and click **Register Customer** on your dashboard.

**Step 2:** Fill in your customer's details: first name, last name, mobile number, email, purchase purpose, home loan intent, and budget.

**Step 3:** Tick the T&C/Undertaking consent checkbox (required on behalf of the customer).

**Step 4:** Submit. The customer will receive a WhatsApp notification and appear in your dashboard table.

> **If you get a duplicate error:** A registration with the same mobile or email already exists for this project.

---

### Admin: Cancelling a Registration

**Step 1:** Go to Customers module, find the registration, and click the customer row.

**Step 2:** In the customer detail view, click **Cancel Registration**.

**Step 3:** Enter the reason for cancellation. The registration status changes to Lost.

**Step 4:** Process the refund separately via the Payment Transactions module.

---

## 7. Related Documents

- [[Registration-Workflow]] — Technical end-to-end flow reference
- [[Payment-Workflow]] — Registration payment gateway details
- [[BRD-CP-Portal]] — CP Portal customer registration
- [[Feature-Spec - Customer Registration]] — CP Portal Feature-Spec
- [[BRD-Buyer-Portal]] — Buyer Portal registration and login
