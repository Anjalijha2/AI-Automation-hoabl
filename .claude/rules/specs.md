---
paths:
  - "tests/**/*.spec.js"
  - "tests/auth.setup.js"
---

# Spec File Rules

## Auth
Protected specs must declare:
```javascript
test.use({ storageState: 'src/fixtures/.auth/admin.json' });
```

## TC_ID Format
Two coexisting formats:
- Hand-written: `TC-MODULE-NNN` (hyphens) — e.g., `TC-TWR-001`
- Agent-generated: `TC_MODULE_TYPE_NNN` (underscores) — e.g., `TC_ALLOC_E2E_001`

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

Every `test()` block title must start with TC_ID.

## ENV Skip Guard
```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

## Timing Priority
1. `waitForSelector` — primary
2. `waitForLoadState('networkidle')` — after heavy API navigations
3. `waitForURL` — after redirects
4. `waitForTimeout` — LAST RESORT, must have inline comment

## Workers
Always use `--workers=1` with `--headed` — multiple headed windows conflict.
