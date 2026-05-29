# Task Tracker

**Project:** XR Portal (all portals)
**Last Updated:** 2026-05-29

---

## In Progress

| Task | Module / Sprint | Assigned | Started |
|------|----------------|----------|---------|
| Track 3 wave 2 — CP Leads POM + specs | CP Leads / Sprint 5 | qa_agent | 2026-05-29 |

---

## Pending

### Track 3 — Remaining module specs (23 of 32 modules)

| Module | Portal | TC count | Priority |
|--------|--------|----------|----------|
| Customers | Admin | 100 | Already exists (hand-written) |
| Payment Transactions | Admin | 52 | High |
| Allocation | Admin | 53 | High |
| Towers | Admin | 45 | High |
| JBP | Admin | 55 | Medium |
| Offers | Admin | 47 | Medium |
| Channel Partners | Admin | 50 | Medium |
| Admin CMS | Admin | 41 | Medium |
| Config | Admin | 68 | Medium |
| KYC | Buyer | 68 | High |
| Unit Details | Buyer | 61 | High |
| Project Information | Buyer | 52 | Medium |
| Payment Schedule | Buyer | 28 | Medium |
| Home Loan | Buyer | 52 | Medium |
| Allocation Experience | Buyer | 73 | High |
| Callback Request | Buyer | 58 | Medium |
| Support Tickets | Buyer | 44 | Low |
| Work Progress | Buyer | 47 | Low |
| Customer Registration | CP | 40 | High |
| KYC Assistance | CP | 43 | Medium |
| JBP Submission | CP | 47 | Medium |
| Project Information | CP | 67 | Low |
| Physical Allocation | SM | 42 | Medium |
| Tower Heatmap | SM | 30 | Low |

### Other backlog

| Task | Priority | Notes |
|------|----------|-------|
| API specs across modules | Medium | tests/api/<module>.api.spec.js |
| DB specs across modules | Medium | tests/db/<entity>.db.spec.js — 8 query modules ready |
| Regression specs — cross-module flows | Medium | tests/regression/ |
| Cross-browser specs — critical flows | Low | tests/cross-browser/ |
| Locator map deep-crawl — buyer (5 modules @ 2 elements) | Medium | Need registration-ID context navigation |
| Locator map deep-crawl — SM tower-heatmap, physical-allocation | Low | Need active campaign / customer fixtures |
| Locator descriptions enrichment | Low | All crawled entries have empty `description` |
| Fix 22 FSD-verified bugs (BUG-AUTH-001..004 etc.) | Critical (security) | See BUG_TRACKER.md |
| Sync pipeline `npm run sync` end-to-end | Low | External source repos not local |

---

## Completed (Recent — 2026-05-26 to 2026-05-29)

| Task | Module / Sprint | Completed |
|------|----------------|-----------|
| Excel reorganize — module-sheet layout with type-bifurcated banners | All / TC Sprint | 2026-05-26 |
| TC Type tagging — 98% coverage across 32 markdown files (1,691 / 1,728 TCs) | All / TC Sprint | 2026-05-28 |
| FSD corrections audit — 4 portals BRD/FRD updated with source-verified facts | All | 2026-05-25 |
| DB connection wired — MySQL UAT read-only + 10 query modules | DB Layer | 2026-05-29 |
| DB smoke spec (5 TCs pass) | DB Layer | 2026-05-29 |
| Locator maps — live-crawl pipeline + 4 portal maps | All / Track 2 | 2026-05-29 |
| POM scaffolder — 30 POMs generated from locator maps | All / Track 2 | 2026-05-29 |
| Buyer URL map corrected (/home, /allotment, /homeloan, /project) | Buyer | 2026-05-29 |
| Track 3 Wave 1 — Login specs for SM/CP/Buyer (81 tests, 9 files) | Login modules | 2026-05-29 |
| Track 3 Wave 2 — 3 modules: Admin SM, SM Callback, Buyer Dashboard (92 tests, 6 files) | Various | 2026-05-29 |
| BUG_TRACKER catalogue — 22 FSD-verified bugs across 9 modules | All | 2026-05-29 |

---

## Completed (Historical)

| Task | Module / Sprint | Completed |
|------|----------------|-----------|
| Repository restructure — sprint-wise, portal-wise | All | 2026-05-16 |
| Create TC_LOGIN.md (22 TCs) | Login / Sprint 1 | 2026-05-16 |
| Build manual-qa-repository 01–09 structure | Framework | 2026-05-16 |
| Sync pipeline run — Step 1 Tech Lead (locator-map v1.3.4 → v1.4.0) | Customers / Sync | 2026-05-21 |
| Sync pipeline run — Step 2 BA sign-off (no BRD drift, 8/9 modules covered) | All / Sync | 2026-05-21 |
| Sync pipeline run — Step 3 QA Manual (TC_CUSTOMERS.md updated) | Customers / Sync | 2026-05-21 |
| Sync pipeline run — Step 4 QA Automation (login: 11 passed, e2e admin: config defect) | Customers + Login / Sync | 2026-05-21 |
| Fix BUG_001..009 (historical Sprints 1-3) | Various | 2026-02 to 2026-04 |
