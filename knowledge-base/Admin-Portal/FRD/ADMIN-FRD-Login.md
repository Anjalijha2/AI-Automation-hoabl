---
module: Login
url: https://uat-web.xrportal.in/admin
sprint: 1
status: Automated
spec: tests/ui/login.spec.js
tcs: TC_POS_001–004, TC_NEG_001–010, TC_FUNC_001–005, TC_SEC_001–003 (22 tests)
updated: 2026-05-10
---

# Module — Login

## 1. Overview

Entry point of the XR Portal Admin application. Uses a 2-step Mobile OTP authentication flow — no password. After successful login, admin is redirected to `/admin/customers`.

**URL:** `https://uat-web.xrportal.in/admin`
**Auth:** No saved session needed — this module tests the auth flow itself
**Page Object:** `src/pages/LoginPage.js` (via `testFixture.js` fixture)
**Selectors:** In page object constructor

## 2. Navigation

Direct URL — first page visited. No sidebar nav item.

Post-login redirects to `/admin/customers`.

## 3. Page Layout

### Step 1 — Mobile Number Entry

| Element | Selector |
|---------|---------|
| Mobile Input | `input[placeholder="Enter Mobile Number"]` |
| Send OTP Button | `button:has-text("Send OTP")` |

**Validation:** Mobile field is numeric-only (letters and special characters are blocked)

### Step 2 — OTP Entry

| Element | Selector |
|---------|---------|
| OTP Box 1 | `input[aria-label="OTP Input 1"]` |
| OTP Box 2 | `input[aria-label="OTP Input 2"]` |
| OTP Box 3 | `input[aria-label="OTP Input 3"]` |
| OTP Box 4 | `input[aria-label="OTP Input 4"]` |
| OTP Box 5 | `input[aria-label="OTP Input 5"]` |
| OTP Box 6 | `input[aria-label="OTP Input 6"]` |
| Submit OTP Button | `button:has-text("Submit OTP")` |
| Re-Send OTP | `text=Re-Send OTP` |
| Back Button | `button.reset-btn.back-to-mobile` |
| OTP Timer | `text=/\d+s/` |

## 4. Features

- 2-step flow: mobile number entry → OTP entry
- OTP boxes auto-advance focus between digits
- Timer countdown (e.g. "55s") before Re-Send OTP becomes clickable
- Back button returns to mobile entry screen
- Static OTP on UAT: `258369` for admin mobile `8888888888`

## 4a. How to Use

### Logging In to the Admin Portal

1. Open browser → go to `https://uat-web.xrportal.in/admin`
2. Enter your registered 10-digit mobile number in the "Enter Mobile Number" field
3. Click **Send OTP** — a 6-digit OTP is sent via SMS/WhatsApp
4. Enter the OTP across the 6 individual boxes (focus advances automatically)
5. Click **Submit OTP**
6. On success → you are redirected to the Customers page

> **UAT shortcut:** Mobile `8888888888` with OTP `258369` always works on UAT (static OTP).

### If OTP Doesn't Arrive

- Wait for the countdown timer (e.g. "55s") to expire
- Click **Re-Send OTP** once the timer finishes
- If still not received — contact the system administrator to verify the mobile number is registered

### Wrong OTP / Mistakes

- Entering the wrong OTP shows an error; the OTP screen stays open (you are not locked out)
- Click **Back** button to return to the mobile entry screen and restart the flow

### Session Expiry

- Your session lasts 1 day
- If redirected back to the login page mid-session → your session has expired → log in again

---

## 5. Business Rules

1. Mobile number must be 10 digits; letters and special characters are blocked
2. OTP is 6 digits entered across 6 individual boxes
3. OTP boxes auto-advance focus on each digit entry
4. Re-Send OTP is only available after the timer expires
5. Invalid OTP shows error message; user stays on OTP screen (no redirect)
6. Successful OTP → redirect to `/admin/customers`
7. UAT uses static OTP `258369` for mobile `8888888888`
8. Auth session is saved to `src/fixtures/.auth/admin.json` via `auth.setup.js` — used by all other modules

## 6. Integration Points

| Module | Relationship |
|--------|-------------|
| All modules | Login creates the auth session (`admin.json`) required by every other module |
| Customers | Successful login redirects directly to Customers page |

## 7. Domain Red Flags

No critical domain red flags specific to this module. The auth session (`admin.json`) being stale is the primary operational risk — re-run auth-setup when other modules fail with login redirect.

## 8. Open Clarifications

No open clarifications for this module.

## 9. Test Coverage

**Spec file:** `tests/ui/login.spec.js`
**Run command:** `npm run test:login` (standalone — no auth-setup needed)
**Note:** `login-tests` is the only project that does not depend on `admin.json`. All other projects do.

> **TC ID Note:** The login spec uses a type-based TC ID format (TC_POS, TC_NEG, TC_FUNC, TC_SEC) rather than the sequential TC-LGN-NNN format used by other modules. All 22 tests pass.

### Positive Flow (4 tests)

| TC | Description | Result |
|----|-------------|--------|
| TC_POS_001 | Valid mobile number → OTP sent successfully (OTP screen appears) | ✅ Pass |
| TC_POS_002 | Valid mobile + valid OTP → Successful login (redirected to /admin/customers) | ✅ Pass |
| TC_POS_003 | Correct redirection to `/admin/customers` after login | ✅ Pass |
| TC_POS_004 | OTP timer is visible and counts down | ✅ Pass |

### Negative — Mobile Number Validation (5 tests)

| TC | Description | Result |
|----|-------------|--------|
| TC_NEG_001 | Empty mobile field → clicking Send OTP does nothing (stays on login page) | ✅ Pass |
| TC_NEG_002 | Short mobile number (5 digits) → OTP not sent | ✅ Pass |
| TC_NEG_003 | Mobile field accepts numbers only — letters are blocked | ✅ Pass |
| TC_NEG_004 | All zeros mobile number (0000000000) → rejected | ✅ Pass |
| TC_NEG_005 | Special characters in mobile field → blocked | ✅ Pass |

### Negative — OTP Validation (5 tests)

| TC | Description | Result |
|----|-------------|--------|
| TC_NEG_006 | Empty OTP → Submit OTP does not log in | ✅ Pass |
| TC_NEG_007 | Wrong OTP (123456) → login rejected | ✅ Pass |
| TC_NEG_008 | Partial OTP — only 3 digits entered → login rejected | ✅ Pass |
| TC_NEG_009 | All-zeros OTP (000000) → login rejected | ✅ Pass |
| TC_NEG_010 | Multiple wrong OTP attempts → still rejected | ✅ Pass |

### Functionality (5 tests)

| TC | Description | Result |
|----|-------------|--------|
| TC_FUNC_001 | Back button returns to mobile entry screen | ✅ Pass |
| TC_FUNC_002 | Resend OTP element is visible on OTP screen | ✅ Pass |
| TC_FUNC_003 | OTP boxes auto-advance focus between digits | ✅ Pass |
| TC_FUNC_004 | Mobile field accepts only numeric input | ✅ Pass |
| TC_FUNC_005 | All 6 OTP boxes are present and editable | ✅ Pass |

### Security (3 tests)

| TC | Description | Result |
|----|-------------|--------|
| TC_SEC_001 | Access protected pages without login → redirected to login | ✅ Pass |
| TC_SEC_002 | SQL injection in mobile field — safely handled (no DB error, no login) | ✅ Pass |
| TC_SEC_003 | XSS injection in mobile field — script not executed | ✅ Pass |

**Auth credentials (UAT):**
- Admin Mobile: `8888888888`
- Admin OTP: `258369`
- Customer (Mamta): Mobile `1111111207`, OTP `147258`
- CP Portal: Mobile `8888888888`, OTP `147258`

---

## 10. API Reference

### Auth Flow (2-step OTP)

| Step | Method | Endpoint | Purpose |
|------|--------|----------|---------|
| 1 | POST | `/api/v1/auth/admin/send-otp` | Send OTP to mobile number |
| 2 | POST | `/api/v1/auth/admin/verify-otp` | Verify OTP → returns JWT |
| — | POST | `/api/v1/auth/logout` | Invalidate session (requires JWT) |

**Send OTP request body:**
```json
{ "mobile": "8888888888", "userType": "admin" }
```

**Verify OTP request body:**
```json
{ "mobile": "8888888888", "otp": "258369", "userType": "admin" }
```

**Verify OTP response (success):**
```json
{
  "token": "<JWT>",
  "user": { "id": 1, "roleId": 1, "mobile": "8888888888" }
}
```

### Auth Routes Per Portal

| Portal | Send OTP | Verify OTP |
|--------|----------|-----------|
| Admin | `/auth/admin/send-otp` | `/auth/admin/verify-otp` |
| Buyer | `/auth/user/send-otp` | `/auth/user/verify-otp` |
| CP | `/auth/cp/send-otp` | `/auth/cp/verify-otp` |
| Sales Manager | `/auth/sales-manager/send-otp` | `/auth/sales-manager/verify-otp` |

### JWT Details

- **Expiry:** 1 day (`1d`) — stored in `admin.json` via Playwright storageState
- **Type:** Bearer token (Authorization header)
- **Protected routes:** All non-auth endpoints use `protect` + `restrictTo('admin')` middleware
- **UAT Master OTP:** `ADMIN_MASTER_OTP=258369` — bypasses real SMS delivery; works for any admin mobile number on UAT
