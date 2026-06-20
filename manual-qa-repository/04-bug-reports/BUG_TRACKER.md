# Bug Tracker

**Project:** XR Portal (all portals)
**Formats in use:**
- `BUG_NNN` — sequential project-wide IDs (legacy)
- `BUG-<MODULE>-NNN` — FSD-source-verified gaps (added 2026-05-29 from TC FSD-corrections)

**Next sequential ID:** BUG_011

---

## Open Bugs — FSD-Source-Verified (from TC corrections)

These are documented in TC markdown files under `[BUG-REF: ...]` headers. Each entry traces to a backend behaviour observed in code review and contradicting BRD/FRD intent.

### Auth (Admin Login)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-AUTH-001 | P1 (security) | Unlimited wrong OTP attempts — no lockout, no rate limit | ADM_LGN_025 |
| BUG-AUTH-002 | P2 (docs) | OTP delivered via Epinet SMS, NOT Kaleyra as BRD claims | ADM_LGN_FSD_041 |
| BUG-AUTH-003 | P1 (security) | OTP generated with `Math.random()` — not cryptographically secure | ADM_LGN_FSD_042 |
| BUG-AUTH-004 | P1 (security) | OTP stored as plaintext on `users.otp` column (no hashing) | ADM_LGN_FSD_043 |

### KYC (Buyer + SM physical-allocation)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-KYC-001 | P1 (security) | KYC PDF upload has NO file size limit (multer cap commented out) | BYR_KYC, SM_ALLOC_FSD_020 |
| BUG-KYC-002 | P2 (security) | Debug route `/cronPdfGenerationJob` exposed without auth | BYR_KYC |
| BUG-KYC-004 | P3 | `submit-kyc` idempotent path returns different response shape vs create path | BYR_KYC_037 |
| BUG-KYC-005 | P2 | Partial failure returns HTTP 207 with `success:true` — tests must assert status code not field | BYR_KYC_038 |
| BUG-KYC-006 | P3 | "Token verification in progress" error also returned when `lsqBookingActivityId` missing — ambiguous | BYR_KYC |

### SM (Callback Requests)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-SM-001 | P1 (functional) | Round-robin auto-assign DISABLED — SM Admin always assigns to self | SM_CB_FSD_135 |
| BUG-SM-002 | P2 (functional) | `COMPLETED` state is unreachable — falls back to CONFIRMED, buyer feedback notification skipped | SM_CB_FSD_136 |

### Home Loan (Buyer)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-LOAN-001 | P3 | `approved` (lowercase) state is unreachable in live code | BYR_LOAN_FSD_037 |

### Payment Schedule (Buyer)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-PAY-001 | P2 | Milestone status `FAILED` unsupported by model — write triggers `Data truncated` | BYR_PAY_FSD_027 |

### Home Dashboard (Buyer)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-DASH-003 | P2 | `registrationCount` value does NOT auto-increment with new registrations | BYR_DASH |
| BUG-DASH-004 | P3 | Project ID hardcoded: production=1, non-prod=2 — multi-project rollout requires code change | BYR_PROJ |

### JBP (Admin)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-JBP-001 | P2 | WhatsApp template `${+91}` template-string emits literal `"91"` (no `+`) | ADM_JBP_FSD_041 |
| BUG-JBP-002 | P3 | Approve flow clamps `editableUntil` to cycle `endDate` | ADM_JBP_FSD_047 |
| BUG-JBP-003 | P2 | `submitJbp` NPE on null cycle — `jbpCycle.endDate` read before null check | ADM_JBP_FSD_050 |

### CP (Channel Partner)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-CP-006 | P3 | `isJbpSubmitted` count includes EXPIRED rows — version-bump drift | CP_JBP_023 |
| BUG-CPK-03 | P3 | WhatsApp template `${+91}${phone}` renders as `"91<phone>"` (no `+`) | CP_KYC |

### Config (Admin)

| Bug ID | Severity | Title | Source TC |
|--------|----------|-------|-----------|
| BUG-CFG-001 | P3 | "2 Bed Peak Home" is always force-disabled | ADM_CFG_FSD_052 |
| BUG-CFG-002 | P2 (data integrity) | `updateCustomerActions` has no wrapping transaction — partial-commit risk | ADM_CFG_FSD_054 |

---

## Open Bugs — Sequential

| Bug ID | Module | Severity | Title | Reported | Assigned | Status |
|--------|--------|----------|-------|----------|----------|--------|
| [BUG_010](UAT/open/BUG_010-reg-status-validation.md) | Registration | P2 | Registration status validation skipped on empty submit | 2026-04-18 | — | Open |
| BUG_011 | Customers | P2 | Cancel Registration: 400 "campaign is active" is swallowed silently (no error toast) | 2026-06-20 | — | Open |
| BUG_012 | Customers | P3 | Home Loan Approval: Submit button enabled while approval toggle is OFF (FRD says it should be disabled) | 2026-06-21 | — | Open |

### BUG_011 — Cancel Registration shows NO error when blocked by active campaign

**Found:** 2026-06-20 during TC_CUST_FUNC_047 destructive run (reg `GHNG-1000008364-P`, unit id 10393).

**Steps:** Customers → search 8888888888 → row `-P` (Registered) → trash icon → "Confirm Refund" popup → click red **Cancel Registration**.

**Observed:** Button fires `PUT .../admin/registration-units/10393/refund` (body `{}`, valid Bearer token) → **HTTP 400** with response:
`{"success":false,"message":"Cannot refund registration-unit when campaign is active","data":[],"errors":null}`
The modal stays open, **no error toast/message is shown to the admin**, and the row remains Registered.

**Root cause (confirmed via agent-browser network capture):** the backend correctly enforces a business rule — refund/cancel is disabled while an allocation campaign is active (the "Allocation Opened" banner is showing). The empty `{}` request body is what the UI itself sends; it is NOT a defect.

**THE DEFECT (P2 — UX):** the 400 is **silently swallowed** — the admin gets zero feedback that the cancel was rejected. It looks like nothing happened. A blocked mutating action must surface the server message ("Cannot refund registration-unit when campaign is active"). Same rule family as TC_CUST_FUNC_100 (Cancel Unit blocked while campaign open).

**Impact on automation:** TC_CUST_FUNC_047 can only complete a real cancel when NO allocation campaign is active. The test is made campaign-aware: it skips with a clear reason when the 400 "campaign is active" is detected, and passes (success toast) when no campaign is active.

---

## Closed Bugs

| Bug ID | Module | Severity | Title | Resolved | Sprint |
|--------|--------|----------|-------|----------|--------|
| BUG_001 | Login | P1 | OTP input not appearing after Send OTP click | 2026-02-15 | Sprint 1 |
| BUG_002 | Login | P2 | Mobile field accepts non-numeric characters | 2026-02-16 | Sprint 1 |
| BUG_003 | Customers | P2 | Customer list pagination broken at page 3 | 2026-02-20 | Sprint 1 |
| BUG_004 | Customers | P3 | Search results not cleared on empty search submit | 2026-02-22 | Sprint 1 |
| BUG_005 | Towers | P1 | Unit availability not updating after allocation | 2026-03-05 | Sprint 2 |
| BUG_006 | Towers | P2 | Floor filter dropdown not loading on first visit | 2026-03-07 | Sprint 2 |
| BUG_007 | Allocation | P1 | Allocation confirmation modal not closing on success | 2026-03-12 | Sprint 2 |
| BUG_008 | Allocation | P2 | Status filter "Cancelled" returns empty even with data | 2026-03-14 | Sprint 2 |
| BUG_009 | Config | P3 | CMS banner upload fails silently for >2MB files | 2026-04-10 | Sprint 3 |

---

## Severity Definitions

| Level | Definition |
|-------|-----------|
| P0 | Blocker — portal unusable, no workaround |
| P1 | Critical — core flow broken, workaround exists |
| P2 | Major — significant feature broken |
| P3 | Minor — cosmetic or low-impact |

---

## Bug Metrics Summary

| Sprint | Total Bugs | P0 | P1 | P2 | P3 | Resolved | Open |
|--------|-----------|----|----|----|----|----------|------|
| Sprint 1 | 4 | 0 | 1 | 2 | 1 | 4 | 0 |
| Sprint 2 | 4 | 0 | 2 | 1 | 1 | 4 | 0 |
| Sprint 3 | 1 | 0 | 0 | 0 | 1 | 1 | 0 |
| Sprint 4 | 1 | 0 | 0 | 1 | 0 | 0 | 1 |
| **Total (legacy)** | **10** | **0** | **3** | **4** | **3** | **9** | **1** |

### FSD-Verified Bugs (2026-05-29 audit)

| Module | Count |
|--------|-------|
| AUTH | 4 |
| KYC | 5 |
| SM | 2 |
| LOAN | 1 |
| PAY | 1 |
| DASH | 2 |
| JBP | 3 |
| CP | 2 |
| CFG | 2 |
| **Total** | **22** |
