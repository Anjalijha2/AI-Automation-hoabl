---
type: index
tags: [index, modules, xr-portal]
updated: 2026-05-08
---

# XR Portal — Module Index

Master index of all modules. Open any module note for full detail.

## Automated Modules (Tests Passing)

| Module | URL | Spec File | TCs | Sprint | Status |
|--------|-----|-----------|-----|--------|--------|
| [[Module - Login]] | `/admin` (login flow) | `tests/ui/login.spec.js` | 22 | 1 | ✅ All pass |
| [[Module - Customers]] | `/admin/customers` | `tests/ui/customers.spec.js` | 17 | 1 | ✅ All pass |
| [[Module - Config CMS]] | `/admin/cms` | `tests/ui/config.spec.js` | 52 | 2 | ✅ All pass (2 ENV SKIP) |
| [[Module - Allocation]] | `/admin/allocation` | `tests/ui/allocation.spec.js` | 44 | 3 | ✅ All pass (ENV SKIPs for live gateway) |
| [[Module - Towers]] | `/admin/towers` | `tests/ui/towers.spec.js` | 13 | 3 | ✅ All pass |
| [[Module - Channel Partners]] | `/admin/channel-partners` | `tests/ui/channel-partners.spec.js` | 13 | 3 | ✅ All pass |
| [[Module - JBP Management]] | `/admin/jbp-management` | `tests/ui/jbp-management.spec.js` | 4 | 3 | ✅ All pass |
| [[Module - Offers]] | `/admin/offers` | `tests/ui/offers.spec.js` | 13 | 4 | ✅ All pass |
| [[Module - Sales Managers]] | `/admin/sales-managers` | `tests/ui/config.spec.js` (TC_CFG_041–048) | 8 | 2 | ✅ All pass |

**Total automated tests: 186**

## BRDs Written — Pending Automation (Sprint 5)

| Module | BRD | Status |
|--------|-----|--------|
| [[BRD - Payment Transactions]] | `brd/payment-transactions.md` | BRD Draft |
| [[BRD - CMS Config]] (full) | `brd/cms-config.md` | BRD Draft (4 sections new) |

## Open Questions

→ [[Open Questions]] — all clarifications in one place

## Sprint Log

| Sprint | Focus | Status |
|--------|-------|--------|
| 1 | Login + Customers | ✅ |
| 2 | Config/CMS (all 9 sections) | ✅ |
| 3 | Allocation + Towers + Channel Partners + JBP | ✅ |
| 4 | Offers | ✅ |
| 5 | Payment Transactions + CMS (new sections) | 🔄 BRD done |

## Portal Navigation (10 items)

| Nav Item | Routes To | Scope |
|----------|-----------|-------|
| Customers | `/admin/customers` | In scope |
| Config | `/admin/cms` | In scope |
| Allocation | `/admin/allocation` | In scope |
| Offers | `/admin/offers` | In scope |
| Towers | `/admin/towers` | In scope |
| JBP Mgmt | `/admin/jbp-management` | In scope |
| Channel Partners | `/admin/channel-partners` | In scope |
| Sales Managers | `/admin/sales-managers` | In scope |
| Transactions | `/admin/payment-transactions` | BRD only |
| CMS | `manage-uat.xrportal.in` | **OUT OF SCOPE** (external portal) |
