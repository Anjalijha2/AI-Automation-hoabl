# Visual Memory — CP Portal / Leads Management

**Captured:** 2026-06-05 (UPDATED — full interactive sub-states captured with fresh session)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/leads)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Leads list initial baseline | 2026-06-03 |
| `leads-loaded.png` | Full Leads page fully loaded (full-page screenshot) — table with seed leads | 2026-06-05 |
| `leads-status-dropdown-open.png` | Status filter dropdown opened — captures available status options (3 observed) | 2026-06-05 |
| `leads-team-leads-dropdown-open.png` | "All Team Leads" dropdown opened — captures team-lead options (3 observed) | 2026-06-05 |
| `leads-search-result.png` | Leads table filtered with "Sanket" — matching rows visible | 2026-06-05 |
| `leads-search-no-match.png` | Leads table with "ZZNOTFOUND" — empty/no-results state | 2026-06-05 |
| `leads-share-action.png` | First lead row → first action icon ("Resend Notification") clicked. Result: silent (no modal, no toast, no new tab). Likely triggers backend SMS/notification resend via API. | 2026-06-05 |
| `leads-copy-action.png` | First lead row → second action icon ("Copy Link") clicked. Result: silent UI — writes a referral URL to clipboard. Verified clipboard contents: `https://uat.xrportal.in/ref/<token>` (e.g., `https://uat.xrportal.in/ref/02e2e02ca41382306396dbb87cde0bfd5e5c6d6e8b5dc6c89f93f8c4456e0929`). No toast observed within 250ms of click. | 2026-06-05 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/leads`
- Requires authentication

### Page Heading
```
h3: "Leads"
```

### Filters / Search
```
dropdown: "All Team Leads"   — team scope filter (3 options observed)
dropdown: "Status"           — filter by lead status (3 options observed)
input[type=text][placeholder="Search Customer"]   — search by name or phone (no search-type input visible; uses regular text input)
```

**Key selectors (DOM-verified):**
```
h3 :text("Leads")
.ant-select :has-text("All Team Leads")
.ant-select :has-text("Status")
input[placeholder="Search Customer"]
```

### Leads Table
```
Columns (verified from tableHeaders):
  S.No | Applicant Name | Applicant Phone | Status |
  Date of Sent | CP Name | CP HV Code | CP Mobile | Action

Status badge values observed:
  "Registered"   — green pill
  "Refunded"     — red/pink pill
  "Sent"         — orange/yellow pill

Action column (sticky right):
  Two icon buttons per row (both `button.reset-btn`):
    1. "Resend Notification" — SVG icon (paper-airplane style), <title>Resend Notification</title>
    2. "Copy Link"           — SVG icon (document/copy style), <title>Copy Link</title>
```

Sample data:
```
Row 1: Testinglead CPmember | 7999999999 | Registered | 27-02-2026 04:36:10 PM | Test CP | HV00026050 | 7888888888
```

### Row Action — Resend Notification (verified 2026-06-05)
- **Trigger:** `button.reset-btn:has(svg:has(title:has-text("Resend Notification")))` in row's last cell
- **Effect:** Silent — no modal, no toast, no new tab observed within 700ms.
- **Inferred behaviour:** Fires backend API call to resend notification (SMS / email / WhatsApp) to the lead. UI provides no immediate feedback in current build — potential UX gap to flag.
- **Sidecar:** `_leads-row-deep-inspect.json`, `_leads-action-attempts.json`

### Row Action — Copy Link (verified 2026-06-05)
- **Trigger:** `button.reset-btn:has(svg:has(title:has-text("Copy Link")))` in row's last cell
- **Effect:** Writes a per-lead referral URL to the system clipboard.
- **Clipboard payload:** `https://uat.xrportal.in/ref/<sha256-like-token>` — links the buyer to the same flow the lead was originally invited through; allows CP to re-share to a different channel.
- **UI feedback:** No toast observed within 250ms of click (Toastify container present at app level but no toast spawned). Potential UX gap to flag.
- **Permissions note:** Captures used `ctx.grantPermissions(['clipboard-read', 'clipboard-write'])` to observe clipboard contents; real users do not need read permission.

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

### Pagination
```
Antd-style table with "x/page" select; default 10/page
```

### Sidecar Files
- `_leads-dom-inspect.json` — initial DOM/table inspection
- `_leads-row-deep-inspect.json` — deep dump of first data row's Action cell, including all SVG icon titles
- `_leads-action-attempts.json` — log of icon click attempts (v2)
