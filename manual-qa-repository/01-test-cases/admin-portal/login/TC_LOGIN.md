# TC_LOGIN — Login Module Test Cases

**Module:** Login  
**Portal:** XR Portal Admin (`https://uat-web.xrportal.in/admin`)  
**BA Sign-off:** ✅ Approved (2026-05-16)  
**Total TCs:** 22  
**Selector Source:** `03-selectors/login.json` _(to be created on discovery)_

---

## UI Tests

### TC_LOGIN_UI_001
**Title:** Login page renders all required elements  
**Priority:** High  
**Pre-conditions:** Navigate to `/admin`  
**Steps:**
1. Open `https://uat-web.xrportal.in/admin`
2. Observe page layout

**Expected:** Mobile input, "Send OTP" button, page heading visible  
**Automatable:** Yes

---

### TC_LOGIN_UI_002
**Title:** OTP input appears after sending OTP  
**Priority:** High  
**Pre-conditions:** Mobile number entered  
**Steps:**
1. Enter mobile `8888888888`
2. Click "Send OTP"

**Expected:** OTP input field appears; "Login" / "Verify" button visible  
**Automatable:** Yes

---

### TC_LOGIN_UI_003
**Title:** Responsive layout on 1280×720 viewport  
**Priority:** Medium  
**Pre-conditions:** None  
**Steps:**
1. Open login page at 1280×720
2. Inspect layout

**Expected:** No overflow, all elements visible, no horizontal scrollbar  
**Automatable:** Yes

---

## Functional Tests

### TC_LOGIN_FUNC_001
**Title:** Successful login with valid OTP  
**Priority:** Critical  
**Pre-conditions:** UAT environment, valid OTP `258369`  
**Steps:**
1. Enter mobile `8888888888`
2. Click "Send OTP"
3. Enter OTP `258369`
4. Click "Login" / "Verify"

**Expected:** Redirected to `/customers` or dashboard; "Customers" heading visible  
**Automatable:** Yes

---

### TC_LOGIN_FUNC_002
**Title:** "Send OTP" button triggers OTP delivery  
**Priority:** High  
**Pre-conditions:** Valid mobile entered  
**Steps:**
1. Enter mobile `8888888888`
2. Click "Send OTP"

**Expected:** OTP field displayed; success indicator or message shown  
**Automatable:** Yes

---

### TC_LOGIN_FUNC_003
**Title:** Session persists after page refresh  
**Priority:** High  
**Pre-conditions:** User logged in  
**Steps:**
1. Login successfully
2. Refresh browser

**Expected:** Stays on dashboard; not redirected to login  
**Automatable:** Yes

---

### TC_LOGIN_FUNC_004
**Title:** Logout clears session  
**Priority:** High  
**Pre-conditions:** User logged in  
**Steps:**
1. Login successfully
2. Click logout (profile/menu)
3. Try to navigate to `/customers`

**Expected:** Redirected to login page; session cleared  
**Automatable:** Yes

---

## Validation Tests

### TC_LOGIN_VAL_001
**Title:** Empty mobile number shows validation error  
**Priority:** High  
**Pre-conditions:** Login page open  
**Steps:**
1. Leave mobile input empty
2. Click "Send OTP"

**Expected:** Validation error "Mobile number is required" or similar  
**Automatable:** Yes

---

### TC_LOGIN_VAL_002
**Title:** Invalid mobile format rejected  
**Priority:** High  
**Pre-conditions:** Login page open  
**Steps:**
1. Enter `123` in mobile field
2. Click "Send OTP"

**Expected:** Error: invalid mobile number format  
**Automatable:** Yes

---

### TC_LOGIN_VAL_003
**Title:** Empty OTP shows validation error  
**Priority:** High  
**Pre-conditions:** OTP field visible  
**Steps:**
1. Enter valid mobile, click "Send OTP"
2. Leave OTP empty, click "Login"

**Expected:** Validation error shown for OTP field  
**Automatable:** Yes

---

### TC_LOGIN_VAL_004
**Title:** Wrong OTP shows error  
**Priority:** High  
**Pre-conditions:** OTP sent  
**Steps:**
1. Enter mobile `8888888888`, send OTP
2. Enter wrong OTP `000000`
3. Click "Login"

**Expected:** Error message: invalid/incorrect OTP  
**Automatable:** Yes

---

### TC_LOGIN_VAL_005
**Title:** Non-numeric mobile input rejected  
**Priority:** Medium  
**Pre-conditions:** Login page open  
**Steps:**
1. Enter `abcdefghij` in mobile field
2. Click "Send OTP"

**Expected:** Error or field rejects non-numeric input  
**Automatable:** Yes

---

## Negative Tests

### TC_LOGIN_NEG_001
**Title:** Unregistered mobile number  
**Priority:** Medium  
**Pre-conditions:** Login page open  
**Steps:**
1. Enter unregistered mobile `9999999999`
2. Click "Send OTP"

**Expected:** Error: mobile not registered / OTP not sent  
**Automatable:** Yes

---

### TC_LOGIN_NEG_002
**Title:** OTP input before sending OTP  
**Priority:** Low  
**Pre-conditions:** Login page open  
**Steps:**
1. Attempt to enter/submit OTP without first clicking "Send OTP"

**Expected:** OTP field not accessible or shows appropriate message  
**Automatable:** Yes

---

### TC_LOGIN_NEG_003
**Title:** Direct URL access to protected page without login  
**Priority:** High  
**Pre-conditions:** No active session  
**Steps:**
1. Clear cookies/session
2. Navigate directly to `https://uat-web.xrportal.in/admin/customers`

**Expected:** Redirected to login page  
**Automatable:** Yes

---

## Edge Cases

### TC_LOGIN_EDGE_001
**Title:** Mobile number with leading/trailing spaces  
**Priority:** Low  
**Pre-conditions:** Login page open  
**Steps:**
1. Enter `  8888888888  ` (with spaces)
2. Click "Send OTP"

**Expected:** Trimmed and processed, or validation error  
**Automatable:** Yes

---

### TC_LOGIN_EDGE_002
**Title:** OTP input boundary — 5 digits  
**Priority:** Low  
**Pre-conditions:** OTP sent  
**Steps:**
1. Enter 5-digit OTP `25836`
2. Click "Login"

**Expected:** Validation error — OTP must be 6 digits  
**Automatable:** Yes

---

### TC_LOGIN_EDGE_003
**Title:** Multiple rapid "Send OTP" clicks  
**Priority:** Medium  
**Pre-conditions:** Login page open  
**Steps:**
1. Enter valid mobile
2. Click "Send OTP" 3 times rapidly

**Expected:** OTP sent once; button debounced or disabled after first click  
**Automatable:** Yes

---

## Business Rule Tests

### TC_LOGIN_BIZ_001
**Title:** Admin-only access — non-admin mobile blocked  
**Priority:** High  
**Pre-conditions:** Non-admin mobile available  
**Steps:**
1. Enter non-admin mobile
2. Complete OTP flow

**Expected:** Access denied or redirected away from admin portal  
**Automatable:** Partial (depends on test data)

---

### TC_LOGIN_BIZ_002
**Title:** OTP expiry — expired OTP rejected  
**Priority:** Medium  
**Pre-conditions:** OTP sent, wait for expiry  
**Steps:**
1. Send OTP
2. Wait for OTP to expire (per system config)
3. Enter expired OTP

**Expected:** Error: OTP expired, please request new OTP  
**Automatable:** Partial (time-dependent)

---

## End-to-End Tests

### TC_LOGIN_E2E_001
**Title:** Full login → navigate → logout flow  
**Priority:** Critical  
**Pre-conditions:** UAT environment  
**Steps:**
1. Open login page
2. Enter mobile, send OTP
3. Enter OTP, submit
4. Verify dashboard loads
5. Navigate to Customers module
6. Log out
7. Verify redirect to login

**Expected:** Complete flow completes without errors; session cleared on logout  
**Automatable:** Yes

---

### TC_LOGIN_E2E_002
**Title:** Login → session save → reload → still authenticated  
**Priority:** High  
**Pre-conditions:** UAT environment  
**Steps:**
1. Login successfully
2. Save session state (`admin.json`)
3. Open new browser context with saved state
4. Navigate to `/customers`

**Expected:** Authenticated without re-login; customers page loads  
**Automatable:** Yes (auth-setup flow)

---

## Automation Coverage

| TC | Automatable | Spec | Status |
|----|-------------|------|--------|
| TC_LOGIN_UI_001 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_UI_002 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_UI_003 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_FUNC_001 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_FUNC_002 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_FUNC_003 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_FUNC_004 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_VAL_001–005 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_NEG_001–003 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_EDGE_001–003 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_BIZ_001 | Partial | — | ⏳ Pending |
| TC_LOGIN_BIZ_002 | Partial | — | ⏳ Pending |
| TC_LOGIN_E2E_001 | Yes | `tests/e2e/login.spec.js` | ⏳ Pending |
| TC_LOGIN_E2E_002 | Yes | `tests/auth.setup.js` | ⏳ Pending |
