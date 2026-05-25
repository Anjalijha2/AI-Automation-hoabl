# SM Portal — Physical Allocation User Guide

**Audience:** Sales Manager (role 5) / Sales Manager Admin (role 4)
**Portal:** Sales Manager Portal
**URLs:**
- Customer Search: `https://uat-web.xrportal.in/sales-manager/physical-allocation`
- Unit Allocation + Payment: `https://uat-web.xrportal.in/sales-manager/physical-allocation/checkout`
- KYC: `https://uat-web.xrportal.in/sales-manager/physical-allocation/kyc`
**Sources:** SM-BRD-SM-Portal.md · SM-FRD-SM-Portal.md · SM-FS-Physical-Allocation.md
**Last Updated:** 2026-05-22

---

## Overview

Physical Allocation is the in-person, site-office workflow used by Sales Managers during a `PHYSICAL_EVENT` allocation campaign. A walk-in customer arrives at the site office; the SM searches for the customer's registration, browses available units, helps them select a unit, processes payment (online QR or offline with proof), and then completes their KYC — all in a single guided three-step flow.

The flow has three screens:
1. **Customer Search** (`/physical-allocation`) — find the buyer's active registration.
2. **Unit Allocation + Payment** (`/physical-allocation/checkout`) — browse, select, hold (20-minute timer), and pay.
3. **KYC** (`/physical-allocation/kyc`) — collect applicant details and 4 documents per applicant (max 4 applicants total).

The entire flow is only available while a `PHYSICAL_EVENT` campaign is active for the project. Outside of that, the screens are not usable. Selected units are held for 20 minutes in Redis while payment is processed; if the timer expires, the hold is released and the unit returns to `AVAILABLE`.

---

## Page Layout (At a Glance)

1. **Step indicator** — visual breadcrumb showing where you are in the 3-step flow.
2. **Customer Search screen** — search input + result list.
3. **Unit Allocation screen** — available unit list, Floor & Unit Plan, Cost Sheet, Payment Schedule, payment controls.
4. **KYC screen** — Applicants panel with primary + co-applicants, document upload controls, Submit KYC button.

---

# Feature 1 — Customer Search

### What it does
Locates a registered customer by name, phone number, or registration number so the SM can begin the in-person allocation flow.

### Preconditions
- A `PHYSICAL_EVENT` campaign is active for the project.
- SM is logged in.
- Customer must already be registered in the system with an active registration.

### How to use
1. From the bottom navigation (mobile) or side menu, navigate to **Physical Allocation**. The Customer Search screen loads.
2. Type into the **Search** input — name, phone, or registration number. Results appear as you type.
3. **Verify identity** — confirm the displayed name and registration number match the person in front of you (ask for ID).
4. Click **Select** next to the matching customer row.

### Result
- Customer's active registration data is loaded.
- You are routed to `/sales-manager/physical-allocation/checkout` with the customer context attached.

### Validation / business rules
- "No records found" is shown if the search returns no matching customer.
- If no `PHYSICAL_EVENT` campaign is active, the screen is unavailable / blocked.
- The customer must have an **active** registration — cancelled / refunded registrations do not appear.

### Warning
Identity verification is a manual SM step — the system trusts your selection. Selecting the wrong customer routes the entire downstream flow to the wrong registration.

---

# Feature 2 — Browse Available Units

### What it does
Shows the SM the list of units available for the customer's registered apartment type, with full pricing detail, floor plan view, and cost sheet.

### Preconditions
- Customer selected from Customer Search.
- Units are available for the customer's apartment type.

### How to use
1. The Unit Allocation screen loads automatically with the customer in context.
2. Browse the available unit list. Each unit shows summary information.
3. Click **Floor & Unit Plan** on a unit to view the architectural floor plan.
4. Click **Cost Sheet** to view the full pricing breakdown.
5. Click **Payment Schedule** to view milestone payments.

### Information shown per unit
| Field | Example value |
|-------|--------------|
| Unit number | 3502 |
| Floor | 35 |
| Tower | Crest |
| Typology | 1 Bed Growth Home |
| Carpet area | 323 sq.ft. |
| Agreement value | Rs. 32,99,000 |
| Allocation amount (confirmation amount) | Rs. 27,000 |
| GST on allocation amount | Rs. 4,860 (18%) |
| Applicable discounts | e.g., HOME_LOAN offer: −Rs. 10,000 |
| All Inclusive Price | Rs. 35,52,960 |

### Result
You have full pricing and floor-plan visibility before recommending a unit to the customer.

---

# Feature 3 — Select Unit and Initiate 20-Minute Hold

### What it does
Selects a unit on behalf of the customer and places it on a 20-minute hold in Redis while payment is processed.

### Preconditions
- Unit must be in `AVAILABLE` status at the moment of selection.
- A `PHYSICAL_EVENT` campaign is active.

### How to use
1. From the unit list, click the **Select** action on the unit the customer wishes to book.
2. The system confirms the selection and places the unit on HOLD; the 20-minute countdown timer starts.
3. You are now in the payment flow for that unit.

### Result
- Unit placed on HOLD in Redis (20-minute TTL).
- Only one unit can be held at a time per customer.
- Payment flow begins.

### Warning
- Once initiated, the 20-minute timer is fixed — there is no extend / pause control.
- If payment is not completed within 20 minutes, the hold is released and the unit returns to `AVAILABLE`. The customer must reselect (and may find the unit booked by a competing event in a different site office).

---

# Feature 4 — Process Payment (Online — QR Code or Gateway)

### What it does
Lets the customer pay the allocation amount online — either by scanning a QR code on the SM's device or by completing payment via Easebuzz / Razorpay on their own device.

### Preconditions
- Unit is on HOLD (Feature 3 completed).
- The 20-minute timer has not expired.

### How to use
**Option A — QR code (customer pays on their phone):**
1. Click the **QR Code** payment option. The `QrScannerModal` opens and displays the QR code.
2. Customer scans the QR with their phone's UPI app.
3. Customer completes payment in their UPI app.
4. Wait for the success confirmation on the SM screen.

**Option B — Gateway (customer pays on their device):**
1. Customer is redirected to Easebuzz or Razorpay on their device.
2. Customer completes payment.
3. Wait for the success callback on the SM screen.

### Result
On payment success:
- Unit status → `BOOKED`.
- Registration unit status → `WINNER`.
- Booking synced to Mavis (ERP) and LeadSquared (CRM).
- SM is auto-routed to the KYC screen.

On payment failure / timeout:
- Hold is released; unit returns to `AVAILABLE`.
- Customer is notified.
- SM can retry payment or select a different unit.

---

# Feature 5 — Process Payment (Offline — Manual Entry with Proof)

### What it does
Records a payment that the customer made outside the online gateway (bank transfer, cheque, UPI transfer to a different account, cash). Requires the SM to enter the payment details and upload proof.

### Preconditions
- Unit is on HOLD.
- The 20-minute timer has not expired.
- Customer has made / can make the payment offline and has the proof document (bank receipt, transfer confirmation).

### How to use
1. Click **Record Offline Payment**. The `OfflinePaymentDrawer` opens.
2. Fill in:
   - **Reference number** (required) — bank reference, cheque number, or UPI transaction ID.
   - **Amount** (required) — exact amount paid.
   - **Date** (required) — date of the payment.
   - **Proof document** (required) — upload bank receipt, screenshot, or voucher (PDF / JPG / PNG).
3. Click **Submit**.

### Result
- Offline payment recorded with `isOffline=1`, `paymentSource='sm'`.
- Unit status → `BOOKED`, registration → `WINNER`.
- Booking synced to Mavis and LeadSquared.
- SM is auto-routed to the KYC screen.

### Validations
- Reference number, amount, date, and proof document upload are all mandatory.
- Submission fails if any field is missing.

### Warning
The SM is responsible for verifying the offline payment is genuine before recording it — there is no automatic bank reconciliation at this step. Inaccurate offline entries will require admin correction later.

---

# Feature 6 — View Floor & Unit Plan / Cost Sheet / Payment Schedule

### What it does
Three viewer panels that help the SM and customer make a confident unit choice before payment.

### Preconditions
- A unit is visible in the unit list (or has just been selected).

### How to use
- **Floor & Unit Plan** — click the corresponding action on a unit; renders the architectural plan for the floor with the unit highlighted.
- **Cost Sheet** — click to view the full pricing breakdown (agreement value, allocation amount, GST, discounts, all-inclusive price).
- **Payment Schedule** — click to view the future milestone payment plan.

### Result
The customer sees exactly what they will pay (now and in milestones) and the unit layout, before committing to payment.

### Note
These panels are purely informational — they do not place a hold or trigger any backend write.

---

# Feature 7 — KYC — Primary Applicant Details

### What it does
After successful payment, the SM assists the customer in completing the primary applicant's KYC details. Primary applicant fields are pre-populated from the customer's registration record; the SM verifies and fills any missing entries.

### Preconditions
- Unit payment has succeeded.
- SM is on `/sales-manager/physical-allocation/kyc`.

### How to use
1. The KYC form opens with the primary applicant block expanded.
2. Review pre-filled fields (name, mobile, email, address) — these come from the registration record.
3. Fill any missing required fields.

### Result
Primary applicant block is ready for document upload (Feature 9).

---

# Feature 8 — KYC — Add Co-Applicants (up to 3)

### What it does
Adds additional applicants (typically family members) to the unit booking. Maximum 4 applicants total (1 primary + up to 3 co-applicants).

### Preconditions
- Primary applicant block is loaded.
- Co-applicant is a blood relative of the primary applicant.

### How to use
1. In the Applicants panel, click **+ Add Applicant**.
2. Fill in the co-applicant's details:
   - Name
   - Mobile
   - Email
   - Address
   - **Relationship** — must be a blood relative (Father, Mother, Spouse, Son, Daughter, Sibling, etc.).
3. Repeat for up to 3 co-applicants.

### Result
- Each added co-applicant appears as a new collapsible block in the Applicants panel.
- Once 4 applicants total are present, the **+ Add Applicant** button is disabled / hidden and the label **"Max. 4 Applicants allowed"** is shown.

### Validations
- Relationship must be a blood relative.
- Maximum 4 applicants — enforced by the UI.

---

# Feature 9 — KYC — Upload Documents (4 per applicant)

### What it does
Each applicant (primary and every co-applicant) must have all 4 KYC documents uploaded before KYC can be submitted.

### Preconditions
- Applicant blocks (primary + any co-applicants) are filled.

### How to use
For each applicant block:
1. Click the upload control next to **Passport photograph** and select an image file.
2. Click the upload control next to **PAN card** and select an image file.
3. Click the upload control next to **Aadhaar — front** and select an image file.
4. Click the upload control next to **Aadhaar — back** and select an image file.

### Required documents per applicant
| Document | Format |
|----------|--------|
| Passport photograph | Any image file |
| PAN card image | Image (JPG / PNG / PDF) |
| Aadhaar card — front | Image (JPG / PNG / PDF) |
| Aadhaar card — back | Image (JPG / PNG / PDF) |

### Result
All 4 documents are uploaded for the applicant. Progress indicators / file names confirm each upload.

### Warning
**All 4 documents are mandatory for every applicant.** If any document is missing for any applicant, KYC submission is blocked with a validation error. Partial uploads will not save.

---

# Feature 10 — Submit KYC

### What it does
Submits the complete KYC form for all applicants. The system saves all applicant data, generates a KYC PDF, uploads the documents to Azure Blob Storage, and syncs to LeadSquared.

### Preconditions
- Primary applicant details complete.
- All co-applicant details complete (if any).
- Each applicant has all 4 documents uploaded.

### How to use
1. Review the entire Applicants panel one final time.
2. Click **Submit KYC**.

### Result
- All applicant data saved against the registration unit.
- `isKycSubmitted = true` on `RegistrationUnit`.
- KYC PDF generated via Puppeteer and stored in Azure Blob Storage.
- All documents uploaded to Azure Blob.
- KYC payload synced to LeadSquared CRM.
- The customer's unit booking is now fully confirmed.

### Validations
- Submission blocked if any required field is empty.
- Submission blocked if any applicant is missing any of the 4 required documents.
- Submission blocked if any co-applicant relationship is invalid (non-blood relative).

### Warning
- KYC is mandatory — the unit booking is **provisional** until KYC is submitted. A booking without KYC may still be visible as `WINNER` but is not commercially complete.
- There is no in-app undo for a submitted KYC — corrections require admin intervention.

---

## Field Reference — Quick Lookup

### Three-screen flow
| Step | Screen | URL | Outcome |
|------|--------|-----|---------|
| 1 | Customer Search | `/sales-manager/physical-allocation` | Customer selected |
| 2 | Unit Allocation + Payment | `/sales-manager/physical-allocation/checkout` | Unit booked + payment recorded |
| 3 | KYC | `/sales-manager/physical-allocation/kyc` | `isKycSubmitted = true` |

### Payment method comparison
| Method | Where customer pays | Required SM input |
|--------|---------------------|-------------------|
| Online — QR | Customer's phone (UPI app) | Open QR modal |
| Online — Gateway | Customer's device (Easebuzz / Razorpay) | None — webhook callback |
| Offline | Outside the system (bank / cheque / cash) | Reference no., amount, date, proof upload |

### KYC applicant rules
| Rule | Value |
|------|-------|
| Maximum applicants per booking | 4 (1 primary + 3 co-applicants) |
| Documents per applicant | 4 (Photo, PAN, Aadhaar front, Aadhaar back) |
| Co-applicant relationship | Blood relative only |
| Primary applicant fields | Pre-filled from registration |
| Co-applicant fields | Manually entered |

### Backend side effects
| Action | Side effect |
|--------|-------------|
| Unit Select | Redis HOLD (20-min TTL) |
| Payment Success (online or offline) | Unit `BOOKED`, registration `WINNER`, Mavis sync, LSQ sync |
| Payment Failure / Timeout | HOLD released, unit `AVAILABLE` |
| KYC Submit | `isKycSubmitted=true`, PDF via Puppeteer, Azure Blob upload, LSQ sync |

### Notifications dispatched
| Action | Customer notification |
|--------|----------------------|
| Customer search | None |
| Unit select / HOLD | None |
| Payment success | May trigger booking confirmation (Kaleyra) — confirm with admin |
| Payment failure / timeout | Customer notified |
| KYC submit | None (internal sync only) |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Physical Allocation screen unavailable or blocks | No active `PHYSICAL_EVENT` campaign | Confirm campaign is open in Admin Portal → Allocation; cannot run physical allocation outside the campaign window |
| Customer Search returns "No records found" | Customer not registered, or registration not active | Confirm registration exists and is active in Admin Portal → Customers |
| Unit does not appear in available list | Unit is HELD by another SM, `BOOKED`, or `RESERVED` | Wait for HOLD release (20-min max) or pick a different unit |
| 20-minute timer expired before payment completed | Online payment delayed or offline proof not ready | HOLD released, unit returns to `AVAILABLE`; re-select and retry — note unit may be taken by then |
| Online payment success but screen does not advance | Payment webhook delay | Wait 30 seconds; refresh; verify in Admin Portal → Customers that the row shows Booked |
| Offline payment submit fails | Missing required field (reference / amount / date / proof) | Fill all 4 fields and re-upload proof |
| **Submit KYC** button disabled | Missing applicant field or missing document | Scroll through every applicant block; confirm all 4 documents present for each |
| "+ Add Applicant" button missing | 4 applicants already added | Maximum reached — cannot add a 5th |
| KYC submitted but registration not showing as KYC-complete | LSQ sync may be queued / failed | Wait a few minutes; if persistent, escalate — `isKycSubmitted` should still be true in the database |
| Customer cancels mid-flow before payment | Unit is on HOLD; no booking exists yet | Let the 20-minute timer expire — HOLD will auto-release |
| Customer changes their mind on unit after payment | Unit already `BOOKED` | Use Admin Portal → Unit Swap (requires admin) — no in-portal swap from SM Portal |
