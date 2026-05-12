# Feature-Spec: SM Portal Login

**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: SM Portal Login

### 1.1 Objective

Allow Sales Managers and Sales Manager Admins to authenticate into the SM Portal using mobile OTP and access their sales workspace.

### 1.2 Scope

Applies to all users with role ID 4 (Sales Manager Admin) or role ID 5 (Sales Manager) logging in at the dedicated SM Portal login page. Admin (role 1) cannot use this login page.

### 1.3 Preconditions

- User must have an active SM account created by the admin (Is Active = ON)
- Mobile number must be registered in the system
- UAT static OTP: any valid SM mobile number works; OTP is environment-specific

### 1.4 UI Elements

| Element | Description |
|---------|-------------|
| Mobile number input | 10-digit Indian mobile number field |
| Send OTP button | Triggers OTP dispatch via SMS/WhatsApp |
| OTP input | 6-digit OTP entry field |
| Verify OTP button | Submits OTP for verification |
| Error message area | Displays invalid/expired OTP messages |

### 1.5 Validations and Business Rules

1. Mobile number must be a valid 10-digit Indian number registered as a Sales Manager account
2. OTP expires within a configured time window — expired OTP rejected with error
3. Rate limiting applies — repeated failed attempts are blocked temporarily
4. If SM account has Is Active = OFF, login is rejected regardless of valid OTP
5. On successful login, JWT token is issued and stored for session management
6. Login redirects to `/sales-manager/callback-requests` (default landing page)

### 1.6 System Actions on Login

1. OTP is generated and sent via Kaleyra (SMS/WhatsApp)
2. JWT token issued on successful OTP verification
3. Session is established with the SM's role and user ID
4. User is redirected to the Callback Requests management screen

### 1.7 Notifications

- OTP delivered to registered mobile number via SMS or WhatsApp

### 1.8 Audit and Logging

- Login event is recorded with timestamp, mobile number, and role
- Failed login attempts are logged

---

## How to Use: Logging Into the SM Portal

**Who does this:** Sales Manager or Sales Manager Admin

---

**Step 1 — Open the SM Portal**

In your browser, go to `https://uat-web.xrportal.in/sales-manager`. You will see the SM Portal login page.

**Step 2 — Enter your mobile number**

Type your registered 10-digit mobile number and click **Send OTP**.

**Step 3 — Enter the OTP**

A one-time password will be sent to your mobile via SMS or WhatsApp. Enter it in the OTP field and click **Verify OTP**.

- If you enter an incorrect or expired OTP, an error message will appear. Click **Send OTP** again to request a new code.

**Step 4 — Access the portal**

On successful verification, you will be taken directly to the **Callback Requests** page — your main workspace for managing customer calls.

> **Note:** If you see an error saying your account is not active, contact your admin to ensure your SM account has the Is Active flag turned on.
