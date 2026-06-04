# Visual Memory — Buyer Portal / Unit Details

**Captured:** 2026-06-03 (updated 2026-06-03 — WINNER account capture)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/)
**CAPTURE_STATUS:** FULL — feature identified. Unit Details is a PDF download, not a separate page.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `unit-details-loaded.png` | 404 page — initial URL attempts | 2026-06-03 |
| `unit-details-full.png` | 404 page — full screenshot | 2026-06-03 |
| `unit-details-loaded-WINNER.png` | KYC success page with Download your Unit Details — WINNER account | 2026-06-03 |
| `unit-details-WINNER-full.png` | KYC success page — full page | 2026-06-03 |
| `unit-details-scrolled.png` | KYC success page — scrolled | 2026-06-03 |

---

## Key Structural Notes

### Feature Discovery (WINNER account — 2026-06-03)

**Unit Details is NOT a separate page.** It is the "Download your Unit Details" button on the KYC success/completion page.

### Access URL
```
/kyc?unitId=<base64-encoded-unit-id>
```
Example: `https://uat.xrportal.in/kyc?unitId=OTc1Mg==`

This URL is reached via:
1. "Complete KYC" button on Home Dashboard card → completes KYC flow → lands on KYC success page
2. The KYC success page hosts the "Download your Unit Details" button

### KYC Success Page (Unit Details context)
```
h5: "KYC submitted successfully!"
body: "Congratulations you have completed the Growth Online Booking Process, 
       Please download your Booking form with all the details."
```

### KYC Success Table (columns)
```
Registration Number | KYC Number | Unit | No. of Applicants | Process Status
```

### Example Row (test account GHNG-1000008364-C)
```
Registration Number:   GHNG-1000008364-C
KYC Number:            GHNG-1000008364-C-KYC
Unit:                  1201 - Glory, 1 Bed Growth Home (323 sq.ft.)
No. of Applicants:     1 Applicant
Process Status:        KYC Completed
```

### Key Selectors
```
h5:                    "KYC submitted successfully!"
button (download):     button.ant-btn  filter({ hasText: /download your unit details/i })
button (1 Applicant):  button.ant-btn  filter({ hasText: /\d+ Applicant/ })
link (Go to Home):     a  filter({ hasText: /go to home/i })  href="/home"
```

### Navigation Sidebar
```
Home → /home
Registration → /register
Allotment → /alloted
Homeloan → /homeloan
Project → /project
Work Progress → /work-progress
Logout → button.ant-btn filter({ hasText: /logout/i })
```

### Important: No Direct URL
- `/allotted-unit`, `/allotted-units`, `/unit-details`, `/my-unit` → all 404
- Access only via KYC success flow with `?unitId=<base64>` param
