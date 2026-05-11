---
type: feature-spec
portal: Admin Portal
module: Offers
updated: 2026-05-11
status: complete
---

# Admin Portal — Offers Module Feature Specifications

---

# Feature 1: View Offers List

## 1. Objective
Provide admins a consolidated view of all discount offers configured in the system, along with their current active/inactive status and key parameters.

## 2. Scope
Single-page module at `/admin/offers`. No sub-navigation.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Page heading: "Offers Management"
- Count badge showing total number of offers (active + inactive combined)
- "Refresh" button to reload data from server
- "Add New Offer" button to open creation drawer

## 5. Table Columns

| Column | Data Type | Notes |
|--------|-----------|-------|
| Sr.No | Integer | Database primary key; non-contiguous gaps indicate previously deleted offers |
| Offer Name | Text | Free text; not required to be unique |
| Description | Text | Optional |
| Amount | Currency | Formatted as ₹X,XX,XXX; shows "–" for Percentage-type offers |
| Percentage | Numeric | Shows "–" for Amount-type offers |
| Start Date | Date | DD MMM YYYY format |
| End Date | Date | DD MMM YYYY format |
| Created By | Text | Display name of admin who created the offer |
| Action | Controls | Toggle (active/inactive) + Edit + Delete |

## How to Use

1. **Navigate to Offers:** Go to `/admin/offers` from the left sidebar.
2. **View all offers:** The table shows all offers — both active and inactive — with name, discount type, validity dates, and who created them.
3. **Check active status:** The toggle in the Action column shows whether each offer is currently ON (active) or OFF (inactive).
4. **Refresh:** Click the "Refresh" button to reload the latest data from the server.

---

# Feature 2: Create Offer

## 1. Objective
Allow admins to define a new discount offer with a name, type, amount or percentage, validity period, and optionally restrict it to specific unit typologies.

## 2. Scope
"Add New Offer" button opens a drawer panel (slides from right side of screen).

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- "Add New Offer" button in page header.
- Clicking opens a right-side drawer with title "Add New Offer".

## 5. Form Details

| Field | Type | Mandatory | Constraints |
|-------|------|-----------|-------------|
| Offer Name | Text | Yes | Maximum 100 characters; character counter displayed |
| Offer Type | Radio group | Yes | **Amount Based** (default) / Percentage Based — mutually exclusive |
| Amount | Number (spinbutton) | Conditional (Amount Based) | Positive integer, INR currency |
| Percentage | Number | Conditional (Percentage Based) | 0–100 |
| Description | Textarea | No | Maximum 500 characters |
| Offer Validity (Start Date) | Date picker | Yes | Must be ≤ End Date |
| Offer Validity (End Date) | Date picker | Yes | Must be ≥ Start Date |
| Select Typology | Multi-select | No | If empty = applies to ALL typologies; options: 1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Peak Home / 2 Bed Rise Home |

**Buttons:**
- "Create Offer" — submits form
- "Cancel" — closes drawer, discards all input

## 6. Validations & Business Rules
1. Offer Name is mandatory (max 100 characters).
2. Offer Name is NOT required to be unique — multiple offers with the same name are allowed.
3. Offer Type is mandatory and mutually exclusive — selecting one clears the other field.
4. Amount must be a positive integer when Offer Type = Amount Based.
5. Percentage must be between 0 and 100 when Offer Type = Percentage Based.
6. Start Date must be ≤ End Date.
7. Typology field is optional — empty = offer applies to all unit types.
8. All admin-created offers have `offerCode = NULL`.

**System-generated offer codes (for reference — not admin-created):**

| offerCode | Trigger |
|-----------|---------|
| `HOME_LOAN` | Automatically created when a buyer's home loan is approved |
| `VC_REQUEST` | Automatically created when SM records video call outcome = VC_DONE_PREFERENCE or VC_2_DONE |

## 7. System Actions on Submit
1. `POST /api/v1/admin/offers` with offer details.
2. New `Offer` record created with `isActive = true` (default).
3. Offer appears immediately in the offers table.
4. Count badge increments.

## 8. Notifications
None — offer creation does not notify buyers.

## 9. Audit & Logging
- Admin user ID, offer ID, offer name, amount/percentage, validity dates, typology selection, creation timestamp logged.

## How to Use

1. **Click "Add New Offer":** The "Add New Offer" drawer slides in from the right side of the screen.
2. **Enter offer name:** Type a descriptive name (up to 100 characters). For example: "Early Bird Discount Q2" or "Home Loan Special".
3. **Select offer type:** Choose "Amount Based" (fixed INR discount) or "Percentage Based" (% off). Enter the discount value in the field that appears.
4. **Set validity dates:** Pick a Start Date and End Date. The offer only applies to buyer sessions within this date range.
5. **Select typology (optional):** Choose which unit types this offer applies to (1 Bed / 2 Bed variants). Leave empty to apply to all typologies.
6. **Add description (optional):** Enter any internal notes about this offer.
7. **Click "Create Offer":** The offer is created and appears in the table immediately with Active status ON by default.

---

# Feature 3: Edit Offer

## 1. Objective
Allow admins to modify the details of an existing offer, including name, amount, validity dates, and typology scope.

## 2. Scope
Edit icon (pencil) on each row in the offers table.

## 3. Eligibility / Preconditions
- Offer must exist (not deleted).
- Admin session required.

## 4. UI Changes
- Edit icon button on each offer row.
- Clicking opens a right-side drawer with title "Edit Offer" — all fields pre-populated with current values.

## 5. Form Details
Same fields as Create Offer (see Feature 2), all pre-filled with current offer data.

**Buttons:**
- "Update Offer" — saves changes
- "Cancel" — closes drawer, discards changes

## 6. Validations & Business Rules
Same validations as Create Offer.

> **Warning:** Editing an active offer's amount or dates takes effect immediately — active customer sessions may see changed pricing.

## 7. System Actions on Submit
1. `PUT /api/v1/admin/offers/:id` with updated offer fields.
2. Offer record updated immediately.
3. Any active allocation sessions query offers live — buyers will see updated pricing on next page load.

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, offer ID, changed fields, update timestamp logged.

## How to Use

1. **Find the offer to edit:** Locate the offer row in the Offers table.
2. **Click the edit (pencil) icon:** The "Edit Offer" drawer slides in from the right with all fields pre-filled with the current values.
3. **Make changes:** Update the offer name, discount amount or percentage, validity dates, or typology scope as needed.
4. **Click "Update Offer":** Changes are saved immediately.
5. **Result:** Updated pricing is visible to buyers on their next page load during active allocation sessions.

> **Warning:** Changes to amount or dates take effect immediately — notify your team before editing offers during a live campaign.

---

# Feature 4: Toggle Offer Active / Inactive

## 1. Objective
Allow admins to enable or disable an offer without deleting it, controlling whether the offer appears as a discount during active allocation sessions.

## 2. Scope
Toggle switch in the Action column of each offer row.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Toggle switch (ON/OFF) per row in the offers table.
- State reflects current `isActive` value.

## 5. Behaviour
- Toggle flip is **immediate** — no confirmation dialog.
- UI reflects new state immediately after click.

## 6. Validations & Business Rules
1. **No confirmation dialog** — state flips and persists to server instantly.
2. **Immediate live effect:** toggling OFF during an active allocation campaign removes the offer discount from all customer unit selection panels in real-time.
3. Buyers who have already completed payment with the offer applied are NOT affected — their booking is locked at the confirmed price.
4. Buyers mid-selection (unit chosen but not yet paid) will see the offer disappear on their next price calculation.

> **CRITICAL RISK:** Accidentally toggling OFF a high-value offer (e.g., ₹75,000 VC_REQUEST discount) during a live campaign immediately re-prices all active customer sessions without warning.

## 7. System Actions on Toggle
1. `PATCH /api/v1/admin/offers/:id/toggle`
2. `Offer.isActive` flipped atomically.
3. Offer immediately excluded from / included in live offer eligibility queries.

## 8. Notifications
None — no buyer notification on offer toggle.

## 9. Audit & Logging
- Admin user ID, offer ID, toggle action (ON→OFF / OFF→ON), timestamp logged.

## How to Use

1. **Locate the offer row** in the Offers table.
2. **Click the toggle switch** in the Action column.
   - Toggle ON (green/enabled): offer is active — buyers will see the discount applied during allocation.
   - Toggle OFF (grey/disabled): offer is inactive — discount no longer shown to buyers.
3. **Result:** The change takes effect instantly across all active buyer sessions. No confirmation dialog appears.

> **Warning:** Do not toggle offers during a live allocation campaign without coordinating with your team. Turning off a discount mid-session will immediately remove it from all buyers currently selecting units.

---

# Feature 5: Delete Offer

## 1. Objective
Allow admins to permanently remove an offer from the system.

## 2. Scope
Delete icon (trash) on each row in the offers table.

## 3. Eligibility / Preconditions
- Admin session required.
- Offer must not be currently applied to active in-progress bookings (no server-side guard — admin judgement required).

## 4. UI Changes
- Delete icon on each offer row.

## 5. Confirmation Dialog

| Element | Content |
|---------|---------|
| Title | "Are you sure you want to delete this offer?" |
| Body | "This action cannot be undone." |
| Confirm | "Yes, delete" |
| Cancel | "Cancel" |

## 6. Validations & Business Rules
1. Deletion requires confirmation dialog — two clicks minimum.
2. Deletion is permanent and irreversible.
3. Sr.No gaps in the table after deletion confirm that IDs are not reused.
4. Deletion is a soft-delete (Sequelize paranoid — `deletedAt` is set, record is hidden from all queries).

## 7. System Actions on Confirm
1. `DELETE /api/v1/admin/offers/:id`
2. `Offer.deletedAt` → current timestamp (soft delete).
3. Offer removed from all eligibility queries immediately.
4. Offer count badge decrements.

## 8. Notifications
None.

## 9. Audit & Logging
- Admin user ID, offer ID, offer name, deletion timestamp logged.

## How to Use

1. **Locate the offer to delete** in the Offers table.
2. **Click the delete (trash) icon** on the offer row.
3. **Review the confirmation dialog:** The popup confirms "Are you sure you want to delete this offer?" and warns that the action cannot be undone.
4. **Click "Yes, delete"** to confirm.
5. **Result:** The offer is permanently removed from the system and no longer appears in the table. The count badge decrements. Buyers in active sessions will no longer see this offer applied to any pricing.

> **Warning:** Verify that the offer is not currently applied to any in-progress bookings before deleting. This action is irreversible.
