# Test Cases — Offers
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Offers.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-offers.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- 5 endpoints: GET, POST, PUT, PATCH toggle, DELETE — all `restrictTo('admin')`.
- `offerCode` (`HOME_LOAN`, `VC_REQUEST`) is **NOT settable through admin APIs** — `offerCode` is absent from `createOfferSchema` and `updateOfferSchema`. Admin can only create generic AMOUNT/PERCENTAGE offers. Coded offers must be seeded via direct DB/migration.
- `projectId` is the PUBLIC business id (string), not numeric PK — resolved via `Project.findOne({where:{projectId}})`.
- Soft-delete enabled (`paranoid: true`); deleted offers excluded automatically.
- No notification dispatched on offer create/update/toggle/delete.

---

## Offers List & Page Layout

### ADM_OFR_001 — Offers page loads at /admin/offers

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Offers" in sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/offers; offers list and Add Offer button visible |
| **Priority** | Critical |

---

### ADM_OFR_002 — Offers table columns

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offers page loaded |
| **Test Steps** | 1. Inspect table column headers |
| **Expected Result** | Columns: Offer Name, Type, Discount Value, Start Date, End Date, Typology, Active toggle, Action (trash) |
| **Priority** | High |

---

### ADM_OFR_003 — Add New Offer button visible

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offers page loaded |
| **Test Steps** | 1. Locate "Add New Offer" button |
| **Expected Result** | Button visible at top of page |
| **Priority** | High |

---

### ADM_OFR_004 — Type column shows Amount Based or Percentage Based

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offers page loaded |
| **Test Steps** | 1. Read distinct Type values |
| **Expected Result** | Values are: Amount Based or Percentage Based |
| **Priority** | High |

---

### ADM_OFR_005 — System-generated offer HOME_LOAN shown when present

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Admin previously approved a Home Loan in Customers |
| **Test Steps** | 1. Locate offer with code HOME_LOAN |
| **Expected Result** | HOME_LOAN offer exists in list; created by system after Home Loan Approval |
| **Priority** | High |

---

### ADM_OFR_006 — System-generated offer VC_REQUEST shown when present

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | SM recorded VC_DONE_PREFERENCE or VC_2_DONE outcome |
| **Test Steps** | 1. Locate offer with code VC_REQUEST |
| **Expected Result** | VC_REQUEST offer exists; was auto-created |
| **Priority** | Medium |

---

## Create Offer — Amount Based

### ADM_OFR_007 — Click Add New Offer opens create form

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offers page loaded |
| **Test Steps** | 1. Click Add New Offer |
| **Expected Result** | Form/modal opens with fields: Offer Name, Type, Discount Value, Start Date, End Date, Typology |
| **Priority** | Critical |

---

### ADM_OFR_008 — Create Amount Based offer with valid data

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Enter Name "Early Bird 27K"<br>2. Select Type = Amount Based<br>3. Enter Discount = 27000<br>4. Set Start Date = today<br>5. Set End Date = today + 30 days<br>6. Click Create Offer |
| **Expected Result** | Offer created; appears in list with Active = ON |
| **Priority** | Critical |

---

### ADM_OFR_009 — Amount Based offer shows ₹ formatted discount

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Amount Based offer created |
| **Test Steps** | 1. Inspect Discount Value column |
| **Expected Result** | Value shown as "₹27,000" |
| **Priority** | Medium |

---

### ADM_OFR_010 — Create offer with negative discount rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Enter Discount = -500<br>2. Submit |
| **Expected Result** | Validation error; discount must be positive |
| **Priority** | High |

---

### ADM_OFR_011 — Create offer with discount = 0 rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Enter Discount = 0<br>2. Submit |
| **Expected Result** | Validation error; discount must be > 0 |
| **Priority** | High |

---

### ADM_OFR_012 — Create offer with empty Name rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Leave Name empty<br>2. Fill other fields<br>3. Submit |
| **Expected Result** | Name required error |
| **Priority** | High |

---

## Create Offer — Percentage Based

### ADM_OFR_013 — Create Percentage Based offer with 5%

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Name "Festive 5%"<br>2. Type = Percentage Based<br>3. Discount = 5<br>4. Set dates<br>5. Create |
| **Expected Result** | Offer created; Discount Value column shows "5%" |
| **Priority** | High |

---

### ADM_OFR_014 — Percentage > 100 rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Type = Percentage Based<br>2. Discount = 150<br>3. Submit |
| **Expected Result** | Validation error; percentage cannot exceed 100 |
| **Priority** | High |

---

### ADM_OFR_015 — Percentage discount shows correct % format

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Percentage offer created |
| **Test Steps** | 1. Inspect Discount Value column |
| **Expected Result** | Value shown with % suffix (e.g. "5%") |
| **Priority** | Medium |

---

### ADM_OFR_039 — Percentage = 0 rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open; Type = Percentage Based |
| **Test Steps** | 1. Enter Discount = 0<br>2. Submit |
| **Expected Result** | Validation error; percentage must be > 0 |
| **Priority** | High |

---

### ADM_OFR_040 — Percentage = 100 boundary accepted

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open; Type = Percentage Based |
| **Test Steps** | 1. Enter Discount = 100<br>2. Set dates and Submit |
| **Expected Result** | Offer created at 100% boundary; All Inclusive Price drops to zero for eligible units (boundary case — verify business intent) |
| **Priority** | High |

---

### ADM_OFR_041 — Percentage with decimal (e.g. 5.5) accepted

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open; Type = Percentage Based |
| **Test Steps** | 1. Enter Discount = 5.5<br>2. Submit |
| **Expected Result** | Offer created with fractional percentage 5.5; Discount Value column shows "5.5%" |
| **Priority** | Medium |

---

### ADM_OFR_042 — Percentage with negative value rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open; Type = Percentage Based |
| **Test Steps** | 1. Enter Discount = -10<br>2. Submit |
| **Expected Result** | Validation error; percentage must be positive |
| **Priority** | High |

---

### ADM_OFR_043 — Switching Type from Percentage to Amount clears discount value

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open; Type = Percentage Based; Discount = 5 entered |
| **Test Steps** | 1. Change Type dropdown to Amount Based<br>2. Inspect Discount Value field |
| **Expected Result** | Discount Value resets to blank to prevent invalid carry-over (5% would not be a meaningful ₹ amount) |
| **Priority** | Medium |

---

## Date Validity & Typology

### ADM_OFR_016 — Offer with End Date before Start Date rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Start Date = 2026-06-01<br>2. End Date = 2026-05-15<br>3. Submit |
| **Expected Result** | Validation error: end date must be after start date |
| **Priority** | High |

---

### ADM_OFR_017 — Offer with past Start Date allowed (active immediately)

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Start Date = yesterday<br>2. End Date = today + 7<br>3. Submit |
| **Expected Result** | Offer created; valid because Start ≤ today ≤ End |
| **Priority** | Medium |

---

### ADM_OFR_018 — Typology restriction to "1 Bed Growth Home"

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Select Typology = "1 Bed Growth Home"<br>2. Fill other fields and create |
| **Expected Result** | Offer applies only to 1 Bed Growth Home units; other typology units not discounted |
| **Priority** | High |

---

### ADM_OFR_019 — Offer applies to All Typologies when none specified

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Add Offer form open |
| **Test Steps** | 1. Leave Typology blank/All<br>2. Create offer |
| **Expected Result** | Offer applies across all unit typologies |
| **Priority** | High |

---

### ADM_OFR_020 — Offer with future Start Date does not apply yet

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offer with Start Date = tomorrow |
| **Test Steps** | 1. Open Towers and click an eligible unit |
| **Expected Result** | All Inclusive Price does NOT include this future offer |
| **Priority** | High |

---

### ADM_OFR_021 — Offer past End Date does not apply

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offer with End Date = yesterday |
| **Test Steps** | 1. Open Towers and click an eligible unit |
| **Expected Result** | Expired offer not deducted from price |
| **Priority** | High |

---

## Toggle Activate / Deactivate

### ADM_OFR_022 — New offer starts with Active = ON

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | New offer just created |
| **Test Steps** | 1. Inspect Active column on new offer row |
| **Expected Result** | Toggle is ON by default |
| **Priority** | High |

---

### ADM_OFR_023 — Toggle Active OFF takes effect immediately without confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Active offer exists |
| **Test Steps** | 1. Click toggle in Action column |
| **Expected Result** | Toggle switches to OFF instantly with no confirmation dialog |
| **Priority** | Critical |

---

### ADM_OFR_024 — Deactivated offer not applied to new buyer pricing

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offer just deactivated |
| **Test Steps** | 1. Open Towers in buyer view<br>2. Click a unit that was previously discounted |
| **Expected Result** | All Inclusive Price no longer includes that offer's discount |
| **Priority** | Critical |

---

### ADM_OFR_025 — Re-activate offer via toggle

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Inactive offer exists |
| **Test Steps** | 1. Click toggle to ON |
| **Expected Result** | Offer reactivated immediately; discount applies again |
| **Priority** | High |

---

### ADM_OFR_026 — Toggle change during active campaign affects buyer pricing immediately

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Active campaign; offer ON |
| **Test Steps** | 1. Admin toggles offer OFF<br>2. Refresh buyer's unit view |
| **Expected Result** | Buyer sees price without that discount |
| **Priority** | Critical |

---

## Delete Offer

### ADM_OFR_027 — Trash icon visible in Action column

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offers page loaded |
| **Test Steps** | 1. Inspect Action column |
| **Expected Result** | Trash icon visible per offer row |
| **Priority** | High |

---

### ADM_OFR_028 — Click trash icon opens delete confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offer exists |
| **Test Steps** | 1. Click trash icon |
| **Expected Result** | Confirmation dialog opens with offer name and Delete/Cancel buttons |
| **Priority** | Critical |

---

### ADM_OFR_029 — Confirm delete removes offer from list

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Delete confirmation open |
| **Test Steps** | 1. Click Delete in dialog |
| **Expected Result** | Offer removed from list; success toast shown |
| **Priority** | Critical |

---

### ADM_OFR_030 — Cancel delete keeps offer

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Delete confirmation open |
| **Test Steps** | 1. Click Cancel in dialog |
| **Expected Result** | Dialog closes; offer remains in list |
| **Priority** | Medium |

---

### ADM_OFR_044 — Deleted offer is soft-deleted (paranoid:true)

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers / DB |
| **BRD/FRD Req** | FSD §1 (paranoid model) |
| **Pre-conditions** | Offer just deleted via UI |
| **Test Steps** | 1. Note deleted offer id<br>2. Query DB: `SELECT * FROM offers WHERE id=<id>` |
| **Expected Result** | Row still exists in DB with `deletedAt` timestamp populated; standard GET excludes it; offer no longer applies to pricing |
| **Priority** | High |

---

### ADM_OFR_045 — Delete confirmation dialog shows offer name

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offer "Festive 5%" exists |
| **Test Steps** | 1. Click trash icon on that row |
| **Expected Result** | Confirmation dialog text references "Festive 5%" by name to avoid accidental deletion |
| **Priority** | High |

---

### ADM_OFR_046 — Delete an Active offer is allowed

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offer with Active = ON |
| **Test Steps** | 1. Click trash icon, Confirm |
| **Expected Result** | Active offer is deleted directly without requiring deactivation first; success toast shown |
| **Priority** | Medium |

---

### ADM_OFR_047 — Deleting offer does not refund existing bookings that used it

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | A buyer has a completed booking that used Offer X; Offer X exists |
| **Test Steps** | 1. Delete Offer X<br>2. Open Customers, locate the buyer's completed booking |
| **Expected Result** | Booking amount unchanged; existing transactions and registrations are not affected by offer deletion |
| **Priority** | High |

---

## Pricing Application & Edge Cases

### ADM_OFR_031 — Multiple active offers stack on Agreement Value

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Two active offers applicable to same typology |
| **Test Steps** | 1. Open eligible unit in Towers<br>2. Inspect All Inclusive Price |
| **Expected Result** | All Inclusive Price = Agreement Value - sum of both offer discounts |
| **Priority** | Critical |

---

### ADM_OFR_032 — Race: Offer turned OFF while buyer mid-payment

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Buyer viewing pricing with offer; admin toggles offer OFF |
| **Test Steps** | 1. Buyer clicks Proceed to Pay after admin toggles OFF |
| **Expected Result** | Discount disappears from final booking amount per BRD race condition rule |
| **Priority** | High |

---

### ADM_OFR_033 — Locked bookings not affected by offer changes

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Buyer completed booking with offer applied |
| **Test Steps** | 1. Toggle the offer OFF<br>2. Check buyer's booking record |
| **Expected Result** | Existing booking amount unchanged; offer change applies only to future bookings |
| **Priority** | Critical |

---

### ADM_OFR_034 — Pagination works on offers table

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | More than 10 offers exist |
| **Test Steps** | 1. Click Next page |
| **Expected Result** | Next page loads with remaining offers |
| **Priority** | Medium |

---

### ADM_OFR_035 — Search/filter offers by name

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers |
| **Pre-conditions** | Offers page loaded |
| **Test Steps** | 1. Use search field to type partial offer name |
| **Expected Result** | List filters to matching offers |
| **Priority** | Medium |

---

### ADM_OFR_036 — [FSD-CORRECTION] HOME_LOAN / VC_REQUEST offers cannot be CREATED by admin (offerCode not in API schema)

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers / API |
| **BRD/FRD Req** | FSD §1 GAP-1 / `admin.validations.js:341-365` |
| **Pre-conditions** | Admin JWT |
| **Test Steps** | 1. POST `/api/v1/admin/offers` with `{offerCode: 'HOME_LOAN', ...}` |
| **Expected Result** | The `offerCode` field is stripped by Yup (not in `createOfferSchema`). Created offer has `offerCode = null`. Coded offers can only be seeded via direct DB. Edit existing HOME_LOAN offer via PUT will similarly fail to alter `offerCode`. |
| **Priority** | High |

---

## [FSD-CORRECTION] New TCs — Offers source-verified gaps

### ADM_OFR_FSD_037 — [FSD-CORRECTION] No notification on offer create/update/toggle/delete

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers / Notifications |
| **BRD/FRD Req** | FSD §1, §3 (no notification calls in service) |
| **Pre-conditions** | Admin creates/updates/toggles/deletes an offer |
| **Test Steps** | 1. Perform each action<br>2. Inspect Kaleyra/epinet/email logs |
| **Expected Result** | NO buyer-facing notification dispatched for any offer admin action. |
| **Priority** | Medium |

---

### ADM_OFR_FSD_038 — [FSD-CORRECTION] projectId is the PUBLIC business id (string), not numeric PK

| Field | Value |
|-------|-------|
| **Module** | ADM – Offers / API |
| **BRD/FRD Req** | FSD §3.1 / `offer.service.js:13-17` |
| **Pre-conditions** | Project with public `projectId='hoabl-growth-1'` exists |
| **Test Steps** | 1. GET `/api/v1/admin/offers?projectId=1` (numeric PK)<br>2. GET `/api/v1/admin/offers?projectId=hoabl-growth-1` (public id) |
| **Expected Result** | First returns `ApiError.notFound('Project not found')`. Second resolves and returns offers. |
| **Priority** | Medium |

---
