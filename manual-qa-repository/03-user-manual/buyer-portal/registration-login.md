# Buyer Portal — Registration and Login User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Registration-and-Login.md
**Last Updated:** 2026-05-22

---

## Overview

The Buyer Portal is the customer-facing application for the complete end-to-end home-buying journey — from first login through unit selection, KYC, home loan, and milestone payments. The portal is mobile-first (Next.js) and uses mobile OTP for authentication — there is no password.

This guide explains how a registered buyer signs in, what happens on the very first login (Terms & Conditions consent), and what to do if login fails.

> **You cannot self-register.** A Channel Partner or Admin must register you in the system first. If your mobile number is not yet linked to an active registration, the OTP will not arrive (or login will be rejected).

---

## Page Layout (At a Glance)

1. **Nationality tabs** — switch between **Indian National** and **NRI** before entering your number.
2. **Mobile number field** — 10-digit Indian or international (with country code) for NRI.
3. **Send OTP button** — triggers the OTP via Kaleyra SMS / WhatsApp.
4. **OTP input** — 6-digit code.
5. **Verify OTP button** — submits the OTP and starts your session.
6. **T&C consent screen** (first login only) — required before you can reach the dashboard.

---

# Feature 1 — Mobile OTP Login

### What it does
Authenticates a registered buyer using a one-time password sent to their mobile number. On success, a JWT session is issued and the buyer is redirected to the Home Dashboard at `/home`.

### Preconditions
- You must already be registered by a CP or Admin (you cannot self-register).
- Your mobile number must be linked to an active registration.
- For NRI flow, your international country code is enabled on your registration record.

### How to use
1. Open `https://uat.xrportal.in` in your browser or on your mobile.
2. Select your nationality — tap **Indian National** or **NRI**.
3. Enter your registered mobile number. NRI buyers must include their country code.
4. Click **Send OTP**. The OTP is dispatched via Kaleyra over SMS / WhatsApp.
5. Enter the 6-digit OTP into the OTP field.
6. Click **Verify OTP**.

### Result
- A JWT token is issued and your session begins.
- You land on the **Home Dashboard** (`/home`).
- Your role (`role_id = 2 — Buyer`) is set on the session.

### Test credentials (UAT only)
| Field | Value |
|-------|-------|
| Mobile | `8888888888` |
| OTP | `147258` (static on UAT) |

### Warnings
- The same OTP cannot be requested in rapid succession — the backend stamps `lastOtpSentAt` to prevent spam. Wait the cooldown before clicking Send OTP again.
- OTPs expire after the configured time window. Re-send if the OTP has aged out.

---

# Feature 2 — First-Login Terms & Conditions Consent

### What it does
On a buyer's very first successful login, the portal presents the HoABL Terms & Conditions and Privacy Policy and records the buyer's decision. The consent is persisted on the user record and gates further access.

### Preconditions
- You have just verified your OTP for the first time.
- `isConsented` is currently `null` on your user record.

### How to use
1. After OTP verification, the T&C screen renders automatically.
2. Read the full Terms & Conditions.
3. Tick the **I agree** checkbox.
4. Click **Continue / Accept**.

### Result
- `isConsented = 1` is written on your user record.
- You are forwarded to the **Home Dashboard**.
- On subsequent logins this screen does **not** appear.

### Warnings
- If you decline (`isConsented = 0`), portal access may be **restricted**. Re-consent must be obtained — contact your Channel Partner.
- Re-installing the app or clearing cookies does **not** reset the consent flag — it lives on the server.

---

# Feature 3 — NRI Login Flow

### What it does
Handles authentication for non-resident buyers whose mobile number has an international country code.

### Preconditions
- You are tagged as an NRI buyer on your registration.
- You hold the country-code-prefixed mobile linked to that registration.

### How to use
1. Open `https://uat.xrportal.in`.
2. Tap the **NRI** tab.
3. Enter your full mobile number **including country code** (e.g. `+1 415 555 0123`).
4. Click **Send OTP**.
5. Receive the OTP — channel may differ from Indian flow (SMS / WhatsApp depending on regional reach).
6. Enter the OTP and click **Verify OTP**.

### Result
Same as Feature 1 — JWT issued, dashboard loaded.

### Warning
If the OTP does not arrive within a few minutes for NRI numbers, retry once and then escalate to your Sales Manager — Kaleyra delivery to some international carriers can be slow.

---

# Feature 4 — Referral Entry (`/ref/:hvCode`)

### What it does
Captures the referring Channel Partner's HV code when a buyer first arrives via a referral link. The CP code is attributed to the buyer's registration so commission tracking works.

### Preconditions
- The CP has shared a referral link of the form `https://uat.xrportal.in/ref/<hvCode>`.

### How to use
1. Open the referral link the CP shared.
2. Continue through the normal mobile + OTP login flow.

### Result
- The CP's `hvCode` is captured against your account / registration.
- All downstream commission attribution flows to the correct CP.

### Note
This is a one-time capture at the point of first arrival. Once captured, the attribution is locked.

---

## Business Rules — Quick Lookup

1. Buyers cannot self-register — CP or Admin only.
2. UAT static OTP: **147258**.
3. T&C consent is mandatory on first login.
4. NRI numbers must be entered with country code.
5. JWT session is the auth artefact — saved to local storage by the SPA.
6. Referral codes captured via `/ref/:hvCode` route at first entry.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Mobile number not registered" or no OTP arrives | You have not been registered by a CP / Admin | Contact your Channel Partner or Sales Manager to confirm registration is active |
| OTP does not arrive within a few minutes | Carrier delay (especially NRI), wrong nationality tab, mobile mistyped | Verify nationality tab and number, then retry Send OTP after cooldown |
| "OTP expired" error | OTP outside its time window | Click Send OTP again to receive a fresh code |
| T&C screen keeps re-appearing | Consent recorded as disagreed (`isConsented = 0`) | Contact CP — consent reset must be done server-side |
| Stuck on T&C screen with checkbox ticked but Continue disabled | Page-script load incomplete | Refresh once; if still stuck, clear cache and re-login |
| Referral CP not credited | Buyer did not arrive via `/ref/:hvCode` first | Cannot be retro-attributed self-service — raise via CP |
