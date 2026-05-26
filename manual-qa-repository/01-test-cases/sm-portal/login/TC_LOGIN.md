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

### SM_LGN_008 — [FSD-CORRECTION] Reject login for inactive SM at SEND-OTP step

| Field | Value |
|-------|-------|
| **Module** | SM – Login |
| **BRD/FRD Req** | FSD §3.1.b / `auth.controller.js:517-519` |
| **Pre-conditions** | SM account exists with isActive = false |
| **Test Steps** | 1. Enter inactive SM's mobile<br>2. Click Send OTP |
| **Expected Result** | Backend returns 400 `"Your access to the portal has been revoked"` at send-OTP. OTP screen does NOT load. (Previous BRD assumed rejection at verify-step — incorrect.) |
| **Priority** | Critical |

---

## [FSD-CORRECTION] New TCs — SM Login source-verified gaps

### SM_LGN_FSD_009 — [FSD-CORRECTION] SM Admin can log in via SM tab (role-trust at auth route)

| Field | Value |
|-------|-------|
| **Module** | SM – Login / Security |
| **BRD/FRD Req** | FSD §5.3 / `routes/auth.routes.js:32` |
| **Pre-conditions** | SM-Admin user with roleId=4 exists |
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
| **Test Steps** | 1. Send OTP for SM<br>2. Verify with `258369` |
| **Expected Result** | Verify succeeds — SM/SM-Admin uses ADMIN_MASTER_OTP (not the regular masterOtp). Works in all environments. |
| **Priority** | High |

---
