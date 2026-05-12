# KYC Workflow — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Buyer Portal, CP Portal, SM Portal, Admin Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

KYC (Know Your Customer) is the mandatory identity and document verification step that occurs after a buyer successfully books a unit (WINNER status). KYC must be completed before the payment schedule is generated and before the booking is marked Final in the ERP system.

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Buyer | Completes KYC form, uploads documents, submits |
| Channel Partner | Can fill KYC on behalf of their registered customer |
| Sales Manager | Completes KYC at physical allocation site with customer present |
| Admin | Views KYC status, downloads KYC PDF, can trigger manual re-sync |
| System | Uploads documents to Azure, syncs to LeadSquared, generates KYC PDF, creates payment schedule |

---

## 3. KYC Prerequisites

All of the following must be true before KYC can be submitted:
1. `RegistrationUnit.status = WINNER` — unit booking payment must be confirmed
2. Buyer must be authenticated in the portal
3. `isKycSubmitted = false` — KYC must not already be submitted

---

## 4. Required Documents Per Applicant

| Document | Required |
|----------|---------|
| Passport photograph | Yes |
| PAN card image | Yes |
| Aadhaar card — front | Yes |
| Aadhaar card — back | Yes |

**All 4 documents are mandatory.** Submission fails if any are missing.

---

## 5. Co-Applicant Rules

- Maximum 4 applicants total (1 primary + 3 co-applicants)
- Label shown at limit: "Max. 4 Applicants allowed"
- All co-applicants must be blood relatives
- Each co-applicant requires the same 4 documents as the primary applicant

---

## 6. End-to-End Flow

1. Buyer reaches WINNER status (unit booking payment confirmed)
2. KYC prompt appears on Home Dashboard ("Complete KYC" — orange/red alert)
3. Buyer opens KYC form (or CP/SM opens on buyer's behalf)
4. Primary applicant form loads — auto-filled from registration data
5. Buyer verifies details, adds co-applicants if needed
6. Documents uploaded to Azure Blob Storage per applicant
7. Buyer reviews KYC Summary, ticks T&C checkbox, confirms
8. E-verification: OTP sent to registered mobile; buyer enters OTP
9. **On submission:**
   - `isKycSubmitted = true` on RegistrationUnit
   - Documents synced to LeadSquared
   - Mavis ERP booking marked Final
   - **Payment schedule generated** (milestone records created)
   - KYC PDF generated via Puppeteer and stored in Azure
   - Buyer receives WhatsApp confirmation
10. Buyer sees KYC Confirmed screen with: Registration No | KYC Number | Unit | No. of Applicants
11. "Download your Unit Details" link available

---

## 7. KYC Tracking Flags

| Flag | Meaning |
|------|---------|
| `isKycSubmitted` | KYC form data submitted |
| `eVerificationCompleted` | OTP e-verification completed |
| `isKycPdfSubmitted` | KYC PDF generated and stored in Azure |
| `bookingFormActivitySubmitted` | LeadSquared booking form synced |
| `bookingActivitySubmitted` | LeadSquared final booking synced |
| `mavisBookingFinalUpdated` | Mavis booking marked Final |

---

## 8. Key Business Rules

1. **Payment schedule only after KYC:** Milestone payment schedule is not created until KYC is submitted. A buyer who booked but did not complete KYC will not have a payment schedule.
2. **All 4 documents required per applicant:** Cannot submit with partial documents — client-side validation prevents it.
3. **PAN format:** ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
4. **Aadhaar format:** 12 digits
5. **Relationship must be blood relative** for all co-applicants
6. **LSQ/Mavis failures non-blocking:** If LeadSquared or Mavis sync fails, KYC confirmation is still shown to buyer. Cron retries failed syncs every 10 minutes.
7. **Form fields configurable via Strapi:** KYC field labels and validation rules are managed in Strapi CMS — no code change needed to adjust the form.
8. **Admin cannot override:** Admins view KYC status and can trigger re-sync but cannot bypass the WINNER prerequisite check.

---

## How to Use: KYC Workflow

---

### Buyer: Completing Your Own KYC

**Step 1:** After your unit payment is confirmed, go to your Home Dashboard. You will see a **Complete KYC** alert on your booking row.

**Step 2:** Click **Complete KYC** to open the KYC form.

**Step 3:** Your primary applicant details (name, address, mobile) will be pre-filled. Verify each field and add any missing information: PAN number, Aadhaar number, occupation, income.

**Step 4:** Upload all 4 required documents for yourself:
- Passport photograph
- PAN card
- Aadhaar front
- Aadhaar back

**Step 5 (if adding co-applicants):** Click **+ Add Applicant**. Fill in their details and upload all 4 documents for them too. Repeat for up to 3 co-applicants.

**Step 6:** Click **Confirm** to see the KYC Summary. Tick the T&C checkbox, then click **Confirm** again.

**Step 7:** An OTP will be sent to your mobile for e-verification. Enter it to submit.

**Step 8:** You will see the KYC Confirmed screen. Click **Download your Unit Details** to save your booking confirmation document.

---

### Channel Partner: Assisting a Customer with KYC

**Step 1:** Log into the CP Portal. Navigate to **KYC**. The KYC form for your customer (who has WINNER status) will load.

**Step 2:** Follow the same steps as buyer self-KYC — fill in applicant details, add co-applicants if needed, upload all 4 documents per applicant.

**Step 3:** Submit. The system processes KYC the same way as buyer self-submission.

---

### SM: Completing KYC at a Physical Allocation Event

**Step 1:** After the customer's unit payment is confirmed, the SM Portal automatically opens the KYC screen (`/sales-manager/physical-allocation/kyc`).

**Step 2:** Primary applicant details are pre-filled. Complete any missing fields with the customer's documents in hand.

**Step 3:** Upload all 4 documents using a camera/scanner at the site office.

**Step 4:** Add co-applicants if the customer is buying with family members.

**Step 5:** Submit KYC. The customer's booking is now complete.

---

### Admin: Viewing KYC Status

**Step 1:** Go to Customers module → find the customer → open their detail view.

**Step 2:** The KYC section shows all tracking flags: isKycSubmitted, eVerificationCompleted, isKycPdfSubmitted, LSQ sync statuses, Mavis status.

**Step 3:** Click **Download KYC PDF** to access the generated KYC document.

**Step 4:** If LSQ or Mavis sync failed (flag = false), note this — the retry cron will attempt again within 10 minutes. If persistent, contact technical support.

---

## 9. Related Documents

- [[KYC-Workflow]] — Technical KYC flow reference
- [[BRD-Buyer-Portal]] — Buyer Portal KYC module
- [[BRD-SM-Portal]] — Physical allocation KYC
- [[BRD-CP-Portal]] — CP Portal KYC assistance
- [[Feature-Spec - KYC]] — Buyer Portal Feature-Spec (confirmed from TC-CST-017 to TC-CST-023)
- [[BRD-Milestone-Payments]] — Payment schedule generated after KYC
