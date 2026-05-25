# Test Cases — Support Tickets
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Support-Tickets.md

---

## Support — Access & List View

### BYR_SUP_001 — Support Tickets accessible from nav menu

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Click Support Tickets in nav |
| **Expected Result** | URL = `/support-tickets`; list view renders |
| **Priority** | Critical |

---

### BYR_SUP_002 — List view shows buyer's tickets only

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer has at least one ticket |
| **Test Steps** | 1. Inspect list rows |
| **Expected Result** | Only tickets belonging to logged-in buyer rendered |
| **Priority** | Critical |

---

### BYR_SUP_003 — Table columns: Ticket ID, Category, Description, Status, Date Created

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List view loaded |
| **Test Steps** | 1. Inspect column headers |
| **Expected Result** | All 5 columns present and labelled |
| **Priority** | High |

---

### BYR_SUP_004 — Ticket ID unique per row

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Multiple tickets exist |
| **Test Steps** | 1. Inspect Ticket ID values |
| **Expected Result** | Each row has unique ID matching backend record |
| **Priority** | High |

---

### BYR_SUP_005 — Status badge reflects current state

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Mix of statuses in tickets |
| **Test Steps** | 1. Inspect Status column |
| **Expected Result** | Badge style/colour matches status (Open, In Progress, Resolved, Closed) |
| **Priority** | High |

---

### BYR_SUP_006 — Date Created formatted consistently

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List visible |
| **Test Steps** | 1. Inspect date format |
| **Expected Result** | Consistent format across rows (e.g., DD MMM YYYY) |
| **Priority** | Low |

---

### BYR_SUP_007 — Empty state when no tickets

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer has zero tickets |
| **Test Steps** | 1. Open list view |
| **Expected Result** | "No tickets yet" message and CTA to raise one |
| **Priority** | Medium |

---

### BYR_SUP_008 — Click row opens ticket detail

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | At least one ticket |
| **Test Steps** | 1. Click any ticket row |
| **Expected Result** | Navigates to `/support-tickets/<id>` with detail and conversation thread |
| **Priority** | Critical |

---

### BYR_SUP_009 — Ticket detail shows full conversation

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Ticket detail open |
| **Test Steps** | 1. Inspect conversation thread |
| **Expected Result** | All buyer messages and support team responses rendered chronologically |
| **Priority** | High |

---

## Support — Create New Ticket — Category Selection

### BYR_SUP_010 — "New Ticket" / "Create" button visible on list

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List view open |
| **Test Steps** | 1. Inspect for create CTA |
| **Expected Result** | Create button visible |
| **Priority** | High |

---

### BYR_SUP_011 — Click Create navigates to categories screen

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List view open |
| **Test Steps** | 1. Click Create |
| **Expected Result** | Navigates to `/support-tickets/categories` |
| **Priority** | Critical |

---

### BYR_SUP_012 — Categories screen shows GENERAL, CAR_PARKING, CANCELLATION, LOAN

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Categories screen open |
| **Test Steps** | 1. Inspect category list |
| **Expected Result** | All 4 categories rendered with labels |
| **Priority** | Critical |

---

### BYR_SUP_013 — Click category opens create form

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Categories visible |
| **Test Steps** | 1. Click GENERAL |
| **Expected Result** | Navigates to `/support-tickets/create` with category preselected |
| **Priority** | High |

---

### BYR_SUP_014 — Each category routes to create with that category preselected

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Categories visible |
| **Test Steps** | 1. Click each category in turn |
| **Expected Result** | Form opens with correct category value preset |
| **Priority** | High |

---

## Support — Create Form

### BYR_SUP_015 — Category field shows preselected value

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form open from category click |
| **Test Steps** | 1. Inspect Category field |
| **Expected Result** | Field shows chosen category; either read-only or editable per design |
| **Priority** | High |

---

### BYR_SUP_016 — Description field mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form open |
| **Test Steps** | 1. Leave Description blank<br>2. Click Submit |
| **Expected Result** | Error: "Description required"; submission blocked |
| **Priority** | Critical |

---

### BYR_SUP_017 — Description accepts multi-line text

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form open |
| **Test Steps** | 1. Type multi-line text |
| **Expected Result** | Textarea accepts newlines without truncation |
| **Priority** | Medium |

---

### BYR_SUP_018 — Submit creates ticket and returns ticket ID

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form valid |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Ticket created; success message with unique Ticket ID; redirect to list or detail |
| **Priority** | Critical |

---

### BYR_SUP_019 — Submission triggers OS Ticket API call

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Submit clicked |
| **Test Steps** | 1. Monitor network call to OS Ticket API |
| **Expected Result** | OS Ticket creation API invoked with matching payload |
| **Priority** | Critical |

---

### BYR_SUP_020 — Created ticket appears in list immediately

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Ticket created |
| **Test Steps** | 1. Return to list view |
| **Expected Result** | New ticket appears at top with status Open and current date |
| **Priority** | High |

---

## Support — Category-Specific Behaviour

### BYR_SUP_021 — Cancellation category creates cancellation ticket

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer with confirmed booking |
| **Test Steps** | 1. Select CANCELLATION<br>2. Submit |
| **Expected Result** | Ticket created under CANCELLATION category; support team alerted to start refund workflow |
| **Priority** | Critical |

---

### BYR_SUP_022 — CAR_PARKING category accepted for parking issues

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Test Steps** | 1. Select CAR_PARKING<br>2. Submit |
| **Expected Result** | Ticket category persists as CAR_PARKING |
| **Priority** | Medium |

---

### BYR_SUP_023 — LOAN category routed to loan team

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Test Steps** | 1. Select LOAN<br>2. Submit |
| **Expected Result** | Ticket created under LOAN; routed to loan team per OS Ticket config |
| **Priority** | High |

---

### BYR_SUP_024 — GENERAL used for uncategorised issues

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Test Steps** | 1. Select GENERAL<br>2. Submit |
| **Expected Result** | Ticket created as GENERAL |
| **Priority** | Medium |

---

## Support — Status Sync & Negative Cases

### BYR_SUP_025 — Support team reply visible in detail view

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Support team posts response in OS Ticket |
| **Test Steps** | 1. Open ticket detail<br>2. Refresh |
| **Expected Result** | Reply visible in conversation thread; status may update |
| **Priority** | High |

---

### BYR_SUP_026 — Status updates from OS Ticket sync reflected in portal

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Status changed externally in OS Ticket |
| **Test Steps** | 1. Wait for sync<br>2. Reload list |
| **Expected Result** | Updated status reflected in list and detail views |
| **Priority** | High |

---

### BYR_SUP_027 — OS Ticket API failure shows graceful error

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | OS Ticket API simulated 500 |
| **Test Steps** | 1. Submit a ticket |
| **Expected Result** | User sees retry message; portal-side record not orphaned without OS Ticket creation |
| **Priority** | Medium |

---

### BYR_SUP_028 — Buyer cannot view another buyer's ticket

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer A logged in, knows Buyer B's ticket ID |
| **Test Steps** | 1. Open `/support-tickets/<B's-ticket-id>` |
| **Expected Result** | Access denied / 404 — no data leakage |
| **Priority** | Critical |

---

### BYR_SUP_029 — Empty description submission rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form |
| **Test Steps** | 1. Submit with only whitespace |
| **Expected Result** | Whitespace-only treated as empty; validation triggers |
| **Priority** | Medium |

---
