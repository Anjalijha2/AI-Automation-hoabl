# Environment Strategy

**Project:** XR Portal Admin QA

---

## Environment Matrix

| Environment | Purpose | Stability | Test Types | Auth |
|-------------|---------|-----------|-----------|------|
| DEV | Development smoke | Low | Smoke, sanity | TBD |
| UAT | Acceptance testing | High | Smoke, regression, E2E | Static OTP |
| PROD | Production | Highest | Smoke only (read-only) | Real OTP |

---

## Test Execution Policy

| Test Type | DEV | UAT | PROD |
|-----------|-----|-----|------|
| Smoke | ✅ | ✅ | ✅ (read-only) |
| Sanity | ✅ | ✅ | ❌ |
| Regression | ❌ | ✅ | ❌ |
| E2E | ❌ | ✅ | ❌ |
| Exploratory | ✅ | ✅ | ❌ |

---

## ENV Variable Management

```bash
# .env (git-ignored)
BASE_URL=https://uat-web.xrportal.in/admin

# Override at runtime
BASE_URL=https://dev.xrportal.in/admin npm run test:smoke
```

---

## Skip Guards Reference

```javascript
// Skip on UAT — live gateway side effect
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');

// UAT-only tests
test.skip(process.env.ENV !== 'uat', 'UAT-only test');
```
