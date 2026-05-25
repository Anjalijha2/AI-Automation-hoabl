# Test Cases — Login
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Login.md

---

## Login Page UI

### CP_LGN_001 — Verify Login page loads at `/login`

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Browser open; no active CP session |
| **Test Steps** | 1. Navigate to `https://uat.xrportal.in/login`<br>2. Wait for page to render<br>3. Observe page title and headings |
| **Expected Result** | Channel Partner login page loads with branding, mobile number input, and Send OTP button visible |
| **Priority** | Critical |

---

### CP_LGN_002 — Verify Mobile Number input field is visible and editable

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Locate the Mobile Number input field<br>2. Click into the field<br>3. Verify field accepts numeric input |
| **Expected Result** | Mobile Number input is visible, focusable, and accepts up to 10 digits |
| **Priority** | Critical |

---

### CP_LGN_003 — Verify "Send OTP" button is visible

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Observe button below the Mobile Number input<br>2. Verify button label reads exactly "Send OTP" |
| **Expected Result** | "Send OTP" button is rendered and enabled when a valid mobile number is entered |
| **Priority** | High |

---

### CP_LGN_004 — Verify country code selector for NRI numbers

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Locate the country code selector on Mobile Number field<br>2. Open the dropdown<br>3. Verify multiple country codes are listed |
| **Expected Result** | Country code dropdown lists India (+91) by default and supports international codes |
| **Priority** | Medium |

---

### CP_LGN_005 — Verify page branding shows Channel Partner / Growth Partner

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Observe page header/logo<br>2. Read on-screen labels and copy |
| **Expected Result** | Page identifies itself as the Channel Partner (Growth Partner) login |
| **Priority** | Medium |

---

## OTP Send Flow

### CP_LGN_006 — Send OTP with valid registered mobile number

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Mobile `8888888888` is registered as an active CP account |
| **Test Steps** | 1. Enter `8888888888` in Mobile Number field<br>2. Click Send OTP<br>3. Observe response |
| **Expected Result** | OTP is sent via SMS/WhatsApp; OTP input field becomes visible; success toast or message confirms OTP sent |
| **Priority** | Critical |

---

### CP_LGN_007 — Verify OTP input field appears after Send OTP

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Valid mobile entered |
| **Test Steps** | 1. Enter registered mobile number<br>2. Click Send OTP<br>3. Wait for screen transition |
| **Expected Result** | 6-digit OTP input field is rendered along with a Verify OTP button |
| **Priority** | Critical |

---

### CP_LGN_008 — Send OTP with mobile less than 10 digits

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Enter `12345` in Mobile Number field<br>2. Click Send OTP |
| **Expected Result** | Inline validation message appears (e.g., "Enter a valid 10-digit mobile number"); OTP is not sent |
| **Priority** | High |

---

### CP_LGN_009 — Send OTP with empty mobile field

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Leave Mobile Number field blank<br>2. Click Send OTP |
| **Expected Result** | "Send OTP" remains disabled OR error message "Mobile number is required" is displayed |
| **Priority** | High |

---

### CP_LGN_010 — Send OTP with unregistered mobile number

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Mobile `9000000000` is not registered as a CP |
| **Test Steps** | 1. Enter `9000000000`<br>2. Click Send OTP |
| **Expected Result** | Error message "Mobile number not registered" or equivalent is shown; OTP not sent |
| **Priority** | High |

---

### CP_LGN_011 — Send OTP with mobile containing letters or special chars

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Type `abcd!@#$56` in Mobile Number field<br>2. Observe field behavior |
| **Expected Result** | Field rejects non-numeric input; only digits are accepted |
| **Priority** | Medium |

---

### CP_LGN_012 — Resend OTP option appears after first send

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP has been sent once |
| **Test Steps** | 1. Send OTP for valid mobile<br>2. Wait for the resend timer to expire<br>3. Verify resend link/button availability |
| **Expected Result** | Resend OTP link or button becomes active after the cooldown timer ends |
| **Priority** | Medium |

---

## OTP Verification Flow

### CP_LGN_013 — Login with valid OTP `258369`

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | UAT static OTP credentials in use; OTP screen visible |
| **Test Steps** | 1. Enter `8888888888`, click Send OTP<br>2. Enter `258369` in OTP field<br>3. Click Verify OTP |
| **Expected Result** | OTP verified, JWT issued, CP is redirected to `/dashboard` |
| **Priority** | Critical |

---

### CP_LGN_014 — Verify Dashboard loads after successful login

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Successful OTP verification |
| **Test Steps** | 1. Complete OTP login flow<br>2. Wait for redirect |
| **Expected Result** | URL changes to `/dashboard`; the CP dashboard table loads showing CP's registered customers |
| **Priority** | Critical |

---

### CP_LGN_015 — Login with invalid OTP

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Enter `8888888888`, click Send OTP<br>2. Enter `000000` in OTP<br>3. Click Verify OTP |
| **Expected Result** | Error message "Invalid OTP" is displayed; user remains on OTP screen |
| **Priority** | Critical |

---

### CP_LGN_016 — Login with OTP shorter than 6 digits

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Enter `1234` in OTP field<br>2. Click Verify OTP |
| **Expected Result** | Verify OTP button remains disabled OR validation error "OTP must be 6 digits" is shown |
| **Priority** | High |

---

### CP_LGN_017 — Verify expired OTP error

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP sent and TTL has elapsed |
| **Test Steps** | 1. Send OTP<br>2. Wait beyond OTP expiry window<br>3. Enter the OTP and click Verify OTP |
| **Expected Result** | "OTP has expired. Please request a new one" error is displayed |
| **Priority** | High |

---

### CP_LGN_018 — Verify rate limiting after repeated wrong OTP attempts

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Submit incorrect OTP 5 times consecutively<br>2. Observe screen response |
| **Expected Result** | After threshold, account is temporarily locked / further attempts blocked with rate-limit message |
| **Priority** | High |

---

### CP_LGN_019 — Buyer-role mobile cannot login on CP login page

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | A mobile that is registered only as a Buyer (role 2) |
| **Test Steps** | 1. Enter buyer-only mobile<br>2. Click Send OTP |
| **Expected Result** | OTP send fails OR user is rejected post-OTP because role mismatch; CP portal is not accessible |
| **Priority** | High |

---

### CP_LGN_020 — SM-role mobile cannot login on CP login page

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | A mobile that is registered as Sales Manager (role 4/5) |
| **Test Steps** | 1. Enter SM-only mobile<br>2. Click Send OTP, enter received OTP, click Verify OTP |
| **Expected Result** | Login is rejected; access to CP portal is denied |
| **Priority** | High |

---

## Profile Completion Routing

### CP_LGN_021 — Incomplete profile redirects to RegisterCp screen

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP account exists with `isCpRegistrationCompleted = false` |
| **Test Steps** | 1. Login with the incomplete-profile CP mobile<br>2. Complete OTP verification |
| **Expected Result** | CP is redirected to the profile completion (RegisterCp) screen instead of `/dashboard` |
| **Priority** | High |

---

### CP_LGN_022 — Completing profile redirects to Dashboard

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP currently on the RegisterCp profile completion screen |
| **Test Steps** | 1. Fill all mandatory profile fields<br>2. Submit the profile form |
| **Expected Result** | Profile is saved (`isCpRegistrationCompleted = true`); CP is redirected to `/dashboard` |
| **Priority** | High |

---

## Session and Logout

### CP_LGN_023 — JWT session persists across page refresh

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP logged in successfully |
| **Test Steps** | 1. After landing on Dashboard, refresh the page (F5)<br>2. Observe whether the user remains logged in |
| **Expected Result** | Session persists; user remains on Dashboard without being asked to login again |
| **Priority** | High |

---

### CP_LGN_024 — Direct access to `/dashboard` while logged out redirects to `/login`

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Open browser without auth state<br>2. Navigate directly to `https://uat.xrportal.in/dashboard` |
| **Expected Result** | User is redirected to `/login` |
| **Priority** | Critical |

---

### CP_LGN_025 — Logout clears session and redirects to login

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP logged in |
| **Test Steps** | 1. Click profile/avatar in header<br>2. Click Logout |
| **Expected Result** | Session is cleared; user is redirected to `/login`; navigating back via browser does not restore protected screens |
| **Priority** | High |

---
