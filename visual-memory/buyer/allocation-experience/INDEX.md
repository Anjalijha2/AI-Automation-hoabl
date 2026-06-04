# Visual Memory — Buyer Portal / Allocation Experience

**Captured:** 2026-06-04 (updated with manual screenshots — unit selection + booked states)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/alloted)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `allocation-experience-loaded.png` | Allotment page — initial authenticated load | 2026-06-03 |
| `allocation-scrolled.png` | Allotment page — scrolled 400px (registration card details) | 2026-06-03 |
| `allocation-experience-full.png` | Full-page final screenshot | 2026-06-03 |
| `allocation-winner-landing.png` | Allotment — winner landing (captured via script) | 2026-06-03 |
| `allocation-winner-landing-full.png` | Allotment — winner landing full page | 2026-06-03 |
| `allocation-select-unit.png` | Allotment — unit available for selection (GHNG-K: Book Now + Select Unit button) | 2026-06-04 |
| `allocation-booked-complete-kyc.png` | Allotment — booked unit selected (Paid/Completed + Complete KYC required) | 2026-06-04 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/alloted`
- Requires authentication — unauthenticated access redirects to `/`

### Page Heading
```
h2: "Allotment"
Congratulations text: "Congratulations [firstName]! You're Eligible to Select Your Growth Home!"
  Example: "Congratulations ishaaaaan! You're Eligible to Select Your Growth Home!"
```

### Allotment Countdown Timer
```
text: "Confirmation window will close in [Nd :Xh :Ym :Zs]"
  Example: "4d :7h :11m :28s"
```
Countdown shown top-right of page.

### Registration Sidebar (left panel)
Each registration shows as a pill/card:
```
Badge states:
  "Book Now"   — green pill   (unit available for selection by this registration)
  "Booked"     — green check pill   (unit already booked)
  "Waitlisted" — black pill
```

Selector:
```
div.registration-list (or similar)
  [registration-id text]  e.g., "GHNG-1000008364-K"
  badge text: "Book Now" | "Booked" | "Waitlisted"
```

### Center Panel — Unit Available State ("Book Now")
When a registration has "Book Now" status:
```
text: "Registration No.: GHNG-1000008364-K"
button: "Select Unit >"   — green
```

Right panel (greyed out, not yet selectable):
```
link: "Floor & Unit Plan >"
link: "Cost Sheet >"
link: "Payment Schedule >"
link: "Pay Now >"
```

Key selectors:
```
button   filter({ hasText: /select unit/i })    — select unit action
```

### Center Panel — Booked + Payment Completed State
When registration is "Booked" and payment done:
```
icon: ✓ (green checkmark badge)
text: "Paid"
text: "Allotment Process Completed"
text: "[unitNumber] - [towerName]"   e.g., "1004 - Pride"
text: "Registration No. GHNG-1000008364-J"

button: "Complete KYC >"   — RED button
text: "Required to complete the allotment!"   — red, below Complete KYC button
```

Right panel (active, clickable when booked):
```
link: "Floor & Unit Plan >"
link: "Cost Sheet >"
link: "Payment Schedule >"
link: "Pay Now >"
```

Key selectors:
```
button   filter({ hasText: /complete kyc/i })           — red CTA
text     filter({ hasText: /allotment process completed/i })
link     filter({ hasText: /floor & unit plan/i })
link     filter({ hasText: /cost sheet/i })
link     filter({ hasText: /payment schedule/i })
link     filter({ hasText: /pay now/i })
```

### Center Panel — Booked + KYC Completed State
```
icon: ✓ green
text: "Paid"
text: "Allotment Process Completed"
text: "[unitNumber] - [towerName]"
Right panel links: all active
```
(No "Complete KYC" button — replaced by completion state)

### Navigation Sidebar
```
Home | Registration | Allotment (active) | Homeloan | Project | Work Progress | Logout
```

### Test Account State (8888888888)
```
ishaaaaan karnik — multiple registrations:
  -K: "Book Now" → Select Unit button (1 available slot)
  -C: "Booked" → KYC Completed (1201-Glory, 1 Bed 323 sq.ft.)
  -D: "Booked" → KYC Completed (1004-Grace, 2 Bed 485 sq.ft.)
  -E, -F: Booked
  -G, -H, -I, -J: Booked → Complete KYC required
  -A: Waitlisted
```

### Allotment Flow Summary
```
1. Eligible → Registration has "Book Now" badge → center shows "Select Unit >"
2. Select Unit → unit floor/block grid appears (unit picker UI)
3. Unit selected → payment required
4. Payment done → center shows "Paid / Allotment Process Completed / Complete KYC >"
5. KYC done → green completed state, right panel links active
```
