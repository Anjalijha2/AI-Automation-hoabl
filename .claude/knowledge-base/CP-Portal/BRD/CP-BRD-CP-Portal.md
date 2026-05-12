# Channel Partner Portal — BRD

**Portal:** Channel Partner (Growth Partner) Portal
**URL:** `https://uat.xrportal.in/`
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The CP Portal is the interface for channel partners (real estate brokers and agencies) who bring customer leads to the XR Portal platform. CPs use it to register new buyers, track their referrals through the purchase journey, submit their Joint Business Plans, assist with customer KYC, and access project marketing materials.

The CP Portal bridges the developer and the buyer market through the channel partner network.

---

## 2. Who Uses This

| Role | Role ID | Description |
|------|---------|-------------|
| Channel Partner (CP) | 3 | Registered broker who refers buyers |
| Lead CP (Master CP) | 3 + isLeadCp=true | Senior CP who may manage member CPs |
| Member CP | 3 + leadCpId set | CP associated with a Master CP |

---

## 3. Module List

| # | Module | URL |
|---|--------|-----|
| 1 | Dashboard — Customer Registration and Tracking | `/dashboard` |
| 2 | Leads Management | `/leads` |
| 3 | JBP Submission | `/jbp` |
| 4 | KYC Assistance | `/kyc` |
| 5 | Project Information | `/project1/*` |

---

## 4. Key Business Rules

1. **CP isolation:** CPs see only customers they registered (`brokerId` = CP's user ID). They cannot see other CPs' customers.
2. **Duplicate check:** Registering a customer with a mobile number or email already linked to an existing registration for this project is rejected.
3. **T&C mandatory:** The customer's Undertaking/T&C consent checkbox must be ticked before registration can be submitted. This is stored as legal proof.
4. **Registration number format:** GHNG-XXXXXXXXXX (10 digits). Additional units for the same customer: GHNG-XXXXXXXXXX-A, -B, -C.
5. **JBP one per cycle:** One active JBP submission per CP per cycle. Post-submission editing requires the admin-reviewed edit request flow.
6. **JBP cycle must be OPEN:** Submissions are not accepted once a cycle is closed.
7. **JBP version tracking:** Approved edit requests increment the submission version; old version is marked EXPIRED.
8. **KYC is post-allocation only:** KYC assistance is only available after a customer has WINNER status (confirmed unit payment).
9. **All 4 KYC documents required:** Photo, PAN, Aadhaar front, Aadhaar back — all mandatory per applicant.
10. **Project content is read-only:** CPs cannot edit any project information; content is managed by admin via Strapi CMS.

---

## 5. CP Workflow — Registering a Customer

1. CP logs in at `https://uat.xrportal.in/login`
2. Dashboard loads showing existing registered customers
3. CP clicks "Register Customer" → registration form opens
4. CP fills in: First Name, Last Name, Mobile, Email, Purchase Purpose (required), Home Loan Intent, Budget, Floor Range preference, Walk-in Source
5. CP ticks the T&C / Undertaking consent checkbox (mandatory)
6. CP clicks Submit
7. System validates: mobile and email must not exist for this project
8. On success: registration created (status = Open), GHNG-XXXXXXXXXX number generated, brokerId = CP's ID, walkInSourceXrCode = CP's hvCode, customer notified via SMS/WhatsApp
9. Customer appears in CP's dashboard table

---

## 6. CP Workflow — JBP Submission

1. CP navigates to JBP section
2. If an OPEN cycle exists, the JBP form loads
3. CP fills in all 14 fields (brokerage, booking commitment, manpower, activities, digital channels, investment range, Yes/No fields, registration commitment)
4. CP submits → JbpSubmission created (status = ACTIVE, version = 1) → Thank You page shown
5. If changes needed: CP submits edit request → admin reviews → if approved, new version created; if rejected, original preserved

---

## 7. CP Workflow — KYC Assistance

1. After customer's unit payment is confirmed (WINNER status), CP navigates to KYC section
2. Primary applicant details are pre-filled from registration
3. CP verifies and completes any missing fields
4. CP uploads 4 documents per applicant (photo, PAN, Aadhaar front/back)
5. CP adds co-applicants if needed (max 4 total)
6. CP submits KYC → documents uploaded to Azure Blob → synced to LeadSquared → KYC PDF generated

---

## 8. Referral and Commission Tracking

- Each CP has a unique `hvCode` (HV Code)
- Buyers who register via a CP's referral link have `walkInSourceXrCode` = CP's hvCode
- `cpId` on PaymentTransaction indicates the booking came via CP referral
- Master CP (`isLeadCp = true`) can manage multiple Member CPs linked via `leadCpId`

---

## 9. Integrations

| Integration | Purpose |
|-------------|---------|
| LeadSquared (LSQ) | Lead data sync, KYC document upload |
| Azure Blob Storage | Document storage for KYC uploads |
| Kaleyra | SMS/WhatsApp customer notifications |
| Strapi CMS | Project content for the Project Information section |

---

## 10. Related Documents

- [[CP-Portal-BRD]] — Full CP Portal business requirements
- [[Feature-Spec - Customer Registration]] — Registration form details
- [[Feature-Spec - JBP Submission]] — JBP form and edit request flow
- [[Feature-Spec - KYC Assistance]] — KYC document requirements
- [[BRD-JBP-Management]] — Admin-side JBP cycle and submission management
