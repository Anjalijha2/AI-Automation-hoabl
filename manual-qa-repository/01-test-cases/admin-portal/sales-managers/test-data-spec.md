# Test Data Specification — Sales Managers Module (Admin Portal)

**Module:** Sales Managers
**Portal:** XR Portal Admin
**Source TCs:** `TC_SM.md` (32 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value | Notes |
|------|-------|-------|
| UAT Mobile | `8888888888` | Static OTP-bypass admin |
| UAT OTP | `258369` | Static |
| Storage State | `automation-repository/fixtures/.auth/admin.json` | `npm run auth:setup` |
| JWT (API tests) | `process.env.ADMIN_JWT` | Falls back to extraction from `admin.json` |

---

## 2. Valid Inputs (Add / Edit SM Modal)

| Field | Valid Value | Notes |
|-------|------------|-------|
| First Name | `Tester` | Text |
| Last Name | `Anjali` | Text (may be blank in load test data) |
| Email | `test1@test.com` | RFC-5322 format |
| Phone | 10-digit unique number e.g. `9000000001` | Mobile number; merge key for bulk upload |
| Role | `Sales Manager` | Only confirmed value (Q-SM-003 open) |
| Assignable | Toggle ON/OFF | Default ON |
| Is Active | Toggle ON/OFF | Default ON |

---

## 3. Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error |
|-------|--------------|---------------|
| First Name | empty | "First Name is required" |
| Email | `invalid-email` | "Invalid email format" |
| Email | empty | "Email is required" |
| Phone | `123` | "Phone must be 10 digits" |
| Phone | `abcdefghij` | Rejected — numeric only |
| Phone | empty | "Phone is required" |
| Role | unselected | "Role is required" |
| Bulk file | `.txt` / `.csv` | "Only .xlsx accepted" |
| Bulk file | XLSX with row Phone=`123` | Row flagged invalid in result |

---

## 4. Bulk Upload XLSX Schema

| Col | Header | Valid | Notes |
|-----|--------|-------|-------|
| 0 | Role | `Sales Manager` | Fixed value |
| 1 | First Name | Text | — |
| 2 | Last Name | Text | — |
| 3 | Email | Email format | Uniqueness unclear (Q-SM-001) |
| 4 | Phone | 10-digit string | **Merge key** |
| 5 | IS_AVAILABLE | `1` or `0` | 1=appears in dropdowns |
| 6 | IS_ACTIVE | `1` or `0` | 1=can log in |

Sample download endpoint: `GET /api/v1/admin/sales-manager-sample`

---

## 5. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| UI | Admin session; >=1 SM exists (for table rendering) |
| FUNC (Add) | Unique unused phone number |
| FUNC (Edit/Deactivate) | At least 1 disposable SM record |
| FUNC (Search) | SM with phone `8888888888` and First Name `Tester` (load seed) |
| BIZ_003 (merge key) | Existing SM with phone `8888888888`; prepared XLSX with same phone |
| Settings/Masking | Admin session; coordinate before changing — system-wide effect |
| API | `ADMIN_JWT` populated |

---

## 6. Cleanup / Teardown

- SMs are **never deleted** (BRD §6 BR1). Soft-deactivate test SMs by setting `IS_ACTIVE=0` and `IS_AVAILABLE=0` after destructive tests.
- After masking-toggle tests: restore prior state (record before-state in test setup; restore in `afterEach`).
- After bulk upload merge tests: revert updated fields manually via Edit modal.

---

## 7. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Privacy masking is system-wide | Toggling Cost Masking affects ALL SMs | Restrict to non-prod runs; coordinate before run |
| No delete operation | Test SMs accumulate on UAT | Reuse fixed test SM via phone `9000000001`; deactivate not delete |
| Email uniqueness unclear (Q-SM-001) | Duplicate emails may pass | Assert observed behavior; do not assert uniqueness until confirmed |
| Settings save mechanism (Q-SM-002) | Auto-save vs explicit Save unclear | Detect both patterns; assert state persistence on modal reopen |
| Role values (Q-SM-003) | Only "Sales Manager" tested | Limit dropdown selection to known value |

---

## 8. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ENV` | Set to `uat` to enable gating | unset |
| `ADMIN_JWT` | Admin JWT for API tests | extracted from `admin.json` |
| `ALLOW_DESTRUCTIVE` | Allow masking-toggle/bulk-update tests | unset |
| `UAT_SM_TEST_PHONE` | Reusable test SM phone | `9000000001` |
