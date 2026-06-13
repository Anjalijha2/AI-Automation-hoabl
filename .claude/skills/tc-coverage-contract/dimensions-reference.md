# Coverage Dimensions — Reference with XR Portal Examples

Worked examples of each of the 11 mandatory dimensions (§1 of SKILL.md), using real
XR Portal modules. Use these as the bar for "have I covered this dimension?".

### 1. Positive / happy path
The primary success flow end-to-end.
- *Customers*: open page → KPI cards + table load.
- *Cancel Unit*: open Booked row → tick both attestations → submit → unit released, toast shown.

### 2. Full-form coverage
Every field/dropdown/toggle/button in each modal/form gets at least one case.
- *Update Parking modal*: Count field, Amount field, ON/OFF toggle, Total preview, Update button — each exercised.
- Enumerate fields FROM THE SCREENSHOT. A field on screen with no case = gap.

### 3. Mandatory-field & validation
Each required field empty → blocked. Numeric fields at 0, negative, decimal, real min/max.
- *Parking Count*: tested at 0, negative, decimal, and the real 1–500 boundary (use the spec's pool number, not a guess).

### 4. Re-check / race conditions at submit
Where the server re-validates at submit time.
- *Unit Swap*: target unit "no longer available" at submit → rejected with message.
- *Assign Unit*: "already booked" at submit.

### 5. Negative / error handling
Server 500, network failure, empty / no-data state, every documented error string.
- *Search by phone, no match*: "0 Registration Records" + "No data" empty state.
- Each error-message string from the spec gets its own assertion.

### 6. Context-sensitive controls
A control that behaves differently by row state → a case per state + a routing case.
- *Trash icon*: on Booked row → "Cancel Unit" window; on Registered/Waitlisted → "Cancel Registration" popup. Plus a routing case proving the icon picks the right one per status.

### 7. Notifications
Assert "no SMS / WhatsApp / email is sent" wherever the source says the action is silent.
- *Cancel Unit / Update Parking / Offline Milestone Payment*: spec says silent → explicit "no buyer notification dispatched" assertion. Silence-by-design is a REQUIRED case.

### 8. UI-vs-backend validation split
If backend is more permissive than the UI form, add an API-layer case proving the bypass.
- *Parking Count*: UI caps at 500; API may accept higher → API case proving/【VERIFY WITH DEV】the bypass.

### 9. Role / auth / security
Unauthenticated access, invalid/expired token (401/403), logout-token-validity, multi-tenant isolation.
- *Customers*: hit `/admin/customers` with no session → redirect to login.
- Tampered JWT → behaviour (flag `[VERIFY WITH DEV]` if not in spec).

### 10. Integration / cross-module
Every downstream sync named in the spec gets a verification case.
- *Active Towers KPI* equals Config tower toggles ON (cross-module).
- *Assign Unit* dispatches WhatsApp + SMS (per FSD) — integration assertion.

### 11. Boundary
Pagination edges, last partial page, file-upload type/size, max page size.
- *Pagination*: "1-10 of N", change page size to 50, navigate to last partial page.
- *Download*: exported file column count, filtered vs unfiltered row count.

---

## Quick self-check per feature

Before moving on from a feature, confirm you can point to a case ID for each row:

```
[ ] Positive happy path
[ ] Every field/control on every form/modal
[ ] Every required field empty → blocked
[ ] Numeric boundaries (0 / negative / decimal / real min-max)
[ ] Submit-time re-validation / race
[ ] 500 / network / empty-state / each error string
[ ] Each row-state variant + routing
[ ] Silent-notification assertions
[ ] API-layer bypass where backend > UI
[ ] 401/403 / token / data-isolation
[ ] Each named downstream integration
[ ] Pagination / upload / page-size boundaries
```

Any unchecked box with no justified `N/A` = module not done.
