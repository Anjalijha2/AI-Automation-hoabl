# Visual Memory — Sales Manager Portal / Login

**Captured:** 2026-06-05
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/sales-manager)
**CAPTURE_STATUS:** FULL

---

## Route

- **SM login URL:** `https://uat-web.xrportal.in/sales-manager` (the bare path — NOT `/sales-manager/login`)
- Source: `source-code/admin-sm-cp-portal/src/App.jsx` → `<Route path="/sales-manager" element={<SalesManagerLoginPage />} />`
- On successful OTP verification: `navigate('callback-requests')` → `/sales-manager/callback-requests`
- The unrelated `/login` page is the **Growth Partner / CP** login — a different portal entry point

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `login-initial.png` | SM login — initial state, mobile input empty, role tabs visible | Live inspection 2026-06-05 |
| `login-otp-entry.png` | SM login — OTP screen after Send OTP (6 OTP boxes, 59s countdown, "OTP sent successfully" toast) | Live inspection 2026-06-05 |
| `login-otp-invalid.png` | SM login — OTP invalid submission (000000); page rejects and clears boxes | Live inspection 2026-06-05 |
| `login-otp-resend-enabled.png` | SM login — Re-Send OTP enabled (countdown 0s, green Re-Send OTP link active) | Live inspection 2026-06-05 |
| `login-success-dashboard.png` | SM portal — post-login landing on Callback Requests dashboard ("Welcome, Tester") | Live inspection 2026-06-05 with OTP 258369 |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17 | preserved |

---

## Key Structural Notes

### Login form (`/sales-manager`)
- Page title: `HoABL | Sales Manager`
- Heading: `h2` "SALES MANAGER LOGIN" (lowercase CSS uppercase transform applied; raw text "Sales Manager Login")
- Mobile input: `input[name="phone"]`, `type="tel"`, `maxLength=10`, `placeholder="Enter Mobile Number"`, prefix `+91`
- Role selector: Ant Design `Radio.Group` with `name="role"`
  - `value="sales_manager_admin"` — label "Sales Manager Admin" (DEFAULT)
  - `value="sales_manager"` — label "Sales Manager"
- Send OTP button: `button.ant-btn-submit` (also matchable by `:has-text("Send OTP")`), type="submit"
- Validation: `phoneRegex` enforces valid 10-digit mobile; error message "Please enter a valid 10-digit mobile number"

### OTP screen
- Heading: `h2` "ENTER OTP"
- Description: `p` "Enter the OTP sent to your phone number"
- Back button: `button.reset-btn.back-to-mobile` (chevron left icon) — returns to mobile screen, resets state
- OTP inputs: 6 boxes with `aria-label="OTP Input 1"` through `aria-label="OTP Input 6"`
- Timer display: shows `XXs` countdown (60 seconds initial — `startTimer(60)`)
- Re-Send link: `button.common-link` with text "Re-Send OTP" — disabled while countdown active (text changes to include "in NNs"), enabled when timer reaches 0
- Submit OTP button: `button.ant-btn-submit` with text "Submit OTP"

### API endpoints (Redux actions)
- `sendSalesManagerOtp({ phone, countryCode: '+91', role })` — payload returns `otpExpires`
- `verifySalesManagerOtp({ otp, phone, countryCode, role })` — payload returns `{ token, user }`
- On success: `Auth.permission = user.permissions`, websocket `connect(token)`, navigate to `callback-requests`
- OTP regex: `otpRegex` matches 6 digits
- OTP expiry checked client-side via `dayjs` against `otpExpiry` from API

### Validation messages
- Mobile invalid: "Please enter a valid 10-digit mobile number"
- OTP required: "OTP is required"
- OTP length: "OTP must be 6 digits"
- OTP expired: "OTP has expired. Please request a new one." (resets to mobile screen)
- Generic failure: "Something went wrong. Please try again."

### Toast/message library
- Uses `antd` `message.useMessage()` with `contextHolder` — toasts render in top center as `.ant-message-notice`
- Success toast on OTP send: "OTP sent successfully!"
- Success toast on verify: "Login successful! Redirecting..."

### Auth storage (post-login)
- localStorage keys: `AUTH_TOKEN`, `user`, `permission_check`, `persist:xanadu_0.0.1`
- Auth helper: `helpers/auth.service.js` — `Auth.clear()` called on entering login route to wipe stale tokens
- Redux slice: `redux/users/authAction.js`

### Static UAT OTP
- Mobile `8888888888` + OTP `258369` (per CLAUDE.md table — same as Admin)
