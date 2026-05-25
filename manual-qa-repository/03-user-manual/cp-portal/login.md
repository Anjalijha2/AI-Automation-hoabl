# CP Portal — Login Module User Guide

**Portal:** Channel Partner (Growth Partner) Portal
**URL:** `https://uat-web.xrportal.in/login`
**Sources:** CP-BRD-CP-Portal.md · CP-FS-Login.md
**Last Updated:** 2026-05-22
**Audience:** Channel Partner / Sales Agent (Role ID 3 — including Lead/Master CPs and Member CPs)

---

## Overview

The CP Portal login is the single entry point for every Channel Partner (Growth Partner) into the XR Portal workspace. Authentication is mobile-OTP only — there are no passwords. On successful verification you are routed either to your operating Dashboard (if your CP profile is complete) or to a one-time profile-completion screen (if you are a first-time user). Only users carrying role ID 3 (Channel Partner) can authenticate here; Buyer (role 2) and Sales Manager (role 4/5) credentials are rejected by design.

The login page is the root-level public route `/login`. On UAT the static test credentials are mobile `8888888888` / OTP `147258`.

---

## Page Layout (At a Glance)

1. **Mobile Number Input** — accepts 10-digit Indian numbers (country code supported for NRI/international CPs).
2. **Send OTP Button** — triggers OTP delivery via Kaleyra (SMS + WhatsApp).
3. **OTP Input** — 6-digit OTP field, shown after Send OTP succeeds.
4. **Verify OTP Button** — submits the OTP for backend verification.
5. **Error Banner** — inline messages for invalid OTP, unrecognised mobile, expired OTP, or incomplete profile.
6. **Resend OTP Link** — re-trigger OTP delivery after the rate-limit window.

---

# Feature 1 — CP Login with Mobile OTP

### What it does
Authenticates a registered Channel Partner using their mobile number and a one-time password delivered to that number. On success a JWT session is established and you are landed on `/dashboard`.

### Preconditions
- Your mobile number is registered as a CP account in the XR Portal system (role ID 3).
- Your CP registration profile is marked complete (`isCpRegistrationCompleted = true`).
- You have access to the mobile device that receives the SMS/WhatsApp OTP.

### How to use
1. Open `https://uat-web.xrportal.in/login` in your browser.
2. Type your registered 10-digit mobile number into the **Mobile Number** field. For NRI/international CPs, pick the country code first.
3. Click **Send OTP**. A 6-digit code is sent to your mobile via Kaleyra (both SMS and WhatsApp).
4. Type the 6-digit OTP into the **OTP** field.
5. Click **Verify OTP**.
6. On success: you are redirected to `/dashboard` and your CP workspace loads.

### Result
- JWT token issued and stored in the browser session.
- Login event recorded server-side with timestamp, mobile, and role.
- Default landing route: `/dashboard` showing all customers you have registered.

### Warning
- If you do not receive an OTP within ~30 seconds, click **Send OTP** again. Repeated rapid retries are rate-limited.
- Buyer (role 2) and Sales Manager (role 4/5) mobile numbers will be rejected here — they must use their own respective portal login pages.

---

# Feature 2 — First-Time Login / Profile Completion Redirect

### What it does
On the first successful OTP verification for a brand-new CP, the system detects that `isCpRegistrationCompleted = false` and redirects you to the CP registration profile screen instead of the dashboard. You must finish your profile once; subsequent logins go straight to the dashboard.

### Preconditions
- You are a new Channel Partner whose backend account was created but profile was never completed.
- You have successfully verified the OTP.

### How to use
1. Complete login Steps 1–5 above.
2. Instead of `/dashboard`, the **Complete Your CP Profile** screen opens (RegisterCp flow).
3. Fill in the required CP profile fields (name, agency, HV code reference, etc.) as prompted.
4. Click **Submit**.

### Result
- `isCpRegistrationCompleted` is set to `true`.
- You are forwarded to `/dashboard`.
- All future logins skip this screen and land directly on the dashboard.

### Note
This profile-completion screen appears exactly once per CP. If you see it again on a subsequent login, escalate to your manager — your profile flag may have been reset administratively.

---

# Feature 3 — Resend OTP

### What it does
Re-delivers a fresh OTP to the same mobile number when the previous code has expired or did not arrive.

### Preconditions
- You have already clicked **Send OTP** at least once for the current mobile number.
- The rate-limit cool-down window has elapsed.

### How to use
1. After clicking **Send OTP**, wait for the OTP to arrive. If it does not, or if you mistyped it and saw an expiry error, click **Send OTP** (or the **Resend OTP** link) again.
2. A new 6-digit code is dispatched. The previous code is invalidated.
3. Enter the new OTP and click **Verify OTP**.

### Result
A fresh OTP arrives; the previous one stops working.

### Warning
Repeated failed attempts within a short window trigger rate limiting and temporarily block further OTP requests. Wait the displayed cool-down period before retrying.

---

## Validation Rules

| Field | Rule |
|-------|------|
| Mobile number | Must be a registered CP mobile (role ID 3). Unrecognised numbers are rejected with an error message. |
| OTP | Must be the most recently issued 6-digit code; must be entered before the configured expiry window. |
| Profile completion | If `isCpRegistrationCompleted = false`, login still succeeds but redirects to profile-completion screen — main portal access is gated. |
| Rate limit | Repeated failed OTP attempts trigger a temporary block. |

---

## Role Restrictions

| Role | Can log in here? |
|------|-----------------|
| Channel Partner (role 3) | Yes |
| Lead/Master CP (role 3, isLeadCp=true) | Yes |
| Member CP (role 3, leadCpId set) | Yes |
| Buyer (role 2) | No — rejected |
| Sales Manager (role 4/5) | No — rejected |
| Admin (role 1) | No — must use Admin Portal login |

---

## Notifications Dispatched

| Action | Channel | Recipient |
|--------|---------|-----------|
| Send OTP | Kaleyra SMS + WhatsApp | CP mobile |
| Successful login | None (login event logged server-side only) | — |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Mobile number not registered" error | Number is not on file as a CP account, or you typed the wrong number | Re-check the number; if it is correct, contact your manager to verify the CP onboarding |
| OTP never arrives | Carrier delay, wrong number, or rate-limit | Wait 30 seconds → click Send OTP again. If still nothing, verify the mobile number |
| "Invalid OTP" error | OTP mistyped or expired | Click Send OTP for a fresh code and enter it immediately |
| Login succeeds but lands on a profile-completion form | First-time login — `isCpRegistrationCompleted = false` | Complete the profile form; subsequent logins go to `/dashboard` |
| Buyer or SM credentials don't work | Wrong portal — CP login only accepts role 3 | Use the correct portal's login page |
