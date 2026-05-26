# Sales Manager Portal — BRD

**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager`
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Sales Manager Portal is a dedicated, mobile-optimised workspace for the sales team. SMs log in to manage customer callback and video call requests, view live inventory, and conduct in-person unit allocation events at site offices.

Unlike the Admin Portal, the SM Portal is narrowly scoped to sales-side operations — it does not expose configuration, reporting, or financial data.

---

## 2. Who Uses This

| Role | Role ID | Access |
|------|---------|--------|
| Sales Manager | 5 | Callback requests (own), towers view, physical allocation |
| Sales Manager Admin | 4 | All SM requests + manual reassignment |

---

## 3. Module List

| # | Module | URL |
|---|--------|-----|
| 1 | Callback Requests Management | `/sales-manager/callback-requests` |
| 2 | Tower and Unit Heatmap | `/sales-manager/towers` |
| 3 | Physical Allocation — Customer Search | `/sales-manager/physical-allocation` |
| 3a | Physical Allocation — Unit Selection & Payment | `/sales-manager/physical-allocation/checkout` |
| 3b | Physical Allocation — KYC | `/sales-manager/physical-allocation/kyc` |

---

## 4. Key Business Rules

1. **Round-robin assignment:** Callback requests are assigned to SMs by `lastRequestAssignedAt` — the SM who was assigned least recently gets the next request.
2. **isAvailable gate:** SM must have `isAvailable = true` to receive callback assignments. Admin controls this flag.
3. **COMPLETED is final:** Once a callback request reaches COMPLETED status, it cannot be modified.
4. **VC_DONE_PREFERENCE offer:** Recording this outcome may trigger the `VC_REQUEST` offer code, applying a discount to the customer's unit purchase.
5. **PHYSICAL_EVENT only:** Physical allocation only operates when a PHYSICAL_EVENT campaign is active.
6. **20-minute hold:** During physical allocation, selected units are held for 20 minutes while payment is processed.
7. **All 4 KYC documents required:** Each applicant (primary and co-applicants) must have all 4 documents (photo, PAN, Aadhaar front, Aadhaar back) before KYC can be submitted.
8. **Max 4 applicants:** Physical allocation KYC supports 1 primary + up to 3 co-applicants.
9. **Towers view is read-only:** SMs cannot change unit status from the heatmap.

---

## 5. Admin Workflow — Callback Request End-to-End

1. Buyer submits callback request via Buyer Portal
2. System assigns to SM via round-robin
3. SM logs in, sees request in REQUESTED status
4. SM opens request → clicks "Schedule Meeting" → picks date/time → optionally generates Teams link
5. Status → SCHEDULED
6. (Optional) SM confirms meeting → status → CONFIRMED
7. After the call: SM clicks "Record Outcome" → selects vcOutcome from 10 options
8. SM submits internal feedback → system sends buyer feedback token URL via SMS/WhatsApp
9. Buyer submits feedback via token link (no login required)
10. Status → COMPLETED

---

## 6. Admin Workflow — Physical Allocation End-to-End

1. Admin creates a PHYSICAL_EVENT campaign in Admin Portal
2. SM logs in → navigates to Physical Allocation
3. Walk-in customer arrives at site office
4. SM searches for customer by name/phone/registration number → selects record
5. SM browses available units → shows floor plan and cost sheet to customer
6. SM selects unit on behalf of customer → unit goes on 20-minute HOLD
7. Payment:
   - Online: QR code scan or gateway redirect
   - Offline: SM opens OfflinePaymentDrawer, enters reference/amount/date, uploads proof
8. On payment success: unit status → BOOKED, registration → WINNER
9. SM proceeds to KYC screen
10. SM fills applicant details (auto-filled from registration) + uploads 4 documents per applicant
11. Adds co-applicants if needed (max 3 additional)
12. SM submits KYC → KYC PDF generated → documents uploaded to Azure → synced to LSQ

---

## 7. Integrations

| Integration | Purpose |
|-------------|---------|
| LeadSquared (LSQ) | Callback activity sync, VC outcome recording, KYC document upload |
| Microsoft Teams | Auto-generated meeting links for scheduled video calls |
| Easebuzz / Razorpay | Payment processing during physical allocation |
| Azure Blob Storage | KYC document upload and storage |
| Kaleyra | WhatsApp notifications + click-to-call (NOT OTP) |
| Epinet | OTP SMS delivery <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js --> |

---

## 8. Related Documents

- [[SM-Portal-BRD]] — Full SM Portal business requirements
- [[Feature-Spec - Callback Requests]] — Detailed callback request specs
- [[Feature-Spec - Physical Allocation]] — Detailed physical allocation specs
- [[BRD-Allocation]] — Admin-side allocation campaign management
- [[KYC-Workflow]] — Full KYC workflow across all portals
