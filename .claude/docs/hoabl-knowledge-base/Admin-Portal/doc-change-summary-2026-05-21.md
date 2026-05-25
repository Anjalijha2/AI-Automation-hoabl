# Doc Change Summary — 2026-05-21

## Triggered by: Backend source-code audit (admin.controller.js getAllBuyers, lines 107–760+)

Authoritative source: `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Customers-GetAllBuyers-TechSpec.md` (Tech Lead Agent, 2026-05-21).

All three downstream documents were reconciled against this Tech Spec. Six corrections applied across three files.

---

### File: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md`

#### Change: §4 KPI Cards — global, not filter-scoped (Correction 4)
- **Was:** "All numbers update in real time as the underlying data changes." (no filter-scope statement)
- **Now:** "KPI cards are computed by a SEPARATE database aggregate query that does NOT apply any active table filter, search, or sort. KPI values always show global project totals. Filtering the table will NOT change the KPI tile numbers."
- **Reason:** Tech Spec §4 — separate aggregate query at admin.controller.js lines 127–193 runs before filter conditions are built.

#### Change: §4 KPI Cards — allotedCount dead code (Correction 6)
- **Was:** No mention of allotedCount status.
- **Now:** "The `allotedCount` KPI value is commented out in source (lines 153–161, 203) and is NOT returned in the `adminKpi` response. There is no 'Alloted' KPI tile — do not test or expose this value."
- **Reason:** Tech Spec §4 / §7.1.

#### Change: §5 Searching for a Specific Customer — phone-only (Correction 2)
- **Was:** Implied broader search.
- **Now:** "'Search by Phone' maps to `globalSearch` and performs a substring match against `User.phone` ONLY. The original OR branches for first_name, last_name, registration_number, confirmation_number, unit_no, and tower_name are commented out in source (lines 288–293). Any prior text claiming this search covers name/registration/unit/tower is incorrect."
- **Reason:** Tech Spec §2 row 1 / §7.1 item 1.

#### Change: §5 Downloading Data + §6 Rule 5 + §7 Validations — export respects filters (Correction 1)
- **Was:** "Download exports all registrations regardless of filter / ignores filters."
- **Now:** "Export respects all active filters. `isDownload=1` removes pagination only. Filter active → only matching records exported. No filter → full export. The `isDownload=1` flag does NOT bypass filter `where[Op.and]` conditions."
- **Reason:** Tech Spec §3 — `isDownload === '1'` only toggles `paginationConfig` (line 125); filter `conditions` array attached to `where[Op.and]` unconditionally (lines 280–516).

#### Change: §5 Filtering Registrations — added UI Label → API Value mapping table (Correction 3 supplement)
- **Was:** Param name and values listed inline only.
- **Now:** Explicit table mapping UI labels (Registered, Booked Online, Booked Offline, Waitlisted, Cancelled/Refunded, Alloted) to API values (`registered`, `booked_online`, `booked_offline`, `waitlisted`, `refunded`, `alloted`).
- **Reason:** Tech Spec §2.1 — QA needs unambiguous label → value map for filter test fixtures.

---

### File: `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Customers.md`

#### Change: Feature 1 §5 KPI Cards — global, not filter-scoped (Correction 4)
- **Was:** KPI definitions without filter-scope clarification.
- **Now:** Each KPI annotated "global project total"; explicit note that filter/search/sort do NOT recompute KPI tiles. Source: `admin.controller.js` lines 127–193.
- **Reason:** Tech Spec §4.

#### Change: Feature 1 §5 — allotedCount dead-code flag (Correction 6)
- **Was:** Not mentioned.
- **Now:** Dead-code flag added: `allotedCount` commented out (lines 153–161, 203), not returned in `adminKpi`, do not expose or test.
- **Reason:** Tech Spec §4 / §7.1.

#### Change: Feature 1 §7 Filters — allotmentStatus param + values + mapping (Correction 3)
- **Was:** Filter referenced as `allocationStatus` (incorrect name).
- **Now:** Correct param name `allotmentStatus`; accepted comma-separated values (`alloted`, `waitlisted`, `booked_online`, `booked_offline`, `refunded`, `registered`); UI Label → API Value mapping table added.
- **Reason:** Tech Spec §2 / §2.1 — exact param name and predicate set from admin.controller.js lines 219, 228, 381.

#### Change: Feature 1 §7 Filters — globalSearch phone-only (Correction 2)
- **Was:** Search by Phone field described without scope qualification.
- **Now:** "`globalSearch` performs LIKE %value% against `User.phone` ONLY. All other OR branches (first_name, last_name, registration_number, confirmation_number, unit_no, tower_name) commented out (lines 288–293)."
- **Reason:** Tech Spec §2 row 1 / §7.1 item 1.

#### Change: Feature 1 §7 Filters — hasHomeLoan completion-only (Correction 5)
- **Was:** hasHomeLoan filter described without narrowed semantics.
- **Now:** "`hasHomeLoan=true` strictly evaluates `HomeLoan.status='completed'` only. Original two-branch `loan_type`/`step` logic is commented out (lines 307–315). `hasHomeLoan=false` evaluates `HomeLoan.status IN ('in_progress', NULL)`."
- **Reason:** Tech Spec §2 row 2 / §7.1 item 2.

#### Change: Feature 4 §2 / §6 Rule 1 / How to Use — export respects filters (Correction 1)
- **Was:** "Export downloads ALL registrations regardless of active filter."
- **Now:** "Export respects active filters. `isDownload=1` removes pagination only. Filter active → filtered export. No filter → full export. The `isDownload=1` flag does NOT bypass filter `where[Op.and]` conditions — it only removes the `limitOffset(limit, page)` pagination."
- **Reason:** Tech Spec §3.

---

### File: `manual-qa-repository/03-user-manual/admin/customers.md`

#### Change: Feature 2 Search by Phone — phone-only (Correction 2)
- **Was:** Field labelled but no clarification about backend scope.
- **Now:** "`globalSearch` query param performs LIKE %value% against `User.phone` ONLY. Despite the broader-sounding label, the field cannot find a buyer by name, registration number, confirmation number, unit number, or tower name."
- **Reason:** Tech Spec §2 row 1 / §7.1.

#### Change: Feature 3 Filter Registrations — allotmentStatus param + mapping table (Correction 3)
- **Was:** Allocation Status filter listed values without explicit param-name correction or mapping.
- **Now:** Param name `allotmentStatus` (not `allocationStatus`); UI Label → API Value mapping table added; accepted comma-separated case-sensitive values listed.
- **Reason:** Tech Spec §2 / §2.1.

#### Change: Feature 12 Download Export + Troubleshooting — export respects filters (Correction 1)
- **Was:** "Download returns all customers regardless of filter."
- **Now:** "Active filters ARE respected by the export. `isDownload=1` removes pagination only. Filter active = filtered export (e.g. Allocation Status = Cancelled → XLSX contains only Cancelled records). No active filter = full export."
- **Reason:** Tech Spec §3.

---

## QA Impact (for QA Agent Phase 3)

The following manual test cases in `manual-qa-repository/01-test-cases/admin-portal/customers/TC_CUSTOMERS.md` and any corresponding API/E2E specs require revision based on the six corrections.

### Tests affected by Correction 1 — export respects filters
- INVERT any TC asserting "Download returns all customers regardless of filter".
- REWRITE any TC asserting filter does NOT affect download.
- New TCs needed:
  - `TC_CUST_FUNC_EXPORT_FILTERED_ALLOTMENT` — Apply `allotmentStatus=refunded` filter → Download → assert XLSX row count = filtered count.
  - `TC_CUST_FUNC_EXPORT_FILTERED_KYC` — Apply `kycStatus=KYC Pending` → Download → assert XLSX contains only KYC Pending rows.
  - `TC_CUST_FUNC_EXPORT_FILTERED_PHONE` — Apply phone search → Download → XLSX contains only matching rows.
  - `TC_CUST_FUNC_EXPORT_NO_FILTER` — No filter → Download → assert XLSX row count = global total.
  - `TC_CUST_API_EXPORT_ISDOWNLOAD_STRICT_STRING` — `isDownload=true` and `isDownload=1` (numeric) take the table branch; only literal `'1'` triggers Excel.

### Tests affected by Correction 2 — globalSearch phone-only
- INVALIDATE (or convert to known-limitation negative tests) any TC asserting "Search finds buyer by name/registration/unit/tower via the Search field".
- New TCs needed:
  - `TC_CUST_FUNC_SEARCH_PHONE_POSITIVE` — Substring of phone matches.
  - `TC_CUST_FUNC_SEARCH_NAME_NEGATIVE` — Name substring → 0 results (phone-only).
  - `TC_CUST_FUNC_SEARCH_REGNUM_NEGATIVE` — Registration number → 0 results.
  - `TC_CUST_FUNC_SEARCH_UNITNO_NEGATIVE` — Unit number → 0 results.
  - `TC_CUST_FUNC_SEARCH_TOWER_NEGATIVE` — Tower name → 0 results.

### Tests affected by Correction 3 — allotmentStatus param naming + values
- RENAME any API spec using request param `allocationStatus` → `allotmentStatus`.
- UPDATE any TC referencing accepted values ("Cancelled", "Booked", "Available") → exact case-sensitive API values (`refunded`, `booked_online` / `booked_offline`, `registered`).
- New TCs needed:
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_REGISTERED`
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_BOOKED_ONLINE`
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_BOOKED_OFFLINE`
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_WAITLISTED`
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_REFUNDED`
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_ALLOTED`
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_MULTI` — Comma-separated multi-value (`booked_online,booked_offline`).
  - `TC_CUST_API_FILTER_ALLOTMENTSTATUS_INVALID` — Unknown value → no rows, no 500.
  - `TC_CUST_API_FILTER_PARAMNAME_WRONG` — `allocationStatus=registered` → backend ignores (no filter applied).

### Tests affected by Correction 4 — KPI global, never filter-scoped
- INVERT any TC asserting "KPI tile recomputes when filter is applied".
- New TCs needed:
  - `TC_CUST_FUNC_KPI_INVARIANT_UNDER_FILTER_ALLOTMENT` — Apply allotmentStatus filter → assert all 6 KPI tile values unchanged.
  - `TC_CUST_FUNC_KPI_INVARIANT_UNDER_FILTER_KYC` — Apply kycStatus filter → KPIs unchanged.
  - `TC_CUST_FUNC_KPI_INVARIANT_UNDER_SEARCH` — Search by phone → KPIs unchanged.
  - `TC_CUST_FUNC_KPI_INVARIANT_UNDER_SORT` — Change sort → KPIs unchanged.

### Tests affected by Correction 5 — hasHomeLoan completion-status only
- INVALIDATE any TC asserting `hasHomeLoan=true` matches `loan_type`/`step` combinations.
- New TCs needed:
  - `TC_CUST_API_HASHOMELOAN_TRUE_COMPLETED` — `hasHomeLoan=true` → only `HomeLoan.status='completed'` rows.
  - `TC_CUST_API_HASHOMELOAN_FALSE_INPROGRESS_OR_NULL` — `hasHomeLoan=false` → rows with `in_progress` or NULL.
  - `TC_CUST_API_HASHOMELOAN_TRUE_NOT_INPROGRESS` — `hasHomeLoan=true` does NOT return `in_progress` rows.

### Tests affected by Correction 6 — allotedCount dead code
- INVALIDATE any TC asserting `adminKpi.allotedCount` exists or has a value.
- REMOVE any UI assertion expecting an "Alloted" KPI tile.
- New TCs needed:
  - `TC_CUST_API_ADMINKPI_NO_ALLOTEDCOUNT` — Assert response does NOT include `allotedCount` key (`undefined`).
  - `TC_CUST_UI_NO_ALLOTED_TILE` — Assert only 6 KPI tiles render (Registered, Inactive, Cancelled, KYC Pending, Confirmed, Active Towers).

---

## Files changed (this phase)

1. `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md` — Corrections 1, 2, 3 (mapping table), 4, 6 (5 areas of edits)
2. `.claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Customers.md` — Corrections 1, 2, 3, 4, 5, 6 (6 areas of edits)
3. `manual-qa-repository/03-user-manual/admin/customers.md` — Corrections 1, 2, 3 (3 areas of edits)

**Total: 14 targeted edits across 3 files. All six corrections applied per the file × correction matrix specified by Tech Lead spec ADMIN-FS-Customers-GetAllBuyers-TechSpec.md §9.**
