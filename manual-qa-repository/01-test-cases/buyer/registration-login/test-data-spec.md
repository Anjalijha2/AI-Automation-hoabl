# Test Data Spec — Registration & Login — Buyer Portal

**Module:** Registration & Login
**Portal:** Buyer
**Environment:** UAT only (`https://uat.xrportal.in/`)
**Generated:** 2026-06-03
**Sources:** `visual-memory/buyer/registration-login/INDEX.md` + FRD 1.5 + BRD §4

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Nationality tab | `Indian National` (default), `NRI` | Ant Design `[role="tab"]` — DOM renders 4 entries for 2 tabs (use `.first()`) |
| Mobile number (Indian) | `8888888888` | UAT seed buyer; static OTP `147258` works |
| Mobile number (NRI) | International format with country code | NRI-specific OTP delivery channel may differ (FRD 1.8); no UAT seed NRI mobile documented yet |
| OTP | `147258` (UAT static) | FRD 1.5 confirms static UAT OTP; never used in non-UAT |
| Country code prefix | `+91` | Non-editable phone group prefix per visual memory |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error / Behaviour | Source |
|-------|--------------|----------------------------|--------|
| Mobile | `""` (empty) | OTP boxes do not appear; Send OTP no-ops or button disabled | FRD 1.4 |
| Mobile | `abcdefghij` (alphabetic) | Input either rejects alphas at keypress or Send OTP blocks; no API call fired | FRD 1.4 |
| Mobile | `888888888` (9 digits) | Send OTP rejected — too short for Indian mobile (10 required) | FRD 1.4 |
| Mobile | `888888888888` (12 digits, Indian tab) | Input capped at 10 chars OR Send OTP rejected as malformed | FRD 1.4 |
| Mobile | `9999999998` (unregistered) | OTP boxes may appear, but Verify call fails — no JWT, no redirect | BRD §2 |
| OTP | `000000` (wrong code) | Verify rejected; user stays on `/`; no `xr_auth_token` set | FRD 1.5 |
| OTP | `12345` (5 digits — short) | Verify button stays disabled OR rejected | FRD 1.5 |
| OTP | `1234567` (7 digits) | Cannot enter — only 6 single-digit boxes available | INDEX.md (6 `maxlength="1"` boxes) |

---

## Pre-conditions

- **Auth state:** Unauthenticated — no `xr_auth_token` in sessionStorage. Clear sessionStorage before each test:
  ```js
  await page.evaluate(() => sessionStorage.clear());
  ```
- **Data state:** Mobile `8888888888` must exist in the buyer registration table (role_id = 2). UAT seed assumed.
- **Network:** Browser must reach `https://uat.xrportal.in/` — no proxy block; Epinet SMS service does NOT need to be reachable since UAT uses static OTP.
- **Browser state:** Fresh context per test recommended (`newContext()`) — sessionStorage and the `forceLogout` localStorage key must start clean.

---

## Cleanup / Teardown

- After each authenticated test: clear sessionStorage to invalidate the session locally:
  ```js
  await page.evaluate(() => {
    sessionStorage.removeItem('xr_auth_token');
    sessionStorage.removeItem('xr_user');
  });
  ```
- No server-side cleanup required — UAT seed mobile is reusable indefinitely.
- For TC_BUYER_LOGIN_NEG_010 (unregistered mobile): no server state created on failed verify; nothing to clean up.

---

## Network Observability (for automation)

| Endpoint (relative to `https://uat-api.xrportal.in/`) | When | Used By |
|-------------------------------------------------------|------|---------|
| OTP send endpoint (path TBC — Tech Lead Agent to capture from network panel) | After Send OTP click | TC_BUYER_LOGIN_VAL_006, _007, _008 (assert NOT called) |
| OTP verify endpoint (path TBC) | After Verify click | TC_BUYER_LOGIN_FUNC_002, NEG_005, NEG_010 |

> Tech Lead Agent: capture exact endpoints during next visual-capture pass on this module and add to INDEX.md.

---

## Constants / Magic Values

| Constant | Value | Where Used |
|----------|-------|-----------|
| `BASE_URL` | `https://uat.xrportal.in/` | All TCs |
| `BUYER_MOBILE_UAT` | `8888888888` | TC_BUYER_LOGIN_FUNC_002, _004, REG_013, E2E_012 |
| `BUYER_OTP_UAT` | `147258` | TC_BUYER_LOGIN_FUNC_002, NEG_010 |
| `SESSION_TOKEN_KEY` | `xr_auth_token` | All session assertions |
| `SESSION_USER_KEY` | `xr_user` | TC_BUYER_LOGIN_FUNC_002, E2E_012, REG_013 |
| `POST_LOGIN_URL` | `https://uat.xrportal.in/home` | TC_BUYER_LOGIN_FUNC_002, E2E_012 |

These should land in `automation-repository/constants/testData.js` under a `BUYER` namespace (QA Agent task).

---

## Constraints Reminder

- LSQ excluded — no LSQ creds, no LSQ scenarios in this batch
- Strapi excluded — login page does not consume Strapi
- Live SMS gateway not exercised on UAT (static OTP) — no `test.skip(process.env.ENV === 'uat', ...)` guards needed for these TCs
