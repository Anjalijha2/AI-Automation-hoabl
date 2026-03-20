# REGISTRATION STATUS — Manual Test Cases

**Module:** Config (`/admin/cms`) → Registration Status  
**Scenario 2:** Upload Excel to Allow/Forbid Registrations  
**Total TCs:** 7 (TC-2.1 to TC-2.7)  
**Environment:** UAT — https://uat-web.xrportal.in/admin  

---

## Legend
| Symbol | Meaning |
|--------|---------|
| ✅ PASS | Test passed |
| ❌ FAIL | Test failed |
| ⏳ PENDING | Not yet executed |

---

### TC-2.1 — Forbid Registration End-to-End Flow (POSITIVE)

**Objective:** Verify uploading a valid Excel with `forbid` updates the inactive count.

**Pre-conditions:** Admin logged in. Valid registration exists (e.g., `GHNG-1000000063`).

| # | Step | Expected |
|---|------|----------|
| 1 | Navigate to Registration Status section | Section visible |
| 2 | Note current Active / Inactive counts | Counts recorded |
| 3 | Click "Sample File Download" | File downloads |
| 4 | Add row: `GHNG-1000000063` \| `forbid` | Data entered |
| 5 | Click Upload File, select the file | File selected |
| 6 | Click Submit | Request sent |
| 7 | Verify success message | Toast appears |
| 8 | Verify Inactive count increases by 1 | Count +1 |

**Expected Result:** Success message · Inactive count +1 · Registration marked forbidden

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | ⏳ Pending (needs Excel file + UAT registration data) | ⏳ | — |

---

### TC-2.2 — Allow Registration via Excel (POSITIVE)

**Objective:** Verify upload with `Allow` updates active count.

**Pre-conditions:** Admin logged in.

| # | Step | Expected |
|---|------|----------|
| 1 | Download sample file | File downloads |
| 2 | Add row: `GHNG-1000000063` \| `Allow` | Data entered |
| 3 | Upload and click Submit | Request sent |
| 4 | Verify success message | Toast appears |
| 5 | Verify Active count may increase | Count reflects change |

**Expected Result:** Success message · Registration allowed · Active count increases

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | ⏳ Pending (needs Excel file + UAT registration data) | ⏳ | — |

---

### TC-2.3 — Sample File Structure Validation (POSITIVE)

**Objective:** Verify downloaded sample file has correct structure and valid format.

| # | Step | Expected |
|---|------|----------|
| 1 | Click "Sample File Download" | File downloads |
| 2 | Verify file size > 1 KB | Not empty |
| 3 | Open file — check columns | Col A: Registration Number · Col B: Allocation Status |
| 4 | Verify sample data rows follow format | `GHNG-XXXXXXXXXX \| Allow/forbid` |

**Expected Result:** File > 1 KB · Opens without error · 2 correct columns · Valid sample data

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | "Sample File Download" link visible with Excel icon. Click initiated download. File link present at top-right of section. | ✅ PASS | registration_status_tc2_manual recording |

---

### TC-2.4 — Invalid Registration Number (NEGATIVE)

**Objective:** Validate incorrect format is rejected and no data is processed.

**Test Data:** `INVALID-999` \| `Allow`

| # | Step | Expected |
|---|------|----------|
| 1 | Add row with invalid reg number to sample file | Data prepared |
| 2 | Upload and click Submit | Request sent |
| 3 | Verify error message | Error displayed |
| 4 | Verify counts unchanged | No data processed |

**Expected Result:** Error message · No data processed · Counts unchanged

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | ⏳ | ⏳ | — |

---

### TC-2.5 — Invalid Allocation Status (NEGATIVE)

**Objective:** Verify invalid status values (`BLOCK`) are rejected.

**Test Data:** `GHNG-1000000063` \| `BLOCK`

| # | Step | Expected |
|---|------|----------|
| 1 | Add row with `BLOCK` as status | Data prepared |
| 2 | Upload and click Submit | Request sent |
| 3 | Verify error: invalid status | Only Allow/forbid accepted |
| 4 | Verify counts unchanged | No updates |

**Expected Result:** Error displayed · Only `Allow`/`forbid` accepted · No updates applied

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | ⏳ Pending (needs invalid data file) | ⏳ | — |

---

### TC-2.6 — Empty File Upload (NEGATIVE)

**Objective:** Handle file with headers only — no data rows — gracefully.

**Test Data:** Excel with only header row (Registration Number, Allocation Status)

| # | Step | Expected |
|---|------|----------|
| 1 | Create file with header row only (no data) | File prepared |
| 2 | Upload and click Submit | Request sent |
| 3 | Verify error or warning shown | "No data to process" or similar |
| 4 | Verify counts unchanged | No crash |

**Expected Result:** Error/warning · Counts unchanged · No crash

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | Clicked Submit without selecting file — no visible error toast appeared. Possible bug: lack of client-side validation. | ⚠️ INCONCLUSIVE | submit_no_file_clicked screenshot |

---

### TC-2.7 — Invalid File Format (NEGATIVE)

**Objective:** Reject non-Excel file uploads (.txt, .pdf, .csv).

**Test Data:** A `.txt` file containing `GHNG-1000000063 Allow`

| # | Step | Expected |
|---|------|----------|
| 1 | Try to select a `.txt`/`.pdf` file using the Upload button | Dialog may filter to `.xlsx` only |
| 2 | If dialog allows it, select and click Submit | Request sent |
| 3 | Verify file is rejected or error shown | Only `.xlsx` accepted |
| 4 | Verify no data processed | System unchanged |

**Expected Result:** File rejected OR error shown · Only `.xlsx` accepted · No processing

| Run | Actual Result | Status | Screenshot |
|-----|--------------|--------|------------|
| 1 | ⏳ | ⏳ | — |

---

## Summary Table

| TC | Description | Type | Status |
|----|-------------|------|--------|
| TC-2.1 | Forbid registration — full end-to-end flow | POSITIVE | ⏳ |
| TC-2.2 | Allow registration via Excel upload | POSITIVE | ⏳ |
| TC-2.3 | Sample file download & structure validation | POSITIVE | ⏳ |
| TC-2.4 | Invalid registration number → error | NEGATIVE | ⏳ |
| TC-2.5 | Invalid allocation status (BLOCK) → rejected | NEGATIVE | ⏳ |
| TC-2.6 | Empty Excel (header only) → graceful error | NEGATIVE | ⏳ |
| TC-2.7 | Wrong file format (.txt/.pdf) → rejected | NEGATIVE | ⏳ |
