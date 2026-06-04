# Test Data Spec — Support Tickets — Buyer Portal

**Module:** support-tickets
**Portal:** buyer
**URL:** `https://uat.xrportal.in/support-tickets`
**Generated:** 2026-06-03
**Source:** BUYER-FS-Support-Tickets.md §2.2, §2.3

---

## Pre-conditions

- **Auth:** Valid buyer session at `automation-repository/fixtures/.auth/buyer.json` (UAT mobile `8888888888` / OTP `258369`).
- **Data — seeded ticket fixtures required to lift visual gaps and pending TCs:**
  - At least 1 ticket in each category: GENERAL, CAR_PARKING, CANCELLATION, LOAN
  - At least 1 ticket in each status: Open, In Progress, Resolved
  - A separate buyer account (Buyer B) with disjoint ticket set — required for TC_SUPPORT_FUNC_005 (data isolation)
  - One known keyword string seeded into a ticket Description for search testing (TC_SUPPORT_FUNC_001)

---

## Valid Inputs

| Field | Valid Values | Notes |
|-------|-------------|-------|
| Category | `GENERAL`, `CAR_PARKING`, `CANCELLATION`, `LOAN` | Exact enum per BRD §2.2 |
| Description | Any non-empty UTF-8 string (1 – ~2000 chars) | Plain text; reference numbers encouraged (Registration No, Transaction ID) |
| Search keyword | Substring matching any visible column value | Free text in `input[placeholder="Search tickets..."]` |
| Category filter | One of GENERAL / CAR_PARKING / CANCELLATION / LOAN | Selected via `Select Category` dropdown |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| Category (Create form) | Empty / unselected | Required-field validation error; submit blocked |
| Description (Create form) | Empty / whitespace only | Required-field validation error; submit blocked |
| Description (Create form) | 2000-char paste | Either accepted, or character-limit error displayed (boundary — TBD by capture) |
| Search input | `<script>alert(1)</script>` | Treated as literal text; no XSS execution; no row match → empty state |
| Search input | Unicode/emoji string `🚀テスト` | Treated as literal text; safe handling |
| Direct URL access | `/support-tickets` without auth | Redirect to `https://uat.xrportal.in/` |
| Direct URL access | `/support-tickets/:invalid-id` | Either 404, redirect to list, or "not found" message (TBD — confirm during visual recapture) |

---

## Test Data Strings (for reproducible runs)

```
TIMESTAMP_TOKEN     = ISO8601 timestamp at run start (e.g. 2026-06-03T11:22:33Z)
TICKET_GENERAL      = { category: "GENERAL",      description: "QA test ticket "      + TIMESTAMP_TOKEN }
TICKET_CANCEL       = { category: "CANCELLATION", description: "Cancellation request " + TIMESTAMP_TOKEN }
TICKET_E2E          = { category: "GENERAL",      description: "E2E test "             + TIMESTAMP_TOKEN }
SEARCH_NO_MATCH     = "zzzzzz-no-match-xyz"
SEARCH_XSS          = "<script>alert(1)</script>"
DESCRIPTION_LONG    = 2000-char lorem ipsum block (boundary)
```

---

## Selectors Used in Tests (from `visual-memory/buyer/support-tickets/INDEX.md`)

| Element | Selector |
|---------|----------|
| Page heading | `h4:has-text("Support Tickets")` |
| Card title | `.ant-card-head-title:has-text("Support Tickets")` |
| Search input | `input[placeholder="Search tickets..."]` |
| Category dropdown trigger | `.ant-select` containing text `"Select Category"` |
| Clear filter button | `button.ant-btn` filter `{ hasText: /clear/i }` |
| Table rows | `tbody tr` |
| Empty state | `text="No data"` |
| Logout button | `button.ant-btn` filter `{ hasText: /logout/i }` |
| Sidebar "Create Ticket" | nav link `text="Create Ticket"` |

---

## Cleanup / Teardown

- Tickets created during test runs accumulate in OS Ticket (external system) — they cannot be deleted from the buyer portal.
- **Convention:** Prefix every test-created Description with `QA test`, `E2E test`, or `Cancellation request` plus the TIMESTAMP_TOKEN so support team can identify and dispose via OS Ticket housekeeping.
- **Do NOT** submit real-looking Cancellation requests in shared environments without coordination — BRD §2.4 routes Cancellation tickets to the support team's refund workflow.
- Clear browser storage state only when explicitly testing unauthenticated/redirect cases (TC_SUPPORT_UI_006, TC_SUPPORT_NEG_001).

---

## Constraints / Out of Scope

- **OS Ticket external system** — not directly testable; verify only downstream effects observable in the buyer portal (ticket appears in list, has unique ID, status sync visible).
- **Strapi CMS** — excluded per project constraint.
- **LeadSquared** — excluded per project constraint.
- **Email/SMS notifications on ticket creation** — not documented in BUYER-FS-Support-Tickets.md; out of scope unless added to BRD.
