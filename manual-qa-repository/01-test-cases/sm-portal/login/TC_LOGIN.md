# Test Cases — SM Portal Login
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Login.md / SM-BRD-SM-Portal.md
**FSD Reference:** `manual-qa-repository/03-user-manual/sm-portal/fsd-login.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- SM portal has TWO backend roles: **SM Admin = roleId 4**, **SM = roleId 5**.
- Both share the same login endpoints; `req.body.role` differentiates them (trusted by middleware, validated by Yup `oneOf`).
- An SM-Admin user can log in via the "SM" tab and vice-versa if registered to that role — there is no cross-blocking at auth.
- Post-login route enforcement: `/api/v1/sales-manager/admin/*` is gated by `restrictTo('sales_manager_admin')`. Other SM routes allow both roles.
- Same OTP provider (Epinet, not Kaleyra), same Math.random() OTP, same `ADMIN_MASTER_OTP` master OTP, same lack of rate limit / cooldown as Admin.
- Inactive (`isActive=false`) accounts get `400 'Your access to the portal has been revoked'` at send-OTP.

---

## Page Load & UI Rendering

### SM_LGN_001 — Login page loads at /sales-manager URL

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | User has internet access; no active SM session in browser |
| **Type** | UI |
| **Test Steps** | 1. Open browser<br>2. Navigate to https://uat-web.xrportal.in/sales-manager<br>3. Wait for page to fully render |
| **Expected Result** | SM Portal login page loads with mobile input, Send OTP button, and brand logo visible |
| **Priority** | Critical |

---

### SM_LGN_002 — All login UI elements render per FS 1.4

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On /sales-manager login page |
| **Type** | UI |
| **Test Steps** | 1. Inspect the page<br>2. Verify mobile input field is visible<br>3. Verify Send OTP button is visible<br>4. Verify error area exists (hidden by default) |
| **Expected Result** | All elements per FS 1.4 rendered: mobile input, Send OTP button, error area placeholder |
| **Priority** | High |

---

### SM_LGN_012 — Mobile input has 10-digit maxlength attribute

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 / FS 1.5.1 |
| **Pre-conditions** | On /sales-manager login page |
| **Type** | VAL |
| **Test Steps** | 1. Inspect the mobile input element in DOM<br>2. Verify the `maxlength` attribute<br>3. Try typing 12 digits |
| **Expected Result** | Input has `maxlength=10`; only the first 10 digits are accepted; further keystrokes are ignored |
| **Priority** | High |

---

### SM_LGN_013 — Send OTP button is disabled by default when mobile field is empty

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | Fresh load of /sales-manager login page |
| **Type** | UI |
| **Test Steps** | 1. Open the login page<br>2. Do NOT enter anything in the mobile field<br>3. Inspect the Send OTP button state |
| **Expected Result** | Send OTP button rendered in disabled state on initial load until a valid 10-digit mobile is entered |
| **Priority** | Medium |

---

### SM_LGN_014 — Brand logo and portal title render above the form

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | On login page |
| **Type** | UI |
| **Test Steps** | 1. Inspect the header area<br>2. Verify the HoABL/XR portal logo is visible<br>3. Verify a portal title or "Sales Manager" identifier is visible |
| **Expected Result** | Brand logo image renders without 404; portal identifier text "Sales Manager" or similar is visible above the form |
| **Priority** | Medium |

---

### SM_LGN_015 — Login page renders correctly on mobile viewport (responsive)

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | Browser DevTools open; viewport set to 375x667 (iPhone SE) |
| **Type** | UI |
| **Test Steps** | 1. Open /sales-manager at the mobile viewport<br>2. Verify mobile input, Send OTP button, brand logo all visible without horizontal scroll<br>3. Verify the form is centred and touch targets are tappable |
| **Expected Result** | All login elements render within viewport; no overflow; Send OTP button has minimum 44px touch height |
| **Priority** | High |

---

### SM_LGN_016 — Navigating to a protected SM route while unauthenticated redirects to /sales-manager login

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5 / FS 1.5.6 |
| **Pre-conditions** | No SM session in browser (localStorage cleared) |
| **Type** | NEG |
| **Test Steps** | 1. Open browser without an SM JWT<br>2. Navigate to /sales-manager/callback-requests directly<br>3. Observe redirect behaviour |
| **Expected Result** | User is redirected to /sales-manager login page; original target URL is not loaded; no protected data is exposed |
| **Priority** | Critical |

---

### SM_LGN_017 — Loading indicator visible while Send OTP request is in flight

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.6.1 |
| **Pre-conditions** | Valid mobile entered; ready to click Send OTP |
| **Type** | UI |
| **Test Steps** | 1. Enter mobile 8888888888<br>2. Click Send OTP<br>3. Observe the button/page during the API call |
| **Expected Result** | Send OTP button shows a spinner or disabled state while the request is in flight; user cannot click again to fire a duplicate request |
| **Priority** | High |

---

## Mobile Number Validation

### SM_LGN_003 — Send OTP blocked when mobile field is empty

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On login page; mobile field blank |
| **Type** | VAL |
| **Test Steps** | 1. Leave mobile input empty<br>2. Click Send OTP |
| **Expected Result** | Send OTP button disabled OR validation error "Enter mobile number" displayed; no OTP request fired |
| **Priority** | High |

---

### SM_LGN_004 — Reject mobile number shorter than 10 digits

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On login page |
| **Type** | VAL |
| **Test Steps** | 1. Enter 9-digit number 888888888<br>2. Click Send OTP |
| **Expected Result** | Validation error "Enter a valid 10-digit mobile number" shown; OTP not sent |
| **Priority** | High |

---

### SM_LGN_005 — Reject non-numeric characters in mobile input

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | On login page |
| **Type** | VAL |
| **Test Steps** | 1. Try typing alphabetic chars in mobile input<br>2. Try special chars like @#$<br>3. Try pasting "abcdefghij" |
| **Expected Result** | Input accepts digits only; alpha/special characters blocked or stripped on entry |
| **Priority** | Medium |

---

### SM_LGN_018 — Reject mobile number longer than 10 digits

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5.1 |
| **Pre-conditions** | On login page |
| **Type** | VAL |
| **Test Steps** | 1. Try typing 11+ digits e.g. 88888888888<br>2. Inspect the value in the field |
| **Expected Result** | Field truncates to first 10 digits OR validation error "Enter a valid 10-digit mobile number" appears on Send OTP click; OTP request is not fired |
| **Priority** | High |

---

### SM_LGN_019 — Reject mobile number not starting with 6-9 (Indian mobile format)

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5.1 |
| **Pre-conditions** | On login page |
| **Type** | VAL |
| **Test Steps** | 1. Enter mobile 5000000000 (starts with 5)<br>2. Click Send OTP<br>3. Repeat for 1234567890 (starts with 1) |
| **Expected Result** | Validation error indicating invalid Indian mobile format; OTP request not fired (Indian mobiles must start with 6-9) |
| **Priority** | High |

---

### SM_LGN_020 — Reject unregistered mobile number at Send OTP

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.2 / FS 1.5.1 |
| **Pre-conditions** | Mobile 7000000099 is NOT registered as an SM in any role |
| **Type** | NEG |
| **Test Steps** | 1. Enter mobile 7000000099<br>2. Click Send OTP<br>3. Wait for API response |
| **Expected Result** | Backend returns 400 "User not found"; OTP input screen does NOT advance; error displayed in error area |
| **Priority** | Critical |

---

### SM_LGN_021 — Leading zeros and spaces stripped from mobile input

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5.1 |
| **Pre-conditions** | On login page |
| **Type** | VAL |
| **Test Steps** | 1. Paste "  8888888888  " (with surrounding spaces) into mobile field<br>2. Try entering "08888888888" (with a leading zero)<br>3. Click Send OTP |
| **Expected Result** | Field trims whitespace and rejects leading zero; only the canonical 10-digit number is submitted to the API |
| **Priority** | Medium |

---

### SM_LGN_022 — Mobile field rejects emoji and unicode characters

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5.1 |
| **Pre-conditions** | On login page |
| **Type** | VAL |
| **Test Steps** | 1. Try pasting an emoji into mobile field e.g. 📱<br>2. Try pasting unicode digits e.g. arabic-indic ٨٨٨٨٨٨٨٨٨٨<br>3. Click Send OTP |
| **Expected Result** | Field rejects emoji and non-ASCII unicode digits; only ASCII 0-9 accepted; no malformed payload reaches the backend |
| **Priority** | Medium |

---

## OTP Send & Verification

### SM_LGN_006 — Send OTP succeeds for registered SM mobile

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | Active SM account exists with mobile 8888888888 |
| **Type** | FUNC |
| **Test Steps** | 1. Enter mobile 8888888888<br>2. Click Send OTP<br>3. Wait for API response |
| **Expected Result** | OTP input field appears; success toast/message "OTP sent via SMS/WhatsApp" displayed per FS 1.6.1 |
| **Priority** | Critical |

---

### SM_LGN_007 — Successful login redirects to /sales-manager/callback-requests

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **Pre-conditions** | UAT credentials mobile 8888888888 / OTP 258369; account active |
| **Type** | FUNC |
| **Test Steps** | 1. Enter mobile 8888888888<br>2. Click Send OTP<br>3. Enter OTP 258369<br>4. Click Verify OTP |
| **Expected Result** | Login succeeds; JWT issued; user redirected to /sales-manager/callback-requests landing page per BR 1.5.6 |
| **Priority** | Critical |

---

### SM_LGN_008 — [FSD-CORRECTION] Reject login for inactive SM at SEND-OTP step

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FSD §3.1.b / `auth.controller.js:517-519` |
| **Pre-conditions** | SM account exists with isActive = false |
| **Type** | NEG |
| **Test Steps** | 1. Enter inactive SM's mobile<br>2. Click Send OTP |
| **Expected Result** | Backend returns 400 `"Your access to the portal has been revoked"` at send-OTP. OTP screen does NOT load. (Previous BRD assumed rejection at verify-step — incorrect.) |
| **Priority** | Critical |

---

### SM_LGN_023 — Incorrect OTP rejected with error message

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 / FS 1.5.2 |
| **Pre-conditions** | Send OTP completed for valid SM mobile; OTP input visible |
| **Type** | NEG |
| **Test Steps** | 1. Enter incorrect 6-digit OTP e.g. 000000<br>2. Click Verify OTP<br>3. Inspect error area |
| **Expected Result** | Error message displayed in error area; JWT NOT issued; user stays on OTP screen; OTP input remains editable |
| **Priority** | Critical |

---

### SM_LGN_024 — OTP input enforces 6-digit numeric only

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | OTP input visible after Send OTP |
| **Type** | VAL |
| **Test Steps** | 1. Try typing alpha chars in OTP input<br>2. Try entering only 5 digits and click Verify<br>3. Try entering 7 digits |
| **Expected Result** | OTP input accepts digits only; maxlength=6; Verify button disabled or validation error shown until exactly 6 digits entered |
| **Priority** | High |

---

### SM_LGN_025 — Resend OTP fires a new send-OTP request

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.6.1 / Step 3 of How-to |
| **Pre-conditions** | Send OTP completed; OTP screen visible; UI re-send link/timer present |
| **Type** | FUNC |
| **Test Steps** | 1. Wait for UI re-send timer (if any) to expire<br>2. Click the Resend OTP link<br>3. Observe network tab |
| **Expected Result** | A fresh POST to send-OTP endpoint fires; success toast appears; user can enter the new OTP. (Note: per FSD-correction §3, no backend rate-limit exists — UI timer is cosmetic.) |
| **Priority** | High |

---

### SM_LGN_026 — Expired OTP rejected at Verify step

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5.2 |
| **Pre-conditions** | Send OTP completed for valid SM mobile; OTP retrieved; configured OTP expiry window known |
| **Type** | NEG |
| **Test Steps** | 1. Receive a valid OTP<br>2. Wait past the configured expiry window without verifying<br>3. Enter the now-expired OTP<br>4. Click Verify OTP |
| **Expected Result** | Backend returns error indicating OTP expired; JWT NOT issued; user prompted to request a fresh OTP |
| **Priority** | Critical |

---

### SM_LGN_027 — JWT token stored after successful OTP verification

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.5.5 / FS 1.6.2 |
| **Pre-conditions** | UAT credentials 8888888888 / 258369; active SM |
| **Type** | FUNC |
| **Test Steps** | 1. Complete OTP login flow<br>2. Open DevTools → Application → Storage<br>3. Inspect localStorage / cookies / sessionStorage |
| **Expected Result** | A JWT token is stored (location depends on portal config); subsequent navigations include Authorization header or session cookie; reload keeps the user logged in until token expiry |
| **Priority** | Critical |

---

## [FSD-CORRECTION] New TCs — SM Login source-verified gaps

### SM_LGN_FSD_009 — [FSD-CORRECTION] SM Admin can log in via SM tab (role-trust at auth route)

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Security |
| **BRD/FRD Req** | FSD §5.3 / `routes/auth.routes.js:32` |
| **Pre-conditions** | SM-Admin user with roleId=4 exists |
| **Type** | NEG |
| **Test Steps** | 1. From UI, select the "SM" tab<br>2. Enter SM-Admin's mobile<br>3. Backend receives `role:'sales_manager'` in body<br>4. Lookup fails — user is in roleId=4, not 5 |
| **Expected Result** | Backend returns 400 "User not found" because `(phone, roleId=5)` lookup fails. SM Admin must use the SM-Admin tab to log in (which sends `role:'sales_manager_admin'`). Document UI/backend coupling. |
| **Priority** | High |

---

### SM_LGN_FSD_010 — [FSD-CORRECTION] SM Admin has access to all SM routes + admin sub-routes

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Security |
| **BRD/FRD Req** | FSD §5.3 / `routes/sales-manager/index.js:8-15` |
| **Pre-conditions** | Valid SM Admin JWT (roleId=4) |
| **Type** | BIZ |
| **Test Steps** | 1. Call any `/api/v1/sales-manager/common/*` endpoint — expect 200<br>2. Call any `/api/v1/sales-manager/admin/*` endpoint — expect 200<br>3. As plain SM (roleId=5), call `/api/v1/sales-manager/admin/*` — expect 403 |
| **Expected Result** | SM Admin sees both common and admin routes. SM is blocked from admin routes via `restrictTo('sales_manager_admin')`. |
| **Priority** | Critical |

---

### SM_LGN_FSD_011 — [FSD-CORRECTION] SM portal master OTP = ADMIN_MASTER_OTP (not regular master)

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Security |
| **BRD/FRD Req** | FSD §7.4 / `auth.controller.js:725-731` |
| **Pre-conditions** | `ADMIN_MASTER_OTP` configured (e.g. `258369`) |
| **Type** | BIZ |
| **Test Steps** | 1. Send OTP for SM<br>2. Verify with `258369` |
| **Expected Result** | Verify succeeds — SM/SM-Admin uses ADMIN_MASTER_OTP (not the regular masterOtp). Works in all environments. |
| **Priority** | High |

---

## General

### SM_LGN_028 — Admin user (roleId=1) cannot log in via SM Portal login page

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Security |
| **BRD/FRD Req** | FS 1.2 |
| **Pre-conditions** | A registered Admin user (roleId=1) with mobile e.g. 7777777777 |
| **Type** | NEG |
| **Test Steps** | 1. Open /sales-manager login page<br>2. Enter Admin's mobile<br>3. Click Send OTP |
| **Expected Result** | Backend returns 400 "User not found" because lookup is scoped to roleId IN (4,5). Admin cannot enter SM Portal via this page. |
| **Priority** | Critical |

---

### SM_LGN_029 — Login event recorded in audit log with timestamp, mobile, role

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Audit |
| **BRD/FRD Req** | FS 1.8 |
| **Pre-conditions** | Active SM logs in successfully |
| **Type** | DB |
| **Test Steps** | 1. Note current timestamp<br>2. Complete SM login with mobile 8888888888 / OTP 258369<br>3. Query the audit log table for the latest LOGIN event |
| **Expected Result** | An audit-log row exists with the SM's user ID, role (sales_manager or sales_manager_admin), mobile number, and a timestamp within seconds of the login |
| **Priority** | High |

---

### SM_LGN_030 — Failed login attempts recorded in audit log

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Audit |
| **BRD/FRD Req** | FS 1.8 |
| **Pre-conditions** | Valid SM mobile available |
| **Type** | DB |
| **Test Steps** | 1. Send OTP for valid SM mobile<br>2. Enter wrong OTP 000000<br>3. Click Verify OTP<br>4. Query the audit log |
| **Expected Result** | A failed-login audit entry is recorded with mobile, timestamp, and failure reason (invalid OTP) |
| **Priority** | High |

---

### SM_LGN_031 — Logout clears session and redirects to login page

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Session |
| **BRD/FRD Req** | FS 1.5.5 |
| **Pre-conditions** | SM logged in; on /sales-manager/callback-requests |
| **Type** | FUNC |
| **Test Steps** | 1. Click the Logout option in the user menu<br>2. Observe redirect<br>3. Try navigating back to /sales-manager/callback-requests |
| **Expected Result** | JWT removed from storage; user redirected to /sales-manager login page; revisiting protected routes redirects back to login |
| **Priority** | Critical |

---

### SM_LGN_032 — Browser back button after login does not return to login form

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Session |
| **BRD/FRD Req** | FS 1.5.6 |
| **Pre-conditions** | Just completed SM login; on /sales-manager/callback-requests |
| **Type** | FUNC |
| **Test Steps** | 1. Click browser Back button<br>2. Observe page state |
| **Expected Result** | User remains in the authenticated app (stays on callback-requests or a protected route); browser back does not show the OTP/mobile form again |
| **Priority** | Medium |

---

### SM_LGN_033 — Pasting OTP from clipboard auto-populates all 6 digits

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | OTP screen visible; clipboard contains "258369" |
| **Type** | FUNC |
| **Test Steps** | 1. Click into the first OTP cell (if segmented) or main OTP input<br>2. Paste from clipboard (Ctrl+V) |
| **Expected Result** | All 6 digits populate across segmented inputs (if applicable); Verify button becomes enabled; no JS error |
| **Priority** | Medium |

---

### SM_LGN_034 — Verify OTP API failure (5xx) surfaces a user-facing error

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Error Handling |
| **BRD/FRD Req** | FS 1.4 (error area) |
| **Pre-conditions** | OTP screen visible; ability to simulate a 500 response via DevTools network throttling/blocking |
| **Type** | NEG |
| **Test Steps** | 1. Enter the OTP<br>2. Block the verify-otp endpoint in DevTools to force a 500<br>3. Click Verify OTP |
| **Expected Result** | A user-friendly error like "Something went wrong, please try again" displayed in the error area; spinner clears; user can retry without page reload |
| **Priority** | High |

---

### SM_LGN_035 — Login page accessible with HTTPS only (no plaintext OTP transit)

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Security |
| **BRD/FRD Req** | FS 1.5.5 (security implied) |
| **Pre-conditions** | Browser DevTools open |
| **Type** | NEG |
| **Test Steps** | 1. Verify the address bar shows https:// when on /sales-manager<br>2. Capture the send-OTP and verify-OTP requests in Network tab<br>3. Verify all requests use HTTPS and that mobile/OTP are sent in request body, not in URL query string |
| **Expected Result** | All auth requests are HTTPS; mobile and OTP never appear in URL/query; no mixed-content warnings; auth payload not logged to console |
| **Priority** | Critical |

---
