# Test Cases — Physical Allocation (In-Person Event)
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Physical-Allocation.md

---

## Campaign Gate & Page Load

### SM_ALLOC_001 — Physical Allocation route accessible only during PHYSICAL_EVENT campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | SM logged in; no active PHYSICAL_EVENT campaign |
| **Test Steps** | 1. Navigate to /sales-manager/physical-allocation<br>2. Observe page state |
| **Expected Result** | Empty state or message "Physical Allocation unavailable — no active campaign" per BR 1.5.1; customer search hidden |
| **Priority** | Critical |

---

### SM_ALLOC_002 — Customer Search screen loads during active campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | PHYSICAL_EVENT campaign active; SM logged in |
| **Test Steps** | 1. Click Physical Allocation in nav<br>2. Wait for page render |
| **Expected Result** | Customer Search page loads with search input, results area, and Select button placeholders |
| **Priority** | Critical |

---

## Customer Search

### SM_ALLOC_003 — Search by customer name returns matching registrations

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On customer search page; registered customer named "Ravi Kumar" exists |
| **Test Steps** | 1. Type "Ravi" in search input<br>2. Wait for results |
| **Expected Result** | Matching registrations appear in results list with name and registration number |
| **Priority** | Critical |

---

### SM_ALLOC_004 — Search by phone number returns the registered customer

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On customer search page; customer with phone 9000000001 registered |
| **Test Steps** | 1. Type "9000000001" in search<br>2. Wait for results |
| **Expected Result** | Single matching customer record displayed |
| **Priority** | Critical |

---

### SM_ALLOC_005 — "No records found" shown for unmatched search

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On customer search page |
| **Test Steps** | 1. Type a non-existent name like "Zzz Nonexistent"<br>2. Wait for response |
| **Expected Result** | Empty state message "No records found" displayed per FS 1.5.4 |
| **Priority** | High |

---

### SM_ALLOC_006 — Selecting a customer navigates to checkout screen

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Search returned matching customer |
| **Test Steps** | 1. Click Select next to a customer row<br>2. Wait for navigation |
| **Expected Result** | Route changes to /sales-manager/physical-allocation/checkout; customer context loaded |
| **Priority** | Critical |

---

## Unit Allocation & Payment

### SM_ALLOC_007 — Available units displayed with pricing details

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On checkout page; units available for customer apartment type |
| **Test Steps** | 1. Inspect unit listing<br>2. Verify each card shows unit no, floor, tower, typology, carpet area, agreement value, allocation amount, GST, discounts, all-inclusive price |
| **Expected Result** | All 10 fields per FS 2.3 displayed per unit card |
| **Priority** | Critical |

---

### SM_ALLOC_008 — Floor & Unit Plan modal opens on click

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On checkout page |
| **Test Steps** | 1. Click Floor & Unit Plan button<br>2. Inspect modal |
| **Expected Result** | Modal opens displaying architectural floor plan; close button works |
| **Priority** | Medium |

---

### SM_ALLOC_009 — Cost Sheet shows full pricing breakdown

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On checkout page |
| **Test Steps** | 1. Click Cost Sheet button<br>2. Inspect cost sheet content |
| **Expected Result** | Cost sheet displays agreement value, GST, taxes, discounts, all-inclusive price |
| **Priority** | High |

---

### SM_ALLOC_010 — Selecting a unit places it on 20-minute HOLD

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Available unit visible on checkout |
| **Test Steps** | 1. Click Select on a unit<br>2. Observe unit status and timer |
| **Expected Result** | Unit moves to HOLD state in Redis; 20-min countdown timer starts per BR 2.5.1 |
| **Priority** | Critical |

---

### SM_ALLOC_011 — QR code payment modal opens

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit selected and on hold |
| **Test Steps** | 1. Choose Online → QR Code payment<br>2. Inspect QrScannerModal |
| **Expected Result** | QR code rendered; customer can scan with phone to pay |
| **Priority** | Critical |

---

### SM_ALLOC_012 — Offline payment requires reference, amount, date, and proof upload

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit selected; OfflinePaymentDrawer open |
| **Test Steps** | 1. Click Record Offline Payment<br>2. Leave fields empty<br>3. Click Submit |
| **Expected Result** | Submission blocked; all 4 fields (reference, amount, date, proof file) shown as mandatory per BR 2.5.4 |
| **Priority** | Critical |

---

### SM_ALLOC_013 — Unit released to AVAILABLE if payment not completed in 20 minutes

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit on HOLD; payment not initiated |
| **Test Steps** | 1. Place unit on hold<br>2. Wait 20 minutes without completing payment<br>3. Refresh and inspect unit status |
| **Expected Result** | Unit returns to AVAILABLE per BR 2.5.2; hold released; customer can no longer pay for it |
| **Priority** | Critical |

---

### SM_ALLOC_014 — Successful payment marks unit BOOKED and proceeds to KYC

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit on HOLD; valid payment in progress |
| **Test Steps** | 1. Complete payment via QR / gateway / offline<br>2. Wait for confirmation screen |
| **Expected Result** | Unit status → BOOKED, registration unit → WINNER per FS 2.6.3; auto-navigation to KYC screen |
| **Priority** | Critical |

---

## KYC Completion

### SM_ALLOC_015 — Primary applicant fields auto-filled from registration

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Payment successful; on /sales-manager/physical-allocation/kyc |
| **Test Steps** | 1. Inspect primary applicant section<br>2. Verify name, mobile, email fields |
| **Expected Result** | All registration-derived fields pre-populated per BR 3.6.2; SM can edit missing fields |
| **Priority** | Critical |

---

### SM_ALLOC_016 — All 4 mandatory documents required per applicant

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On KYC screen |
| **Test Steps** | 1. Upload only 3 of 4 documents (omit Aadhaar back)<br>2. Click Submit KYC |
| **Expected Result** | Submission blocked with error indicating Aadhaar back is required per BR 3.6.3 |
| **Priority** | Critical |

---

### SM_ALLOC_017 — Add Co-Applicant — max 3 additional allowed

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On KYC screen with primary applicant |
| **Test Steps** | 1. Click + Add Applicant 3 times<br>2. Inspect button state after 4th total applicant |
| **Expected Result** | Add Applicant button disabled/hidden at 4 total; label "Max. 4 Applicants allowed" shown per FS 3.5 |
| **Priority** | High |

---

### SM_ALLOC_018 — Co-applicant relationship restricted to blood relatives

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Adding a co-applicant |
| **Test Steps** | 1. Open relationship dropdown<br>2. Inspect available options |
| **Expected Result** | Only blood relatives listed: Father, Mother, Spouse, Son, Daughter, Sibling, etc per FS 3.5 |
| **Priority** | Medium |

---

### SM_ALLOC_019 — KYC submission sets isKycSubmitted = true and generates PDF

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | All applicants completed with all 4 documents each |
| **Test Steps** | 1. Click Submit KYC<br>2. Wait for system response |
| **Expected Result** | Success confirmation; KYC PDF generated via Puppeteer, stored in Azure Blob; isKycSubmitted = true on registration unit per FS 3.7 |
| **Priority** | Critical |

---
