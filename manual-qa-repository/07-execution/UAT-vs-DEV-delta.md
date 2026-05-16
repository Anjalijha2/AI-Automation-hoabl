# UAT vs DEV — Test Delta

**Purpose:** Track which tests run on UAT vs DEV — highlight gaps

---

## Delta Matrix

| TC ID | Module | UAT | DEV | Gap Reason |
|-------|--------|-----|-----|-----------|
| TC_LOGIN_FUNC_001 | Login | ✅ | ⏳ | DEV env not configured yet |
| TC_LOGIN_BIZ_002 | Login | ❌ (skip) | ❌ (skip) | Time-dependent — OTP expiry |
| _(payment TCs)_ | Payment | ❌ (skip) | ✅ | Mock gateway on DEV only |

---

## Legend

- ✅ Runs and passes
- ⏳ Pending — not yet run in this env
- ❌ Skipped — guard active
- ⚠️ Flaky — intermittent results

---

## Notes

- UAT is primary regression environment
- DEV used for early integration validation
- Payment-related TCs: DEV mock gateway, UAT skipped (live)
