# Visual Memory — Buyer Portal / Registration & Login

**Captured:** 2026-06-03; re-verified 2026-06-06 via `scripts/capture-buyer-portal-all.js` (heading still `h2: "APPLICANT LOGIN"`, Send OTP button live)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `registration-login-loaded.png` | Login page — initial unauthenticated load | 2026-06-03 |
| `login-page.png` | Login page — explicit `/` navigate | 2026-06-03 |
| `register-page.png` | `/register` route — redirects to same login page | 2026-06-03 |
| `registration-login-full.png` | Full-page final screenshot | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **Login URL:** `https://uat.xrportal.in/`
- **Register URL:** `https://uat.xrportal.in/register` → redirects to `/` (no separate registration page exists)
- Auth method: Mobile OTP, no password. UAT: Mobile `8888888888` / OTP `147258`

### Page Heading
```
h2: "APPLICANT LOGIN"
subtext: "Select nationality & verify to continue"
```

### Nationality Tabs
```
[role="tab"]  "Indian National"   — selected by default
[role="tab"]  "NRI"
```
Note: Ant Design renders tabs twice in DOM — 4 entries for 2 tabs is expected.

### Mobile Input
```
input[placeholder="Enter Mobile Number"]
Country code prefix "+91" — non-editable phone group prefix
```

### Send OTP Button
```
button.ant-btn   filter({ hasText: /send otp/i })
text: "Send OTP"
```

### OTP Input (appears after clicking Send OTP)
```
input[type="text"][maxlength="1"]    — 6 individual single-digit boxes
input[autocomplete="one-time-code"]  — alternative selector
```

### Verify Button (appears after OTP entry)
```
button   filter({ hasText: /verify/i })
```

### Carousel Controls
```
.carousel-arrow.carousel-arrow-prev   — "‹" previous slide
.carousel-arrow.carousel-arrow-next   — "›" next slide
```

### Legal Text
```
"By verifying, you accept the Terms & Conditions and Privacy Policy."
```

### Footer
```
"Copyright © 2026 House of Abhinandan Lodha. All Rights Reserved."
```

### Auth Storage (technical note for automation)
- JWT stored in **sessionStorage** key: `xr_auth_token`
- User data stored in **sessionStorage** key: `xr_user` (JSON: name, firstName, lastName, role, phone, email, etc.)
- Playwright `storageState` does NOT capture sessionStorage — use login flow per test or inject via `page.addInitScript`
- `localStorage["forceLogout"]` is set to a future timestamp on every page load — normal app behaviour, not blocking auth

### Post-login Redirect
- Successful login → `https://uat.xrportal.in/home`
- Failed / wrong OTP → stays on `https://uat.xrportal.in/`
