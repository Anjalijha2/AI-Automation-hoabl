# Sprint 1 — Execution Summary

**Sprint:** Sprint 1  
**Portal:** Login  
**Environment:** UAT  
**Run Date:** 2026-02-15  
**Executed By:** QA Team

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs | 22 |
| Passed | 18 |
| Failed | 3 |
| Skipped | 1 |
| Pass Rate | 81.8% |

---

## Failed Tests

| TC ID | Title | Severity | Bug ID |
|-------|-------|----------|--------|
| TC_LOGIN_FUNC_001 | OTP input not appearing | P1 | BUG_001 |
| TC_LOGIN_VAL_005 | Non-numeric mobile accepted | P2 | BUG_002 |
| TC_LOGIN_EDGE_003 | Multiple OTP clicks — no debounce | P2 | — |

---

## Skipped Tests

| TC ID | Reason |
|-------|--------|
| TC_LOGIN_BIZ_002 | OTP expiry — time-dependent, skipped in UAT |

---

## Notes

- BUG_001 fixed in next build; BUG_002 fix pending
- Auth setup (`auth:setup`) works correctly
- Session persistence confirmed

---

## Attachments

- `reports/html-report/` (local, not committed)
- `reports/results.json` (local, not committed)
