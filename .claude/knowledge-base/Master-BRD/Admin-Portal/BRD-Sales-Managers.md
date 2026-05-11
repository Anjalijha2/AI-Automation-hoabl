# Sales Managers — BRD

**Portal:** Admin Portal
**URL:** `https://uat-web.xrportal.in/admin/sales-managers` (list page) + `/admin/cms` Section 7 (bulk upload)
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

The Sales Managers module allows admins to create and manage Sales Manager (SM) accounts. SMs are the primary customer-facing sales team who handle buyer callbacks, video calls, and relationship management. Admins control which SMs appear in customer assignment dropdowns and which SMs can log in to the sales portal.

---

## 2. Who Uses This

| Role | Action |
|------|--------|
| Admin | Create, edit, and manage SM accounts; configure privacy masking; bulk upload |
| Sales Manager (after setup) | Log in to the SM Portal to manage assigned customers |

---

## 3. SM Account Flags

| Flag | Description | System Impact |
|------|-------------|---------------|
| **Assignable (IS_AVAILABLE)** | ON = SM appears in all customer assignment dropdowns system-wide | Turning OFF immediately removes SM from all dropdown selections |
| **Is Active (IS_ACTIVE)** | ON = SM can log in to the sales portal | Turning OFF immediately disables SM login |

---

## 4. Two Ways to Create / Update SMs

| Method | Location | Best For |
|--------|----------|---------|
| Single add via modal | `/admin/sales-managers` → "Add Sales Manager" button | Creating 1-2 SMs |
| Bulk upload via Excel | `/admin/cms` → Section 7 "Sales Managers" | Creating or updating many SMs at once |

**Merge key for bulk upload:** Phone number — existing records are updated, new records are created.

---

## 5. Privacy Masking Settings

Admins can hide sensitive data from ALL Sales Managers simultaneously:

| Masking Toggle | What It Hides |
|---------------|--------------|
| Email Masking ON | Customer email addresses hidden from SMs |
| Phone Masking ON | Customer phone numbers hidden from SMs |
| Cost Masking ON | Unit pricing hidden from SMs |

**Scope:** System-wide only — no per-SM masking granularity exists.

---

## 6. Key Business Rules

1. **No delete:** SMs are deactivated (Is Active = OFF), not deleted from the system.
2. **Immediate effect:** Changes to Assignable or Is Active flags apply immediately across all active sessions.
3. **Assignable = OFF impact:** Immediately removes SM from all customer assignment dropdowns — does not automatically reassign existing customer-SM relationships.
4. **Masking is system-wide:** One toggle change affects every SM simultaneously — no per-SM configuration.
5. **Phone is merge key:** For bulk uploads, the phone number is the unique identifier — if it matches an existing SM, that record is updated.

---

## 7. Admin Workflow — Adding a Single SM

1. Go to `/admin/sales-managers`
2. Click "Add Sales Manager"
3. Enter First Name, Last Name, Email, Phone (10 digits), Role = "Sales Manager"
4. Toggle Assignable ON (to appear in dropdowns) and Is Active ON (to allow login)
5. Click Submit → SM created immediately
6. SM can now log in to the SM Portal using their mobile OTP

---

## 8. Admin Workflow — Bulk SM Upload

1. Go to `/admin/cms` → Section 7 "Sales Managers"
2. Download the sample XLSX file
3. Fill in one row per SM: Role, First Name, Last Name, Email, Phone, IS_AVAILABLE (1/0), IS_ACTIVE (1/0)
4. Upload the file and click Submit
5. New SMs are created; existing SMs (matched by phone) are updated

---

## 9. Critical Risks

> **Risk:** Setting Assignable = OFF for an SM with active customer assignments removes them from future dropdown selections. Existing customer records are not automatically reassigned — manual reassignment required.

> **Risk:** Cost Masking is system-wide. Toggling it OFF immediately reveals pricing to every SM simultaneously. Confirm the correct save mechanism before changing masking settings in a live environment.

---

## 10. Related Documents

- [[Feature-Spec - Sales Managers]] — Full feature specifications with How to Use
- [[Feature-Spec - Config CMS]] — Feature 7: Bulk SM Upload
- [[Roles-and-Permissions]] — SM and SM Admin role definitions
