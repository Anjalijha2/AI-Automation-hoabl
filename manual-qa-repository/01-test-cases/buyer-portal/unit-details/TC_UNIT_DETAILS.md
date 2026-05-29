# Test Cases — Unit Details
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Unit-Details.md

---

## Unit Details — Access & Navigation

### BYR_UNIT_001 — Unit Details accessible only after WINNER status

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer logged in |
| **Type** | BIZ |
| **Test Steps** | 1. Try opening `/allotted-units` while not WINNER<br>2. Then assign WINNER and retry |
| **Expected Result** | Non-WINNER: blocked / redirected to dashboard. WINNER: page loads. |
| **Priority** | Critical |

---

### BYR_UNIT_002 — "My Unit" nav item visible post-allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER status |
| **Type** | UI |
| **Test Steps** | 1. Inspect main nav |
| **Expected Result** | My Unit / Allotted Unit menu item visible and clickable |
| **Priority** | High |

---

### BYR_UNIT_003 — Click My Unit navigates to /allotted-units

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER status |
| **Type** | FUNC |
| **Test Steps** | 1. Click My Unit from nav |
| **Expected Result** | URL = `/allotted-units`; page renders unit information |
| **Priority** | Critical |

---

### BYR_UNIT_038 — Page shows loading skeleton while unit data fetching

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER buyer; network throttled to slow 3G |
| **Type** | UI |
| **Test Steps** | 1. Click My Unit<br>2. Observe page during fetch |
| **Expected Result** | Skeleton/spinner placeholder rendered until `/allocation/unit-details` response arrives; no broken layout |
| **Priority** | Medium |

---

### BYR_UNIT_039 — Logged-out access to /allotted-units redirects to login

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | No active session |
| **Type** | BIZ |
| **Test Steps** | 1. Open `https://uat.xrportal.in/allotted-units` directly |
| **Expected Result** | Redirected to login page; route guard enforced client-side |
| **Priority** | High |

---

### BYR_UNIT_040 — Breadcrumb / Back returns to dashboard

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit Details page open |
| **Type** | FUNC |
| **Test Steps** | 1. Click breadcrumb Home / Back |
| **Expected Result** | Navigates to `/home` dashboard; unit page unmounts |
| **Priority** | Low |

---

### BYR_UNIT_041 — Multiple registrations: only allotted unit shown for current registration

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer has 2 registrations; one with WINNER unit, one Available |
| **Type** | BIZ |
| **Test Steps** | 1. Open Unit Details |
| **Expected Result** | Only WINNER unit rendered; Available registration not displayed in this view |
| **Priority** | High |

---

### BYR_UNIT_042 — Refresh on /allotted-units reloads page state

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit Details page open |
| **Type** | FUNC |
| **Test Steps** | 1. Press F5 / browser refresh |
| **Expected Result** | Page reloads, unit details re-fetched; no redirect to dashboard or login (session valid) |
| **Priority** | Medium |

---

## Unit Details — Unit Details Section

### BYR_UNIT_004 — Unit number rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect Unit Details card |
| **Expected Result** | Unit number visible (e.g., "3502") matching allocation |
| **Priority** | Critical |

---

### BYR_UNIT_005 — Floor and Tower name shown

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect Floor and Tower fields |
| **Expected Result** | Floor number (e.g., "35") and Tower name (e.g., "Crest") rendered |
| **Priority** | High |

---

### BYR_UNIT_006 — Apartment configuration rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect BHK/typology field |
| **Expected Result** | Configuration shown (e.g., "1 Bed Growth Home") |
| **Priority** | High |

---

### BYR_UNIT_007 — Carpet and saleable area rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect Carpet Area and Saleable Area fields |
| **Expected Result** | Both areas shown in sq.ft. (e.g., "323 sq.ft.") |
| **Priority** | High |

---

### BYR_UNIT_008 — Facing direction rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect Facing field |
| **Expected Result** | Facing direction shown (East/West/North/South) |
| **Priority** | Medium |

---

### BYR_UNIT_009 — Floor plan image loads

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect floor plan image element |
| **Expected Result** | Image fetched and rendered without 404; alt text present |
| **Priority** | High |

---

## Unit Details — Cost Sheet

### BYR_UNIT_010 — Cost Sheet section visible

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Scroll to Cost Sheet |
| **Expected Result** | Itemised cost sheet section renders |
| **Priority** | Critical |

---

### BYR_UNIT_011 — Basic price line rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Type** | UI |
| **Test Steps** | 1. Inspect Basic Price row |
| **Expected Result** | Label "Basic Price" with numeric ₹ value > 0 |
| **Priority** | Critical |

---

### BYR_UNIT_012 — Floor rise / Premium / Infra / Society / Clubhouse / Possession lines rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Type** | UI |
| **Test Steps** | 1. Verify each line item is present |
| **Expected Result** | All 6 charge lines render with their labels and amounts (or 0 if not applicable) |
| **Priority** | High |

---

### BYR_UNIT_013 — GST line shown separately

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Type** | UI |
| **Test Steps** | 1. Locate GST row |
| **Expected Result** | GST amount displayed separately from principal |
| **Priority** | High |

---

### BYR_UNIT_014 — Parking charge rendered if applicable

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer's unit has parking charge |
| **Type** | UI |
| **Test Steps** | 1. Locate Parking row |
| **Expected Result** | Parking amount shown; if zero, row shows 0 or is hidden by config |
| **Priority** | Medium |

---

### BYR_UNIT_015 — Total Unit Value equals sum of charges

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Type** | FUNC |
| **Test Steps** | 1. Sum all charge rows<br>2. Compare to Total Unit Value |
| **Expected Result** | Total Unit Value equals computed sum within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_016 — Offer/discount deduction shown if applied

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | HOME_LOAN or VC_REQUEST offer applied |
| **Type** | BIZ |
| **Test Steps** | 1. Locate Offer/Discount row |
| **Expected Result** | Discount line with negative value (e.g., "− ₹X") with offer name |
| **Priority** | High |

---

### BYR_UNIT_017 — Early bird benefit shown if eligible

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer eligible for early bird |
| **Type** | BIZ |
| **Test Steps** | 1. Locate Early Bird row |
| **Expected Result** | Early bird discount line displayed with amount |
| **Priority** | Medium |

---

### BYR_UNIT_018 — Net Payable Amount = Total − all deductions

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Type** | FUNC |
| **Test Steps** | 1. Compute Total − offers − early bird<br>2. Compare to Net Payable |
| **Expected Result** | Net Payable matches computed amount within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_019 — Cost sheet frozen at allocation time

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Admin changes offer config after this buyer's booking |
| **Type** | BIZ |
| **Test Steps** | 1. Reload Unit Details |
| **Expected Result** | Cost sheet unchanged; matches values at time of allocation |
| **Priority** | Critical |

---

## Unit Details — Tower View & Floor Plans

### BYR_UNIT_020 — Tower View shows buyer's unit position

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Scroll to Tower View section |
| **Expected Result** | Tower diagram renders; buyer's unit visually highlighted |
| **Priority** | High |

---

### BYR_UNIT_021 — Floor & Unit Plans section renders

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Scroll to FloorUnitPlans |
| **Expected Result** | Floor plan and unit plan images load; can be zoomed/clicked |
| **Priority** | High |

---

### BYR_UNIT_022 — Plan images open in lightbox/full view

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Plans visible |
| **Type** | FUNC |
| **Test Steps** | 1. Click plan image |
| **Expected Result** | Lightbox/modal opens with zoomable larger view |
| **Priority** | Medium |

---

### BYR_UNIT_043 — Tower View highlights buyer's unit with distinct colour

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Tower View loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect buyer's unit colour vs other units |
| **Expected Result** | Buyer's unit visually distinguishable (e.g., highlighted/coloured); tooltip on hover shows unit number |
| **Priority** | Medium |

---

### BYR_UNIT_044 — Tower View tooltip on hover shows unit info

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Tower View rendered |
| **Type** | UI |
| **Test Steps** | 1. Hover over buyer's unit on tower diagram |
| **Expected Result** | Tooltip shows unit number, floor, status; consistent with allocated unit |
| **Priority** | Low |

---

### BYR_UNIT_045 — Lightbox closes on ESC key

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Lightbox open with floor plan |
| **Type** | FUNC |
| **Test Steps** | 1. Press ESC |
| **Expected Result** | Lightbox closes; underlying Unit Details page restored |
| **Priority** | Low |

---

### BYR_UNIT_046 — Floor plan image renders even when imageUrl contains pipe-delimited entries

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit's `imageUrl = "url1||url2||url3"` (BYR_UNIT_032 known schema) |
| **Type** | EDGE |
| **Test Steps** | 1. Load Unit Details<br>2. Inspect floor plan section |
| **Expected Result** | At least the first valid URL renders; trailing empty segments do not produce broken image |
| **Priority** | Medium |

---

### BYR_UNIT_047 — Tower View handles missing image gracefully

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Tower image asset unavailable (404) |
| **Type** | NEG |
| **Test Steps** | 1. Open Unit Details with broken tower URL |
| **Expected Result** | Placeholder/fallback shown instead of broken image; rest of page renders normally |
| **Priority** | Low |

---

## Unit Details — Payment Schedule Detail (embedded)

### BYR_UNIT_023 — Payment Schedule section embedded at bottom

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Type** | UI |
| **Test Steps** | 1. Scroll to bottom |
| **Expected Result** | Embedded Payment Schedule renders milestone-by-milestone breakdown |
| **Priority** | High |

---

### BYR_UNIT_024 — Embedded schedule matches /paymentschedule

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Payment Schedule section visible |
| **Type** | FUNC |
| **Test Steps** | 1. Compare embedded schedule against `/paymentschedule` |
| **Expected Result** | Identical milestone list, amounts and statuses |
| **Priority** | Medium |

---

### BYR_UNIT_048 — Each milestone row shows label, amount, due date, status

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Payment Schedule loaded with at least 3 milestones |
| **Type** | UI |
| **Test Steps** | 1. Inspect each row |
| **Expected Result** | Every row renders: milestone name, ₹ amount, due date, status (Paid / Due / Upcoming) |
| **Priority** | High |

---

### BYR_UNIT_049 — Paid milestone shows status badge "Paid" with date

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | At least one milestone with `hcfTransactionStatus=PAID` |
| **Type** | UI |
| **Test Steps** | 1. Locate paid milestone row<br>2. Inspect status badge |
| **Expected Result** | Badge "Paid" / green tick; paid date populated |
| **Priority** | High |

---

### BYR_UNIT_050 — Upcoming milestone not actionable

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Schedule shows future milestone |
| **Type** | BIZ |
| **Test Steps** | 1. Try clicking Pay button on future milestone |
| **Expected Result** | Pay button absent or disabled with tooltip "Due on <date>"; cannot pay early |
| **Priority** | High |

---

### BYR_UNIT_051 — Milestone in VERIFICATION shows pending state

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Milestone with `hcfTransactionStatus=VERIFICATION` |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect that row |
| **Expected Result** | Status shown as "Verification" / "Processing"; Pay button hidden to prevent duplicate order |
| **Priority** | High |

---

### BYR_UNIT_052 — Total of milestone amounts equals Net Payable

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Schedule visible with all milestones |
| **Type** | FUNC |
| **Test Steps** | 1. Sum all milestone amounts<br>2. Compare to Net Payable from cost sheet |
| **Expected Result** | Sum equals Net Payable within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_053 — Empty schedule fallback when no milestones configured

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Test unit with empty milestone list |
| **Type** | EDGE |
| **Test Steps** | 1. Inspect Payment Schedule section |
| **Expected Result** | Empty-state message "No payment milestones available yet"; no broken table |
| **Priority** | Low |

---

## Unit Details — Negative & Edge Cases

### BYR_UNIT_025 — Page handles missing floor plan image gracefully

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Floor plan asset unavailable |
| **Type** | NEG |
| **Test Steps** | 1. Load page with broken plan URL |
| **Expected Result** | Placeholder/fallback shown; no broken image icon; rest of page renders |
| **Priority** | Low |

---

### BYR_UNIT_026 — Pre-allocation buyer cannot access cost sheet via API

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer not WINNER |
| **Type** | NEG |
| **Test Steps** | 1. Call `GET /api/users/allocation/unit-details?registrationNumber=X&unitId=Y` with this buyer's token (status != WINNER) |
| **Expected Result** | 400 "Could not fetch unit data" (controllers/allocation.controller.js:271-275). Non-WINNER units can still use parking preview `?carParking=N` but won't get cost sheet. |
| **Priority** | High |

---

### BYR_UNIT_054 — Expired session shows session-expired prompt on page load

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | JWT expired (post 24h) |
| **Type** | NEG |
| **Test Steps** | 1. Open `/allotted-units` with expired token |
| **Expected Result** | 401 response triggers redirect to login or "Session expired" toast; no partial unit data leaked |
| **Priority** | High |

---

### BYR_UNIT_055 — Invalid registrationNumber in API call returns 400

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Authenticated buyer |
| **Type** | API |
| **Test Steps** | 1. `GET /api/users/allocation/unit-details?registrationNumber=INVALID-XYZ&unitId=1` |
| **Expected Result** | 400 "Could not fetch unit data" — no leakage of valid registrations (controllers/allocation.controller.js:271-275) |
| **Priority** | High |

---

### BYR_UNIT_056 — Missing unitId query parameter rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Authenticated buyer |
| **Type** | API |
| **Test Steps** | 1. `GET /api/users/user-unit-details?registrationNumber=R` (omit unitId) |
| **Expected Result** | 400 "Missing required query parameters: registrationNumber and unitId" |
| **Priority** | High |

---

### BYR_UNIT_057 — Page resilient when imageUrl is null

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit with `imageUrl=null` in DB |
| **Type** | NEG |
| **Test Steps** | 1. Load Unit Details |
| **Expected Result** | Floor plan section shows placeholder; no JS crash; rest of page renders cost sheet + tower view |
| **Priority** | Medium |

---

### BYR_UNIT_058 — Mobile viewport renders all sections without horizontal scroll

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Resize browser to ≤480 px width |
| **Type** | UI |
| **Test Steps** | 1. Scroll through page |
| **Expected Result** | Unit details, cost sheet, tower view, payment schedule all stack vertically; no horizontal overflow |
| **Priority** | Medium |

---

### BYR_UNIT_059 — Concurrent reload during HCF order does not duplicate payment intent

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | HCF order initiated, status=VERIFICATION |
| **Type** | EDGE |
| **Test Steps** | 1. Refresh page during verification window<br>2. Inspect Pay button state |
| **Expected Result** | Pay button stays disabled; "Verification in progress" shown; no second order initiation possible (see BYR_UNIT_034) |
| **Priority** | High |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-unit-details.md`

### Corrections to existing TCs
- **BYR_UNIT_001 / BYR_UNIT_003** — There is NO `/allotted-units` backend route. The frontend composes the unit view from multiple endpoints: `GET /api/users/registration`, `GET /api/users/user-unit-details?registrationNumber=&unitId=`, `GET /api/users/allocation/unit-details?registrationNumber=&unitId=`, `GET /api/users/registration-units/booking-form-data/:registrationUnitId`. All require `protect + restrictTo('user')`.
- **BYR_UNIT_019** — Cost sheet for WINNER units uses persisted `RegistrationUnitOffer` rows captured at allocation time. Non-WINNER units recompute from `Offer` master filtered by `offerIds` query and current date window (controllers/allocation.controller.js:368-434). So WINNER cost sheet IS frozen by design.
- **BYR_UNIT_026** — Specific error is `400 "Could not fetch unit data"` (not 403/401). Buyer cross-tenant access returns `500 "Something went wrong"` deliberately to leak no info (controllers/user.controller.js:919-922) — bug-disguised-as-security.

### New TCs added below

### BYR_UNIT_027 — getMilestoneUnitDetails requires both registrationNumber and unitId

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Authenticated WINNER buyer |
| **Type** | API |
| **Test Steps** | 1. `GET /api/users/user-unit-details?registrationNumber=GHNG-XXX` (omit unitId) |
| **Expected Result** | 400 "Missing required query parameters: registrationNumber and unitId" (controllers/milestone-payment.controller.js:1491-1493) |
| **Priority** | High |

---

### BYR_UNIT_028 — Cross-tenant unit query returns opaque 500 (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer A authenticated; registration unit belongs to Buyer B |
| **Type** | NEG |
| **Test Steps** | 1. `GET /api/users/registration-units/booking-form-data/<B's registrationUnitId>` with A's token |
| **Expected Result** | 500 "Something went wrong" (controllers/user.controller.js:919-922) — should be 403/404 but intentionally opaque. Document as security-by-obscurity. |
| **Priority** | High (Security) |

---

### BYR_UNIT_029 — Allotment letter download endpoint does NOT exist

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER buyer |
| **Type** | API |
| **Test Steps** | 1. Search backend routes for allotment-letter download |
| **Expected Result** | NOT FOUND in routes/user.routes.js or routes/user/*.js. `InitialAllotment` model exists with association but no PDF endpoint. Any UI "Download Allotment Letter" must be either client-side react-to-print OR built off `getRegistrationUnitBookingFormData` Azure SAS URLs. Do NOT write TCs asserting a server PDF endpoint. |
| **Priority** | Medium |

---

### BYR_UNIT_030 — Applicant documents pre-signed via Azure SAS

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER buyer with KYC submitted |
| **Type** | INT |
| **Test Steps** | 1. `GET /api/users/registration-units/booking-form-data/<id>`<br>2. Inspect `applicants[*].documents` |
| **Expected Result** | Each document has Azure Blob SAS URL (NOT S3) — pre-signed per request (not cached). URL expiry must be tested at SAS lifetime boundary (controllers/user.controller.js:1059-1077). |
| **Priority** | High |

---

### BYR_UNIT_031 — Applicants ordered with `self` first

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit with applicants having relations: spouse, sister, self, father |
| **Type** | API |
| **Test Steps** | 1. `GET /booking-form-data/:id`<br>2. Inspect applicants[] order |
| **Expected Result** | `self` returned first via raw `CASE WHEN`, then ascending by id (controllers/user.controller.js:1017-1020). Relations title-cased on response (`'sister' → 'Sister'`). |
| **Priority** | Medium |

---

### BYR_UNIT_032 — Unit.imageUrl is `||`-delimited string (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit with multiple images |
| **Type** | DB |
| **Test Steps** | 1. Inspect `imageUrl` field<br>2. Set value to `"url1||url2||"` (trailing) then `""` |
| **Expected Result** | Field returns raw delimited string; client must split by `||`. Trailing/leading delimiters and pipe-containing URLs corrupt parsing. Document BUG (models/unit.model.js:424-429). |
| **Priority** | Low |

---

### BYR_UNIT_033 — Unit.status ENUM includes `REFUGE` typo

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Inspect ENUM |
| **Type** | DB |
| **Test Steps** | 1. Query schema for `units.status` ENUM values |
| **Expected Result** | ENUM = `AVAILABLE, HOLD, BOOKED, REFUGE, PREBOOKED, PBT, RESERVED`. `REFUGE` is almost certainly a typo for REFUND/REFUSED (models/unit.model.js:177). Document as schema BUG. |
| **Priority** | Low |

---

### BYR_UNIT_034 — Concurrent milestone order rejected with "in verification"

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit U; no in-flight milestone order |
| **Type** | EDGE |
| **Test Steps** | 1. Fire two simultaneous `POST /api/users/milestone-payment/order` for U + same milestoneKey<br>2. Compare responses |
| **Expected Result** | One returns 200 with order ID; second returns error "Milestone payment already in verification" (controllers/milestone-payment.controller.js:474-481). |
| **Priority** | High |

---

### BYR_UNIT_035 — HCF status transitions VERIFICATION → PAID on offline commit

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit, HCF order created (`hcfTransactionStatus='VERIFICATION'`) |
| **Type** | DB |
| **Test Steps** | 1. Trigger offline HCF commit<br>2. Query `registration_units` |
| **Expected Result** | `hcfTransactionStatus='PAID'`, `hcfTransactionId` populated (controllers/milestone-payment.controller.js:1411-1419). FAILED also valid terminal. |
| **Priority** | High |

---

### BYR_UNIT_036 — Cost sheet formula sanity

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit with offers + early-bird + home loan |
| **Type** | FUNC |
| **Test Steps** | 1. `GET /allocation/unit-details?registrationNumber=X&unitId=Y`<br>2. Compute manually: `round(agreementValue + totalParkingAmount − earlyBirdBenefit − homeLoanDiscountAmount − offerDiscountAmount)` |
| **Expected Result** | `finalAgreementValue` in response matches manual computation (controllers/allocation.controller.js:485-491). |
| **Priority** | Critical |

---

### BYR_UNIT_037 — Home loan discount applied only when registration_home_loans row exists

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit; buyer has NO home loan record |
| **Type** | BIZ |
| **Test Steps** | 1. Compute cost sheet via API |
| **Expected Result** | `homeLoanDiscountAmount` NOT subtracted from finalAgreementValue (controllers/allocation.controller.js:304, 489). Home Loan ENUM: `pending / approved / admin_rejected / admin_approved`. |
| **Priority** | High |
