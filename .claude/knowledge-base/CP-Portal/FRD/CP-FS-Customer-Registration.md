# Feature-Spec: Customer Registration and Tracking

**Portal:** Channel Partner Portal
**URL:** `https://uat.xrportal.in/dashboard`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View Customer Dashboard

### 1.1 Objective

Allow CPs to see all customers they have registered, including their current allocation status, KYC completion, and payment status.

### 1.2 Scope

Default landing page after CP login. Shows only customers registered by this CP (filtered by `brokerId`).

### 1.3 Preconditions

- CP must be logged in

### 1.4 Table Columns

| Column | Description |
|--------|-------------|
| Customer Name | Buyer's full name |
| Registration Number | Unique ID in format GHNG-XXXXXXXXXX |
| Unit Allocated | Unit number if allocated, blank if not yet allocated |
| Allocation Status | WAITLIST / PREALLOCATED / ALLOCATED / WINNER / HOLD / REFUND |
| KYC Completion | Whether KYC has been submitted |
| Payment Status | Payment progress for this registration |

### 1.5 Business Rules

1. CP sees only their own customers (`brokerId` = CP's user ID)
2. Table updates in near real-time as customer statuses change through the system

---

## How to Use: Viewing Your Customer Dashboard

**Who does this:** Channel Partner

---

**Step 1 — Log in and land on the Dashboard**

After logging in, you are taken directly to your Dashboard. The table shows all customers you have registered.

**Step 2 — Read each customer row**

Each row shows the customer's registration number, which unit (if any) has been allocated, their current status, and whether their KYC is done.

**Step 3 — Track progress**

Use the Allocation Status and KYC columns to identify customers who still need action — for example, customers who are WINNER status but have not yet submitted KYC.

---

## Feature 2: Register a New Customer

### 2.1 Objective

Allow CPs to formally register a new buyer into the XR Portal system, creating a registration record under the CP's broker account.

### 2.2 Preconditions

- CP must be logged in
- Customer must not already have a registration with the same mobile number or email for this project

### 2.3 Registration Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Customer's first name |
| Last Name | Yes | Customer's last name |
| Mobile Number | Yes | 10-digit Indian number or international format with country code (NRI) |
| Email Address | Yes | Valid email format |
| Purchase Purpose | Yes | e.g., Investment, Own use |
| Home Loan Intent | Yes | Yes or No |
| Budget Amount | Yes | Customer's stated budget |
| Preferred Floor Range | No | Minimum and maximum floor preference |
| Walk-in Source | No | How the customer came to know about the project |
| Undertaking/T&C | Yes | Customer must agree to Terms and Conditions (checkbox) |

### 2.4 Validations and Business Rules

1. Mobile number: valid 10-digit Indian format, or international format with country code for NRI customers
2. Email: standard email format validation
3. Duplicate check: if the same mobile OR email already exists for a registration in this project, submission is rejected
4. T&C/Undertaking consent checkbox is mandatory — form cannot be submitted without it
5. Purchase purpose is required — no default value

**NRI customer handling:**
- International country code supported in the mobile number field
- NRI customers use `nriIndianPhone` field for their Indian contact number
- NRI flag affects OTP channel selection for the buyer's login

### 2.5 System Actions on Successful Registration

1. New Registration record created with:
   - Status = Open
   - Payment Status = Pending
   - `brokerId` = CP's user ID
   - `walkInSourceXrCode` = CP's hvCode
   - `availableForAllocation` = true
2. Registration number generated in format: **GHNG-XXXXXXXXXX** (10 digits)
   - Additional unit registrations for same customer: GHNG-XXXXXXXXXX-A, -B, -C
3. Customer notified via SMS/WhatsApp (Kaleyra)
4. New customer row appears in CP's dashboard table

### 2.6 Notifications

- Customer receives SMS/WhatsApp confirmation of registration

---

## How to Use: Registering a New Customer

**Who does this:** Channel Partner

---

**Step 1 — Click "Register Customer"**

On your Dashboard, click the **Register Customer** button (or similar) to open the registration form.

**Step 2 — Fill in customer details**

Enter the following information:
- **First Name and Last Name** (required)
- **Mobile Number** — enter the 10-digit number (for NRI customers, select the country code first)
- **Email Address** (required)
- **Purchase Purpose** — select whether the customer is buying for investment or own use (required)
- **Home Loan Intent** — select Yes or No
- **Budget Amount** (required)
- **Preferred Floor Range** — if the customer has a floor preference, enter minimum and maximum floors
- **Walk-in Source** — how the customer heard about the project

**Step 3 — Accept the Undertaking**

Tick the checkbox to confirm the customer agrees to the Terms and Conditions. This is mandatory — the form cannot be submitted without it.

**Step 4 — Submit**

Click **Submit**. If successful, you will see the new customer appear in your Dashboard table.

**If you get a duplicate error:** The customer's mobile number or email already exists in the system for this project. The customer may already be registered — check the table first.

> **Registration number:** Each successful registration gets a unique number in the format GHNG-XXXXXXXXXX. Share this with the customer as their reference ID.
