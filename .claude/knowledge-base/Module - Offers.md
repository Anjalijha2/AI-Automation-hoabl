---
type: module
module: Offers
url: https://uat-web.xrportal.in/admin/offers
sprint: 4
status: Automated
spec: tests/ui/offers.spec.js
tcs: TC-OFFERS-001–012 (13 tests)
tags: [module, offers, automated]
updated: 2026-05-08
---

# Module: Offers

## Overview

Manages discount offers applied to unit purchases during booking flow. Admins create/edit/toggle/delete offers. Active offers appear as line-item discounts on customer unit selection.

**URL:** `https://uat-web.xrportal.in/admin/offers`  
**Auth:** Required — `src/fixtures/.auth/admin.json`  
**Page Object:** `src/pages/OffersPage.js`  
**Selectors:** `docs/selectors/offers.json`

## Page Structure

**Header:** "Offers Management" | "N Offers" counter badge | Refresh | Add New Offer

**Table columns:** Sr. No. | Offer Name | Description | Amount | Percentage | Start Date | End Date | Created By | Action (toggle + Edit + Delete)

**No search or filter** on list page — only Refresh.

## Offer Data Model

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Offer Name | Yes | Text | Max 100 chars |
| Offer Type | Yes | Radio | Amount Based OR Percentage Based (mutually exclusive) |
| Amount | Conditional | Currency | Positive integer, INR — input placeholder "Please enter amount" |
| Percentage | Conditional | Numeric | 0-100 |
| Description | No | Textarea | Max 500 chars |
| Start Date | Yes | Date range picker | ≤ End Date |
| End Date | Yes | Date range picker | ≥ Start Date |
| Typology | No | Multi-select | 1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Peak Home / 2 Bed Rise Home |
| Active (ON/OFF) | — | Toggle | `role="switch"` `aria-checked="true/false"` |

## UAT Data (2026-05-08)

6 offers on UAT. IDs: 1, 3, 7, 8, 9, 10 — **non-contiguous** (hard deletes leave gaps).  
All UAT offers are Amount Based — Percentage column always shows "-".

| Sr | Name | Amount | Status |
|----|------|--------|--------|
| 10 | VK test | ₹10,000 | OFF |
| 9 | VC request | ₹75,000 | ON |
| 8 | VC request | ₹75,000 | ON |
| 7 | VC request | ₹75,000 | ON |
| 3 | VC request | ₹50,000 | ON |
| 1 | Home Loan Discount | ₹10,000 | OFF |

## Key Technical Notes

### Ant Design Icon Selectors
- ❌ Wrong: `button:has(img[alt="edit"])`
- ✅ Correct: `button:has([aria-label="edit"])` — anticon uses `<span role="img" aria-label="...">`, not `<img>`
- Applies to ALL modules: edit, delete, eye, more icons

### Drawer (NOT Modal)
- Offers uses `.ant-drawer-body` (slides from right), NOT `.ant-modal-body`
- Still has `role="dialog"` — accessible via `dialog[name="Add New Offer"]`

### Toggle
- `role="switch"` with `aria-checked="true"/"false"`
- **No confirmation dialog** — state flips immediately and persists to server
- HIGH risk: accidental deactivation mid-campaign changes customer pricing instantly

### Delete Confirmation Dialog (resolved)
- Title: "Are you sure you want to delete this offer?"
- Body: "This action cannot be undone."
- Confirm: **"Yes, delete"** (NOT "OK" or "Yes")
- Cancel: "Cancel"

### Amount Input
- Placeholder: `"Please enter amount"` — the ₹ prefix is a display wrapper
- Selector: `input[placeholder="Please enter amount"]` or `.ant-input-number-input`

### Baseline Count
- Use **dynamic count** (`getOfferCount()` before test) — never pin a hardcoded baseline
- Cleanup leaks from failed test runs reset via delete in TC-OFFERS-005 afterEach

## Automated Tests

| TC | Description | Result |
|----|-------------|--------|
| TC-OFFERS-001 | Page load + count > 0 | ✅ |
| TC-OFFERS-002 | Table column headers + data types (currency/dates) | ✅ |
| TC-OFFERS-003 | Non-contiguous Sr. No. confirmed (gaps = hard deletes) | ✅ |
| TC-OFFERS-004 | Add drawer opens with all required fields | ✅ |
| TC-OFFERS-005 | Create offer → verify in table → delete (cleanup) | ✅ |
| TC-OFFERS-006 | Empty submit → required field validation errors shown | ✅ |
| TC-OFFERS-007 | Edit drawer pre-fills all existing values | ✅ |
| TC-OFFERS-008 | Edit offer → round-trip update verified in table | ✅ |
| TC-OFFERS-009 | Toggle OFF → state persists after refresh | ✅ |
| TC-OFFERS-010 | Toggle ON and back to OFF | ✅ |
| TC-OFFERS-011 | Typology dropdown shows all 4 options | ✅ |
| TC-OFFERS-012 | Refresh button reloads data, count unchanged | ✅ |

## Pricing Integration

```
Agreement Value (base)
- Home Loan Offer Discount
- Early Bird Benefit Discount
= All Inclusive Price
```

Active offers appear in customer unit selection panel. Toggle OFF mid-booking removes discount instantly — no confirmation, HIGH risk.

## Domain Red Flags

| Flag | Severity |
|------|----------|
| Toggle OFF has no confirmation dialog | HIGH |
| Toggle OFF during active campaign re-prices mid-booking customers | HIGH |
| Offer end date expiry mid-booking — behavior undefined | MEDIUM |

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Allocation]] | Active offers = discounts on unit selection detail panel |
| [[Module - Config CMS]] | Unit Cost Update sets Agreement Value; Offers set discount on top |
| [[Module - Towers]] | Typology-scoped offers apply to specific unit types |

→ Open clarifications: [[Open Questions#Offers]]
