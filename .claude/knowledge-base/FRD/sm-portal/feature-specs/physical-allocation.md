# Feature-Spec: Physical Allocation (In-Person Event)

**Portal:** Sales Manager Portal
**URLs:**
- `/sales-manager/physical-allocation` — Customer Search
- `/sales-manager/physical-allocation/checkout` — Unit Allocation and Payment
- `/sales-manager/physical-allocation/kyc` — KYC Completion
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Customer Search

### 1.1 Objective

Allow the SM to locate a registered customer before beginning the in-person unit allocation process.

### 1.2 Scope

First step of the Physical Allocation flow. Only available during a PHYSICAL_EVENT campaign.

### 1.3 Preconditions

- A PHYSICAL_EVENT campaign must be active
- SM must be logged in
- Customer must be registered in the system with an active registration

### 1.4 UI Elements

| Element | Description |
|---------|-------------|
| Search input | Search by customer name, phone number, or registration number |
| Search results | List of matching registered customers |
| Select button | Choose a customer to proceed with allocation |

### 1.5 Validations and Business Rules

1. Physical allocation only works during a PHYSICAL_EVENT campaign — if no such campaign is active, this flow is unavailable
2. Customer must have an active registration before they can be selected
3. SM must verify the customer's identity before proceeding
4. "No records found" is shown if the search finds no matching customer

### 1.6 System Actions

1. System looks up registrations matching the search query
2. Matching customer records are displayed
3. On selection, the customer's registration data is loaded and passed to the checkout screen

---

## How to Use: Finding a Customer for Physical Allocation

**Who does this:** Sales Manager, during an in-person walk-in allocation event

---

**Step 1 — Open Physical Allocation**

From the navigation menu, go to **Physical Allocation**. The Customer Search screen will load.

**Step 2 — Search for the customer**

Type the customer's name, phone number, or registration number in the search box. Results will appear as you type.

**Step 3 — Verify identity**

Before selecting a customer, confirm their identity by checking their name and registration number matches the person in front of you.

**Step 4 — Select the customer**

Click **Select** next to the matching customer. You will be taken to the Unit Allocation screen.

---

## Feature 2: Unit Allocation and Payment

### 2.1 Objective

Allow the SM to browse available units and select one on behalf of the walk-in customer, then process payment — either online (QR code) or offline (manual entry).

### 2.2 Preconditions

- Customer must be selected from the Customer Search screen
- A PHYSICAL_EVENT campaign must be active
- Units must be available for the customer's registered apartment type

### 2.3 Information Shown Per Unit

| Field | Example Value |
|-------|--------------|
| Unit number | 3502 |
| Floor | 35 |
| Tower | Crest |
| Typology | 1 Bed Growth Home |
| Carpet area | 323 sq.ft. |
| Agreement value | Rs. 32,99,000 |
| Allocation amount | Rs. 27,000 |
| GST on allocation | Rs. 4,860 (18%) |
| Applicable discounts | HOME_LOAN offer: −Rs. 10,000 |
| All Inclusive Price | Rs. 35,52,960 |

### 2.4 Payment Methods

| Method | Process |
|--------|---------|
| Online — QR code | SM opens QrScannerModal; customer scans code on their device to pay |
| Online — gateway | Customer completes payment via Easebuzz or Razorpay on their device |
| Offline | SM opens OfflinePaymentDrawer; enters reference number, amount, date, uploads payment proof |

### 2.5 Validations and Business Rules

1. The unit is placed on a **20-minute hold** from the moment payment is initiated
2. If payment is not completed within 20 minutes, the hold is released and the unit returns to AVAILABLE
3. Only one unit can be held at a time per customer
4. Offline payments require: reference number, amount, date, and proof document upload
5. SM can view the cost sheet and floor/unit plan before finalising the unit selection
6. The payment schedule can also be viewed before payment

### 2.6 System Actions

1. Selected unit is placed on HOLD in Redis (20-minute timer starts)
2. Payment is initiated via the selected method
3. On payment success:
   - Unit status updates to BOOKED
   - Registration unit status updates to WINNER
   - Booking is synced to Mavis and LeadSquared
4. On payment failure or timeout:
   - Hold is released
   - Unit returns to AVAILABLE

---

## How to Use: Allocating a Unit and Processing Payment

**Who does this:** Sales Manager, after finding the customer

---

**Step 1 — Browse available units**

The Unit Allocation screen shows available units for the customer's apartment type. You can:
- Click **Floor & Unit Plan** to view the architectural plan
- Click **Cost Sheet** to show the full pricing breakdown
- Click **Payment Schedule** to show milestone payments

**Step 2 — Select a unit**

Choose the unit the customer wants to book. The system will show the full pricing and confirm the selection.

**Step 3 — Initiate payment**

Choose the payment method:

- **Online via QR code:** Click the QR code option. A QR code is displayed. The customer scans it on their phone to pay.
- **Offline payment:** Click **Record Offline Payment**. Enter the payment reference number, amount, date, and upload proof of payment (bank receipt or transfer confirmation).

> **Important:** Once you initiate payment, the unit is held for **20 minutes**. Payment must be completed before the timer expires or the unit will be released.

**Step 4 — Confirm payment success**

On successful payment, the screen will confirm the unit is booked. You will then proceed automatically to the KYC screen.

**If payment fails:** The hold is released and the unit returns to Available. You can try again with a different payment method or a different unit.

---

## Feature 3: KYC Completion

### 3.1 Objective

After successful unit payment, the SM assists the walk-in customer in completing their KYC (Know Your Customer) identity verification before leaving the site office.

### 3.2 Preconditions

- Unit payment must be successfully completed
- SM must be on the KYC screen (`/sales-manager/physical-allocation/kyc`)

### 3.3 KYC Steps

1. **Primary applicant details** — auto-filled from the customer's registration; SM verifies and completes any missing fields
2. **Co-applicant details** — add up to 3 co-applicants (maximum 4 total including primary)
3. **Document upload** — all 4 documents required per applicant
4. **Submit KYC** — SM submits the completed form

### 3.4 Required Documents Per Applicant

| Document | Requirement |
|----------|------------|
| Passport photograph | Any image file |
| PAN card image | Required |
| Aadhaar card — front | Required |
| Aadhaar card — back | Required |

**All 4 documents are mandatory.** Submission is blocked if any document is missing.

### 3.5 Co-Applicant Rules

- Maximum 4 applicants total (1 primary + 3 co-applicants)
- "Add Applicant" button is disabled/hidden when the limit is reached
- Label shown at limit: "Max. 4 Applicants allowed"
- Relationship must be blood relative (Father, Mother, Spouse, Son, Daughter, Sibling, etc.)

### 3.6 Validations and Business Rules

1. KYC is mandatory — unit booking is provisional until KYC is submitted
2. Primary applicant data is auto-filled from registration record
3. Each co-applicant requires all 4 documents — partial uploads are rejected
4. Documents are uploaded to Azure Blob Storage
5. After submission:
   - `isKycSubmitted = true` is set on the registration unit record
   - KYC PDF is generated via Puppeteer and stored in Azure Blob
   - Documents are synced to LeadSquared CRM

### 3.7 System Actions

1. Primary applicant fields pre-populated from registration data
2. SM uploads documents via file upload controls
3. On submit: KYC data saved, PDF generated, LeadSquared synced
4. `isKycSubmitted = true` confirmed

---

## How to Use: Completing KYC After Physical Allocation

**Who does this:** Sales Manager, immediately after payment confirmation

---

**Step 1 — Review primary applicant details**

The KYC form will open with the customer's details pre-filled from their registration. Review each field and correct anything that is missing or incorrect.

**Step 2 — Add co-applicants (if any)**

If the customer wants to add a family member as a co-applicant:
1. Click **+ Add Applicant**
2. Fill in their details: name, mobile, email, address, and relationship (must be a blood relative)
3. Upload all 4 documents for the co-applicant: Photo, PAN card, Aadhaar front, Aadhaar back

Repeat for up to 3 co-applicants. The button disappears once the maximum of 4 applicants (including primary) is reached.

**Step 3 — Upload primary applicant documents**

Upload all 4 required documents for the primary applicant:
- Passport photograph
- PAN card
- Aadhaar card — front
- Aadhaar card — back

> **All 4 documents must be uploaded.** Submission will be blocked if any are missing.

**Step 4 — Submit KYC**

Once all details and documents are complete, click **Submit KYC**. The system will:
- Save all applicant information
- Generate the KYC PDF
- Upload documents to secure cloud storage

The customer's KYC is now complete. Their unit booking is fully confirmed.
