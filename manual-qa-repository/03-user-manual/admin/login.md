# Admin Portal — Login Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin`
**Sources:** ADMIN-BRD-Login.md · ADMIN-FS-Login.md · ADMIN-FRD-Login.md
**Last Updated:** 2026-05-22

---

## Overview

The Login module is the only entry point to the XR Portal Admin application. It uses a 2-step Mobile OTP flow — no username/password. An admin enters a registered 10-digit mobile number, requests an OTP, then enters the 6-digit code received via SMS. On success the JWT session is established (1-day expiry) and the browser is redirected to the Customers dashboard at `/admin/customers`.

The login page is reached only by visiting `https://uat-web.xrportal.in/admin` directly. There is no sidebar nav item — when not logged in, every protected route redirects here.

---

## Page Layout (At a Glance)

**Step 1 — Mobile Number screen**
- HoABL logo, side banner, heading "Admin Login".
- Mobile number field (prefixed `+91`).
- Terms & Conditions and Privacy Policy links.
- **Send OTP** button.
- Copyright footer.

**Step 2 — OTP Entry screen**
- Back arrow (top-left) — returns to Step 1.
- Heading "ENTER OTP" + sub-text.
- Six single-digit OTP input boxes.
- Countdown timer (e.g. `57s`).
- **Re-Send OTP** link (disabled until timer reaches 0).
- **Submit OTP** button.

---

# Feature 1 — Send OTP (Mobile Entry)

### What it does
Initiates authentication by sending a one-time password to the admin's registered mobile number.

### Preconditions
- Admin / SM user is pre-provisioned in the user table (admin and SM accounts are NEVER auto-created — only CP users are).
- User's `isActive` flag is `true`.

### How to use
1. Open `https://uat-web.xrportal.in/admin`.
2. Type your 10-digit registered mobile number in the **Enter Mobile Number** field. Only digits are accepted; letters and special characters are blocked at the field level.
3. Click **Send OTP**.
4. The screen transitions to the OTP entry screen (Step 2).

### Result
- Backend hits `POST /api/v1/auth/admin/send-otp` with `{ mobile, userType: "admin" }`.
- A 6-digit OTP is sent via Kaleyra SMS.
- **UAT shortcut:** mobile `8888888888` + master OTP `258369` works without real SMS delivery.

### Warnings
- For roles `admin` / `sm` / `sm_admin`, unknown mobiles return HTTP 400 **"User not found"** — these roles are strictly pre-provisioned.
- If the user's `isActive=false`, backend returns HTTP 400 **"Your access to the portal has been revoked"**.
- **No backend rate limit.** The OTP throttle in `auth.controller.js:558-568` is commented out. Only the UI re-send timer enforces spacing; a direct API caller can request OTPs back-to-back.

---

# Feature 2 — Verify OTP & Establish Session

### What it does
Verifies the 6-digit OTP entered by the admin and, on success, creates a 1-day JWT session and redirects to the Customers dashboard.

### Preconditions
- Step 1 (Send OTP) completed.
- OTP entered within its timer window.

### How to use
1. On the OTP screen, type each digit of the 6-digit OTP into the boxes — focus auto-advances to the next box after each digit.
2. (On UAT) Enter `258369` for the admin master OTP.
3. Click **Submit OTP**.

### Result
- Backend hits `POST /api/v1/auth/admin/verify-otp` with `{ mobile, otp, userType: "admin" }`.
- On success: response contains a `token` (Bearer JWT, 1-day expiry), the `user` object (`id`, `roleId`, `mobile`), and a `permissions` map shaped as `{ moduleId: [actionIds] }` used by the UI to gate menu items.
- Browser stores the session and redirects to `/admin/customers`.

### Validation rules
| Input | Invalid Scenario | System Response |
|-------|------------------|-----------------|
| Mobile number | Empty | Send OTP click is a no-op; stays on login page |
| Mobile number | Fewer than 10 digits | OTP not sent |
| Mobile number | Letters / special chars | Characters blocked at input |
| Mobile number | All zeros (`0000000000`) | OTP rejected |
| OTP | Empty | Submit OTP does not proceed |
| OTP | Wrong 6 digits | Error message; stays on OTP screen |
| OTP | Fewer than 6 digits | Login rejected |
| OTP | All zeros (`000000`) | Rejected |
| Mobile not provisioned | Admin/SM mobile not in user table | HTTP 400 "User not found" |
| Deactivated user | `isActive=false` | HTTP 400 "Your access to the portal has been revoked" |

### Warnings
- **No account lockout.** Multiple wrong OTP attempts continue to be rejected but the account is not locked.
- Master OTP `258369` (admin) and `147258` (CP/buyer) are environment-configured. Two distinct master OTPs exist: `otpConfig.adminMasterOtp` (admin/sm) and `otpConfig.masterOtp` (user/cp).

---

# Feature 3 — Re-Send OTP

### What it does
Requests a new OTP if the original SMS was not received or the timer has expired.

### Preconditions
- You are on the OTP screen.
- The countdown timer has reached 0.

### How to use
1. Wait for the timer (e.g. `55s`) to count down to 0.
2. The **Re-Send OTP** link becomes clickable.
3. Click it. A new 6-digit OTP is sent and the timer restarts.

### Result
A fresh OTP is delivered. Enter it in the six boxes and click Submit OTP.

### Warning
The Re-Send disabling is UI-only. A direct API caller can request OTPs back-to-back without backend throttling (cooldown code is commented out).

---

# Feature 4 — Back to Mobile Entry

### What it does
Returns to Step 1 so you can correct a typo or use a different mobile number.

### Preconditions
- You are on the OTP screen.

### How to use
1. Click the **back arrow** at the top of the OTP screen.
2. The mobile number entry screen reappears.
3. Enter a different number and click **Send OTP** to start over.

### Result
The login flow restarts from Step 1.

---

# Feature 5 — Logout

### What it does
Clears the admin session in the browser and redirects to the login page.

### Preconditions
- An active admin session exists.

### How to use
1. Click your profile icon / name in the top-right corner of any admin page.
2. Click **Logout**.

### Result
- Browser hits `POST /api/v1/auth/logout` with the Bearer token.
- Server returns HTTP 200.
- Client clears local storage / session storage and redirects to `/admin`.

### Warning — CRITICAL SECURITY (GAP-TL-019)
**Logout is a server-side no-op.** The JWT is NOT invalidated, NOT blacklisted, and NOT recorded as revoked. The token remains usable for its full 1-day expiry window after Logout is clicked. Anyone holding a copy of the token (browser history, dev tools, intercepted log) can continue calling protected APIs.

Action required from the client: discard the token locally. Action required from the server: none today (logout endpoint is purely cosmetic). Do NOT write automated tests asserting a 401 on the same JWT after logout — it will pass.

---

# Feature 6 — Session Persistence

### What it does
Keeps the admin signed in across browser refreshes and tab restarts for 1 day.

### How it works
- JWT token is saved in `localStorage` (and used by Playwright `storageState` in test automation: `automation-repository/fixtures/.auth/admin.json`).
- Any request includes the `Authorization: Bearer <token>` header.
- Token TTL is 1 day. After expiry, protected routes redirect back to `/admin`.

### Result
You can close and reopen the browser within 1 day and remain logged in. After 1 day, you must log in again.

---

## Business Rules

1. Mobile number must be exactly 10 digits; non-numeric input is blocked at the field level.
2. OTP is 6 digits entered one per box; focus auto-advances on each digit.
3. Re-Send OTP is enabled only after the UI countdown timer expires (UI-only — no backend throttle).
4. Wrong OTP shows an error but does NOT lock the account.
5. Successful OTP → redirect to `/admin/customers`.
6. Session lasts 1 day (JWT `1d` expiry).
7. UAT static credentials: mobile `8888888888`, OTP `258369`.
8. Admin and SM users must be pre-provisioned; CP users are auto-created on first OTP request.
9. Logout does not invalidate the JWT server-side.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/admin/send-otp` | Send OTP to admin mobile |
| POST | `/api/v1/auth/admin/verify-otp` | Verify OTP → returns JWT + permissions |
| POST | `/api/v1/auth/logout` | Client-side logout (server no-op) |

**Send OTP body:** `{ "mobile": "8888888888", "userType": "admin" }`
**Verify OTP body:** `{ "mobile": "8888888888", "otp": "258369", "userType": "admin" }`
**Verify OTP response:** `{ token, user: { id, roleId, mobile }, permissions: { moduleId: [actionIds] } }`

---

## Role Restrictions

- All protected admin endpoints require `roleId = 1` (Admin) or `roleId = 4` (Sales Manager Admin).
- `permissions` map returned at verify-OTP gates menu visibility — admins with missing module permissions will not see those menu items.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Click Send OTP, nothing happens | Mobile field empty or fewer than 10 digits | Re-enter a valid 10-digit mobile |
| "User not found" error | Admin/SM mobile not pre-provisioned | Ask system admin to provision the user; do not retry with a different number expecting auto-create |
| "Your access to the portal has been revoked" | Account `isActive=false` | Contact system admin to reactivate the account |
| Wrong OTP shown but no lockout | By design — no lockout configured | Try again with the correct OTP |
| OTP screen times out | OTP TTL exceeded | Wait for timer, click Re-Send OTP |
| Browser keeps redirecting to `/admin` mid-session | JWT expired (1-day TTL) | Log in again |
| Auto-tests fail with login redirect | `admin.json` session file stale | Re-run `npm run auth:setup` |
