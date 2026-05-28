# Test Cases — Physical Allocation (In-Person Event)
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Physical-Allocation.md
**FSD Reference:** `manual-qa-repository/03-user-manual/sm-portal/fsd-physical-allocation.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- Available only when an `Allocation Campaign` of mode `PHYSICAL_EVENT` is active.
- KYC PDF generation uses Puppeteer; storage = **Azure Blob** (not S3).
- KYC PDF upload has **NO file size limit** — multer limits commented out (KNOWN BUG).
- KYC tracking via **boolean flags on `registration_units`** (isKycSubmitted, eVerificationCompleted, selfKycSubmitted, etc.) — NOT a dedicated KYC model or `kyc_documents` table.
- No admin KYC approval flow — self-attested only.
- Notify Physical Event campaign dispatches QR codes via `POST /campaigns/:id/notify`.

---

## Campaign Gate & Page Load

### SM_ALLOC_001 — Physical Allocation route accessible only during PHYSICAL_EVENT campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | SM logged in; no active PHYSICAL_EVENT campaign |
| **Type** | NEG |
| **Test Steps** | 1. Navigate to /sales-manager/physical-allocation<br>2. Observe page state |
| **Expected Result** | Empty state or message "Physical Allocation unavailable — no active campaign" per BR 1.5.1; customer search hidden |
| **Priority** | Critical |

---

### SM_ALLOC_002 — Customer Search screen loads during active campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | PHYSICAL_EVENT campaign active; SM logged in |
| **Type** | UI |
| **Test Steps** | 1. Click Physical Allocation in nav<br>2. Wait for page render |
| **Expected Result** | Customer Search page loads with search input, results area, and Select button placeholders |
| **Priority** | Critical |

---

### SM_PA_022 — Direct URL access to /physical-allocation blocked without an active PHYSICAL_EVENT campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **BRD/FRD Req** | FS 1.5.1 / FRD Module 3 |
| **Pre-conditions** | SM logged in; no PHYSICAL_EVENT campaign currently active |
| **Type** | NEG |
| **Test Steps** | 1. Type /sales-manager/physical-allocation directly in URL bar<br>2. Press Enter<br>3. Observe page state |
| **Expected Result** | Empty state or "Physical Allocation unavailable — no active campaign" shown; customer search input is hidden or disabled; no campaign-id leaked in network calls |
| **Priority** | Critical |

---

### SM_PA_023 — Physical Allocation nav link visible only when PHYSICAL_EVENT campaign is active

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Nav |
| **BRD/FRD Req** | FRD Module 3 / FS 1.2 |
| **Pre-conditions** | SM logged in; toggle PHYSICAL_EVENT campaign on/off via admin |
| **Type** | UI |
| **Test Steps** | 1. With NO active PHYSICAL_EVENT campaign, inspect side nav / bottom nav<br>2. Activate a PHYSICAL_EVENT campaign in admin<br>3. Refresh SM portal and inspect nav |
| **Expected Result** | Nav entry for Physical Allocation hidden or disabled when no campaign active; appears or enables once a PHYSICAL_EVENT campaign is active |
| **Priority** | High |

---

### SM_PA_024 — Customer Search page loads quickly under acceptable performance budget

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Performance |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | PHYSICAL_EVENT campaign active; SM logged in |
| **Type** | UI |
| **Test Steps** | 1. Open Chrome DevTools → Performance / Network<br>2. Navigate to /sales-manager/physical-allocation<br>3. Capture page-load timings |
| **Expected Result** | Search page reaches interactive within an acceptable threshold (e.g. < 3s on UAT); no failing API calls; no blocking network requests |
| **Priority** | Medium |

---

### SM_PA_025 — Page Load shows skeleton/loader while campaign-active check is in flight

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | SM logged in; network throttled to Slow 3G |
| **Type** | UI |
| **Test Steps** | 1. Throttle network in DevTools<br>2. Navigate to /sales-manager/physical-allocation<br>3. Observe page during the campaign-status fetch |
| **Expected Result** | A loader/skeleton is shown while the campaign-active API call is pending; no jarring blank state; final state (search vs. unavailable) renders on response |
| **Priority** | Medium |

---

### SM_PA_026 — Buyer / Channel Partner JWT cannot access SM /physical-allocation route

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Security |
| **BRD/FRD Req** | FRD Module 3 / restrictTo middleware |
| **Pre-conditions** | Valid Buyer JWT and Channel Partner JWT obtained |
| **Type** | NEG |
| **Test Steps** | 1. Set the Buyer JWT in Authorization header<br>2. Call GET /api/v1/sales-manager/physical-allocation/customers (or equivalent)<br>3. Repeat with Channel Partner JWT |
| **Expected Result** | Both calls return 403 Forbidden; route is gated to roleIds 4 and 5 only; no customer data leaks |
| **Priority** | Critical |

---

### SM_PA_027 — Page handles back-navigation from checkout cleanly

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **BRD/FRD Req** | FS 1.6.3 |
| **Pre-conditions** | SM already navigated from Customer Search → Checkout for a selected customer |
| **Type** | FUNC |
| **Test Steps** | 1. From checkout, click browser back<br>2. Observe Customer Search state<br>3. Try selecting the same customer again |
| **Expected Result** | Customer Search page renders without stale state; previously-selected customer can be reselected; no zombie context from prior checkout |
| **Priority** | Medium |

---

## Customer Search

### SM_ALLOC_003 — Search by customer name returns matching registrations

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On customer search page; registered customer named "Ravi Kumar" exists |
| **Type** | FUNC |
| **Test Steps** | 1. Type "Ravi" in search input<br>2. Wait for results |
| **Expected Result** | Matching registrations appear in results list with name and registration number |
| **Priority** | Critical |

---

### SM_ALLOC_004 — Search by phone number returns the registered customer

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On customer search page; customer with phone 9000000001 registered |
| **Type** | FUNC |
| **Test Steps** | 1. Type "9000000001" in search<br>2. Wait for results |
| **Expected Result** | Single matching customer record displayed |
| **Priority** | Critical |

---

### SM_ALLOC_005 — "No records found" shown for unmatched search

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On customer search page |
| **Type** | FUNC |
| **Test Steps** | 1. Type a non-existent name like "Zzz Nonexistent"<br>2. Wait for response |
| **Expected Result** | Empty state message "No records found" displayed per FS 1.5.4 |
| **Priority** | High |

---

### SM_ALLOC_006 — Selecting a customer navigates to checkout screen

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Search returned matching customer |
| **Type** | FUNC |
| **Test Steps** | 1. Click Select next to a customer row<br>2. Wait for navigation |
| **Expected Result** | Route changes to /sales-manager/physical-allocation/checkout; customer context loaded |
| **Priority** | Critical |

---

### SM_PA_028 — Search by registration number returns the matching customer

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **BRD/FRD Req** | FS 1.4 (search input scope) |
| **Pre-conditions** | A customer registered with known registration number e.g. REG-2024-00123 |
| **Type** | FUNC |
| **Test Steps** | 1. Type "REG-2024-00123" into the search input<br>2. Wait for results |
| **Expected Result** | Exactly that registration is shown; customer name, mobile, and registration number all displayed |
| **Priority** | High |

---

### SM_PA_029 — Search is debounced and does not fire on every keystroke

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Performance |
| **BRD/FRD Req** | FS 1.6.1 (system actions) |
| **Pre-conditions** | DevTools Network tab open; on customer search page |
| **Type** | FUNC |
| **Test Steps** | 1. Type "Ravi Kumar" character by character at normal speed<br>2. Inspect Network for outbound search requests |
| **Expected Result** | Search API fires only after a typing pause (debounced — typically 300-500ms); not one request per keystroke |
| **Priority** | Medium |

---

### SM_PA_030 — Customer with NO active registration cannot be selected

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **BRD/FRD Req** | FS 1.5.2 |
| **Pre-conditions** | A customer exists in the user table but has no active registration |
| **Type** | NEG |
| **Test Steps** | 1. Search by that customer's name or phone<br>2. Inspect search results |
| **Expected Result** | Either the customer does not appear in results (filtered by registration), or appears but Select button is disabled with a tooltip "No active registration" |
| **Priority** | Critical |

---

### SM_PA_031 — Search input handles special characters without errors

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Validation |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | On customer search page |
| **Type** | VAL |
| **Test Steps** | 1. Try typing characters like ' " < > % &<br>2. Observe page and network behaviour |
| **Expected Result** | No JS errors in console; no SQL/XSS reflection; backend safely escapes special characters; "No records found" or matching results displayed |
| **Priority** | High |

---

## Unit Allocation & Payment

### SM_ALLOC_007 — Available units displayed with pricing details

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On checkout page; units available for customer apartment type |
| **Type** | UI |
| **Test Steps** | 1. Inspect unit listing<br>2. Verify each card shows unit no, floor, tower, typology, carpet area, agreement value, allocation amount, GST, discounts, all-inclusive price |
| **Expected Result** | All 10 fields per FS 2.3 displayed per unit card |
| **Priority** | Critical |

---

### SM_ALLOC_008 — Floor & Unit Plan modal opens on click

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On checkout page |
| **Type** | UI |
| **Test Steps** | 1. Click Floor & Unit Plan button<br>2. Inspect modal |
| **Expected Result** | Modal opens displaying architectural floor plan; close button works |
| **Priority** | Medium |

---

### SM_ALLOC_009 — Cost Sheet shows full pricing breakdown

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On checkout page |
| **Type** | UI |
| **Test Steps** | 1. Click Cost Sheet button<br>2. Inspect cost sheet content |
| **Expected Result** | Cost sheet displays agreement value, GST, taxes, discounts, all-inclusive price |
| **Priority** | High |

---

### SM_ALLOC_010 — Selecting a unit places it on 20-minute HOLD

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Available unit visible on checkout |
| **Type** | FUNC |
| **Test Steps** | 1. Click Select on a unit<br>2. Observe unit status and timer |
| **Expected Result** | Unit moves to HOLD state in Redis; 20-min countdown timer starts per BR 2.5.1 |
| **Priority** | Critical |

---

### SM_ALLOC_011 — QR code payment modal opens

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit selected and on hold |
| **Type** | UI |
| **Test Steps** | 1. Choose Online → QR Code payment<br>2. Inspect QrScannerModal |
| **Expected Result** | QR code rendered; customer can scan with phone to pay |
| **Priority** | Critical |

---

### SM_ALLOC_012 — Offline payment requires reference, amount, date, and proof upload

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit selected; OfflinePaymentDrawer open |
| **Type** | VAL |
| **Test Steps** | 1. Click Record Offline Payment<br>2. Leave fields empty<br>3. Click Submit |
| **Expected Result** | Submission blocked; all 4 fields (reference, amount, date, proof file) shown as mandatory per BR 2.5.4 |
| **Priority** | Critical |

---

### SM_ALLOC_013 — Unit released to AVAILABLE if payment not completed in 20 minutes

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit on HOLD; payment not initiated |
| **Type** | EDGE |
| **Test Steps** | 1. Place unit on hold<br>2. Wait 20 minutes without completing payment<br>3. Refresh and inspect unit status |
| **Expected Result** | Unit returns to AVAILABLE per BR 2.5.2; hold released; customer can no longer pay for it |
| **Priority** | Critical |

---

### SM_ALLOC_014 — Successful payment marks unit BOOKED and proceeds to KYC

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Unit on HOLD; valid payment in progress |
| **Type** | FUNC |
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
| **Type** | UI |
| **Test Steps** | 1. Inspect primary applicant section<br>2. Verify name, mobile, email fields |
| **Expected Result** | All registration-derived fields pre-populated per BR 3.6.2; SM can edit missing fields |
| **Priority** | Critical |

---

### SM_ALLOC_016 — All 4 mandatory documents required per applicant

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On KYC screen |
| **Type** | VAL |
| **Test Steps** | 1. Upload only 3 of 4 documents (omit Aadhaar back)<br>2. Click Submit KYC |
| **Expected Result** | Submission blocked with error indicating Aadhaar back is required per BR 3.6.3 |
| **Priority** | Critical |

---

### SM_ALLOC_017 — Add Co-Applicant — max 3 additional allowed

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | On KYC screen with primary applicant |
| **Type** | EDGE |
| **Test Steps** | 1. Click + Add Applicant 3 times<br>2. Inspect button state after 4th total applicant |
| **Expected Result** | Add Applicant button disabled/hidden at 4 total; label "Max. 4 Applicants allowed" shown per FS 3.5 |
| **Priority** | High |

---

### SM_ALLOC_018 — Co-applicant relationship restricted to blood relatives

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **Pre-conditions** | Adding a co-applicant |
| **Type** | BIZ |
| **Test Steps** | 1. Open relationship dropdown<br>2. Inspect available options |
| **Expected Result** | Only blood relatives listed: Father, Mother, Spouse, Son, Daughter, Sibling, etc per FS 3.5 |
| **Priority** | Medium |

---

### SM_ALLOC_019 — [FSD-CORRECTION] KYC submission sets isKycSubmitted flag on registration_units (no dedicated KYC table)

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation |
| **BRD/FRD Req** | FSD §1 / `services/allocation.service.js:1850` (submitKycService) |
| **Pre-conditions** | All applicants completed with all 4 documents each |
| **Type** | DB |
| **Test Steps** | 1. Click Submit KYC<br>2. Wait for system response<br>3. Query `SELECT isKycSubmitted, isKycPdfSubmitted FROM registration_units WHERE id=<x>` |
| **Expected Result** | Success confirmation; KYC PDF generated via Puppeteer, stored in **Azure Blob** (not S3); `isKycSubmitted=true` on `registration_units` row. NO `kyc_documents` table exists — KYC tracked entirely via boolean flags on registration_units. Self-attested; no admin approval flow exists. |
| **Priority** | Critical |

---

### SM_PA_032 — Submit KYC blocked until primary applicant mandatory fields are complete

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / KYC |
| **BRD/FRD Req** | FS 3.3 / FS 3.6.1 |
| **Pre-conditions** | On KYC screen; primary applicant has missing field e.g. email empty |
| **Type** | VAL |
| **Test Steps** | 1. Clear primary applicant email or address<br>2. Upload all 4 documents for primary applicant<br>3. Click Submit KYC |
| **Expected Result** | Submission blocked; field-level error shown on the missing primary applicant field; no API call to submit endpoint |
| **Priority** | Critical |

---

### SM_PA_033 — Co-applicant requires all 4 documents — partial upload rejected

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / KYC |
| **BRD/FRD Req** | FS 3.6.3 |
| **Pre-conditions** | Primary applicant fully completed; one co-applicant added |
| **Type** | VAL |
| **Test Steps** | 1. For co-applicant, upload only Photo + PAN (skip Aadhaar front/back)<br>2. Click Submit KYC |
| **Expected Result** | Submission blocked; error indicates co-applicant 2 is missing Aadhaar front and back; submit endpoint not called |
| **Priority** | Critical |

---

### SM_PA_034 — Removing a co-applicant clears their uploaded documents from form state

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / KYC |
| **BRD/FRD Req** | FS 3.5 |
| **Pre-conditions** | Co-applicant added with 4 documents uploaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click Remove on the co-applicant card<br>2. Confirm any confirmation modal<br>3. Re-add a fresh co-applicant<br>4. Inspect document fields |
| **Expected Result** | Removed co-applicant's documents are cleared from form state; the new co-applicant starts with empty document slots; no leftover blob references |
| **Priority** | High |

---

## [FSD-CORRECTION] New TCs — Physical Allocation source-verified gaps

### SM_ALLOC_FSD_020 — [BUG-REF: BUG-KYC-001] KYC PDF upload has NO file size limit

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Security |
| **BRD/FRD Req** | FSD §6 / multer limits commented out |
| **Pre-conditions** | A 500 MB dummy PDF prepared |
| **Type** | NEG |
| **Test Steps** | 1. Attempt KYC PDF upload with the 500 MB file |
| **Expected Result** | Backend accepts the upload — multer file-size limit is commented out. This is a DoS / storage-cost risk. Document as critical security/operations bug. |
| **Priority** | Critical |

---

### SM_ALLOC_FSD_021 — [FSD-CORRECTION] No admin KYC approval flow — self-attested only

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Admin |
| **BRD/FRD Req** | FSD §1 (no admin approve route) |
| **Pre-conditions** | A registration unit with `isKycSubmitted=true` |
| **Type** | BIZ |
| **Test Steps** | 1. As admin, look for any UI/API to review or approve KYC documents |
| **Expected Result** | No such admin endpoint exists. KYC submission is final on SM/buyer side — no review gate. Document as expected (self-attestation model). |
| **Priority** | Medium |

---

## General

### SM_PA_035 — Unauthenticated user redirected to login when accessing /physical-allocation

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Security |
| **BRD/FRD Req** | FRD Module 3 / global auth gate |
| **Pre-conditions** | Browser session cleared; no SM JWT in storage |
| **Type** | NEG |
| **Test Steps** | 1. Open /sales-manager/physical-allocation directly<br>2. Observe redirect behaviour |
| **Expected Result** | User redirected to /sales-manager login; no customer data or campaign state pre-rendered |
| **Priority** | Critical |

---

### SM_PA_036 — Booking persists in DB after successful payment and refresh

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Data Persistence |
| **BRD/FRD Req** | FS 2.6.3 |
| **Pre-conditions** | Completed unit booking + payment for a customer |
| **Type** | DB |
| **Test Steps** | 1. After "BOOKED" confirmation, refresh the browser<br>2. Re-navigate to checkout for same customer<br>3. Query DB `SELECT status FROM units WHERE id=<x>` |
| **Expected Result** | Unit shows BOOKED in UI and DB; registration_unit row shows WINNER; SM cannot re-book the same unit |
| **Priority** | Critical |

---

### SM_PA_037 — Concurrent SMs cannot place same unit on HOLD

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Concurrency |
| **BRD/FRD Req** | FS 2.5.1 / FS 2.5.3 |
| **Pre-conditions** | Two SMs logged in concurrently; same unit AVAILABLE |
| **Type** | EDGE |
| **Test Steps** | 1. SM-A clicks Select on Unit 3502<br>2. SM-B simultaneously clicks Select on Unit 3502<br>3. Inspect Redis HOLD owner |
| **Expected Result** | Only one SM gets the HOLD (first-write wins); the other receives an "Unit currently held" error; no double-hold in Redis |
| **Priority** | Critical |

---

### SM_PA_038 — KYC submission is synced to LeadSquared CRM

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Integration |
| **BRD/FRD Req** | FS 3.6.5 |
| **Pre-conditions** | Complete a KYC submission successfully (Note: LSQ is excluded from active testing per project constraints — verify event dispatch only) |
| **Type** | INT |
| **Test Steps** | 1. Submit KYC via UI<br>2. Inspect application logs for LSQ-sync event/queue push |
| **Expected Result** | A LeadSquared sync event is enqueued/dispatched after KYC submit succeeds (verify via app logs/queue depth — do not call LSQ APIs directly). |
| **Priority** | Medium |

---

### SM_PA_039 — Audit log records unit allocation event with SM user ID and timestamp

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Audit |
| **BRD/FRD Req** | FRD Module 3 audit |
| **Pre-conditions** | A unit successfully BOOKED via SM Portal physical allocation |
| **Type** | DB |
| **Test Steps** | 1. Note SM's user ID and timestamp at booking<br>2. Query audit_logs for entity_type=unit, action=BOOKED |
| **Expected Result** | Audit row exists with SM's user ID, unit ID, before/after status (HOLD → BOOKED), and timestamp within seconds of booking |
| **Priority** | High |

---

### SM_PA_040 — Network failure during payment shows recoverable error, not silent failure

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Error Handling |
| **BRD/FRD Req** | FS 2.6.4 |
| **Pre-conditions** | Unit on HOLD; QR/offline payment in progress; DevTools available to throttle/cut network |
| **Type** | NEG |
| **Test Steps** | 1. Initiate payment<br>2. Drop network mid-request (DevTools Offline)<br>3. Observe UI behaviour |
| **Expected Result** | UI shows a recoverable error like "Payment status unknown — please retry or check booking"; HOLD timer remains until 20-min expiry; SM is not led to assume success |
| **Priority** | Critical |

---

### SM_PA_041 — KYC PDF generated includes all applicants and matches submitted form

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / KYC |
| **BRD/FRD Req** | FS 3.6.4 / FS 3.7 |
| **Pre-conditions** | KYC submitted with 1 primary + 2 co-applicants |
| **Type** | INT |
| **Test Steps** | 1. After submit, locate the generated KYC PDF via Azure Blob URL or download link<br>2. Open the PDF |
| **Expected Result** | PDF contains all 3 applicants (names, mobile, relationship, document thumbnails); content matches the form values submitted; PDF is not corrupted |
| **Priority** | High |

---

### SM_PA_042 — User-friendly error when PHYSICAL_EVENT campaign expires mid-flow

| Field | Value |
|-------|-------|
| **Module** | SM – Physical Allocation / Edge |
| **BRD/FRD Req** | FS 1.5.1 / FS 2.6.4 |
| **Pre-conditions** | PHYSICAL_EVENT campaign active; SM mid-way through customer search or checkout |
| **Type** | EDGE |
| **Test Steps** | 1. SM is on customer search or checkout<br>2. Admin deactivates the PHYSICAL_EVENT campaign<br>3. SM continues to next step (Select customer or Confirm unit) |
| **Expected Result** | API rejects the next action with a clear "Campaign no longer active" error; user redirected back to the campaign-unavailable empty state; no orphaned HOLD created |
| **Priority** | High |

---
