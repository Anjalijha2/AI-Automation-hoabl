# Test Data Specification — Allocation Module (Admin Portal)

**Module:** Allocation
**Portal:** XR Portal Admin
**Source TCs:** `TC_ALLOCATION.md` (33 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value |
|------|-------|
| Admin Mobile | `8888888888` |
| Admin OTP | `258369` |
| Storage State | `automation-repository/fixtures/.auth/admin.json` |
| Customer Test Mobile (Mamta) | `1111111207` |
| Customer Test OTP | `147258` |
| ADMIN_JWT | extracted from admin.json |

---

## 2. Valid Inputs — Create Campaign

| Field | Valid Value | Notes |
|-------|------------|-------|
| Project | `Xanadu Test Project` | UAT project |
| Campaign Name | `Static Camp-Automation Test {timestamp}` | Must be unique per run |
| Allocation Type | `Static` | Default; do not change for automation |
| Start Time IST | now + 4 min | Min 3 min from now (BR1) |
| End Time IST | Start + 5 min (or more) | Must be after Start |
| Description | Optional text | — |

---

## 3. Invalid / Boundary Inputs

| Field | Invalid Value | Expected Behaviour |
|-------|--------------|--------------------|
| Start Time | now + 1 min | Red banner: "Start time must be at least 3 minutes from now..." |
| End Time | < Start | Validation error |
| Campaign Name | empty | Required-field validation |
| Project | unselected | Required-field validation |
| Campaign Name | duplicate | Reject duplicate (per FRD §3 uniqueness) |

---

## 4. Campaign Status Reference

| Status | From | Reachable Via |
|--------|------|---------------|
| Upcoming | (initial) | Save Campaign |
| Active | Upcoming | Auto at Start Time |
| Completed | Active | Auto at End Time |
| Stopped | Active | Manual Stop |
| Cancelled | Upcoming | Manual Cancel |
| Failed | Active | System error |

---

## 5. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| FUNC_001-002 (create) | No conflicting Active campaign; admin session |
| FUNC_003 (cancel) | At least one Upcoming campaign disposable |
| FUNC_004 (stop) | One Active campaign (gate with UAT 1-active limit) |
| BIZ_001 (tower prereq) | All towers Inactive in Config; coordinate with Towers team |
| BIZ_002 (post-campaign) | Completed campaign with mix of paid + unpaid registrations |
| BIZ_004 (auto-complete) | Active campaign with End within 2 min |
| API | Admin JWT |
| Customer portal cross-checks | Mamta test account `1111111207` |

---

## 6. Cleanup / Teardown

- After FUNC_001 (create): cancel the created Upcoming campaign in afterEach
- After FUNC_004 (stop): no rollback — Stopped is terminal
- After E2E_001: campaign in Stopped state; deferred cleanup acceptable

---

## 7. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| 1 Active campaign limit on UAT | Cannot run multiple stop/active tests in parallel | Serial execution; reuse Active campaign across TCs |
| Easebuzz bot detection (Q-ALLOC-001) | Payment success cannot be automated | ENV SKIP payment-completion TCs on UAT |
| No Sold units on UAT (Q-ALLOC-002) | TC-CST-009 unverifiable | Skip Sold-unit specific assertions |
| No Available registrations outside Active window | Cannot test green-field flow | Schedule TC inside Active window only |
| Date picker requires click + scroll (not type) | Standard fill fails | POM uses click-cell + scroll-time helper |
| Two project selectors on page | Wrong one selected by .ant-select | Always target filter via `.ant-select-selection-placeholder` |
| Add Units drawer leak | Drawer persists | Close via `.ant-drawer-close` in afterEach |

---

## 8. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ENV` | Set `uat` to gate destructive TCs | unset |
| `ADMIN_JWT` | API auth | extracted from `admin.json` |
| `UAT_PROJECT_NAME` | Project for create | `Xanadu Test Project` |
| `ALLOW_DESTRUCTIVE` | Allow stop/cancel of pre-existing campaigns | unset |
| `CUSTOMER_TEST_MOBILE` | Buyer login for cross-portal | `1111111207` |
