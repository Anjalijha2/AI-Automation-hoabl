# Test Cases — SM Portal Login
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Login.md / SM-BRD-SM-Portal.md

---

## Page Load & UI Rendering

### SM_LGN_001 — Login page loads at /sales-manager URL

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | User has internet access; no active SM session in browser |
| **Test Steps** | 1. Open browser<br>2. Navigate to https://uat-web.xrportal.in/sales-manager<br>3. Wait for page to fully render |
| **Expected Result** | SM Portal login page loads with mobile input, Send OTP button, and brand logo visible |
| **Priority** | Critical |

---

### SM_LGN_002 — All login UI elements render per FS 1.4

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On /sales-manager login page |
| **Test Steps** | 1. Inspect the page<br>2. Verify mobile input field is visible<br>3. Verify Send OTP button is visible<br>4. Verify error area exists (hidden by default) |
| **Expected Result** | All elements per FS 1.4 rendered: mobile input, Send OTP button, error area placeholder |
| **Priority** | High |

---

## Mobile Number Validation

### SM_LGN_003 — Send OTP blocked when mobile field is empty

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On login page; mobile field blank |
| **Test Steps** | 1. Leave mobile input empty<br>2. Click Send OTP |
| **Expected Result** | Send OTP button disabled OR validation error "Enter mobile number" displayed; no OTP request fired |
| **Priority** | High |

---

### SM_LGN_004 — Reject mobile number shorter than 10 digits

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On login page |
| **Test Steps** | 1. Enter 9-digit number 888888888<br>2. Click Send OTP |
| **Expected Result** | Validation error "Enter a valid 10-digit mobile number" shown; OTP not sent |
| **Priority** | High |

---

### SM_LGN_005 — Reject non-numeric characters in mobile input

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On login page |
| **Test Steps** | 1. Try typing alphabetic chars in mobile input<br>2. Try special chars like @#$<br>3. Try pasting "abcdefghij" |
| **Expected Result** | Input accepts digits only; alpha/special characters blocked or stripped on entry |
| **Priority** | Medium |

---

## OTP Send & Verification

### SM_LGN_006 — Send OTP succeeds for registered SM mobile

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | Active SM account exists with mobile 8888888888 |
| **Test Steps** | 1. Enter mobile 8888888888<br>2. Click Send OTP<br>3. Wait for API response |
| **Expected Result** | OTP input field appears; success toast/message "OTP sent via SMS/WhatsApp" displayed per FS 1.6.1 |
| **Priority** | Critical |

---

### SM_LGN_007 — Successful login redirects to /sales-manager/callback-requests

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | UAT credentials mobile 8888888888 / OTP 258369; account active |
| **Test Steps** | 1. Enter mobile 8888888888<br>2. Click Send OTP<br>3. Enter OTP 258369<br>4. Click Verify OTP |
| **Expected Result** | Login succeeds; JWT issued; user redirected to /sales-manager/callback-requests landing page per BR 1.5.6 |
| **Priority** | Critical |

---

### SM_LGN_008 — Reject login for inactive SM account

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | SM account exists with isActive = false |
| **Test Steps** | 1. Enter inactive SM's mobile<br>2. Click Send OTP<br>3. Enter correct OTP<br>4. Click Verify OTP |
| **Expected Result** | Login rejected with error "Account is not active. Contact admin." per BR 1.5.4; user remains on login page |
| **Priority** | Critical |

---
