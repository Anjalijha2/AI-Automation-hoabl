# Test Cases — Support Tickets
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Support-Tickets.md

---

## Support — Access & List View

### BYR_SUP_001 — Support Tickets reachable by direct URL (nav entries commented out)

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer logged in |
| **Type** | FUNC |
| **Test Steps** | 1. Inspect Sidebar.js + BottomNavigationBar.jsx for Support Tickets entry<br>2. Manually navigate to `/support-tickets` |
| **Expected Result** | Sidebar and bottom-nav entries are commented out (Sidebar.js:173-189, BottomNavigationBar.jsx:151-158). Page accessible only by direct URL or deep-link from another in-module page. List view renders. |
| **Priority** | High |

---

### BYR_SUP_002 — List view shows buyer's tickets only

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer has at least one ticket |
| **Type** | FUNC |
| **Test Steps** | 1. Inspect list rows |
| **Expected Result** | Only tickets belonging to logged-in buyer rendered |
| **Priority** | Critical |

---

### BYR_SUP_003 — Table columns: Ticket ID, Category, Description, Status, Date Created

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List view loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect column headers |
| **Expected Result** | All 5 columns present and labelled |
| **Priority** | High |

---

### BYR_SUP_004 — Ticket ID unique per row

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Multiple tickets exist |
| **Type** | DB |
| **Test Steps** | 1. Inspect Ticket ID values |
| **Expected Result** | Each row has unique ID matching backend record |
| **Priority** | High |

---

### BYR_SUP_005 — Status badge reflects osTicket state (NOT local DB status)

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Mix of tickets, osTicket reachable |
| **Type** | INT |
| **Test Steps** | 1. Inspect Status column<br>2. Compare to osTicket source state |
| **Expected Result** | UI badges sourced from `record.osTicket.status` live fetch: Open / Resolved / Closed / Archived / Deleted. Local DB `status` ENUM (OPEN/IN_PROGRESS/ACTION_REQUIRED/RESOLVED/CLOSED) is NEVER mutated post-create — irrelevant to UI (KB-1, support-ticket.model.js:101-105, no `.update({ status })` in service/controller). If osTicket fetch fails: badge = "Unknown" (SupportTicketTable.jsx:70-82). |
| **Priority** | High |

---

### BYR_SUP_006 — Date Created formatted consistently

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List visible |
| **Type** | UI |
| **Test Steps** | 1. Inspect date format |
| **Expected Result** | Consistent format across rows (e.g., DD MMM YYYY) |
| **Priority** | Low |

---

### BYR_SUP_007 — Empty state when no tickets

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer has zero tickets |
| **Type** | UI |
| **Test Steps** | 1. Open list view |
| **Expected Result** | "No tickets yet" message and CTA to raise one |
| **Priority** | Medium |

---

### BYR_SUP_008 — Click row opens ticket detail

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | At least one ticket |
| **Type** | FUNC |
| **Test Steps** | 1. Click any ticket row |
| **Expected Result** | Navigates to `/support-tickets/<id>` with detail and conversation thread |
| **Priority** | Critical |

---

### BYR_SUP_009 — Ticket detail shows full conversation

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Ticket detail open |
| **Type** | FUNC |
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
| **Type** | UI |
| **Test Steps** | 1. Inspect for create CTA |
| **Expected Result** | Create button visible |
| **Priority** | High |

---

### BYR_SUP_011 — Click Create navigates to categories screen

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List view open |
| **Type** | FUNC |
| **Test Steps** | 1. Click Create |
| **Expected Result** | Navigates to `/support-tickets/categories` |
| **Priority** | Critical |

---

### BYR_SUP_012 — Categories screen shows GENERAL, CAR_PARKING, CANCELLATION, LOAN

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Categories screen open |
| **Type** | UI |
| **Test Steps** | 1. Inspect category list |
| **Expected Result** | All 4 categories rendered with labels |
| **Priority** | Critical |

---

### BYR_SUP_013 — Click category opens create form

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Categories visible |
| **Type** | FUNC |
| **Test Steps** | 1. Click GENERAL |
| **Expected Result** | Navigates to `/support-tickets/create` with category preselected |
| **Priority** | High |

---

### BYR_SUP_014 — Each category routes to create with that category preselected

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Categories visible |
| **Type** | FUNC |
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
| **Type** | UI |
| **Test Steps** | 1. Inspect Category field |
| **Expected Result** | Field shows chosen category; either read-only or editable per design |
| **Priority** | High |

---

### BYR_SUP_016 — Description field mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form open |
| **Type** | VAL |
| **Test Steps** | 1. Leave Description blank<br>2. Click Submit |
| **Expected Result** | Error: "Description required"; submission blocked |
| **Priority** | Critical |

---

### BYR_SUP_017 — Description accepts multi-line text

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form open |
| **Type** | FUNC |
| **Test Steps** | 1. Type multi-line text |
| **Expected Result** | Textarea accepts newlines without truncation |
| **Priority** | Medium |

---

### BYR_SUP_018 — Submit creates ticket and returns ticket ID

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form valid |
| **Type** | FUNC |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Ticket created; success message with unique Ticket ID; redirect to list or detail |
| **Priority** | Critical |

---

### BYR_SUP_019 — Submission triggers OS Ticket API call

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Submit clicked |
| **Type** | INT |
| **Test Steps** | 1. Monitor network call to OS Ticket API |
| **Expected Result** | OS Ticket creation API invoked with matching payload |
| **Priority** | Critical |

---

### BYR_SUP_020 — Created ticket appears in list immediately

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Ticket created |
| **Type** | FUNC |
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
| **Type** | BIZ |
| **Test Steps** | 1. Select CANCELLATION<br>2. Submit |
| **Expected Result** | Ticket created under CANCELLATION category; support team alerted to start refund workflow |
| **Priority** | Critical |

---

### BYR_SUP_022 — CAR_PARKING category accepted for parking issues

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | FUNC |
| **Test Steps** | 1. Select CAR_PARKING<br>2. Submit |
| **Expected Result** | Ticket category persists as CAR_PARKING |
| **Priority** | Medium |

---

### BYR_SUP_023 — LOAN category routed to loan team

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | INT |
| **Test Steps** | 1. Select LOAN<br>2. Submit |
| **Expected Result** | Ticket created under LOAN; routed to loan team per OS Ticket config |
| **Priority** | High |

---

### BYR_SUP_024 — GENERAL used for uncategorised issues

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | FUNC |
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
| **Type** | INT |
| **Test Steps** | 1. Open ticket detail<br>2. Refresh |
| **Expected Result** | Reply visible in conversation thread; status may update |
| **Priority** | High |

---

### BYR_SUP_026 — Status updates from OS Ticket sync reflected in portal

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Status changed externally in OS Ticket |
| **Type** | INT |
| **Test Steps** | 1. Wait for sync<br>2. Reload list |
| **Expected Result** | Updated status reflected in list and detail views |
| **Priority** | High |

---

### BYR_SUP_027 — OS Ticket API failure shows graceful error

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | OS Ticket API simulated 500 |
| **Type** | NEG |
| **Test Steps** | 1. Submit a ticket |
| **Expected Result** | User sees retry message; portal-side record not orphaned without OS Ticket creation |
| **Priority** | Medium |

---

### BYR_SUP_028 — Buyer cannot view another buyer's ticket

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer A logged in, knows Buyer B's ticket ID |
| **Type** | NEG |
| **Test Steps** | 1. Open `/support-tickets/<B's-ticket-id>` |
| **Expected Result** | Access denied / 404 — no data leakage |
| **Priority** | Critical |

---

### BYR_SUP_029 — Empty description submission rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Create form |
| **Type** | VAL |
| **Test Steps** | 1. Submit with only whitespace |
| **Expected Result** | Whitespace-only treated as empty; validation triggers (note field required, support-ticket.validations.js:4-8) |
| **Priority** | Medium |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-support-tickets.md`

### Corrections to existing TCs
- **BYR_SUP_001** — Sidebar and bottom-nav links to `/support-tickets` are commented out. Page reachable only via direct URL or in-module deep links.
- **BYR_SUP_002** — Buyer scoping is enforced on LIST endpoint (`GET /api/v1/support-tickets`) by filter `userId = user.id`. NOT enforced on DETAIL endpoint `GET /api/v1/support-tickets/:id` — see new TC BYR_SUP_028 (BUG).
- **BYR_SUP_005 / BYR_SUP_026** — Status comes from live osTicket fetch, NOT local DB enum. Status drift: local ENUM has IN_PROGRESS/ACTION_REQUIRED (unrepresentable in osTicket); osTicket has Archived/Deleted (unrepresentable locally).
- **BYR_SUP_016 / BYR_SUP_029** — Body fields for create: `registrationNumber`, `category`, `note` are mandatory for ALL categories. Plus per-category: CAR_PARKING→numberOfParkings, CANCELLATION→reasonOfCancellation, LOAN→timeSlot+contactNumber (validations/support-ticket.validations.js:10-33).
- **BYR_SUP_018** — Ticket number format: `TKT-GN-NNNNNN` (e.g., `TKT-GN-000001`), generated server-side. Race condition possible — concurrent creates can collide on unique index (KB-5, support-ticket.service.js:33-46, 95-106).
- **BYR_SUP_019** — Email/notifications delegated to osTicket (`alert:true, autorespond:true`). Portal backend itself sends NO email. Recipient identity = `firstName + lastName, email, phone` from user record.
- **BYR_SUP_021** — Documents stored in **Azure Blob** path `tickets/<ticketId>/<filename>`, NOT S3. SAS-signed download URLs returned on GET /:id for CANCELLATION attachments only.
- **BYR_SUP_027** — On osTicket outage: returns 500 to client, NO DB row created (osTicket POST runs before DB insert — support-ticket.controller.js:19-32).
- **BYR_SUP_028** — Re-flagged as BUG: detail endpoint does NOT enforce ownership filter — cross-buyer access likely succeeds.

### New TCs added below

### BYR_SUP_030 — Unknown category returns 400

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Authenticated buyer |
| **Type** | NEG |
| **Test Steps** | 1. `POST /api/v1/support-tickets/create` body `{ category: 'INVALID_CAT', ... }` |
| **Expected Result** | 400 "Invalid ticket category: INVALID_CAT" (support-ticket.routes.js:16-26) |
| **Priority** | High |

---

### BYR_SUP_031 — LOAN category requires timeSlot + contactNumber

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | VAL |
| **Test Steps** | 1. Submit LOAN ticket without `contactNumber` |
| **Expected Result** | 400 Yup validation (validations/support-ticket.validations.js:25-32). Server regex `^\d{10,15}$`; client regex `^[0-9]{10}$` — drift: 11+ digit numbers fail UI but succeed API (KB-3). |
| **Priority** | High |

---

### BYR_SUP_032 — CAR_PARKING requires numberOfParkings

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | VAL |
| **Test Steps** | 1. Submit CAR_PARKING without `numberOfParkings` |
| **Expected Result** | 400 Yup validation (support-ticket.validations.js:15-18). |
| **Priority** | High |

---

### BYR_SUP_033 — CANCELLATION requires reasonOfCancellation

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | VAL |
| **Test Steps** | 1. Submit CANCELLATION without `reasonOfCancellation` |
| **Expected Result** | 400 Yup validation. Note: file attachments individually optional (KB-7) — CANCELLATION ticket with zero files is accepted. |
| **Priority** | High |

---

### BYR_SUP_034 — CANCELLATION uploads only accept whitelist MIME

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | CANCELLATION form |
| **Type** | VAL |
| **Test Steps** | 1. Upload `.docx` as `aadharCard`<br>2. Upload `.gif` as `panCard` |
| **Expected Result** | 400 "Invalid file type for aadharCard..." — whitelist = `application/pdf, image/jpeg, image/jpg, image/png, image/webp` (utils/upload.js:158-175, 195-204) |
| **Priority** | High |

---

### BYR_SUP_035 — File size limits per field

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | CANCELLATION form |
| **Type** | EDGE |
| **Test Steps** | 1. Upload 6MB aadharCard (limit 5MB)<br>2. Upload 11MB transactionProof (limit 10MB) |
| **Expected Result** | Both rejected by multer; aadhar/pan/cancelledCheque cap = 5 MB; transactionProof cap = 10 MB (utils/upload.js:158-175). |
| **Priority** | High |

---

### BYR_SUP_036 — Non-CANCELLATION categories silently ignore uploaded files

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Form |
| **Type** | BIZ |
| **Test Steps** | 1. Submit GENERAL with `aadharCard` file attached |
| **Expected Result** | Ticket created; file NOT uploaded to Azure; DB row attachment columns NULL (support-ticket.service.js:61-85). Silent — no error. |
| **Priority** | Medium |

---

### BYR_SUP_037 — Search returns no API call for 1-3 chars

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | List view loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Type "a" then "ab" then "abc" — monitor network |
| **Expected Result** | No `GET /api/v1/support-tickets?search=...` call. Type 4+ chars: call fires. Clear: immediate reload (client debounce — SupportTicketTable.jsx:128-133). |
| **Priority** | Medium |

---

### BYR_SUP_038 — projectId hardcoded by NODE_ENV

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Any env |
| **Type** | DB |
| **Test Steps** | 1. Create ticket<br>2. Query `support_tickets.project_id` |
| **Expected Result** | Always 1 (prod) / 2 (non-prod) regardless of buyer's actual project context (support-ticket.service.js:21). Multi-project rollout BUG. |
| **Priority** | Medium |

---

### BYR_SUP_039 — Detail endpoint missing ownership check (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer A authenticated; Buyer B has ticket ID=42 |
| **Type** | API |
| **Test Steps** | 1. `GET /api/v1/support-tickets/42` with A's token |
| **Expected Result** | KNOWN BUG: returns Buyer B's ticket details (no `userId = user.id` filter on getById — support-ticket.service.js:225-278 vs :165-167). Document as security gap. |
| **Priority** | Critical (Security) |

---

### BYR_SUP_040 — Concurrent ticket creates can collide on ticket_number unique index

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Two simultaneous buyer create requests |
| **Type** | DB |
| **Test Steps** | 1. Fire 2 `POST /create` calls in parallel |
| **Expected Result** | KNOWN RACE: both compute same next sequential `TKT-GN-NNNNNN`; one wins, the other 500s on unique index violation, no retry (KB-5). |
| **Priority** | Medium |

---

### BYR_SUP_041 — Registration unit ownership NOT enforced on create

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Buyer A; registrationNumber R belongs to Buyer B |
| **Type** | API |
| **Test Steps** | 1. `POST /create` with `registrationNumber=R` from A |
| **Expected Result** | Backend only checks existence, NOT ownership (support-ticket.service.js:25-31). Ticket likely created. Document — verify intent. |
| **Priority** | High (Security) |

---

### BYR_SUP_042 — No DELETE/PATCH endpoint for buyer

| Field | Value |
|-------|-------|
| **Module** | BYR – Support |
| **Pre-conditions** | Ticket exists |
| **Type** | API |
| **Test Steps** | 1. Attempt `DELETE /api/v1/support-tickets/:id` or `PATCH` |
| **Expected Result** | 404/405 — only POST /create, GET /, GET /:id exist (support-ticket.routes.js). Buyer cannot withdraw/close their own ticket (KB-8). |
| **Priority** | Medium |
