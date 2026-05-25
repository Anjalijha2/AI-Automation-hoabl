# XR Portal Admin — User Manual

**Version:** 1.1
**Environment:** UAT (`https://uat-web.xrportal.in/admin`)
**Auth:** Mobile OTP (no password)
**Last Updated:** 2026-05-22

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login](admin/login.md)
3. [Customers](admin/customers.md)
4. [Towers](admin/towers.md)
5. [Allocation](admin/allocation.md)
6. [Config (Configurations)](admin/config.md)
7. [Channel Partners](admin/channel-partners.md)
8. [Offers](admin/offers.md)
9. [JBP Management](admin/jbp-management.md)
10. [Sales Managers](admin/sales-managers.md)
11. [Payment Transactions](admin/payment-transactions.md)
12. [CMS (external Strapi)](admin/admin-cms.md)

---

## Getting Started

XR Portal Admin is the back-office portal for managing real-estate operations — customers, unit allocations, towers, channel partners, offers, JBP plans, sales managers, payments, and content.

**Access:** `https://uat-web.xrportal.in/admin`
**Auth method:** 2-step Mobile OTP — no password required
**UAT credentials:** Mobile `8888888888` · OTP `258369` (static)

After login, the portal lands on **Customers** by default. All modules are reachable from the left sidebar.

---

## Module Index

| Module | URL path | Manual | Summary |
|--------|----------|--------|---------|
| Login | `/admin` | [admin/login.md](admin/login.md) | 2-step mobile OTP login, session persistence, logout (server-side no-op known issue) |
| Customers | `/admin/customers` | [admin/customers.md](admin/customers.md) | Registration dashboard, KPI cards, filters, cancellation, unit swap, parking, milestones, offline booking, bulk cancel, Excel export |
| Towers | `/admin/towers` | [admin/towers.md](admin/towers.md) | Read-only inventory view of all 18 towers, KPI cards, floor/unit grid with status colours, unit detail drawer |
| Allocation | `/admin/allocation` | [admin/allocation.md](admin/allocation.md) | Create / monitor / stop / cancel time-bound buyer allocation campaigns (Static / Dynamic / Physical Event) |
| Config | `/admin/cms` (in-portal "Configurations") | [admin/config.md](admin/config.md) | 9 operational sections — tower toggles, registration status, unit status, pricing, bulk cancellation, SM upload, customer actions, max preferences |
| Channel Partners | `/admin/channel-partners` | [admin/channel-partners.md](admin/channel-partners.md) | CP directory (~2705), phone search, column filters, detail drawer, Mark as Master, Map Master CP |
| Offers | `/admin/offers` | [admin/offers.md](admin/offers.md) | Create/edit/toggle/delete discount offers (Amount or Percentage based), typology scope, immediate live effect |
| JBP Management | `/admin/jbp-management` | [admin/jbp-management.md](admin/jbp-management.md) | Create/close JBP cycles, view CP submissions, approve/reject CP edit requests |
| Sales Managers | `/admin/sales-managers` | [admin/sales-managers.md](admin/sales-managers.md) | SM list, search/filter, single Add, Edit, system-wide privacy masking settings |
| Payment Transactions | `/admin/payment-transactions` | [admin/payment-transactions.md](admin/payment-transactions.md) | Read-only payment ledger, filters, export, gateway configuration (Easebuzz / Razorpay) |
| CMS (external) | external Strapi at `manage-uat.xrportal.in` | [admin/admin-cms.md](admin/admin-cms.md) | External Strapi content management — separate auth, out of in-portal QA scope |

---

## Cross-Module Dependencies

- **Config → Towers**: Tower active/inactive state is set in Config; visible in Towers KPI.
- **Config → Allocation**: At least one Active tower is required for a meaningful allocation campaign.
- **Config → Sales Managers**: Section 7 of Config is the bulk-upload surface for SMs; standalone Add/Edit lives in the SM list page.
- **Allocation → Customers**: Successful buyer bookings during a campaign appear as Booked rows in Customers.
- **Offers → Allocation**: Active offers are queried live at the moment a buyer clicks Proceed to Pay; impact pricing and confirmation amount.
- **Channel Partners → Customers**: CPs appear as Growth Partners on customer registrations.
- **Sales Managers → Channel Partners**: SM Name/Email/Mobile in the CP table is auto-populated from the SM assigned to that CP.
- **JBP → Channel Partners**: CPs submit JBP commitment forms via the CP Portal; admin reviews here.
- **Payment Transactions ← Allocation / Customers**: Every booking (online or offline) generates a transaction row.

---

## Known Cross-Cutting Issues (Sprint Sync 2026-05-21)

These backend gaps span multiple modules — see the per-module manuals for full detail:

| ID | Issue | Affected modules |
|----|-------|------------------|
| GAP-TL-019 | Logout is a server-side no-op — JWT not invalidated | Login (security) |
| GAP-TL-008 | `cancelUserAllocation` ownership check broken — any user can cancel any registrationUnit | Allocation, Customers |
| GAP-DEV-011 | `markAllocationCampaignFailed` destroys the row instead of setting status=FAILED | Allocation |
| GAP-DEV-034 | No DB-level unique index on `unit_id` for WINNER/HOLD — double-booking race window exists | Allocation |
| GAP-DEV-008 | 2-minute pre-start blackout — Unit Swap, Cancel Unit, Assign Unit, Bulk Refund blocked | Allocation, Customers, Config |
| GAP-DEV-023 | Offer delete is hard-destroy with no audit and no FK guard | Offers |
| GAP-TL-034 | "2 Bed Peak Home" force-disabled by backend regardless of admin input | Config (Customer Actions) |
| BUG_010 | Registration Status (Section 2) silent failure on Submit without file | Config |

---

## Conventions Used Across Module Manuals

- **Audience** — Admin / Sales Manager Admin unless noted.
- **Preconditions** — what must be true before performing the feature.
- **How to use** — numbered, step-by-step user actions.
- **Result** — what changes after the action (UI + API + downstream effects).
- **Warnings** — known issues, risks, or backend gaps; cite the GAP-* id where applicable.
- **API Reference** — endpoint table for cross-referencing automation specs.
- **Troubleshooting** — symptom → cause → fix tables.

---

## Where to Find More

- **BRD / FRD source of truth:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/`
- **Test cases (Excel):** `manual-qa-repository/01-test-cases/admin-portal/`
- **Automation specs:** `tests/<type>/admin/<module>.spec.js`
- **Page objects:** `automation-repository/pages/admin/<Module>Page.js`
- **Locator map:** `locators/admin/locator-map.json`
- **Bug tracker:** `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`
- **Execution summaries:** `manual-qa-repository/06-test-runs/`
