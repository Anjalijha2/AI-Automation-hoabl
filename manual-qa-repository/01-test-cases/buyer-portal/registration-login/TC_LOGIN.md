# Test Cases — Registration & Login
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Registration-and-Login.md

---

## Login — Landing Page & Nationality Selection

### BYR_LGN_001 — Login page loads at root URL

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged out, no active session cookie |
| **Test Steps** | 1. Open browser<br>2. Navigate to `https://uat.xrportal.in/`<br>3. Wait for page to render |
| **Expected Result** | Login page loads with HoABL branding, nationality tabs, mobile input and Send OTP button visible |
| **Priority** | Critical |

---

### BYR_LGN_002 — Indian National tab selected by default

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Login page open |
| **Test Steps** | 1. Inspect nationality tab strip on page load |
| **Expected Result** | "Indian National" tab is highlighted/active by default; "NRI" tab is inactive |
| **Priority** | High |

---

### BYR_LGN_003 — Switch to NRI tab shows country code selector

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Login page open, Indian National tab active |
| **Test Steps** | 1. Click "NRI" tab<br>2. Observe mobile input area |
| **Expected Result** | NRI tab becomes active; country-code dropdown/selector appears alongside mobile field |
| **Priority** | High |

---

### BYR_LGN_004 — Switch back to Indian National hides country code

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI tab active |
| **Test Steps** | 1. Click "Indian National" tab |
| **Expected Result** | Country code selector hidden; mobile field reverts to 10-digit Indian format |
| **Priority** | Medium |

---

### BYR_LGN_005 — Referral link captures CP code

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged out; valid CP hvCode available |
| **Test Steps** | 1. Open `https://uat.xrportal.in/ref/<hvCode>`<br>2. Inspect URL/local storage<br>3. Proceed to login |
| **Expected Result** | Referral hvCode stored in session/local storage; attributed to CP on registration completion |
| **Priority** | High |

---

## Login — Mobile Number Entry & OTP Request

### BYR_LGN_006 — Mobile field accepts only digits

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Indian National tab active |
| **Test Steps** | 1. Click mobile input<br>2. Type "abc!@#"<br>3. Observe field |
| **Expected Result** | Non-numeric characters rejected; field remains empty or strips invalid characters |
| **Priority** | High |

---

### BYR_LGN_007 — Mobile field enforces 10-digit limit (Indian)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Indian National tab active |
| **Test Steps** | 1. Type 11 digits into mobile field<br>2. Observe |
| **Expected Result** | Input capped at 10 digits; 11th digit not accepted |
| **Priority** | High |

---

### BYR_LGN_008 — Send OTP disabled until 10 digits entered

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Login page open, mobile field empty |
| **Test Steps** | 1. Type 9 digits<br>2. Check Send OTP state<br>3. Type 10th digit<br>4. Re-check |
| **Expected Result** | Send OTP disabled at 9 digits; enabled at exactly 10 digits |
| **Priority** | High |

---

### BYR_LGN_009 — Send OTP with registered mobile triggers OTP

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Registered buyer mobile exists (e.g., 8888888888) |
| **Test Steps** | 1. Enter registered mobile<br>2. Click Send OTP<br>3. Wait for response |
| **Expected Result** | OTP input appears; "OTP sent" toast displayed; Kaleyra SMS/WhatsApp triggered |
| **Priority** | Critical |

---

### BYR_LGN_010 — Send OTP with unregistered mobile shows error

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Unregistered mobile number known |
| **Test Steps** | 1. Enter unregistered 10-digit mobile<br>2. Click Send OTP |
| **Expected Result** | Error message: buyer not registered; instructs to contact CP/sales |
| **Priority** | High |

---

### BYR_LGN_011 — OTP resend throttled by lastOtpSentAt

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP just sent within throttle window |
| **Test Steps** | 1. Click "Resend OTP" immediately<br>2. Observe |
| **Expected Result** | Resend blocked with cooldown message until throttle window elapses |
| **Priority** | Medium |

---

### BYR_LGN_012 — NRI mobile with country code accepted

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI tab active; valid registered NRI mobile (e.g., +971-XXXXXXXXX) |
| **Test Steps** | 1. Select country code<br>2. Enter NRI mobile<br>3. Click Send OTP |
| **Expected Result** | OTP sent via configured NRI channel; OTP entry appears |
| **Priority** | High |

---

## Login — OTP Verification

### BYR_LGN_013 — OTP field accepts 6 digits

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP sent, OTP input visible |
| **Test Steps** | 1. Inspect OTP input boxes/length |
| **Expected Result** | OTP field accepts exactly 6 numeric digits |
| **Priority** | High |

---

### BYR_LGN_014 — Verify OTP disabled until 6 digits entered

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP entry visible |
| **Test Steps** | 1. Enter 5 digits<br>2. Check Verify button<br>3. Enter 6th digit<br>4. Re-check |
| **Expected Result** | Verify OTP disabled at 5 digits, enabled at 6 |
| **Priority** | High |

---

### BYR_LGN_015 — Correct OTP logs buyer in successfully

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Valid OTP received (UAT static: 147258 / 258369) |
| **Test Steps** | 1. Enter correct OTP<br>2. Click Verify OTP |
| **Expected Result** | JWT issued, session established, buyer redirected to `/home` |
| **Priority** | Critical |

---

### BYR_LGN_016 — Incorrect OTP shows error

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP entry visible |
| **Test Steps** | 1. Enter wrong 6-digit OTP<br>2. Click Verify OTP |
| **Expected Result** | "Invalid OTP" error; user stays on OTP screen |
| **Priority** | Critical |

---

### BYR_LGN_017 — Expired OTP rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP sent and validity window elapsed |
| **Test Steps** | 1. Wait beyond OTP validity<br>2. Enter the OTP<br>3. Click Verify |
| **Expected Result** | "OTP expired" error; prompt to request new OTP |
| **Priority** | High |

---

### BYR_LGN_018 — Edit mobile from OTP screen restarts flow

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Click "Edit number" or back<br>2. Modify mobile<br>3. Click Send OTP again |
| **Expected Result** | Returns to mobile entry; new OTP issued for new number |
| **Priority** | Medium |

---

## Login — First-Login Consent (Terms & Conditions)

### BYR_LGN_019 — T&C modal shown on first login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | New buyer, `isConsented = null` |
| **Test Steps** | 1. Complete OTP verification |
| **Expected Result** | T&C modal/screen appears before reaching dashboard |
| **Priority** | Critical |

---

### BYR_LGN_020 — T&C accept enables Proceed CTA

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | T&C modal visible |
| **Test Steps** | 1. Scroll through T&C text<br>2. Tick "I agree" checkbox<br>3. Observe Proceed button |
| **Expected Result** | Proceed button enabled only after checkbox is ticked |
| **Priority** | High |

---

### BYR_LGN_021 — T&C accept persists isConsented = 1

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | T&C modal visible, checkbox ticked |
| **Test Steps** | 1. Click Proceed<br>2. Verify backend `isConsented` flag<br>3. Verify URL |
| **Expected Result** | `isConsented = 1` persisted; buyer redirected to `/home` |
| **Priority** | Critical |

---

### BYR_LGN_022 — T&C disagree restricts access

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | T&C modal visible |
| **Test Steps** | 1. Click "Disagree" / close modal |
| **Expected Result** | `isConsented = 0` recorded; full access not granted; restricted view or logged out |
| **Priority** | High |

---

### BYR_LGN_023 — Returning buyer skips T&C modal

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer with `isConsented = 1` |
| **Test Steps** | 1. Log in via OTP |
| **Expected Result** | T&C modal not shown; lands on `/home` directly |
| **Priority** | High |

---

## Login — Session & Negative Cases

### BYR_LGN_024 — Direct access to /home without session redirects to login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Open `https://uat.xrportal.in/home` directly |
| **Expected Result** | User redirected to login page |
| **Priority** | High |

---

### BYR_LGN_025 — Session persists on browser refresh after login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Refresh `/home` |
| **Expected Result** | Dashboard reloads; no re-login required |
| **Priority** | High |

---

### BYR_LGN_026 — Logout clears session and returns to login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Click Logout from menu<br>2. Try to open `/home` directly |
| **Expected Result** | Session destroyed; `/home` access redirects to login |
| **Priority** | High |

---

### BYR_LGN_027 — Multiple OTP failures throttle attempts

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Enter wrong OTP 5 times consecutively |
| **Expected Result** | Account/IP temporarily blocked; lockout message shown |
| **Priority** | Medium |

---
