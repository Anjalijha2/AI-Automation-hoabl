# Visual Memory — Sales Manager Portal / Physical Allocation

**Captured:** 2026-06-06 (real-flow refresh after discovering pre-seeded registrations)
**Previous capture:** 2026-06-06 (initial active-campaign capture — search returned empty)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/sales-manager/physical-allocation)
**CAPTURE_STATUS:** FULL

---

## Route

- **URL:** `https://uat-web.xrportal.in/sales-manager/physical-allocation`
- Source: `source-code/admin-sm-cp-portal/src/routes/Private/sales-manager/index.jsx`
  ```jsx
  <Route path="physical-allocation" element={<CustomerSearchPage />} />
  <Route path="physical-allocation/checkout" element={<UnitAllocationPage />} />
  <Route path="physical-allocation/kyc" element={<KycPage />} />
  ```
- Module is **campaign-driven**: the SM can only allocate units during an active Physical Event campaign.
- Three sub-routes form the allocation pipeline:
  1. `/physical-allocation` → `CustomerSearchPage` (entry point — always reachable)
  2. `/physical-allocation/checkout` → `UnitAllocationPage` (guarded: redirects to `/physical-allocation` if `location.state.customer` is missing)
  3. `/physical-allocation/kyc` → `KycPage` (renders blank if `location.state.customerContext` is missing — no crash, no redirect)
- Sidebar shows "Allocation" as the nav label (icon: calendar glyph) — selected (green tile) when on this route.

---

## Active Campaign in UAT (capture window)

Captured live from `GET /api/v1/sales-manager/physical-event/campaign/active`:

| Field        | Value                                              |
|--------------|----------------------------------------------------|
| id           | `295`                                              |
| name         | `Test New Physical Campaign`                       |
| status       | `RUNNING`                                          |
| startTime    | `2026-06-06T04:15:00.000Z`                         |
| endTime      | `2026-06-14T18:30:00.000Z`                         |
| projectId    | `project-1708669316677`                            |
| description  | `null`                                             |

Admin endpoint `GET /api/v1/admin/allocation/campaigns/295` reports:

| Field                              | Value |
|------------------------------------|-------|
| totalRegistrationsUploaded         | 6     |
| totalAssignedUniqueUnitsUploaded   | 5     |
| totalCommonPoolUnits               | 1015  |
| totalCommonPoolAvailable           | 1015  |
| totalCommonPoolBooked              | 0     |
| initialPendingRegistrations        | 3     |
| currentPendingToBook               | 3     |
| totalBookings                      | 0     |

> Note: the campaign **name is NOT rendered anywhere on the page** (no banner card, no title bar) — the only visible cue that a campaign is active is the search input being **enabled** (vs. disabled in the "No Active Campaign" idle state). The top header bar shows a static marketing strip "India's Biggest Growth Housing Revolution Begins On 7th April 2026." which is global chrome, not campaign-driven.

### Pre-seeded registrations in UAT campaign 295

Discovered via `GET /api/v1/admin/allocation/campaigns/295/allotments/export` (returns Excel; 6 rows across 3 registrations):

| Registration #         | Buyer name           | Phone        | Status        | Allotted towers / units |
|------------------------|----------------------|--------------|---------------|--------------------------|
| `GHNG-2000000014-A`    | Anjali WhatsAppTemp  | `7666470638` | PREALLOCATED  | Crest 1404 / Crest 1407 / Aspire 2805 |
| `GHNG-2000000024-A`    | aman guptaa          | `7020527871` | PREALLOCATED  | Aura (single allotment, towerId `testtower-1757934191076`) |
| `GHNG-2000000009-Y`    | Supriya Dubey        | `9167746035` | HOLD          | Crest / Aspire (under verification — already paying) |

**Why the previous capture saw `data: []`:** the earlier probe queried fictional phone numbers (`8888888888`, `9999999999`, etc.) which are not in the seeded set. The SM search uses MySQL `LIKE %<term>%` against `User.phone`, `firstName`, `lastName` *plus* `RegistrationUnit.registrationNumber`. Any of `7666470638`, `GHNG-2000000014-A`, `2000000014`, `aman`, `supriya` will return a match. The minimum debounce/search threshold is `q.trim().length >= 5`.

Pool towers exposed for campaign 295 (from `GET /api/v1/sales-manager/physical-event/pool-towers?campaignId=295`):

| Tower id                              | Name      |
|---------------------------------------|-----------|
| `testtower-1757934253141`             | Pride     |
| `testtower-1757934321125`             | Aspire    |
| `testtower-1757934355725`             | Crest     |
| `testtower-1757934372776`             | Triumph   |
| `testtower-1757934389408`             | Crown     |
| `testtower-1757935119294`             | Radiance  |

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `allocation-loaded-active.png` | Landing — active campaign RUNNING. Search input enabled, "Scan QR" button enabled. No results table shown (no query yet). | Live 2026-06-06 |
| `allocation-search-form.png` | Focused crop of the `.search-card` showing the search input ("Search by Phone or Registration Number...") and "Scan QR" button. | Live 2026-06-06 |
| `allocation-search-result.png` | **UPDATED:** Search for phone `7666470638` returns 1 row — Anjali WhatsAppTemp / GHNG-2000000014-A / Registration Count 1 / Select button (green primary). Columns: Customer Name \| Phone Number \| Registration Numbers \| Registration Count \| Action. | Live 2026-06-06 (real flow) |
| `allocation-search-no-result.png` | After typing `ZZNOTFOUND` — "No data" Ant empty state. | Live 2026-06-06 |
| `allocation-customer-selected.png` | **UPDATED:** Same search-result frame with the customer row **hovered** and the **Select** button focused (visible focus-ring + hover shading) — the moment immediately before navigation. There is no intermediate "selected but still on search page" state because `Select` triggers `navigate('.../checkout', { state: { customer, campaign } })` synchronously. | Live 2026-06-06 |
| `allocation-checkout.png` | **UPDATED:** Real `UnitAllocationPage` rendered for Anjali. Three columns: **Customer Information** + **Customer Registrations** + **Customer Preferences** (left), **Pre Allocated Units** with 3 unit-cards `Crest 1404`, `Crest 1407`, `Aspire 2805` + **Common Pool** button (centre), **Unit Details** ("Click a unit to view details") + **Unit Allocation Cart** ("No units selected for allocation.") (right). All units carry green "Available" badge. | Live 2026-06-06 |
| `allocation-checkout-fullpage.png` | Same checkout state but `fullPage: true` — scrolling extends Customer Preferences table to show the buyer's full preference list (Crest/Blossom/Glory rows with "Booked" pills). | Live 2026-06-06 |
| `allocation-checkout-unit-selected.png` | **NEW:** First unit-card (Crest 1404) clicked → card flips to green "Selected" badge, other cards dim to 40 % opacity. Right rail populates: Unit Details with header `1404` / Crest / `2 BHK Growth Home` / `485 sq.ft`, full pricing breakdown (Agreement Value `₹49,99,000`, Car Parking unchecked `₹5,00,000`, Home Loan Discount `-₹10,000`, Final Agreement `₹49,99,000`, Stamp Duty 7 % `₹3,49,930`, GST 5 % `₹2,49,950`, Registration Charges `₹30,000`, **All inclusive `₹56,28,880`**), Total Discount `₹0`, **Payment Schedule** + **Cost Sheet** action buttons, Unit Allocation Cart row with combined payable `₹5,18,647`. | Live 2026-06-06 |
| `allocation-checkout-unit-selected-fullpage.png` | Full-page variant — bottom of right rail reveals **Collect payment without GST** checkbox, **Online Payment / Offline Payment** radio (Online preselected), **I agree to Terms & Conditions** checkbox, **Proceed to Pay** button (currently disabled — pay button requires T&C agreement). | Live 2026-06-06 |
| `allocation-kyc.png` | Direct nav to `/physical-allocation/kyc` → URL stays on `/kyc` but body renders **completely blank** (white screen). `KycPage` destructures `customerContext` from `location.state \|\| {}`; with `undefined`, all child components short-circuit and no UI mounts. | Live 2026-06-06 |
| `allocation-loaded.png` | Legacy 2026-06-05: "No Active Campaign" idle state. | preserved |
| `allocation-empty.png` | Same idle state, alt crop, 2026-06-05. | preserved |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17. | preserved |

### NOT captured (and why)

| File | Why not |
|------|---------|
| `allocation-kyc-populated.png` (populated KYC form) | The "KYC & E-Sign" link is rendered in the Pre Allocated Units card header **only** when `registration.status === 'WINNER'` (i.e. unit fully booked + paid). For PREALLOCATED status, the same slot renders a "Common Pool" button instead. None of the 3 seeded registrations are in WINNER state. Reaching populated KYC requires completing a real booking + payment cycle — out of scope for visual capture (forbidden by capture protocol). Direct nav to `/kyc` is captured (blank state) instead. |
| `allocation-confirmation.png` | Confirmation/success screen requires completing real KYC submission + payment (`POST /api/v1/sales-manager/physical-event/kyc/submit` + EaseBuzz / Razorpay gateway). Capture protocol forbids irreversible actions. |
| `allocation-common-pool-drawer.png` | Triggered by clicking the **Common Pool** button — opens a side drawer with browsable units. Not part of the current 3-screenshot brief, but the trigger is documented below for future capture. |

---

## Key Structural Notes

### Page heading
- `<h5>Physical Unit Allocation</h5>` inside `.header-admin.new-header-text`
- Active-campaign state is detectable only via:
  - search input `disabled` attribute is `false` (vs. `true` when no campaign)
  - "Scan QR" button `disabled` attribute is `false`
  - Absence of the `🏢 No Active Campaign` empty-state card

### Search card (`.search-card`)
- `<Card class="search-card">` containing one `Row` with two cols.
- Left col (flex auto): `<Input size="large" class="ant-input ant-input-lg search-input" placeholder="Search by Phone or Registration Number...">` bound to `searchValue` state.
  - **Stable selector:** `input.search-input`
  - **Placeholder fallback:** `input[placeholder*="Phone or Registration"]`
- Right col: `<Button size="large" icon={<QrcodeOutlined />}>Scan QR</Button>` — opens `QrScannerModal` (camera-based registration lookup).
  - **Stable selector:** `button:has-text("Scan QR")`
- Both elements get `disabled={!isRunning}` where `isRunning = campaign?.status === 'RUNNING'`.

### Debounce / behaviour
- Source `handleSearch`: typing triggers a 500 ms `setTimeout`, then calls `performSearch` only if `query.trim().length >= 5`. Tests must:
  - Type at least 5 chars before expecting any API call.
  - Wait ≥ 500 ms + network round-trip (~ 2 s in UAT) before asserting on result rows.
- Clearing the input (`length === 0`) clears `searchResults` immediately and unmounts the table.

### Results table (Ant Design `Table`)
- Mounted as a child `<Row>` inside `.search-card` only when `searchValue.length > 0` (truthy).
- Columns (in order, hard-coded in source):
  1. **Customer Name** — `dataIndex: 'name'`, render `<span class="customer-name">{text}</span>`
  2. **Phone Number** — `dataIndex: 'phone'`, width 180, render `<span class="customer-phone">{text}</span>`
  3. **Registration Numbers** — `key: 'registrationNumbers'`, render joins `record.registrations?.map(r => r.registrationNumber).join(', ')`
  4. **Registration Count** — `dataIndex: 'registrationCount'`, width 180, align centre
  5. **Action** — fixed right, align centre, render `<Button type="primary" class="select-action-btn" onClick={navigate(...)}>Select</Button>`
- Empty-state cell: `.ant-empty` with `.ant-empty-description` text "No data" (Ant default).
- **Stable selectors:**
  - Table: `.search-card .ant-table`
  - Headers: `.ant-table-thead th`
  - Rows: `.ant-table-tbody tr.ant-table-row`
  - Select button: `button.select-action-btn` (primary) or `button:has-text("Select")`
  - Empty placeholder: `.ant-empty-description` :text("No data")

### Checkout page (`/physical-allocation/checkout`)

Container: `<main class="ant-layout-content page-content"> → div.physical-event-container`

Top bar: `div.allocation-topbar` — contains "← Back to Physical Allocation" link + "Upload Documents" button.

Three-column body: `div.ant-row.three-section-layout` with three Ant Cards:

#### Column 1 (left) — Customer Information + Registrations + Preferences
- `.ant-card.section-card` (no further class)
- Header text: "Customer Information"
- Body:
  - User icon + `Anjali WhatsAppTemp`
  - Phone icon + `7666470638`
  - "Customer Registrations" subheading
  - Selectable registration cards: `GHNG-2000000014-A` shown with "Not Started" pill (status label maps from registration.status: `HOLD → Verification`, `WINNER → Booked`, else → `Not Started`)
  - "Customer Preferences" subheading
  - Ant Table with columns Registration / Tower / Unit No / Status — each row shows a "Booked" pill (these are the buyer's prior preferences, not unit assignments)
- **Selectors:**
  - Customer info card: `.ant-card.section-card:has(:text("Customer Information"))`
  - Registration card (clickable to switch active reg): `.ant-card.registration-card` (likely — needs DOM confirmation if multiple)
  - Preferences table: `.allocation-table .ant-table-tbody tr.ant-table-row`

#### Column 2 (centre) — Pre Allocated Units
- `.ant-card.section-card.pre-allocated-card`
- Header title: "Pre Allocated Units"
- Header extra (right side):
  - If `registration.status !== 'WINNER'` (i.e. Not Started, Verification): `<button class="common-pull-btn common-pull-btn--compact">Common Pool</button>`
  - Else if `!isKycSubmitted`: `<Link class="kyc-link-btn kyc-link-btn--compact" to="/sales-manager/physical-allocation/kyc">⛨ KYC & E-Sign</Link>`
  - Else: `<Link class="kyc-link-btn kyc-link-btn--compact" to="...">✓ KYC Done</Link>`
- Body: `.unit-grid-container > .unit-grid` containing one or more `.unit-card`:
  - Base class: `unit-card`
  - State modifiers (space-separated):
    - `selected` — actively chosen card (green border)
    - `common-pool-selected` — was picked from Common Pool drawer
    - `unit-card--available` / `unit-card--hold` / `unit-card--booked` (lowercase of `uiStatus`)
    - `disabled` — already selected for another registration or owned by someone else
    - `dimmed` — another card is selected; this one fades to 0.4 opacity
  - Inside each unit-card:
    - `.unit-badges` row of small chips: `.unit-source-badge.selected-badge`, `.available-badge`, `.booked`, `.paying`, or `Common Pool` tag
    - `.tower-name` (e.g. "Crest")
    - `.unit-number` (e.g. "Floor - 14: Flat - 1404")
    - typology + sq.ft text
  - Below the grid: a large green `.common-pull-btn` "Common Pool" button (full-width) that opens the pool drawer
- **Stable selectors:**
  - All unit cards: `.unit-grid .unit-card`
  - Selected unit card: `.unit-card.selected`
  - Available cards: `.unit-card.unit-card--available:not(.disabled)`
  - First available: `.unit-card.unit-card--available:not(.disabled):not(.dimmed)`
  - Common Pool button: `button.common-pull-btn` (full-width footer) or `button.common-pull-btn--compact` (compact header variant)
  - KYC link: `a.kyc-link-btn` (only present when registration is WINNER)
- **Click behaviour:** `onClick={handleUnitClick}` selects/deselects the card locally and fetches pricing via `GET /api/v1/sales-manager/physical-event/allocation-unit-details`. **No mutation** is performed at this stage — no PUT `/update-unit-status`. The hold + payment flow runs only when "Proceed to Pay" is clicked.

#### Column 3 (right) — Unit Details + Unit Allocation Cart
- Stacked Ant Cards:
  - `.ant-card.section-card.details-card` — title "Unit Details"
    - Empty-state body: centred placeholder "Click a unit to view details"
    - Populated body (after `.unit-card.selected`):
      - `.compact-unit-header`
        - `.compact-unit-info` — `.compact-unit-number` (e.g. "1404") + `.compact-unit-tower` (e.g. "Crest")
        - `.compact-unit-specs` — two `.compact-spec` blocks: BHK label + value, Area label + value
      - `.compact-pricing` — list of `.compact-price-row` items
        - `.price-row-label` + `.price-row-value` — Agreement Value, Car Parking (with `.parking-option-checkbox`), Home Loan Discount (negative), Final Agreement Value, Stamp Duty (7 %), GST (5 %), Registration Charges, *All inclusive (highlighted total)
      - `.total-discount-banner` (yellow) — "Total Discount: ₹0"
      - Action buttons: **Payment Schedule** + **Cost Sheet** (`<button class="schedule-btn">` and `<button class="cost-sheet-btn">` — names approximate; confirm in next capture).
  - `.ant-card.section-card.unit-allocation-card.mt-3` — title "Unit Allocation Cart"
    - Empty body: "No units selected for allocation."
    - Populated body:
      - `.unit-allocation-table-wrapper > .ant-table-wrapper.allocation-table` with columns Registration / Unit No / Amount / Action (red delete icon to unselect)
      - `.payable-amount-section`: `.payable-amount-label` "Combined Payable Amount" + `.payable-amount-value` (e.g. "₹5,18,647")
      - `.allocation-gst-option > .allocation-gst-checkbox` — "Collect payment without GST"
      - `Radio.Group` Online Payment (selected by default) / Offline Payment
      - `.terms-conditions-checkbox` — "I agree to Terms & Conditions"
      - **Proceed to Pay** button: `button:has-text("Proceed to Pay")` (initially **disabled** until T&C is checked and at least one unit is in cart)
- **Stable selectors:**
  - Unit Details card: `.ant-card.details-card`
  - Compact unit header: `.compact-unit-header .compact-unit-number`, `.compact-unit-tower`
  - Pricing rows: `.compact-price-row .price-row-label` / `.price-row-value`
  - Car-parking toggle: `input.ant-checkbox-input` inside `.parking-option-checkbox` (changes pricing)
  - Cart card: `.ant-card.unit-allocation-card`
  - Payable amount: `.payable-amount-value`
  - GST checkbox: `.allocation-gst-checkbox input.ant-checkbox-input`
  - T&C checkbox: `label:has-text("I agree to Terms & Conditions") input`
  - Proceed-to-Pay: `button:has-text("Proceed to Pay")`
  - Online / Offline payment radios: `input[type="radio"][value="online"]` / `[value="offline"]`

### KYC sub-route (`/physical-allocation/kyc`)
- Component: `KycPage.jsx`
- Destructures `customerContext` from `location.state || {}`. With no state, all child components (`Applicants`, `Summary`, `Completed`, `PaymentSuccess`) require `registration` data they never receive — page mounts but renders no visible chrome (blank white viewport).
- `currentStep` initial value: `customerContext?.registration?.isKycSubmitted ? 'success' : 'applicants'`.
- KYC entry button (`a.kyc-link-btn`) lives in the Pre Allocated Units card header but is conditionally rendered: present only when the active registration is in `WINNER` status (the unit must be paid for already). For PREALLOCATED / HOLD this slot shows the "Common Pool" button instead.
- Final submission endpoint: `POST /api/v1/sales-manager/physical-event/kyc/submit` with payload `{ userId, registrationUnitId, otpVerified, isParkingSelected: false, parkingCount: 0 }`.

### API endpoints observed (live network probe — `_probe-sm-search-real-results.json`, `_probe-campaign-295-results.json`)
| Call | Method | URL | Notes |
|------|--------|-----|-------|
| Active campaign fetch | GET | `/api/v1/sales-manager/physical-event/campaign/active` | Returns active or upcoming PHYSICAL_EVENT for the SM's project |
| Customer search | GET | `/api/v1/sales-manager/physical-event/search?campaignId=295&q=<q>` | Requires `q.trim().length >= 5` |
| Pool towers | GET | `/api/v1/sales-manager/physical-event/pool-towers?campaignId=295` | Lists towers for the Common Pool drawer |
| Pool units | GET | `/api/v1/sales-manager/physical-event/pool-units?campaignId=295[&towerId=]` | Lists pool unit cards |
| Customer context | GET | `/api/v1/sales-manager/physical-event/customer?campaignId=&registrationNumber=` | Loaded on registration-card click; powers the right rail |
| Pricing fetch | GET | `/api/v1/sales-manager/physical-event/allocation-unit-details` | Fired on every unit-card click |
| Hold unit | PUT | `/api/v1/sales-manager/physical-event/update-unit-status` | **Destructive** — fired by Proceed to Pay |
| Create allocation order | POST | `/api/v1/sales-manager/physical-event/allocation-order` | **Destructive** — fired by Proceed to Pay |
| KYC applicants list | POST | `/api/v1/sales-manager/physical-event/kyc/registration-units/applicants` | Read-only POST (gateway pattern) |
| Submit KYC | POST | `/api/v1/sales-manager/physical-event/kyc/submit` | **Destructive** — never invoke in capture |
| Notify registrants | POST | `/api/v1/admin/allocation/campaigns/:id/notify` | **Admin-only** — would SMS/WhatsApp every registrant |

Capture-protocol guard: scripts route `**/*` and `route.abort('blockedbyclient')` for any POST/PUT/DELETE that matches `update-unit-status|allocation-order|kyc/submit|kyc/send-esign|kyc/verify-esign|offline-units|additional-documents|notify`.

### Sidebar
- 3 nav items: **Callback Requests**, **Towers**, **Allocation** (selected). Logout button at the foot.
- `Allocation` tile has a green-fill selected state (other items show only an icon + text).

---

## How to re-capture in future

1. Get a fresh SM session: `npm run auth:setup` (or `npx playwright test --project=auth-setup` then `--grep "sales-manager"`).
2. Confirm campaign is `RUNNING` via `GET /api/v1/sales-manager/physical-event/campaign/active`. If not, an admin must run `POST /api/v1/admin/allocation-campaign` with `allocationType=PHYSICAL_EVENT` + `allotmentExcel` + `commonPoolExcel`.
3. Verify at least one buyer is seeded by hitting `GET /api/v1/admin/allocation/campaigns/<id>/allotments/export` (returns Excel — parse for `RegistrationId`). Then call `GET .../physical-event/search?q=<phone-or-reg>` until a non-empty `data` returns.
4. Run `scripts/capture-sm-allocation-real-flow-v2.js` — captures search-result, customer-selected, checkout, checkout-unit-selected (the 4 dynamic states). All destructive endpoints are blocked at the route layer.

## To capture the still-missing screens (booked + KYC populated)

A non-destructive booking is impossible on shared UAT because the database is shared. Two practical options:
1. **Dedicated QA sandbox campaign** with auto-cleanup after each run (recommended — needs backend support).
2. **Manual coordinated session** with a buyer who is willing to have their unit booking rolled back by the admin afterwards. Bug `BUG_xxx` should be filed if rollback is not currently supported.

---

## Sidecar files

- `_allocation-dom-inspect.json` — original empty-state DOM dump (2026-06-05)
- `_allocation-active-dom-landing.json` — DOM dump on active-campaign landing (2026-06-06)
- `_allocation-active-dom-checkout.json` — DOM dump after `/checkout` direct-nav redirect (empty)
- `_allocation-active-dom-checkout-real.json` — DOM dump after Select → checkout, depth-8 (shallow)
- `_allocation-active-dom-checkout-real-v2.json` — DOM dump with unit selected, depth-15 (full structure)
- `_allocation-active-dom-kyc.json` — DOM dump on `/kyc` direct-nav (blank body)
- `scripts/_probe-sm-active-campaign-results.json` — initial active-campaign API + 9 sample search queries (all empty)
- `scripts/_probe-campaign-295-results.json` — admin-side campaign 295 inventory (registrations + pool)
- `scripts/_campaign-295-allotments.xlsx` / `_campaign-295-allotments.json` — admin allotments export (6 rows)
- `scripts/_probe-sm-search-real-results.json` — SM search probe with real registration numbers (3 buyers found)
- `scripts/_capture-sm-allocation-real-flow-v2-results.json` — final real-flow capture log
