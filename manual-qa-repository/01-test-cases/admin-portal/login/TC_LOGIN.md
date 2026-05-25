# Test Cases — Login
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Login.md

---

## Login Page Rendering

### ADM_LGN_001 — Verify login page loads at /admin URL

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Browser open; no active admin session |
| **Test Steps** | 1. Navigate to https://uat-web.xrportal.in/admin<br>2. Wait for page to fully load |
| **Expected Result** | Login page renders within 5 seconds with HoABL logo, side banner image, "Admin Login" heading, mobile input field, and Send OTP button |
| **Priority** | Critical |

---

### ADM_LGN_002 — Verify all static elements on Step 1 mobile screen

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Observe all visible elements on the page |
| **Expected Result** | Page displays HoABL logo, side banner, "Admin Login" heading, "+91" prefix, mobile input with placeholder "Enter Mobile Number", Terms link, Privacy link, Send OTP button, copyright footer |
| **Priority** | High |

---

### ADM_LGN_003 — Verify mobile field placeholder text

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Locate mobile number input field<br>2. Observe placeholder text |
| **Expected Result** | Field shows placeholder "Enter Mobile Number" with "+91" prefix to its left |
| **Priority** | Medium |

---

### ADM_LGN_004 — Verify Terms & Conditions link is clickable

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click "Terms & Conditions" link |
| **Expected Result** | Terms of Service page or modal opens |
| **Priority** | Medium |

---

### ADM_LGN_005 — Verify Privacy Policy link is clickable

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click "Privacy Policy" link |
| **Expected Result** | Privacy Policy page or modal opens |
| **Priority** | Medium |

---

### ADM_LGN_006 — Verify copyright footer text

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Scroll to footer<br>2. Read footer text |
| **Expected Result** | Footer reads "Copyright 2026 Growwithhoabl All Rights Reserved" |
| **Priority** | Medium |

---

### ADM_LGN_007 — Verify Send OTP button visible and enabled

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Locate Send OTP button<br>2. Verify state |
| **Expected Result** | Send OTP button is visible, enabled, labelled "Send OTP" |
| **Priority** | High |

---

### ADM_LGN_008 — Verify direct URL is only route to login

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Access /admin without session<br>2. Try /admin/customers directly |
| **Expected Result** | Both routes resolve to login page |
| **Priority** | High |

---

## OTP Send Flow

### ADM_LGN_009 — Send OTP with valid 10-digit admin mobile

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | UAT admin mobile 8888888888 registered |
| **Test Steps** | 1. Enter "8888888888" in Mobile Number field<br>2. Click Send OTP<br>3. Observe next screen |
| **Expected Result** | Page transitions to Step 2 OTP entry screen with six OTP boxes and countdown timer |
| **Priority** | Critical |

---

### ADM_LGN_010 — Verify OTP entry screen layout

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Send OTP clicked for 8888888888 |
| **Test Steps** | 1. Observe all elements on OTP entry screen |
| **Expected Result** | Shows back arrow, "ENTER OTP" heading, sub-text "Enter the OTP sent to your phone number", 6 single-digit boxes, countdown timer, Re-Send OTP (disabled), Submit OTP button |
| **Priority** | High |

---

### ADM_LGN_011 — Mobile field rejects letters

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click mobile field<br>2. Type "abcdefghij" |
| **Expected Result** | No letters appear; keystrokes blocked at input level |
| **Priority** | High |

---

### ADM_LGN_012 — Mobile field rejects special characters

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click mobile field<br>2. Type "!@#$%^&*()" |
| **Expected Result** | No special characters appear; keystrokes blocked |
| **Priority** | High |

---

### ADM_LGN_013 — Mobile field accepts only digits

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Type "1234567890" in mobile field |
| **Expected Result** | All 10 digits appear in field |
| **Priority** | High |

---

### ADM_LGN_014 — Send OTP with empty mobile field

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded; field empty |
| **Test Steps** | 1. Click Send OTP without entering anything |
| **Expected Result** | Nothing happens; page remains on Step 1 |
| **Priority** | High |

---

### ADM_LGN_015 — Send OTP with 5-digit short number

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter "12345"<br>2. Click Send OTP |
| **Expected Result** | OTP not sent; page does not transition to OTP screen |
| **Priority** | High |

---

### ADM_LGN_016 — Send OTP with all zeros mobile

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter "0000000000"<br>2. Click Send OTP |
| **Expected Result** | OTP rejected; stays on mobile entry screen |
| **Priority** | High |

---

### ADM_LGN_017 — Verify mobile field max length 10 digits

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try to enter "12345678901234567890" |
| **Expected Result** | Only first 10 digits accepted; rest blocked |
| **Priority** | Medium |

---

## OTP Verification Flow

### ADM_LGN_018 — Submit valid OTP 258369 logs in successfully

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown after Send OTP for 8888888888 |
| **Test Steps** | 1. Type "2" in OTP Box 1<br>2. Type "5" in Box 2<br>3. Type "8" in Box 3<br>4. Type "3" in Box 4<br>5. Type "6" in Box 5<br>6. Type "9" in Box 6<br>7. Click Submit OTP |
| **Expected Result** | User redirected to /admin/customers within 5 seconds |
| **Priority** | Critical |

---

### ADM_LGN_019 — OTP boxes auto-advance focus on digit entry

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Click Box 1<br>2. Type each digit of "258369" sequentially |
| **Expected Result** | After each digit, focus auto-advances to next box; cursor ends in Box 6 |
| **Priority** | High |

---

### ADM_LGN_020 — Each OTP box accepts only single digit

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Click Box 1<br>2. Try typing "25" |
| **Expected Result** | "2" stays in Box 1; "5" auto-advances to Box 2 |
| **Priority** | Medium |

---

### ADM_LGN_021 — Submit wrong 6-digit OTP

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Enter "123456"<br>2. Click Submit OTP |
| **Expected Result** | Error message shown; user remains on OTP screen; not redirected |
| **Priority** | Critical |

---

### ADM_LGN_022 — Submit OTP with empty boxes

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown; all boxes empty |
| **Test Steps** | 1. Click Submit OTP without entering anything |
| **Expected Result** | Login not attempted; user stays on OTP screen |
| **Priority** | High |

---

### ADM_LGN_023 — Submit partial OTP (3 digits)

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Enter "123" in boxes 1-3 only<br>2. Click Submit OTP |
| **Expected Result** | Login rejected; stays on OTP screen |
| **Priority** | High |

---

### ADM_LGN_024 — Submit all-zeros OTP

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Enter "000000"<br>2. Click Submit OTP |
| **Expected Result** | Login rejected; error shown |
| **Priority** | High |

---

### ADM_LGN_025 — Multiple wrong OTP attempts no lockout

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Submit "111111"<br>2. Submit "222222"<br>3. Submit "333333"<br>4. Submit "258369" |
| **Expected Result** | First 3 attempts rejected with error but no lockout; 4th attempt with correct OTP succeeds |
| **Priority** | High |

---

### ADM_LGN_026 — OTP countdown timer counts down

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen just shown |
| **Test Steps** | 1. Observe timer<br>2. Wait 5 seconds<br>3. Observe again |
| **Expected Result** | Timer decrements every second (e.g. "60s" → "55s") |
| **Priority** | Medium |

---

### ADM_LGN_027 — Re-Send OTP disabled during active timer

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown; timer counting |
| **Test Steps** | 1. Try to click Re-Send OTP while timer active |
| **Expected Result** | Re-Send OTP is disabled/grayed; clicking does nothing |
| **Priority** | High |

---

### ADM_LGN_028 — Re-Send OTP enabled after timer expires

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Wait for timer to reach 0s<br>2. Observe Re-Send OTP link |
| **Expected Result** | Re-Send OTP becomes enabled/clickable |
| **Priority** | High |

---

### ADM_LGN_029 — Click Re-Send OTP after timer expires

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Timer expired; Re-Send OTP enabled |
| **Test Steps** | 1. Click Re-Send OTP |
| **Expected Result** | New OTP requested; timer restarts at 60s; Re-Send OTP disabled again |
| **Priority** | High |

---

### ADM_LGN_030 — Back button returns to mobile screen

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Click back arrow at top of OTP screen |
| **Expected Result** | Returns to Step 1 mobile entry screen |
| **Priority** | High |

---

### ADM_LGN_031 — Successful login redirects to /admin/customers

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Valid mobile and OTP submitted |
| **Test Steps** | 1. Complete login with 8888888888 / 258369<br>2. Observe URL after redirect |
| **Expected Result** | URL becomes /admin/customers; Customers page renders |
| **Priority** | Critical |

---

## Session Management

### ADM_LGN_032 — Session persists across page refresh

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Login successfully<br>2. Press F5 to refresh |
| **Expected Result** | User remains logged in; page reloads without redirect to login |
| **Priority** | Critical |

---

### ADM_LGN_033 — Session persists across new browser tab

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Open new tab in same browser<br>2. Navigate to /admin/customers |
| **Expected Result** | New tab loads page directly without login prompt |
| **Priority** | High |

---

### ADM_LGN_034 — Session lasts up to 1 day

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in; JWT issued |
| **Test Steps** | 1. Note login time<br>2. Wait 23 hours<br>3. Access protected route |
| **Expected Result** | Session still valid within 24h window |
| **Priority** | Medium |

---

### ADM_LGN_035 — Expired session redirects to login

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Session token expired |
| **Test Steps** | 1. Clear admin.json storage<br>2. Try to access /admin/customers |
| **Expected Result** | Redirected to /admin login page |
| **Priority** | High |

---

### ADM_LGN_036 — Protected route without login redirects to /admin

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Open incognito<br>2. Navigate to /admin/towers |
| **Expected Result** | Redirected to /admin login page |
| **Priority** | Critical |

---

## Security & Negative Cases

### ADM_LGN_037 — SQL injection in mobile field is blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try entering "' OR 1=1 --" in mobile field<br>2. Click Send OTP |
| **Expected Result** | Input blocked at field level (numeric only); no DB error |
| **Priority** | Critical |

---

### ADM_LGN_038 — XSS injection in mobile field is blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try entering "<script>alert('xss')</script>" in mobile field |
| **Expected Result** | Script tags blocked; no JS alert fires |
| **Priority** | Critical |

---

### ADM_LGN_039 — Unregistered mobile number rejected at OTP verify

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter unregistered "9999999999"<br>2. Click Send OTP<br>3. Enter "258369"<br>4. Click Submit OTP |
| **Expected Result** | OTP verification fails; user not logged in |
| **Priority** | High |

---

### ADM_LGN_040 — Login page responsive on mobile viewport

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Browser at 375x667 viewport |
| **Test Steps** | 1. Resize to mobile viewport<br>2. Load /admin |
| **Expected Result** | All elements visible and tappable; no overflow |
| **Priority** | Medium |

---
