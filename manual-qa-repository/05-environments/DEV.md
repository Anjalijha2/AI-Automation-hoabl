# DEV Environment

**Purpose:** Development / integration testing  
**Note:** DEV env URL to be confirmed with dev team

---

## Credentials

| Role | Mobile | OTP | Notes |
|------|--------|-----|-------|
| Admin | TBD | TBD | Confirm with dev team |

---

## Environment Characteristics

| Property | Value |
|----------|-------|
| Payment gateway | Mock |
| SMS | Mock / suppressed |
| Data | Dev seed data (may reset frequently) |
| Stability | Lower — active development |

---

## DEV vs UAT Delta

See [UAT-vs-DEV-delta.md](../07-execution/UAT-vs-DEV-delta.md) for test gaps between environments.

---

## When to Use DEV

- Smoke tests after PR merge (pre-UAT)
- Integration tests during active development
- Faster feedback cycle before UAT promotion
