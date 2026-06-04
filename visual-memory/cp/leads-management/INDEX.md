# Visual Memory — CP Portal / Leads Management

**Captured:** 2026-06-04 (updated from stub — screenshot inspected)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/leads)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Leads list — 3 leads, statuses: Registered/Refunded/Sent | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/leads`
- Requires authentication

### Page Heading
```
h1/h2: "Leads"
```

### Filters / Search
```
dropdown: "All Team Leads"   — team scope filter
dropdown: "Status"           — filter by lead status
input: "Search Customer" 🔍  — search by name or phone
```

**Key selectors:**
```
h1 or h2: "Leads"
div.ant-select   filter({ hasText: /all team leads/i })
div.ant-select   filter({ hasText: /^status$/i })
input[placeholder*="Search Customer" i]
```

### Leads Table
```
Columns:
  S.No | Applicant Name | Applicant Phone | Status |
  Date of Sent | CP Name | CP HV Code | CP Mobile | Action

Status badge values:
  "Registered"   — green pill
  "Refunded"     — red/pink pill
  "Sent"         — orange/yellow pill

Action column:
  icon button: share 🔗   — share lead
  icon button: copy 📋    — copy lead link
```

Sample data:
```
1: Testinglead CPmember | 7999999999 | Registered  | 27-02-2026 04:36:10 PM | HV00026050
2: Sanket Test          | 8451856253 | Refunded    | 22-01-2026 01:48:17 PM | HV00025808
3: Test                 | 100011112  | Sent        | 07-04-2026 09:26:12 PM | HV00025808
Pagination: 1-3 of 3 items | 10/page
```

**Key selectors:**
```
tbody tr
span or div   filter({ hasText: /^registered$/i })
span or div   filter({ hasText: /^refunded$/i })
span or div   filter({ hasText: /^sent$/i })
button or a   nth(0)   — share action
button or a   nth(1)   — copy action
```

### Lead Status Flow
```
Sent       → link shared; customer not yet registered
Registered → customer paid token amount, registration complete
Refunded   → registration cancelled/refunded
```

### Navigation Sidebar
```
Home → /dashboard | KYC → /kyc | JBP → /jbp | Leads (active) → /leads | Logout
```
