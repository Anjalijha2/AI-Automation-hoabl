# Visual Memory — CP Portal / Login

**Captured:** 2026-06-06 (UPDATED — login-undertaking-modal + login-incomplete-profile captured using fresh CP fixture 9999999991)
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
| `login-undertaking-modal.png` | "Undertaking" consent modal — overlay on `/` (no URL change) shown immediately after Submit OTP when backend returns `isConsented:false`. Antd modal with agreement text, single consent checkbox, "I Disagree" / "I Agree" buttons. "I Agree" is initially disabled until the checkbox is ticked. Captured 2026-06-06 with mobile 9999999991 | 2026-06-06 |
| `login-incomplete-profile.png` | "GROWTH PARTNER REGISTRATION" modal (RegisterCp component) — overlay on `/` (no URL change) shown immediately after consenting on the Undertaking modal when backend returns `isCpRegistrationCompleted:null`. Long KYC/profile form: mobile (pre-filled, read-only), email, owner name, org name, full address, business region, alternate mobile/email, office pin, PAN, RERA, plus 3 file upload slots (PAN Card / GST / MAHA RERA Certificate). Cancel + Submit. Captured 2026-06-06 with mobile 9999999991 | 2026-06-06 |

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

### Post-OTP Branching Logic (CAPTURED 2026-06-06 — source-confirmed)

Per `source-code/admin-sm-cp-portal/src/routes/Public/Login/index.jsx` (handleSubmit, lines 222–259), after `POST /api/v1/auth/cp/verify-otp` returns 200 the FE inspects the user object and renders ONE of three outcomes:

| Backend user state | UI outcome | Captured screen |
|--------------------|-----------|-----------------|
| `isConsented === true && isCpRegistrationCompleted === true` | `navigate('/dashboard')` | `login-success-dashboard.png` |
| `!isConsented` (false or null) | `setShowUndertaking(true)` — opens Undertaking modal | `login-undertaking-modal.png` |
| `isConsented === true && !isCpRegistrationCompleted` | `setShowRegisterationForm(true)` — opens RegisterCp modal | `login-incomplete-profile.png` |

URL stays at `/` throughout — both modals are antd overlays, NOT route changes.

Test fixture for the consent/incomplete flow:
```
Mobile: 9999999991   OTP: 147258
Backend response (verify-otp #1): { message: "Consent Pending",  user: { isConsented: false, isCpRegistrationCompleted: null, ... } }
Backend response (verify-otp #2, with isConsented=1): { message: "Registration Pending", user: { isConsented: true, isCpRegistrationCompleted: null, ... } }
```

### Undertaking Modal (CAPTURED 2026-06-06)
- **Trigger:** verify-otp returns `isConsented: false` (or `null`) for the mobile
- **URL when shown:** `https://uat-web.xrportal.in/` (no path change)
- **DOM root:** `.ant-modal.custom-modal-blur` (width 1000, centered, no close button, keyboard-disabled)
- **Heading:** `h4` "Undertaking"
- **Sub-heading:** `h6` "Please read this agreement carefully before you proceed"
- **Body:** scrollable agreement text starting "The Vendor: (i) acknowledges that House of Abhinandan Lodha Private Limited..." with inline "Read more" expander (`span` style color #50B95F, font-weight bold)
- **Single checkbox:** `input[type="checkbox"]` (unlabelled — antd Checkbox), to its right inline text "The Vendor: (i) acknowledges that..."
- **Buttons (footer):**
  - `button.btn-book-outline` "I Disagree" — always enabled, calls `handleConsent(false)` → shows "You must accept the undertaking to proceed" toast and resets to mobile-entry
  - `button.btn-book-solid` "I Agree" — `disabled` until checkbox is ticked; calls `handleConsent(true)` → re-issues verify-otp with `isConsented=1`

**Key selectors:**
```
modal       page.locator('.ant-modal-content', { hasText: /undertaking/i })
heading     getByRole('heading', { name: /^undertaking$/i, level: 4 })
checkbox    page.locator('.ant-modal-content input[type="checkbox"]').first()
            // OR page.locator('.ant-modal-content .ant-checkbox-input').first()
agree       page.locator('button.btn-book-solid', { hasText: /^i\s*agree$/i })
            // assertion before checkbox tick: await expect(agree).toBeDisabled()
disagree    page.locator('button.btn-book-outline', { hasText: /^i\s*disagree$/i })
readMore    page.getByText(/read more/i)   // toggles to "Read less"
```

### Incomplete Profile (RegisterCp) Modal (CAPTURED 2026-06-06)
- **Trigger:** verify-otp returns `isConsented: true && isCpRegistrationCompleted !== true`. Reached in the live flow only AFTER the Undertaking modal is consented through; reachable directly if backend already has `isConsented=1` but registration not yet submitted.
- **URL when shown:** `https://uat-web.xrportal.in/` (no path change)
- **DOM root:** `.ant-modal.custom-modal-common` (wide modal)
- **Heading:** `h4` "GROWTH PARTNER REGISTRATION" (visually upper-case, underlying DOM text same case)
- **Sections (visible labels on screen):** "Growth Partner Details", "Additional Details", "KYC Details"
- **Form fields (14 inputs total — names from React Formik `initialValues`):**

| name | type | placeholder | required (Yup) | notes |
|------|------|-------------|----------------|-------|
| `phone` | text | Enter Mobile Number | yes | Pre-filled from login, appears read-only/disabled in UI |
| `email` | text | Enter Email ID | yes | emailRegex validated |
| `ownerName` | text | Enter Name | yes | nameRegex `^[\p{L}][\p{L}\s.'-]*$` |
| `orgName` | text | Enter Name | yes | |
| `address` | text | Enter Full Address | yes | |
| Business Region | select (antd) | Select Business Region | yes | options from `BUSINESS_REGION_OPTIONS` constant |
| `phone2` | text | Enter Mobile Number | optional | phoneRegex if filled |
| `email2` | text | Enter Email ID | optional | emailRegex if filled |
| `officePincode` | text | Enter Pin Code | yes | |
| `panNumber` | text | Enter PAN Number | yes | |
| `reraNumber` | text | Enter RERA Number | optional | |
| `panDoc` | file (Upload) | — | optional | PDF / JPG / PNG, ≤ 2MB |
| `gstDoc` | file (Upload) | — | optional | PDF / JPG / PNG, ≤ 2MB |
| `reraDoc` | file (Upload) | — | optional | PDF / JPG / PNG, ≤ 2MB ("MAHA RERA Certificate") |

- **Buttons (footer):**
  - `button.btn-book-outline.custom-btn-width-footer` (text "Cancel") — calls `handleRegisterationCancel` → toast "You must register to proceed" + reset to mobile-entry
  - `button[type="submit"].btn-book-solid.custom-btn-width-footer` (text "Submit") — `expressPostFormData(apiUrls.cpRegister, values)`; on success stores token + user + `is_jbp_submitted` in localStorage, shows success animation (Lottie), then navigates to `/dashboard`

**Key selectors:**
```
modal       page.locator('.ant-modal-content', { hasText: /growth partner registration/i })
heading     getByRole('heading', { name: /growth partner registration/i, level: 4 })
mobile      page.locator('input[name="phone"]')          // pre-filled, expected non-editable
email       page.locator('input[name="email"]')
ownerName   page.locator('input[name="ownerName"]')
orgName     page.locator('input[name="orgName"]')
address     page.locator('input[name="address"]')
region      page.locator('.ant-modal-content .ant-select').first()   // antd Select trigger
phone2      page.locator('input[name="phone2"]')
email2      page.locator('input[name="email2"]')
pincode     page.locator('input[name="officePincode"]')
panNumber   page.locator('input[name="panNumber"]')
reraNumber  page.locator('input[name="reraNumber"]')
fileInputs  page.locator('.ant-modal-content input[type="file"][name="file"]')   // 3 inputs, in DOM order: PAN, GST, MAHA RERA
cancel      page.locator('.ant-modal-content button.btn-book-outline', { hasText: /^cancel$/i })
submit      page.locator('.ant-modal-content button[type="submit"]', { hasText: /^submit$/i })
```

**API endpoints in this flow:**
```
POST /api/v1/auth/cp/send-otp       — request OTP for mobile
POST /api/v1/auth/cp/verify-otp     — verify OTP; called twice in incomplete flow (without/with isConsented=1)
POST <apiUrls.cpRegister>           — submit registration form (multipart/form-data)
```

**TC notes for incomplete-profile flow:**
- TCs targeting "incomplete profile redirect" must use mobile `9999999991` + OTP `147258`. Mobile `8888888888` lands directly on `/dashboard` and cannot reach these modals.
- The fixture is in a stateful UAT account — after a successful Submit on the RegisterCp form, the account flips to `isCpRegistrationCompleted=true` and the fixture is no longer reusable for this state. Tests MUST either: (a) only navigate through the modals without submitting, or (b) the QA team must re-provision the account between full E2E runs.
- The "I Agree" button on the Undertaking modal is initially disabled — a TC asserting this must check `toBeDisabled()` BEFORE checking the consent checkbox.
- Do NOT store this account's session to `automation-repository/fixtures/.auth/channel-partner.json`. The reserved filename for it (if ever needed) is `automation-repository/fixtures/.auth/channel-partner-incomplete.json`.
