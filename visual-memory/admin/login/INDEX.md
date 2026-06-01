# Visual Memory — Admin Portal / Login

**Captured:** 2026-05-17  
**Viewport (desktop):** 1920×900  
**Environment:** UAT (https://uat-web.xrportal.in/admin)

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `mobile-screen-1920.png` | Login — Mobile Number entry (1920×900) | Live inspection via MCP browser |
| `mobile-screen.png` | Login — Mobile Number entry (default viewport) | Live inspection via MCP browser |
| `otp-screen.png` | Login — OTP entry (6 boxes, timer, Re-Send) | Live inspection via MCP browser |
| `login-ui-001-mobile-screen.png` | Mobile screen — UI/UX baseline | TC_LOGIN_UI_001 |
| `login-ui-002-otp-screen.png` | OTP screen — UI/UX baseline | TC_LOGIN_UI_002 |
| `login-ui-005-1920.png` | Mobile screen at 1920×900 | TC_LOGIN_UI_005 |
| `login-ui-006-1440.png` | Mobile screen at 1440×900 | TC_LOGIN_UI_006 |
| `otp-screen-e2e.png` | OTP screen — E2E baseline after Send OTP | TC_LOGIN_FUNC_002 |
| `post-login-customers-page.png` | Customers list — after successful login | TC_LOGIN_FUNC_001 |
| `dashboard-after-login.png` | Dashboard — E2E full flow | TC_LOGIN_E2E_001 |
| `wrong-otp-error.png` | OTP error state — wrong OTP submitted | TC_LOGIN_VAL_004 |
| `back-to-mobile-screen.png` | Mobile screen — after pressing Back on OTP screen | TC_LOGIN_FUNC_BACK |

---

## Key Structural Notes

- Login page heading: `h2` "Admin Login" (not h1)
- OTP heading: `h2` "ENTER OTP"
- Back button class: `button.reset-btn.back-to-mobile`
- Re-Send OTP: `button.common-link` (is a `<button>`, not `<a>`)
- OTP inputs: `input[aria-label="OTP Input 1"]` through `input[aria-label="OTP Input 6"]`
- Submit OTP button: `button.ant-btn-submit`
- API field: `phone` (not `mobile`) in send-otp and verify-otp payloads
- JWT returned in: `response.data.token` (wrapped envelope)
