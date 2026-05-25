# Test Data Specification — Payment Transactions Module (Admin Portal)

**Module:** Payment Transactions
**Portal:** XR Portal Admin
**Source TCs:** `TC_PAYMENT.md` (31 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value | Notes |
|------|-------|-------|
| UAT Mobile | `8888888888` | Static admin |
| UAT OTP | `258369` | Static |
| Storage State | `automation-repository/fixtures/.auth/admin.json` | |
| JWT (API) | `process.env.ADMIN_JWT` | |

---

## 2. Valid Filter Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Source | `Online easebuzz`, `Online razorpay`, `Offline` | Dropdown values |
| Status | `initiated`, `pending`, `completed`, `failed`, `cancelled`, `dropped`, `bounced`, `refunded` | Per BRD §5 |
| Payment Type | `Allocation`, `Milestone` | Others unconfirmed (Q-TXN-002) |
| Method | `Mobile Wallet`, `Cheque`, `RTGS`, `NA` | |
| Date Range | Start ≤ End; ISO date strings | |
| Search | Customer Name / Phone / Registration No. (partial match) | |

---

## 3. Invalid / Boundary Inputs

| Field | Invalid Value | Expected Behaviour |
|-------|--------------|--------------------|
| Date Range | End < Start | Validation error or auto-normalize |
| Date Range | 365-day window | Loads without error; may be slow |
| Search | Special chars `!@#$%` | Returns empty result; no JS error |
| Gateway config | both unchecked | 400 Bad Request — "At least one payment gateway must remain active" |

---

## 4. UAT Test Data (observed 2026-05-08)

| Field | Example |
|-------|---------|
| Internal ID | `PT-0015304` |
| Registration No. | `GHNG-1000008563` |
| External Transaction ID | `S260508075F9CF` |
| Customer Name | `Anjali RegressionOfUAT` |
| Amount Paid | ₹6,97,961 |
| Total Records | 10,226+ |

---

## 5. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| UI / FUNC | Admin session; >=1 transaction in dataset |
| FUNC_002-003 (filters) | Multiple transactions across each enum value |
| FUNC_004 (date range) | Transactions in last 7 days |
| FUNC_011 (export) | Browser download permission granted |
| VAL_003 / API_004 (gateway guard) | Both gateways currently enabled (will be re-enabled after) |
| BIZ_003 (gateway change) | Non-production OR `ALLOW_DESTRUCTIVE=1`; restore in teardown |
| BIZ_004 (cross-module) | Completed transaction with valid Registration + Unit IDs |
| API | `ADMIN_JWT` populated |

---

## 6. Cleanup / Teardown

- Gateway configuration: snapshot current state in beforeAll, restore in afterAll
- No DB writes performed by module (read-only) — no transaction-level cleanup needed
- Export-downloaded files: clean up `test-results/downloads/`

---

## 7. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Gateway config change has NO UI confirmation (BRD §9) | Easy to accidentally disable | Gate BIZ_003 behind `ALLOW_DESTRUCTIVE=1` |
| Disabling gateway mid-campaign breaks active sessions | CRITICAL | Run gateway TCs only outside campaign windows |
| Detail view not implemented (Q-TXN-007) | Eye icon shows tooltip only | Assert tooltip text; no drill-down testable |
| Export format unconfirmed (Q-TXN-001) | Cannot assert exact MIME | Assert download event triggered; defer format-specific assertions |
| Offline payment entry mechanism unconfirmed (Q-TXN-003) | Cannot generate offline test data | Use existing UAT offline records only |
| Page size dropdown options unconfirmed (Q-TXN-006) | Test only confirmed default = 10 | |

---

## 8. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ENV` | Environment indicator | unset |
| `ADMIN_JWT` | API auth | extracted from `admin.json` |
| `ALLOW_DESTRUCTIVE` | Allow gateway-config change tests | unset |
| `UAT_TXN_CUSTOMER_NAME` | Search test name | `Anjali` |
| `UAT_TXN_REGISTRATION_NO` | Search test reg no | `GHNG-1000008563` |
