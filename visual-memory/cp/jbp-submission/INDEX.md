# Visual Memory — CP Portal / JBP Submission

**Captured:** 2026-06-04 (updated from stub — screenshot inspected)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/jbp)
**CAPTURE_STATUS:** FULL — Closed Cycle state captured. Open Cycle submission form needs active cycle.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | JBP Dashboard — Closed Cycle (May 2026, Not Submitted, "Cycle has Closed") | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/jbp`
- Requires authentication

### Page Heading
```
h1/h2: "JBP Dashboard"
```

### Current Cycle Card
```
heading: "Current Cycle - [cycleName]"   e.g., "Current Cycle - test JBP"

date: "[Month Year]"   e.g., "May 2026"

badge: "CLOSED"   — red/pink pill   (or "OPEN" when active)

text: "Closes on: [date]"   e.g., "Closes on: 14th May 2026"

text: "Your Status: [status]"
  Values: Not Submitted | Submitted | Approved | Rejected
```

**Key selectors:**
```
h1 or h2: "JBP Dashboard"
text   filter({ hasText: /current cycle/i })
span or div   filter({ hasText: /closed/i })
span or div   filter({ hasText: /open/i })
text   filter({ hasText: /closes on/i })
span   filter({ hasText: /not submitted/i })
```

### Tabs
```
"Current Cycle Entry"   — default active
"JBP History"
"Edit Requests"
```

**Key selectors:**
```
div[role="tab"]   filter({ hasText: /current cycle entry/i })
div[role="tab"]   filter({ hasText: /jbp history/i })
div[role="tab"]   filter({ hasText: /edit requests/i })
```

### Closed Cycle Content (captured)
```
text: "Cycle has Closed"
text: "Submissions are no longer accepted for this cycle."
```

### Open Cycle Content (NOT captured)
Appears when cycle OPEN: JBP submission form in "Current Cycle Entry" tab.

### Business Rules
```
One submission per CP per cycle | Cycle must be OPEN to submit
Post-submit edits: admin-reviewed edit request flow
Approved edits: version incremented, old = EXPIRED
```

### Navigation Sidebar
```
Home → /dashboard | KYC → /kyc | JBP (active) → /jbp | Leads → /leads | Logout
```
