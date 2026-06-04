# Visual Memory — CP Portal / Customer Registration (Home Dashboard)

**Captured:** 2026-06-04 (updated from stub — screenshot inspected)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/dashboard)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | CP Home Dashboard — stats cards, referral widget, Create New Lead, Customers table | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/dashboard` (or root `/` when authenticated)
- Requires authentication — unauthenticated redirects to login
- This IS the Customer Registration module — CP creates leads + tracks customer registrations here

### Welcome Bar
```
h1/h2: "Welcome, [cpName]"   (name in green)
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
Card 1: clock icon     | "Sent"                   | count: 1
Card 2: list icon      | "No. of Registered Unit" | count: 2
Card 3: booking icon   | "No. of Booking"          | count: 0
Card 4: cancel icon    | "Cancelled Unit"           | count: 1
```

**Key selectors:**
```
div   filter({ hasText: /^Sent$/ })
div   filter({ hasText: /no\. of registered unit/i })
div   filter({ hasText: /no\. of booking/i })
div   filter({ hasText: /cancelled unit/i })
```

### Referral Widget
```
Section label: "LINK"
  Referral URL (truncated): "https://uat.xrportal.in/ref/[uuid]..."
  link: "Copy link" + copy icon

Section label: "QR CODE"
  QR code image
  link: "Download QR Code"

Divider: "OR" (green circle)

Code box:
  "HV Code: HV00025808"   — green link
  "XR Code: XRXXXXXX"    — green link
```

**Key selectors:**
```
a   filter({ hasText: /copy link/i })
a   filter({ hasText: /download qr code/i })
div or span   filter({ hasText: /hv code/i })
```

### Create New Lead Widget
```
heading: "CREATE NEW LEAD"

radio: "Indian National"   — green dot (default selected)
radio: "NRI"

input: Customer Mobile Number*   +91 prefix   placeholder="Enter Mobile Number"

button: "Create Lead >"   — green, full width
```

**Key selectors:**
```
text: "CREATE NEW LEAD"
input[type="radio"]   nth(0)   — Indian National
input[type="radio"]   nth(1)   — NRI
input[placeholder*="Mobile Number" i]
button   filter({ hasText: /create lead/i })
```

### Customers Table
```
heading: "Customers"

Filters:
  dropdown: "All Team Leads"
  input: "Search Customer" 🔍

Columns:
  S.No | Applicant Name | Applicant Number | Registration Number |
  Registration Date | CP Name | CP HV Code | CP Mobile | Status

Status badges:
  "Paid"      — blue pill
  "Refunded"  — red/pink pill
```

Sample data:
```
1: Testinglead CPmember | 7999999999 | GHNG-1000008555-A | 27-02-2026 | Test CP | HV00026050 | Paid
2: Testinglead CPmember | 7999999999 | GHNG-1000008555-B | 27-02-2026 | Test CP | HV00026050 | Paid
3: Sanket Test          | 8451856253 | GHNG-1000008516-A | 22-01-2026 | Test CP | HV00025808 | Refunded
Pagination: 1-3 of 3 items | 10/page
```

**Key selectors:**
```
h2 or text: "Customers"
div.ant-select   filter({ hasText: /all team leads/i })
input[placeholder*="Search Customer" i]
tbody tr
td   filter({ hasText: /GHNG-/i })
span   filter({ hasText: /paid/i })
span   filter({ hasText: /refunded/i })
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
