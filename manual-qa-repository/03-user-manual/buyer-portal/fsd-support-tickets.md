# FSD — Buyer Portal: Support Tickets
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Support Tickets module lets an authenticated buyer raise a category-driven query against a specific Registration Unit. The backend persists the ticket in MySQL (`support_tickets` table) and simultaneously creates a mirror ticket in an external osTicket helpdesk system. All status/agent-thread updates after creation are served by reading osTicket — XR Portal's own DB only stores the request snapshot.

- Frontend route: `/support-tickets` (list), `/support-tickets/categories`, `/support-tickets/create?category=<CAT>`, `/support-tickets/[id]` // Source: source-code/buyer-portal/src/app/support-tickets/page.js, source-code/buyer-portal/src/app/support-tickets/categories/page.js, source-code/buyer-portal/src/app/support-tickets/create/page.js, source-code/buyer-portal/src/app/support-tickets/[id]/page.js
- Backend route mount: `/api/v1/support-tickets` // Source: source-code/backend/src/routes/index.js:74
- Categories supported: `GENERAL`, `CAR_PARKING`, `CANCELLATION`, `LOAN` // Source: source-code/backend/src/constants/global.js:161-166
- Visible UI label: "Support Tickets" with "Create Ticket" CTA leading to category picker // Source: source-code/buyer-portal/src/components/support-tickets/SupportTicketTable.jsx:173-199
- Sidebar / bottom-nav entry for `/support-tickets` is currently **commented out** in both nav components — entry is reachable only via direct URL or the deep links inside the module // Source: source-code/buyer-portal/src/components/Sidebar.js:173-189, source-code/buyer-portal/src/components/BottomNavigationBar.jsx:151-158

---

## 2. Data Model

### Table: `support_tickets`
// Source: source-code/backend/src/migrations/20260123064621-create-support-tickets-table.cjs, source-code/backend/src/models/support-ticket.model.js

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED PK AI | NO | — | // Source: support-ticket.model.js:35-39 |
| `user_id` | BIGINT UNSIGNED FK → users.id | NO | — | CASCADE on update/delete // Source: 20260123064621-create-support-tickets-table.cjs:14-23 |
| `project_id` | BIGINT UNSIGNED FK → projects.id | NO | — | Hard-coded server-side: `1` in production else `2` // Source: support-ticket.service.js:21 |
| `registration_unit_id` | INTEGER UNSIGNED FK → registration_units.id | NO | — | Resolved from posted `registrationNumber` // Source: support-ticket.service.js:25-31 |
| `os_ticket_id` | STRING(50) UNIQUE | NO | — | Returned by osTicket on creation // Source: 20260123064621-create-support-tickets-table.cjs:44-48 |
| `ticket_number` | STRING(50) UNIQUE | NO | — | Server-generated, format `TKT-GN-NNNNNN` // Source: support-ticket.service.js:95-106 |
| `category` | ENUM(GENERAL, CAR_PARKING, CANCELLATION, LOAN) | NO | — | // Source: support-ticket.model.js:60-63 |
| `number_of_parkings` | INTEGER | NO | 0 | Required only for CAR_PARKING // Source: support-ticket.validations.js:15-18 |
| `time_slot` | STRING(50) | YES | NULL | Required only for LOAN // Source: support-ticket.validations.js:25-32 |
| `contact_number` | STRING(20) | YES | NULL | Required only for LOAN; regex `^\d{10,15}$` server-side, `^[0-9]{10}$` client-side // Source: support-ticket.validations.js:28-31, SupportTicketForm.jsx:189-192 |
| `reason_of_cancellation` | STRING(100) | YES | NULL | Required only for CANCELLATION // Source: support-ticket.validations.js:20-23 |
| `aadhar_card` | STRING(200) | YES | NULL | Azure blob name; CANCELLATION only // Source: support-ticket.service.js:79-84 |
| `pan_card` | STRING(200) | YES | NULL | Azure blob name; CANCELLATION only // Source: support-ticket.service.js:79-84 |
| `transaction_proof` | STRING(200) | YES | NULL | Azure blob name; CANCELLATION only // Source: support-ticket.service.js:79-84 |
| `cancelled_cheque` | STRING(200) | YES | NULL | Azure blob name; CANCELLATION only // Source: support-ticket.service.js:79-84 |
| `note` | TEXT | NO | — | Free-text message; mandatory all categories // Source: support-ticket.validations.js:4-8 |
| `status` | ENUM(OPEN, IN_PROGRESS, ACTION_REQUIRED, RESOLVED, CLOSED) | NO | 'OPEN' | Stored locally but never mutated by backend code reviewed — see Section 7 // Source: support-ticket.model.js:101-105 |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | // Source: 20260123064621-create-support-tickets-table.cjs:100-103 |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | // Source: 20260123064621-create-support-tickets-table.cjs:105-108 |

Indexes: `registration_unit_id`, `ticket_number`, `status`, `category` // Source: 20260123064621-create-support-tickets-table.cjs:112-117

### Associations
- `SupportTicket.belongsTo(User, foreignKey: userId, as: 'user')` // Source: support-ticket.model.js:16-19
- `SupportTicket.belongsTo(Project, foreignKey: projectId, as: 'project')` // Source: support-ticket.model.js:21-24
- `SupportTicket.belongsTo(RegistrationUnit, foreignKey: registrationUnitId, as: 'registrationUnit')` // Source: support-ticket.model.js:26-29

### Ticket Number Generator
- Prefix: `TKT-GN-` // Source: support-ticket.service.js:96
- First-ever ticket: `TKT-GN-000001` // Source: support-ticket.service.js:98-100
- Subsequent: last numeric suffix + 1, zero-padded to 6 digits // Source: support-ticket.service.js:102-105

---

## 3. State Machines

### Local DB `status` field
- Default on insert: `OPEN` // Source: support-ticket.model.js:101-105
- Allowed values declared in ENUM: `OPEN → IN_PROGRESS → ACTION_REQUIRED → RESOLVED → CLOSED` // Source: support-ticket.model.js:101-105
- Transition triggers: **NOT FOUND — verify manually.** No code path in the backend repo reviewed mutates `status` after `SupportTicket.create(...)`. The field is declared but never updated in `support-ticket.service.js` or `support-ticket.controller.js`. // Source: NOT FOUND — verify manually

### External (osTicket) status surfaced in UI
- UI reads `record.osTicket.status` from the live osTicket fetch, not the DB enum // Source: source-code/buyer-portal/src/components/support-tickets/SupportTicketTable.jsx:70-82
- Recognised values rendered: `Open`, `Resolved`, `Closed`, `Archived`, `Deleted` (others fall through as `default` badge) // Source: SupportTicketTable.jsx:73-79
- Fallback display when osTicket lookup returns nothing: `'Unknown'` // Source: SupportTicketTable.jsx:71

---

## 4. Business Rules

1. **Auth required.** Routes are guarded by `protect` middleware and restricted to roles `user` or `admin`. // Source: source-code/backend/src/routes/support-ticket.routes.js:10
2. **Category-driven validation.** Schema selected at runtime from `supportTicketSchema[category]`. Unknown category → HTTP 400 `Invalid ticket category: <category>`. // Source: support-ticket.routes.js:16-26
3. **Required fields per category** // Source: source-code/backend/src/validations/support-ticket.validations.js:10-33
   - All: `registrationNumber`, `category`, `note`
   - `CAR_PARKING`: + `numberOfParkings` (numeric)
   - `CANCELLATION`: + `reasonOfCancellation`
   - `LOAN`: + `timeSlot`, + `contactNumber` (regex `^\d{10,15}$`)
3a. **Frontend reason list** for CANCELLATION restricts buyer input to a closed set: `Financial constraints`, `Relocation`, `Found better option`, `Personal reason`, `Other`. // Source: source-code/buyer-portal/src/components/support-tickets/SupportTicketForm.jsx:37-58
3b. **Frontend time-slot list** for LOAN: `10:00 AM - 12:00 PM`, `12:00 PM - 2:00 PM`, `2:00 PM - 4:00 PM`, `4:00 PM - 6:00 PM`. // Source: SupportTicketForm.jsx:18-35
4. **Registration unit must exist.** `RegistrationUnit.findOne({ where: { registrationNumber } })` — if not found, throws `'Registration unit not found'`. // Source: support-ticket.service.js:25-31
5. **File attachments only for CANCELLATION.** Other categories ignore any uploaded files entirely (no branch processes them). // Source: support-ticket.service.js:61-85
6. **Attachment field set (per request, max 1 file each):** `aadharCard`, `panCard`, `transactionProof`, `cancelledCheque`. // Source: source-code/backend/src/utils/upload.js:206-217
7. **Max file size enforced by multer:** 10 MB hard cap (the largest among per-field limits). Per-field declared limits: aadhar/pan/cancelledCheque = 5 MB, transactionProof = 10 MB. // Source: upload.js:209-210, upload.js:158-175
8. **Allowed MIME types** for each upload field: `application/pdf, image/jpeg, image/jpg, image/png, image/webp`. Mismatches rejected with `Invalid file type for <fieldname>...`. // Source: upload.js:158-175, upload.js:195-204
9. **Each CANCELLATION document is optional individually** — service only uploads what is present in `req.files`. There is no enforcement that *all four* be supplied. // Source: support-ticket.service.js:61-85
10. **Project assignment is hard-coded server-side** to `projectId = 1` (production) or `projectId = 2` (non-production). User does not pick the project. // Source: support-ticket.service.js:21
11. **List visibility scoping.** When `req.user.role === 'user'`, list is filtered to `userId = user.id`. Admin role sees all tickets. // Source: support-ticket.service.js:165-167
12. **Search behaviour.** Server `search` matches `ticketNumber LIKE %x%` OR `registration_number LIKE %x%`. // Source: support-ticket.service.js:169-174
13. **Search debounce on client.** The list does not call backend while the search term is non-empty but ≤ 3 characters. // Source: source-code/buyer-portal/src/components/support-tickets/SupportTicketTable.jsx:128-133
14. **Pagination defaults.** `current=1`, `pageSize=10`; client offers page sizes 10/20/50. // Source: support-ticket.service.js:157-158, SupportTicketTable.jsx:28-31

---

## 5. Notification Dispatch

- **In-app:** Success toast shown after creation using the message returned by the API: `"Ticket raised successfully. You will be notified via email once the ticket is processed."` // Source: source-code/backend/src/controllers/support-ticket.controller.js:24-28, source-code/buyer-portal/src/components/support-tickets/SupportTicketForm.jsx:115-118
- **Email — outbound to buyer / agents:** delegated entirely to osTicket. The backend posts to osTicket with `alert: true` and `autorespond: true`, which tells osTicket to dispatch its standard new-ticket and auto-responder emails. The XR Portal codebase itself sends no email for tickets. // Source: source-code/backend/src/services/api/os-ticket-api.service.js:104-106
- **Recipient identity passed to osTicket:** `name = user.firstName + ' ' + user.lastName`, `email = user.email`, `phone = user.phone`, `subject = body.category.replace('_', ' ')`. // Source: os-ticket-api.service.js:107-112
- **Buyer notification on status change:** **NOT FOUND — verify manually.** No webhook, listener, or polling job in `backend/src` consumes osTicket status changes to notify the buyer through XR Portal. Any such notification would originate from osTicket directly. // Source: NOT FOUND — verify manually

---

## 6. API Endpoints

All paths below are relative to `/api/v1/support-tickets`. Auth: `protect` + `restrictTo('user', 'admin')` applied to every route. // Source: support-ticket.routes.js:10

### POST `/create`
// Source: support-ticket.routes.js:12-32, support-ticket.controller.js:19-32
- Content-Type: `multipart/form-data` (because of optional uploads) // Source: SupportTicketForm.jsx:109-113
- Multer fields: `aadharCard`, `panCard`, `transactionProof`, `cancelledCheque` (max 1 each, 10 MB hard cap) // Source: upload.js:206-217
- Body (validated against `supportTicketSchema[category]`):
  - `registrationNumber` (string, required)
  - `category` (enum GENERAL|CAR_PARKING|CANCELLATION|LOAN, required)
  - `note` (string, required)
  - `numberOfParkings` (CAR_PARKING)
  - `reasonOfCancellation` (CANCELLATION)
  - `timeSlot`, `contactNumber` (LOAN)
- Side effects:
  1. POST to osTicket `/api/tickets.json` // Source: os-ticket-api.service.js:121
  2. Insert into `support_tickets` // Source: support-ticket.service.js:41-53
  3. (CANCELLATION) Upload each present file to Azure Blob path `tickets/<ticketId>/<filename>` and patch ticket with returned blobName // Source: support-ticket.service.js:61-85
- Responses:
  - `201 Created` with `{ success, message: "Ticket raised successfully...", data: <ticket> }` // Source: support-ticket.controller.js:24-28
  - `400 Bad Request` when category unknown: `Invalid ticket category: <x>` // Source: support-ticket.routes.js:19-23
  - `500 Internal Server Error` on any thrown exception (osTicket failure, DB failure, missing registration unit, etc.) // Source: support-ticket.controller.js:29-31

### GET `/`
// Source: support-ticket.routes.js:34, support-ticket.controller.js:41-63
- Query params: `current` (default 1), `pageSize` (default 10), `search`, `category` // Source: support-ticket.service.js:155-178
- Returns: `{ tickets: [...], pagination: { totalRecords, current, pageSize, totalPages } }`; each ticket is enriched with `osTicket` (live snapshot from osTicket `/scp/tickets-api.php?ticket_numbers=<ids>` ) or `null` if no match found. // Source: support-ticket.controller.js:43-58, os-ticket-api.service.js:198-205
- 500 on any failure. // Source: support-ticket.controller.js:60-62

### GET `/:id`
// Source: support-ticket.routes.js:35, support-ticket.controller.js:72-89, support-ticket.service.js:225-278
- Returns single ticket joined with `project.name` as `projectName`, `registrationUnit.registration_number` as `registrationNumber`, plus `osTicket` snapshot
- For `CANCELLATION` tickets, also adds SAS-signed download URLs: `aadharCardLink`, `panCardLink`, `transactionProofLink`, `cancelledChequeLink` (generated via `azureBlobService.generateSasUrl`) // Source: support-ticket.service.js:267-275
- 500 on error (message bubbled as the error message) // Source: support-ticket.controller.js:86-88

### Upstream dependency — osTicket
- Base URL: `OS_TICKET_BASE_URL`, defaults to `https://uat-support.xrportal.in` // Source: source-code/backend/src/config/api.js:41-44
- Auth header: `X-API-Key: <OS_TICKET_API_KEY>` // Source: os-ticket-api.service.js:17-20
- Timeout: `OS_TICKET_TIMEOUT` (default 30000 ms) // Source: api.js:44
- Endpoints called: `POST /api/tickets.json`, `GET /scp/tickets-api.php?ticket_numbers=<csv>` // Source: os-ticket-api.service.js:121, os-ticket-api.service.js:202

---

## 7. Known Bugs / Gaps

1. **Local `status` is never updated.** The ENUM column `status` defaults to `OPEN` and no code in the reviewed backend mutates it. UI status is derived solely from a fresh osTicket fetch. If the osTicket call fails, the UI shows `'Unknown'` regardless of real ticket state. // Source: support-ticket.controller.js, support-ticket.service.js (no `.update({ status })` call), SupportTicketTable.jsx:70-82
2. **DB↔osTicket status drift.** The DB ENUM (`OPEN, IN_PROGRESS, ACTION_REQUIRED, RESOLVED, CLOSED`) does not align with the osTicket-side values the UI renders (`Open, Resolved, Closed, Archived, Deleted`). `Archived` and `Deleted` are unrepresentable locally; `IN_PROGRESS` and `ACTION_REQUIRED` are unrepresentable on the osTicket side. // Source: support-ticket.model.js:101-105 vs SupportTicketTable.jsx:73-79
3. **Phone-number regex inconsistency.** Server allows 10–15 digits (`^\d{10,15}$`), client allows exactly 10 digits (`^[0-9]{10}$`). 11–15-digit numbers will fail in the UI even though the API would accept them. // Source: support-ticket.validations.js:28-31 vs SupportTicketForm.jsx:189-192
4. **`projectId` is hard-coded.** Buyers on a project other than the one mapped to id 1 (prod) / 2 (non-prod) will see their ticket recorded under the wrong project. There is no per-user resolution. // Source: support-ticket.service.js:21
5. **Race condition in `ticketNumber` generation.** `generateTicketNumber` does `findOne({ order: [['createdAt', 'DESC']] })` then `create`. Two concurrent creates can compute the same next number and collide on the `ticket_number` unique index, causing a 500. No retry. // Source: support-ticket.service.js:33-46, 95-106
6. **All errors collapse to HTTP 500.** Business errors (`'Registration unit not found'`) and infra errors (osTicket down) return the same generic 500 body, with no `code` field. // Source: support-ticket.controller.js:29-31, 60-62, 86-88
7. **Cancellation file optionality undocumented.** Service comment says *"Documents are mandatory only for CANCELLATION category"* but each file individually is optional — only the *category* gates whether uploads are processed. A CANCELLATION ticket can be created with zero attachments. // Source: support-ticket.service.js:7-12, 61-85
8. **No `DELETE` / `PATCH` endpoints.** Buyers cannot withdraw, edit, or close their ticket from the portal; only osTicket can change state. // Source: support-ticket.routes.js (only POST /create, GET /, GET /:id exist)
9. **Sidebar and bottom-nav entries for Support Tickets are commented out** in the current build, so discoverability depends on direct URL or in-module links only. // Source: Sidebar.js:173-189, BottomNavigationBar.jsx:151-158
10. **No SLA / priority data model.** No columns for priority, severity, or due-date exist on `support_tickets`; any SLA tracking lives entirely in osTicket. // Source: support-ticket.model.js (entire schema), 20260123064621-create-support-tickets-table.cjs (entire schema)

---

## 8. QA Risk Areas

1. **Category-specific validation matrix** — submit each of the 4 categories with valid + missing-required-field payloads; confirm correct 400 vs 201 outcomes. Categories: GENERAL, CAR_PARKING, CANCELLATION, LOAN. // Source: support-ticket.validations.js:10-33
2. **CANCELLATION upload edge cases** — confirm: zero attachments (currently accepted), one of four attachments, all four, oversize file (>5 MB for aadhar/pan/cheque, >10 MB for transactionProof), wrong MIME (e.g. .docx, .gif). // Source: upload.js:158-175, support-ticket.service.js:61-85
3. **Non-CANCELLATION + attachments** — verify that files uploaded for GENERAL/CAR_PARKING/LOAN are *silently ignored* (no DB row updated, no Azure blob created). // Source: support-ticket.service.js:61-85
4. **Concurrency on `ticketNumber`** — two parallel POST /create calls; expect collision risk on unique index. // Source: support-ticket.service.js:33-46
5. **osTicket outage behaviour** — simulate `OS_TICKET_BASE_URL` unreachable; verify 500 + no DB row created (because `createOSTicket` runs before `createTicket`). // Source: support-ticket.controller.js:19-32
6. **List enrichment when osTicket fetch returns partial set** — confirm tickets whose `osTicketId` is absent in the response get `osTicket = null` and UI renders `Unknown`. // Source: support-ticket.controller.js:43-58, SupportTicketTable.jsx:70-82
7. **Status badge mapping** — verify each osTicket status (`Open, Resolved, Closed, Archived, Deleted`, plus unknown values) renders the right Ant Design badge colour and label. // Source: SupportTicketTable.jsx:73-82
8. **Role-based list scoping** — login as buyer (`role: 'user'`) and admin; confirm buyer sees only their own tickets, admin sees all. // Source: support-ticket.service.js:165-167
9. **Search field debounce** — type 1, 2, 3 chars; expect no API call. Type 4+ chars; expect API call. Clear; expect immediate reload. // Source: SupportTicketTable.jsx:128-133
10. **Pagination boundaries** — totalRecords = 0, 1, exactly pageSize, pageSize+1; navigate last page; change pageSize between 10/20/50. // Source: support-ticket.service.js:157-158, SupportTicketTable.jsx:28-31
11. **Phone regex mismatch** — submit an 11-digit contact number via API directly (Postman); should succeed despite UI rejecting it. // Source: support-ticket.validations.js:28-31 vs SupportTicketForm.jsx:189-192
12. **Registration number ownership** — try POST /create with a `registrationNumber` belonging to a different user; backend currently only checks existence, not ownership. Confirm whether this is intentional. // Source: support-ticket.service.js:25-31
13. **GET /:id authorisation** — confirm a buyer cannot retrieve another buyer's ticket via direct id. The reviewed handler does *not* re-apply the `userId = user.id` filter that GET / applies. // Source: support-ticket.service.js:225-278 (no `userId` check), vs support-ticket.service.js:165-167
14. **SAS URL expiry** — generated SAS download links for CANCELLATION docs; confirm they expire and re-fetching the ticket returns a fresh URL. // Source: support-ticket.service.js:267-275
15. **Hard-coded projectId** — on a UAT environment with multiple seeded projects, verify project name shown in the list matches expectations. // Source: support-ticket.service.js:21
16. **Auto-responder email delivery** — observe whether the buyer actually receives the osTicket auto-response with their `user.email` on file. // Source: os-ticket-api.service.js:104-112
17. **Navigation discoverability** — sidebar / bottom-nav entries are commented out. Verify the route is reachable only by typed URL or via the "Create Ticket" button on `/support-tickets`. // Source: Sidebar.js:173-189, BottomNavigationBar.jsx:151-158
