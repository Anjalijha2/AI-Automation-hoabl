---
type: brd
module: Sales Managers
url: https://uat-web.xrportal.in/admin/sales-managers
sprint: 5
status: Draft
author: BA Agent
created: 2026-05-08
tags: [brd, sales-managers, sprint-5]
---

# BRD: Sales Managers

## 1. Purpose
Manage the sales force accessing the XR Portal sales portal. Covers full SM lifecycle: creation, editing, role assignment, active/inactive status, assignability, and system-wide privacy settings (data masking).

**Business intent:** Governed, role-based sales team with configurable PII and pricing masking for sales staff.

## 2. Screens & Navigation
**Path:** Left sidebar → "Managers" → `/admin/sales-managers`

**Header:** "Sales Managers" | "26 Sales Managers" counter | Search box | Settings | Add Sales Manager

**Table Columns:**

| Column | Filterable |
|--------|-----------|
| First Name | No |
| Last Name | No |
| Email | No |
| Phone | No |
| Role | Yes |
| Assignable | Yes |
| Is Active | Yes |
| Created At | No |
| Actions | No (Edit button only) |

**Pagination:** 26 records, 3 pages, 10/page

## 3. Key Entities & Data Fields

### SM Entity
| Field | Required | Type | Notes |
|-------|----------|------|-------|
| First Name | Yes | Text | Primary identifier |
| Last Name | Yes | Text | Blank in load test data |
| Email | Yes | Email | Uniqueness unclear — duplicates observed |
| Phone | Yes | Tel | 10 digits |
| Role | Yes | Dropdown | "Sales Manager" observed; others unknown |
| Assignable | No | Toggle | Default ON |
| Is Active | No | Toggle | Default ON |

### Settings Entity (System-Wide)
| Setting | Type | Scope |
|---------|------|-------|
| Email Masking | Toggle ON/OFF | All SMs simultaneously |
| Phone Masking | Toggle ON/OFF | All SMs simultaneously |
| Cost Masking | Toggle ON/OFF | All SMs simultaneously |

> No per-SM masking. Changes affect all sales managers at once.

## 4. Business Workflows

### Create SM
"Add Sales Manager" → Modal → Fill all required fields → "Create" → new SM in list

### Edit SM
"Edit" button → Modal pre-filled → "Update" → table updates
**No delete button** — SMs deactivated (Is Active = OFF), never deleted.

### Search
Free-text box → filters by First Name, Last Name, Email, Phone

### Column Filters
Filter icons on Role / Assignable / Is Active → dropdown selections

### Configure Privacy Settings
"Settings" button → Modal with 3 masking toggles → auto-save or Update button (unconfirmed)

### Bulk Upload via CMS
CMS page → Sales Managers section → download sample → upload CSV → Submit

## 5. Filters & Search

| Type | Fields |
|------|--------|
| Free-text | Name, Email, Phone |
| Role filter | Role values |
| Assignable filter | Yes / No |
| Is Active filter | Active / Inactive |

## 6. KPIs
- SM count badge: "26 Sales Managers"

## 7. Integration Points

| Module | Relationship |
|--------|-------------|
| Customers | SMs assigned to customers; Assignable=Yes → appears in assignment dropdowns |
| [[BRD - CMS Config]] | SM bulk upload in CMS sections |
| Sales Portal (external) | Masking settings control SM data visibility in their portal |
| Channel Partners | Relationship unclear — see [[Sprint 5 - Clarifications#CLARIFICATION-SM-004]] |

## 8. Acceptance Criteria

- **AC-SM-001:** List loads <3s; 26 SMs; pagination works
- **AC-SM-002:** Search — partial match by name/email/phone; case-insensitive; empty = all
- **AC-SM-003:** Column filters — distinct values; combined filters work
- **AC-SM-004:** Create — validation on all required fields; phone 10-digit; email format; counter increments
- **AC-SM-005:** Edit — pre-filled; toggle states accurate; no delete button present
- **AC-SM-006:** Settings — 3 toggles independently controllable; state persists after close
- **AC-SM-007:** Bulk upload — sample CSV correct headers; valid upload creates/updates; invalid rows error

## 9. Out of Scope / UAT Limitations
1. Sales portal cross-verification for masking requires separate login
2. Full Role dropdown values unknown
3. SM-to-Customer assignment flow requires Customers module
4. SM bulk CSV headers not confirmed

## 🚩 Domain Red Flags
- **MEDIUM:** Cost Masking accidentally toggled OFF → all SMs see unit pricing (data sensitivity)
- **MEDIUM:** No per-SM masking — system-wide changes affect entire sales force

## Open Clarifications
See [[Sprint 5 - Clarifications#Sales Managers]]
