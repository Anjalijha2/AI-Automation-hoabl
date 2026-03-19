# Defect Tracker

**Last updated:** 15/3/2026
**Maintained by:** Agent 5 — Defect Tracking Agent
**Total Open Bugs:** 0

---

## BUG_001

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_001 |
| **Module**         | CUSTOMERS |
| **Severity**       | High |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_001 |
| **Expected**       | Test "TC_CUST_001 | KPI — Registered Count Validation" should PASS |
| **Actual**         | Was: `.ant-statistic` class not in DOM → TimeoutError |
| **Fix**            | Switched to `getByRole('heading') + xpath sibling` + fixed `getTableRecordCount()` to read `h3 "X Registration Records"` heading |

---

## BUG_002

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_002 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_002 |
| **Expected**       | Test "TC_CUST_002 | KPI — Inactive Count Validation" should PASS |
| **Actual**         | Was: flaky — KPI card read before data loaded (returned 0) |
| **Fix**            | Added `waitForNetworkIdle()` in `navigate()` to ensure KPI data is loaded |

---

## BUG_003

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_003 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_003 |
| **Expected**       | Test "TC_CUST_003 | KPI — Cancelled Count Validation" should PASS |
| **Actual**         | Was: `getTableRecordCount()` returning 10 (row fallback) instead of 964 |
| **Fix**            | Fixed `getTableRecordCount()` to read `h3 "X Registration Records"` heading |

---

## BUG_004

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_004 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_004 |
| **Expected**       | Test "TC_CUST_004 | KPI — KYC Pending Count Validation" should PASS |
| **Actual**         | Was: filter OK button timeout — `.first()` picked hidden closed-dropdown OK button |
| **Fix**            | `clickOpenFilterOkBtn()` scoped to `.ant-dropdown:not(.ant-dropdown-hidden)` |

---

## BUG_005

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_005 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_005 |
| **Expected**       | Test "TC_CUST_005 | KPI — Confirmed Count Validation" should PASS |
| **Actual**         | Was: same as BUG_004 — stale hidden OK button timeout |
| **Fix**            | Same fix as BUG_004 |

---

## BUG_006

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_006 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_006 |
| **Expected**       | Test "TC_CUST_006 | KPI — Active Towers Validation" should PASS |
| **Actual**         | Was: `.ant-statistic` selector — TimeoutError |
| **Fix**            | Switched to `getByRole('heading', { name: 'Active Towers' }) + xpath sibling` |

---

## BUG_007

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_007 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_007 |
| **Expected**       | Test "TC_CUST_007 | Cancel Registration Flow" should PASS |
| **Actual**         | Was: invalid CSS selector `.ant-message-success, text=...` |
| **Fix**            | Replaced with `.ant-message-notice.filter({ hasText: 'refunded successfully' })` |

---

## BUG_008

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_008 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_008 |
| **Expected**       | Test "TC_CUST_008 | Home Loan Approval Flow" should PASS |
| **Actual**         | Was: invalid CSS selector — same pattern as BUG_007 |
| **Fix**            | Same toast selector fix |

---

## BUG_009

| Field              | Value |
|--------------------|-------|
| **TC_ID**          | TC_CUST_014 |
| **Module**         | CUSTOMERS |
| **Severity**       | Low |
| **Status**         | Resolved |
| **Steps**          | See manual-test-cases/TC_CUSTOMERS.md → TC_CUST_014 |
| **Expected**       | Test "TC_CUST_014 | Reset Filters Functionality" should PASS |
| **Actual**         | Was: TimeoutError waiting for inline filter input (filters not yet toggled on) |
| **Fix**            | Added `isVisible()` guard in `resetAllFilters()` before attempting reset |

---

