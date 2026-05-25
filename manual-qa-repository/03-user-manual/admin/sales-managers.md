# Admin Portal — Sales Managers Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/sales-managers` (list page) · `https://uat-web.xrportal.in/admin/cms` Section 7 (bulk upload)
**Sources:** ADMIN-BRD-Sales-Managers.md · ADMIN-FS-Sales-Managers.md
**Last Updated:** 2026-05-22

---

## Overview

The Sales Managers module manages SM accounts — the customer-facing sales team who handle buyer callbacks, video calls, and relationship management. Admins create and edit SMs, control which SMs appear in customer assignment dropdowns (**Assignable** flag), control which SMs can log in to the SM Portal (**Is Active** flag), and configure system-wide privacy masking (email / phone / cost masking) that applies to ALL SMs.

There are **two surfaces** for SM provisioning:

| Surface | Location | Best for |
|---------|----------|----------|
| Single Add modal | `/admin/sales-managers` → **Add Sales Manager** | Creating 1-2 SMs |
| Bulk Upload | `/admin/cms` Section 7 → "Sales Managers" | Many SMs at once |

Reach the standalone list from the left sidebar → **Sales Managers** → `/admin/sales-managers`.

---

## Page Layout (At a Glance)

1. **Header** — Title "Sales Managers", live count badge ("26 Sales Managers"), Search input, **Settings** button, **Add Sales Manager** button.
2. **SM Table** — paginated (10 / page default), 9 columns including Edit action.
3. **Add / Edit Modal** — form with name, contact, role, Assignable + Is Active toggles.
4. **Settings Modal** — system-wide privacy masking toggles.

---

# Feature 1 — View Sales Manager List

### What it does
Lists every SM account with their name, contact info, role, Assignable and Is Active flags, and the creation date.

### Preconditions
- Admin session.

### How to use
1. Go to `/admin/sales-managers`.
2. Read the table:

| Column | Filterable | Notes |
|--------|-----------|-------|
| First Name | No | |
| Last Name | No | |
| Email | No | |
| Phone | No | |
| Role | Yes | Typically "Sales Manager" |
| Assignable | Yes | Yes/No — does this SM appear in customer assignment dropdowns? |
| Is Active | Yes | Yes/No — can this SM log in? |
| Created At | No | |
| Actions | — | Edit button only — **no delete** |

3. Use pagination controls at the bottom (10 per page default).

### Result
A complete view of the sales force. The header count badge reflects the system total, not the filtered count.

### Note
- API: `GET /api/v1/admin/sales-managers?page=&limit=&search=&role=&isAvailable=&isActive=`.
- There is no delete operation — SMs are deactivated (Is Active = OFF), not removed.

---

# Feature 2 — Search Sales Managers

### What it does
Free-text search across First Name, Last Name, Email, and Phone.

### Preconditions
- Admin session.

### How to use
1. Click the **Search** input in the header.
2. Type a name / email / phone (partial match supported; e.g., "Raj" finds "Rajesh Kumar").
3. Press Enter or wait — the table updates (server-side filter).
4. Clear the input to restore the full list.

### Result
Only matching SMs appear. The header count badge stays at the system total — it does not reflect search-result count.

### Note
API: `GET /api/v1/admin/sales-managers?search=<term>`.

---

# Feature 3 — Filter by Column

### What it does
Filter the SM list by Role, Assignable, or Is Active.

### How to use
1. Click the **funnel icon** in the Role, Assignable, or Is Active column header.
2. Select a value:
   - Role: "Sales Manager" (and any additional configured roles)
   - Assignable: **Yes** (IS_AVAILABLE=1) or **No** (IS_AVAILABLE=0)
   - Is Active: **Yes** (IS_ACTIVE=1) or **No** (IS_ACTIVE=0)
3. Combine filters with the free-text search to narrow further.
4. Clear the filter to restore the unfiltered view.

### Result
A focused subset for quickly identifying e.g. all inactive SMs or all SMs hidden from dropdowns.

### Note
API: `GET /api/v1/admin/sales-managers?role=&isAvailable=&isActive=`.

---

# Feature 4 — Add Sales Manager (single)

### What it does
Creates a new SM account through a modal form (alternative to bulk upload for one-off cases).

### Preconditions
- Admin session.

### How to use
1. Click **Add Sales Manager** in the header. The Add modal opens.
2. Fill the form:

| Field | Mandatory | Notes |
|-------|-----------|-------|
| First Name | Yes | Primary display name |
| Last Name | Yes | May be blank in test data |
| Email | Yes | Uniqueness enforcement TBC — bulk upload allows duplicates |
| Phone | Yes | 10-digit mobile (used for OTP login) |
| Role | Yes | Dropdown — typically "Sales Manager" |
| Assignable | Toggle, default ON | Appear in customer assignment dropdowns |
| Is Active | Toggle, default ON | Allow SM to log in to the sales portal |

3. Click **Submit** (or Cancel to discard).

### Result
- `POST /api/v1/admin/sales-managers/create` creates the User record with SM role.
- SM appears in the list immediately; count badge increments.
- New SM receives a Kaleyra SMS with portal login instructions (if configured).

### Note
A single-add via this modal is equivalent to one bulk-upload row with `IS_AVAILABLE=1, IS_ACTIVE=1`.

---

# Feature 5 — Edit Sales Manager

### What it does
Updates an existing SM's details, Assignable flag, or Is Active flag.

### Preconditions
- Admin session.

### How to use
1. Find the SM row.
2. Click the **edit (pencil) icon** in the Actions column. The Edit modal opens with all fields pre-filled.
3. Update any fields you need to change.
4. Click **Update** (or Cancel).

### Result
- `PUT /api/v1/admin/sales-managers/update/:id` persists the changes.
- **If `Assignable` flipped OFF:** SM removed from all customer assignment dropdowns immediately across all active sessions.
- **If `Is Active` flipped OFF:** SM's portal login session is invalidated; soft deactivation (record NOT deleted).
- No notification is sent to the SM on account changes.

### Warnings
- **No automatic reassignment.** Setting Assignable = OFF for an SM with existing customer assignments removes them from FUTURE dropdown selections — existing customer-SM relationships are NOT auto-reassigned. Manual reassignment is required.
- **No delete.** To "remove" an SM, set Is Active = OFF.

---

# Feature 6 — Privacy Masking Settings (system-wide)

### What it does
Controls whether SMs see masked or real values for buyer Email, buyer Phone, and Unit Cost in the SM Portal. Applies to **all SMs simultaneously** — no per-SM granularity.

### Preconditions
- Admin session.

### How to use
1. Click **Settings** in the page header. The "Settings" modal opens with 3 toggles.
2. Review and set:
   - **Email Masking** — ON = customer email addresses hidden from all SMs.
   - **Phone Masking** — ON = customer phone numbers hidden from all SMs.
   - **Cost Masking** — ON = unit pricing data hidden from all SMs.
3. Save (whether toggles auto-save on flip or require explicit Save click — confirm with product before mass changes).

### Result
- All SM portal sessions reflect the new masking on next data load.
- Audit log captures which toggle changed, new state, admin user ID, timestamp.

### Warning — CRITICAL RISK
- Masking is **system-wide** — one toggle affects every SM at once.
- **No confirmation dialog** before the change persists.
- Accidentally toggling **Cost Masking OFF** immediately exposes unit pricing to every SM in the system.

Always coordinate masking changes with product and security before operating in a live environment.

---

# Feature 7 — Bulk SM Upload (via Config CMS — reference)

### What it does
Bulk creates or updates many SMs in one operation. Documented in detail in `config.md` (Section 7). Cross-referenced here for completeness because it's the primary mass-provisioning channel.

### Where
- Config page → `/admin/cms` → Section 7 — Sales Managers.

### Quick summary
- Download sample XLSX.
- Fill: Role / First Name / Last Name / Email / Phone / IS_AVAILABLE / IS_ACTIVE.
- Upload `.xlsx` only.
- **Phone is the merge key** — existing phone = update; new phone = create.
- Result is a downloadable Excel showing Created / Updated / Unchanged / Error per row.

### Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/sales-manager-sample` | Download template |
| POST | `/api/v1/admin/sales-managers-import` | Upload XLSX (multipart, field `doc`) |

For full instructions, see the Config user manual (Feature 7).

---

## Business Rules

1. **No delete** — SMs are deactivated (Is Active = OFF), never deleted.
2. **Immediate effect** — toggling Assignable or Is Active flips system-wide instantly across active sessions.
3. **Assignable = OFF** does NOT auto-reassign existing customer-SM relationships.
4. **Masking is system-wide** — one toggle affects every SM.
5. **Phone is the merge key** for bulk upload — matching phone = update; new phone = create.
6. The header count badge always shows the system total, even when filters or search are applied.
7. Setting Is Active = OFF is a soft deactivation — the record is preserved for audit / reactivation.

---

## Role Restrictions

- Admin (roleId 1) and Sales Manager Admin (roleId 4) have full access to all features on this page.
- The Settings modal (privacy masking) should be operated with explicit business sign-off due to system-wide impact.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/sales-managers` | Paginated SM list + filters |
| POST | `/api/v1/admin/sales-managers/create` | Single-add SM |
| PUT | `/api/v1/admin/sales-managers/update/:id` | Edit SM |
| GET | `/api/v1/admin/sales-manager-sample` | Bulk-upload template (XLSX) |
| POST | `/api/v1/admin/sales-managers-import` | Bulk upload (XLSX, field `doc`) |

---

## Integrations

- **Customers module** — SM assignment dropdowns are populated from `IS_AVAILABLE=1` records here.
- **Channel Partners module** — SM Name/Email/Mobile columns there are auto-populated from the SM assigned to each CP.
- **SM Portal** — uses Is Active to gate login; uses masking settings to render buyer PII and pricing.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Can't find Delete button | By design — no delete operation | Set Is Active = OFF to deactivate |
| SM still appears in customer dropdowns after Assignable OFF | Browser-side cache or stale session | Refresh; if persists, verify save succeeded |
| SM can still log in after Is Active OFF | Token cached; logout endpoint is server-side no-op (see Login manual) | Wait for 1-day JWT expiry, or escalate for forced session invalidation |
| Existing customer assignments persist after Assignable OFF | No auto-reassignment by design | Manually reassign affected customers |
| Bulk upload row flagged "Phone invalid" | Phone < 10 digits | Fix the row and re-upload |
| Duplicate Email in bulk upload | Allowed | No action needed — email is not a uniqueness constraint |
| Cost Masking toggle exposed pricing instantly | No confirmation dialog by design | Re-toggle ON immediately if accidental |
| Modal asks for Role but only "Sales Manager" appears | Default seeded role | Use as-is unless your tenant has additional configured roles |
| Header count says 26 but filtered table shows fewer | Count is system total, not filtered count | Read filtered count from the result footer, not the header badge |
