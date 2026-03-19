# CONFIG PAGE

## Description
System configuration page for XR Portal Admin. Contains 9 sections for managing towers,
upload-based status/pricing updates, sales managers, customer registration controls, and
max preferences. All sections are stacked vertically on a long scrollable page.

## URL
`https://uat-web.xrportal.in/admin/cms`

## Requires Auth
Yes. Session must be initialized via `auth.setup.ts`.

## Page Structure (9 Sections)

| # | Section Heading | Type | Key Actions |
|---|----------------|------|-------------|
| 1 | Tower Configuration | Toggle grid | 18 toggles + Update button |
| 2 | Registration Status | Upload | Sample DL, Upload, Submit |
| 3 | Unit Status | Upload | Sample DL, Upload, Submit |
| 4 | Unit Cost Update | Upload | Inventory DL, Upload, Submit |
| 5 | Bulk Booking Cancellation | Upload | Sample DL, Upload, Submit |
| 6 | Bulk Registration Cancellation | Upload | Sample DL, Upload, Submit |
| 7 | Sales Managers | Upload | Sample DL, Upload, Submit |
| 8 | Customer Actions Card | Toggle + form | Toggle, checkboxes, dropdowns, Submit |
| 9 | Max Preferences Per Unit | Dropdown + Button | Select value, Update |

## Element Selectors
Loaded from `docs/selectors/config.json`.

### Key Selector Patterns
- **Section-scoped elements**: `getSectionCard('SectionName')` → XPath parent traversal: `h5[text] → .data-content-header parent → section container`
  - **Note:** Sections do NOT use `.ant-card` wrapper — XPath is required, not `.ant-card.filter()`
- **Tower toggles**: `page.evaluate()` DOM traversal via `getTowerToggleInfo('Tower N - Name')`
- **View Tower button**: `page.evaluate()` to find button index → `page.locator('button').nth(index).click()` (JS click doesn't trigger React navigation)
- **Customer Actions toggle**: `page.evaluate()` from `h5 'Allow Additional Registrations:'`
- **Customer Actions dropdowns**: `page.evaluate()` to get `.ant-select-selector` index → Playwright click. Option scoped to `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` (multiple hidden dropdowns exist in DOM)
- **Toast verification**: `.ant-message-notice` or `.ant-message-success`

## Section 1 — Tower Configuration

18 towers arranged in a 2-column grid. Each tower card has:
- H5 heading: `Tower N - Name` (e.g. `Tower 8 - Crest`)
- `View Tower >` link (green text)
- Active/Inactive toggle (`.ant-switch`)

| Tower | Name | Default State (UAT) |
|-------|------|---------------------|
| Tower 1 | Dawn | Inactive |
| Tower 2 | Aura | Inactive |
| Tower 3 | Glory | Inactive |
| Tower 4 | Pride | Inactive |
| Tower 5 | Grace | Inactive |
| Tower 6 | Aspire | Inactive |
| Tower 7 | Blossom | Inactive |
| Tower 8 | Crest | **Active** |
| Tower 9 | Triumph | Inactive |
| Tower 10 | Crown | **Active** |
| Tower 11 | Prime | Inactive |
| Tower 12 | Pinnacle | Inactive |
| Tower 13 | Prestige | Inactive |
| Tower 14 | Horizon | Inactive (changed by TC_CUST_017) |
| Tower 15 | Radiance | Inactive |
| Tower 16 | Fortune | Inactive |
| Tower 17 | Bright | Inactive |
| Tower 18 | Grand | Inactive |

**Note:** BRD documents Tower 14-Horizon as "Active by default" but current UAT state is Inactive
(modified by TC_CUST_017 regression tests). Tower 8-Crest and Tower 10-Crown are reliably Active.

### Button
`button:has-text('Update Tower Configuration')` — saves all toggle changes.

## Section 2–7 — Upload Sections

All follow the same pattern. Key buttons per section (scoped to section card):

| Section | Download Button | File Input Accept |
|---------|----------------|-------------------|
| Registration Status | `Sample File Download` | `.xlsx,.csv` |
| Unit Status | `Sample File Download` | `.xlsx,.csv` |
| Unit Cost Update | `Available Unit Inventory Download` | `.xlsx,.csv` |
| Bulk Booking Cancellation | `Sample File Download` | `.xlsx` |
| Bulk Registration Cancellation | `Sample File Download` | `.xlsx` |
| Sales Managers | `Sample File Download` | `.xlsx` |

Upload pattern: `Upload File` button → file input → `Submit` button.

**Critical:** Multiple "Upload File" and "Submit" buttons exist on the page. Always scope
to the section card using `getSectionCard('Section Name')`.

## Section 8 — Customer Actions Card

Controls whether customers can add additional unit registrations from Customer Portal.

| Element | Selector Strategy |
|---------|------------------|
| Allow Additional Registrations toggle | `page.evaluate()` from `h5 'Allow Additional Registrations:'` → `.ant-switch` |
| Allow 1 Bed Growth Home checkbox | `h6:has-text('Allow 1 Bed Growth Home')` → nearest checkbox |
| Allow 2 Bed Growth Home checkbox | `h6:has-text('Allow 2 Bed Growth Home')` → nearest checkbox |
| Allow 2 Bed Rise Home checkbox | `h6:has-text('Allow 2 Bed Rise Home')` → nearest checkbox |
| Count dropdowns | `.ant-select` scoped to each bed type row |
| Submit button | `button:has-text('Submit')` scoped to Customer Actions Card |

## Section 9 — Max Preferences Per Unit

| Element | Selector |
|---------|---------|
| Dropdown | `.ant-select-selector` scoped to Max Preferences Per Unit card |
| Update button | `button:has-text('Update')` scoped to Max Preferences Per Unit card |
| Success toast | `.ant-message-notice` |

## Page Object File
`automation/pages/config.page.ts`

## Automation Test File
`automation/tests/config.spec.ts`

## Workflows

### 1. Tower Activate/Deactivate
1. `navigate()` to Config page.
2. `getTowerToggleInfo('Tower 8 - Crest')` → get current state.
3. `clickTowerToggle('Tower 8 - Crest')` → flip toggle.
4. `saveConfiguration()` → click Update button + wait for networkidle.
5. Verify toast appears: `waitForSuccessToast()`.
6. **Cleanup**: `clickTowerToggle` + `saveConfiguration` to restore.

### 2. Section-Scoped Upload
1. `scrollToSection('Registration Status')` → bring section into view.
2. `downloadSampleFile('Registration Status')` → returns local path.
3. Modify Excel using `xlsx` library.
4. `setUploadFile('Registration Status', modifiedPath)` → sets file input.
5. `clickSubmitInSection('Registration Status')` → submit + wait.
6. `waitForSuccessToast()` → verify.

### 3. Max Preferences Update
1. `scrollToSection('Max Preferences Per Unit')`.
2. `setMaxPreferences('6')` → open dropdown, click option.
3. `clickMaxPreferencesUpdate()` → click Update button.
4. `waitForSuccessToast()`.

### 4. Customer Actions Card Toggle
1. `scrollToSection('Customer Actions Card')`.
2. `isCustomerActionsActive()` → read current state.
3. `toggleCustomerActions()` → flip toggle.
4. `submitCustomerActions()` → Submit + wait.
5. `waitForSuccessToast()`.

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Initial CONFIG.md created. ConfigPage added for TC_CUST_006 and TC_CUST_017. |
| 2026-03-15 | Replaced Playwright-locator-based `towerSection()` with `towerSwitchInfo()` using `page.evaluate()` DOM traversal. |
| 2026-03-19 | Full CONFIG.md rewrite for Sprint 1. BRD received (52 TCs across 9 sections). Discovery crawler run. All 9 sections documented with selectors, workflows. Sprint 1 scope: 19 TCs (Tower Config 6, Max Prefs 4, Customer Actions 3, Sample Downloads 6). Sprint 2 deferred: 33 upload/cross-portal/payment TCs. |
| 2026-03-19 | Agent 4 execution: Fixed 3 selector bugs. (1) getSectionCard changed from .ant-card filter to XPath parent traversal (sections use no .ant-card wrapper). (2) clickViewTowerLink changed from JS .click() to Playwright click via button index. (3) setCustomerActionsCount dropdown scoped to :not(.ant-select-dropdown-hidden). All 19/19 TCs now pass. |
