---
type: clarifications
sprint: 5
created: 2026-05-08
tags: [clarifications, sprint-5, blockers]
---

# Sprint 5 — Clarifications Tracker

**Total Open:** 29 | **Resolved:** 0

---

## Offers

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| CLARIFICATION-OFFERS-001 | Search/filter planned for offers list? | TC scope | ⏳ Open |
| CLARIFICATION-OFFERS-002 | Offer Name uniqueness required? | Validation TC | ⏳ Open |
| CLARIFICATION-OFFERS-003 | Toggle OFF mid-allocation → re-prices customer's active selection? | ⚠️ CRITICAL pricing integration TC | ⏳ Open |
| CLARIFICATION-OFFERS-004 | Offer End Date passes mid-booking → behavior? | Edge case TC | ⏳ Open |
| CLARIFICATION-OFFERS-005 | Delete — confirmation dialog text? | Delete TC | ⏳ Open |
| CLARIFICATION-OFFERS-006 | Full typology dropdown values list? | Test data | ⏳ Open |

## Sales Managers

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| CLARIFICATION-SM-001 | Email unique per SM? (UAT shows duplicates) | Validation TC | ⏳ Open |
| CLARIFICATION-SM-002 | Settings modal auto-saves on toggle or needs Save button? | Settings TC | ⏳ Open |
| CLARIFICATION-SM-003 | Full Role dropdown values? | Test data | ⏳ Open |
| CLARIFICATION-SM-004 | SM vs Channel Partner relationship — can CP be SM? | Integration scope | ⏳ Open |
| CLARIFICATION-SM-005 | SM bulk upload CSV column headers? | Bulk upload TC | ⏳ Open |
| CLARIFICATION-SM-006 | Settings changes (masking) audit-logged? | Security TC | ⏳ Open |

## Payment Transactions

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| CLARIFICATION-TXN-001 | Export format (CSV/XLSX)? Filtered or all records? | Export TC | ⏳ Open |
| CLARIFICATION-TXN-002 | Payment Type values beyond "Allocation"? | Filter TC scope | ⏳ Open |
| CLARIFICATION-TXN-003 | How are offline payments (Cheque/RTGS) entered? Admin form here or Customers? | Offline TC | ⏳ Open |
| CLARIFICATION-TXN-004 | Disabling gateway mid-session — pending payment orders invalidated? | ⚠️ CRITICAL integration TC | ⏳ Open |
| CLARIFICATION-TXN-005 | Guard preventing both gateways disabled simultaneously? | ⚠️ CRITICAL config TC | ⏳ Open |
| CLARIFICATION-TXN-006 | Page size dropdown options beyond 10? | Pagination TC | ⏳ Open |
| CLARIFICATION-TXN-007 | Transaction Detail view implementation ETA? | Detail TCs gated | ⏳ Open |

## CMS Config

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| CLARIFICATION-CMS-001 | SM bulk upload — create, update, or both? Merge key? | SM bulk TC | ⏳ Open |
| CLARIFICATION-CMS-002 | Max Preferences Per Unit — system-wide or per-campaign? Per-registration or total? | Preference cap TC | ⏳ Open |
| CLARIFICATION-CMS-003 | Bulk Booking Cancellation → auto-trigger refund? | ⚠️ HIGH domain rule | ⏳ Open |
| CLARIFICATION-CMS-004 | Bulk Registration Cancellation → auto-trigger refund? | ⚠️ HIGH domain rule | ⏳ Open |
| CLARIFICATION-CMS-005 | Unit Status CSV valid Status values (AVAILABLE and what else)? | Unit Status TC | ⏳ Open |
| CLARIFICATION-CMS-006 | Registration Status CSV Allocation Status case-sensitive? | Validation TC | ⏳ Open |
| CLARIFICATION-CMS-007 | Bulk Booking Cancellation CSV column headers? | Cancellation TC | ⏳ Open |
| CLARIFICATION-CMS-008 | Bulk Registration Cancellation CSV column headers? | Cancellation TC | ⏳ Open |
| CLARIFICATION-CMS-009 | Reducing Max Preferences below customer's existing count — existing preferences invalidated? | Edge case TC | ⏳ Open |
| CLARIFICATION-CMS-010 | Bulk upload error format — per-row report, summary, or toast? | Error handling TC | ⏳ Open |

---

## Priority Resolution Order

**CRITICAL (resolve before TC generation):**
1. CLARIFICATION-OFFERS-003 — toggle OFF mid-allocation
2. CLARIFICATION-TXN-004 — gateway disable mid-session
3. CLARIFICATION-TXN-005 — dual gateway disable guard
4. CLARIFICATION-CMS-003 — booking cancel auto-refund
5. CLARIFICATION-CMS-004 — registration cancel auto-refund
