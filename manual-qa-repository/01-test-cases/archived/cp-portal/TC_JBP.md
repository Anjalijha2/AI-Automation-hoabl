# Test Cases — JBP Submission
**Portal:** Channel Partner Portal
**Module:** JBP (Joint Business Plan) Submission
**BRD Reference:** CP-FS-JBP-Submission.md
**Total TCs:** 10

---

## UI Tests

### TC_JBP_UI_001 — JBP form loads when cycle is OPEN

| Field | Value |
|-------|-------|
| **Sub Module** | JBP Form |
| **Scenario** | Verify form renders when cycle is open and not yet submitted |
| **Precondition** | Open JBP cycle exists; CP has not submitted |
| **Test Steps** | 1. Navigate to /jbp<br>2. Wait for form |
| **Test Data** | CP without submission |
| **Expected Result** | Full 14-field form rendered |

### TC_JBP_UI_002 — Thank You page reachable after submit

| Field | Value |
|-------|-------|
| **Sub Module** | Thank You |
| **Scenario** | Verify /jbp/thank-you exists |
| **Precondition** | Submission completed |
| **Test Steps** | 1. Submit valid JBP<br>2. Observe redirect |
| **Test Data** | Valid JBP payload |
| **Expected Result** | Redirect to /jbp/thank-you with confirmation |

## Validation Tests

### TC_JBP_VAL_001 — Required fields enforced

| Field | Value |
|-------|-------|
| **Sub Module** | Field Validation |
| **Scenario** | Submit with required fields empty |
| **Precondition** | On JBP form |
| **Test Steps** | 1. Leave required dropdowns empty<br>2. Submit |
| **Test Data** | Empty fields |
| **Expected Result** | Submission blocked; validation errors shown |

## Functional Positive Tests

### TC_JBP_FUNC_001 — Submit valid JBP for open cycle

| Field | Value |
|-------|-------|
| **Sub Module** | Submission |
| **Scenario** | Submit a complete JBP form |
| **Precondition** | Cycle OPEN; no prior submission |
| **Test Steps** | 1. Pick Brokerage and Booking Commitment<br>2. Enter Manpower count<br>3. Tick Activities and Digital channels<br>4. Pick Investment range<br>5. Answer all Yes/No fields<br>6. Enter Registration Commitment<br>7. Submit |
| **Test Data** | Full valid payload |
| **Expected Result** | JbpSubmission created with status=ACTIVE, version=1 |

### TC_JBP_FUNC_002 — Submit edit request

| Field | Value |
|-------|-------|
| **Sub Module** | Edit Request |
| **Scenario** | Submitted CP requests edit to plan |
| **Precondition** | CP submitted; cycle still OPEN |
| **Test Steps** | 1. Open JBP page<br>2. Click Request Edit<br>3. Describe changes<br>4. Submit |
| **Test Data** | Edit request payload |
| **Expected Result** | Edit request created for admin review |

### TC_JBP_FUNC_003 — Existing submission shown read-only

| Field | Value |
|-------|-------|
| **Sub Module** | View Submission |
| **Scenario** | CP with existing submission sees read-only view |
| **Precondition** | CP already submitted for current cycle |
| **Test Steps** | 1. Navigate to /jbp |
| **Test Data** | Submitted CP |
| **Expected Result** | Form fields shown read-only with version number and status |

## Functional Negative Tests

### TC_JBP_NEG_001 — Cannot submit twice in same cycle

| Field | Value |
|-------|-------|
| **Sub Module** | Single Submission |
| **Scenario** | Add New JBP Entry button hidden when already submitted |
| **Precondition** | CP submitted in current cycle |
| **Test Steps** | 1. Open /jbp<br>2. Look for Add New JBP button |
| **Test Data** | Submitted CP |
| **Expected Result** | Add New JBP Entry button not visible |

### TC_JBP_NEG_002 — Submission rejected when cycle CLOSED

| Field | Value |
|-------|-------|
| **Sub Module** | Cycle Gate |
| **Scenario** | Try to submit when cycle is closed |
| **Precondition** | Cycle CLOSED |
| **Test Steps** | 1. Open /jbp<br>2. Attempt to submit |
| **Test Data** | Closed cycle |
| **Expected Result** | Submission not allowed; form disabled or shows cycle closed message |

## Edge Cases

### TC_JBP_EDGE_001 — Approved edit increments version

| Field | Value |
|-------|-------|
| **Sub Module** | Version Tracking |
| **Scenario** | Admin approves edit → version 2 created, version 1 EXPIRED |
| **Precondition** | Edit request approved by admin |
| **Test Steps** | 1. After approval, query JbpSubmission |
| **Test Data** | Approved request |
| **Expected Result** | Version 2 ACTIVE; version 1 EXPIRED |

## API Tests

### TC_JBP_API_001 — Submit JBP endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | POST JBP submission |
| **Precondition** | Valid JWT; open cycle |
| **Test Steps** | 1. POST /jbp with payload |
| **Test Data** | Full payload |
| **Expected Result** | 201 Created; JBP id returned |

## DB Tests

### TC_JBP_DB_001 — JbpSubmission record persisted

| Field | Value |
|-------|-------|
| **Sub Module** | Data Persistence |
| **Scenario** | Submission writes row with correct version |
| **Precondition** | Just submitted |
| **Test Steps** | 1. Query JbpSubmission by CP user ID and cycle ID |
| **Test Data** | CP ID, cycle ID |
| **Expected Result** | Row with status=ACTIVE, version=1 |
