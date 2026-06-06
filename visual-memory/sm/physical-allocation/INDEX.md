# Visual Memory — Sales Manager Portal / Physical Allocation

**Captured:** 2026-06-06 (active-campaign refresh)
**Previous capture:** 2026-06-05 (empty-state baseline)
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
  2. `/physical-allocation/checkout` → `UnitAllocationPage` (guarded: redirects to /physical-allocation if `location.state.customer` is missing)
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
| description  | `null`                                             |

> Note: the campaign **name is NOT rendered anywhere on the page** (no banner card, no title bar) — the only visible cue that a campaign is active is the search input being **enabled** (vs. disabled in the "No Active Campaign" idle state). The top header bar shows a static marketing strip "India's Biggest Growth Housing Revolution Begins On 7th April 2026." which is global chrome, not campaign-driven.

**No customers are pre-registered to campaign 295 in UAT** as of capture time. All search queries (`8888888888`, `9000000000`, `9999999999`, `8000000000`, `7000000000`, `7777777777`, `9876543210`, `0000099999`, `REG-001`) return `data: []` from `/api/v1/sales-manager/physical-event/search`. Consequence: the Select-button click path (which would carry `location.state.customer` to `/checkout`) is **not exercisable in UAT** until a registration is seeded against campaign 295.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `allocation-loaded-active.png` | Landing — active campaign RUNNING. Search input enabled, "Scan QR" button enabled. No results table shown (no query yet). 1920×900 viewport. | Live inspection 2026-06-06 |
| `allocation-search-form.png` | Focused crop of the `.search-card` showing the search input ("Search by Phone or Registration Number...") and "Scan QR" button. | Live inspection 2026-06-06 |
| `allocation-search-result.png` | After typing `8888888888` (real numeric query, 10 chars > debounce threshold 5). Results table renders with columns **Customer Name \| Phone Number \| Registration Numbers \| Registration Count \| Action** and a centred "No data" empty-state row (no customers registered for campaign 295). | Live inspection 2026-06-06 |
| `allocation-search-no-result.png` | After typing `ZZNOTFOUND`. Identical "No data" rendering — confirms client treats absent results uniformly regardless of query content. | Live inspection 2026-06-06 |
| `allocation-checkout.png` | Direct nav to `/physical-allocation/checkout` → React Router redirects to `/physical-allocation` (per `UnitAllocationPage` guard `if (!customer \|\| !campaign) navigate('/sales-manager/physical-allocation')`). The captured frame is the landing page after redirect. | Live inspection 2026-06-06 |
| `allocation-kyc.png` | Direct nav to `/physical-allocation/kyc` → URL stays on `/kyc` but body renders **completely blank** (white screen, no content, no headings, no inputs). KycPage destructures `customerContext` from `location.state \|\| {}`; with `undefined`, fetchApplicants() short-circuits and no UI is mounted. | Live inspection 2026-06-06 |
| `allocation-loaded.png` | Legacy 2026-06-05: "No Active Campaign" idle state (no campaign was active). Kept for historic reference. | preserved |
| `allocation-empty.png` | Same idle state captured separately on 2026-06-05. | preserved |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17. | preserved |

### NOT captured (and why)

| File | Why not |
|------|---------|
| `allocation-customer-selected.png` | Cannot click `Select` — no customer rows exist in the results table for any query (`data: []` from search API for campaign 295). Reachable only after a buyer registration is seeded against the active campaign. |
| `allocation-checkout-unit-selected.png` | Requires real `location.state.customer` set by clicking Select; same blocker as above. |
| `allocation-confirmation.png` | Confirmation/success screen requires completing real KYC submission + payment (`POST /api/v1/sales-manager/physical-event/kyc/submit` + EaseBuzz / Razorpay gateway). Task instructions explicitly forbid irreversible actions, so this state is deliberately not exercised. |

---

## Key Structural Notes

### Page heading
- `<h5>Physical Unit Allocation</h5>` inside `.header-admin.new-header-text`
- No campaign name is rendered (despite the active campaign having `name="Test New Physical Campaign"` in the API response). Active-campaign state is detectable only via:
  - search input `disabled` attribute is `false` (vs. `true` when no campaign)
  - "Scan QR" button `disabled` attribute is `false`
  - Absence of the `🏢 No Active Campaign` empty-state card

### Search card (`.search-card`)
- `<Card class="search-card">` containing one `Row` with two cols.
- Left col (flex auto): `<Input size="large" class="ant-input ant-input-lg search-input" placeholder="Search by Phone or Registration Number...">` — bound to `searchValue` state.
  - **Stable selector:** `input.search-input`
  - **Aria/placeholder fallback:** `input[placeholder*="Phone or Registration"]`
- Right col: `<Button size="large" icon=<QrcodeOutlined> >Scan QR</Button>` — opens `QrScannerModal` (camera-based registration lookup).
  - **Stable selector:** `button:has-text("Scan QR")`
- Both elements get `disabled={!isRunning}` where `isRunning = campaign?.status === 'RUNNING'`. Disabled state is the SM's only visual cue that the campaign is not RUNNING.

### Debounce / behaviour
- Source `handleSearch`: typing triggers a 500ms `setTimeout`, then calls `performSearch` only if `query.trim().length >= 5`. Tests must:
  - Type at least 5 chars before expecting any API call.
  - Wait ≥ 500ms + network round-trip (~ 2 s in UAT) before asserting on result rows.
- Clearing the input (`length === 0`) clears `searchResults` immediately and unmounts the table.

### Results table (Ant Design `Table`)
- Mounted as a child `<Row>` inside `.search-card` only when `searchValue.length > 0` (truthy).
- Columns (in order, hard-coded in source):
  1. **Customer Name** — `dataIndex: 'name'`, render `<span class="customer-name">{text}</span>`
  2. **Phone Number** — `dataIndex: 'phone'`, width 180, render `<span class="customer-phone">{text}</span>`
  3. **Registration Numbers** — `key: 'registrationNumbers'`, render joins `record.registrations?.map(r => r.registrationNumber).join(', ')`
  4. **Registration Count** — `dataIndex: 'registrationCount'`, width 180, align centre, render `<span class="registration-count">{count}</span>`
  5. **Action** — fixed right, align centre, render `<Button type="primary" class="select-action-btn" onClick={...navigate('/sales-manager/physical-allocation/checkout', { state: { customer: record, campaign } })}>Select</Button>`
- Empty-state cell: `.ant-empty` with `.ant-empty-description` text "No data" (Ant default — no custom empty render is defined).
- **Stable selectors:**
  - Table: `.search-card .ant-table` (or just `.ant-table` since only one table on the page)
  - Headers: `.ant-table-thead th`
  - Rows: `.ant-table-tbody tr.ant-table-row` (only present when data > 0)
  - Select button: `button.select-action-btn` (preferred — class is component-specific) or `button:has-text("Select")` in `tbody tr`
  - Empty placeholder: `.ant-empty-description` :text("No data")

### Checkout sub-route (`/physical-allocation/checkout`)
- Component: `UnitAllocationPage.jsx`
- **Guard (line 64):** `if (!customer || !campaign) navigate('/sales-manager/physical-allocation');` — runs synchronously on mount. Direct nav from a fresh tab redirects in <500ms.
- When entered with state, the page renders (from imports + source review):
  - `TowerHeatmap` (shared component) for tower selection
  - `FloorUnitPlan` for floor-by-floor unit grid
  - `UnitDetail` drawer for unit details (Ant `Drawer`)
  - `CostSheet`, `PaymentSchedule`
  - `OfflinePaymentDrawer`
  - WebSocket connection via `useWebSocket()` for live unit reservation
- Status enum (from `normalizeStatus` + `getStatusColor`):
  - `AVAILABLE` (or `PREALLOCATED`) → green
  - `HOLD` → yellow
  - `WINNER` → red
  - `BOOKED` (default fallback) → green-ish per map
- **POMs that will need these selectors:** unit-cell class names should be inspected the moment a real customer reaches checkout — current direct-nav redirect prevents DOM inspection.

### KYC sub-route (`/physical-allocation/kyc`)
- Component: `KycPage.jsx`
- Destructures `customerContext` from `location.state || {}`. With no state, all child components (`Applicants`, `Summary`, `Completed`, `PaymentSuccess`) require `registration` data they never receive — page mounts but renders no visible chrome (blank white viewport).
- `currentStep` initial value: `customerContext?.registration?.isKycSubmitted ? 'success' : 'applicants'`.
- Final submission: `POST apiUrls.smPhysicalEvent.kyc.submit` with payload `{ userId, registrationUnitId, otpVerified, isParkingSelected: false, parkingCount: 0 }`.

### API endpoints observed (live network probe)
| Call | Method | URL |
|------|--------|-----|
| Active campaign fetch | GET | `https://uat-api.xrportal.in/api/v1/sales-manager/physical-event/campaign/active` |
| Customer search | GET | `https://uat-api.xrportal.in/api/v1/sales-manager/physical-event/search?campaignId=<id>&q=<q>` |
| KYC applicants | POST | `apiUrls.smPhysicalEvent.kyc.registrationUnitsApplicants` (path not probed live) |
| KYC submit | POST | `apiUrls.smPhysicalEvent.kyc.submit` (path not probed live) |

### Sidebar
- 3 nav items: **Callback Requests**, **Towers**, **Allocation** (selected). Logout button at the foot.
- `Allocation` tile has a green-fill selected state (other items show only an icon + text).

---

## Conditions to capture the remaining 3 states

To complete `allocation-customer-selected`, `allocation-checkout-unit-selected`, `allocation-confirmation`:

1. **Seed at least one Physical Event registration in UAT** against campaign `id=295` ("Test New Physical Campaign"). This requires admin/back-end action — registration creation is not exposed via the SM portal itself.
2. Re-run `scripts/capture-sm-allocation-active-v2.js` after seeding — the Select button will appear in the search result row.
3. For confirmation, a non-destructive checkout dry-run path (e.g., a UAT-only "test allocation" flag that auto-cleans, or a sandbox campaign explicitly marked for QA) would be required. Otherwise this screen must be captured during a coordinated manual UAT session with explicit roll-back commitment.

---

## Sidecar files

- `_allocation-dom-inspect.json` — original empty-state DOM dump (2026-06-05)
- `_allocation-active-dom-landing.json` — DOM dump on active-campaign landing (2026-06-06)
- `_allocation-active-dom-checkout.json` — DOM dump after `/checkout` direct-nav redirect
- `_allocation-active-dom-kyc.json` — DOM dump on `/kyc` direct-nav (blank body)
- `scripts/_probe-sm-active-campaign-results.json` — active-campaign API + 9 sample search queries
- `scripts/_capture-sm-allocation-active-v2-results.json` — final capture run log
