# BRD: Sales Managers

**Module:** Sales Managers  
**URL:** `https://uat-web.xrportal.in/admin/sales-managers`  
**Sprint:** TBD  
**Author:** BA Agent  
**Created:** 2026-05-08  
**Status:** Draft

---

## 1. Purpose

The Sales Managers module allows administrators to manage the sales force that operates within the XR Portal. Sales Managers are internal users who can access a separate sales portal to view inventory, manage customer interactions, and drive bookings. This module covers the full lifecycle of a Sales Manager account: creation, editing, role assignment, active/inactive status, and assignability control. It also includes system-level privacy settings (data masking) that control what Sales Managers can see in their portal view.

**Business intent:** Maintain a governed, role-based sales team with configurable privacy controls, ensuring that customer PII (phone, email) and unit pricing can be selectively hidden from sales staff based on operational policy.

---

## 2. Screens & Navigation

### 2.1 Navigation Path

Left sidebar → "Managers" (solution/person icon) → `/admin/sales-managers`

### 2.2 Screen: Sales Managers List (`/admin/sales-managers`)

**Page Header:**
- Heading: "Sales Managers"
- Counter: "26 Sales Managers" (total count)
- Search box: "Search by name, email, or phone" (text input, left of action buttons)
- Buttons: Settings | Add Sales Manager

**Sales Managers Table:**

| Column | Filterable | Description |
|--------|-----------|-------------|
| First Name | No | First name of the sales manager |
| Last Name | No | Last name (observed as blank in many UAT records) |
| Email | No | Email address |
| Phone | No | 10-digit mobile number |
| Role | Yes (filter icon) | Role label: "Sales Manager" observed; other roles possible |
| Assignable | Yes (filter icon) | "Yes" or "No" — whether this SM can be assigned to customers |
| Is Active | Yes (filter icon) | "Active" or "Inactive" — account status |
| Created At | No | Creation timestamp (format: DD MMM YYYY, HH:MM) |
| Actions | No | "Edit" button only |

**Pagination:** 26 records across 3 pages (10 per page default).

**Observed data sample (UAT, 2026-05-08):**

| First Name | Email | Phone | Role | Assignable | Is Active | Created At |
|-----------|-------|-------|------|-----------|----------|------------|
| Load Test SM #10 | apps@xde.ai | 1111113120 | Sales Manager | Yes | Active | 08 May 2026, 15:25 |
| Load Test SM #9 | apps@xde.ai | 1111113119 | Sales Manager | Yes | Active | 08 May 2026, 15:25 |
| Load Test SM #1 | apps@xde.ai | 1111113111 | Sales Manager | Yes | Active | 08 May 2026, 15:25 |

> Note: "Load Test SM #N" records are test data seeded for load testing. Real SM records also exist on UAT (not shown above). Multiple SMs can share the same email address (apps@xde.ai) — this is notable; typically email is unique. CLARIFICATION required.

---

## 3. Key Entities & Data Fields

### 3.1 Sales Manager Entity

| Field | Required | Type | Constraints | Notes |
|-------|----------|------|-------------|-------|
| First Name | Yes | Text | Non-empty | Displayed in table as the primary identifier |
| Last Name | Yes | Text | Non-empty | Observed blank in UAT test data — may be required at form level but skipped in load test seeding |
| Email | Yes | Email | Valid email format | Multiple SMs observed sharing same email — uniqueness unclear |
| Phone | Yes | Tel | 10 digits | Displayed in table; used for search |
| Role | Yes | Dropdown | Observed value: "Sales Manager" | Other roles may exist — not enumerated on UAT |
| Assignable | No | Toggle switch | Default: ON (Yes) | Controls whether SM appears in customer assignment dropdowns |
| Is Active | No | Toggle switch | Default: ON (Active) | Controls login access to sales portal |

### 3.2 Settings Entity (System-Level)

| Setting | Type | Description | Scope |
|---------|------|-------------|-------|
| Email Masking | Toggle (ON/OFF) | Masks customer email addresses in sales managers portal | System-wide |
| Phone Masking | Toggle (ON/OFF) | Masks customer phone numbers in sales managers portal | System-wide |
| Cost Masking | Toggle (ON/OFF) | Masks unit cost in sales managers portal | System-wide |

> Domain Note: All three masking settings apply to the sales manager's VIEW of customer/unit data, not to the admin portal. Changes here affect all sales managers simultaneously — there is no per-SM masking configuration.

---

## 4. Business Workflows

### 4.1 Create Sales Manager

```
Admin clicks "Add Sales Manager"
    → Modal opens: "Add Sales Manager"
    → Admin fills: First Name (required) + Last Name (required) + Email (required) + Phone (required)
                   + Role (required dropdown) + Assignable toggle (default ON) + Is Active toggle (default ON)
    → Admin clicks "Create"
    → On success: Modal closes; new SM appears in list; counter increments
    → On validation fail: Inline errors; modal stays open
```

**Buttons in modal:** Create | Cancel

### 4.2 Edit Sales Manager

```
Admin clicks "Edit" button on any SM row
    → Modal opens: "Edit Sales Manager" — all fields pre-filled
    → Admin modifies desired fields
    → Admin clicks "Update"
    → On success: Modal closes; table row reflects updated values
    → On validation fail: Inline errors; modal stays open
```

**Buttons in modal:** Update | Cancel

> Note: There is NO delete button visible on the list. Sales Managers can only be deactivated (Is Active = OFF), not deleted. This is the correct pattern for referential integrity — deleted SMs may have historical bookings.

### 4.3 Search Sales Manager

```
Admin types in search box "Search by name, email, or phone"
    → Table filters in real-time (or on Enter — requires testing)
    → Matches on First Name, Last Name, Email, and Phone fields
```

### 4.4 Filter by Column

```
Admin clicks filter icon on Role / Assignable / Is Active column headers
    → Dropdown of filter options appears
    → Single or multi-select (TBD — not tested on UAT)
    → Table updates to show matching rows only
```

### 4.5 Configure Privacy Settings

```
Admin clicks "Settings" button
    → Modal opens: "Settings"
    → Three toggle rows: Email Masking | Phone Masking | Cost Masking
    → Each toggle: ON (masking active) / OFF (data visible in sales portal)
    → No explicit Save button observed — may auto-save on toggle (CLARIFICATION needed)
```

> Domain Red Flag: Cost Masking toggle controls whether sales managers can see unit pricing. If accidentally toggled OFF, all SMs can see unit cost — this may be a data sensitivity issue. Confirm if there's an audit log for settings changes.

### 4.6 Bulk Upload via CMS

The CMS page (`/admin/cms`) has a "Sales Managers" section with:
- Sample File Download
- Upload File (XLSX/CSV)
- Submit

This suggests bulk creation of Sales Managers via CSV. The format of the sample file is not yet confirmed.

---

## 5. Filters & Search Capabilities

| Capability | Type | Fields |
|-----------|------|--------|
| Free-text search | Text input | Name, Email, Phone |
| Role filter | Column header filter | Role values (e.g., Sales Manager, Admin?) |
| Assignable filter | Column header filter | Yes / No |
| Is Active filter | Column header filter | Active / Inactive |

---

## 6. KPIs / Dashboard Metrics

- **SM count badge:** Total count displayed below search bar (e.g., "26 Sales Managers")
- No chart or KPI cards on this page

---

## 7. Integration Points

| Integrated Module | Relationship |
|-------------------|-------------|
| Customers | Sales Managers are assigned to customers for lead/sales tracking. "Assignable = Yes" means SM appears in customer assignment dropdowns |
| Config/CMS | Bulk SM creation via CSV upload in CMS → Sales Managers section |
| Sales Portal (external) | SMs log into a separate customer-facing sales portal. The masking settings here control their data visibility there |
| Channel Partners | Relationship between SM roles and channel partner accounts unclear — CLARIFICATION needed |

---

## 8. Acceptance Criteria (High-Level)

### AC-SM-001: List Page
- Sales Managers list loads within 3 seconds
- All 26 SMs across 3 pages render correctly
- Counter "26 Sales Managers" displayed below search bar
- Pagination (10 per page) works correctly across all pages

### AC-SM-002: Search
- Search by name (partial match) filters table correctly
- Search by email returns matching SM rows
- Search by phone returns matching SM rows
- Empty search returns all records
- Case-insensitive search expected

### AC-SM-003: Column Filters
- Role filter shows distinct role values; single selection filters table
- Assignable filter options: Yes / No
- Is Active filter options: Active / Inactive
- Combined filters (Role + Is Active) work correctly together

### AC-SM-004: Create Sales Manager
- "Add Sales Manager" modal opens on button click
- All required fields (First Name, Last Name, Email, Phone, Role) show validation errors on empty submit
- Phone field enforces 10-digit format
- Email field enforces valid email format
- Successful creation shows new SM in table; counter increments
- Cancel discards all inputs

### AC-SM-005: Edit Sales Manager
- Edit modal pre-fills all existing values
- Assignable toggle state accurately reflects current record
- Is Active toggle state accurately reflects current record
- Successful update reflects in table row immediately
- Cannot delete a SM — no delete button present

### AC-SM-006: Settings / Privacy Masking
- Settings modal opens on "Settings" button click
- Three masking toggles are independently controllable
- Toggle state persists after modal close (settings are saved)
- Changes to masking affect sales portal display (cross-portal verification — may be out of UAT scope)

### AC-SM-007: Bulk Upload (CMS)
- Sample CSV downloads with correct column headers
- Valid CSV upload creates/updates SM records
- Invalid CSV rows show appropriate error messages

---

## 9. Out of Scope / UAT Limitations

1. **Sales Portal verification:** Whether masking settings actually apply in the sales manager's portal requires a separate login to the sales portal — this is a cross-portal integration test that may be limited in UAT.
2. **Role values:** The full list of Role dropdown values beyond "Sales Manager" is unknown. Other roles (e.g., Sales Admin, Sales Lead) may exist.
3. **SM-to-Customer assignment:** Testing the full flow from SM creation through assignment to a customer requires the customer assignment workflow — documented in Customers module.
4. **Bulk upload CSV format:** The column headers for SM bulk upload via CMS are not confirmed without downloading the sample file.
5. **Audit trail:** Whether SM create/edit/toggle actions are audit-logged is not confirmed.

### Open Clarifications

| ID | Question | Impact |
|----|----------|--------|
| CLARIFICATION-SM-001 | Is Email unique per Sales Manager, or can multiple SMs share the same email? (UAT data shows duplicates) | Validation test case |
| CLARIFICATION-SM-002 | Does the Settings modal auto-save on toggle, or is there a Save/Update button? | Settings test case |
| CLARIFICATION-SM-003 | What are all available Role values in the Role dropdown? | Test data |
| CLARIFICATION-SM-004 | Is there a relationship between Sales Managers here and Channel Partners — can a CP also be a SM? | Integration test scope |
| CLARIFICATION-SM-005 | What are the column headers in the SM bulk upload CSV sample file? | Bulk upload test cases |
| CLARIFICATION-SM-006 | Are SM settings changes (masking) recorded in an audit log? | Security test |
