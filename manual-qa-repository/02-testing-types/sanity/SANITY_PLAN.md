# Sanity Test Plan

**Purpose:** Verify specific feature/fix after targeted change — narrower than regression  
**Triggered by:** Bug fix, feature flag toggle, config change

---

## When to Run

- After a bug fix — run only TCs related to the fixed module
- After a config/CMS change — run CMS + affected downstream modules
- After auth/session changes — run login suite

---

## How to Run (by TC_ID)

```bash
# Run single TC
npx playwright test --config automation-repository/playwright.config.js -g "TC_LOGIN_FUNC_001" --headed

# Run module subset
npx playwright test tests/e2e/login.spec.js --config automation-repository/playwright.config.js --project=regression --headed --workers=1
```

---

## Sanity Log

| Date | Trigger | TCs Run | Pass | Fail | Notes |
|------|---------|---------|------|------|-------|
| — | — | — | — | — | — |
