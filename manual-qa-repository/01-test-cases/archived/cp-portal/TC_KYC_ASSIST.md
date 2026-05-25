# Test Cases — KYC Assistance
**Portal:** Channel Partner Portal
**Module:** KYC Assistance
**BRD Reference:** CP-FS-KYC-Assistance.md
**Total TCs:** 10

---

## UI Tests

### TC_KYCASSIST_UI_001 — KYC page loads for assignable customer

| Field | Value |
|-------|-------|
| **Sub Module** | Page Layout |
| **Scenario** | CP opens KYC form for a WINNER customer |
| **Precondition** | CP has a WINNER customer |
| **Test Steps** | 1. Navigate to /kyc<br>2. Wait for form |
| **Test Data** | CP with winning customer |
| **Expected Result** | Form loads with primary applicant fields pre-filled where data exists |

### TC_KYCASSIST_UI_002 — Document upload widgets render

| Field | Value |
|-------|-------|
| **Sub Module** | Document Upload |
| **Scenario** | Upload controls for 4 documents render |
| **Precondition** | On KYC form |
| **Test Steps** | 1. Inspect upload area |
| **Test Data** | N/A |
| **Expected Result** | 4 upload controls: Passport photo, PAN, Aadhaar front, Aadhaar back |

## Validation Tests

### TC_KYCASSIST_VAL_001 — PAN format validated

| Field | Value |
|-------|-------|
| **Sub Module** | Field Validation |
| **Scenario** | Invalid PAN rejected |
| **Precondition** | On KYC form |
| **Test Steps** | 1. Enter PAN ABC<br>2. Try to proceed |
| **Test Data** | PAN: ABC |
| **Expected Result** | Validation error |

### TC_KYCASSIST_VAL_002 — Aadhaar must be 12 digits

| Field | Value |
|-------|-------|
| **Sub Module** | Field Validation |
| **Scenario** | Short Aadhaar rejected |
| **Precondition** | On KYC form |
| **Test Steps** | 1. Enter Aadhaar 1234<br>2. Proceed |
| **Test Data** | Aadhaar: 1234 |
| **Expected Result** | Validation error |

## Functional Positive Tests

### TC_KYCASSIST_FUNC_001 — CP submits KYC for customer

| Field | Value |
|-------|-------|
| **Sub Module** | Submission |
| **Scenario** | Complete KYC on behalf of customer |
| **Precondition** | Customer has WINNER status |
| **Test Steps** | 1. Fill primary applicant<br>2. Upload all 4 documents<br>3. Submit |
| **Test Data** | Valid PAN ABCDE1234F, Aadhaar 123456789012, 4 image files |
| **Expected Result** | KYC submitted; isKycSubmitted = true on registration unit |

### TC_KYCASSIST_FUNC_002 — Add co-applicant with documents

| Field | Value |
|-------|-------|
| **Sub Module** | Co-Applicant |
| **Scenario** | Add a co-applicant with full documents |
| **Precondition** | Primary applicant complete |
| **Test Steps** | 1. Click + Add Applicant<br>2. Fill details with Spouse relationship<br>3. Upload all 4 docs |
| **Test Data** | Spouse data |
| **Expected Result** | Co-applicant section saved successfully |

## Functional Negative Tests

### TC_KYCASSIST_NEG_001 — Cannot submit pre-WINNER

| Field | Value |
|-------|-------|
| **Sub Module** | Status Gate |
| **Scenario** | KYC blocked before WINNER |
| **Precondition** | Customer not in WINNER state |
| **Test Steps** | 1. Open KYC for non-WINNER customer |
| **Test Data** | Available customer |
| **Expected Result** | KYC form not accessible; error or empty state |

### TC_KYCASSIST_NEG_002 — Missing document blocks submission

| Field | Value |
|-------|-------|
| **Sub Module** | Document Validation |
| **Scenario** | Submit with one missing document |
| **Precondition** | 3 of 4 documents uploaded |
| **Test Steps** | 1. Skip uploading Aadhaar back<br>2. Try to submit |
| **Test Data** | Missing Aadhaar back |
| **Expected Result** | Submission blocked with missing document error |

## Edge Cases

### TC_KYCASSIST_EDGE_001 — Cannot add 5th applicant

| Field | Value |
|-------|-------|
| **Sub Module** | Applicant Limit |
| **Scenario** | Add Applicant disabled at 4 |
| **Precondition** | 4 applicants present |
| **Test Steps** | 1. Observe Add Applicant button |
| **Test Data** | 4 applicants |
| **Expected Result** | Button hidden/disabled at limit |

## API Tests

### TC_KYCASSIST_API_001 — Submit KYC endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | API persists KYC data and uploads docs to Azure |
| **Precondition** | Valid JWT |
| **Test Steps** | 1. POST KYC payload with form data |
| **Test Data** | KYC payload |
| **Expected Result** | 200 OK; isKycSubmitted = true |

## DB Tests

### TC_KYCASSIST_DB_001 — KYC flags persisted

| Field | Value |
|-------|-------|
| **Sub Module** | Data Persistence |
| **Scenario** | Confirm flags after submission |
| **Precondition** | KYC submitted |
| **Test Steps** | 1. Query registration_unit by ID |
| **Test Data** | Registration ID |
| **Expected Result** | isKycSubmitted = true |
