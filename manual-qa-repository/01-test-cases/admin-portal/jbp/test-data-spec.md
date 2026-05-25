# Test Data Specification — JBP Management Module (Admin Portal)

**Module:** JBP Management
**Portal:** XR Portal Admin + CP Portal (cross)
**Source TCs:** `TC_JBP.md` (29 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value | Notes |
|------|-------|-------|
| Admin Mobile | `8888888888` | Admin session |
| Admin OTP | `258369` | |
| Storage State | `automation-repository/fixtures/.auth/admin.json` | |
| CP Portal Mobile | `8888888888` | CP test login |
| CP Portal OTP | `147258` | Distinct from admin OTP |
| CP Storage State | `automation-repository/fixtures/.auth/channel-partner.json` | |
| ADMIN_JWT | extracted | |

---

## 2. Valid Inputs — Create Cycle

| Field | Valid Value |
|-------|-------------|
| Cycle Name | `Automation-Cycle-{timestamp}` (unique) |
| Start Date | today |
| End Date | today + 7 days |
| projectId | Xanadu Test Project ID |

---

## 3. Valid Inputs — CP JBP Form (14 fields)

| # | Field | Test Value |
|---|-------|-----------|
| 1 | Brokerage to be Earned | `10,00,000` |
| 2 | Net Booking Commitment | (dropdown — first option) |
| 3 | Manpower to deploy | `1` |
| 4 | List of activities | `Tele-calling`, `Digital` |
| 5 | Go live on digital | `Google` (reveals Google Budget) |
| 5a | Google Budget | `10000` |
| 6 | Total investment | `Upto 1 lakhs` |
| 7-13 | Required radios | default `No` |
| 14 | Registration Commitment | `1` |

---

## 4. Invalid / Boundary Inputs

| Field | Invalid Value | Expected |
|-------|--------------|----------|
| Cycle Name | empty | "Cycle Name is required" |
| End Date | < Start Date | "End Date must be after Start Date" |
| Registration Commitment | `abc` | Reject; numeric only |
| Edit Request reason | empty | "Reason is required" |
| Second Create Cycle (OPEN exists) | — | "Active Cycle Detected" popup |

---

## 5. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| FUNC_001 (create) | No existing OPEN cycle — close in beforeEach if needed |
| FUNC_002 (close) | OPEN cycle exists |
| FUNC_007 (CP submit) | OPEN cycle; CP not yet submitted for it |
| FUNC_009-010 (edit request) | Pending edit request exists |
| NEG_001 (Active Cycle Detected) | OPEN cycle exists |
| NEG_003 | CP already submitted |
| API | `ADMIN_JWT` populated |

---

## 6. Cleanup / Teardown

- After FUNC_001 (create): close created cycle to allow next test
- After FUNC_007 (CP submit): submission persists — coordinate next cycle creation
- Cycles are NOT deleted (no delete API) — accumulate over runs; use unique name with timestamp

---

## 7. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Only 1 OPEN cycle at a time | Serial execution required for cycle tests | Close existing in beforeAll |
| Closed cycle is irreversible | No undo for FUNC_002 | Plan test data; use disposable cycle names |
| Q-JBP-001 — Submissions/Edit Requests tab content unknown | Cannot fully assert tab content | Test tab activation only; defer content assertion |
| Q-JBP-002 — Edit flow scope unclear | Edit request TCs based on BRD §6 description only | |
| CP Portal OTP differs from Admin | Two distinct auth flows | Use separate storage state files |

---

## 8. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_JWT` | API auth | extracted |
| `CP_TEST_MOBILE` | CP portal login | `8888888888` |
| `CP_TEST_OTP` | CP portal OTP | `147258` |
| `UAT_PROJECT_ID` | Project for cycle creation | — |
| `ALLOW_DESTRUCTIVE` | Allow close-cycle / approve-reject tests | unset |
