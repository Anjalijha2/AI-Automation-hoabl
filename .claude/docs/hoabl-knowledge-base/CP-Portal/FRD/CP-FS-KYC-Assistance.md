# Feature-Spec: KYC Assistance

**Portal:** Channel Partner Portal
**URL:** `https://uat.xrportal.in/kyc`
**Created:** 2026-05-12
**Status:** Complete

---

<!-- FSD-CORRECTION 2026-05-25 — CRITICAL SECURITY GAP -->
> ⚠️ **`POST /api/v1/cp/registration` is UNAUTHENTICATED.** No auth middleware (`protect` / `restrictTo`) on this endpoint. Any caller (no token required) can submit CP self-KYC data. // Source: cp.routes.js (CP registration route)
>
> Additionally: a logged-in CP-A can submit KYC for CP-B by passing CP-B's phone number — no ownership check. // Source: cp.controller.js (KYC submit handler)

## Feature 1: Assist Customer KYC After Unit Allocation

### 1.1 Objective

<!-- FSD-CORRECTION 2026-05-25 -->
Allow CPs to complete **their own** KYC (Know Your Customer) self-registration. **No backend endpoint exists for CPs to submit KYC on behalf of a buyer** — buyer-KYC-via-CP is a buyer-portal flow, not a CP-portal flow. // Source: cp.routes.js (only `/cp/registration` and `/cp/kyc` endpoints exist)

### 1.2 Scope

<!-- FSD-CORRECTION 2026-05-25 -->
CP self-KYC only (`POST /cp/registration` — unauthenticated). The WINNER-prerequisite and buyer-KYC-on-behalf described below do NOT correspond to any implemented backend endpoint.

### 1.3 Preconditions

- CP must be logged in (for `/cp/kyc` read) — **NOT required for `/cp/registration` submit** (unauthenticated)

### 1.4 KYC Form — Applicant Fields

<!-- DOC_DRIFT-CP-KYC-002 added 2026-06-07: Business Region options from live capture -->

For the CP self-KYC firm record, the form sections (verified against live UI 2026-06-06) are:

**Firm Details**
| Field | Description |
|-------|-------------|
| Firm Name (`orgName`) | Required. Free text. |
| Firm Address (`address`) | Required. Free text — full address. |
| Business Region (select) | Required. **Options: MMR / Pune / BGLR** (Mumbai Metropolitan Region, Pune, Bengaluru). |

**Contact Details**
| Field | Description |
|-------|-------------|
| Growth Partner Owner Name (`ownerName`) | Required. |
| Email ID (`email`) | Required. Rendered as `type=text` in DOM. |
| Phone Number (`phone`) | Required. Rendered as `type=text` in DOM. |

**Additional Details**
| Field | Description |
|-------|-------------|
| Pin Code Office (`officePincode`) | Required. |
| PAN Number (`panNumber`) | Required. Format: ABCDE1234F. |
| RERA Number (`reraNumber`) | **Optional** — no asterisk on label. |

### 1.5 Required Documents

<!-- DOC_DRIFT-CP-KYC-001 corrected 2026-06-07: 3 documents, not 4 -->

| Document | Requirement |
|----------|------------|
| PAN Card | Upload slot — file input, no client-side `accept` MIME restriction observed |
| GST Certificate | Upload slot — file input, no client-side `accept` MIME restriction observed |
| MAHA RERA Certificate | Upload slot — file input, no client-side `accept` MIME restriction observed |

**3 documents are defined per the live UI.** Document uploads are NOT required to enable Submit at the UI gating layer (verified 2026-06-06) — backend enforcement of document presence requires product clarification.

### 1.6 Co-Applicant Rules

<!-- DOC_DRIFT-CP-KYC-001 corrected 2026-06-07: 3 documents, not 4 -->

Co-applicants are NOT applicable to CP self-KYC (this is a single-firm record). The "max 4 applicants" / "Add Applicant" pattern described historically pertains to the buyer-KYC flow, which has no backend endpoint in the CP portal (see Section 1.2 FSD-CORRECTION).

### 1.7 Validations and Business Rules

<!-- DOC_DRIFT-CP-KYC-001 corrected 2026-06-07: 3 documents, not 4 -->
<!-- DOC_DRIFT-CP-KYC-003 corrected 2026-06-07: disabled-button gating, not click-validation -->

1. PAN number: format ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
2. Pincode: numeric (length not enforced at client per live capture)
3. The 3 documents (PAN Card, GST Certificate, MAHA RERA Certificate) are listed as upload slots; backend mandatory enforcement is not exposed by client gating.
4. Maximum file size and format restrictions: no client-side `accept` attribute on the file inputs — server-side enforcement only.
5. **Submit gating is enforced by the disabled-button pattern, NOT by inline field error rendering.** The `Submit` button is `disabled=true` at the DOM level until all required fields (`orgName`, `address`, `Business Region`, `ownerName`, `email`, `phone`, `officePincode`, `panNumber`) carry non-empty values. Clicking the disabled Submit button is a no-op — no toast, no inline error, no navigation. There is no click-triggered validation error display.
6. E-verification via OTP can be completed to confirm authenticity (`eVerificationCompleted` flag) — backend behaviour, not exposed on this form.

### 1.8 System Actions on Submission

1. KYC data saved to the registration unit record
2. Documents uploaded to Azure Blob Storage with organized naming conventions
3. `isKycSubmitted = true` set on the registration unit record
4. Documents synced to LeadSquared CRM
5. KYC PDF generated (via Puppeteer) and stored in Azure Blob Storage

### 1.9 Notifications

- Customer receives confirmation of KYC submission

---

## How to Use: Completing Your CP Self-KYC

<!-- DOC_DRIFT-CP-KYC-001 corrected 2026-06-07: 3 documents, not 4 -->
<!-- DOC_DRIFT-CP-KYC-002 added 2026-06-07: Business Region options from live capture -->
<!-- DOC_DRIFT-CP-KYC-003 corrected 2026-06-07: disabled-button gating, not click-validation -->

**Who does this:** Channel Partner (firm-level self-KYC onboarding)

---

**Step 1 — Navigate to KYC**

From the sidebar, click **KYC**. The KYC form loads with four sections: Firm Details, Contact Details, Additional Details, KYC Document Upload.

**Step 2 — Firm Details**

- **Firm Name** — enter your legal firm name.
- **Firm Address** — enter the full firm address.
- **Business Region** — open the dropdown and select one of: **MMR**, **Pune**, or **BGLR**.

**Step 3 — Contact Details**

- **Growth Partner Owner Name** — required.
- **Email ID** — required.
- **Phone Number** — required.

**Step 4 — Additional Details**

- **Pin Code Office** — required.
- **PAN Number** — required (format: ABCDE1234F).
- **RERA Number** — optional.

**Step 5 — Upload documents**

Upload the 3 required documents in the **KYC Document Upload** section:
1. **PAN Card**
2. **GST Certificate**
3. **MAHA RERA Certificate**

> The Submit button is **disabled by default** and only becomes enabled once all required text fields above are populated. The form does NOT display inline error messages on Submit click — instead, the button itself stays disabled until the form is complete. If Submit remains greyed out, scroll back through Firm Details / Contact Details / Additional Details and confirm every starred field has a value.

**Step 6 — Submit KYC**

Once the **Submit** button becomes enabled, click it. On success, your KYC enters review and the dashboard header indicator updates to "Your KYC is in review" until admin approval.

To abandon the form without saving, click **Cancel**.
