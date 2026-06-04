# Visual Memory — Buyer Portal / Support Tickets

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/support-tickets)
**CAPTURE_STATUS:** DEPRECATED

> **DEPRECATED 2026-06-04** — Module removed from frontend. Client no longer requires Support Tickets.
> Screenshots retained for historical reference. TCs archived to `manual-qa-repository/01-test-cases/archived/buyer/support-tickets/`.
> BA Agent must NOT generate TCs for this module.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `support-tickets-loaded.png` | Support Tickets list — initial authenticated load | 2026-06-03 |
| `support-list.png` | Support Tickets list — explicit list URL capture | 2026-06-03 |
| `support-tickets-full.png` | Full-page final screenshot | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/support-tickets`
- Requires authentication — unauthenticated access redirects to `/`

### Page Headings
```
h4: "Support Tickets"
h6: "Support Tickets"
.ant-card-head-title: "Support Tickets"
```

### Search Input
```
input[placeholder="Search tickets..."]
```

### Filter / Category Dropdown
```
"Select Category"   — .ant-select or similar dropdown
```
Clear button next to category filter:
```
button.ant-btn   filter({ hasText: /clear/i })   — "Clear"
```

### Tickets Table
```
Columns: Ticket ID | Category | Project | Registration Number | Created At | Status | Action
tbody tr  — row selector
```

### Create Ticket Navigation
```
"Create Ticket"   — appears in sidebar nav (not a button on the page)
link navigates to ticket creation form
```

### Empty State
```
text: "No data"   — shown when no tickets exist for this account
```

### Logout
```
button.ant-btn   filter({ hasText: /logout/i })
```

### Navigation Sidebar
```
Home | Registration | Allotment | Homeloan | Project | Work Progress | Create Ticket | Logout
```
Note: "Create Ticket" appears as an additional nav item on the support-tickets page.

### Ticket Detail (not captured — no tickets in test account)
- Clicking a ticket row navigates to ticket detail view
- URL pattern likely: `/support-tickets/[id]` or similar
