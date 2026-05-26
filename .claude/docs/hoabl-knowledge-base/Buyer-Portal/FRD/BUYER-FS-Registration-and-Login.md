# Feature-Spec: Registration and Login

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/` (login), `/register`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Buyer Login

### 1.1 Objective

Allow registered buyers to authenticate into the Buyer Portal using mobile OTP and access their property purchase dashboard.

### 1.2 Scope

Applies to users with role ID 2 (Buyer/User). Buyers cannot self-register — they must first be registered by a CP or admin. This login page handles returning buyers.

### 1.3 Preconditions

- Buyer must have been registered in the system by a CP or admin
- Buyer's mobile number must be linked to an active registration

### 1.4 UI Elements

| Element | Description |
|---------|-------------|
| Nationality tabs | Indian National / NRI tab selector |
| Mobile number input | 10-digit or international format |
| Send OTP button | Triggers OTP via SMS/WhatsApp |
| OTP input | 6-digit OTP entry |
| Verify OTP button | Submits OTP for verification |

### 1.5 OTP Rules

- UAT static OTP: **147258**
- OTP expires within a configured time window
- `lastOtpSentAt` timestamp prevents OTP spam
- NRI buyers can enter their international phone number with country code

### 1.6 Consent Flow (First Login Only)

- First login prompts the buyer to view and accept the Terms and Conditions
- Consent recorded: `isConsented = 1` (agreed), `0` (disagreed), `null` (undecided)
- Buyers who disagree may have restricted access

### 1.7 System Actions on Login

1. OTP generated and sent via **Epinet SMS** (NOT Kaleyra — Kaleyra imports commented out in `communication.service.js:8-9`) <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js, auth.controller.js -->
2. JWT token issued on successful OTP verification
3. Session established with buyer's role and registration data
4. Buyer redirected to `/home` (Home Dashboard)

### 1.8 Business Rules

1. Buyers cannot self-register on the portal — a CP or admin must register them first
2. Referral entry point: `/ref/:hvCode` captures the referring CP's code for registration attribution
3. NRI buyers: international country code supported; OTP channel may differ

---

## How to Use: Logging Into the Buyer Portal

**Who does this:** Registered buyer (returning visit)

---

**Step 1 — Open the Buyer Portal**

Go to `https://uat.xrportal.in` in your browser or mobile.

**Step 2 — Select your nationality**

Tap the appropriate tab: **Indian National** or **NRI**.

**Step 3 — Enter your mobile number**

Type your registered mobile number. For NRI, include your country code. Click **Send OTP**.

**Step 4 — Enter the OTP**

A one-time password will arrive by SMS or WhatsApp. Enter it and click **Verify OTP**.

**Step 5 — Accept Terms and Conditions (first login only)**

If this is your first login, you will be shown the Terms and Conditions. Read and tick the checkbox to agree, then proceed.

**Step 6 — Access your dashboard**

You will land on your Home Dashboard showing all your registrations and their current status.

> **If you can't log in:** Your mobile number may not be registered. Contact your Channel Partner or the sales team to confirm your registration is active.
