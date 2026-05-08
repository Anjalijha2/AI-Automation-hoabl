---
type: brd
module: Offers
url: https://uat-web.xrportal.in/admin/offers
sprint: 5
status: Draft
author: BA Agent
created: 2026-05-08
tags: [brd, offers, sprint-5]
---

# BRD: Offers Management

## 1. Purpose
Allows admins to create, configure, and control discount offers applied to unit purchases during booking. Offers are amount-based (flat ₹ discount) or percentage-based, optionally scoped to specific typologies. Active offers appear as line-item discounts on customer-facing unit detail panel.

**Business intent:** Controlled, auditable mechanism for time-bound discount campaigns without touching base pricing.

## 2. Screens & Navigation
**Path:** Left sidebar → "Offers" → `/admin/offers`

Single-page module. No sub-navigation.

**Header:** "Offers Management" | Counter badge "N Offers" | Refresh | Add New Offer

**Table Columns:** Sr. No. | Offer Name | Description | Amount | Percentage | Start Date | End Date | Created By | Action (toggle + Edit + Delete)

**Observed Data (UAT 2026-05-08):**

| Sr | Name | Amount | Start | End | Created By | Status |
|----|------|--------|-------|-----|------------|--------|
| 10 | VK test | ₹10,000 | 06 May 2026 | 30 May 2026 | Vignesh UAT Admin | OFF |
| 9 | VC request | ₹75,000 | 26 Apr 2026 | 31 May 2026 | Suyash D | ON |
| 8 | VC request | ₹75,000 | 26 Apr 2026 | 31 May 2026 | Suyash D | ON |
| 7 | VC request | ₹75,000 | 27 Apr 2026 | 31 May 2026 | Suyash D | ON |
| 3 | VC request | ₹50,000 | 14 Apr 2026 | 30 May 2026 | Supriya Dubey | ON |
| 1 | Home Loan Discount | ₹10,000 | 13 Apr 2026 | 30 Jun 2026 | Supriya Dubey | OFF |

> Non-contiguous Sr. Nos. (1,3,7,8,9,10) = hard deletes in DB.

## 3. Key Entities & Data Fields

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| Offer Name | Yes | Text | Max 100 chars |
| Offer Type | Yes | Radio | Amount Based OR Percentage Based |
| Amount | Conditional | Currency | Positive integer, INR |
| Percentage | Conditional | Numeric | 0-100 |
| Description | No | Textarea | Max 500 chars |
| Start Date | Yes | Date picker | ≤ End Date |
| End Date | Yes | Date picker | ≥ Start Date |
| Select Typology | No | Multi-select | 1 Bed Growth Home, 2 Bed Growth Home, 2 Bed Rise Home, others |
| Active (ON/OFF) | — | Toggle | Default ON at creation |

## 4. Business Workflows

### Create Offer
Admin → "Add New Offer" → Modal fills → "Create Offer" → table updates + counter increments

### Edit Offer
Edit icon → Modal pre-filled → "Update Offer" → table row updates

### Toggle ON/OFF
Click toggle → immediate flip. **No confirmation dialog.** ⚠️ HIGH RISK

### Delete Offer
Delete icon → confirmation dialog (assumed, not verified) → removed from list

## 5. Filters & Search
None observed. No search box, no status filter, no date filter.

> [[Sprint 5 - Clarifications#CLARIFICATION-OFFERS-001]]

## 6. KPIs
- Offer count badge: total (active + inactive + expired)

## 7. Integration Points

| Module | Relationship |
|--------|-------------|
| [[BRD - Allocation]] | Active offers = line-item discounts on unit selection |
| Towers / Units | Typology filter scopes offer to unit types |
| Customers | Customer sees offers on cost sheet |
| [[BRD - CMS Config]] | Unit Cost Update overlaps with offer discount fields |

### Pricing Formula
```
Agreement Value (base)
- Home Loan Offer Discount
- Early Bird Benefit Discount
= All Inclusive Price
```

## 8. Acceptance Criteria

- **AC-OFFERS-001:** List loads <3s; counter accurate; currency/date formats correct
- **AC-OFFERS-002:** Create — required field validation; char counters; radio mutual exclusivity; date range enforced
- **AC-OFFERS-003:** Edit — pre-filled values; same validation; Cancel discards
- **AC-OFFERS-004:** Toggle — state flips; ON = active in pricing; OFF = excluded
- **AC-OFFERS-005:** Delete — confirmation dialog; counter decrements; removed from pricing
- **AC-OFFERS-006:** Typology scoping — scoped offer applies only to matching unit types

## 9. Out of Scope / UAT Limitations
1. Percentage-based offers — no UAT data; cannot verify pricing impact
2. Expired offer behavior — requires time manipulation
3. Delete flow not executed (avoid data loss)
4. CMS Admin external portal — out of scope

## 🚩 Domain Red Flags
- **HIGH:** Toggle OFF without confirmation during live campaign re-prices active customer selections
- **MEDIUM:** Offer end date expiry mid-booking — undefined re-pricing behavior

## Open Clarifications
See [[Sprint 5 - Clarifications#Offers]]
