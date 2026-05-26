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
| **Test Steps** | 1. Try opening `/allotted-units` while not WINNER<br>2. Then assign WINNER and retry |
| **Expected Result** | Non-WINNER: blocked / redirected to dashboard. WINNER: page loads. |
| **Priority** | Critical |

---

### BYR_UNIT_002 — "My Unit" nav item visible post-allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER status |
| **Test Steps** | 1. Inspect main nav |
| **Expected Result** | My Unit / Allotted Unit menu item visible and clickable |
| **Priority** | High |

---

### BYR_UNIT_003 — Click My Unit navigates to /allotted-units

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER status |
| **Test Steps** | 1. Click My Unit from nav |
| **Expected Result** | URL = `/allotted-units`; page renders unit information |
| **Priority** | Critical |

---

## Unit Details — Unit Details Section

### BYR_UNIT_004 — Unit number rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Unit Details card |
| **Expected Result** | Unit number visible (e.g., "3502") matching allocation |
| **Priority** | Critical |

---

### BYR_UNIT_005 — Floor and Tower name shown

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Floor and Tower fields |
| **Expected Result** | Floor number (e.g., "35") and Tower name (e.g., "Crest") rendered |
| **Priority** | High |

---

### BYR_UNIT_006 — Apartment configuration rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect BHK/typology field |
| **Expected Result** | Configuration shown (e.g., "1 Bed Growth Home") |
| **Priority** | High |

---

### BYR_UNIT_007 — Carpet and saleable area rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Carpet Area and Saleable Area fields |
| **Expected Result** | Both areas shown in sq.ft. (e.g., "323 sq.ft.") |
| **Priority** | High |

---

### BYR_UNIT_008 — Facing direction rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Inspect Facing field |
| **Expected Result** | Facing direction shown (East/West/North/South) |
| **Priority** | Medium |

---

### BYR_UNIT_009 — Floor plan image loads

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
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
| **Test Steps** | 1. Scroll to Cost Sheet |
| **Expected Result** | Itemised cost sheet section renders |
| **Priority** | Critical |

---

### BYR_UNIT_011 — Basic price line rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Inspect Basic Price row |
| **Expected Result** | Label "Basic Price" with numeric ₹ value > 0 |
| **Priority** | Critical |

---

### BYR_UNIT_012 — Floor rise / Premium / Infra / Society / Clubhouse / Possession lines rendered

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Verify each line item is present |
| **Expected Result** | All 6 charge lines render with their labels and amounts (or 0 if not applicable) |
| **Priority** | High |

---

### BYR_UNIT_013 — GST line shown separately

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Locate GST row |
| **Expected Result** | GST amount displayed separately from principal |
| **Priority** | High |

---

### BYR_UNIT_014 — Parking charge rendered if applicable

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer's unit has parking charge |
| **Test Steps** | 1. Locate Parking row |
| **Expected Result** | Parking amount shown; if zero, row shows 0 or is hidden by config |
| **Priority** | Medium |

---

### BYR_UNIT_015 — Total Unit Value equals sum of charges

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Sum all charge rows<br>2. Compare to Total Unit Value |
| **Expected Result** | Total Unit Value equals computed sum within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_016 — Offer/discount deduction shown if applied

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | HOME_LOAN or VC_REQUEST offer applied |
| **Test Steps** | 1. Locate Offer/Discount row |
| **Expected Result** | Discount line with negative value (e.g., "− ₹X") with offer name |
| **Priority** | High |

---

### BYR_UNIT_017 — Early bird benefit shown if eligible

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer eligible for early bird |
| **Test Steps** | 1. Locate Early Bird row |
| **Expected Result** | Early bird discount line displayed with amount |
| **Priority** | Medium |

---

### BYR_UNIT_018 — Net Payable Amount = Total − all deductions

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Cost Sheet visible |
| **Test Steps** | 1. Compute Total − offers − early bird<br>2. Compare to Net Payable |
| **Expected Result** | Net Payable matches computed amount within rounding tolerance |
| **Priority** | Critical |

---

### BYR_UNIT_019 — Cost sheet frozen at allocation time

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Admin changes offer config after this buyer's booking |
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
| **Test Steps** | 1. Scroll to Tower View section |
| **Expected Result** | Tower diagram renders; buyer's unit visually highlighted |
| **Priority** | High |

---

### BYR_UNIT_021 — Floor & Unit Plans section renders

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Scroll to FloorUnitPlans |
| **Expected Result** | Floor plan and unit plan images load; can be zoomed/clicked |
| **Priority** | High |

---

### BYR_UNIT_022 — Plan images open in lightbox/full view

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Plans visible |
| **Test Steps** | 1. Click plan image |
| **Expected Result** | Lightbox/modal opens with zoomable larger view |
| **Priority** | Medium |

---

## Unit Details — Payment Schedule Detail (embedded)

### BYR_UNIT_023 — Payment Schedule section embedded at bottom

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Page loaded |
| **Test Steps** | 1. Scroll to bottom |
| **Expected Result** | Embedded Payment Schedule renders milestone-by-milestone breakdown |
| **Priority** | High |

---

### BYR_UNIT_024 — Embedded schedule matches /paymentschedule

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Payment Schedule section visible |
| **Test Steps** | 1. Compare embedded schedule against `/paymentschedule` |
| **Expected Result** | Identical milestone list, amounts and statuses |
| **Priority** | Medium |

---

## Unit Details — Negative & Edge Cases

### BYR_UNIT_025 — Page handles missing floor plan image gracefully

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Floor plan asset unavailable |
| **Test Steps** | 1. Load page with broken plan URL |
| **Expected Result** | Placeholder/fallback shown; no broken image icon; rest of page renders |
| **Priority** | Low |

---

### BYR_UNIT_026 — Pre-allocation buyer cannot access cost sheet via API

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer not WINNER |
| **Test Steps** | 1. Call `GET /api/users/allocation/unit-details?registrationNumber=X&unitId=Y` with this buyer's token (status != WINNER) |
| **Expected Result** | 400 "Could not fetch unit data" (controllers/allocation.controller.js:271-275). Non-WINNER units can still use parking preview `?carParking=N` but won't get cost sheet. |
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
| **Test Steps** | 1. `GET /api/users/user-unit-details?registrationNumber=GHNG-XXX` (omit unitId) |
| **Expected Result** | 400 "Missing required query parameters: registrationNumber and unitId" (controllers/milestone-payment.controller.js:1491-1493) |
| **Priority** | High |

---

### BYR_UNIT_028 — Cross-tenant unit query returns opaque 500 (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Buyer A authenticated; registration unit belongs to Buyer B |
| **Test Steps** | 1. `GET /api/users/registration-units/booking-form-data/<B's registrationUnitId>` with A's token |
| **Expected Result** | 500 "Something went wrong" (controllers/user.controller.js:919-922) — should be 403/404 but intentionally opaque. Document as security-by-obscurity. |
| **Priority** | High (Security) |

---

### BYR_UNIT_029 — Allotment letter download endpoint does NOT exist

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER buyer |
| **Test Steps** | 1. Search backend routes for allotment-letter download |
| **Expected Result** | NOT FOUND in routes/user.routes.js or routes/user/*.js. `InitialAllotment` model exists with association but no PDF endpoint. Any UI "Download Allotment Letter" must be either client-side react-to-print OR built off `getRegistrationUnitBookingFormData` Azure SAS URLs. Do NOT write TCs asserting a server PDF endpoint. |
| **Priority** | Medium |

---

### BYR_UNIT_030 — Applicant documents pre-signed via Azure SAS

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER buyer with KYC submitted |
| **Test Steps** | 1. `GET /api/users/registration-units/booking-form-data/<id>`<br>2. Inspect `applicants[*].documents` |
| **Expected Result** | Each document has Azure Blob SAS URL (NOT S3) — pre-signed per request (not cached). URL expiry must be tested at SAS lifetime boundary (controllers/user.controller.js:1059-1077). |
| **Priority** | High |

---

### BYR_UNIT_031 — Applicants ordered with `self` first

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit with applicants having relations: spouse, sister, self, father |
| **Test Steps** | 1. `GET /booking-form-data/:id`<br>2. Inspect applicants[] order |
| **Expected Result** | `self` returned first via raw `CASE WHEN`, then ascending by id (controllers/user.controller.js:1017-1020). Relations title-cased on response (`'sister' → 'Sister'`). |
| **Priority** | Medium |

---

### BYR_UNIT_032 — Unit.imageUrl is `||`-delimited string (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Unit with multiple images |
| **Test Steps** | 1. Inspect `imageUrl` field<br>2. Set value to `"url1||url2||"` (trailing) then `""` |
| **Expected Result** | Field returns raw delimited string; client must split by `||`. Trailing/leading delimiters and pipe-containing URLs corrupt parsing. Document BUG (models/unit.model.js:424-429). |
| **Priority** | Low |

---

### BYR_UNIT_033 — Unit.status ENUM includes `REFUGE` typo

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | Inspect ENUM |
| **Test Steps** | 1. Query schema for `units.status` ENUM values |
| **Expected Result** | ENUM = `AVAILABLE, HOLD, BOOKED, REFUGE, PREBOOKED, PBT, RESERVED`. `REFUGE` is almost certainly a typo for REFUND/REFUSED (models/unit.model.js:177). Document as schema BUG. |
| **Priority** | Low |

---

### BYR_UNIT_034 — Concurrent milestone order rejected with "in verification"

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit U; no in-flight milestone order |
| **Test Steps** | 1. Fire two simultaneous `POST /api/users/milestone-payment/order` for U + same milestoneKey<br>2. Compare responses |
| **Expected Result** | One returns 200 with order ID; second returns error "Milestone payment already in verification" (controllers/milestone-payment.controller.js:474-481). |
| **Priority** | High |

---

### BYR_UNIT_035 — HCF status transitions VERIFICATION → PAID on offline commit

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit, HCF order created (`hcfTransactionStatus='VERIFICATION'`) |
| **Test Steps** | 1. Trigger offline HCF commit<br>2. Query `registration_units` |
| **Expected Result** | `hcfTransactionStatus='PAID'`, `hcfTransactionId` populated (controllers/milestone-payment.controller.js:1411-1419). FAILED also valid terminal. |
| **Priority** | High |

---

### BYR_UNIT_036 — Cost sheet formula sanity

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit with offers + early-bird + home loan |
| **Test Steps** | 1. `GET /allocation/unit-details?registrationNumber=X&unitId=Y`<br>2. Compute manually: `round(agreementValue + totalParkingAmount − earlyBirdBenefit − homeLoanDiscountAmount − offerDiscountAmount)` |
| **Expected Result** | `finalAgreementValue` in response matches manual computation (controllers/allocation.controller.js:485-491). |
| **Priority** | Critical |

---

### BYR_UNIT_037 — Home loan discount applied only when registration_home_loans row exists

| Field | Value |
|-------|-------|
| **Module** | BYR – Unit Details |
| **Pre-conditions** | WINNER unit; buyer has NO home loan record |
| **Test Steps** | 1. Compute cost sheet via API |
| **Expected Result** | `homeLoanDiscountAmount` NOT subtracted from finalAgreementValue (controllers/allocation.controller.js:304, 489). Home Loan ENUM: `pending / approved / admin_rejected / admin_approved`. |
| **Priority** | High |
