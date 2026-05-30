# Sprint Log

**Project:** XR Portal (all portals)
**Model:** Sprint-wise · Portal-wise · Documentation → Test Cases → Automation

---

## Active Sprint — Sprint 5: Full-Stack Automation

| Track | Status | Notes |
|-------|--------|-------|
| Track 1 — TC catalogue + BRD/FRD audit | ✅ Done | 1,728 TCs, ~98% Type-tagged, 22 FSD bugs catalogued |
| Track 2 — Locator maps + POMs | ✅ Done | 4 portal maps (213/85/55/64 elements), 33 POMs scaffolded |
| Track 3 — Playwright specs | 🔄 In Progress | 24/32 modules done after wave 6 (Customers admin pre-existing + 23 new) |
| Track 4 — Spec execution + reporting | ⏳ Pending | All specs syntax-clean, awaiting batch run |

---

## Sprint 5 Wave Log (Track 3 — Playwright Specs)

### Wave 1 — 2026-05-29 — Login per portal (3 portals, admin pre-existing)
- SM Login: 29 tests (25/35 TCs)
- CP Login: 25 tests (19/47 TCs)
- Buyer Login: 27 tests (27/38 TCs)
- **Total:** 81 tests / 9 files

### Wave 2 — 2026-05-29 — Mixed critical modules
- Admin Sales Managers: 25 tests
- SM Callback Requests: 40 tests
- CP Leads Management: 23 tests
- Buyer Home Dashboard: 27 tests
- **Total:** 115 tests / 8 files

### Wave 3 — 2026-05-29 / 2026-05-30 — Core workflows
- Admin Allocation: 26 tests
- Buyer KYC: 28 tests (incl. BUG-KYC-001/004/005/006 refs)
- CP Customer Registration: 20 tests
- SM Physical Allocation: 18 tests (incl. BUG-KYC-001 ref)
- **Total:** 92 tests / 8 files

### Wave 4 — 2026-05-30 — Inventory + KYC
- Admin Towers: 24 tests
- Buyer Allocation Experience: 23 tests
- CP KYC Assistance: 20 tests (BUG-CPK-03 ref)
- SM Tower Heatmap: 17 tests
- **Total:** 84 tests / 8 files. SM portal fully covered (4/4).

### Wave 5 — 2026-05-30 — Payments + JBP + Unit Details
- Admin Payment Transactions: 20 tests
- Admin JBP: 23 tests (BUG-JBP-001/002/003 refs)
- CP JBP Submission: 19 tests (BUG-CP-006 ref)
- Buyer Unit Details: 20 tests
- **Total:** 84 tests / 8 files

### Wave 6 — 2026-05-30 — Offers + CP + Home Loan + Pay Schedule (in progress)
- Admin Offers, Admin Channel Partners, Buyer Home Loan, Buyer Payment Schedule
- POMs all enriched · partial specs landed · finisher agents running

---

## Track-Wide Milestones (Sprint 5)

| Date | Milestone |
|------|-----------|
| 2026-05-25 | FSD corrections audit completed across 4 portals (BRD/FRD updated) |
| 2026-05-26 | Excel reorganized — module-sheet layout with type-bifurcated banners |
| 2026-05-28 | TC Type tagging at 98% (1,691 / 1,728 TCs) |
| 2026-05-29 | DB connection wired — MySQL UAT + 10 query modules + smoke spec |
| 2026-05-29 | Locator maps live-crawl pipeline + 4 maps |
| 2026-05-29 | POM scaffolder + 30 generated POMs |
| 2026-05-29 | Auth sessions refreshed + buyer URL map corrected |
| 2026-05-29 | BUG_TRACKER catalogue — 22 FSD-verified bugs across 9 modules |
| 2026-05-30 | Specs wave 3 + 4 dispatched in parallel batches |

---

## Completed Historical Sprints

### Sprint 4 — Customers (Admin) — closed earlier
- Customers POM + 6 spec types (e2e, ui-ux, regression, smoke, api, db) — hand-written
- Bugs: BUG_010 (open)

### Sprint 3 — Config / CMS
- Phase 1 Documentation: ✅ 2026-04-01
- Bugs: BUG_009 (closed)

### Sprint 2 — Towers + Allocation
- Phase 1 Documentation: ✅ 2026-03-01
- Bugs: BUG_005, BUG_006, BUG_007, BUG_008 (all closed)

### Sprint 1 — Login (Admin)
- Phase 2 Manual TCs: ✅ 2026-05-16
- TCs: 22 hand-written
- Bugs: BUG_001, BUG_002 (both closed)

---

## Sync Pipeline Runs

### Sync Run — 2026-05-21 (Step 3 — QA Agent Manual)
Locator map v1.3.4 → v1.4.0. Customers TC updated (ADM_CUST_007). 8/9 modules cleared, milestone deferred.

### Sync Run — 2026-05-29 (full pipeline manual replay)
- BRD/FRD: source-verified across 4 portals (Epinet/least-loaded/Azure/Botspice)
- Test cases: reorganized, type-tagged, Excel module-sheet layout
- Locators: live-crawl, 4 maps, 30 POMs scaffolded
- Specs: 3 waves (288 tests, 25 files) committed
- Bugs: 22 FSD-source-verified entries catalogued

---

## Sprint Template

```
Sprint N — <Portal Name>
  Phase 1: Portal Documentation     ⏳ / ✅
  Phase 2: Manual Test Cases         ⏳ / ✅  (BA sign-off required)
  Phase 3: Automation Scripts        ⏳ / ✅
  Bugs: BUG_NNN, ...
```
