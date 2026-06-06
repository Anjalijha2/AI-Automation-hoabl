# Visual Memory — Buyer Portal / Home Dashboard

**Captured:** 2026-06-04 (updated with manual screenshots); re-verified 2026-06-06 — header still shows "Welcome, ishaaaaan karnik" + "Call Requested" button (post-callback state)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/home)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `home-dashboard-loaded.png` | Dashboard — initial authenticated load | 2026-06-03 |
| `home-dashboard-scrolled.png` | Dashboard — scrolled 500px | 2026-06-03 |
| `home-dashboard-full.png` | Full-page final screenshot | 2026-06-03 |
| `home-dashboard-allotment-table.png` | Home page — allotment table top rows (A–D: Waitlisted, Refunded, Booked+KYC Completed) | 2026-06-04 |
| `home-dashboard-scrolled.png` | Home page — allotment table scrolled (G–K: Complete KYC, Available, Proceed to Confirm) | 2026-06-04 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/home`
- Requires authentication — unauthenticated access redirects to `/`

### Page Heading / Welcome Bar
```
h2 (or header text): "Welcome, [firstName] [lastName]"
  Example: "Welcome, ishaaaaan karnik"
button (top-right): "Schedule a Call"
  After submitting callback: button changes to "Call Requested" (orange/amber badge)
```

### Announcement Banner
```
text: "India's Biggest Growth Housing Revolution Begins On 7th April 2026."
```

### Marketing Banner (below nav)
```
text: "Seamless Support For Home Loan"
sub-text: "Experience a hassle-free financing journey with guided assistance at every step."
button: "Know More"   — links to Unlock Exclusive Benefits section
```

### Navigation Sidebar
```
Nav links (SPA router):
  "Home"           → /home     (active: green highlight)
  "Registration"   → /register
  "Allotment"      → /alloted
  "Homeloan"       → /homeloan
  "Project"        → /project
  "Work Progress"  → /work-progress
  "Logout"         → button.ant-btn  filter({ hasText: /logout/i })
```

### Allotment Details Table

Header row:
```
text: "Details"
text: "Allotment Closing in [Xh :Ym :Zs]"   — countdown timer
button: "Add Units"   — green, top-right of table
text: "High Demand - Book to confirm your Unit!"   — orange, next to Add Units
```

Table columns:
```
Registration Number | Home Loan | Alloted Unit | Status | Process Status | Payment Schedule
```

#### Status Badge Values
```
"Waitlisted"        — black pill badge
"Refunded"          — red × icon
"Booked"            — green ✓ icon
"Available"         — green outline badge
```

#### Process Status Values
```
"KYC Completed"                    — green ✓ chip
"Download your Unit Details"       — link below KYC Completed (PDF download)
"Complete KYC >"                   — red button (required to complete allotment)
"Required to complete the allotment!" — red text below Complete KYC button
"Proceed to Confirm"               — green outline button (Available status units)
"-"                                — empty (no process yet)
```

#### Payment Schedule Values
```
"Pay >"   — green button (appears when unit is booked and payment pending)
```

#### Key Selectors (table rows)
```
tbody tr                                              — each registration row
td filter({ hasText: /GHNG-/i })                     — registration number cell
button.ant-btn filter({ hasText: /complete kyc/i })  — complete KYC action
button.ant-btn filter({ hasText: /pay/i })            — pay action
button.ant-btn filter({ hasText: /proceed to confirm/i }) — available unit action
a filter({ hasText: /download your unit details/i }) — unit details PDF download
```

### Schedule a Call (Callback Request)
```
Entry point: button in top-right header  filter({ hasText: /schedule a call/i })
Modal title: "Schedule a Call"
Fields:
  Preferred Date & Time*: datetime picker  input[type="text"] (pre-filled with current date/time)
  Comment (optional): textarea  placeholder="Any specific query or message for the callback..."  maxlength=200
  char counter: "0 / 200"
Buttons:
  Cancel   — closes modal
  Submit Request   — green, submits callback request
Post-submit: header button changes text to "Call Requested" + orange/amber color
```

### Reschedule Call Modal
```
Entry point: "Call Requested" button (after a call was already scheduled)
Modal title: "Reschedule Call"
Fields: same as Schedule a Call
Buttons:
  Cancel
  Reschedule   — green
```

### Test Account State (8888888888)
```
Account: ishaaaaan karnik
Multiple registrations visible — prefixed GHNG-1000008364-[A through K+]

Sample registration states:
  -A: Waitlisted, no unit
  -B: Refunded, no unit
  -C: Booked, 1201-Glory 1 Bed (323 sq.ft.), KYC Completed
  -D: Booked, 1004-Grace 2 Bed (485 sq.ft.), KYC Completed
  -G: Booked, 2 Bed (485 sq.ft.), Complete KYC required
  -H: Booked, 1204-Glory 2 Bed (485 sq.ft.), Complete KYC required
  -I: Booked, 1201-Pride 1 Bed (323 sq.ft.), Complete KYC required
  -J: Booked, 1004-Pride 2 Bed (485 sq.ft.), Complete KYC required
  -K: Available, "Proceed to Confirm"
```
