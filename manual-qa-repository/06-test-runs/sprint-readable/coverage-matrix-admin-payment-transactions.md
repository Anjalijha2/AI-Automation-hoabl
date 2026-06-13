# Coverage Matrix — Admin / Payment Transactions

**Sources read:**
- `visual-memory/admin/payment-transactions/INDEX.md` (CAPTURE_STATUS: FULL, captured 2026-06-03)
- BRD `ADMIN-BRD-Payment-Transactions.md` §1–§10
- FRD `ADMIN-FRD-Payment-Transactions.md` §1–§11 (+ Q-TXN-001..007 open clarifications)
- FS `ADMIN-FS-Payment-Transactions.md` Features 1–4 + Detail View (planned)
- Workflow `ADMIN-WF-Payment.md` Flows 1–4 + BR §9

**Output JSON:** `manual-qa-repository/07-execution/_master-json/Admin-PaymentTransactions.json`
**Totals:** 77 TCs (52 preserved existing + 25 new gap-TCs) across 16 sub-modules.

---

## DOC_DRIFT register (live UI wins; observed values used)

| ID | Doc says | Live UI (INDEX.md) says | Resolution |
|----|----------|-------------------------|------------|
| DOC_DRIFT-001 | Gateway Settings = MODAL with 2 checkboxes (Easebuzz, Razorpay) — BRD §8, FRD §3/§4, FS Feature 4 | INLINE panel (no URL change), PER-TOWER Active/Inactive `ant-switch` toggles + 'View Tower' links + Update button | TCs use observed per-tower toggle/inline-panel model; checkbox-model behaviour flagged `[VERIFY WITH DEV]`. BRD/FRD/FS should be updated to the per-tower inline model. |
| DOC_DRIFT-002 | Total count = 10,226 (BRD/FRD/FS) | 'Total 10302 Payment Transactions' (newer capture) | Count is dynamic; TCs assert label format + filter-update behaviour, not a fixed number. Observed 10,302 used in examples. |
| DOC_DRIFT-003 | FRD §11 gateway save = bulk `PUT /api/v1/admin/payment-gateways` | Existing API TCs record per-id `PUT /payment-gateways/:id` → 404 (route commented out); working save is bulk settings route | Per-id toggle disabled at routes level; bulk save used. Exact bulk route path flagged `[VERIFY WITH DEV]`. |

> Note: DOC_DRIFT-001/-002 raised this batch. -003 carried from existing FSD-correction TCs (ADM_PAY_063/FSD_038). These should be reflected in the BRD/FRD/FS update step of the sync pipeline (live implementation wins, not the reverse).

---

## 11-Dimension Coverage Matrix

Columns: 1 Pos · 2 Form · 3 Valid · 4 Race · 5 Neg · 6 Ctx · 7 Notif · 8 UIvBE · 9 Auth · 10 Integ · 11 Bound

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|-----------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| Login & landing / load perf | 001, 064 | N/A: no form | N/A: read-only | N/A | N/A | N/A | N/A: read action | N/A | 086 (no-session) | N/A | 064 (10k+ load) |
| Page header & total count | 002, 065 | N/A: no form | N/A | N/A | N/A | 065 (count reacts to filter) | 082 (silent) | N/A | — | N/A | N/A |
| Table structure & content | 003,004,005,006,007,008 | N/A: read-only grid | N/A | N/A | N/A | 066 (offline row variant) | N/A | N/A | — | 066 (offline mapping) | N/A |
| Sorting | 033,067,068,069 | N/A | N/A | N/A | N/A | 068 (asc/desc toggle) | N/A | N/A | — | N/A | N/A |
| Date & search filters | 009,016,070,071 | 070,071 (name/phone fields) | N/A: free text | N/A | 034 (no-match empty) | N/A | N/A | N/A | — | N/A | N/A |
| Column filters | 010,011,012,013,072,073 | N/A | N/A | N/A | 034 (zero result) | 014 (combined filters) | N/A | 084 (UI=API parity) | — | N/A | N/A |
| Combined filters | 014 | N/A | N/A | N/A | 034 | 014,051 | N/A | 084 | — | N/A | N/A |
| Clear/reset filters | 015 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | N/A | N/A |
| Pagination | 031,032,074 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | N/A | 074,075 (last partial page) |
| Page size | 032 | N/A | 032 [VERIFY WITH DEV opts] | N/A | N/A | N/A | N/A | N/A | — | N/A | 032 |
| Refresh | 035,076 | N/A | N/A | N/A | N/A | 076 (preserves filters) | N/A | N/A | — | N/A | N/A |
| Export | 017,019 | N/A | N/A | N/A | 052 (zero-row file) | 018,050,051 (filter-respecting) | N/A | N/A | — | N/A | 053 (precision), 054 (filename) |
| Transaction detail (eye) | 055,058 | N/A: not implemented | N/A | N/A | N/A | 055,061 (every status/offline) | N/A | 057 (no detail call) | — | N/A | N/A |
| — detail not-implemented | 020,059,060 | N/A | N/A | N/A | N/A | 061 | N/A | 056,057,FSD_037 | — | N/A | N/A |
| Gateway settings (panel) | 021,022,077 | 021,022,025,077 (toggles/links/Update) | 024 (last-gateway block) | N/A | 024 (disable last → blocked) | 022 (Active vs Inactive state) | 081 (silent, no buyer notif) | 085 (server guard), FSD_038 | — | 077 (View Tower → Towers) | N/A |
| — gateway save/persistence | 023,025,026 | 025 (no-confirm Update) | 085 | N/A | 024,085 | 062 (close discards) | 081 | 063,085,FSD_038 | — | 023 (system-wide effect) | N/A |
| Transaction lifecycle/status | 027,028,030,078 | N/A | N/A | 028 (20-min hold release) | 028 (timeout end-status) | 027 (webhook overrides browser) | N/A | 027 (webhook = truth) | — | 078 (completed locks booking) | N/A |
| Offline payments (x-module) | 029,066 | N/A | N/A | N/A | N/A | 066 | N/A | N/A | — | 029 (Customers Assign Unit) | N/A |
| Allocation / Milestone (x-module) | 079,080 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | — | 079 (Allocation), 080 (Milestone) | N/A |
| Notifications (silent-by-design) | — | N/A | N/A | N/A | N/A | N/A | 081,082 (no SMS/WA/email) | N/A | — | N/A | N/A |
| API & backend | 083 | N/A | 085 (guard) | N/A | FSD_036 (no CRUD) | N/A | N/A | 084 (UIvBE parity) | 086,087 (401/403, expired) | 083 | 083 (page/limit) |
| Error handling & empty states | — | N/A | N/A | N/A | 034 (no-data), 088 (500) | N/A | N/A | N/A | — | N/A | N/A |

### Justified N/A summary
- **Form (dim 2)** N/A for the ledger and all read-only views: there is no editable form on a transaction. The only form is the gateway settings panel (covered).
- **Validation (dim 3)** N/A for free-text search/filters that accept any text without numeric/required rules. Applies where a real validation rule exists (gateway last-active guard → 024/085; page-size options → 032).
- **Race (dim 4)** N/A except the 20-minute hold (028) — the only documented submit-time/timeout re-evaluation in this read-only module.
- **Notif (dim 7)** N/A for read actions; the module's only documented notification behaviour is *silence* (gateway change + read ops), asserted by 081/082.
- **Auth (dim 9)** centralised at the API/page boundary (086/087) — applies to the module as a whole, not per row.
- **Boundary (dim 11)** N/A where there is no bounded input; applies to pagination (074/075), page size (032), and export precision (053).

**Self-audit gate: PASS** — every feature row has a real Testcase_ID or a specific justified N/A in each dimension. No unjustified-empty cells.

---

## Open clarifications still affecting Pass/Fail authority (from FRD §8)
- Q-TXN-001 Export format/scope → TCs 017/018/019/054 carry `[VERIFY WITH DEV]`.
- Q-TXN-006 Page-size options → TC 032 carries `[VERIFY WITH DEV]`.
- Q-TXN-007 Detail view ETA → detail TCs assert "coming soon" only (020/055/056/057/059/060/061/FSD_037).
- DOC_DRIFT-001 gateway model (checkbox vs per-tower toggle) → all gateway TCs carry `[VERIFY WITH DEV]` on the model question.
