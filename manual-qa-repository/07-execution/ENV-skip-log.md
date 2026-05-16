# ENV Skip Log

**Purpose:** Track all tests skipped by ENV guards — prevent accidental UAT side effects

---

## Skip Guard Pattern

```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

---

## Skipped Tests Registry

| TC ID | Module | Skip Condition | Reason | Spec |
|-------|--------|---------------|--------|------|
| TC_LOGIN_BIZ_002 | Login | Time-dependent | OTP expiry requires real wait | `login.spec.js` |
| _(future)_ | Payment | `ENV === 'uat'` | Live payment gateway | — |

---

## Guidelines

- Skip guards for UAT: `test.skip(process.env.ENV === 'uat', '...')`
- Skip guards for DEV-only: `test.skip(process.env.ENV !== 'dev', '...')`
- Never skip P0/P1 tests without explicit BA approval
- Log every skip guard here when added to a spec file
