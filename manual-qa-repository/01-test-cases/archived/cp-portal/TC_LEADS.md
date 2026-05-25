# Test Cases — Leads Management
**Portal:** Channel Partner Portal
**Module:** Leads Management
**BRD Reference:** CP-FS-Leads-Management.md
**Total TCs:** 8

---

## UI Tests

### TC_LEADS_UI_001 — Leads page loads

| Field | Value |
|-------|-------|
| **Sub Module** | List Page |
| **Scenario** | Verify Leads page renders |
| **Precondition** | CP logged in |
| **Test Steps** | 1. Navigate to /leads<br>2. Wait for table |
| **Test Data** | Logged-in CP |
| **Expected Result** | Page loads; lead list rendered |

### TC_LEADS_UI_002 — Lead row columns visible

| Field | Value |
|-------|-------|
| **Sub Module** | List Columns |
| **Scenario** | Verify lead columns |
| **Precondition** | CP has assigned leads |
| **Test Steps** | 1. Inspect table header |
| **Test Data** | N/A |
| **Expected Result** | Columns: Lead Name, Contact Details, Lead Source, Status/Stage, Last Activity |

## Functional Positive Tests

### TC_LEADS_FUNC_001 — CP sees only own leads

| Field | Value |
|-------|-------|
| **Sub Module** | Scoping |
| **Scenario** | Lead list filtered to assigned CP |
| **Precondition** | Two CPs both have leads |
| **Test Steps** | 1. Login as CP A<br>2. Open leads |
| **Test Data** | CP A |
| **Expected Result** | Only CP A leads visible; CP B leads not shown |

### TC_LEADS_FUNC_002 — Convert lead to registration

| Field | Value |
|-------|-------|
| **Sub Module** | Conversion |
| **Scenario** | Click convert opens registration form pre-filled |
| **Precondition** | A lead is ready for conversion |
| **Test Steps** | 1. Click Convert on a lead row<br>2. Observe registration form |
| **Test Data** | Existing lead |
| **Expected Result** | Registration form pre-populated with lead's name, mobile, email |

### TC_LEADS_FUNC_003 — New registration linked to broker

| Field | Value |
|-------|-------|
| **Sub Module** | Broker Link |
| **Scenario** | Created registration carries CP's broker ID |
| **Precondition** | Conversion form completed |
| **Test Steps** | 1. Complete conversion form<br>2. Submit |
| **Test Data** | Lead-converted registration |
| **Expected Result** | New Registration row has brokerId = current CP user ID |

## Functional Negative Tests

### TC_LEADS_NEG_001 — Unassigned CP sees empty leads list

| Field | Value |
|-------|-------|
| **Sub Module** | Empty State |
| **Scenario** | CP with zero LSQ leads sees empty list |
| **Precondition** | CP has no leads assigned in LSQ |
| **Test Steps** | 1. Login as CP without leads<br>2. Open Leads page |
| **Test Data** | CP with no leads |
| **Expected Result** | Empty state message displayed; no rows |

## Edge Cases

### TC_LEADS_EDGE_001 — LSQ sync down — graceful error

| Field | Value |
|-------|-------|
| **Sub Module** | LSQ Sync |
| **Scenario** | Lead sync API unreachable |
| **Precondition** | LSQ sync simulated unavailable |
| **Test Steps** | 1. Open Leads page |
| **Test Data** | LSQ down |
| **Expected Result** | Graceful error message; page does not crash |

## API Tests

### TC_LEADS_API_001 — Get leads endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | Leads API returns assigned leads |
| **Precondition** | Valid JWT |
| **Test Steps** | 1. GET /leads endpoint |
| **Test Data** | CP JWT |
| **Expected Result** | 200 OK; array of leads filtered by assignee |

## DB Tests

### TC_LEADS_DB_001 — Conversion creates Registration row

| Field | Value |
|-------|-------|
| **Sub Module** | Data Persistence |
| **Scenario** | Lead-to-registration conversion writes row |
| **Precondition** | Conversion just submitted |
| **Test Steps** | 1. Query registrations by brokerId |
| **Test Data** | CP brokerId |
| **Expected Result** | New row with brokerId, lead details preserved |
