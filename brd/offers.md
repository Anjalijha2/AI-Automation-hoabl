# BRD: Offers Management

**Module:** Offers  
**URL:** `https://uat-web.xrportal.in/admin/offers`  
**Sprint:** TBD  
**Author:** BA Agent  
**Created:** 2026-05-08  
**Status:** Draft

---

## 1. Purpose

The Offers Management module allows administrators to create, configure, and control discount offers that are applied to unit purchases during the booking flow. Offers can be amount-based (flat rupee discount) or percentage-based and are optionally scoped to specific unit typologies (e.g., 1 Bed Growth Home, 2 Bed Rise Home). Active offers appear as line-item discounts on the customer-facing unit detail panel and cost sheet. This module feeds directly into pricing calculation (Net Price = Base + premiums - active offer discounts) and is tightly coupled with the Allocation module.

**Business intent:** Provide a controlled, auditable mechanism for the sales team to run time-bound discount campaigns without touching base pricing. Toggle on/off per offer gives instant activation/deactivation without deletion.

---

## 2. Screens & Navigation

### 2.1 Navigation Path

Left sidebar → "Offers" (gift icon) → `/admin/offers`

### 2.2 Screen: Offers List (`/admin/offers`)

Single-page module. No sub-navigation tabs.

**Page Header:**
- Heading: "Offers Management"
- Counter badge: "N Offers" (e.g., "6 Offers") — live count of all offers regardless of status
- Buttons: Refresh | Add New Offer

**Offers Table:**

| Column | Description |
|--------|-------------|
| Sr. No. | System-assigned sequential number (not display ID) |
| Offer Name | Free-text name given at creation (max 100 chars) |
| Description | Optional description text (max 500 chars) |
| Amount | Flat discount in INR (shown as ₹ X,XX,XXX) |
| Percentage | Discount as a percentage — shown as "-" when offer type is Amount Based |
| Start Date | Offer validity start (DD MMM YYYY format) |
| End Date | Offer validity end (DD MMM YYYY format) |
| Created By | Display name of the admin user who created the offer |
| Action | ON/OFF toggle switch + Edit button + Delete button |

**Pagination:** 1 page shown (6 offers fit on one page); standard previous/next page controls.

**Observed data (UAT, 2026-05-08):**

| Sr. No. | Offer Name | Description | Amount | % | Start | End | Created By | Status |
|---------|-----------|-------------|--------|---|-------|-----|------------|--------|
| 10 | VK test | Booking | ₹ 10,000 | - | 06 May 2026 | 30 May 2026 | Vignesh UAT Admin | OFF |
| 9 | VC request | 2 bed peak home offer | ₹ 75,000 | - | 26 Apr 2026 | 31 May 2026 | Suyash D | ON |
| 8 | VC request | 2 bed rise home offer | ₹ 75,000 | - | 26 Apr 2026 | 31 May 2026 | Suyash D | ON |
| 7 | VC request | 2 Bed Growth Home | ₹ 75,000 | - | 27 Apr 2026 | 31 May 2026 | Suyash D | ON |
| 3 | VC request | 1 Bed Growth Home | ₹ 50,000 | - | 14 Apr 2026 | 30 May 2026 | Supriya Dubey | ON |
| 1 | Home Loan Discount | Home Loan Discount | ₹ 10,000 | - | 13 Apr 2026 | 30 Jun 2026 | Supriya Dubey | OFF |

> Note: Sr. Nos. are non-contiguous (1, 3, 7, 8, 9, 10) — deleted offers leave gaps. This confirms soft-delete is not in use; IDs are DB primary keys assigned at creation.

---

## 3. Key Entities & Data Fields

### 3.1 Offer Entity

| Field | Required | Type | Constraints | Notes |
|-------|----------|------|-------------|-------|
| Offer Name | Yes | Text | Max 100 chars | Must be unique? (CLARIFICATION needed — see Section 9) |
| Offer Type | Yes | Radio | Amount Based OR Percentage Based | Mutually exclusive |
| Amount | Yes (if Amount Based) | Currency spinbutton | Positive integer, INR | Rendered with ₹ prefix |
| Percentage | Yes (if Percentage Based) | Numeric | 0-100 (assumed) | Column shows "-" when Amount Based |
| Description | No | Textarea | Max 500 chars | Optional free-text |
| Start Date | Yes | Date picker | Must be ≤ End Date | Part of date-range picker |
| End Date | Yes | Date picker | Must be ≥ Start Date | Part of date-range picker |
| Select Typology | No | Multi-select dropdown | Observed: 1 Bed Growth Home, 2 Bed Growth Home, 2 Bed Rise Home (and others) | When blank = offer applies to all typologies |
| Active (ON/OFF) | — | Toggle switch | Default ON at creation (assumed) | Can be toggled any time after creation |

### 3.2 Typology Values (observed in edit form)

- 2 Bed Growth Home (confirmed in edit form for Sr. No. 10 — note mismatch with description "Booking"; likely last-edited typology)
- 1 Bed Growth Home
- 2 Bed Rise Home
- (others potentially visible in dropdown — not fully enumerated on UAT)

---

## 4. Business Workflows

### 4.1 Create Offer

```
Admin clicks "Add New Offer"
    → Modal opens: "Add New Offer"
    → Admin fills: Offer Name (required) + Offer Type (required) + Amount/Percentage (required)
                   + Description (optional) + Date Range (required) + Typology (optional)
    → Admin clicks "Create Offer"
    → On success: Modal closes; offer appears in table; counter increments
    → On validation fail: Inline errors on required fields; modal stays open
```

**Buttons in modal:** Cancel (closes modal without saving) | Create Offer (submits)

### 4.2 Edit Offer

```
Admin clicks edit button (pencil icon) on any offer row
    → Modal opens: "Edit Offer" — all fields pre-filled with existing values
    → Admin modifies desired fields
    → Admin clicks "Update Offer"
    → On success: Modal closes; table row reflects updated values
    → On validation fail: Inline errors; modal stays open
```

**Buttons in modal:** Cancel | Update Offer

### 4.3 Toggle Offer Active/Inactive

```
Admin clicks ON/OFF toggle switch in Action column
    → Offer status flips immediately (assumed optimistic update)
    → ON = offer is active and applies to customer pricing
    → OFF = offer exists but does not apply to customer pricing
```

> Domain Red Flag: No confirmation dialog observed for toggle. Admin can accidentally deactivate an active offer during a live allocation campaign. Risk: HIGH — customers mid-booking may see price change. Flagged for testing.

### 4.4 Delete Offer

```
Admin clicks delete button (trash icon) on any offer row
    → Confirmation dialog expected (assumed — not observed; CLARIFICATION needed)
    → On confirm: Offer removed from list; counter decrements
```

### 4.5 Refresh

```
Admin clicks "Refresh"
    → Table reloads with latest data from server
    → No state change to offers
```

---

## 5. Filters & Search Capabilities

**Observed filters on Offers list:**
- None visible as of UAT exploration — no search box, no status filter, no date filter on the list page itself
- The Refresh button is the only list control besides Add New Offer

> CLARIFICATION-OFFERS-001: Is there a search/filter capability planned or hidden? The channel-partners and customers modules have search fields. Offers has none. Confirm this is intentional.

---

## 6. KPIs / Dashboard Metrics

- **Offer count badge:** "N Offers" — total count of all offers in the system (active + inactive + expired)
- No KPI dashboard cards or charts on this page

---

## 7. Integration Points

| Integrated Module | Relationship |
|-------------------|-------------|
| Allocation | Active offers applied as line-item discounts on unit selection detail panel (Amount: "Home Loan Offer Discount -Rs. X,XXX", "Early Bird Benefit Discount -Rs. XX,XXX"). Offer activation/deactivation during live campaign directly affects customer pricing. |
| Towers / Units | Typology filter on offer scopes discount to specific unit types (1 Bed / 2 Bed Growth / Rise Home). Typology values must match unit typologies defined in tower configuration. |
| Customers | Customer sees applied offers as discounts on cost sheet and payment summary |
| Config/CMS | Unit Cost Update section allows bulk CSV updates to Agreement Value and Early Bird discount — overlaps with the Offers mechanism. Exact relationship between CMS bulk update and Offers module discount fields needs clarification. |

### 7.1 Pricing Impact

Net price shown on customer unit selection:
```
Agreement Value (base)
- Home Loan Offer Discount      (from Offers module, type = Home Loan)
- Early Bird Benefit Discount   (from Offers module, type = Early Bird)
= All Inclusive Price
```
> Domain Red Flag: If an offer's validity end date passes while a customer is mid-booking with that offer applied, does the system re-price or honor the locked offer? This must be tested.

---

## 8. Acceptance Criteria (High-Level)

### AC-OFFERS-001: List Page
- Offers list loads within 3 seconds
- Counter badge accurately reflects total offer count
- All table columns render with correct data types (currency formatted, dates as DD MMM YYYY)
- Non-contiguous Sr. No. values are preserved correctly (no renumbering after delete)

### AC-OFFERS-002: Create Offer
- "Add New Offer" modal opens on button click
- All required fields show inline validation errors on empty submit
- Offer Name character counter displays "X / 100"
- Description character counter displays "X / 500"
- Amount Based / Percentage Based radio buttons are mutually exclusive
- Date range picker enforces Start ≤ End
- Successful creation closes modal and shows new offer in table
- Counter badge increments by 1

### AC-OFFERS-003: Edit Offer
- Edit modal opens with all existing values pre-filled
- All validation rules apply identically to Create
- Successful update reflects in table immediately
- "Cancel" discards changes

### AC-OFFERS-004: Toggle ON/OFF
- Toggle switch changes state on click
- ON state = offer visible/active to customer pricing flow
- OFF state = offer excluded from customer pricing (verify via allocation flow)
- No accidental toggle without intent (confirm if confirmation dialog needed)

### AC-OFFERS-005: Delete Offer
- Delete action requires confirmation (verify dialog text)
- Deleted offer disappears from list; counter decrements
- Deleted offer is no longer applied to any customer pricing

### AC-OFFERS-006: Typology Scoping
- Offer with typology = "1 Bed Growth Home" applies only to 1BHK units
- Offer with no typology selected applies to all unit types
- Verify on customer unit selection screen

---

## 9. Out of Scope / UAT Limitations

1. **Percentage-Based offers:** No percentage-based offers exist in UAT data. The Percentage column always shows "-". Testing percentage offer creation and its impact on pricing cannot be fully verified on UAT.
2. **Expired offer behavior:** Cannot test offers past their end date without creating test offers and waiting. Date manipulation or API-level testing required.
3. **Offer uniqueness:** It is unclear whether Offer Name must be unique system-wide. Multiple "VC request" rows exist — this suggests names are not unique.
4. **Delete confirmation:** The delete flow was not executed during UAT exploration to avoid data loss. Confirmation dialog behavior is assumed.
5. **CMS Admin (separate portal):** The nav item "CMS" links to `https://manage-uat.xrportal.in/admin/auth/login` — a separate admin portal. Offers created there vs. here may differ in scope. Out of scope for this BRD.

### Open Clarifications

| ID | Question | Impact |
|----|----------|--------|
| CLARIFICATION-OFFERS-001 | Are there plans for search/filter on the offers list? | Test case scope |
| CLARIFICATION-OFFERS-002 | Is Offer Name required to be unique? | Validation test case |
| CLARIFICATION-OFFERS-003 | Does toggling OFF an offer mid-allocation re-price the customer's active selection? | Critical pricing integration test |
| CLARIFICATION-OFFERS-004 | What happens when offer End Date passes while customer is in booking flow? | Edge case test |
| CLARIFICATION-OFFERS-005 | Delete — is there a confirmation dialog? What is the exact dialog text? | Delete test case |
| CLARIFICATION-OFFERS-006 | What typology values are available in the dropdown? Full list needed. | Test data |
