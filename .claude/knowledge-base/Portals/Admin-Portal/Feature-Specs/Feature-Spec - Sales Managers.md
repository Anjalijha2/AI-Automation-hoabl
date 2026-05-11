---
type: feature-spec
portal: Admin Portal
module: Sales Managers
updated: 2026-05-11
status: complete
---

# Admin Portal — Sales Managers Module Feature Specifications

**Two surfaces:**
- **Surface 1:** `/admin/cms` → Section 7 — Bulk CSV upload (see also Config CMS spec, Feature 7)
- **Surface 2:** `/admin/sales-managers` — Standalone list page with search, filters, add/edit modal, and settings

---

# Feature 1: View Sales Manager List

## 1. Objective
Provide admins a paginated, searchable list of all sales manager accounts with their role, availability, and active status visible at a glance.

## 2. Scope
Full-page view at `/admin/sales-managers`. No sub-navigation.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Page heading: "Sales Managers"
- Live count badge: "26 Sales Managers" (reflects total in system)
- Search input in header
- "Settings" button
- "Add Sales Manager" button
- Paginated table (10 per page default)

## 5. Table Columns

| Column | Filterable | Notes |
|--------|-----------|-------|
| First Name | No | — |
| Last Name | No | — |
| Email | No | — |
| Phone | No | — |
| Role | Yes (column filter) | e.g. Sales Manager |
| Assignable | Yes (column filter) | Whether SM appears in customer assignment dropdowns |
| Is Active | Yes (column filter) | Whether SM can log in to sales portal |
| Created At | No | Account creation date |
| Actions | No | Edit button only — no delete |

**Pagination:** 26 records across 3 pages, 10 records per page.

## 6. Validations & Business Rules
1. Total count badge reflects all SM records, not a filtered count.
2. No delete operation — SMs are deactivated (Is Active = OFF) rather than deleted.

## 7. System Actions
- `GET /api/v1/admin/sales-managers` with `page`, `limit`, `search`, `role`, `isAvailable`, `isActive` query params.

## 8. Notifications
None.

## 9. Audit & Logging
- Page access logged with admin user ID and timestamp.

## How to Use

1. **Navigate to Sales Managers:** Go to `/admin/sales-managers` from the left sidebar.
2. **View the list:** All sales manager accounts are shown in a paginated table with name, email, phone, role, assignable status, and active status.
3. **Check key columns:**
   - **Assignable:** YES means this SM appears in customer assignment dropdowns. NO means buyers and admins cannot assign this SM to registrations.
   - **Is Active:** YES means this SM can log in to the sales portal. NO means their login is disabled.
4. **Navigate pages:** Use the pagination controls at the bottom to browse through all SM records (10 per page by default).

---

# Feature 2: Search Sales Managers

## 1. Objective
Allow admins to quickly locate sales managers by name, email, or phone number using free-text search.

## 2. Scope
Search input in the Sales Managers page header.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Search input field in the header area.

## 5. Behaviour

| Input | Matches Against |
|-------|----------------|
| Free text | First Name, Last Name, Email, Phone (partial match, server-side) |

- Results update the table on Enter / input change.
- Total count badge does NOT update to reflect search result count — it always shows the total system count.

## 6. Validations & Business Rules
1. Search is server-side — no client-side filtering.
2. Reset: clear the search input to restore the full list.

## 7. System Actions
- `GET /api/v1/admin/sales-managers?search=<term>` — server filters and returns matching records.

## 8. Notifications
None.

## 9. Audit & Logging
None for search queries.

## How to Use

1. **Click the search input** in the Sales Managers page header.
2. **Type a name, email, or phone number** (partial match is supported — e.g., type "Raj" to find "Rajesh Kumar").
3. **Press Enter or wait:** The table updates to show only matching Sales Managers.
4. **Clear to reset:** Delete the search text to restore the full list.

---

# Feature 3: Filter by Column

## 1. Objective
Allow admins to filter the SM list by Role, Assignable status, or Active status to quickly identify subsets of the sales force.

## 2. Scope
Column filter icons on applicable columns in the SM table.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Column filter icons (funnel/dropdown) on Role, Assignable, and Is Active columns.

## 5. Filter Details

| Column | Filter Values |
|--------|-------------|
| Role | Sales Manager (and any additional roles) |
| Assignable | Yes / No (maps to IS_AVAILABLE 1/0) |
| Is Active | Yes / No (maps to IS_ACTIVE 1/0) |

## 6. Validations & Business Rules
1. Filters can be combined with free-text search.
2. Clear filter to restore unfiltered view.

## 7. System Actions
- `GET /api/v1/admin/sales-managers?role=<value>&isAvailable=<1|0>&isActive=<1|0>`

## 8. Notifications
None.

## 9. Audit & Logging
None for filter queries.

## How to Use

1. **Click the filter icon** (funnel) on the Role, Assignable, or Is Active column header.
2. **Select a filter value** from the dropdown:
   - Role: "Sales Manager" (or other roles if configured)
   - Assignable: "Yes" (SMs in dropdowns) or "No" (SMs hidden from dropdowns)
   - Is Active: "Yes" (can log in) or "No" (login disabled)
3. **Combine filters:** Apply multiple column filters at once, or combine with the search input for more specific results.
4. **Clear filter:** Click the filter icon again and select "All" or clear the selection to remove the filter.

---

# Feature 4: Add Sales Manager

## 1. Objective
Allow admins to create a new Sales Manager account directly through the portal UI, without requiring a bulk upload.

## 2. Scope
"Add Sales Manager" button in the page header opens a modal form.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Add Sales Manager" button in page header.
- Clicking opens a modal form.

## 5. Form Details

| Field | Type | Mandatory | Notes |
|-------|------|-----------|-------|
| First Name | Text | Yes | Primary display name |
| Last Name | Text | Yes | May be blank in test data |
| Email | Email | Yes | Uniqueness enforcement unclear — verify with development team |
| Phone | Tel | Yes | 10-digit mobile number |
| Role | Dropdown | Yes | "Sales Manager" (default; full value list to confirm) |
| Assignable | Toggle | No | Default ON — controls visibility in customer assignment dropdowns |
| Is Active | Toggle | No | Default ON — controls SM login access to sales portal |

**Buttons:**
- "Submit" — creates the SM record
- "Cancel" — closes modal, discards input

## 6. Validations & Business Rules
1. First Name, Last Name, Email, Phone, and Role are mandatory.
2. Phone must be 10 digits.
3. `Assignable = ON`: SM appears in customer assignment dropdowns system-wide.
4. `Is Active = ON`: SM can log in to the sales portal.
5. New SM created via modal has the same effect as a bulk upload row with `IS_AVAILABLE=1 IS_ACTIVE=1`.

## 7. System Actions on Submit
1. `POST /api/v1/admin/sales-managers/create` with SM details.
2. New User record created with SM role.
3. SM appears in the list immediately.
4. Count badge increments.

## 8. Notifications
- Kaleyra SMS to new SM: account created with portal login instructions (if configured).

## 9. Audit & Logging
- Admin user ID, SM name, phone, email, role, assignable/active flags, creation timestamp logged.

## How to Use

1. **Click "Add Sales Manager"** in the page header.
2. **Fill in the form:**
   - **First Name and Last Name:** The SM's full name.
   - **Email:** The SM's email address.
   - **Phone:** 10-digit mobile number (used for login OTP).
   - **Role:** Select "Sales Manager" from the dropdown.
   - **Assignable (toggle):** Keep ON if this SM should appear in customer assignment dropdowns. Turn OFF to hide them from all dropdown selections.
   - **Is Active (toggle):** Keep ON to allow this SM to log in to the sales portal. Turn OFF to disable login.
3. **Click "Submit":** The new SM account is created immediately and appears in the list.
4. **Result:** The SM can log in to the sales portal using their registered mobile number. If Assignable is ON, they appear in customer assignment dropdowns across the system.

---

# Feature 5: Edit Sales Manager

## 1. Objective
Allow admins to update the details, availability, or active status of an existing Sales Manager.

## 2. Scope
Edit button (pencil icon) in the Actions column of each SM row.

## 3. Eligibility / Preconditions
- SM record must exist.
- Admin session required.

## 4. UI Changes
- Edit button on each SM row.
- Clicking opens a modal with the same fields as Add SM, pre-filled with current values.

## 5. Form Details
Same fields as Feature 4 (Add Sales Manager), all pre-filled with existing SM data.

**Buttons:**
- "Update" — saves changes
- "Cancel" — closes modal, discards changes

## 6. Validations & Business Rules
1. Same mandatory field rules as Add SM.
2. Setting `Assignable = OFF` immediately removes the SM from all customer assignment dropdowns system-wide — no per-customer reassignment happens automatically.
3. Setting `Is Active = OFF` immediately disables the SM's login to the sales portal (soft deactivation — record is NOT deleted).

> **Risk:** Setting Assignable = OFF for an SM who is actively assigned to customers will remove them from all future dropdown selections system-wide. Existing customer-SM relationships are not automatically reassigned.

## 7. System Actions on Submit
1. `PUT /api/v1/admin/sales-managers/update/:id` with updated fields.
2. SM record updated immediately.
3. If `isAvailable` changed to 0: SM removed from customer assignment dropdowns immediately across all active sessions.
4. If `isActive` changed to 0: SM login session invalidated; SM cannot log in until re-activated.

## 8. Notifications
None — no notification sent to SM on account changes.

## 9. Audit & Logging
- Admin user ID, SM ID, changed fields, update timestamp logged.

## How to Use

1. **Find the SM row** in the Sales Managers table.
2. **Click the edit (pencil) icon** in the Actions column. The Edit modal opens with all current values pre-filled.
3. **Update any field:** Change name, email, phone, or toggle Assignable / Is Active as needed.
4. **Click "Update"** to save.
5. **Result:**
   - If **Assignable** is turned OFF: The SM is immediately removed from all customer assignment dropdowns across the system.
   - If **Is Active** is turned OFF: The SM's sales portal login is disabled immediately.

> **Note:** Turning Assignable OFF does not automatically reassign existing customers to another SM — this must be done manually.

---

# Feature 6: Privacy Masking Settings

## 1. Objective
Allow admins to control whether email addresses, phone numbers, and unit pricing data are masked (hidden) from all Sales Managers when they access the sales portal, protecting PII and commercial data.

## 2. Scope
"Settings" button in the Sales Managers page header opens a modal with three system-wide masking toggles.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Settings" button in page header.
- Clicking opens "Settings" modal with three toggle controls.

## 5. Form Details

| Toggle | Controls | Applies To |
|--------|---------|-----------|
| Email Masking | ON = email addresses hidden from SMs | All Sales Managers system-wide |
| Phone Masking | ON = phone numbers hidden from SMs | All Sales Managers system-wide |
| Cost Masking | ON = unit pricing data hidden from SMs | All Sales Managers system-wide |

**Scope:** System-wide — no per-SM masking granularity. One toggle affects every SM simultaneously.

## 6. Validations & Business Rules
1. All masking toggles apply to **all** Sales Managers at once — there is no per-SM masking configuration.
2. Changes take effect immediately across all active SM portal sessions.
3. Whether the modal auto-saves on toggle or requires an explicit Save/Update button click: confirm with development team before testing.

> **Risk:** Accidentally toggling Cost Masking OFF exposes unit pricing data to ALL sales managers simultaneously. Confirm the correct save mechanism before operating in a live environment.

## 7. System Actions on Save
1. Masking configuration updated in system settings.
2. All SM portal sessions immediately reflect the new masking state on next data load.

## 8. Notifications
None — no SM notification when masking settings change.

## 9. Audit & Logging
- Admin user ID, which masking toggle changed (Email / Phone / Cost), new state (ON/OFF), timestamp logged.

## How to Use

1. **Click "Settings"** in the Sales Managers page header.
2. **Review the three masking toggles:**
   - **Email Masking ON:** All SMs see email addresses as masked/hidden in their sales portal.
   - **Phone Masking ON:** All SMs see phone numbers as masked/hidden.
   - **Cost Masking ON:** All SMs see unit pricing data as masked/hidden.
3. **Toggle as needed:** Flip the relevant toggle to ON (mask) or OFF (show).
4. **Save:** Click the Save/Update button (confirm with your team whether toggles auto-save or require explicit save).
5. **Result:** Changes take effect immediately across all active SM portal sessions.

> **Warning:** These toggles apply to ALL Sales Managers simultaneously — there is no per-SM setting. Turning Cost Masking OFF immediately exposes pricing to every SM in the system.

---

# Feature 7: Bulk SM Upload (via Config CMS)

> **Note:** This feature is also documented in the Config CMS module spec (Feature 7). It is referenced here for completeness since it is the primary mechanism for provisioning multiple SMs at once.

## 1. Objective
Allow admins to create or update multiple Sales Manager accounts in one operation by uploading an Excel file.

## 2. Scope
Config page (`/admin/cms`) → Section 7 "Sales Managers".

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Sample File Download" button
- "Upload File" input (accepts .xlsx)
- "Submit" button

## 5. XLSX Format

| Column | Values | Description |
|--------|--------|-------------|
| Role | `Sales Manager` | Fixed value |
| First Name | Text | SM's first name |
| Last Name | Text | SM's last name |
| Email | Email | SM's email address |
| Phone | 10-digit number | **Merge key** — matches existing records |
| IS_AVAILABLE | `1` / `0` | 1 = SM in customer assignment dropdowns; 0 = hidden |
| IS_ACTIVE | `1` / `0` | 1 = SM can log in to sales portal; 0 = login disabled |

**Merge key:** Phone number — if an existing SM matches by phone, the record is UPDATED; otherwise a new SM account is CREATED.

## 6. Validations & Business Rules
1. Phone number is mandatory and is the unique merge key.
2. Invalid rows (malformed phone, missing fields) are flagged in the result.
3. `IS_AVAILABLE = 0` takes effect immediately — SM removed from all customer dropdowns system-wide.
4. `IS_ACTIVE = 0` takes effect immediately — SM login access disabled.

## 7. System Actions on Submit
1. Download sample: `GET /api/v1/admin/sales-manager-sample`
2. Upload: `POST /api/v1/admin/sales-managers-import` (multipart/form-data, field: `doc`)
3. Each row: upsert User record with SM role.
4. IS_AVAILABLE and IS_ACTIVE flags applied immediately.

## 8. Notifications
- Kaleyra SMS to newly-created SMs: account created with portal login instructions (if configured).

## 9. Audit & Logging
- Admin user ID, filename, SMs created/updated count, timestamp logged.

## How to Use

1. **Navigate to Config CMS:** Go to `/admin/cms` from the left sidebar.
2. **Find Section 7 "Sales Managers"** by scrolling down the Config page.
3. **Download the sample file:** Click "Sample File Download" to get the correctly formatted XLSX template.
4. **Fill in the Excel file:**
   - Add one row per Sales Manager.
   - Enter Role = "Sales Manager" (fixed), First Name, Last Name, Email, Phone (10 digits — this is the merge key).
   - Set IS_AVAILABLE = 1 (appears in dropdowns) or 0 (hidden).
   - Set IS_ACTIVE = 1 (can log in) or 0 (login disabled).
5. **Upload the file:** Click "Upload File", select your completed XLSX, then click "Submit".
6. **Result:** Each row is processed — new SMs are created, existing SMs (matched by phone) are updated. IS_AVAILABLE and IS_ACTIVE flags take effect immediately. New SMs receive an SMS with login instructions.
