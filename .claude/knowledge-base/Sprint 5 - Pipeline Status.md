---
type: pipeline-status
sprint: 5
last-updated: 2026-05-08
updated-by: BA Agent
tags: [pipeline, sprint-5, status]
---

# Sprint 5 — Pipeline Status

## Current State
**Phase:** BRD Analysis Complete  
**Next Action:** User picks priority module → Manual QA Phase 1 (Discovery)  
**Recommendation:** Start with **[[BRD - Offers]]** (smallest scope, clearest workflows)

## Module Tracker

| Module | BRD | Selectors | Screen Doc | TCs | Spec | Phase |
|--------|-----|-----------|------------|-----|------|-------|
| [[BRD - Offers]] | ✅ `brd/offers.md` | ❌ | ❌ | ❌ | ❌ | BRD Draft |
| [[BRD - Sales Managers]] | ✅ `brd/sales-managers.md` | ❌ | ❌ | ❌ | ❌ | BRD Draft |
| [[BRD - Payment Transactions]] | ✅ `brd/payment-transactions.md` | ❌ | ❌ | ❌ | ❌ | BRD Draft |
| [[BRD - CMS Config]] | ✅ `brd/cms-config.md` | ❌ | ❌ | ❌ | ❌ | BRD Draft |

## Gate Log

| Gate | Description | Status | Date | Notes |
|------|-------------|--------|------|-------|
| G0 | Module identified | ✅ PASSED | 2026-05-08 | 4 uncovered modules found via portal exploration |
| G1 | BRD created | ✅ PASSED | 2026-05-08 | All 4 BRDs written |
| G2 | Manual QA P1 (Discovery) | ⏳ PENDING | — | Awaiting user trigger |
| G3 | Manual QA P2 (Screen Docs) | 🔒 GATED | — | Needs `docs/selectors/<module>.json` |
| G4 | Manual QA P3 (Test Cases) | 🔒 GATED | — | Needs screen docs + clarifications resolved |
| G5 | Automation QA P1 (Scripts) | 🔒 GATED | — | Needs TC file + USER approval |
| G6 | Automation QA P2 (Execution) | 🔒 GATED | — | Needs spec compiles without errors |
| G7 | Manual QA P4 (Defects) | 🔒 GATED | — | Needs failures in reports/results.json |
| G8 | Automation QA P3 (Healing) | 🔒 GATED | — | Needs Open bugs in BUG_TRACKER.md |

## Open Blockers
See [[Sprint 5 - Clarifications]] — 29 open, 5 CRITICAL

## Red Flags Summary

| Severity | Module | Flag |
|----------|--------|------|
| ⚠️ CRITICAL | [[BRD - Payment Transactions]] | Gateway disable mid-campaign → payment failures |
| ⚠️ CRITICAL | [[BRD - Payment Transactions]] | No guard against disabling both gateways |
| ⚠️ HIGH | [[BRD - Offers]] | Toggle OFF without confirmation during live campaign |
| ⚠️ HIGH | [[BRD - CMS Config]] | Unit Cost Update immediate during active campaign |
| ⚠️ HIGH | [[BRD - CMS Config]] | Bulk Booking Cancel refund trigger unconfirmed |
| ⚠️ HIGH | [[BRD - CMS Config]] | Bulk Reg Cancel cascades to ALL sub-registrations |
| ⚠️ MEDIUM | [[BRD - Sales Managers]] | Cost Masking system-wide — no per-SM control |
| ⚠️ MEDIUM | [[BRD - CMS Config]] | Customer Actions Card changes mid-campaign → inventory overflow |
