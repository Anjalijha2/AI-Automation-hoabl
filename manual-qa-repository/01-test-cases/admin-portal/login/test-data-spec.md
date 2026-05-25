# Test Data Spec — Login Module

**Portal:** Admin  
**Module:** Login  
**BRD:** ADMIN-BRD-Login.md  
**FRD:** ADMIN-FRD-Login.md

---

## Positive Test Accounts

| Label | Mobile | OTP | Notes |
|-------|--------|-----|-------|
| Admin (static UAT) | `8888888888` | `258369` | Always works on UAT — master OTP bypasses SMS |

---

## Negative / Boundary Inputs

### Mobile Number

| Input | Type | Expected Result |
|-------|------|----------------|
| `` (empty) | Empty | Send OTP does nothing; stays on login page |
| `12345` | Too short (5 digits) | OTP not sent |
| `abc1234567` | Alpha chars | Non-numeric chars blocked at input level — field rejects them |
| `0000000000` | All zeros | OTP send rejected |
| `  8888888888  ` | Leading/trailing spaces | Trim or validation error |
| `9999999999` | Unregistered mobile | Error: mobile not registered / OTP not sent |

### OTP

| Input | Type | Expected Result |
|-------|------|----------------|
| `` (empty) | Empty | Submit OTP does not proceed |
| `12345` | 5 digits (short) | Login rejected |
| `123456` | Wrong OTP | Error shown; stays on OTP screen |
| `000000` | All zeros | Login rejected |
| `258369` entered after expiry | Expired OTP | Error: OTP expired (time-dependent — partial coverage only) |

---

## API Payloads

### Send OTP
```json
{ "phone": "8888888888", "userType": "admin" }
```

### Verify OTP (success)
```json
{ "phone": "8888888888", "otp": "258369", "userType": "admin" }
```

### Verify OTP (wrong)
```json
{ "phone": "8888888888", "otp": "000000", "userType": "admin" }
```

### Logout
```
POST /api/v1/auth/logout
Authorization: Bearer <JWT>
```

---

## Environment Notes

- UAT master OTP: `258369` — bypasses real SMS for any registered admin mobile
- Session lifetime: 1 day (JWT expiry: `1d`)
- Session file: `automation-repository/fixtures/.auth/admin.json`
