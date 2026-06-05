# Visual Memory — CP Portal / Project Information

**Captured:** 2026-06-04 (updated from stub)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/project1/*)
**CAPTURE_STATUS:** DEPRECATED — Module does not exist in CP portal frontend. No sidebar link, no accessible route. Client confirmed page not implemented (same as Buyer / Support Tickets). Do not generate TCs.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | CP Home Dashboard (capture redirected — NOT Project Information) | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL pattern:** `https://uat-web.xrportal.in/project1/*`
- Requires authentication
- **Not in primary nav sidebar** (Home | KYC | JBP | Leads — no Project link)
- Access method: unknown — not reachable from standard nav

### Capture Gap
```
screenshot-desktop.png = CP Home Dashboard, not Project Information.
Capture script could not find /project1/* and fell back to Home.
Tech Lead Agent must determine correct URL and navigation path.
```

### Expected Content (per BRD §4.10 — Project content is read-only)
```
Project details: tower names, unit types, pricing, floor plans
Content managed by Admin via Strapi CMS — CP view is read-only
URL pattern: /project1/* (project-specific routes)
```

### Navigation
```
Standard CP sidebar: Home | KYC | JBP | Leads — no Project link present
Access likely via: project card on Home, embedded link, or direct URL
```

⚠ DEPRECATED — No TCs should be generated for this module. Page not present in CP portal frontend.
