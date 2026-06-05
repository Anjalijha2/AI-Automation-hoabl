# Visual Memory — CP Portal / Login

**Captured:** 2026-06-05 (UPDATED — login-success-dashboard captured via fresh OTP `147258`)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | CP Login page — "GROWTH PARTNER LOGIN" unauthenticated state | 2026-06-03 |
| `login-initial.png` | Same login page — fresh load, mobile input empty | 2026-06-05 |
| `login-otp-entry.png` | OTP entry screen — appears after entering 8888888888 and clicking Send OTP. 6 OTP input boxes, 60s countdown timer, Re-Send OTP (disabled), Submit OTP button | 2026-06-05 |
| `login-otp-invalid.png` | OTP entry screen with 6 zeros filled — captured after failed Submit OTP (returned 401). Toast notification dismisses too fast for capture | 2026-06-05 |
| `login-success-dashboard.png` | Authenticated landing page at `/dashboard` — immediately after successful OTP submission. Shows full Home Dashboard with stats cards, referral widget, Create New Lead, Customers table | 2026-06-05 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/` (redirects to `/login` when unauthenticated)
- Authenticated → `/dashboard`

### Page Heading (Login)
```
heading[level=2]: "Growth Partner Login"   (was "GROWTH PARTNER LOGIN" — display style only; underlying text is title case)
```

### Marketing Banner (left side)
```
img[alt="Banner"]   — large brand banner image
img[alt="Logo"]     — HoABL logo top-left
```

### Login Form (Mobile Entry State)
```
label: "Mobile Number*"
text:  "+91"
input[role="textbox"][name="Enter Mobile Number"]   — placeholder="Enter Mobile Number"
paragraph: "By verifying, you accept the Terms & Conditions and Privacy Policy."
  link[name="Terms & Conditions"]   href="/login"  (UI bug — points to /login not actual T&C)
  link[name="Privacy Policy"]       href="https://growwithhoabl.com/privacy-policy"
button[name="Send OTP"]   green, full-width
```

**Key selectors:**
```
heading   getByRole('heading', { name: /growth partner login/i, level: 2 })
input     getByRole('textbox', { name: /enter mobile number/i })
button    getByRole('button',  { name: /send otp/i })
```

### OTP Entry State (post-Send OTP)
```
button[back-icon]   — top-left back arrow returns to mobile entry
heading[level=2]: "ENTER OTP"
paragraph: "Enter the OTP sent to your phone number"
label: "Enter OTP*"
group[role="group"]:
  6 × input[role="textbox"][name="OTP Input 1..6"]   — single digit each, auto-advance
text: "55s"   — countdown timer with timer icon
button[name="Re-Send OTP"]   — disabled until timer expires
paragraph: same T&C/Privacy text
button[name="Submit OTP"]   green
```

**Key selectors:**
```
heading   getByRole('heading', { name: /^enter otp$/i, level: 2 })
group     getByRole('group')   — wraps 6 OTP inputs
otpInput  getByRole('textbox', { name: /otp input [1-6]/i })
button    getByRole('button',  { name: /submit otp/i })
button    getByRole('button',  { name: /re-send otp/i })   — disabled state
```

### Invalid OTP Behaviour
```
API: POST /api/v1/auth/cp/verify-otp → 401 Unauthorized
UI:  Transient toast notification (Toastify-based, .Toastify container) shown briefly then auto-dismissed
     Form state: returns user to mobile-entry screen OR keeps OTP screen with values intact (timing-dependent)
Console errors: "AxiosError: Request failed with status code 401" logged
```

### Login Success Redirect (CAPTURED 2026-06-05)
```
On successful Submit OTP → server returns 200 with JWT + user/permission JSON
Frontend stores: localStorage AUTH_TOKEN, user, permission_check, persist:xanadu_0.0.1, is_jbp_submitted
Redirect: /login → /dashboard
Landing UI: full Home Dashboard (see customer-registration/INDEX.md for full structural notes)
```

### Footer
```
paragraph: "Copyright © 2026 House of Abhinandan Lodha. All Rights Reserved."
```

### Auth Mechanism (confirmed via storageState inspection)
- CP portal stores auth in **localStorage**:
  - `AUTH_TOKEN`   — JWT bearer token (sent via Authorization header)
  - `user`         — full CP profile JSON
  - `permission_check` — permission matrix `{moduleId: [permission ids]}`
  - `persist:xanadu_0.0.1` — Redux-Persist serialized state (auth, dashboard slices)
  - `is_jbp_submitted` — boolean flag
- JWT payload: `{id: <numericCpId>, iat: <unix>, exp: <unix>}` — 24h validity (86400s)
- Playwright `storageState()` captures localStorage successfully — sessions persist across tests as long as token unexpired

### Test Credentials (as of 2026-06-05 — confirmed working)
```
Mobile: 8888888888
OTP:    147258   (CP portal — confirmed in CLAUDE.md table)
Note:   Previous attempts used 258369 which is for Admin/SM portals — CP OTP is portal-specific.
        With OTP 147258, fresh storageState was generated and login-success-dashboard captured successfully.
```
