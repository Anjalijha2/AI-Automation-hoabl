# UAT Environment

**URL:** `https://uat-web.xrportal.in/admin`  
**Purpose:** User Acceptance Testing — pre-production validation

---

## Credentials

| Role | Mobile | OTP | Notes |
|------|--------|-----|-------|
| Admin | `8888888888` | `258369` | Static UAT OTP |

> OTP is static on UAT — no real SMS sent.

---

## Auth Session Setup

```bash
npm run auth:setup
# Saves to: automation-repository/fixtures/.auth/admin.json
```

Re-run when session expires or `admin.json` deleted.

---

## Environment Characteristics

| Property | Value |
|----------|-------|
| Payment gateway | Mock / sandbox — live gateway skipped |
| SMS | Static OTP — no real dispatch |
| Email | Suppressed or sandbox |
| Data | Seeded test data |
| Database | Isolated UAT DB |

---

## ENV Skip Guards

Tests that should NOT run on UAT (live side effects):

```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

---

## Known UAT Limitations

- Payment transaction flows use mock gateway — do not test live payment scenarios
- OTP expiry disabled — static OTP `258369` always valid
- Some admin features may be restricted to production-only roles

---

## Test Commands (UAT)

```bash
npm run test:regression:admin     # Full regression on UAT
npm run test:smoke          # Smoke on UAT
HEADLESS=true npm run test:regression:admin   # CI mode
```
