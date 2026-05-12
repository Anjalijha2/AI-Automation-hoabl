# Feature-Spec: CP Portal Login

**Portal:** Channel Partner Portal
**URL:** `https://uat.xrportal.in/login`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: CP Portal Login

### 1.1 Objective

Allow registered Channel Partners (Growth Partners) to authenticate into the CP Portal using mobile OTP and access their workspace.

### 1.2 Scope

Applies to users with role ID 3 (Channel Partner) logging in at the CP Portal login page. The login page is at the root-level public route `/login`.

### 1.3 Preconditions

- User must have an active CP account registered in the system
- CP registration profile must be completed (`isCpRegistrationCompleted = true`)
- Mobile number must be registered as a CP account

### 1.4 UI Elements

| Element | Description |
|---------|-------------|
| Mobile number input | 10-digit mobile number with country code support |
| Send OTP button | Triggers OTP via SMS/WhatsApp |
| OTP input | 6-digit OTP entry |
| Verify OTP button | Submits OTP for verification |
| Error messages | Displayed for invalid OTP, unrecognised number, or incomplete profile |

### 1.5 Validations and Business Rules

1. Mobile number must be registered as a CP account — unrecognised numbers are rejected
2. OTP expires within a configured time window
3. Rate limiting prevents repeated failed attempts
4. If CP registration profile is incomplete (`isCpRegistrationCompleted = false`), CP is redirected to complete their profile (RegisterCp) before accessing the main portal
5. On successful login, JWT token is issued and session established
6. Buyer (role 2) and SM (role 4/5) credentials do not work on this login page

### 1.6 System Actions on Login

1. OTP sent to registered mobile via Kaleyra (SMS/WhatsApp)
2. JWT token issued on successful OTP verification
3. If profile complete → redirect to `/dashboard`
4. If profile incomplete → redirect to profile completion screen

### 1.7 Notifications

- OTP delivered to mobile via SMS or WhatsApp

### 1.8 Audit and Logging

- Login event recorded with timestamp, mobile, and role

---

## How to Use: Logging Into the CP Portal

**Who does this:** Channel Partner (Growth Partner)

---

**Step 1 — Open the CP Portal**

Go to `https://uat.xrportal.in/login` in your browser. You will see the Channel Partner login page.

**Step 2 — Enter your mobile number**

Type your registered mobile number and click **Send OTP**.

**Step 3 — Enter the OTP**

A one-time password will be sent to your mobile. Enter it in the OTP field and click **Verify OTP**.

- If the OTP is incorrect or expired, an error message appears. Click **Send OTP** again to get a new code.

**Step 4 — Access the dashboard**

On successful login, you will be taken to your **Dashboard** where you can see all your registered customers.

> **First-time login:** If your profile is not yet complete, you will be prompted to fill in your details before accessing the portal. Complete the registration form and submit to proceed.
