# Test Data Specification — Offers Module (Admin Portal)

**Module:** Offers
**Portal:** XR Portal Admin
**Source TCs:** `TC_OFFERS.md` (31 TCs)
**Last Updated:** 2026-05-19
**Owner:** BA Agent / QA Agent

---

## 1. Authentication

| Item | Value |
|------|-------|
| Admin Mobile | `8888888888` |
| Admin OTP | `258369` |
| Storage State | `automation-repository/fixtures/.auth/admin.json` |
| ADMIN_JWT | extracted |

---

## 2. Valid Inputs — Create Offer

| Field | Valid Value | Notes |
|-------|------------|-------|
| Offer Name | `Test Offer {timestamp}` | Max 100 chars; uniqueness not enforced |
| Offer Type | `Amount Based` or `Percentage Based` | Mutually exclusive |
| Amount | `5000` (positive integer INR) | Required if Amount Based |
| Percentage | `5` (0-100) | Required if Percentage Based |
| Description | Free text up to 500 chars | Optional |
| Start Date | today | <= End Date |
| End Date | today + 30 days | >= Start Date |
| Select Typology | empty OR one+ of: `1 Bed Growth Home`, `2 Bed Growth Home`, `2 Bed Peak Home`, `2 Bed Rise Home` | empty = applies to all |

---

## 3. Invalid / Boundary Inputs

| Field | Invalid Value | Expected |
|-------|--------------|----------|
| Offer Name | empty | Required-field error |
| Offer Name | 101 chars | Truncated to 100 |
| Description | 501 chars | Truncated to 500 |
| Amount | `-100` | Validation: positive only |
| Percentage | `150` | Validation: 0-100 only |
| Start > End | — | "Start Date must be <= End Date" |
| Empty form Submit | — | Multiple required errors |

---

## 4. UAT Test Data (observed 2026-05-08)

| Sr | Name | Amount | Status | offerCode |
|----|------|--------|--------|-----------|
| 10 | VK test | ₹10,000 | OFF | NULL |
| 9 | VC request | ₹75,000 | ON | VC_REQUEST |
| 8 | VC request | ₹75,000 | ON | VC_REQUEST |
| 7 | VC request | ₹75,000 | ON | VC_REQUEST |
| 3 | VC request | ₹50,000 | ON | VC_REQUEST |
| 1 | Home Loan Discount | ₹10,000 | OFF | HOME_LOAN |

---

## 5. Pre-conditions per TC Class

| TC Class | Required State |
|----------|----------------|
| UI / FUNC create | Admin session |
| FUNC_005-006 (edit/delete) | Disposable offer; cleanup in afterEach |
| FUNC_003-004 (toggle) | Active offer + non-prod env (avoid disrupting live campaigns) |
| EDGE_001 (Sr.No gaps) | Historical deletions exist (UAT confirmed) |
| BIZ_001 (offerCode) | UAT data has system offers (UAT confirmed) |
| API | `ADMIN_JWT` populated |

---

## 6. Cleanup / Teardown

- Created offers: DELETE in afterEach OR use unique timestamped names
- Deleted offers: cannot be restored (paranoid soft-delete)
- Toggled offers: snapshot state in beforeEach; restore in afterEach
- Avoid toggling system offers (HOME_LOAN / VC_REQUEST) — coordinate with team

---

## 7. Known Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| Toggle OFF immediate, no confirmation | CRITICAL — affects active buyer sessions | Gate FUNC_003-004, BIZ_004 with `ALLOW_DESTRUCTIVE=1`; non-prod only |
| Deletion is permanent | Test offers accumulate as soft-deleted | Soft delete via paranoid; no restore |
| Q-OFFERS-003 (mid-booking re-price) | Live impact unconfirmed | Cross-portal pricing TC out of automated scope |
| Q-OFFERS-004 (end-date mid-booking) | Unconfirmed | Skip in current scope |
| No search/filter on list (Q-OFFERS-001) | Iterate via API or scroll | Use API for setup |
| Edit/Delete icons use Ant Design `<span aria-label>` not `<img>` | Selector pitfall | Always `:has([aria-label="edit"])` |

---

## 8. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_JWT` | API auth | extracted |
| `ALLOW_DESTRUCTIVE` | Allow toggle / delete tests | unset |
| `UAT_DISPOSABLE_OFFER_NAME_PREFIX` | Prefix to identify cleanup-safe offers | `Automation-Offer-` |
