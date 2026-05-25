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
