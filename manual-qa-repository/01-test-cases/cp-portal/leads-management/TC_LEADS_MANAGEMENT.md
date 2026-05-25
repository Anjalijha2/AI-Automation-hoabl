# Test Cases — Leads Management
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Leads-Management.md

---

## Leads Page Navigation

### CP_LEAD_001 — Navigate to Leads from main nav

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP is logged in and on Dashboard |
| **Test Steps** | 1. Click **Leads** in the main navigation menu<br>2. Wait for the Leads page to load |
| **Expected Result** | URL updates to `/leads`; Leads page renders with header, list/table, and loading indicator |
| **Priority** | Critical |

---

### CP_LEAD_002 — Verify Leads page header

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads page is open |
| **Test Steps** | 1. Read the page heading<br>2. Verify the breadcrumb / active nav item |
| **Expected Result** | Page heading reads "Leads" (or equivalent); Leads menu item is highlighted as active |
| **Priority** | Medium |

---

### CP_LEAD_003 — Direct URL access to `/leads` works when logged in

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Open `https://uat.xrportal.in/leads` directly in a new tab |
| **Expected Result** | Leads page loads without redirect to login |
| **Priority** | High |

---

### CP_LEAD_004 — Logged-out user cannot access `/leads`

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Navigate to `/leads` in a private window |
| **Expected Result** | User is redirected to `/login` |
| **Priority** | Critical |

---

## Lead List Table

### CP_LEAD_005 — Verify table columns are present

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads list has at least one row |
| **Test Steps** | 1. Open Leads page<br>2. Read column headers from left to right |
| **Expected Result** | Columns shown: Lead Name, Contact Details, Lead Source, Status / Stage, Last Activity |
| **Priority** | Critical |

---

### CP_LEAD_006 — Verify Lead Name column displays correct data

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | At least one assigned lead exists |
| **Test Steps** | 1. Identify a lead row<br>2. Read the Lead Name cell |
| **Expected Result** | Lead Name shows prospect's full name as synced from LeadSquared |
| **Priority** | High |

---

### CP_LEAD_007 — Verify Contact Details column shows phone and email

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Test Steps** | 1. Read Contact Details cell for a lead |
| **Expected Result** | Both phone and email are visible; phone appears in a clickable/formatted style |
| **Priority** | High |

---

### CP_LEAD_008 — Verify Lead Source column shows source labels

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Test Steps** | 1. Read the Lead Source value for each row |
| **Expected Result** | Source shows values like "Website", "Walk-in", "Referral", etc. matching LSQ |
| **Priority** | Medium |

---

### CP_LEAD_009 — Verify Status / Stage column shows pipeline stage

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Test Steps** | 1. Read Status / Stage value |
| **Expected Result** | Stage value reflects the current LSQ pipeline stage (e.g., New, Contacted, Qualified) |
| **Priority** | High |

---

### CP_LEAD_010 — Verify Last Activity column shows latest interaction

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead row visible |
| **Test Steps** | 1. Read Last Activity cell for a row |
| **Expected Result** | Last Activity shows a date or activity descriptor (e.g., "Called — 2 days ago") |
| **Priority** | Medium |

---

### CP_LEAD_011 — Verify empty state when no leads are assigned

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP has zero assigned leads in LSQ |
| **Test Steps** | 1. Open Leads page |
| **Expected Result** | Friendly empty-state message is displayed (e.g., "No leads assigned yet"); table headers may still be present |
| **Priority** | Medium |

---

### CP_LEAD_012 — Lead isolation — CP sees only their own leads

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Multiple CPs exist with different lead assignments in LSQ |
| **Test Steps** | 1. Login as CP A<br>2. Note visible leads<br>3. Logout, login as CP B<br>4. Compare lead lists |
| **Expected Result** | Each CP sees only their own assigned leads; no cross-visibility |
| **Priority** | Critical |

---

## Search and Filters

### CP_LEAD_013 — Search leads by name

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search input visible; at least 2 leads exist |
| **Test Steps** | 1. Type a known lead's first name into the search box<br>2. Wait for results to filter |
| **Expected Result** | Only leads whose name matches the query are listed |
| **Priority** | High |

---

### CP_LEAD_014 — Search leads by phone number

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search input visible |
| **Test Steps** | 1. Enter a partial or full phone number known to exist<br>2. Observe filtered results |
| **Expected Result** | Matching leads are shown; non-matching rows are hidden |
| **Priority** | High |

---

### CP_LEAD_015 — Search with no matches shows empty result message

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search input visible |
| **Test Steps** | 1. Enter a string that does not match any lead (e.g., `zzzzz_no_match`)<br>2. Observe table |
| **Expected Result** | Empty-state message displayed (e.g., "No results found"); table body is empty |
| **Priority** | Medium |

---

### CP_LEAD_016 — Clear search restores full lead list

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Search query previously applied |
| **Test Steps** | 1. Clear the search input<br>2. Press Enter or click clear (X) icon |
| **Expected Result** | Full list of leads is restored |
| **Priority** | Medium |

---

### CP_LEAD_017 — Filter leads by Status / Stage

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Filter UI exists for stage |
| **Test Steps** | 1. Open Status filter dropdown<br>2. Select a specific stage (e.g., "Qualified")<br>3. Apply filter |
| **Expected Result** | Only leads with the selected stage are shown |
| **Priority** | High |

---

### CP_LEAD_018 — Filter leads by Lead Source

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Source filter UI exists |
| **Test Steps** | 1. Open Lead Source filter<br>2. Select a value (e.g., "Website") |
| **Expected Result** | Only leads from the selected source are listed |
| **Priority** | Medium |

---

## Lead Detail and Conversion

### CP_LEAD_019 — Click lead row opens lead detail view

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Leads list has rows |
| **Test Steps** | 1. Click on a lead's row or the lead name |
| **Expected Result** | Lead detail panel/drawer opens showing full contact info, activity history, and stage |
| **Priority** | High |

---

### CP_LEAD_020 — Verify Convert to Registration option is visible

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Lead detail or row action menu is visible |
| **Test Steps** | 1. Locate the Convert / Register option on a qualifying lead |
| **Expected Result** | Convert action is shown (button or menu item) labelled clearly (e.g., "Convert to Registration") |
| **Priority** | Critical |

---

### CP_LEAD_021 — Convert lead → Registration form opens pre-filled

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | A lead is visible with valid name, mobile, and email |
| **Test Steps** | 1. Click Convert on the lead<br>2. Wait for the registration form to render |
| **Expected Result** | Customer Registration form opens with First Name, Last Name, Mobile, Email pre-populated from the lead |
| **Priority** | Critical |

---

### CP_LEAD_022 — Successful conversion creates Registration linked to CP

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Conversion form is open; remaining required fields can be completed |
| **Test Steps** | 1. Complete required fields (Purchase Purpose, Budget, Home Loan Intent, T&C)<br>2. Submit |
| **Expected Result** | New Registration is created with `brokerId` = CP user ID; success toast displayed; customer appears on Dashboard |
| **Priority** | Critical |

---

### CP_LEAD_023 — Cancel during conversion does not create registration

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Conversion form is open with pre-filled data |
| **Test Steps** | 1. Click Cancel / close icon without submitting |
| **Expected Result** | Form closes; no Registration record is created; user returns to Leads page |
| **Priority** | High |

---

## Sync and Refresh

### CP_LEAD_024 — Refresh button re-fetches leads from LSQ

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | Refresh/reload control exists |
| **Test Steps** | 1. Click the Refresh button<br>2. Observe network/loading indicator |
| **Expected Result** | Lead list reloads from backend; new leads added in LSQ become visible after sync |
| **Priority** | Medium |

---

### CP_LEAD_025 — Pagination controls work when list exceeds page size

| Field | Value |
|-------|-------|
| **Module** | CP – Leads |
| **Pre-conditions** | CP has more leads than the page size (e.g., > 10) |
| **Test Steps** | 1. Scroll to bottom of table<br>2. Click Next page<br>3. Verify new leads load |
| **Expected Result** | Page changes; next set of leads displayed; pagination indicator updates (e.g., "Page 2 of N") |
| **Priority** | Medium |

---
