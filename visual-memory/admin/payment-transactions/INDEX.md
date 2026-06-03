# Visual Memory — Admin Portal / Payment Transactions

**Captured:** 2026-06-03
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/payment-transactions)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Payment Transactions — initial state (stub, pre-INDEX.md) | 2026-05-17 stub |
| `screenshot-ui.png` | Payment Transactions — UI baseline (stub, pre-INDEX.md) | 2026-05-17 stub |
| `payment-transactions-loaded.png` | Transactions list — loaded, "Total 10302 Payment Transactions", filter bar | 2026-06-03 batch script |
| `payment-gateway-settings.png` | Gateway Settings panel — Active/Inactive toggles per tower + View Tower links | 2026-06-03 batch script |
| `payment-settings-page.png` | Settings section open inline — shows Update button | 2026-06-03 modal script |
| `payment-transactions-full.png` | Full page at 1920×900 | 2026-06-03 batch script |

---

## Key Structural Notes

### Page Heading
- `h5` "Transactions"
- Dynamic count: **"Total 10302 Payment Transactions"**

### Page Layout
Two modes on same URL:
1. **Transaction list** (default)
2. **Gateway settings** (toggled by Settings button — inline, no URL change)

### Filter Bar
- `input[placeholder="Start Date"]`
- `input[placeholder="End Date"]`
- `input[placeholder="Search by Name, Phone, Registration No."]`

### Header Buttons
- `button:has-text("Refresh")` (ant-btn-default)
- `button:has-text("Export")` (ant-btn-default) — CSV download
- `button.ant-btn-primary:has-text("Settings")` — toggles gateway settings section

### Transactions Table Columns
Sr. No. | Registration No. | Transaction ID | Source | Status | Unit Reg No. | Customer Name | Phone | Payment Type | Amount Paid | Payment Date | Method | Created By | Actions

**Total UAT rows:** 10,302

**Payment Type values (BRD):** Allocation | Milestone | Registration | Offline

**Source values (BRD):** Easebuzz | Razorpay | Offline

### Gateway Settings Section (`payment-gateway-settings.png`)
Toggled by Settings button — inline, URL unchanged.

**Per-tower rows:**
- `button:has-text("View Tower")` — link to Towers module
- `button.ant-switch` (Active/Inactive) — enable/disable gateway per tower

**Save:** `button:has-text("Update")`

**Active toggle:** `button.ant-switch.ant-switch-checked` = Active

### Read-Only Module
No create/edit/delete on transaction records. Gateway settings is only write operation.
