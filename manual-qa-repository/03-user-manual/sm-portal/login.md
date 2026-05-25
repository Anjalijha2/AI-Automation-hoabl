# SM Portal — Login User Guide

**Audience:** Sales Manager (role 5) / Sales Manager Admin (role 4)
**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager`
**Sources:** SM-BRD-SM-Portal.md · SM-FRD-SM-Portal.md · SM-FS-Login.md
**Last Updated:** 2026-05-22

---

## Overview

The SM Portal login page is the entry point for the sales team. Unlike the Admin Portal, the SM Portal uses a separate, mobile-optimised login screen with a tab selector that distinguishes between **Sales Manager Admin** (role 4) and **Sales Manager** (role 5) sign-in flows. Authentication is mobile OTP only — there is no password. On successful verification, the user is redirected to `/sales-manager/callback-requests`, the default landing page.

This guide covers page load, tab selection, mobile-number entry, OTP delivery and verification, validation errors, and the post-login redirect.

UAT credentials (Sales Manager Admin tab): Mobile `8888888888` / OTP `258369` (static UAT value).

---

## Page Layout (At a Glance)

1. **HoABL branding header** — top of page.
2. **Role tab selector** — two tabs: **Sales Manager Admin** and **Sales Manager**. The active tab determines which role context the OTP is verified against.
3. **Mobile number input** — 10-digit Indian number field.
4. **Send OTP button** — dispatches OTP via SMS / WhatsApp through Kaleyra.
5. **OTP input** — 6-digit code field (appears after Send OTP is clicked).
6. **Verify OTP button** — submits OTP and issues JWT on success.
7. **Error / status area** — inline messages for validation, expired OTP, inactive account, and rate-limit blocks.

---

# Feature 1 — Page Load

### What it does
Renders the SM Portal login screen with the role tab selector defaulted to **Sales Manager Admin**.

### Preconditions
- Browser open at `https://uat-web.xrportal.in/sales-manager`.
- No active SM session in browser storage.

### How to use
1. Navigate to `https://uat-web.xrportal.in/sales-manager`.
2. The login screen renders with the HoABL header, role tabs, and mobile number input.
3. If a valid session already exists, you are redirected automatically to `/sales-manager/callback-requests` (skipping login).

### Result
The login screen is interactive and ready for tab selection + mobile entry.

---

# Feature 2 — Select Role Tab

### What it does
Switches the login context between **Sales Manager Admin** (role 4) and **Sales Manager** (role 5). The portal validates the OTP-verified mobile number against the chosen role.

### Preconditions
- Login page is loaded.

### How to use
1. At the top of the form, look for the two tabs.
2. Click **Sales Manager Admin** if your account is provisioned with role ID 4 (manage all requests + reassignment).
3. Click **Sales Manager** if your account is provisioned with role ID 5 (handle your own assigned requests).
4. The tab highlight moves to the selected option. The form below remains the same — only the role context changes.

### Result
The form is set to verify the OTP against the chosen role. Selecting the wrong tab for your account will cause verification to fail with an account-mismatch error.

### Note
UAT credentials `8888888888 / 258369` are provisioned for the **Sales Manager Admin** tab. Use that tab when testing on UAT.

---

# Feature 3 — Enter Mobile Number and Send OTP

### What it does
Captures the SM's registered mobile number and triggers OTP dispatch via Kaleyra (SMS + WhatsApp).

### Preconditions
- Mobile number is registered against an active SM account (`Is Active = ON`).
- Correct role tab is selected.

### How to use
1. Click the **Mobile number** input.
2. Type your 10-digit Indian mobile number (digits only — no `+91`, no spaces, no dashes).
3. Click **Send OTP**.
4. A loading indicator appears briefly while Kaleyra dispatches the code.

### Result
- A 6-digit OTP is sent to the registered mobile via SMS and WhatsApp.
- The OTP input field becomes visible / enabled.
- A "OTP sent" confirmation message appears.

### Validation errors
| Trigger | Message |
|---------|---------|
| Empty input | "Please enter your mobile number." |
| Less than 10 digits or non-numeric | "Enter a valid 10-digit mobile number." |
| Mobile not registered | "Account not found." |
| Account inactive (`Is Active = OFF`) | "Account is inactive. Contact your admin." |
| Rate limit hit (too many sends) | "Too many attempts. Try again in a few minutes." |

---

# Feature 4 — Enter and Verify OTP

### What it does
Submits the 6-digit OTP for verification. On success, issues a JWT, establishes a session, and redirects to the SM workspace.

### Preconditions
- OTP has been dispatched via Feature 3.
- OTP has not expired (configured time window).

### How to use
1. Retrieve the 6-digit OTP from your SMS / WhatsApp (on UAT use `258369`).
2. Type the OTP in the **OTP** field.
3. Click **Verify OTP**.

### Result
- JWT token is issued and stored for session management.
- Session is established with your SM role and user ID.
- Browser redirects to `https://uat-web.xrportal.in/sales-manager/callback-requests`.
- Login event is logged with timestamp, mobile number, and role.

### Validation errors
| Trigger | Message |
|---------|---------|
| Empty OTP | "Please enter the OTP." |
| OTP length wrong | "OTP must be 6 digits." |
| OTP incorrect | "Invalid OTP. Try again." |
| OTP expired | "OTP has expired. Click Send OTP to request a new code." |
| Repeated failed verifies | "Too many failed attempts. Try again later." (temporary block) |
| Role mismatch (tab vs account) | "Account not permitted for this login type." |

---

# Feature 5 — Resend OTP

### What it does
Re-dispatches a fresh OTP when the original has expired or did not arrive.

### Preconditions
- OTP was previously sent and either expired or was not received.
- Rate limit has not been hit.

### How to use
1. Click **Send OTP** again on the same form.
2. A new 6-digit code is dispatched; the previous code is invalidated.

### Result
A fresh OTP is sent. Use the new code in the OTP input field.

### Warning
Excessive resend clicks may trigger a rate-limit block. Wait a few minutes if blocked.

---

# Feature 6 — Post-Login Redirect

### What it does
Sends the verified SM into the default workspace.

### Preconditions
- OTP successfully verified.

### How to use
No user action required — happens automatically.

### Result
You land on `/sales-manager/callback-requests`. From there, the bottom navigation bar (mobile) or side menu exposes the other SM modules:
- Callback Requests (default)
- Towers (Tower Heatmap)
- Physical Allocation (when a PHYSICAL_EVENT campaign is active)

---

## Field Reference — Quick Lookup

| Element | Type | Required | Validation |
|---------|------|----------|------------|
| Sales Manager Admin tab | Tab | One must be active | Default tab |
| Sales Manager tab | Tab | One must be active | — |
| Mobile number | Text input | Yes | 10 digits, numeric only, registered account |
| Send OTP | Button | — | Enabled when mobile valid; disabled during rate-limit window |
| OTP | Text input | Yes (after Send OTP) | 6 digits, numeric, not expired |
| Verify OTP | Button | — | Enabled when OTP is 6 digits |

---

## Notifications

| Event | Channel |
|-------|---------|
| OTP dispatch | Kaleyra SMS + Kaleyra WhatsApp |
| Failed login attempts | Server log only — no buyer/SM notification |
| Successful login | No notification — session established silently |

---

## Role Differences

| Role | Role ID | After Login Sees |
|------|---------|-----------------|
| Sales Manager | 5 | Only callback requests assigned to them |
| Sales Manager Admin | 4 | All callback requests system-wide + reassignment controls |

The login form itself is identical for both — the tab selection plus the backend role lookup determine the post-login experience.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Account not found" after Send OTP | Mobile number not registered as SM | Confirm number with admin; admin creates SM account if needed |
| "Account is inactive" after Verify | `Is Active` flag is OFF | Contact admin to enable the SM account |
| OTP not received | SMS / WhatsApp delivery delay or wrong number | Wait 30 seconds; verify number; click Send OTP again |
| "Invalid OTP" on first try | Mistyped or expired code | Re-enter carefully or request a new OTP |
| "Too many attempts" | Rate-limit triggered by repeated sends or verifies | Wait several minutes before retrying |
| "Account not permitted for this login type" | Selected wrong tab for account's role | Switch to the correct tab (Admin vs Sales Manager) and retry |
| Redirected back to login after a previously-working session | Session expired or JWT cleared | Log in again |
| UAT credentials don't work on Sales Manager tab | UAT static credentials are provisioned for Admin tab | Use the **Sales Manager Admin** tab on UAT |
