# Test Cases — Home Dashboard
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-BRD-Buyer-Portal.md / BUYER-FS-Home-Dashboard.md

---

## Dashboard Load & Layout

### BYR_DASH_001 — Home Dashboard loads at /home after login

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Log in using valid credentials<br>2. Wait for redirect<br>3. Observe URL and page |
| **Expected Result** | URL is `https://uat.xrportal.in/home`; Home Dashboard layout fully rendered |
| **Priority** | Critical |

---

### BYR_DASH_002 — Top navigation bar displays all menu items

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Observe the top navigation bar |
| **Expected Result** | Menu items visible: Home, My Unit, Project, Payment Schedule, Home Loan, Work Progress, Support Tickets; profile/logout area on the right |
| **Priority** | High |

---

### BYR_DASH_003 — Status Alert Banner (TopAlert) renders at top

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Observe top of the dashboard area |
| **Expected Result** | TopAlert banner is visible; banner text reflects buyer's current journey state (e.g., "Allocation hasn't started yet" / "Allocation is live now") |
| **Priority** | High |

---

### BYR_DASH_004 — Allocation Banner with countdown is visible

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded; allocation event scheduled |
| **Test Steps** | 1. Scroll to the Allocation Banner area |
| **Expected Result** | Allocation Banner shows countdown timer (days/hours/minutes/seconds) to next event; managed via Strapi hero-slides |
| **Priority** | High |

---

### BYR_DASH_005 — Marquee scrolling text displayed

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Marquee content configured in Strapi |
| **Test Steps** | 1. Observe the marquee area<br>2. Watch the scroll animation |
| **Expected Result** | Marquee text scrolls horizontally; content matches Strapi-configured announcement |
| **Priority** | Medium |

---

### BYR_DASH_006 — Home Popup announcement appears on first load

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Strapi popup is enabled; first visit |
| **Test Steps** | 1. Log in for the first time in this session<br>2. Wait for dashboard render |
| **Expected Result** | Home Popup modal appears with announcement text/image; has a Close/X button |
| **Priority** | Medium |

---

### BYR_DASH_007 — Home Popup can be dismissed and stays dismissed in session

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Home Popup visible |
| **Test Steps** | 1. Click X / Close on the popup<br>2. Refresh the page once<br>3. Navigate around then return to dashboard |
| **Expected Result** | Popup closes on click; does not reappear during the current session |
| **Priority** | Medium |

---

### BYR_DASH_008 — Creative Tiles render with marketing imagery

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Scroll to the Creative Tiles section |
| **Expected Result** | Creative Tiles display project highlights and marketing imagery from Strapi; images load without broken icons |
| **Priority** | Medium |

---

## Registrations Table

### BYR_DASH_009 — Registrations table displays all buyer registrations

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer has at least one registration |
| **Test Steps** | 1. Scroll to Registrations table<br>2. Count rows |
| **Expected Result** | One row per buyer registration; columns: Registration Number, Home Loan, Allotted Unit, Status, Process Status, Payment Schedule |
| **Priority** | Critical |

---

### BYR_DASH_010 — Registration Number formatted as GHNG-XXXXXXXXXX

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Registrations table populated |
| **Test Steps** | 1. Observe the Registration Number column |
| **Expected Result** | Each registration number follows format `GHNG-XXXXXXXXXX` (10 alphanumeric chars) |
| **Priority** | High |

---

### BYR_DASH_011 — Status column shows "Available" with green badge

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer has registration with status Available |
| **Test Steps** | 1. Locate registration row<br>2. Observe Status column |
| **Expected Result** | Status badge shows "Available" with green styling |
| **Priority** | High |

---

### BYR_DASH_012 — Status column shows "Waitlisted" with dark badge

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer is on waitlist |
| **Test Steps** | 1. Locate registration row<br>2. Observe Status column |
| **Expected Result** | Status badge shows "Waitlisted" with dark/grey styling |
| **Priority** | High |

---

### BYR_DASH_013 — Status column shows "Booked" with green checkmark

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer has completed unit payment (WINNER status) |
| **Test Steps** | 1. Locate registration row<br>2. Observe Status column |
| **Expected Result** | Status badge shows "Booked" with green styling and checkmark icon |
| **Priority** | Critical |

---

### BYR_DASH_014 — Status column shows "Refunded" with red badge

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Registration was cancelled and refunded |
| **Test Steps** | 1. Locate cancelled registration row<br>2. Observe Status column |
| **Expected Result** | Status badge shows "Refunded" with red styling |
| **Priority** | High |

---

### BYR_DASH_015 — Allotted Unit column blank until allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Pre-allocation buyer (status Available or Waitlisted) |
| **Test Steps** | 1. Observe Allotted Unit column on relevant rows |
| **Expected Result** | Allotted Unit cell is blank or shows "—" for pre-allocation rows |
| **Priority** | Medium |

---

### BYR_DASH_016 — Allotted Unit column shows unit details after booking

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer has WINNER status with confirmed unit |
| **Test Steps** | 1. Observe Allotted Unit column for the booked row |
| **Expected Result** | Cell shows full unit description (e.g., "3502-Crest \| 1 Bed Growth Home \| 323 sq.ft.") |
| **Priority** | Critical |

---

## Process Status & Journey-Based CTAs

### BYR_DASH_017 — "Proceed to Confirm" CTA when campaign live & Available

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Campaign ACTIVE; buyer status = Available |
| **Test Steps** | 1. Observe Process Status column |
| **Expected Result** | "Proceed to Confirm" button visible in Process Status column; clicking it navigates to allotment screen |
| **Priority** | Critical |

---

### BYR_DASH_018 — "Complete KYC" CTA when WINNER & KYC pending

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer status = Booked; KYC not yet submitted |
| **Test Steps** | 1. Observe Process Status column<br>2. Observe alert text below |
| **Expected Result** | "Complete KYC" button (red/orange) visible; warning text: "Required to complete the allotment!" |
| **Priority** | Critical |

---

### BYR_DASH_019 — "Pay >" CTA in Payment Schedule column when milestone due

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer has booked unit; milestone payment due |
| **Test Steps** | 1. Locate booked registration row<br>2. Observe Payment Schedule column |
| **Expected Result** | "Pay >" button visible; clicking it navigates to payment schedule / payment gateway |
| **Priority** | Critical |

---

### BYR_DASH_020 — Waitlisted row shows no actionable button

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer is Waitlisted |
| **Test Steps** | 1. Observe Process Status column on the waitlisted row |
| **Expected Result** | No actionable button (no "Proceed to Confirm" / no "Pay"); message indicates "Waitlisted — wait for next campaign" or column is empty |
| **Priority** | High |

---

### BYR_DASH_021 — Process Status updates in real-time when campaign goes live

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Buyer on dashboard before campaign starts |
| **Test Steps** | 1. Stay on dashboard<br>2. Wait until admin starts a campaign<br>3. Observe without refreshing |
| **Expected Result** | Status banner & Process Status column update via WebSocket without page refresh; CTA changes from waiting to "Proceed to Confirm" |
| **Priority** | High |

---

## Navigation & Logout

### BYR_DASH_022 — Clicking My Unit navigates to /allotted-units

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded; user has WINNER status |
| **Test Steps** | 1. Click "My Unit" in the top navigation |
| **Expected Result** | URL changes to `/allotted-units`; Unit Details page loads |
| **Priority** | High |

---

### BYR_DASH_023 — Clicking Project navigates to /project

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Click "Project" in top nav |
| **Expected Result** | URL changes to `/project`; Project Information page loads |
| **Priority** | High |

---

### BYR_DASH_024 — Logout returns user to login page

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Dashboard |
| **Pre-conditions** | Dashboard loaded |
| **Test Steps** | 1. Click profile/avatar<br>2. Click Logout |
| **Expected Result** | Session cleared; user redirected to `https://uat.xrportal.in/`; protected URLs no longer accessible |
| **Priority** | Critical |

---
