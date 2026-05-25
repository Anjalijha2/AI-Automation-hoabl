# CP Portal — Customer Registration User Guide

**Portal:** Channel Partner (Growth Partner) Portal
**URL:** `https://uat-web.xrportal.in/dashboard`
**Sources:** CP-BRD-CP-Portal.md · CP-FS-Customer-Registration.md
**Last Updated:** 2026-05-22
**Audience:** Channel Partner / Sales Agent

---

## Overview

The Dashboard is the default landing page for every CP after login. It serves two purposes: (1) it lists every customer the logged-in CP has registered, with live allocation, KYC, and payment status; and (2) it is the launch point for registering a brand-new customer into the XR Portal system. Each registration created here is filed against your broker account (`brokerId` = your CP user ID) and tagged with your HV code (`walkInSourceXrCode`) — which is how downstream commission, allocation, and reporting flows identify the customer as a referral from your channel.

You see only your own customers. Other CPs' registrations are invisible to you by design (CP isolation, BRD §4.1).

---

## Page Layout (At a Glance)

1. **Customer Table** — one row per registered customer, with columns listed below.
2. **Register Customer Button** — opens the registration form.
3. **Registration Form (modal/screen)** — multi-field form with mandatory T&C checkbox.
4. **Status Columns** — Allocation Status and KYC Completion let you spot customers needing follow-up.

---

## Dashboard Table Columns

| Column | Description |
|--------|-------------|
| Customer Name | Buyer's full name |
| Registration Number | Unique ID in format `GHNG-XXXXXXXXXX` (additional units: `-A`, `-B`, `-C`) |
| Unit Allocated | Unit number if allocated; blank if not yet allocated |
| Allocation Status | WAITLIST / PREALLOCATED / ALLOCATED / WINNER / HOLD / REFUND |
| KYC Completion | Whether KYC has been submitted for this registration |
| Payment Status | Payment progress for this registration |

---

# Feature 1 — View Your Customer Dashboard

### What it does
Shows every customer you have registered, with their current allocation, KYC, and payment state. Updates in near real-time as backend statuses change.

### Preconditions
- You are logged in as a CP.

### How to use
1. After login you land directly on the Dashboard.
2. Each row represents one customer registration you own.
3. Sort or scan the **Allocation Status** column to find customers who are WINNER (and may need KYC follow-up).
4. Scan the **KYC Completion** column to find WINNERs without submitted KYC.

### Result
You have an at-a-glance view of which customers need attention next.

### Note
The table is filtered server-side on `brokerId` — there is no toggle to view other CPs' customers. Master/Lead CPs see only their own personally registered customers here, not the aggregate of their Member CPs.

---

# Feature 2 — Register a New Customer

### What it does
Creates a formal Registration record in the XR Portal system under your broker account, generates a unique `GHNG-XXXXXXXXXX` registration number, and notifies the customer via SMS/WhatsApp.

### Preconditions
- You are logged in.
- The customer's mobile AND email are NOT already on a registration for this project (duplicate check is enforced at submit).
- The customer has agreed (verbally or in writing) to the Terms & Conditions you will tick on their behalf.

### How to use
1. From the Dashboard, click **Register Customer** (or equivalent CTA).
2. Fill in the form fields (see the Form Fields table below).
3. For NRI customers: select the country code first, then enter the international mobile number. The Indian contact number goes into `nriIndianPhone`.
4. Select the **Purchase Purpose** (Investment / Own Use). This is mandatory — there is no default.
5. Select the **Home Loan Intent** (Yes / No).
6. Enter the **Budget Amount** as quoted by the customer.
7. Optionally enter **Preferred Floor Range** (min/max floor) and **Walk-in Source**.
8. Tick the **Undertaking / T&C consent** checkbox — this is mandatory; the form will not submit without it.
9. Click **Submit**.

### Result
- New `Registration` row created with `status = Open`, `paymentStatus = Pending`, `brokerId` = your user ID, `walkInSourceXrCode` = your hvCode, `availableForAllocation = true`.
- Registration number generated: `GHNG-XXXXXXXXXX`.
- Customer receives a Kaleyra SMS/WhatsApp confirming registration.
- New row appears in your Dashboard.

### Warning
- The T&C consent is captured as legal proof. Only tick this checkbox after confirming with the customer.
- If the customer requires multiple units, additional registrations get suffixes: `-A`, `-B`, `-C`. Do not attempt to combine them into a single registration.

---

# Feature 3 — Track Customer Progress

### What it does
Lets you monitor where each of your customers stands across the allocation and KYC journey, so you can prioritise follow-ups.

### Preconditions
- You have at least one registered customer.

### How to use
1. On the Dashboard, scan the **Allocation Status** column:
   - **WAITLIST / PREALLOCATED / ALLOCATED** — customer is still in the allocation pipeline.
   - **WINNER** — customer has confirmed unit booking with payment. Next step: KYC.
   - **HOLD / REFUND** — customer's registration has paused or been refunded.
2. For any row in WINNER status, check the **KYC Completion** column. If KYC is not done, navigate to the **KYC** screen to assist.
3. Use the **Payment Status** column to follow up on customers with pending payments.

### Result
You have a clear, prioritised action list for each customer.

---

## Registration Form Fields

| Field | Required | Description / Format |
|-------|----------|----------------------|
| First Name | Yes | Customer's first name |
| Last Name | Yes | Customer's last name |
| Mobile Number | Yes | 10-digit Indian or international with country code (NRI) |
| Email Address | Yes | Standard email format |
| Purchase Purpose | Yes | Investment / Own use — no default |
| Home Loan Intent | Yes | Yes / No |
| Budget Amount | Yes | Numeric — customer's stated budget |
| Preferred Floor Range | No | Min and max floor preference |
| Walk-in Source | No | How the customer heard about the project |
| Undertaking / T&C consent | Yes | Checkbox — mandatory; submission blocked without it |

---

## Validation Rules

| Field | Rule |
|-------|------|
| Mobile Number | Valid 10-digit Indian format OR international format with country code |
| Email Address | Valid email format |
| Duplicate check | Submission rejected if mobile OR email already exists on a registration for this project |
| T&C consent | Must be ticked — submit button gated by this checkbox |
| Purchase Purpose | Must be selected — no implicit default |

---

## Business Rules

1. **CP isolation.** You see only customers where `brokerId` = your user ID (BRD §4.1).
2. **Duplicate prevention.** Mobile OR email duplication across the project rejects the submission (BRD §4.2).
3. **T&C is mandatory and legal.** The consent flag is stored as proof — tick only with customer agreement (BRD §4.3).
4. **Registration number format.** `GHNG-XXXXXXXXXX` (10 digits). Multi-unit registrations append `-A`, `-B`, `-C` (BRD §4.4).
5. **Customer notification is automatic.** A Kaleyra SMS/WhatsApp goes to the registered mobile on successful submit.

---

## Role Restrictions

| Role | View own customers? | Register new customer? |
|------|---------------------|------------------------|
| Channel Partner | Yes | Yes |
| Lead/Master CP | Yes (own only) | Yes |
| Member CP | Yes (own only) | Yes |

There is no "shared" customer pool visible across CPs on this Dashboard.

---

## Notifications Dispatched

| Action | Channel | Recipient |
|--------|---------|-----------|
| Successful registration | Kaleyra SMS + WhatsApp | Registered customer mobile |
| Duplicate-rejected submission | None | — |
| Status change (downstream allocation / KYC events) | Handled by other modules, not the Dashboard | — |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Duplicate registration" error on submit | Mobile or email already registered for this project | Search Dashboard by phone first; if customer is yours, do not re-create; if not visible, the customer may be under another CP — escalate to manager |
| Submit button stays disabled | T&C / Undertaking checkbox not ticked, or a required field is empty | Tick the consent checkbox and complete all required fields |
| Customer not receiving registration SMS | Wrong mobile number entered, or Kaleyra delivery delay | Verify the number; if correct, allow ~5 min before re-checking |
| Customer row missing after submit | Page not refreshed, or backend lag | Refresh the Dashboard |
| NRI customer mobile rejected | Country code not selected before entering the number | Re-open the form, pick the correct country code first, then enter the number |
