# Admin Portal — Login BRD

**Module:** Login
**URL:** `https://uat-web.xrportal.in/admin`
**Created:** 2026-05-11
**Status:** Complete — Automated (Sprint 1)

---

## 1. Purpose

The Login module is the entry point to the Admin Portal. It authenticates the internal operations team using a mobile phone number and a one-time password (OTP) — no traditional username and password is used. This approach ensures only registered mobile numbers can access the portal, even if the phone is shared.

---

## 2. Who Uses This

| User | What They Do Here |
|------|------------------|
| Admin | Log in to access all admin portal features |
| Sales Manager Admin | Log in to access admin and SM portal features |

---

## 3. How to Access

Direct URL: `https://uat-web.xrportal.in/admin`

There is no other way to reach the login page — it is the default page for the admin portal when not logged in.

---

## 4. Screen Layout

### Step 1 — Mobile Number Screen

| Element | Description |
|---------|-------------|
| Logo | HoABL logo at top |
| Banner image | Side banner graphic |
| Heading | "Admin Login" |
| Mobile Number field | Text box with "+91" country code prefix |
| Terms & Conditions link | Links to terms of service |
| Privacy Policy link | Links to privacy policy |
| **Send OTP** button | Submits the mobile number |
| Copyright footer | "Copyright 2026 Growwithhoabl All Rights Reserved" |

### Step 2 — OTP Entry Screen

| Element | Description |
|---------|-------------|
| Back button | Returns to mobile number entry |
| Heading | "ENTER OTP" |
| Sub-text | "Enter the OTP sent to your phone number" |
| OTP boxes | Six individual input boxes, one digit each |
| Countdown timer | Shows seconds remaining before OTP expires (e.g. "57s") |
| Re-Send OTP button | Disabled until timer expires; allows requesting a new OTP |
| **Submit OTP** button | Verifies the entered OTP |

---

## 5. Feature Walkthrough

### Logging In Successfully

1. Open a browser and go to `https://uat-web.xrportal.in/admin`
2. The login page appears with a mobile number field
3. Enter your registered 10-digit Indian mobile number (the field already shows "+91")
4. Click **Send OTP**
5. The screen changes to show six OTP input boxes
6. Enter each digit of the 6-digit OTP — the cursor moves to the next box automatically
7. Click **Submit OTP**
8. If correct: you are taken directly to the Customers page

### If You Need to Re-Send the OTP

1. On the OTP screen, wait for the countdown timer to reach zero
2. The **Re-Send OTP** button becomes active
3. Click it to request a new OTP
4. A new 6-digit OTP is sent to your mobile

### Going Back to Change Your Mobile Number

1. Click the **back arrow** at the top of the OTP screen
2. The mobile number entry screen reappears
3. Enter a different number and click **Send OTP** again

### Entering the Wrong OTP

1. Enter an incorrect OTP in the boxes
2. Click **Submit OTP**
3. An error message appears; you remain on the OTP screen
4. You can try again without being locked out

---

## 6. Business Rules

1. The mobile number must be exactly 10 digits
2. The mobile field accepts only numbers — letters and special characters are blocked by the field itself
3. OTP is 6 digits entered one per box; focus moves to the next box automatically
4. The Re-Send OTP button is disabled until the countdown timer expires
5. Entering the wrong OTP shows an error but does not lock the account
6. Successful OTP entry redirects to `/admin/customers`
7. The session lasts 1 day — after that, the admin must log in again
8. On UAT (testing environment): mobile `8888888888` with OTP `258369` always works

---

## 7. Validations

| Input | Invalid Scenario | System Response |
|-------|-----------------|-----------------|
| Mobile number | Empty | Clicking Send OTP does nothing; stays on login page |
| Mobile number | Fewer than 10 digits | OTP is not sent |
| Mobile number | Letters or special characters | Characters are blocked from being typed |
| Mobile number | All zeros (0000000000) | OTP rejected |
| OTP | Empty | Submit OTP does not proceed |
| OTP | Wrong 6 digits | Error message shown; stays on OTP screen |
| OTP | Fewer than 6 digits | Login rejected |

---

## 8. Dependencies

| Dependency | Why |
|-----------|-----|
| [Admin Portal Overview](BRD-Admin-Overview.md) | Login is the gateway to all admin modules |
| SMS / OTP delivery service | OTP sent via **Epinet SMS** (NOT Kaleyra/WhatsApp). // Source: communication.service.js; auth.controller.js |

---

## 9. User Journey Map

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Navigates to `/admin` | Login page shown | Step 2 |
| 2 | Admin | Enters 10-digit mobile number | Field validates format | Step 3 |
| 3 | Admin | Clicks **Send OTP** | OTP sent via SMS; OTP entry screen shown | Step 4 |
| 4 | Admin | Enters 6-digit OTP (one box per digit) | Each digit entered; focus advances | Step 5 |
| 5 | Admin | Clicks **Submit OTP** | OTP verified | Step 6 |
| 6 | System | Validates OTP | Creates session | Step 7 |
| 7 | System | Redirects | `/admin/customers` page loads | Done |

**Failure path (wrong OTP):**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 5 | Admin | Clicks **Submit OTP** (wrong code) | Error message shown | Step 4 (retry) |
| — | Admin | Waits for timer to expire | Re-Send OTP enabled | Clicks Re-Send → Step 4 |

---

## 10. Open Questions / Gaps

None. All login behavior confirmed through automated testing (22 tests passing as of Sprint 1).

---

## 11. Backend Gap Reconciliation (2026-05-21)

This section corrects and supplements §6–§7 based on controller-layer audit of `auth.controller.js`. All notes below override conflicting statements above.

### ⚠️ KNOWN ISSUE — CRITICAL SECURITY: Logout does NOT invalidate JWT
<!-- BA correction: GAP-TL-019, 2026-05-21 -->
- **Behaviour:** `POST /auth/logout` returns HTTP 200 but performs no server-side action — no JWT blacklist, no session record clear, no cookie clear.
- **Impact:** A JWT remains valid for its full 1-day lifetime even after the user clicks "Logout". Anyone holding a copy of the token (browser history, dev tools, intercepted log) can continue calling protected APIs.
- **Doc previously claimed:** FRD Feature 3 §6 / §7.2 stated "JWT invalidated server-side". This was incorrect.
- **Correct behaviour:** Logout is a client-only no-op. Client must discard the token locally; the server does not enforce it.
- **Action:** Flagged to Developer Agent. Until source fix, QA must NOT test post-logout-token-rejection as a passing case.

### 11.1 OTP cooldown — no backend throttle <!-- BA correction: GAP-TL-017, 2026-05-21 -->
- Backend cooldown code is commented out in `auth.controller.js:558-568`. There is NO server-side rate limit on `sendOtp` requests.
- Only the frontend re-send timer (referenced in §4 Step 2) enforces spacing. A direct API caller can request OTPs back-to-back.
- §6 Rule 4 (Re-Send disabled until timer expires) applies to the UI only — not the API.

### 11.2 Two distinct master OTPs <!-- BA correction: GAP-TL-018, 2026-05-21 -->
- §6 Rule 8 listed a single master OTP `258369`. Backend actually selects between TWO master OTPs:
  - `otpConfig.adminMasterOtp` — used when the resolved user role is admin or sm.
  - `otpConfig.masterOtp` — used for user/CP roles.
- For Admin Portal scope (admin/sm only), the relevant one is `adminMasterOtp`. The value `258369` is the admin master OTP on UAT.

### 11.3 Admin/SM must be pre-provisioned; CP auto-created <!-- BA correction: GAP-TL-023, 2026-05-21 -->
- For roles `admin`, `sm`, `sm_admin`: if the mobile number is NOT already present in the user table, backend returns HTTP 400 "User not found" — even on a valid OTP request.
- For role `cp` (out of admin scope but stated here for cross-reference): user is auto-created on first OTP request.
- §6 should treat admin-side users as strictly pre-provisioned.

### 11.4 "Access revoked" message <!-- BA correction: GAP-TL-024, 2026-05-21 -->
- Add to §7 validations: if the resolved user has `isActive=false`, backend returns HTTP 400 with the exact string "Your access to the portal has been revoked".

### 11.5 `permissions` map in verify-OTP response <!-- BA correction: GAP-TL-022, 2026-05-21 -->
- On successful OTP verification for roles admin/sm/cp, response includes a `permissions` field shaped as `{ moduleId: [actionIds] }`. UI uses this to gate menu items.

### 11.6 Hidden tracking fields on `sendOtpV3` <!-- BA correction: GAP-TL-020, 2026-05-21 -->
- The `sendOtp` endpoint silently accepts `sessionId`, `hvCode`, `nri`, `fullUrl`, and UTM/Google-Ads parameters and forwards them to LeadSquared. Admin Portal does not send these; out of admin scope but documented here so QA does not flag the extra-field tolerance as a bug.
