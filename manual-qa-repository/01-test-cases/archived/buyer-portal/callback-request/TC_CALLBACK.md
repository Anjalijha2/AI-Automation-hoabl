# Test Cases — Callback Request
**Portal:** Buyer Portal
**Module:** Callback Request
**BRD Reference:** BUYER-FS-Callback-Request.md
**Total TCs:** 8

---

## UI Tests

### TC_CALLBACK_UI_001 — Callback Request form loads

| Field | Value |
|-------|-------|
| **Sub Module** | Request Form |
| **Scenario** | Verify form opens with description, date, time fields |
| **Precondition** | Buyer logged in |
| **Test Steps** | 1. Click Request Callback or Schedule VC<br>2. Observe form |
| **Test Data** | Logged-in buyer |
| **Expected Result** | Description, preferred date, preferred time fields all visible |

### TC_CALLBACK_UI_002 — Feedback URL renders without login

| Field | Value |
|-------|-------|
| **Sub Module** | Feedback Form |
| **Scenario** | Feedback page renders for a valid token URL |
| **Precondition** | Valid feedback token URL received |
| **Test Steps** | 1. Open /call-feedback/{validCode} in fresh browser<br>2. Observe form |
| **Test Data** | Valid feedback token |
| **Expected Result** | Form loads without prompting login; rating and comments fields visible |

## Functional Positive Tests

### TC_CALLBACK_FUNC_001 — Submit callback request

| Field | Value |
|-------|-------|
| **Sub Module** | Request Submission |
| **Scenario** | Submit callback request successfully |
| **Precondition** | At least one SM has isAvailable = true |
| **Test Steps** | 1. Fill description<br>2. Pick a future date and time<br>3. Click Submit |
| **Test Data** | Description "Need allocation help", any future date/time |
| **Expected Result** | Request created with status REQUESTED; assigned to next-available SM via round-robin |

### TC_CALLBACK_FUNC_002 — Submit feedback after call

| Field | Value |
|-------|-------|
| **Sub Module** | Feedback |
| **Scenario** | Buyer submits feedback via token URL |
| **Precondition** | SM completed call and recorded outcome |
| **Test Steps** | 1. Open feedback URL<br>2. Pick rating<br>3. Submit |
| **Test Data** | Rating: 5 |
| **Expected Result** | isBuyerFeedbackSubmitted = true; request progresses toward COMPLETED |

## Functional Negative Tests

### TC_CALLBACK_NEG_001 — Reused feedback token rejected

| Field | Value |
|-------|-------|
| **Sub Module** | Token Security |
| **Scenario** | Submit feedback twice using same token |
| **Precondition** | Token already used |
| **Test Steps** | 1. Open used feedback URL again<br>2. Try to submit |
| **Test Data** | Used token |
| **Expected Result** | Submission rejected; token is single-use |

### TC_CALLBACK_NEG_002 — Invalid token URL shows error

| Field | Value |
|-------|-------|
| **Sub Module** | Token Security |
| **Scenario** | Random invalid feedback code |
| **Precondition** | None |
| **Test Steps** | 1. Open /call-feedback/INVALID123 |
| **Test Data** | Invalid token |
| **Expected Result** | Error page shown; no form rendered |

## Edge Cases

### TC_CALLBACK_EDGE_001 — Request created when no SM available

| Field | Value |
|-------|-------|
| **Sub Module** | Assignment |
| **Scenario** | Submit request when all SMs unavailable |
| **Precondition** | All SMs have isAvailable = false |
| **Test Steps** | 1. Submit callback request |
| **Test Data** | Request payload |
| **Expected Result** | Request created with REQUESTED status; assignment deferred until SM becomes available |

## API Tests

### TC_CALLBACK_API_001 — Create callback request endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | POST callback request |
| **Precondition** | Valid JWT |
| **Test Steps** | 1. POST callback-request with payload |
| **Test Data** | Request payload |
| **Expected Result** | 201 Created; request id returned |

## DB Tests

### TC_CALLBACK_DB_001 — Callback request row exists

| Field | Value |
|-------|-------|
| **Sub Module** | Data Persistence |
| **Scenario** | Submitted request persisted in DB |
| **Precondition** | Request just submitted |
| **Test Steps** | 1. Query callback_requests by registration ID<br>2. Inspect row |
| **Test Data** | Registration ID |
| **Expected Result** | Row exists with status REQUESTED and assignedSmId populated |
