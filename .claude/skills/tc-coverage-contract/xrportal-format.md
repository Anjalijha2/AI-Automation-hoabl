# XR Portal — Test-Sheet Gold-Standard Format

Every per-module test sheet across all 4 portals (Admin / Sales Manager / Channel Partner /
Buyer) MUST match this exact layout. The authoritative reference is the **Admin → Customers**
master sheet. Deviating from this format is a defect.

## Sheet name

`<Module> - Master` (e.g. `Customers - Master`, `Login - Master`).

## Row layout

```
Row 1        : "Some points to remember of testcases"   (notes-block title)
Rows 2..N    : numbered notes (module-specific glossary + global conventions)
(blank row)
Header row   : the 12 column headers (below)
Banner row   : Sub-Module name (e.g. "Login & Landing")   — spans, bold, tinted fill
  TC rows    : all test cases belonging to that sub-module, in execution order
Banner row   : next Sub-Module
  TC rows    : ...
```

## The 12 columns (exact header text)

| Col | Header | Content |
|-----|--------|---------|
| 1 | `Testcase_ID` | e.g. `ADM_CUST_001`, `TC_CUST_NEG_097` |
| 2 | `Module Name` | e.g. `Customers` |
| 3 | `Sub Module` | e.g. `KPI Cards`, `Cancel Unit (Booked rows)` |
| 4 | `Testcase_Scenario` | SHORT label — "To verify the Customers page login and landing" |
| 5 | `Testcase Description` | The detailed "Verify that …" plain-English sentence |
| 6 | `Precondition` | Plain — "An admin is logged in and on the Customers page." |
| 7 | `Test Steps` | Numbered human actions, real on-screen labels, NO selectors/API params |
| 8 | `Test data` | Human-readable values; `[TEST_DATA_REQUIRED]` for disposable destructive data |
| 9 | `Expected results` | Exactly what the user sees — labels, messages, empty-states, modal titles |
| 10 | `Actual result` | BLANK at authoring (filled at execution) |
| 11 | `Stauts: Pass/Fail` | BLANK at authoring (note: header text kept verbatim, incl. the typo "Stauts") |
| 12 | `Pass/Fail Resource - Anjali` | Tester name column, BLANK at authoring |

> Execution results are **inline** (cols 10-12), NOT in a separate sheet.

## Notes block (rows 1-6) — global conventions

Row 1 is the title `Some points to remember of testcases`. Then numbered notes. Always
include these standing conventions (add module-specific ones above them):

1. `<ID prefix> = registration/record prefix used in this module (e.g., GHNG-1000008563).`
2. `[TEST_DATA_REQUIRED] = a disposable UAT record/unit must be supplied before executing this destructive test.`
3. `[VERIFY WITH DEV] = behaviour not confirmed in requirements/FSD/BRD; confirm before treating Pass/Fail as authoritative.`
4. `KPI cards always show global project totals and do NOT recompute when the table is filtered, searched, or sorted.` (Customers-specific — adapt per module.)
5. `Destructive tests (Cancel / Swap / Parking / Assign Unit) require user authorisation before running on UAT.`

## Sub-Module banners

Group TCs by Sub-Module. Insert a banner row before each group whose cell text = the
Sub-Module name. Customers reference uses 20 sub-modules in this order:

```
Login & Landing · KPI Cards · Table - Structure & Content · Sorting & Column Filters ·
Search by Phone · Filters · Pagination · Refresh · Three-dot Menu Visibility ·
Home Loan Approval · Cancel Unit (Booked rows) · Cancel Registration (Registered/Waitlisted) ·
Bulk Cancel · Assign Unit (Offline Booking) · Milestones · Unit Swap · Update Parking ·
Download / Export · API & Security · Error Handling
```

Other modules define their own sub-module list from their screens + BRD — but always group,
always banner, always execution-ordered (dependencies first).

## Prose style (cols 4/5/7/9)

- **Testcase_Scenario (col 4)**: short "To verify the <thing>" label.
- **Testcase Description (col 5)**: "Verify that <plain English what is checked and the condition>."
- **Test Steps (col 7)**: numbered, the exact clicks/typing a person performs, using the
  labels visible on screen. No CSS selectors, no API params, no DB column names.
- **Expected results (col 9)**: exactly what the user sees — real button/label/message text,
  KPI names, table column names, modal titles, empty-state text, where on screen. Short
  technical notes allowed as a trailing parenthetical only.

## ID scheme

Keep BOTH historical prefixes that already exist in the workbook (`ADM_<MOD>_NNN` baseline +
`TC_<MOD>_<TYPE>_NNN` supplemental). New TCs continue the highest existing number in the
appropriate type series. Never renumber existing IDs.

## Styling

- Header row: white bold text on dark-blue fill (`FF2E5C8A`).
- Notes-block title + sub-module banners: tinted fill, bold.
- All data cells: top-aligned, wrap text.
- Column widths tuned for readability (ID ~18, Scenario/Steps/Expected wide ~50-60).
