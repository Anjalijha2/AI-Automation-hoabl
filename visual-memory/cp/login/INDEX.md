# Visual Memory — CP Portal / Login

**Captured:** 2026-06-04 (updated from stub — screenshot inspected)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | CP Login page — "GROWTH PARTNER LOGIN" unauthenticated state | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/`
- Unauthenticated → Login page shown
- Authenticated → redirects to `/dashboard`

### Page Heading
```
h2 or h3: "GROWTH PARTNER LOGIN"
  Right panel, distinct from buyer portal "APPLICANT LOGIN"
```

### Marketing Panel (left side)
```
image: Amitabh Bachchan brand ambassador
text: "GROWTH FOR ALL. HOUSING FOR ALL."
text: "Mr. Amitabh Bachchan — The Growth Mentor"
text: "INDIA'S BIGGEST GROWTH HOUSING REVOLUTION — BEGINS ON 7TH APRIL 2026."
```

### Login Form
```
label: "Mobile Number*"
input: +91 country prefix (flag dropdown) + 10-digit mobile input
button: "Send OTP"   — green
```

**Key selectors:**
```
h2 or h3   filter({ hasText: /growth partner login/i })
input[type="tel"] or input[placeholder*="Mobile" i]
button   filter({ hasText: /send otp/i })
```

### OTP Entry State (post Send OTP — not captured)
```
6 digit OTP input fields
button: "Verify OTP"
```

### Footer
```
"Copyright © 2026 House of Abhinandan Lodha. All Rights Reserved."
```

### Auth Mechanism
- CP portal uses **cookies** (not sessionStorage like Buyer)
- Playwright `storageState()` works correctly — session persists across navigations
- Test credentials: Mobile `8888888888` / OTP `258369` (static)
