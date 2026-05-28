# Test Cases — Leads Management
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Leads-Management.md

---

## Leads Page Navigation

### CP_LEAD_001 — Navigate to Leads from main nav

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP is logged in and on Dashboard |
| **Type** | UI |
| **Test Steps** | 1. Click **Leads** in the main navigation menu<br>2. Wait for the Leads page to load |
| **Expected Result** | URL updates to `/leads`; Leads page renders with header, list/table, and loading indicator |
| **Priority** | Critical |

---

### CP_LEAD_002 — Verify Leads page header

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads page is open |
| **Type** | UI |
| **Test Steps** | 1. Read the page heading<br>2. Verify the breadcrumb / active nav item |
| **Expected Result** | Page heading reads "Leads" (or equivalent); Leads menu item is highlighted as active |
| **Priority** | Medium |

---

### CP_LEAD_003 — Direct URL access to `/leads` works when logged in

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP session active |
| **Type** | UI |
| **Test Steps** | 1. Open `https://uat.xrportal.in/leads` directly in a new tab |
| **Expected Result** | Leads page loads without redirect to login |
| **Priority** | High |

---

### CP_LEAD_004 — Logged-out user cannot access `/leads`

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | No active session |
| **Type** | BIZ |
| **Test Steps** | 1. Navigate to `/leads` in a private window |
| **Expected Result** | User is redirected to `/login` |
| **Priority** | Critical |

---

## Lead List Table

### CP_LEAD_005 — Verify table columns are present

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads list has at least one row |
| **Type** | UI |
| **Test Steps** | 1. Open Leads page<br>2. Read column headers from left to right |
| **Expected Result** | Columns shown: Lead Name, Contact Details, Lead Source, Status / Stage, Last Activity |
| **Priority** | Critical |

---

### CP_LEAD_006 — Verify Lead Name column displays correct data

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | At least one assigned lead exists |
| **Type** | UI |
| **Test Steps** | 1. Identify a lead row<br>2. Read the Lead Name cell |
| **Expected Result** | Lead Name shows prospect's full name as synced from LeadSquared |
| **Priority** | High |

---

### CP_LEAD_007 — Verify Contact Details column shows phone and email

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Type** | UI |
| **Test Steps** | 1. Read Contact Details cell for a lead |
| **Expected Result** | Both phone and email are visible; phone appears in a clickable/formatted style |
| **Priority** | High |

---

### CP_LEAD_008 — Verify Lead Source column shows source labels

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Type** | UI |
| **Test Steps** | 1. Read the Lead Source value for each row |
| **Expected Result** | Source shows values like "Website", "Walk-in", "Referral", etc. matching LSQ |
| **Priority** | Medium |

---

### CP_LEAD_009 — Verify Status / Stage column shows pipeline stage

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Type** | UI |
| **Test Steps** | 1. Read Status / Stage value |
| **Expected Result** | Stage value reflects the current LSQ pipeline stage (e.g., New, Contacted, Qualified) |
| **Priority** | High |

---

### CP_LEAD_010 — Verify Last Activity column shows latest interaction

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Type** | UI |
| **Test Steps** | 1. Read Last Activity cell for a row |
| **Expected Result** | Last Activity shows a date or activity descriptor (e.g., "Called — 2 days ago") |
| **Priority** | Medium |

---

### CP_LEAD_011 — Verify empty state when no leads are assigned

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP has zero assigned leads in LSQ |
| **Type** | UI |
| **Test Steps** | 1. Open Leads page |
| **Expected Result** | Friendly empty-state message is displayed (e.g., "No leads assigned yet"); table headers may still be present |
| **Priority** | Medium |

---

### CP_LEAD_012 — Lead isolation — CP sees only their own leads

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Multiple CPs exist with different lead assignments in LSQ |
| **Type** | BIZ |
| **Test Steps** | 1. Login as CP A<br>2. Note visible leads<br>3. Logout, login as CP B<br>4. Compare lead lists |
| **Expected Result** | Each CP sees only their own assigned leads; no cross-visibility |
| **Priority** | Critical |

---

## Search and Filters

### CP_LEAD_013 — Search leads by name

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search input visible; at least 2 leads exist |
| **Type** | FUNC |
| **Test Steps** | 1. Type a known lead's first name into the search box<br>2. Wait for results to filter |
| **Expected Result** | Only leads whose name matches the query are listed |
| **Priority** | High |

---

### CP_LEAD_014 — Search leads by phone number

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search input visible |
| **Type** | FUNC |
| **Test Steps** | 1. Enter a partial or full phone number known to exist<br>2. Observe filtered results |
| **Expected Result** | Matching leads are shown; non-matching rows are hidden |
| **Priority** | High |

---

### CP_LEAD_015 — Search with no matches shows empty result message

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search input visible |
| **Type** | NEG |
| **Test Steps** | 1. Enter a string that does not match any lead (e.g., `zzzzz_no_match`)<br>2. Observe table |
| **Expected Result** | Empty-state message displayed (e.g., "No results found"); table body is empty |
| **Priority** | Medium |

---

### CP_LEAD_016 — Clear search restores full lead list

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search query previously applied |
| **Type** | FUNC |
| **Test Steps** | 1. Clear the search input<br>2. Press Enter or click clear (X) icon |
| **Expected Result** | Full list of leads is restored |
| **Priority** | Medium |

---

### CP_LEAD_017 — Filter leads by Status / Stage

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Filter UI exists for stage |
| **Type** | FUNC |
| **Test Steps** | 1. Open Status filter dropdown<br>2. Select a specific stage (e.g., "Qualified")<br>3. Apply filter |
| **Expected Result** | Only leads with the selected stage are shown |
| **Priority** | High |

---

### CP_LEAD_018 — Filter leads by Lead Source

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Source filter UI exists |
| **Type** | FUNC |
| **Test Steps** | 1. Open Lead Source filter<br>2. Select a value (e.g., "Website") |
| **Expected Result** | Only leads from the selected source are listed |
| **Priority** | Medium |

---

## Lead Detail and Conversion

### CP_LEAD_019 — Click lead row opens lead detail view

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads list has rows |
| **Type** | UI |
| **Test Steps** | 1. Click on a lead's row or the lead name |
| **Expected Result** | Lead detail panel/drawer opens showing full contact info, activity history, and stage |
| **Priority** | High |

---

### CP_LEAD_020 — Verify Convert to Registration option is visible

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead detail or row action menu is visible |
| **Type** | UI |
| **Test Steps** | 1. Locate the Convert / Register option on a qualifying lead |
| **Expected Result** | Convert action is shown (button or menu item) labelled clearly (e.g., "Convert to Registration") |
| **Priority** | Critical |

---

### CP_LEAD_021 — Convert lead → Registration form opens pre-filled

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | A lead is visible with valid name, mobile, and email |
| **Type** | FUNC |
| **Test Steps** | 1. Click Convert on the lead<br>2. Wait for the registration form to render |
| **Expected Result** | Customer Registration form opens with First Name, Last Name, Mobile, Email pre-populated from the lead |
| **Priority** | Critical |

---

### CP_LEAD_022 — Successful conversion creates Registration linked to CP

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Conversion form is open; remaining required fields can be completed |
| **Type** | FUNC |
| **Test Steps** | 1. Complete required fields (Purchase Purpose, Budget, Home Loan Intent, T&C)<br>2. Submit |
| **Expected Result** | New Registration is created with `brokerId` = CP user ID; success toast displayed; customer appears on Dashboard |
| **Priority** | Critical |

---

### CP_LEAD_023 — Cancel during conversion does not create registration

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Conversion form is open with pre-filled data |
| **Type** | FUNC |
| **Test Steps** | 1. Click Cancel / close icon without submitting |
| **Expected Result** | Form closes; no Registration record is created; user returns to Leads page |
| **Priority** | High |

---

## Sync and Refresh

### CP_LEAD_024 — Refresh button re-fetches leads from LSQ

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Refresh/reload control exists |
| **Type** | INT |
| **Test Steps** | 1. Click the Refresh button<br>2. Observe network/loading indicator |
| **Expected Result** | Lead list reloads from backend; new leads added in LSQ become visible after sync |
| **Priority** | Medium |

---

### CP_LEAD_025 — Pagination controls work when list exceeds page size

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP has > 10 leads in `registration_drafts` table |
| **Type** | API |
| **Test Steps** | 1. `GET /api/v1/cp/cp-user-leads?page=2&limit=10`<br>2. Verify next set of leads |
| **Expected Result** | Returns leads with offset; pagination max limit = 100 (validations/cp.validations.js:194-195). |
| **Priority** | Medium |

---

### CP_LEAD_041 — Refresh shows loading indicator while fetching from DB

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads page open with existing rows |
| **Type** | INT |
| **Test Steps** | 1. Click the Refresh control<br>2. Observe UI state immediately after click |
| **Expected Result** | Loading spinner / skeleton state shown over the table; existing rows hidden or dimmed; `GET /api/v1/cp/cp-user-leads` fired against `registration_drafts` (NOT LSQ); spinner clears on response. |
| **Priority** | Medium |

---

### CP_LEAD_042 — Refresh after new lead capture surfaces the new row

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP has leads list open; in a second tab, CP captures a new lead via `POST /cp-user-register` |
| **Type** | INT |
| **Test Steps** | 1. Return to leads tab<br>2. Click Refresh |
| **Expected Result** | New `registration_drafts` row (status=`Open`) appears at the top of the list with UI label `Sent` (BR-CP-LEAD-13). |
| **Priority** | High |

---

### CP_LEAD_043 — Refresh while applied filter persists the filter

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Status filter `Registered` currently applied |
| **Type** | INT |
| **Test Steps** | 1. Click Refresh<br>2. Observe table contents after reload |
| **Expected Result** | Refetch includes `?status=Registered` query parameter; filter state and dropdown selection preserved; only `Registered` rows displayed (BR-CP-LEAD-13, cp.validations.js:197). |
| **Priority** | Medium |

---

### CP_LEAD_044 — Backend error during refresh surfaces inline error

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Network failure or backend 500 mocked |
| **Type** | NEG |
| **Test Steps** | 1. Click Refresh<br>2. Observe response handling |
| **Expected Result** | Error toast / inline message displayed (e.g., "Failed to load leads. Try again."); previously rendered rows remain in place; no partial overwrite of the list. |
| **Priority** | High |

---

### CP_LEAD_045 — Refunded → Open silent flip is visible after refresh

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead L is `status=Refunded`; CP triggers `GET /cp/send-registration-link/<L.slug>` in another tab |
| **Type** | INT |
| **Test Steps** | 1. Return to leads tab<br>2. Click Refresh |
| **Expected Result** | L now appears under `Sent` (DB `status=Open`) with NO audit indicator/banner (BR-CP-LEAD-20, GAP-LEAD-02). KPI `Sent` count incremented. Document the silent state mutation in QA notes. |
| **Priority** | High |

---

### CP_LEAD_046 — Master CP refresh fetches sub-CP leads in one call

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Master CP M (`isLeadCp=true`) with two member CPs each holding leads |
| **Type** | BIZ |
| **Test Steps** | 1. Login as M<br>2. Click Refresh<br>3. Inspect network call |
| **Expected Result** | Single `GET /cp/cp-user-leads` returns aggregated leads where owning CP's `masterHvCode = M.hvCode` (BR-CP-LEAD-10/11). Each row shows `leadOwner` indicator. No N+1 calls per sub-CP. |
| **Priority** | High |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/cp-portal/fsd-leads-management.md`

### MAJOR CORRECTIONS — most existing TCs assume LSQ-based lead sync, but actual implementation is different
- **No LSQ lead sync** — Leads are stored in `registration_drafts` table (NOT LeadSquared). CP creates a lead via `POST /api/v1/cp/cp-user-register`; this auto-creates a Buyer `users` row with `roleId=2` if phone is new, then creates a `registration_drafts` row with `status='Open'`. The lead-capture flow itself does NOT call LSQ. LSQ is only called when the Buyer follows the shared link and triggers `/auth/user/send-otp`.
- **Refresh button** (CP_LEAD_024) — There is NO LSQ sync. The list endpoint reads directly from `registration_drafts` table. Refresh just refetches DB.
- **Lead Source / Stage columns** (CP_LEAD_008-010) — These columns come from `draft.sourceType` JSON field (free-text, not validated — GAP-LEAD-12). "Stage" does not exist; only `status` ENUM `Open/Won/Lost/Refunded` mapped to UI labels `Sent/Registered/Refunded` (BR-CP-LEAD-13).
- **Status filter** (CP_LEAD_017) — Filter accepts ONLY `Sent` | `Registered` | `Refunded` (validations/cp.validations.js:197). UI label `Sent` covers DB `Open` OR `Lost` (BR-CP-LEAD-13).
- **CP_LEAD_012 (Lead isolation)** — Standalone/member CP sees only `cpId=self.id`. Master CP (`isLeadCp=true`) sees ALL leads where owning CP's `masterHvCode = self.hvCode`. Master can use `?leadOwner=cp:<id>` to scope (BR-CP-LEAD-10/11).
- **CP_LEAD_021 (Convert to Registration)** — There is NO "Convert" action on a lead row. The Buyer self-registers via the shared link `${registrationUrl}/ref/${encryptedSlug}` (BR-CP-LEAD-07). The Convert-to-Registration TC is testing non-existent UI.
- **CP_LEAD_022** — Registration created via the link captures `brokerXrCode` (CP's hvCode) on the Buyer row. KPI "Registered" counts via `Registration.brokerId` (BR-CP-LEAD-22). Watch for the `brokerXrCode` vs `walk_in_source_xr_code` drift (GAP-LEAD-11).
- **Notifications** — On capture success, WhatsApp `cp_link_share_latest` (Botspice) with `[fullName, registrationLink]` to Buyer (BR-CP-LEAD-09). NRI Buyer with email also gets `nri-cp-referral` email. NO email/SMS to admin, SM, or master CP.

### New TCs added below

### CP_LEAD_026 — Lead capture creates registration_drafts row with status=Open

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP logged in; new Buyer phone P |
| **Type** | FUNC |
| **Test Steps** | 1. `POST /api/v1/cp/cp-user-register` body `{ firstName, lastName, phone:P, email, ... }`<br>2. Query `registration_drafts` |
| **Expected Result** | 201 `{ registrationNumber: <encryptedSlug> }`. DB row: `cpId=req.user.id, projectId=<env>, status='Open', userId=<new Buyer.id>` (cp.controller.js:881-891). Buyer also auto-created in `users` with `roleId=2`. |
| **Priority** | Critical |

---

### CP_LEAD_027 — Same CP duplicate lead for same Buyer+project returns 409

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP A has existing draft for Buyer B on project X |
| **Type** | NEG |
| **Test Steps** | 1. CP A submits another `cp-user-register` for Buyer B |
| **Expected Result** | 409 "Lead for this User is already Captured." (BR-CP-LEAD-03). |
| **Priority** | High |

---

### CP_LEAD_028 — Different CPs CAN capture same Buyer on same project (BUG/design)

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP A captured Buyer B |
| **Type** | NEG |
| **Test Steps** | 1. Login as CP C<br>2. Submit cp-user-register for Buyer B |
| **Expected Result** | 201 succeeds — check is `{userId, cpId, projectId}` so different cpId is allowed (GAP-LEAD-04). Two CPs now own leads for same Buyer. Document for sales-ops. |
| **Priority** | Medium |

---

### CP_LEAD_029 — Buyer already has paid registration: capture blocked

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Buyer B has `registrations` row with `paymentStatus='success'` for project X |
| **Type** | NEG |
| **Test Steps** | 1. CP captures Buyer B on project X |
| **Expected Result** | 409 "User has already completed registration." (BR-CP-LEAD-04, cp.controller.js:809-818) |
| **Priority** | High |

---

### CP_LEAD_030 — send-registration-link has NO ownership check (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP A captured a lead → has slug S. CP B logged in. |
| **Type** | NEG |
| **Test Steps** | 1. CP B calls `GET /api/v1/cp/send-registration-link/<S>` |
| **Expected Result** | KNOWN BUG: CP B's call succeeds — WhatsApp `cp_link_share_latest` resent to Buyer. If lead was `Refunded`, silently flipped back to `Open` with no audit (GAP-LEAD-01, GAP-LEAD-02, cp.controller.js:1540-1607). Document security gap. |
| **Priority** | High (Security) |

---

### CP_LEAD_031 — Refunded → Open mutation on resend (no audit)

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead L with `status='Refunded'` |
| **Type** | NEG |
| **Test Steps** | 1. `GET /cp/send-registration-link/<L.slug>`<br>2. Query L.status |
| **Expected Result** | L.status flipped to `Open` silently (BR-CP-LEAD-20, cp.controller.js:1593-1596). KPI "Sent" includes this lead next refresh. No audit log entry. |
| **Priority** | High |

---

### CP_LEAD_032 — Master CP leadOwner=cp:<unrelated id> returns 403

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Master CP M; unrelated CP X (X not in M's masterHvCode tree) |
| **Type** | BIZ |
| **Test Steps** | 1. M calls `GET /cp/cp-user-leads?leadOwner=cp:<X.id>` |
| **Expected Result** | 403 "Access denied to requested CP leads" (BR-CP-LEAD-11) |
| **Priority** | High (Security) |

---

### CP_LEAD_033 — Member CP cannot use leadOwner filter for peers

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Member CP (isLeadCp=false, leadCpId=<master>); peer CP Y in same tree |
| **Type** | BIZ |
| **Test Steps** | 1. Member calls `?leadOwner=cp:<Y.id>` |
| **Expected Result** | Filter silently ignored for non-master; returns only member's own leads (BR-CP-LEAD-10/11). |
| **Priority** | High (Security) |

---

### CP_LEAD_034 — Search by name uses JSON_EXTRACT on draft JSON

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead with firstName "John" |
| **Type** | FUNC |
| **Test Steps** | 1. `GET /cp/cp-user-leads?search=John` |
| **Expected Result** | Match found via `JSON_UNQUOTE(JSON_EXTRACT(draft,'$.firstName/$.lastName/$.phone'))` (BR-CP-LEAD-12). Search by phone supported too. |
| **Priority** | Medium |

---

### CP_LEAD_035 — Search wildcard injection — `%` returns all (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP with multiple leads |
| **Type** | NEG |
| **Test Steps** | 1. `GET /cp/cp-user-leads?search=%25` (URL-encoded `%`) |
| **Expected Result** | KNOWN BUG: returns ALL leads — search uses unescaped `LIKE %${search}%` (GAP-LEAD-05). Low security impact. |
| **Priority** | Low |

---

### CP_LEAD_036 — Lead creation triggers WhatsApp cp_link_share_latest via Botspice

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Valid capture |
| **Type** | INT |
| **Test Steps** | 1. `POST /cp-user-register`<br>2. Inspect Botspice WhatsApp logs |
| **Expected Result** | Template `cp_link_share_latest` (variables `[fullName, registrationLink]`) dispatched via Botspice (NOT Kaleyra) to `${countryCode}${phone}` (cp.controller.js:921-926). |
| **Priority** | High |

---

### CP_LEAD_037 — NRI Buyer with email triggers nri-cp-referral email

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Capture with `nri:true, email:'a@b.com', countryCode:'+971'` |
| **Type** | INT |
| **Test Steps** | 1. Submit capture<br>2. Inspect outbound email |
| **Expected Result** | EJS template `nri-cp-referral`, subject "Registration link for Payment", data `{ name, registrationLink }` sent to email (cp.controller.js:907-919). |
| **Priority** | Medium |

---

### CP_LEAD_038 — WhatsApp failure does NOT roll back lead capture

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Mock WhatsApp service to return 500 |
| **Type** | INT |
| **Test Steps** | 1. `POST /cp-user-register`<br>2. Query `registration_drafts` |
| **Expected Result** | 201 returned to CP; draft persisted; Buyer never receives link. Lead counted in `Sent` KPI (QA-Risk-8, fire-and-forget). |
| **Priority** | Medium |

---

### CP_LEAD_039 — No notification to mapped SM on lead creation (gap)

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP has `smUserId` mapping to SM Y |
| **Type** | INT |
| **Test Steps** | 1. CP captures lead<br>2. Check SM Y's notifications / inbox |
| **Expected Result** | No notification to SM (GAP-LEAD-03). Leads invisible to SM until Buyer self-registers via link. Document missing feature. |
| **Priority** | Medium |

---

### CP_LEAD_040 — KPI counts: Sent=count(Open+Lost), Registered=count(Registration where paymentStatus=success)

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP with mixed drafts and converted registrations |
| **Type** | API |
| **Test Steps** | 1. `GET /api/v1/cp/cp-user-kpi`<br>2. Compare to expected counts |
| **Expected Result** | `Sent = RegistrationDraft.count(status IN ['Open','Lost'])`, `Registered = Registration.count(brokerId in allowed AND paymentStatus='success')`, `unitRegisteredCount = RegistrationUnit not in [WINNER,REFUND]`, `allotedCount = RegistrationUnit WINNER`, `refundedCount = RegistrationUnit REFUND` (cp.controller.js:1418-1517). |
| **Priority** | High |
