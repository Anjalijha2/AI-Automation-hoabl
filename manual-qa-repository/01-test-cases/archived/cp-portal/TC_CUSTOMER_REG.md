# Test Cases — Customer Registration
**Portal:** Channel Partner Portal
**Module:** Customer Registration and Tracking
**BRD Reference:** CP-FS-Customer-Registration.md
**Total TCs:** 11

---

## UI Tests

### TC_CUSTREG_UI_001 — Dashboard table loads after CP login

| Field | Value |
|-------|-------|
| **Sub Module** | Dashboard |
| **Scenario** | Customer dashboard page loads with table |
| **Precondition** | CP logged in |
| **Test Steps** | 1. Land on /dashboard after login<br>2. Wait for table |
| **Test Data** | Logged-in CP |
| **Expected Result** | Table with columns: Customer Name, Registration Number, Unit Allocated, Allocation Status, KYC Completion, Payment Status |

### TC_CUSTREG_UI_002 — Register Customer form renders

| Field | Value |
|-------|-------|
| **Sub Module** | Registration Form |
| **Scenario** | Verify all form fields render |
| **Precondition** | On dashboard |
| **Test Steps** | 1. Click Register Customer<br>2. Observe form |
| **Test Data** | N/A |
| **Expected Result** | Fields visible: First/Last Name, Mobile, Email, Purchase Purpose, Home Loan Intent, Budget, Floor Range, Walk-in Source, T&C checkbox |

## Validation Tests

### TC_CUSTREG_VAL_001 — Missing required fields rejected

| Field | Value |
|-------|-------|
| **Sub Module** | Field Validation |
| **Scenario** | Submit with empty required fields |
| **Precondition** | On registration form |
| **Test Steps** | 1. Leave required fields empty<br>2. Submit |
| **Test Data** | Empty form |
| **Expected Result** | Validation errors shown on each missing required field |

### TC_CUSTREG_VAL_002 — Invalid mobile format rejected

| Field | Value |
|-------|-------|
| **Sub Module** | Mobile Validation |
| **Scenario** | Non-10-digit mobile rejected |
| **Precondition** | On form |
| **Test Steps** | 1. Enter mobile 12345<br>2. Submit |
| **Test Data** | Mobile: 12345 |
| **Expected Result** | Validation error on mobile |

### TC_CUSTREG_VAL_003 — Invalid email format rejected

| Field | Value |
|-------|-------|
| **Sub Module** | Email Validation |
| **Scenario** | Bad email format rejected |
| **Precondition** | On form |
| **Test Steps** | 1. Enter email "not-an-email"<br>2. Submit |
| **Test Data** | Email: not-an-email |
| **Expected Result** | Validation error on email |

### TC_CUSTREG_VAL_004 — T&C checkbox required

| Field | Value |
|-------|-------|
| **Sub Module** | T&C |
| **Scenario** | Cannot submit without ticking T&C |
| **Precondition** | All fields filled |
| **Test Steps** | 1. Fill all fields<br>2. Leave T&C unchecked<br>3. Submit |
| **Test Data** | T&C unchecked |
| **Expected Result** | Form rejects submission until T&C ticked |

## Functional Positive Tests

### TC_CUSTREG_FUNC_001 — Successful customer registration

| Field | Value |
|-------|-------|
| **Sub Module** | Registration |
| **Scenario** | Complete a valid registration |
| **Precondition** | CP logged in; mobile not yet registered for project |
| **Test Steps** | 1. Fill all fields with valid data<br>2. Tick T&C<br>3. Submit |
| **Test Data** | Valid customer data, mobile 9876543210, email test@example.com |
| **Expected Result** | Registration created with GHNG-XXXXXXXXXX number; appears in dashboard; SMS sent to customer |

### TC_CUSTREG_FUNC_002 — NRI registration with country code

| Field | Value |
|-------|-------|
| **Sub Module** | NRI Support |
| **Scenario** | Register NRI customer with international code |
| **Precondition** | NRI customer details |
| **Test Steps** | 1. Pick country code from selector<br>2. Enter international mobile<br>3. Fill rest of form<br>4. Submit |
| **Test Data** | Country code +971, mobile |
| **Expected Result** | Registration created; nriIndianPhone captured |

## Functional Negative Tests

### TC_CUSTREG_NEG_001 — Duplicate mobile rejected

| Field | Value |
|-------|-------|
| **Sub Module** | Duplicate Check |
| **Scenario** | Same mobile already registered for project |
| **Precondition** | Mobile 9876543210 already registered |
| **Test Steps** | 1. Try to register again with same mobile<br>2. Submit |
| **Test Data** | Existing mobile |
| **Expected Result** | Submission rejected; duplicate error shown |

### TC_CUSTREG_NEG_002 — Duplicate email rejected

| Field | Value |
|-------|-------|
| **Sub Module** | Duplicate Check |
| **Scenario** | Same email already registered |
| **Precondition** | Email already used |
| **Test Steps** | 1. Try to register with existing email<br>2. Submit |
| **Test Data** | Existing email |
| **Expected Result** | Submission rejected |

## API Tests

### TC_CUSTREG_API_001 — Register customer endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | POST register endpoint succeeds |
| **Precondition** | Valid JWT |
| **Test Steps** | 1. POST /register-customer with payload |
| **Test Data** | Full payload |
| **Expected Result** | 201 Created; registration ID and number returned |

## DB Tests

### TC_CUSTREG_DB_001 — Registration row carries CP brokerId

| Field | Value |
|-------|-------|
| **Sub Module** | Broker Attribution |
| **Scenario** | Verify brokerId persisted on new registration |
| **Precondition** | Registration just created |
| **Test Steps** | 1. Query registrations by mobile |
| **Test Data** | Customer mobile |
| **Expected Result** | Row has brokerId = CP userId; walkInSourceXrCode = CP hvCode; availableForAllocation = true; status = Open |
