---
type: module
module: Allocation
url: https://uat-web.xrportal.in/admin/allocation
sprint: 3
status: Automated
spec: tests/ui/allocation.spec.js
tcs: SETUP-01–03, TC-ADM-001–010+PHASE8, TC-CST-001–030 (44 total)
tags: [module, allocation, automated]
updated: 2026-05-08
---

# Module: Allocation

## Overview

Two-sided module: Admin campaign management + Customer portal unit selection flow.

**Admin URL:** `https://uat-web.xrportal.in/admin/allocation`  
**Customer URL:** `https://uat.xrportal.in`  
**Page Object:** `src/pages/AllocationPage.js`

## Campaign Status Flow

```
Upcoming → Active → Completed (auto, end time passed)
    │          └→ Stopped (manual Stop before end time)
    └→ Cancelled (manual, from Upcoming)
           └→ Failed (system error)
```

Stopped (manual) and Completed (auto) = same customer experience.

## Create Campaign Form

| Field | Value / Rule |
|-------|-------------|
| Project | Xanadu Test Project |
| Campaign Name | Must be unique per run — use `Static Camp-Automation Test [N]` pattern |
| Allocation Type | **Static** — do NOT change |
| Start Time | ≥ 3 min from now (recommend now + 4 min) |
| End Time | After Start Time (recommend Start + 5 min) |
| Description | Optional |

**Validation:** Start < 3 min → red banner: *"Start time must be at least 3 minutes from now."*  
**Success toast:** `"Campaign created successfully"`

## Test Accounts

| Role | Mobile | OTP | Name | Registrations |
|------|--------|-----|------|---------------|
| Customer (main) | 1111111207 | 147258 | Mamta Solanki | GHNG-1000000063-A through -G |

**Mamta's registration states during active campaign:**
- A → Available (green) → "Proceed to Confirm" → Book Now → Select Unit → Pay
- B, F, G → Waitlisted
- C, D, E → Refunded

**After campaign ends:** A stays Booked; B/F/G remain Waitlisted

## Unit Selection Details (Unit 3502, Crest)

| Field | Value |
|-------|-------|
| Tower | Crest |
| Unit | 3502 |
| BHK | 1 BHK Growth Home |
| Size | 323 sq.ft. |
| Agreement Value | ₹32,99,000 |
| Home Loan Offer Discount | -₹10,000 |
| Early Bird Benefit Discount | -₹27,000 |
| All Inclusive Price | ₹35,52,960 |
| Confirmation Amount (Pay) | ₹27,000 |

## ENV SKIP Guards

| TC | Reason |
|----|--------|
| TC-CST-009 | No Sold units on UAT |
| TC-CST-013 | No Available registration in UAT state |
| TC-CST-016, TC-CST-028 | Live Easebuzz gateway — bot detection blocks payment |
| TC-ADM-008 | No auto-completed campaign on UAT |
| TC-ADM-010 | No campaigns in list at that state |

## Key Technical Notes

- **Campaign timing:** Must create with ≥ 3 min start delay. Tests using active campaigns wait for status.
- **1 Active campaign limit on UAT** — TC-ADM-007 reuses TC-ADM-006's Active campaign
- **beforeEach guard:** `.or()` chain locator to detect active campaign state before test
- **Date picker:** Must click date cell + time scroll (NOT type into input) to enable OK button
- **Campaign filter dropdown:** Two project selectors on page (top=create-form, bottom=filter). Always target filter using `.ant-select-selection-placeholder`
- **Stopped vs Completed:** Both lock customer portal — "Allocation window is closed for now." in red
- **Add Units drawer leak:** After paying, drawer stays open; its table inflates global `tbody tr` count. Close drawer via `.ant-drawer-close` before counting registrations.

## Customer Portal — Available Towers in Unit Selection

| Tower | Units (approx) |
|-------|---------------|
| Crest | ~159 |
| Crown | — |
| Blossom | — |
| Pinnacle | — |
| Bright | — |

## KYC Rules

- Max 4 applicants (primary + 3 co-applicants)
- Allowed relationships: Parents / Spouse / Siblings / Children (blood relatives only)
- Mandatory per applicant: Photo + PAN Card + Aadhaar Front + Aadhaar Back
- PAN format: `ABCDE1234F` | Aadhaar: `1234 5678 9012`

## Payment Gateway

- **Easebuzz** — primary. UAT test amount = ₹100 shown at bottom.
- Bot detection active — automated browsers cannot complete payment. Manual testing required for payment success.
- Payment mock/inject via `postMessage` also blocked by cross-origin iframe.

## Integration Points

| Module | Relationship |
|--------|-------------|
| [[Module - Config CMS]] | Registration Status + Unit Status control campaign eligibility |
| [[Module - Towers]] | Active towers appear in unit selection grid |
| [[Module - Offers]] | Active offers appear as discounts on unit detail panel |
| [[Module - Customers]] | Customer booking status reflected in admin Customers table |
