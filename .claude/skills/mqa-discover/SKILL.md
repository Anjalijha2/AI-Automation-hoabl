---
name: mqa-discover
description: Manual QA Agent skill domains — UI discovery, selector extraction, 12-dimension screen documentation, test case design across all 15 testing types, and defect root cause analysis for XR Portal. Use when a module needs discovery, screen docs, test cases, or bug logging.
allowed-tools: Read, Write, Glob, Grep
---

# Manual QA Agent — Skills

## Skill Set Overview
The Manual QA Agent operates across 5 skill domains: Discovery Engineering, Documentation, Test Design (15 types), Defect Analysis, and Domain-Aware Thinking. Every task activates all relevant domains simultaneously.

---

## Skill Domain 1 — Discovery Engineering

### Live DOM Traversal
Navigate the application with Playwright (headless Chromium) and extract the real structure.
- Launch browser, authenticate using saved session (`src/fixtures/.auth/admin.json`)
- Navigate to every page and sub-page of the assigned module
- Identify all interactive elements: inputs, buttons, dropdowns, toggles, tables, modals, drawers

### Selector Extraction (Priority Order — Never Skip Steps)
1. `#id` — most stable, use if available
2. `[data-testid="..."]` — explicitly set for testing, highly preferred
3. `[aria-label="..."]` — accessibility attribute, stable
4. Specific CSS class + element combo — use only when above are unavailable
5. Text-based selectors (`:text("...")`) — last resort, fragile, document the reason

### Screenshot Capture
- Full-page screenshot of every screen state
- Capture: default state, empty state, filled state, error state, success state
- Save to: `discovery/reports/screenshots/<module>/<screen>-<state>.png`
- Reference in vault screen doc: `![[screenshots/<module>/<screen>.png]]`

### Portal Structure Mapping
- Map: module → sub-modules → screens → screen states
- Document navigation paths between screens
- Identify screens that appear conditionally (role-based, status-based)
- Output: `discovery/reports/portal-map.json`

---

## Skill Domain 2 — Screen Documentation (12 Dimensions)

Apply all 12 dimensions to every screen. Incomplete screen docs block Phase 3.

### Dimension 1 — Business Purpose
Not "this page shows a list." Instead: "This screen allows admins to manage unit allocation to registered customers, enforcing inventory availability rules and initiating the hold period."

### Dimension 2 — Screenshot Reference
Link to captured screenshot. Note which state is shown.

### Dimension 3 — Field-Level Logic
For every field: label, type, required/optional, validation rule, business rule, error message on violation.

### Dimension 4 — Workflows Supported
Each workflow: name, precondition, step-by-step flow, post-condition, screens touched.

### Dimension 5 — Role & Access Behavior
Per role: can view / can create / can edit / can delete / special restrictions. Apply domain knowledge of XR Portal role hierarchy.

### Dimension 6 — API Mappings
Per action on screen: endpoint, HTTP method, key request fields, success response structure, error cases (401, 400, 422, 500). Mark unverified behaviors explicitly: `[UNVERIFIED]`.

### Dimension 7 — DB Understanding
UI field → DB table → DB column → data type → nullable. Verify, never assume. Mark uncertain mappings: `[UNVERIFIED]`.

### Dimension 8 — Integration Points
What other systems/modules does this screen trigger? CRM, SMS, Payment Gateway, Document Management. When does the trigger fire? What does it send?

### Dimension 9 — Validation Rules
Every validation: field, rule type, rule detail, error message text, when message appears (on blur / on submit).

### Dimension 10 — Edge Cases & Known Behaviors
Conditional displays, empty states, zero-inventory scenarios, concurrent edit behavior, session expiry behavior. Mark status: Confirmed / [UNVERIFIED].

### Dimension 11 — Navigation Flow
Obsidian-linked diagram: `[[Previous Screen]] → This Screen → [[Next Screen on Action A]]`

### Dimension 12 — Exploratory Testing Observations
Real-world findings from exploration. Link to full `007-Test-Observations/` entry.

---

## Skill Domain 3 — Test Design (All 15 Types)

### Type 1 — UI/UX Testing (Code: UI)
- Element visibility, alignment, text readability
- Button states: enabled/disabled/loading at correct moments
- Error message placement and clarity
- Loading indicators, skeleton screens, content shifts
- Navigation redirect accuracy after actions
- Empty state messaging
- Accessibility basics: tabindex order, aria-labels, keyboard navigation

### Type 2 — Functional Testing (Code: FUNC)
- Every feature works per BRD specification
- Form submissions create/update/delete correct data
- Filters, sorts, searches return accurate results
- Modals and drawers open/close with correct context
- Toggles, dropdowns, date pickers behave consistently

### Type 3 — Validation Testing (Code: VAL)
- Required field enforcement: on blur and on submit
- Data type rules: numeric, alphanumeric, date format
- Length limits: min chars, max chars, range values
- Format rules: mobile 10 digits, email format, PIN 6 digits
- Custom business validation: unit price > 0, parking ≤ unit count
- Error message text accuracy and timing (appears/disappears correctly)

### Type 4 — End-to-End Testing (Code: E2E)
- Full user journeys crossing multiple screens
- Booking flow: customer → unit → allocation → confirmation
- Registration flow: creation → documents → approval
- Payment flow: booking → milestone → demand letter → receipt
- Cancellation flow: request → approval → unit release → refund trigger
- Validate system state at every checkpoint in the journey

### Type 5 — API Testing (Code: API)
- Correct HTTP method per operation (GET/POST/PUT/PATCH/DELETE)
- Request payload: all required fields present, correct data types
- Response schema: field names, data types, structure matches contract
- Status codes: 200 success, 201 created, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 422 validation, 500 server error
- Auth enforcement: every protected endpoint rejects requests without valid token
- Response vs UI alignment: does API data match what screen displays?
- Pagination, filtering, sorting at API level

### Type 6 — Database Testing (Code: DB)
- Create via UI → verify record exists in DB with correct values
- Update via UI → verify DB record reflects exact change
- Delete via UI → verify record removed or soft-deleted correctly
- DB field mapping: does `unit_status = 2` display as "Blocked" on screen?
- NULL handling: what happens when optional fields are empty?
- Foreign key integrity: can allocation exist without valid customer_id?
- Timestamps: created_at, updated_at populate on correct events
- Data consistency: allocation table and unit table stay in sync

### Type 7 — Integration Testing (Code: INT)
- Allocation created → unit status flips to Booked in unit list
- Customer deleted → pending allocations cancelled
- Config price changed → new allocations use new price
- CRM integration: customer data syncs correctly on registration
- SMS gateway: OTP delivered on mobile trigger
- Payment gateway: confirmation updates booking status
- Document management: uploaded docs link to correct customer/unit

### Type 8 — Business Flow Testing (Code: BIZ)
- Apply real estate domain knowledge to test the full business process
- Booking lifecycle: lead → preference → booking → agreement → payment → possession
- Cancellation: request → approval → unit release → refund → status normalization
- Registration: lead → documents → KYC → approval → customer conversion
- Enforce sequence: can steps be skipped? Can step 3 happen before step 2?
- Validate business rules at each transition point

### Type 9 — Regression Testing (Code: REG)
- Re-test fixed bugs: run the exact reproduction steps, verify fix holds
- Test adjacent features sharing data or state with the fixed area
- After new feature deployment: run impacted module's full TC set
- Tag TCs as `[REGRESSION]` when added after bug fix
- Run P0 + P1 regression set on every deployment

### Type 10 — Exploratory Testing (Code: EXP)
- Unusual sequences: allocate → immediately cancel → reallocate same unit
- Concurrent actions: two admins editing same record simultaneously
- Boundary-breaking: max length strings, zero values, future dates in past fields
- Role-based edge cases: what can a restricted admin actually do?
- State-dependent access: access step 3 of a flow before step 2
- Document findings in `007-Test-Observations/<Module>-Exploratory.md`

### Type 11 — Negative Testing (Code: NEG)
- Invalid credentials: should not log in
- Unauthorized API calls: should return 401/403
- Booking already-allocated unit: should be blocked with clear error
- Negative price input: should be rejected with validation
- Empty mandatory form submission: should show field-level errors
- Accessing admin routes without session: should redirect to login
- Cancellation after possession: should be blocked by business rule

### Type 12 — Edge Case Testing (Code: EDGE)
- First record in system (empty state)
- Last available unit in a tower
- Customer at maximum allocation count
- Unit price at minimum (₹1) and maximum allowed values
- Date at exact boundary (last day of booking window)
- Zero-inventory scenario (all units allocated or blocked)
- All optional fields empty
- All optional fields at maximum allowed length

### Type 13 — Cross-Module Impact Testing (Code: XMOD)
- Config price change → test Allocation screens show new price
- Customer status change → test Customer Portal access
- Tower structure change → test Unit list count and display
- Sales manager assignment change → test booking visibility
- Channel partner deactivation → test existing bookings under that partner
- Registration status change → test available customer actions

### Type 14 — Data Consistency Verification (Code: DC)
- UI shows "Allocated" → API returns `status: "allocated"` → DB has `unit_status = 5`
- Dashboard count matches actual DB record count
- Financial totals on reports match sum of individual transaction records
- Timestamps displayed in UI match DB `created_at` (accounting for timezone)
- Customer count in summary widget matches customer table row count

### Type 15 — Workflow & Dependency Validation (Code: WF)
- Unit cannot be allocated without registered customer: enforce dependency
- Agreement cannot be generated without completed allocation
- Payment milestone cannot trigger without signed agreement
- Possession cannot initiate without full payment clearance
- Document upload available only after registration approval
- CRM update triggers only after specific status transitions

---

## Skill Domain 4 — Defect Analysis

### Root Cause Identification
Identify the exact layer where the defect originates:
- **UI** — display issue, wrong state shown, broken layout
- **API** — wrong status code, incorrect response schema, missing field
- **DB** — incorrect persistence, wrong field mapping, integrity violation
- **Integration** — cross-module trigger failed, external system not notified
- **Business Logic** — rule not enforced, wrong sequence allowed, incorrect calculation

### Severity Classification
- **Critical** — app crash, data loss, auth broken, release blocker
- **High** — core feature broken, significant UX impact, data integrity risk
- **Medium** — feature partially broken, workaround exists
- **Low** — cosmetic, minor UX issue, isolated edge case

### Deduplication
Before logging any bug:
- Search BUG_TRACKER.md for same TC_ID
- Same TC_ID + Open status — do NOT create duplicate; add note with new occurrence
- Same TC_ID + Closed status — create new entry (regression)

### Cross-Module Impact Assessment
For every bug: ask "does this failure affect other modules?"
Document impact in bug entry. Alert BA Agent if impact is cross-module.

---

## Skill Domain 5 — Domain-Aware QA Thinking

Apply real estate domain knowledge during every phase:
- During discovery: recognize domain-specific UI patterns (unit grids, allocation flows, milestone tables)
- During screen docs: understand why fields exist from a business perspective
- During TC design: design TCs that test real business rules, not just UI behaviors
- During defect tracking: assess business impact of bugs, not just technical severity
- During exploratory testing: think like a sales manager, channel partner, or accounts team member
