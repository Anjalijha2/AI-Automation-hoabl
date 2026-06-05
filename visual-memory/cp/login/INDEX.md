# Visual Memory — CP Portal / Login

**Captured:** 2026-06-05 (UPDATED — login-otp-resend-enabled captured after live 59s countdown wait)
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
| `login-otp-resend-enabled.png` | OTP entry screen after the 55–60s countdown has expired — "Re-Send OTP" button is no longer disabled (rendered in active green link style, `disabled=false`). Captured by waiting ~59s after Send OTP click | 2026-06-05 |
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
button    getByRole('button',  { name: /re-send otp/i })   — disabled while countdown active
```

### Re-Send OTP — Enabled State (post-countdown, CAPTURED 2026-06-05)
```
Initial countdown observed: 58s (label varies 55–60s across loads)
Countdown decrements 1s per tick; when it reaches 0 the timer label disappears
Re-Send OTP button transitions from disabled → enabled at ~59s after Send OTP click
DOM (captured live):
  <button type="button" class="common-link"
          style="color: rgb(80, 185, 95); font-weight: 600;">
    Re-Send OTP
  </button>
  disabled = false   (no `disabled` attribute, no aria-disabled)
```

**Key selectors (enabled state):**
```
button   getByRole('button', { name: /re-send otp/i })
         await expect(button).toBeEnabled()
css      button.common-link   — class shared with other inline link-style buttons
style    inline color rgb(80, 185, 95) (green) — used to signal active state
```

**TC notes:**
- TC for Re-Send OTP enabled state must wait ≥60s after Send OTP click before asserting `toBeEnabled()`.
- The visible "55s" / "58s" countdown timer is replaced by no text (no `Ns` label) once expired — selector `:text(/\d+s/)` should resolve to 0 matches at enabled state.
- Polling pattern in capture script: poll button `isDisabled()` at 2s intervals; became enabled at the 59s mark consistently.

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

### Incomplete Profile State — NOT CAPTURED (gap documented 2026-06-05)
```
Screen target: login-incomplete-profile.png
Status:        SKIPPED — requires a CP test account whose registration is incomplete

Probe results (unauthenticated GET):
  /register-cp         → 200, finalUrl /login   (redirect)
  /register            → 200, finalUrl /login   (redirect)
  /cp-registration     → 200, finalUrl /login   (redirect)
  /profile-completion  → 200, finalUrl /login   (redirect)
  All register-* paths redirect to /login when unauthenticated — confirming the
  incomplete-profile screen is post-auth gated.

Blocker: The single shared UAT CP test mobile 8888888888 already has a completed
  CP profile (logs into /dashboard directly). A second test mobile whose CP
  registration has been started but not submitted is needed to reach the
  RegisterCp / profile-completion screen.

Action required: Provision a second UAT CP test account in an incomplete state, OR
  obtain DB access to reset is_jbp_submitted / profile-complete flags on a sandbox
  account, then re-run capture.

Diagnostic artefact: _login-incomplete-profile-diagnostic.png (login screen rendered
  after redirect — proves the redirect-to-login behaviour).
```
