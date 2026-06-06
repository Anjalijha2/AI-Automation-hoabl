# Visual Memory — Buyer Portal / Payment Schedule

**Captured:** 2026-06-03; re-verified 2026-06-06 — page heading `h2: "Payment Schedule"` + `h5: "REGISTRATION NO."` + `h5: "UNIT NO."` dropdowns confirmed live; table is empty until selectors are populated
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/paymentschedule)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `payment-schedule-loaded.png` | Payment Schedule page — initial authenticated load | 2026-06-03 |
| `payment-schedule-table.png` | Payment Schedule — scrolled to show table | 2026-06-03 |
| `payment-schedule-full.png` | Full-page final screenshot | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/paymentschedule`
- Requires authentication — unauthenticated access redirects to `/`

### Page Heading
```
h2: "Payment Schedule"
```

### Registration / Unit Selectors
```
h5: "REGISTRATION NO."   — dropdown to select registration
h5: "UNIT NO."           — dropdown to select unit (dependent on registration)
```
Both are likely `.ant-select` dropdowns (no `input[placeholder]` visible).

### Payment Schedule Table
```
Columns (all-caps headers):
  MILESTONE | % DUE | GST |   (blank — additional amount?) | TOTAL AMOUNT | TOTAL OUTSTANDING | PAYMENT STATUS | PAY | TRANSACTION DETAILS

Columns (title-case headers — second table or responsive):
  MILESTONE | % Due | GST |   | Total Amount | Total Outstanding | Payment Status | Pay |

Row selector:  tbody tr
```

### Empty State
```
text: "No data"   — shown when no unit selected or no payment data
.ant-table-placeholder or similar
```

### Pay Button (per row)
```
PAY column contains a pay action per milestone row
```

### Transaction Details (per row)
```
TRANSACTION DETAILS column — link or button to view details
```

### Navigation Sidebar
```
Home | Registration | Allotment | Homeloan | Project | Work Progress | Logout
```

### Logout
```
button.ant-btn   filter({ hasText: /logout/i })
```
