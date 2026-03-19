# Admin CMS Business Logic & Data Validation Test Strategy and Test Cases

**Module:** Admin CMS
**Document Type:** Manual Test Cases

---

## Section 1 — TOWER CONFIGURATION: ACTIVE / INACTIVE TOGGLE (SPRINT 2)

| TC# | Module | Type | Test Case | Test Data | Pre-Condition | Steps | Expected Result |
|-----|--------|------|-----------|-----------|---------------|-------|-----------------|
| TC_Admin_001 | Admin CMS | POSITIVE | Validate Admin user is able to see all the existing list of towers and their statuses | Valid Admin user Credentials | Tower table exists in DB with data. Admin uses valid url. Admin has access. | 1. Navigate to Admin CMS URL<br>2. Navigate to Tower Configuration section<br>3. View the list of towers | All the existing list of Active and Inactive towers are displayed along with their name, status and action toggle. |
| TC_Admin_002 | Admin CMS | POSITIVE | Validate Admin user is able to turn Inactive an Active tower. | Valid Admin credentials. Tower "Triumph" in active state. | At least one tower in 'Active' state. Admin has valid credentials. | 1. Navigate to Admin CMS URL<br>2. Go to Tower Configuration section<br>3. Look for Tower "Triumph" which is Active (toggle should be green and on)<br>4. Click on the Toggle button (should turn gray and off)<br>5. Click on 'Update Tower Configurations' button | Success message: 'Tower Status Updated Successfully'. Status of Tower Triumph should be correctly changed to Inactive both on UI and reflect in DB. |
| TC_Admin_003 | Admin CMS | NEGATIVE | Validate admin is not able to turn inactive an active tower without saving | Valid admin credentials. Active Tower "Triumph" | At least one tower is active. Admin is logged in. | 1. Login to admin CMS URL<br>2. Go to tower config<br>3. Toggle "Triumph" to inactive<br>4. Without clicking 'Update', navigate away or reload page. | Tower status should revert back to Active on reload since it was not saved. |
| TC_Admin_004 | Admin CMS | POSITIVE | Validate admin is able to turn active an inactive tower. | Valid Admin credentials. Tower "Triumph" inactive. | At least one tower is inactive. | 1. Login to admin CMS URL<br>2. Go to tower config<br>3. Toggle "Triumph" to active<br>4. Click Update | Success message: 'Tower Status Updated Successfully'. Status changes to Active in UI and DB. |
| TC_Admin_005 | Admin CMS | POSITIVE | Validate 'View Tower >' link functionality | Valid Admin credentials. At least one tower listing. | List of towers is displayed on Tower Config | 1. Login to Admin CMS URL<br>2. Go to Tower Configuration<br>3. Click on the 'View Tower >' link for any tower | Admin is navigated to the Tower specific detail/inventory view correctly. |

---

## Section 2 — REGISTRATION STATUS: UPLOAD BULK CSV (ALLOW / FORBID)

| TC# | Module | Type | Test Case | Test Data | Pre-Condition | Steps | Expected Result |
|-----|--------|------|-----------|-----------|---------------|-------|-----------------|
| TC_Admin_006 | Admin CMS | POSITIVE | Validate download format of Sample CSV File from 'Sample File Download' link. | Admin credentials | Admin is logged in | 1. Login to Admin CMS URL<br>2. Go to Registration Status section<br>3. Click on 'Sample File Download' link<br>4. Open the downloaded CSV | File should be named correctly (e.g. Allocation.csv) and must contain correct headers: 'Registration Number', 'Allocation Status'. |
| TC_Admin_007 | Admin CMS | POSITIVE | Validate admin can bulk upload Registration numbers with status Allow. | CSV with valid registration numbers e.g. GHNG-1000000063 \| Allow | Valid registration numbers exist in system. | 1. Download sample file<br>2. Add valid Registration Numbers with Allocation Status = Allow<br>3. Choose File and upload<br>4. Click Submit | Success Message. Registrations uploaded should be set to 'Allow' status in DB. |
| TC_Admin_008 | Admin CMS | POSITIVE | Validate admin can bulk upload Registration numbers with status Forbid. | CSV with valid registration numbers e.g. GHNG-1000000063 \| Forbid | Valid registration numbers exist in system. | 1. Download sample file<br>2. Add valid Registration Numbers with Allocation Status = Forbid<br>3. Choose File and upload<br>4. Click Submit | Success Message. Registrations uploaded should be set to 'Forbid' status in DB. |
| TC_Admin_009 | Admin CMS | NEGATIVE | Validate upload fails if invalid registration number is provided in CSV. | Registration Number: INVALID-999 \| Allow | Admin is logged in | 1. Prepare CSV with invalid Registration Number<br>2. Upload and Submit | Error Message: 'Invalid Registration Number' or upload fails/skips row. |
| TC_Admin_010 | Admin CMS | NEGATIVE | Validate upload fails if Allocation Status value is invalid in CSV. | GHNG-1000000063 \| BLOCK (instead of Forbid or Allow) | Admin is logged in | 1. Prepare CSV with status "BLOCK"<br>2. Upload and Submit | Error Message indicating invalid status. Only 'Allow' or 'Forbid' are accepted. |
| TC_Admin_011 | Admin CMS | NEGATIVE | Validate upload fails if file format is incorrect (e.g. .txt). | .txt file instead of .csv | Admin is logged in | 1. Upload a text file instead of CSV<br>2. Submit | Error message validating correct file extension (.csv). |

---

## Section 3 — UNIT STATUS: UPLOAD BULK CSV (AVAILABLE / RESERVED)

| TC# | Module | Type | Test Case | Test Data | Pre-Condition | Steps | Expected Result |
|-----|--------|------|-----------|-----------|---------------|-------|-----------------|
| TC_Admin_012 | Admin CMS | POSITIVE | Validate Sample file format from 'Sample File Download' in Unit Status | Admin credentials | Admin is logged in | 1. Go to Unit Status<br>2. Click 'Sample File Download'<br>3. Verify CSV headers | Downloaded file contains headers: Tower, Floor, Unit_No, Unit_Type, Status, Update |
| TC_Admin_013 | Admin CMS | POSITIVE | Validate changing unit status to AVAILABLE | Tower: Triumph, Floor: 1, Unit: 101, Status: AVAILABLE, Update: 1 | Valid Unit list | 1. Prepare CSV to update status to AVAILABLE with Update=1<br>2. Upload and Submit | Success. Unit status is changed to AVAILABLE in the DB. |
| TC_Admin_014 | Admin CMS | NEGATIVE | Validate skipping row if Update is set to 0 | Tower: Triumph, Floor: 1, Unit: 101, Status: AVAILABLE, Update: 0 | Admin is logged in | 1. Prepare CSV to update status to AVAILABLE but Update=0<br>2. Upload and Submit | Row should be skipped. Status remains unchanged. |

---

## Section 4 — UNIT COST UPDATE: UPLOAD BULK CSV (AGREEMENT VALUE / EARLY BIRD)

| TC# | Module | Type | Test Case | Test Data | Pre-Condition | Steps | Expected Result |
|-----|--------|------|-----------|-----------|---------------|-------|-----------------|
| TC_Admin_015 | Admin CMS | POSITIVE | Validate Inventory Download file format | Admin credentials | Admin is logged in | 1. Click 'Available Unit Inventory Download'<br>2. Verify downloaded file | Downloaded file contains columns like Tower, Floor, Unit_No, Agreement_Value, EarlyBird, Update |
| TC_Admin_016 | Admin CMS | POSITIVE | Validate changing unit Agreement Value and EarlyBird discount | Agreement=3799999, EarlyBird=27000, Update=1 | Valid Unit list | 1. Edit Agreement Value and EarlyBird fields for a unit. Update=1<br>2. Upload and Submit | Success. Prices are updated in DB. |
| TC_Admin_017 | Admin CMS | NEGATIVE | Validate error on invalid characters in Agreement Value | Agreement: 'abc' | Admin is logged in | 1. Upload CSV with 'abc' in Agreement Value<br>2. Submit | Error message indicating invalid data type. Price is not updated. |
