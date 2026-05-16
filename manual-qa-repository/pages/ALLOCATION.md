# ALLOCATION MODULE — Page Documentation

**Module:** Allocation (Static)
**Sprint:** 3
**Last updated:** 2026-03-29
**Source:** Static_Allocation_E2E_TestCases.pdf (UAT-verified)

---

## URLs

| Page | URL |
|------|-----|
| Admin — Allocation Campaign Management | `https://uat-web.xrportal.in/admin/allocation` |
| Customer — Home Dashboard | `https://uat.xrportal.in` |
| Customer — Allotment | `https://uat.xrportal.in/allotted` |
| Customer — Unit Selection | `https://uat.xrportal.in/unitselection` |
| Customer — KYC | `https://uat.xrportal.in/kyc` |

---

## 1. Admin — Allocation Campaign Management

### 1.1 Page Layout

- **Top:** New Allocation Campaign form
- **Bottom:** Campaign list table with filters

**Left navigation menu items:** Customers | Config | Allocation | Towers | JBP Mgmt | Channel Partners | Sales Managers

---

### 1.2 Create Campaign Form

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Project | Dropdown | Yes | Select: Xanadu Test Project |
| Campaign Name | Text input | Yes | Must be unique per run — pattern: `Static Camp-Automation Test [N]` |
| Allocation Type | Dropdown | Yes | Default: **Static** — DO NOT change |
| Start Time IST | Datetime picker | Yes | Must be **≥ 3 minutes** from now — recommended: now + 4 min |
| End Time IST | Datetime picker | Yes | Must be after Start Time — recommended: Start + 5 min |
| Description / Notes | Textarea | No | Optional — e.g. `Automation E2E Test` |

**Buttons:**
- **Save Campaign** — submits form; shows success toast on save
- **Reset** — clears all fields

**Validation Rules:**
- Start time < 3 min from now → red banner: *Start time must be at least 3 minutes from now. Please select start and end time again.*
- End time empty → inline error: *End time is required*
- Each required field shows inline error if left empty on submit
- Campaign is NOT saved if any validation fails

**Success Toast:** `Campaign created successfully`

---

### 1.3 Campaign Status Flow

```
Upcoming ──► Active ──► Completed  (End time passed automatically)
   │             │
   └──► Cancelled  (manual — Cancel from Upcoming)
                 └──► Stopped  (manual — Stop from Active before End Time)
                 └──► Failed  (system error)
```

**Status filter dropdown — all 7 options:**

| # | Status | Badge colour | Meaning | Available Actions |
|---|--------|-------------|---------|-------------------|
| 1 | All Status | — | Default — shows all campaigns | — |
| 2 | Active | Green | Running — start time reached, end time not yet reached | View · Stop |
| 3 | Upcoming | Grey | Created, start time not yet reached | View · Cancel |
| 4 | Completed | Light green | Ended automatically after End Time | View |
| 5 | Stopped | — | Manually stopped by admin before End Time | View |
| 6 | Cancelled | — | Cancelled before it started | View |
| 7 | Failed | — | System error during campaign | View |

> **Important:** Stopped (manual) and Completed (auto) result in the **same closed state** on the customer portal.

---

### 1.4 Campaign List Table Columns

| Column | Description |
|--------|-------------|
| Campaign Name | Name given at creation |
| Allocation Type | STATIC or DYNAMIC |
| Start Time | IST datetime |
| End Time | IST datetime |
| Status | Upcoming / Active / Stopped / Completed / Cancelled / Failed |
| Actions | View · Cancel (Upcoming) · Stop (Active) |

**Pagination:** Total X campaigns count shown at bottom right. 10/page selector visible at bottom right.

---

### 1.5 Stop Confirmation Popup

Appears when **Stop** is clicked on an Active campaign:

| Element | Value |
|---------|-------|
| Popup Title | *Stop Allocation Now?* |
| Popup Message | *Campaign will move to Stopped.* |
| Button 1 | **Close** |
| Button 2 | **Yes, Stop Now** (red button) |

After clicking **Yes, Stop Now:**
- Status changes to **Stopped**
- Actions column shows **View only** (Stop button disappears)

---

### 1.6 Filters

| Filter | Options |
|--------|---------|
| Project | Project name dropdown |
| Status | All Status · Active · Upcoming · Completed · Stopped · Cancelled · Failed |
| Type | All Types · Static · Dynamic |
| Search | Free-text search by Campaign Name |
| Refresh | Reloads campaign list |

---

## 2. Customer — Login Page

**URL:** `https://uat.xrportal.in`

### 2.1 Page Layout

- **APPLICANT LOGIN panel** visible on right side
- **Indian National** and **NRI** tabs at top of login panel
- Mobile Number input field
- Send OTP button

### 2.2 Login Flow

1. Select **Nationality** tab = **Indian National** *(required before entering mobile)*
2. Enter Mobile Number = `1111111207`
3. Click **Send OTP**
4. Enter OTP = `147258` *(fixed UAT OTP)*
5. Click **Verify OTP**
6. Redirected to Home dashboard — *Welcome, Mamta Solanki* shown

### 2.3 Error Cases

- Invalid OTP → error message shown (e.g. *Invalid OTP*) — user stays on login page
- User NOT redirected to dashboard on invalid OTP

---

## 3. Customer — Home Dashboard

**URL:** `https://uat.xrportal.in`

### 3.1 Left Navigation Menu

Items visible after login: **Home | Registration | Allotment | Homeloan | Project | Work Progress**

### 3.2 Details Table — Columns

| Column |
|--------|
| Registration Number |
| Home Loan |
| Allotted Unit |
| Status |
| Process Status |
| Payment Schedule |

### 3.3 Registration Numbers and Statuses (Mamta Solanki)

| Registration Number | Status During Active Campaign | Process Status |
|---------------------|------------------------------|----------------|
| GHNG-1000000063-A | **Available** (green) | **Proceed to Confirm** button |
| GHNG-1000000063-B | **Waitlisted** (dark badge) | — |
| GHNG-1000000063-C | **Refunded** (red badge) | — |
| GHNG-1000000063-D | **Refunded** (red badge) | — |
| GHNG-1000000063-E | **Refunded** (red badge) | — |
| GHNG-1000000063-F | **Waitlisted** (dark badge) | — |
| GHNG-1000000063-G | **Waitlisted** (dark badge) | — |

**After campaign Stops or Completes:**
- GHNG-1000000063-A → **Booked** (already booked and paid)
- All others remain Waitlisted
- No registration shows Available anymore

### 3.4 Other Dashboard Elements

- **Allotment Closing countdown timer** visible during active campaign
- **Add Units** button visible at top right
- After booking: GHNG-1000000063-A shows *Allotted Unit* = `3502-Crest | 1 Bed Growth Home | 323 sq.ft.`
- After booking (pre-KYC): Process Status = red/orange **Complete KYC** button with alert icon + warning: *Required to complete the allotment!*

---

## 4. Customer — Allotment Page

**URL:** `https://uat.xrportal.in/allotted`

### 4.1 Entry Points

- Click **Proceed to Confirm** on Available registration from Home dashboard
- Click **Allotment** in left navigation menu

### 4.2 Page Layout

| Panel | Content |
|-------|---------|
| Left | Registration list with status badges — green **Book Now** button for Available |
| Center | Selected registration details / unit confirmation / closed message |
| Right | Floor & Unit Plan · Cost Sheet · Payment Schedule · Pay Now buttons |
| Top right | Confirmation window countdown timer |

### 4.3 Congratulations Message

When entering Allotment page via Proceed to Confirm:
> *Congratulations Mamta! You're Eligible to Select Your Growth Home!*

### 4.4 Center Panel States

| State | Content |
|-------|---------|
| No unit selected | Registration No shown after clicking Book Now |
| Unit selected | `3502 – Crest` · Registration No: GHNG-1000000063-A · Change Unit link |
| Campaign ended | RED text: **Allocation window is closed for now.** |

### 4.5 Action Buttons

| Button | Condition | Effect |
|--------|-----------|--------|
| Book Now | Available registration · Active campaign | Updates center panel with Registration No |
| Select Unit > | After Book Now clicked | Opens unit selection screen |
| Change Unit | After unit added | Opens unit selection to replace unit |
| T&C Checkbox | Required before Pay | Must be ticked to enable Pay button |
| Confirmation Amount Pay Rs. 27,000 | T&C ticked | Opens Easebuzz gateway |
| Floor & Unit Plan > | Always visible | Opens floor plan |
| Cost Sheet > | Always visible | Opens cost sheet |
| Payment Schedule > | Always visible | Opens milestone list |
| Pay Now | After campaign ends (inactive) | Visible but inactive |

---

## 5. Customer — Unit Selection Page

**URL:** `https://uat.xrportal.in/unitselection`

### 5.1 Page Header

`Select Unit for GHNG-1000000063-A`

### 5.2 Tower Panel (left side)

Five towers available with unit counts:

| Tower | Count |
|-------|-------|
| Crest | 159 Units Available |
| Crown | — |
| Blossom | — |
| Pinnacle | — |
| Bright | — |

### 5.3 Unit Grid (center)

- Floors **1–35** visible on left of grid
- **8 unit columns** per floor (Unit-1 to Unit-8)
- Colour coding:

| Colour | Status | Selectable |
|--------|--------|------------|
| White / light border | Available | Yes |
| Green | Selected (current session) | — |
| Red | Sold | No — no action on click |
| Orange | Paying now (another session) | No |
| Grey | Refuge (reserved/blocked) | No |

### 5.4 New Unit Details Panel (right side)

Appears when an Available unit is clicked:

| Field | Example Value (Unit 3502 · Crest) |
|-------|----------------------------------|
| Unit No | 3502 – Crest |
| BHK | 1 BHK Growth Home |
| Size | 323 sq.ft. |
| Agreement Value | Rs. 32,99,000 |
| Home Loan Offer Discount | -Rs. 10,000 |
| Early Bird Benefit Discount | -Rs. 27,000 |
| All Inclusive Price | Rs. 35,52,960 |
| Total Discount badge | Rs. 37,000 |

**Buttons:** Cancel · **Add >**

Clicking a **Sold (red)** unit: no action — New Unit Details panel does NOT open.

---

## 6. Customer — Payment Gateway

**Gateway:** Easebuzz
**Merchant:** Impactum Lands Private Limited
**Confirmation Amount:** Rs. 27,000
**UAT Test Amount:** Rs. 100 *(shown at bottom of Easebuzz popup)*
**Link Validity:** ~15 minutes from when popup opens

### 6.1 Payment Methods

1. Credit Card (RuPay / Mastercard / Visa logos)
2. Debit Card
3. UPI (BHIM / UPI logos)
4. NetBanking
5. Wallets

### 6.2 Cancel Flow

Click **Cancel (X)** on gateway popup → returns to Allotment page with unit still selected and T&C checkbox still checked.

### 6.3 Payment Success Screen

- Green checkmark icon
- Message: *Payment successful!*
- Sub-text: *You're just one step away from your dream home*
- Add Applicants section shows unit: `3502 – Crest – 1 Bed Growth Home (323 sq.ft.)`
- Mamta Solanki (Self) shown in applicant list
- Buttons: **Verify Details · Add Applicant · Go to Home · Confirm**

---

## 7. Customer — KYC Page

**URL:** `https://uat.xrportal.in/kyc`

### 7.1 KYC Requirements

| Rule | Value |
|------|-------|
| Maximum Applicants | 4 total (including primary applicant) |
| Allowed Relationships | Parents · Spouse · Siblings · Children (blood relatives only) |
| Mandatory Documents (per applicant) | 1. Photo · 2. PAN Card · 3. Aadhaar Front · 4. Aadhaar Back |
| PAN Number Format | ABCDE1234F |
| Aadhaar Number Format | 1234 5678 9012 (12 digits) |

### 7.2 Primary Applicant (auto-filled)

Fields pre-filled: Name · Mobile · Email · Full Address · Pincode · Relationship = Self

### 7.3 Co-Applicant Form Fields

| Field | Type | Required |
|-------|------|----------|
| First Name | Text | Yes |
| Last Name | Text | Yes |
| Mobile | Tel | Yes |
| Email | Email | Yes |
| Full Current Address | Text | Yes |
| Pincode | Text | Yes |
| Relationship | Dropdown | Yes |
| Photo | File upload | Yes |
| PAN Number + PAN Card | Text + File | Yes |
| Aadhaar Number + Aadhaar Front | Text + File | Yes |
| Aadhaar Back | File | Yes |

**Applicant saved toast:** *Applicant details saved successfully*

**Max limit:** When 4 applicants reached → `+ Add Applicant` button disabled / hidden + label *Max. 4 Applicants allowed* shown.

### 7.4 KYC Flow

```
Payment Success Page
        │
        ▼
Click Verify Details → Applicant form (pre-filled for primary)
        │
        ▼
Add co-applicants (optional, max 3 additional) with all 4 documents each
        │
        ▼
Click Confirm > → KYC Summary page
        │
        ▼
KYC Summary shows: Registration Details | Booking Number | Selected Unit | Applicant count
T&C checkbox present (unchecked by default) · Back button available
        │
        ▼
Tick T&C → Click Confirm > → KYC Submitted Successfully
        │
        ▼
Table: Registration No | KYC Number | Unit | No. of Applicants
Process Status = KYC Completed
"Download your Unit Details" link + "Go to Home" button
```

### 7.5 Digital Booking Form (Download)

Opens in browser print preview. Shows:
- Registration No · Transaction IDs · Unit Number · Tower Name
- All applicant details: Name · Mobile · Email · Address · Relationship · PAN · Aadhaar

---

## 8. Customer — Milestone Payments

**URL:** `https://uat.xrportal.in/home` → click Pay > in Payment Schedule column

### 8.1 Payment Schedule Table Columns

| Column |
|--------|
| MILESTONE |
| % DUE |
| GST |
| AMOUNT |
| TOTAL AMOUNT |
| TOTAL OUTSTANDING |
| PAYMENT STATUS |
| PAY |
| TRANSACTION DETAILS |

**Pre-paid milestones after allocation:**
- Online Registration → Status = **Paid** · Transaction Details = View link
- Unit Allocation → Status = **Paid** · Transaction Details = View link
- All remaining milestones → Status = **Pending** · Pay > button visible

### 8.2 Transaction Details Side Panel

Shows: Principal Amount · GST · Total Amount · Outstanding Amount to Pay = Rs. 0
Payment Breakdown: Transaction ID · Type · Amount Paid · Mode · Status = Paid

### 8.3 PAY Popup

Example — Home Confirmation Fees:
- Principal: Rs. 2,95,929
- GST: Rs. 3,229
- Outstanding: Rs. 2,99,158
- Due date warning shown in red (if applicable)

| Option | Description |
|--------|-------------|
| Full Payment | Pay the full outstanding amount |
| Partial Payment | Enter lesser amount — outstanding reduces accordingly |
| Payment Mode | Online |

---

## 9. Post-Campaign Behaviour (Key Rules)

| Rule | Detail |
|------|--------|
| Available → Waitlisted | After Stopped or Completed, all Available registrations become Waitlisted |
| Booked stays Booked | GHNG-1000000063-A (already booked and paid) keeps Booked status |
| Allotment page closed message | Center panel RED text: *Allocation window is closed for now.* |
| Select Unit visibility | Select Unit button NOT visible after campaign ends |
| Right panel buttons | Floor & Unit Plan · Cost Sheet · Payment Schedule · Pay Now — visible but inactive |
| Manual Stop result | Status = Stopped — same customer experience as auto-complete |
| Auto Complete result | Status = Completed — same customer experience as manual stop |

---

## 10. Selector File

`docs/selectors/allocation.json` — 90+ selectors across 10 sections.

Loaded via `selectorHelpers.js`:
```js
const s = loadSelectors('allocation');
```

---

## 11. Page Object

`src/pages/AllocationPage.js` — covers Admin and full Customer portal flow.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-29 | Initial documentation — Sprint 3 (based on Static_Allocation_E2E_TestCases.pdf) |
