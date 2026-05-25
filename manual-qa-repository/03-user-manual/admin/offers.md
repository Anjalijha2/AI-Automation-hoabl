# Admin Portal — Offers Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/offers`
**Sources:** ADMIN-BRD-Offers.md · ADMIN-FS-Offers.md
**Last Updated:** 2026-05-22

---

## Overview

The Offers module configures discount offers that are automatically applied to buyer pricing during allocation campaigns. Offers reduce the Agreement Value of units. Two offer types are supported: **Amount Based** (fixed INR discount) and **Percentage Based** (% off). Offers can target specific typologies (1-Bed / 2-Bed variants) or apply to all typologies.

Two system-generated offers exist alongside admin-created ones and are NOT created via this page:

| offerCode | Trigger |
|-----------|---------|
| `HOME_LOAN` | Created when admin approves a buyer's home loan in the Customers module |
| `VC_REQUEST` | Created when SM logs a video-call outcome of `VC_DONE_PREFERENCE` or `VC_2_DONE` |

Reach this page from the left sidebar → **Offers** → `/admin/offers`.

---

## Page Layout (At a Glance)

1. **Header** — Title "Offers Management" + count badge (active + inactive combined), Refresh, Add New Offer.
2. **Offers Table** — Sr.No, Offer Name, Description, Amount, Percentage, Start/End Date, Created By, Action (toggle / edit / delete).
3. **Add/Edit Offer Drawer** — right slide-in form.
4. **Delete Confirmation Dialog**.

---

# Feature 1 — View Offers List

### What it does
Shows all configured offers — both active and inactive — with their parameters and current ON/OFF state.

### Preconditions
- Admin session.

### How to use
1. Go to `/admin/offers`.
2. Read the table:

| Column | Notes |
|--------|-------|
| Sr.No | DB primary key — gaps indicate previously deleted offers |
| Offer Name | Free text; uniqueness NOT enforced |
| Description | Optional |
| Amount | ₹X,XX,XXX format; shows `–` for Percentage-type offers |
| Percentage | Shows `–` for Amount-type offers |
| Start Date | DD MMM YYYY |
| End Date | DD MMM YYYY |
| Created By | Admin display name |
| Action | Toggle (active/inactive) · Edit · Delete |

3. Click **Refresh** to reload data from the server.

### Result
A complete view of all offers with current status.

### Note
- API (corrected — GAP-TL-053): `GET /api/v1/admin/offers?page=&limit=&projectId=` accepts pagination params.
- The count badge in the header shows total offers (active + inactive combined).

---

# Feature 2 — Create Offer

### What it does
Defines a new discount offer with name, type, value, validity window, and optional typology scope.

### Preconditions
- Admin session.

### How to use
1. Click **Add New Offer** in the header. The drawer slides in titled **"Add New Offer"**.
2. Fill the form:

| Field | Type | Mandatory | Constraints |
|-------|------|-----------|-------------|
| Offer Name | Text | Yes | Max 100 chars; character counter shown |
| Offer Type | Radio | Yes | **Amount Based** (default) or **Percentage Based** — mutually exclusive |
| Amount | Number | Conditional | Positive integer INR (Amount Based only) |
| Percentage | Number | Conditional | 0–100 (Percentage Based only) |
| Description | Textarea | No | Max 500 chars |
| Offer Validity Start Date | Date picker | Yes | Must be ≤ End Date |
| Offer Validity End Date | Date picker | Yes | Must be ≥ Start Date |
| Select Typology | Single-select | No | Empty = applies to ALL typologies |

3. Click **Create Offer** (or Cancel to discard).

### Result
- `POST /api/v1/admin/offers` creates the record with `isActive = true` by default.
- Offer appears immediately in the table and the count badge increments.

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Offer Name empty | Form validation error |
| Offer Type not chosen | Required |
| Start Date > End Date | Rejected at the validator middleware |
| Amount missing on Amount Based | Required |
| Percentage outside 0–100 | Rejected |

### Warning — corrected (GAP-TL-054)
The **Select Typology** field is a **single scalar `unitTypologyId`**, not a multi-select, despite earlier doc wording. To target multiple typologies, create multiple offers — one per typology.

### Warning — `offerCode` is admin-settable (GAP-TL-055)
The backend reads `offerCode` straight from request body with **no whitelist** (`offer.controller.js:41, 84`). An admin can deliberately or accidentally set `offerCode='HOME_LOAN'` or `'VC_REQUEST'` and the system will accept it — the FRD claim that admin-created offers always have `offerCode=NULL` is NOT enforced. Treat the system-generated codes as conventions only.

### Note — no service-layer validation (GAP-DEV-025)
`createOffer` / `editOffer` in `offer.service.js` do direct create/update with no `startDate ≤ endDate` check, no audit emission, and no null-value check at the service layer. All validation lives in the controller/validator middleware. Test date-order via the HTTP layer, not by calling the service directly.

---

# Feature 3 — Edit Offer

### What it does
Modifies an existing offer's name, type, value, validity dates, or typology scope.

### Preconditions
- Offer is not deleted.
- Admin session.

### How to use
1. Find the offer row in the table.
2. Click the **edit (pencil)** icon. The **"Edit Offer"** drawer opens with all fields pre-filled.
3. Modify the fields you want to change.
4. Click **Update Offer**.

### Result
- `PUT /api/v1/admin/offers/:id` persists the changes.
- The next live offer-eligibility query during an active campaign returns the new values — buyers see updated pricing on their next page load.

### Warning
Editing an active offer's amount or dates takes effect **immediately**. Active customer sessions may see changed pricing on next calculation. Coordinate with the sales team before mid-campaign edits.

---

# Feature 4 — Toggle Offer Active / Inactive

### What it does
Enables or disables an offer instantly. Disabled offers are excluded from live pricing calculations without being deleted.

### Preconditions
- Admin session.

### How to use
1. Locate the offer row in the table.
2. Click the **toggle switch** in the Action column:
   - **ON** (green) — offer is active; included in pricing.
   - **OFF** (grey) — offer is inactive; excluded.

### Result
- `PATCH /api/v1/admin/offers/:id/toggle` flips `isActive` atomically.
- The change takes effect across all active buyer sessions immediately.
- Already-paid buyers are NOT affected (booking is locked at the confirmed price).
- Mid-session buyers (unit viewed but not yet paid) will see the offer disappear on next price calculation.

### Warning — CRITICAL RISK
- **No confirmation dialog** — toggle flips on click.
- **Immediate live effect** during an active allocation campaign — buyers in session re-price without warning.
- **Race condition:** if an offer is toggled OFF between a buyer viewing pricing and clicking Proceed to Pay, the offer disappears from the final booking amount.

Always coordinate offer changes with your team before touching toggles during a live campaign.

### Note — no audit on toggle (GAP-DEV-024)
The service `toggleOfferStatus` does NOT emit an audit log entry. The previous FRD §9 claim that toggle is audited is incorrect — only flip-and-save is performed.

---

# Feature 5 — Delete Offer

### What it does
Permanently removes an offer from the system. Soft-delete via Sequelize paranoid is documented in FRD, but the actual service implementation calls hard `destroy()` — see Warning.

### Preconditions
- Admin session.

### How to use
1. Locate the offer row.
2. Click the **trash icon** in the Action column.
3. Confirm in the dialog:
   - Title: **"Are you sure you want to delete this offer?"**
   - Body: "This action cannot be undone."
   - Confirm: **"Yes, delete"** · Cancel: **"Cancel"**
4. Click **Yes, delete**.

### Result
- `DELETE /api/v1/admin/offers/:id`.
- Offer is removed from all eligibility queries immediately.
- Count badge decrements.
- Sr.No gaps in the table after deletion confirm IDs are not reused.

### Warnings — CRITICAL (GAP-DEV-023)
- `offer.service.js:129-140` calls `offer.destroy()` — this is a **hard delete**, not a soft-delete. No `deletedAt` is set.
- **No audit log emission** for delete.
- **No FK guard** for existing `RegistrationUnitOffer` references — hard-deleting an offer that is referenced by completed bookings may orphan downstream pricing rows.

Action: verify the offer is not currently applied to any in-progress or completed bookings before deleting. The decision is permanent.

---

## Business Rules

1. Offer activations and deactivations take effect IMMEDIATELY during active allocation campaigns.
2. **No confirmation dialog on toggle** — it flips on click.
3. Typology scope: a single typology may be set, or empty for ALL typologies.
4. Offers only apply when `startDate ≤ today ≤ endDate`.
5. **Pricing formula:** `Agreement Value − sum of all active, applicable, valid offers = All Inclusive Price`.
6. **Race condition:** offer toggled OFF between view and payment disappears from the final booking.
7. **Locked bookings:** buyers who already completed payment are NOT affected by offer changes.
8. Admin-created offers conventionally have `offerCode = NULL`; the backend does NOT enforce this.
9. Delete is hard-destroy, not soft-delete (despite FRD wording).

---

## Offer Application During Allocation

At the moment a buyer clicks **Proceed to Pay**, the system queries all offers where:
```
isActive = true
  AND startDate ≤ today
  AND endDate   ≥ today
  AND (unitTypologyId IS NULL OR matches buyer's chosen unit typology)
```
All qualifying offers are summed and deducted from Agreement Value to produce All Inclusive Price.

---

## Role Restrictions

- Admin (roleId 1) and Sales Manager Admin (roleId 4) can create, edit, toggle, and delete offers.
- No buyer-facing role can modify offers.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/offers?page=&limit=&projectId=` | Paginated offers list |
| POST | `/api/v1/admin/offers` | Create offer |
| PUT | `/api/v1/admin/offers/:id` | Edit offer |
| PATCH | `/api/v1/admin/offers/:id/toggle` | Toggle active/inactive |
| DELETE | `/api/v1/admin/offers/:id` | Hard-delete offer |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Toggle clicked but pricing in buyer session didn't change | Race / stale browser session | Buyer needs to re-load the unit detail panel |
| Created offer not applying | Date validity, typology mismatch, or `isActive=false` | Verify Start/End dates, typology scope, and toggle state |
| Pricing dropped unexpectedly | Admin set `offerCode='HOME_LOAN'` manually (no whitelist) | Audit recent offer edits — offerCode is admin-settable |
| Sr.No gaps in offers table | Previously deleted offers — IDs not reused | By design |
| Deleted offer caused downstream pricing error | Hard-delete with no FK guard (GAP-DEV-023) | Escalate to Dev; future fix should add soft-delete + FK guard |
| Toggle didn't appear in audit log | Toggle is not audited (GAP-DEV-024) | Use the offer.updatedAt timestamp as a proxy until source fix |
| Drawer field "Typology" appears multi-select but only saves one | Field is scalar in API (GAP-TL-054) | Create separate offers per typology |
