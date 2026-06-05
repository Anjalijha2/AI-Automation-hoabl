# Visual Memory — Sales Manager Portal / Physical Allocation

**Captured:** 2026-06-05
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
- Module is **campaign-driven**: the SM can only allocate units during an active Physical Event campaign
- Three sub-routes form the allocation pipeline:
  1. `/physical-allocation` → Customer Search (entry point)
  2. `/physical-allocation/checkout` → Unit Allocation Page (pick unit for customer)
  3. `/physical-allocation/kyc` → KYC capture page (final step)
- Sidebar shows "Allocation" as the nav label (icon: calendar glyph) — selected when on this route

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `allocation-loaded.png` | Physical Unit Allocation — "No Active Campaign" empty state with Refresh button | Live inspection 2026-06-05 |
| `allocation-empty.png` | Same empty-state screen captured separately (no campaign active in UAT at capture time) | Live inspection 2026-06-05 |
| `screenshot-desktop.png` | Legacy stub from 2026-05-17 | preserved |

---

## Key Structural Notes

### Current observed state — NO ACTIVE CAMPAIGN
At capture time (2026-06-05), no Physical Event campaign is active in UAT. The page renders the empty/idle state.

- Page heading: `h5` "Physical Unit Allocation"
- Empty card content:
  - Building emoji (🏢) — decorative
  - `h3` "No Active Campaign"
  - Description paragraph: "There is no active or upcoming Physical Event campaign at this time."
  - Action: `button:has-text("Refresh")` — re-queries the campaign endpoint

### Inferred active-campaign state (from source code routing)
When a campaign is active, the page should render the `CustomerSearchPage` component which is a customer-search-first flow:
- Search by customer mobile / registration number / name
- After matching a customer → action to proceed → navigate to `/physical-allocation/checkout`
- Checkout shows `UnitAllocationPage` (likely a tower/unit picker reusing the Towers heatmap)
- After unit pick → `/physical-allocation/kyc` for KYC capture
- Final submission completes the physical allocation booking

Note: these flows could not be exercised at capture time because the campaign was inactive. The empty state is the canonical baseline for the module.

### Component
- Default route component: `CustomerSearchPage` at `routes/Private/sales-manager/physical-event/CustomerSearchPage.jsx`
- Other components in same folder:
  - `UnitAllocationPage.jsx`
  - `KycPage.jsx`

### Conditions to re-capture active states
- A Physical Event campaign must be created/active in Admin → CMS or Campaign management
- Re-run `scripts/capture-sm-4modules.js` (or a follow-up script) once a campaign is active
- States to capture when active:
  - `allocation-search-loaded.png` — customer search input visible
  - `allocation-search-result.png` — customer match shown
  - `allocation-checkout.png` — unit selection page (`/physical-allocation/checkout`)
  - `allocation-kyc.png` — KYC capture page (`/physical-allocation/kyc`)
  - `allocation-confirmation.png` — post-submit confirmation
