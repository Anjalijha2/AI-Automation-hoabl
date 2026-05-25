# Test Data Specification — Customers Module (Admin Portal)

**Module:** Customers
**Portal:** XR Portal Admin
**Source TCs:** `TC_CUSTOMERS.md` (32 TCs)
**Last Updated:** 2026-05-17
**Owner:** QA Agent

---

## 1. Authentication

| Item | Value | Notes |
|------|-------|-------|
| UAT Mobile | `8888888888` | Static OTP-bypass account |
| UAT OTP | `258369` | Static (no real OTP delivery on UAT) |
| Storage State | `automation-repository/fixtures/.auth/admin.json` | Created by `npm run auth:setup` |
| JWT (API tests) | `process.env.ADMIN_JWT` | Optional; falls back to extraction from `admin.json` localStorage/cookies |

---

## 2. Test Data per TC Type

### FUNC (TC_CUST_FUNC_001..009)

| TC | Data Needed | Source / Notes |
|----|-------------|----------------|
| 001 | Valid admin storageState | `auth.setup.js` |
| 002 | Any non-Customers landing page | Defaults to admin root after login |
| 003 | A registered phone number | `9999999999` per TC; verify still exists on UAT before run |
| 004 | At least one `Cancelled` registration on UAT | Read-only filter, non-destructive |
| 005 | Baseline registration count | Read from KPIs on page load |
| 006 | **Disposable** registration in `Booked` status | DESTRUCTIVE: registration is cancelled and refunded ₹999 — irreversible per BRD §6 BR3. Coordinate with Allocation team to provision disposable `GHNG-XXXX` test records before run. Gated by `ENV !== 'uat'` OR `ALLOW_DESTRUCTIVE=1` env var. |
| 007 | Registration with `loanApprovalStatus = pending` or `null` | DESTRUCTIVE-ish: triggers SMS/WhatsApp via Kaleyra. Gated by `ALLOW_DESTRUCTIVE=1`. |
| 008 | None | Triggers a file download (`RegistrationData.xlsx`) — Playwright handles via `waitForEvent('download')` |
| 009 | None | Read-only refresh |

### UI (TC_CUST_UI_001..006)

| TC | Data Needed |
|----|-------------|
| 001 | None — pure rendering assertion on 6 KPI cards |
| 002 | Sufficient data to apply each allocation-status filter (UAT may not have all 4 → see Known Constraints) |
| 003 | At least 1 row in the table (so columns are populated) |
| 004 | None — regex on heading text |
| 005 | Viewport 1920×900 (configured in spec `test.use({ viewport })`) |
| 006 | None — checks button presence |

### VAL (TC_CUST_VAL_001..004)

| TC | Data Needed |
|----|-------------|
| 001 | Eligible Booked row (modal-close negative path; non-destructive — no submit) |
| 002 | None — opens page-size dropdown and inspects options |
| 003 | Filter dropdown must be openable |
| 004 | Registration with pending home loan (modal opened, toggle left OFF, submit — should NOT persist) |

### NEG (TC_CUST_NEG_001..004)

| TC | Data Needed |
|----|-------------|
| 001 | Fresh browser context (delete or skip storageState) |
| 002 | `0000000000` — guaranteed non-existent phone |
| 003 | Existing Cancelled registration row |
| 004 | Allocation = Cancelled + Process = KYC Completed (zero-match combo on UAT) |

### EDGE (TC_CUST_EDGE_001..003)

| TC | Data Needed |
|----|-------------|
| 001 | ≥100 registrations in dataset; page size = 100 |
| 002 | Special-char inputs: `!@#$%^&*()`, `abcd` |
| 003 | Disposable UAT tower in Config; admin must have Config edit access |

### REG (TC_CUST_REG_001..002)

| TC | Data Needed |
|----|-------------|
| 001 | Re-login after destructive action — same `8888888888`/`258369` |
| 002 | None — captures pre/post KPI snapshot |

### API (TC_CUST_API_001..004)

| TC | Data Needed | Notes |
|----|-------------|-------|
| 001 | Admin JWT | `GET /api/v1/admin/dashboard/all-buyers?page=1&limit=10` |
| 002 | Admin JWT | `GET /api/v1/admin/registration-status` |
| 003 | Admin JWT | `GET /api/v1/admin/dashboard/all-buyers?isDownload=1` — binary XLSX |
| 004 | Admin JWT + `UAT_REG_UNIT_ID` env var | `PUT /api/v1/admin/registration-units/:id/refund` — DESTRUCTIVE, gated by `ALLOW_DESTRUCTIVE=1` |

---

## 3. API Payload Schemas (from FRD §11)

### GET `/api/v1/admin/dashboard/all-buyers`

**Query:** `page` (int), `limit` (10|20|50|100), `isDownload` (0|1), plus filter params

**Response envelope:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [ /* Registration[] */ ],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "errors": null
}
```

When `isDownload=1`: response is `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`; binary XLSX body; no pagination.

### GET `/api/v1/admin/registration-status`

**Response envelope:**
```json
{
  "success": true,
  "data": {
    "registered": 0,
    "inactive": 0,
    "cancelled": 0,
    "kycPending": 0,
    "confirmed": 0,
    "activeTowers": 0
  }
}
```
Values must match the 6 KPI cards rendered on the page (cross-check with TC_CUST_UI_001).

### PUT `/api/v1/admin/registration-units/:id/refund`

**Path:** `:id` = registration-unit UUID
**Body:** `{}` (empty — server derives refund amount from BR3 = ₹999)

**Response envelope:**
```json
{
  "success": true,
  "message": "refunded successfully",
  "data": {
    "registrationUnitId": "uuid",
    "allocationStatus": "cancelled",
    "refundAmount": 999,
    "refundCreatedAt": "ISO-8601"
  }
}
```

Side effects (out-of-test-scope per project constraints):
- Mavis ERP sync triggered
- Kaleyra SMS/WhatsApp dispatched
- Python WebSocket cache invalidated
- Unit released back to `AVAILABLE` inventory

---

## 4. Known UAT Constraints

Documented in FRD §7 (Domain Red Flags) and the FRD Customers doc:

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| No `Sold` units on UAT | Allocation Status filter "Sold" returns 0; TCs cannot validate Sold flow | Skip Sold-specific assertions; TC_CUST_FUNC_004 uses Cancelled instead |
| No `Available` registrations on UAT | Cannot test green-field Allocation flow end-to-end from Customers screen | Out of scope here — covered in Allocation module |
| All registrations on UAT are old/stale | KPI counts may drift between runs | TCs compare *relative* values (before/after delta), not absolute |
| LeadSquared (LSQ) excluded | Home Loan Approval side effect on LSQ is not asserted | TC_CUST_FUNC_007 asserts only modal close + UI state |
| Mavis / Kaleyra / WebSocket excluded | Cancellation/Approval downstream effects not asserted | Asserted only via portal UI state |
| Active Towers KPI depends on Config | EDGE_003 requires Config module access | Skip if admin lacks Config permission |
| Pagination only loads when scrolled | `paginationBar` not in initial viewport | POM uses `scrollToPagination()` before interacting |

---

## 5. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ENV` | Set to `uat` to enable destructive-test gating | unset |
| `ALLOW_DESTRUCTIVE` | Override skip for destructive TCs (006, 007, API_004) | unset (skip on UAT) |
| `ADMIN_JWT` | Explicit JWT for API tests | falls back to extraction from `admin.json` |
| `UAT_REG_UNIT_ID` | Disposable registration-unit UUID for API_004 | required for API_004 |

---

## 6. Test Data Provisioning Checklist (per run)

Before executing destructive TCs (`ALLOW_DESTRUCTIVE=1`):

- [ ] At least 1 `Booked` disposable registration provisioned (`GHNG-XXXX` pattern)
- [ ] Disposable registration-unit UUID captured in `UAT_REG_UNIT_ID`
- [ ] At least 1 registration with `loanApprovalStatus = pending` exists
- [ ] Disposable UAT tower exists in Config (for EDGE_003)
- [ ] Admin session refreshed (`npm run auth:setup`) — JWT valid

For non-destructive read-only runs (default UAT run): no provisioning required.
