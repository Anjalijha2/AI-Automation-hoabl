# Login Screen — Documentation

**Module:** Login  
**URL:** `https://uat-web.xrportal.in/admin`  
**Last Updated:** 2026-05-16

---

## 1. Purpose

Entry point for XR Portal Admin. Authenticates admin users via 2-step Mobile OTP flow. No password required.

---

## 2. Screen Elements

| Element | Type | Selector (placeholder) | Notes |
|---------|------|----------------------|-------|
| Mobile input | `<input type="tel">` | `input[placeholder*="Mobile"]` | Step 1 |
| Send OTP button | `<button>` | `button:has-text("Send OTP")` | Triggers OTP dispatch |
| OTP input | `<input>` | `input[placeholder*="OTP"]` | Appears after OTP sent |
| Login/Verify button | `<button>` | `button:has-text("Login")` | Step 2 submit |
| Error message | alert/toast | `[role="alert"]` | Validation errors |

> **Note:** Actual selectors extracted during discovery. Update `03-selectors/login.json` after `npm run discover`.

---

## 3. Workflows

### Primary Flow: Login
```
Open /admin
  → Enter mobile number
  → Click "Send OTP"
  → OTP field appears
  → Enter OTP
  → Click "Login"
  → Redirect to /customers (dashboard)
```

### Error Flow: Wrong OTP
```
Enter wrong OTP
  → Click "Login"
  → Error message shown
  → User retries or requests new OTP
```

---

## 4. UI States

| State | Description |
|-------|-------------|
| Initial | Mobile input only; OTP field hidden |
| OTP Sent | OTP field appears; mobile input may be disabled |
| Loading | Submit button disabled during API call |
| Error | Error message visible below relevant input |
| Success | Redirect away from login page |

---

## 5. Validations

| Field | Rule | Error Message |
|-------|------|---------------|
| Mobile | Required, 10 digits, numeric | "Mobile number is required" / "Invalid mobile" |
| OTP | Required, 6 digits | "OTP is required" / "Invalid OTP" |

---

## 6. API Calls

| Action | Expected API | Notes |
|--------|-------------|-------|
| Send OTP | POST `/auth/send-otp` | Body: `{ mobile }` |
| Verify OTP | POST `/auth/verify-otp` | Body: `{ mobile, otp }` |

---

## 7. Auth Behaviour

- On success: session saved to cookies/localStorage
- Session used by all protected routes
- Protected routes redirect to `/admin` if session invalid

---

## 8. Test Coverage

TCs: [01-test-cases/login/TC_LOGIN.md](../../01-test-cases/login/TC_LOGIN.md) — 22 TCs  
Spec: `tests/e2e/login.spec.js`  
Selectors: `03-selectors/login.json` _(after discovery)_

---

## 9. Screenshots

_(To be added after UI discovery run)_

---

## 10. Known Issues / Notes

- UAT uses static OTP `258369` — no real SMS
- `login-tests` project in Playwright does NOT require `admin.json` — standalone
- All other projects require auth-setup to run first

---

## 11. Related Pages

- Post-login: Customers (`/customers`)
- Auth setup: `tests/auth.setup.js`

---

## 12. Change History

| Date | Change | By |
|------|--------|----|
| 2026-05-16 | Initial documentation | Claude |
