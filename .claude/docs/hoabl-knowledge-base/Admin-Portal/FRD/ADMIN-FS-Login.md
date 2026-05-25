---
type: feature-spec
portal: Admin Portal
module: Login
updated: 2026-05-11
status: complete
---

# Admin Portal — Login Module Feature Specifications

---

# Feature 1: Send OTP

## 1. Objective
Allow an admin user to initiate authentication by entering their registered mobile number and requesting a one-time password (OTP) to be sent to that number.

## 2. Scope
Entry point of the Admin Portal. No session required. Covers Step 1 of the 2-step OTP login flow.

## 3. Eligibility / Preconditions
- User must have a registered admin account (roleId = 1 or 4).
- Mobile number must be registered in the system.
- No active session required.

## 4. UI Changes
- Page loads at `/admin` with a centered login card.
- Mobile number input field with placeholder "Enter Mobile Number".
- "Send OTP" button below the input.

## 5. Form Details

| Field | Type | Mandatory | Constraints |
|-------|------|-----------|-------------|
| Mobile Number | Text input (numeric) | Yes | 10 digits; letters and special characters are blocked at input level |

## 6. Validations & Business Rules
1. Mobile field accepts numeric input only — non-numeric keystrokes are blocked.
2. Empty mobile field → "Send OTP" click does nothing (stays on login page).
3. Mobile numbers shorter than 10 digits → OTP not sent.
4. All-zeros mobile (0000000000) → rejected.
5. On UAT: any valid admin mobile with master OTP `258369` will authenticate (bypasses real SMS delivery).

## 7. System Actions on Submit
1. `POST /api/v1/auth/admin/send-otp` with body `{ "mobile": "<number>", "userType": "admin" }`.
2. Backend validates mobile exists as an admin user.
3. Generates 6-digit OTP and sends via Kaleyra SMS.
4. On UAT: SMS delivery skipped; static OTP `258369` accepted.
5. UI transitions to OTP entry screen (Step 2).

## 8. Notifications
- SMS via Kaleyra: OTP sent to registered mobile number.
- On UAT: no real SMS sent; static OTP used.

## 9. Audit & Logging
- OTP generation events are not individually audit-logged.
- Failed login attempts (wrong OTP) are logged server-side.

## How to Use

1. **Open the Admin Portal:** Go to `https://uat-web.xrportal.in/admin` in your browser.
2. **Enter your mobile number:** Type your 10-digit registered mobile number in the "Enter Mobile Number" field. Only digits are accepted.
3. **Click "Send OTP":** An OTP is sent to your mobile via SMS. On UAT, the static OTP `258369` is used — no real SMS is delivered.
4. **Proceed to Step 2:** The page automatically advances to the OTP entry screen.

---

# Feature 2: Verify OTP & Establish Session

## 1. Objective
Allow the admin to enter the received 6-digit OTP to complete authentication and gain access to the Admin Portal.

## 2. Scope
Step 2 of the 2-step login flow. On success, JWT session is established and admin is redirected to the Customers dashboard.

## 3. Eligibility / Preconditions
- OTP send must have been completed (mobile accepted in Step 1).
- OTP must be entered within the timer window before it expires.

## 4. UI Changes
- OTP screen shows 6 individual input boxes (one digit each).
- Timer countdown (e.g. "55s") visible — Re-Send OTP link is disabled until timer expires.
- "Back" button returns to mobile number entry.
- "Submit OTP" button submits.

## 5. Form Details

| Element | Description |
|---------|-------------|
| OTP Box 1–6 | Six individual single-digit inputs; auto-advance focus on each digit entry |
| Submit OTP button | Submits the 6-digit OTP |
| Re-Send OTP | Enabled only after timer reaches 0; triggers new OTP send |
| Back button | Returns to mobile number entry screen |

## 6. Validations & Business Rules
1. Empty OTP → Submit does not log in.
2. Partial OTP (fewer than 6 digits) → login rejected.
3. Wrong OTP → login rejected; error shown; user stays on OTP screen.
4. All-zeros OTP (000000) → rejected.
5. Multiple wrong OTP attempts → continued rejection (no lockout observed on UAT).
6. Re-Send OTP available only after timer expires.

## 7. System Actions on Submit
1. `POST /api/v1/auth/admin/verify-otp` with body `{ "mobile": "<number>", "otp": "<6digits>", "userType": "admin" }`.
2. On success: JWT token returned (1-day expiry); session stored in browser.
3. Admin redirected to `/admin/customers`.
4. On failure: error response; UI stays on OTP screen.

## 8. Notifications
None for OTP verification.

## 9. Audit & Logging
- Successful login: session start logged with admin user ID and timestamp.
- Failed OTP: logged server-side.

## How to Use

1. **Enter the OTP:** On the OTP screen, type each digit of the 6-digit OTP into the boxes (focus moves automatically to the next box after each digit). On UAT, enter `258369`.
2. **Click "Submit OTP":** The system verifies the code.
3. **On success:** You are redirected to the Customers dashboard — login is complete.
4. **On failure:** An error message appears on the OTP screen. Re-enter the correct OTP or wait for the timer to expire and click "Re-Send OTP" to request a new code.
5. **To go back:** Click "Back" to return to the mobile number entry screen.

---

# Feature 3: Logout

## 1. Objective
Allow the admin to explicitly end their session and invalidate the JWT token.

## 2. Scope
Available from any page within the Admin Portal via the user menu.

## 3. Eligibility / Preconditions
- Active admin session must exist.

## 4. UI Changes
- Logout option in the top-right user/profile menu.

## 5. Form Details
No form — single click action.

## 6. Validations & Business Rules
<!-- BA correction: GAP-TL-019, 2026-05-21 -->
- ⚠️ **KNOWN ISSUE — CRITICAL SECURITY:** Logout is a server-side no-op. The JWT is NOT invalidated, NOT blacklisted, and NOT recorded as revoked. The token remains usable for its full 1-day expiry window after the user clicks Logout.
- The client is expected to discard the token locally (clear localStorage / sessionStorage); the server enforces nothing.
- Browser is redirected to `/admin` (login page) — purely a client-side redirect.

## 7. System Actions on Submit
<!-- BA correction: GAP-TL-019, 2026-05-21 -->
1. `POST /api/v1/auth/logout` with Bearer token in Authorization header.
2. Server returns HTTP 200 success — **no token invalidation, no session record clear, no cookie clear** (the cookie-clear branch is commented out in `auth.controller.js:36-46`).
3. Client clears browser session storage locally.
4. Client redirects to login page.
5. Any post-logout request reusing the old token will SUCCEED until the JWT's 1-day expiry. QA must not write a test asserting post-logout 401.

## 8. Notifications
None.

## 9. Audit & Logging
- Logout event logged with admin user ID and timestamp.

## How to Use

1. **Open the user menu:** Click your profile icon or name in the top-right corner of any Admin Portal page.
2. **Click "Logout":** Your session is immediately terminated and your JWT token is invalidated.
3. **Result:** Browser redirects to the login page at `/admin`. Any saved links or back-navigation will require a fresh login.

---

# Auth Reference

| Portal | Send OTP Endpoint | Verify OTP Endpoint |
|--------|-------------------|---------------------|
| Admin | `/api/v1/auth/admin/send-otp` | `/api/v1/auth/admin/verify-otp` |
| Buyer | `/api/v1/auth/user/send-otp` | `/api/v1/auth/user/verify-otp` |
| Channel Partner | `/api/v1/auth/cp/send-otp` | `/api/v1/auth/cp/verify-otp` |
| Sales Manager | `/api/v1/auth/sales-manager/send-otp` | `/api/v1/auth/sales-manager/verify-otp` |

**JWT Details:**
- Token expiry: 1 day
- Type: Bearer (Authorization header)
- All protected admin endpoints require `roleId = 1` or `4`
- ⚠️ Logout does NOT invalidate the token server-side (see Feature 3 §6). Client must discard locally.

---

# Backend Gap Reconciliation (2026-05-21)

Controller-layer audit findings against `auth.controller.js`. These override conflicting statements above.

### 11.1 No backend OTP cooldown <!-- BA correction: GAP-TL-017, 2026-05-21 -->
- The OTP throttling block in `auth.controller.js:558-568` is commented out. There is NO server-side rate limit on Send OTP.
- Feature 1 §6 Rule 6 (re-send timer) applies to the UI only. A direct API caller can request OTPs back-to-back with no throttle.
- QA: do not test backend cooldown as a passing case.

### 11.2 Two distinct master OTPs <!-- BA correction: GAP-TL-018, 2026-05-21 -->
- Backend selects between `otpConfig.adminMasterOtp` (admin/sm) and `otpConfig.masterOtp` (user/cp).
- Admin Portal scope uses `adminMasterOtp`. UAT value `258369`.
- Feature 1 §6.5 implicitly refers to the admin master OTP.

### 11.3 Admin/SM pre-provisioning <!-- BA correction: GAP-TL-023, 2026-05-21 -->
- Add to Feature 1 §6: roles `admin`/`sm`/`sm_admin` require pre-existence in the user table. Unknown mobiles return HTTP 400 "User not found".
- CP role is auto-created — out of admin portal scope.

### 11.4 "Access revoked" message <!-- BA correction: GAP-TL-024, 2026-05-21 -->
- Add to Feature 2 §6: if `isActive=false` on the resolved user, verify-OTP returns HTTP 400 with exact text "Your access to the portal has been revoked".

### 11.5 `permissions` field in verify-OTP response <!-- BA correction: GAP-TL-022, 2026-05-21 -->
- verify-OTP success response includes `permissions: { moduleId: [actionIds] }` for admin/sm/cp.
- UI uses this to gate menu items.

### 11.6 `sendOtpV3` hidden fields <!-- BA correction: GAP-TL-020, 2026-05-21 -->
- send-otp silently accepts and forwards to LeadSquared: `sessionId`, `hvCode`, `nri`, `fullUrl`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gad_source`, `gad_campaignid`, `gbraid`, `gclid`.
- Admin Portal does not transmit these — documented here so unknown-field tolerance is not flagged as a bug.
