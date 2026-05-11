---
name: Sprint 5 — New Uncovered Modules Identified
description: Four modules found uncovered during portal exploration on 2026-05-08; BRDs created for all four
type: project
---

On 2026-05-08 a full portal navigation audit was performed. The XR Portal admin navigation has 10 menu items:
- Customers (covered) → /admin/customers
- Config (covered) → /admin/cms
- Allocation (covered) → /admin/allocation
- Offers (NEW — BRD created) → /admin/offers
- Towers (covered) → /admin/towers
- JBP Mgmt (covered) → /admin/jbp-management
- Channel Partners (covered) → /admin/channel-partners
- Sales Managers (NEW — BRD created) → /admin/sales-managers
- Transactions (NEW — BRD created) → /admin/payment-transactions
- CMS (external portal, out of scope) → https://manage-uat.xrportal.in/admin/auth/login

BRDs written to:
- brd/offers.md
- brd/sales-managers.md
- brd/payment-transactions.md
- brd/cms-config.md (comprehensive BRD covering all 9 CMS sub-sections; existing TC_ADMIN_CMS.md only covered 4 of 9)

**Why:** These modules had no existing BRD, no selector files, and no spec files despite being live in UAT.

**How to apply:** Sprint 5 pipeline starts from Manual QA Phase 1 for these four modules. Prioritization needed from user before triggering Manual QA agent.
