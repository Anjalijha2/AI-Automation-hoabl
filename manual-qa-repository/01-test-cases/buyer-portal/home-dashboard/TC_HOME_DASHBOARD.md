# Test Cases — Home Dashboard
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Home-Dashboard.md

---

## Dashboard — Landing & Layout

### BYR_DASH_001 — Dashboard loads at /home after login

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer logged in with `isConsented = 1` |
| **Test Steps** | 1. Complete login<br>2. Wait for redirect |
| **Expected Result** | URL = `/home`; dashboard content renders end-to-end |
| **Priority** | Critical |

---

### BYR_DASH_002 — Top navigation bar renders all menu items

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Inspect top/side nav |
| **Expected Result** | Menu items visible: Home, Project, My Unit, Payment Schedule, Home Loan, Work Progress, Support, Profile/Logout |
| **Priority** | High |

---

### BYR_DASH_003 — Buyer name/profile shown in header

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Inspect header profile area |
| **Expected Result** | Buyer's first name or avatar visible; clicking opens profile menu |
| **Priority** | Medium |

---

### BYR_DASH_004 — Status Alert Banner (TopAlert) visible when applicable

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer in a journey state that triggers TopAlert (e.g., KYC pending) |
| **Test Steps** | 1. Load dashboard<br>2. Inspect top banner area |
| **Expected Result** | TopAlert renders with state-specific message and CTA |
| **Priority** | High |

---

### BYR_DASH_005 — Allocation Banner shows countdown when campaign scheduled

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Upcoming allocation campaign exists with future start time |
| **Test Steps** | 1. Load dashboard<br>2. Inspect Allocation Banner |
| **Expected Result** | Banner shows countdown timer ticking down to campaign start |
| **Priority** | High |

---

### BYR_DASH_006 — Allocation Banner shows LIVE state during active campaign

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | An allocation campaign is currently active |
| **Test Steps** | 1. Load dashboard |
| **Expected Result** | Banner displays LIVE status / "Allocation is live"; CTA to proceed |
| **Priority** | High |

---

### BYR_DASH_007 — Creative Tiles render Strapi content

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Creative tiles published in Strapi |
| **Test Steps** | 1. Scroll dashboard<br>2. Inspect creative section |
| **Expected Result** | Strapi-managed marketing images and project highlights render |
| **Priority** | Medium |

---

### BYR_DASH_008 — Home Popup appears on first dashboard load (if configured)

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Strapi Home Popup is active for buyer's segment |
| **Test Steps** | 1. Load dashboard fresh |
| **Expected Result** | Popup displayed with title, body and close button |
| **Priority** | Medium |

---

### BYR_DASH_009 — Home Popup dismissible and not repeated in same session

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Home Popup visible |
| **Test Steps** | 1. Click X / dismiss<br>2. Navigate away and back to `/home` |
| **Expected Result** | Popup closes; does not re-appear within the same session |
| **Priority** | Low |

---

### BYR_DASH_010 — Marquee scrolls announcements when configured

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Marquee content configured in Strapi |
| **Test Steps** | 1. Load dashboard<br>2. Observe marquee strip |
| **Expected Result** | Text scrolls horizontally; content matches CMS configuration |
| **Priority** | Low |

---

## Dashboard — Registration Table

### BYR_DASH_011 — Registration table renders all buyer registrations

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer has 1+ registrations |
| **Test Steps** | 1. Scroll to Registrations Table<br>2. Count rows |
| **Expected Result** | One row per registration; all columns populated |
| **Priority** | Critical |

---

### BYR_DASH_012 — Registration number formatted GHNG-XXXXXXXXXX

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Registration row visible |
| **Test Steps** | 1. Inspect Registration Number column |
| **Expected Result** | Value matches `GHNG-` prefix + 10 alphanumeric characters |
| **Priority** | High |

---

### BYR_DASH_013 — Home Loan column shows linked/not linked

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Mix of registrations with/without home loan link |
| **Test Steps** | 1. Inspect Home Loan column |
| **Expected Result** | Linked registrations show bank name or Yes; unlinked show No/dash |
| **Priority** | Medium |

---

### BYR_DASH_014 — Allotted Unit column blank pre-allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Registration without allocated unit |
| **Test Steps** | 1. Inspect Allotted Unit column |
| **Expected Result** | Column is blank / shows "—" |
| **Priority** | Medium |

---

### BYR_DASH_015 — Allotted Unit column shows full details post-booking

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer has WINNER status with allocated unit |
| **Test Steps** | 1. Inspect Allotted Unit column |
| **Expected Result** | Shows format: `<unit#>-<tower> \| <BHK type> \| <sqft>` (e.g., "3502-Crest \| 1 Bed Growth Home \| 323 sq.ft.") |
| **Priority** | Critical |

---

### BYR_DASH_016 — Status badge "Available" rendered green

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Registration with status Available |
| **Test Steps** | 1. Inspect Status column |
| **Expected Result** | Green badge with text "Available" |
| **Priority** | High |

---

### BYR_DASH_017 — Status badge "Waitlisted" rendered dark/grey

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Registration with status Waitlisted |
| **Test Steps** | 1. Inspect Status column |
| **Expected Result** | Dark/grey badge with text "Waitlisted" |
| **Priority** | High |

---

### BYR_DASH_018 — Status badge "Booked" rendered green with checkmark

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Registration with status Booked (payment complete) |
| **Test Steps** | 1. Inspect Status column |
| **Expected Result** | Green badge with checkmark icon and "Booked" text |
| **Priority** | High |

---

### BYR_DASH_019 — Status badge "Refunded" rendered red

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Registration with status Refunded |
| **Test Steps** | 1. Inspect Status column |
| **Expected Result** | Red badge with "Refunded" text |
| **Priority** | Medium |

---

### BYR_DASH_020 — Process Status shows "Proceed to Confirm" when Available + Live

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer Available, campaign Live |
| **Test Steps** | 1. Inspect Process Status column |
| **Expected Result** | "Proceed to Confirm" CTA visible and clickable |
| **Priority** | Critical |

---

### BYR_DASH_021 — Process Status no action when Waitlisted

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer Waitlisted |
| **Test Steps** | 1. Inspect Process Status column |
| **Expected Result** | No action button; placeholder or status text only |
| **Priority** | High |

---

### BYR_DASH_022 — Process Status shows "Complete KYC" post-booking

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer WINNER, KYC not submitted |
| **Test Steps** | 1. Inspect Process Status column |
| **Expected Result** | "Complete KYC" red/orange button with warning text "Required to complete the allotment!" |
| **Priority** | Critical |

---

### BYR_DASH_023 — Process Status shows "KYC Completed" once done

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | KYC fully submitted (`isKycSubmitted = true`) |
| **Test Steps** | 1. Inspect Process Status column |
| **Expected Result** | Text reads "KYC Completed"; no action CTA |
| **Priority** | High |

---

### BYR_DASH_024 — Payment Schedule column shows "Pay >" when milestone due

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer WINNER with a milestone marked due |
| **Test Steps** | 1. Inspect Payment Schedule column |
| **Expected Result** | "Pay >" button visible; click navigates to payment screen |
| **Priority** | High |

---

## Dashboard — Navigation Actions

### BYR_DASH_025 — Clicking "Proceed to Confirm" opens allotment flow

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Available + Live status visible |
| **Test Steps** | 1. Click "Proceed to Confirm" |
| **Expected Result** | Navigates to Allotment page (`/alloted`) |
| **Priority** | Critical |

---

### BYR_DASH_026 — Clicking "Complete KYC" opens KYC form

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Process Status shows Complete KYC |
| **Test Steps** | 1. Click Complete KYC button |
| **Expected Result** | Navigates to `/kyc` and loads Step 1 KycForm |
| **Priority** | Critical |

---

### BYR_DASH_027 — Clicking "Pay >" opens payment schedule

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Pay button visible |
| **Test Steps** | 1. Click Pay > |
| **Expected Result** | Navigates to `/paymentschedule` with the due milestone highlighted |
| **Priority** | High |

---

### BYR_DASH_028 — Multiple registrations render as separate rows

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer has 2+ registrations |
| **Test Steps** | 1. Count rows<br>2. Verify each has independent status/actions |
| **Expected Result** | Each registration is a distinct row with independent state |
| **Priority** | High |

---

### BYR_DASH_029 — Dashboard updates in real time when campaign goes live

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer on dashboard, campaign scheduled to start imminently |
| **Test Steps** | 1. Wait for campaign start time<br>2. Observe banner / Process Status |
| **Expected Result** | Without refresh, banner switches to LIVE and Process Status updates via WebSocket |
| **Priority** | High |

---

## Dashboard — Negative & Edge Cases

### BYR_DASH_030 — Buyer with zero registrations sees empty state

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer logged in but no registrations exist |
| **Test Steps** | 1. Load dashboard |
| **Expected Result** | Empty state message shown ("No registrations yet"); table not rendered or shows placeholder |
| **Priority** | Medium |

---

### BYR_DASH_031 — API failure shows graceful error

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Backend API simulated 500 |
| **Test Steps** | 1. Block dashboard API in DevTools<br>2. Reload `/home` |
| **Expected Result** | Friendly error message displayed; retry option offered; no app crash |
| **Priority** | Medium |

---

### BYR_DASH_032 — Browser back from inner page returns to dashboard

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Dashboard loaded, then navigated to `/project` |
| **Test Steps** | 1. Click browser Back |
| **Expected Result** | Returns to `/home`; previous scroll position approximately preserved |
| **Priority** | Low |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-home-dashboard.md`

### Corrections to existing TCs
- **BYR_DASH_001 / BYR_DASH_011** — Dashboard is NOT served by a single `/dashboard` endpoint. Frontend orchestrates 3-5 calls: `GET /registration`, `GET /user-registrations`, `GET /registration-count`, `GET /user-unit-details`, `GET /milestone-transaction-details`, `GET /allocation/campaigns/latest` (routes/user.routes.js:53-178). All require `Authorization: Bearer <jwt>` with role `user`.
- **BYR_DASH_005 / BYR_DASH_006** — Computed `allocationStatus` is derived at request time from (campaign RUNNING/STOPPED) × (campaign DYNAMIC vs static) × Redis cache value. Static assertions WILL flake — pin campaign state in test data (services/registration.service.js:135-167).
- **BYR_DASH_019** — Registration unit `status` ENUM is uppercase: `WAITLIST | PREALLOCATED | ALLOCATED | WINNER | HOLD | REFUND` (models/registration-unit.model.js:121-124). Refund hide-filter bug: `getRegistration` uses `{ status: { [Op.ne]: 'refund' } }` (lowercase) — never matches uppercase ENUM, so refunded units leak into paid-registration units[] array.
- **BYR_DASH_029** — No WebSocket implementation verified in routes/user.routes.js — campaign live-state likely requires manual page refresh or polling. Replace "via WebSocket" assertion with periodic refresh until confirmed.

### New TCs added below

### BYR_DASH_033 — /registration with no completed payment returns draft branch

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer with `paymentStatus != 'success'`; slug `?slug=<projectSlug>` |
| **Test Steps** | 1. `GET /api/v1/registration?slug=<slug>` |
| **Expected Result** | 200 `{ registrationNumber: null, draft: <json|null> }` (controllers/registration.controller.js:2427-2441) |
| **Priority** | High |

---

### BYR_DASH_034 — /registration-count reads static tickerClock column

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Admin sets `projects.ticker_clock = 12345` for active project |
| **Test Steps** | 1. `GET /api/v1/registration-count`<br>2. Insert a new registration row<br>3. Re-call endpoint |
| **Expected Result** | Both calls return `{ registrationCount: 12345 }` — value does NOT auto-increment with new registrations (BUG-DASH-003). |
| **Priority** | Medium |

---

### BYR_DASH_035 — /user-unit-details requires both query params

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Authenticated buyer |
| **Test Steps** | 1. `GET /api/v1/user-unit-details?registrationNumber=GHNG-XXX` (omit unitId) |
| **Expected Result** | 400 "Missing required query parameters: registrationNumber and unitId" (milestone-payment.controller.js:1491-1493) |
| **Priority** | Medium |

---

### BYR_DASH_036 — Home loan with admin_rejected status hidden from dashboard row

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer has `registration_home_loans.loanApprovalStatus = 'admin_rejected'` |
| **Test Steps** | 1. `GET /user-registrations`<br>2. Inspect `homeLoanId` for that row |
| **Expected Result** | `homeLoanId = null` (LEFT JOIN filter `loanApprovalStatus != 'admin_rejected'` in services/registration.service.js:97-102). Home Loan ENUM: `pending / approved / admin_rejected / admin_approved` — NOT APPLIED/APPROVED/REJECTED. |
| **Priority** | High |

---

### BYR_DASH_037 — Dynamic campaign allocation falls back to WAITLIST when Redis MISS

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Dynamic campaign RUNNING; unit DB `status=WAITLIST`, `availableForAllocation=true`; Redis key absent |
| **Test Steps** | 1. `GET /user-registrations`<br>2. Inspect row `allocationStatus` |
| **Expected Result** | `allocationStatus = 'WAITLIST'` despite availableForAllocation=true (services/registration.service.js:159-166) |
| **Priority** | High |

---

### BYR_DASH_038 — Terminal WINNER/HOLD/REFUND bypass campaign override

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Unit with `status=WINNER`; no campaign running |
| **Test Steps** | 1. `GET /user-registrations` |
| **Expected Result** | `allocationStatus='WINNER'` regardless of campaign state (services/registration.service.js:133, 137-140) |
| **Priority** | High |

---

### BYR_DASH_039 — Refund filter case-mismatch leaks refunded units (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Buyer with one unit in `status='REFUND'` (uppercase ENUM) |
| **Test Steps** | 1. `GET /registration?slug=<slug>`<br>2. Inspect `units[]` |
| **Expected Result** | KNOWN BUG: refunded unit still appears in units[] — filter uses lowercase `'refund'` (controllers/registration.controller.js:2390 vs models/registration-unit.model.js:122). Document, do not pass. |
| **Priority** | High |

---

### BYR_DASH_040 — Unauthenticated access to /registration returns 401

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | No JWT |
| **Test Steps** | 1. `GET /api/v1/registration` without Authorization header |
| **Expected Result** | 401 unauthorized (`protect` middleware in routes/user.routes.js:49) |
| **Priority** | Critical (Security) |

---

### BYR_DASH_041 — Buyer JWT cannot access non-user role endpoint

| Field | Value |
|-------|-------|
| **Module** | BYR – Dashboard |
| **Pre-conditions** | Valid buyer JWT |
| **Test Steps** | 1. Use buyer token on admin-only endpoint |
| **Expected Result** | 403 forbidden (`restrictTo('user')` middleware in routes/user.routes.js:50) |
| **Priority** | High (Security) |
