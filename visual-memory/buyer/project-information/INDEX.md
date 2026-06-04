# Visual Memory — Buyer Portal / Project Information

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/project)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `project-information-loaded.png` | Project Information — initial authenticated load | 2026-06-03 |
| `project-info-scrolled.png` | Project Information — scrolled 400px to show sections | 2026-06-03 |
| `project-information-full.png` | Full-page final screenshot | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/project`
- Requires authentication — unauthenticated access redirects to `/`

### Page Heading (Project Name)
```
h2: "HoABL Naigaon"
RERA ID shown: "RERA ID: P99000080106"
```

### Content Sections
```
h2: "See the Vision Come Alive"
     subtitle: "Explore Project Videos & Walkthrough"
     video: 06.45 (duration)

h3: "LOCATION"
h5: "Epicentre of Growth"
     video: 03.39 (duration)

h3: "PROJECT WALKTHROUGH"
h5: "Your Future Growth Home – Development Walkthrough"

h3: "SCIENCE BEHIND EVERY DETAIL"
h5: "Integrated Project Planning for 1 BHK"

h3: "SCIENCE BEHIND EVERY DETAIL"
h5: "Integrated Project Planning for 2 BHK"
```

### Buttons
```
button.ant-btn   filter({ hasText: /logout/i })   — "Logout"
```
Page is content-only (videos, images) — no form inputs or data entry.

### Navigation Sidebar
```
Home | Registration | Allotment | Homeloan | Project | Work Progress | Logout
```

### Note on Content
- Read-only informational page
- Contains embedded video players (not interactive in test scope)
- No forms, tables, or data entry components
