# KYC Workflow

**Type:** End-to-End Workflow
**Last Updated:** 2026-05-10
**Tags:** #workflow/kyc #status/complete

---

## Related Notes
- [[Backend-Functional-BRD]]
- [[Buyer-Portal-BRD]]
- [[Admin-Portal-BRD]]
- [[SM-Portal-BRD]]
- [[Payment-Workflow]]
- [[Integrations]]
- [[Business-Rules]]

---

## Overview

KYC (Know Your Customer) is the identity and document verification step that occurs after a buyer successfully books a unit (reaches WINNER status). KYC is mandatory for the booking to become final in the ERP system and for the payment schedule to be generated.

---

## KYC Prerequisites

Before KYC can be submitted, all of the following must be true:

1. RegistrationUnit.status = WINNER (unit booking payment confirmed)
2. bookingTokenActivitySubmitted = true (LSQ booking token activity synced)
3. Buyer must be logged in to the Buyer Portal

---

## KYC Actors

| Actor | Role |
|-------|------|
| Buyer | Fills KYC form, uploads documents, submits |
| Channel Partner | Can assist buyer with KYC on CP Portal |
| Sales Manager | Can complete KYC at physical event site (SM Portal) |
| Admin | Can view KYC status, manage KYC records |

---

## KYC Data Collected

### Applicant Details
- Primary applicant: full name, date of birth, father's/spouse's name
- Co-applicant details (if any): same fields as primary
- Correspondence address
- Permanent address
- Occupation and income details

### Documents Required
| Document | Required | Notes |
|----------|---------|-------|
| Aadhaar Front | Yes | National ID front scan |
| Aadhaar Back | Yes | National ID back scan |
| PAN Card | Yes | Tax identification card |
| Passport Photo | Yes | Buyer's recent photograph |

All documents uploaded to Azure Blob Storage. Each document has a defined naming convention by user ID and document type.

---

## KYC Form Configuration

The KYC form fields are dynamically configured via **Strapi CMS** (content type: `default-form-field` and `form`). This means:
- Field labels, placeholders, validation rules, and which fields are mandatory can be changed in Strapi without code changes
- Different projects could have different KYC form configurations if needed

---

## End-to-End KYC Flow

```
1. BUYER ACCESSES KYC SECTION
   Buyer logs in to Buyer Portal
   Buyer sees KYC prompt after reaching WINNER status
   Buyer navigates to KYC section
   
   If KYC already submitted: read-only view of submitted data

2. FORM COMPLETION
   Buyer fills multi-section form:
   - Applicant personal details
   - Co-applicant details (if applicable)
   - Address information
   
   Form field configuration loaded from Strapi CMS
   Client-side validation runs per field

3. DOCUMENT UPLOAD
   Buyer uploads each required document
   Documents immediately uploaded to Azure Blob Storage on selection
   Blob paths stored temporarily on the form state
   
   Document naming pattern:
   - User ID + document type + timestamp
   - Stored under documents/ container in Azure

4. FORM SUBMISSION
   Buyer clicks Submit
   Backend receives full KYC payload including:
   - Applicant details
   - Co-applicant details
   - Document blob paths
   
   Backend validates:
   - All mandatory documents present
   - Unit is in WINNER status
   - Buyer is authenticated and owns this registration

5. DATABASE UPDATES
   RegistrationUnit updated:
   - isKycSubmitted = true
   - KYC applicant data stored on RegistrationUnit

6. LEADSQUARED SYNC
   
   6a. Booking Form Activity created in LSQ:
       - Captures all applicant details
       - activityId stored → bookingFormActivitySubmitted = true
   
   6b. Documents uploaded to LSQ:
       - Aadhaar, PAN, photo uploaded to LSQ lead record
       - Documents linked to buyer's LSQ lead (prospectId)

7. MAVIS ERP UPDATE
   mavisService.findBookingRowId() called to locate the booking in Mavis
   mavisService.updateBooking() called with:
   - Booking_Progress_Status = 'Final'
   - Booking_Date = date of unit allocation payment
   - Payment schedule ID (based on typology)
   mavisBookingFinalUpdated = true on success

8. PAYMENT SCHEDULE GENERATION
   insertPaymentScheduleandUpdateMilestone() called
   Creates MilestonePaymentTracking records for all milestone keys:
   - ml-or (On Registration)
   - ml-ual (Unit Allocation)
   - ml-hcf (Home Confirmation)
   - ml-rou (Stamp Duty/Registration)
   - ml-tds (TDS)
   
   Each record includes:
   - totalAmount (calculated from unit price and milestone percentage)
   - totalPaid = 0
   - balanceAmount = totalAmount
   - status = pending

9. BOOKING ACTIVITY (final LSQ sync)
   Final booking activity submitted to LSQ:
   - Complete booking data including KYC confirmation
   - bookingActivitySubmitted = true

10. NOTIFICATIONS
    Buyer receives KYC confirmation WhatsApp message via Kaleyra
```

---

## KYC Tracking Flags

All flags are on the `registration_units` table:

| Flag | Meaning |
|------|---------|
| `isKycSubmitted` | KYC form data submitted |
| `eVerificationCompleted` | Electronic identity verification complete |
| `isKycPdfSubmitted` | KYC PDF generated and stored |
| `selfKycSubmitted` | Self-KYC (without SM) form submitted |
| `selfKycFinalSubmitted` | Self-KYC fully finalized |
| `bookingTokenActivitySubmitted` | LSQ booking token activity synced |
| `bookingFormActivitySubmitted` | LSQ booking form activity synced |
| `bookingActivitySubmitted` | LSQ final booking activity synced |
| `mavisBookingCreated` | Initial booking created in Mavis |
| `mavisUnitUpdated` | Unit status updated in Mavis |
| `mavisBookingFinalUpdated` | Booking marked Final in Mavis |

---

## KYC PDF Generation

After KYC data is saved, the system generates a formatted KYC PDF using **Puppeteer** (headless browser):

1. Backend renders KYC data into an HTML template
2. Puppeteer converts HTML to PDF
3. PDF uploaded to Azure Blob Storage
4. PDF blob path stored on RegistrationUnit
5. `isKycPdfSubmitted = true` set on RegistrationUnit

The PDF serves as the official booking form document. Both admin and the buyer can download it.

---

## Physical Event KYC (SM-Assisted)

During a PHYSICAL_EVENT allocation:

```
1. SM completes unit selection for buyer
2. SM switches to KYC view within SM Portal physical allocation flow
3. SM fills KYC form on behalf of buyer (buyer present at site)
4. SM uploads documents captured on-site (camera/scanner)
5. SM submits KYC
6. Same downstream flow runs (LSQ, Mavis, payment schedule generation)
```

The SM Portal KYC route is: `/sales-manager/physical-allocation/kyc`

---

## CP-Assisted KYC

Channel Partners can access the KYC section in the CP Portal to assist buyers:

```
1. CP logs into CP Portal
2. CP navigates to their customer's record
3. CP accesses KYC section (/kyc route)
4. CP fills form and uploads documents on behalf of buyer
5. CP submits — same backend flow runs
```

CP can only access KYC for customers they registered (brokerId match enforced).

---

## KYC Failure Handling

### LSQ Sync Failure
- Booking form activity failure sets `bookingFormActivitySubmitted = false`
- Background cron retries LSQ sync
- Does NOT block KYC confirmation to the buyer

### Mavis Update Failure
- Failure logged; `mavisBookingFinalUpdated` remains false
- Background cron retries Mavis sync
- Does NOT block KYC confirmation to the buyer

### Document Upload Failure
- Document upload to Azure Blob is a prerequisite for form submission
- If upload fails, form cannot be submitted (client-side validation prevents it)
- User must retry the upload

---

## E-Verification (Separate Track)

Electronic verification (`eVerificationCompleted`) is a separate process from document upload KYC:

- E-verification confirms the buyer's identity via an OTP-based or Aadhaar-linked verification
- `eVerificationCompleted = true` set when verification is confirmed
- Both `isKycSubmitted` and `eVerificationCompleted` are required for full compliance
- Admin can view both flags independently in the customer management screen

---

## Admin KYC Management

From the Admin Portal (Customer Management → Customer Detail → KYC section):

- View KYC submission status per registration unit
- Download KYC PDF
- View uploaded document thumbnails
- Manually trigger LSQ or Mavis re-sync (if flags show failure)
- View all KYC tracking flags

---

## TDS Calculation

The system calculates TDS (Tax Deducted at Source) as part of the cost sheet at KYC time:

```
calculateTdsRate() function:
- If unit agreement value > threshold: TDS = 1% of agreement value
- TDS amount tracked in MilestonePaymentTracking (ml-tds milestone)
- Buyer must pay TDS separately or it is deducted from disbursement
```

---

## Offer Discounts at KYC

The `getStoredOfferDiscounts()` function is called during KYC cost sheet generation:
- Retrieves all active offers applicable to the buyer
- HOME_LOAN and VC_REQUEST discounts are fetched and included in the final cost sheet
- Discounts are reflected in the MilestonePaymentTracking amounts
