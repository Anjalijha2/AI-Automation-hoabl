# OFFERS — Screen Documentation

**Module:** Offers Management
**URL:** `https://uat-web.xrportal.in/admin/offers`
**Navigation Path:** Left sidebar → gift icon → "Offers"
**Sprint:** 4
**Last Updated:** 2026-05-08
**Status:** Complete

---

## 1. Page Overview

Single-page module. No sub-navigation tabs. Admin-only access. Provides a controlled, auditable mechanism to run time-bound discount campaigns without modifying base pricing. Active offers apply as line-item discounts in the Allocation / unit selection flow.

---

## 2. Page Layout

### 2.1 Page Header

| Element | Selector | Content |
|---------|----------|---------|
| Page Heading | `h5` | "Offers Management" |
| Offer Count Badge | `div` matching `/\d+ Offers/` | "6 Offers" (live count, all statuses) |
| Refresh Button | `button:has-text('Refresh')` | Reloads table from server |
| Add New Offer Button | `button:has-text('Add New Offer')` | Opens Add drawer |

### 2.2 Offers Table

| Column | Position | Data Type | Notes |
|--------|----------|-----------|-------|
| Sr.no | 0 | Integer | DB primary key — non-contiguous (1,3,7,8,9,10) |
| Offer Name | 1 | Text | Free-text, max 100 chars |
| Description | 2 | Text | Free-text, max 500 chars; optional |
| Amount | 3 | Currency | Formatted as "₹ X,XX,XXX" |
| Percentage | 4 | Numeric or "-" | Always "-" when offer type is Amount Based |
| Start Date | 5 | Date | DD MMM YYYY format (e.g. "13 Apr 2026") |
| End Date | 6 | Date | DD MMM YYYY format |
| Created By | 7 | Text | Display name of creating admin |
| Action | 8 | Controls | Toggle switch + Edit button + Delete button |

**Table Selectors:**
- Headers: `table thead th`
- Body rows: `table tbody tr`
- Toggle switch: `.ant-switch` (per row)
- Edit button: `button:has(img[alt='edit'])`
- Delete button: `button:has(img[alt='delete'])`

### 2.3 Pagination

- Selector: `.ant-pagination`
- Shows 1 page (6 offers fit on one page in UAT)
- Previous button: disabled when on page 1
- Next button: disabled when on last page

---

## 3. Observed UAT Data (2026-05-08)

| Sr.No | Offer Name | Description | Amount | Status |
|-------|-----------|-------------|--------|--------|
| 10 | VK test | Booking | ₹ 10,000 | OFF |
| 9 | VC request | 2 bed peak home offer | ₹ 75,000 | ON |
| 8 | VC request | 2 bed rise home offer | ₹ 75,000 | ON |
| 7 | VC request | 2 Bed Growth Home | ₹ 75,000 | ON |
| 3 | VC request | 1 Bed Growth Home | ₹ 50,000 | ON |
| 1 | Home Loan Discount | Home Loan Discount | ₹ 10,000 | OFF |

**Baseline count:** 6 Offers

---

## 4. Add New Offer Drawer

**Trigger:** Click "Add New Offer" button
**Component:** Ant Design Drawer (`.ant-drawer-body`) — NOT a centered modal
**Drawer title:** "Add New Offer"

### 4.1 Form Fields

| Field | Required | Selector | Type | Constraints |
|-------|----------|----------|------|-------------|
| Offer Name | Yes | `input[placeholder='Please enter offer name']` | Text input | Max 100 chars; character counter "X / 100" |
| Offer Type | Yes | `.ant-radio-button-wrapper` | Radio group | Amount Based (default) / Percentage Based — mutually exclusive |
| Amount | Yes (if Amount Based) | `input[placeholder='Please enter amount'], .ant-input-number-input` | Spinbutton | Positive integer INR; rendered with ₹ prefix in display |
| Description | No | `textarea[placeholder='Please enter description']` | Textarea | Max 500 chars; character counter "X / 500" |
| Offer Validity | Yes | `input[placeholder='Start date']` / `input[placeholder='End date']` | Date range picker | Start must be ≤ End |
| Select Typology | No | `.ant-drawer-body .ant-select-selector` | Multi-select dropdown | Optional; when empty = all typologies |

### 4.2 Typology Options (confirmed from live portal)

- 1 Bed Growth Home
- 2 Bed Growth Home
- 2 Bed Peak Home
- 2 Bed Rise Home

### 4.3 Drawer Buttons

| Button | Selector | Behavior |
|--------|----------|----------|
| Cancel | `button:has-text('Cancel')` | Closes drawer; discards unsaved input |
| Create Offer | `button:has-text('Create Offer')` | Submits form; validates required fields |
| Close (X) | `.ant-drawer-close` | Same as Cancel |

### 4.4 Validation Behavior

- Required fields show inline error messages on empty submit
- "Offer Type" defaults to "Amount Based"
- Date range enforces chronological ordering (Start ≤ End)

---

## 5. Edit Offer Drawer

**Trigger:** Click edit button (pencil icon) on any row
**Component:** Ant Design Drawer (same container as Add)
**Drawer title:** "Edit Offer"

### 5.1 Pre-fill Behavior

All existing field values are pre-populated when drawer opens:
- Offer Name: filled with current name + character counter showing current length
- Offer Type: radio pre-selected
- Amount: spinbutton shows current amount (e.g. "₹ 10,000")
- Description: filled with current description
- Start/End dates: filled with current validity dates
- Typology: current selections shown

### 5.2 Edit Buttons

| Button | Selector | Behavior |
|--------|----------|----------|
| Cancel | `button:has-text('Cancel')` | Closes drawer; discards changes |
| Update Offer | `button:has-text('Update Offer')` | Submits changes |

---

## 6. Toggle ON/OFF

- **Selector:** `.ant-switch` (one per row)
- **Checked/ON state:** `aria-checked="true"` or class `.ant-switch-checked`
- **Unchecked/OFF state:** `aria-checked="false"` or no checked class
- **Behavior:** Immediate flip on click — NO confirmation dialog
- **Business impact:** Toggling OFF an active offer immediately removes it from customer-facing pricing. HIGH RISK — accidental toggle during live booking campaign can impact mid-booking customers.

---

## 7. Delete Offer

- **Trigger:** Click delete button (trash icon) per row
- **Selector:** `button:has([aria-label='delete'])` (Ant Design anticon span — NOT img alt)
- **Confirmation dialog:** CONFIRMED — dialog appears with title "Are you sure you want to delete this offer?" and body "This action cannot be undone."
- **Dialog buttons:** "Cancel" | "Yes, delete"
- **Result:** Offer removed from list; count badge decrements; Sr.No gap left (hard delete confirmed)
- **CLARIFICATION-OFFERS-005:** RESOLVED — confirmation dialog is present; button text is "Yes, delete"

---

## 8. Business Flows

### 8.1 Create Offer Flow
```
Admin → Add New Offer button
  → Drawer opens (Add New Offer)
  → Fill: Offer Name (required) + Offer Type (required) + Amount (required for Amount Based)
          + Description (optional) + Date Range (required) + Typology (optional)
  → Click "Create Offer"
  → Success: Drawer closes; offer appears in table; count badge increments
  → Failure: Inline validation errors; drawer stays open
```

### 8.2 Edit Offer Flow
```
Admin → Edit button (pencil icon) on row
  → Drawer opens (Edit Offer) — all fields pre-filled
  → Modify desired fields
  → Click "Update Offer"
  → Success: Drawer closes; table row reflects updated values
  → Failure: Inline validation errors; drawer stays open
```

### 8.3 Toggle Flow
```
Admin → Click toggle switch on row
  → Toggle state flips immediately (no dialog)
  → ON = offer active in pricing / OFF = offer inactive
```

### 8.4 Refresh Flow
```
Admin → Click "Refresh"
  → Table reloads from server
  → No state change to offers
```

---

## 9. Integration Points

| Module | Relationship |
|--------|-------------|
| Allocation | Active offers applied as line-item discounts on unit selection detail panel |
| Towers/Units | Typology scoping links offer to specific unit types |
| Customers | Customer sees offer discounts on cost sheet |

---

## 10. Domain Red Flags

| Flag | Severity | Description |
|------|----------|-------------|
| No toggle confirmation | HIGH | Admin can accidentally deactivate active offer mid-campaign |
| Pricing mid-booking | HIGH | No confirmed behavior when offer is toggled OFF during active customer booking |
| Non-contiguous Sr.No | INFO | Sr.No values are DB IDs (hard deletes confirmed by gaps 2,4,5,6 missing) |

---

## 11. Open Clarifications

| ID | Question | Status |
|----|----------|--------|
| CLARIFICATION-OFFERS-001 | Is there a planned search/filter on offers list? | OPEN |
| CLARIFICATION-OFFERS-002 | Is Offer Name required to be unique? | OPEN (multiple "VC request" rows suggests NO) |
| CLARIFICATION-OFFERS-003 | Does toggling OFF mid-allocation re-price customer's active selection? | OPEN |
| CLARIFICATION-OFFERS-005 | Does delete show a confirmation dialog? | OPEN |

---

## 12. Clarification Log

| Date | ID | Resolution |
|------|----|-----------|
| 2026-05-08 | CLARIFICATION-OFFERS-005 | Delete shows confirmation dialog: "Are you sure you want to delete this offer? / This action cannot be undone." Buttons: Cancel | Yes, delete |
