# Visual Memory — CP Portal / KYC Assistance

**Captured:** 2026-06-04 (updated from stub — screenshot inspected)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/kyc)
**CAPTURE_STATUS:** FULL — Above-fold form captured. Document upload section (below fold) not captured.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | KYC form — Firm Details + Contact Details + Additional Details (above fold, pre-filled) | 2026-06-03 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/kyc`
- Requires authentication

### Page Heading
```
h1/h2: "KYC"
```

### Form Structure

**Section 1 — Firm Details** (green header row)
```
Firm Name*:       input (text)   pre-filled: "GP test name"
Firm Address*:    input (text)   pre-filled: "gp@test.test"
Business Region*: select/dropdown   (empty — required)
```

**Section 2 — Contact Details** (green header row)
```
Growth Partner Owner Name*: input (text)   pre-filled: "Test CP"
Email ID*:                  input (email)  pre-filled: "testcp@gmail.com"
Phone Number*:              input (tel)    pre-filled: "8888888888"
```

**Section 3 — Additional Details** (green header row)
```
Pin Code Office*: input (text)   pre-filled: "400056"
PAN Number*:      input (text)   pre-filled: "TTTTT7777Y"
RERA Number:      input (text)   optional, placeholder="Enter RERA Number"
```

**Key selectors:**
```
h1 or h2: "KYC"
div or h4   filter({ hasText: /firm details/i })
div or h4   filter({ hasText: /contact details/i })
div or h4   filter({ hasText: /additional details/i })

input (Firm Name)
input (Firm Address)
select or div.ant-select  (Business Region dropdown)
input (Owner Name)
input[type="email"]
input[type="tel"]
input (Pin Code)
input[placeholder*="PAN" i]
input[placeholder*="RERA" i]
```

### Below-fold Content (not captured)
Document upload fields expected below visible area (firm registration, PAN card, Aadhaar, etc.).
Submit/Save button also below fold.

### KYC Status Indicator
```
"Your KYC is in review" button on Home → CP's KYC pending admin review
After approval: button disappears from Home header
```

### Module Context
- Module name "KYC Assistance" = CP's own KYC onboarding (not customer KYC)
- Customer KYC (post-WINNER) is managed within customer/registration detail flows

### Navigation Sidebar
```
Home → /dashboard | KYC (active) → /kyc | JBP → /jbp | Leads → /leads | Logout
```

### Test Account Data
```
Firm: GP test name | Address: gp@test.test | Region: (not selected)
Owner: Test CP | Email: testcp@gmail.com | Phone: 8888888888
Pin Code: 400056 | PAN: TTTTT7777Y | KYC Status: In Review
```
