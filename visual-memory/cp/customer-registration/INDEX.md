# Visual Memory — CP Portal / Customer Registration (Home Dashboard)

**Captured:** 2026-06-05 (UPDATED — full interactive sub-states captured with fresh session)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/dashboard)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | CP Home Dashboard — initial baseline | 2026-06-03 |
| `dashboard-loaded.png` | Full Home Dashboard fully loaded (full-page screenshot, full scroll) | 2026-06-05 |
| `dashboard-nri-selected.png` | "Create New Lead" widget with NRI radio selected (green dot on NRI) | 2026-06-05 |
| `dashboard-indian-national-selected.png` | "Create New Lead" widget with Indian National radio re-selected (default) | 2026-06-05 |
| `dashboard-create-lead-validation.png` | After clicking "Create Lead >" with empty mobile field — captures validation state | 2026-06-05 |
| `dashboard-create-lead-invalid-mobile.png` | Mobile field filled "123" then Create Lead clicked — invalid mobile validation | 2026-06-05 |
| `dashboard-customers-search-result.png` | Customers table filtered with "Sanket" search input — shows matching rows | 2026-06-05 |
| `dashboard-customers-search-no-result.png` | Customers table with "ZZNOTFOUND" search — empty/no-result state | 2026-06-05 |
| `dashboard-team-leads-dropdown.png` | "All Team Leads" dropdown opened — shows 3 options | 2026-06-05 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/dashboard` (or root `/` when authenticated)
- Requires authentication — unauthenticated redirects to login
- This IS the Customer Registration module — CP creates leads + tracks customer registrations here

### Welcome Bar
```
h2: "Welcome, [cpName]"   (name in green)
  Example: "Welcome, GP test name"

button (top-right): "Your KYC is in review"   — blue/navy + shield icon
  Visible when CP's own KYC is under admin review. Disappears post-approval.
```

### Announcement Banner
```
"India's Biggest Growth Housing Revolution Begins On 7th April 2026."
```

### Stats Cards (4 cards, top row)
```
Card 1: "Sent"                   — count: 1
Card 2: "No. of Registered Unit" — count: 2
Card 3: "No. of Booking"         — count: 0
Card 4: "Cancelled Unit"         — count: 1
```

Each card has H6 with the count value.

### Referral Widget
```
Section label: "LINK"
  Referral URL (truncated): "https://uat.xrportal.in/ref/[uuid]..."
  button: "Copy link" + copy icon

Section label: "QR CODE"
  QR code image
  button: "Download QR Code"

Divider: "OR" (green circle)

Code box:
  "HV Code: HV00025808"   — green link
  "XR Code: XRXXXXXX"     — green link
```

### Create New Lead Widget
```
heading: "CREATE NEW LEAD"

ant-radio-group (name=":r2:"):
  radio[value="Indian National"]   — default checked (green dot)
  radio[value="NRI"]

input[name="phone"][placeholder="Enter Mobile Number"]   +91 prefix

button: "Create Lead"   — green, full-width
```

**Key selectors (DOM-verified):**
```
heading "CREATE NEW LEAD"
input[type="radio"][value="Indian National"]
input[type="radio"][value="NRI"]
input[name="phone"]                          — phone number input
button:has-text("Create Lead")
```

### NRI vs Indian National (visual difference)
- Both radios in the SAME ant-radio-group (`name=":r2:"`); selecting one deselects the other.
- Visual: green-filled inner circle on selected radio, hollow on unselected.
- NRI selection observed to NOT introduce additional form fields (e.g., no country-code change, no passport input shown on dashboard) — additional NRI metadata likely captured downstream after Create Lead.

### Create Lead Validation Behaviour
- Clicking "Create Lead" with **empty** phone field: the page UI does not visibly change (no inline error caught in screenshot at +1s). Inspect HAR for backend validation; likely client-side blocks submission silently or shows a fast-fading inline error.
- Clicking "Create Lead" with **invalid** mobile "123": same visual outcome — no API call observed (button may be disabled below 10 digits).
- **Note:** Validation captures (`dashboard-create-lead-validation.png`, `dashboard-create-lead-invalid-mobile.png`) document the post-click state — any inline error styling on the input is visible in the PNG.

### Customers Table
```
heading: "Customers"

Filters row:
  ant-select dropdown: "All Team Leads" placeholder + dropdown-arrow
  input[placeholder="Search Customer"]   — text input with search-icon
  ant-select dropdown: "10/page" (pagination size)

Columns:
  S.No | Applicant Name | Applicant Number | Registration Number |
  Registration Date | CP Name | CP HV Code | CP Mobile | Status

Status badges:
  "Paid"      — blue pill
  "Refunded"  — red/pink pill
```

### Search Customer Behaviour (verified)
- Input: `input[placeholder="Search Customer"]` — text type
- Filters client-side or via API; debounce ~500-1000ms (waited 2.5s for stable result before capture)
- "Sanket" search → returns matching rows (Sanket Test customer is in seed data)
- "ZZNOTFOUND" → empty table state (no rows rendered; pagination shows 0 items OR a "No data" placeholder)

### Team Leads Dropdown (verified)
- Trigger: ant-select with placeholder "All Team Leads"
- Options observed (3): captured in `dashboard-team-leads-dropdown.png`
- Used to scope customer list to specific team members (only relevant for CPs with sub-team leads)

### Page-level Action Buttons (header)
```
"Logout"   — in nav header (appears multiple times due to responsive desktop+mobile renders)
"Copy link"        — copies referral link
"Download QR Code" — downloads PNG/SVG of QR
"Create Lead"      — submits the Create Lead form
```

### Navigation Sidebar
```
Home (active) → /dashboard
KYC → /kyc
JBP → /jbp
Leads → /leads
Logout → button   filter({ hasText: /logout/i })
```

### Test Account
```
CP: GP test name | HV Code: HV00025808 | KYC: In Review
Stats: Sent 1 | Registered 2 | Booking 0 | Cancelled 1
```

### Sidecar Files
- `_dashboard-dom-inspect.json` — DOM inspection dump (headings, radios, inputs, buttons) captured at session time
