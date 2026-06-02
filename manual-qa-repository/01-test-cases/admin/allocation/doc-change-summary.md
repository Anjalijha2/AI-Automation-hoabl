# Doc Change Summary — Admin / Allocation — 2026-06-02

**Phase:** BA Agent Phase 1 (initial TC generation)
**Module:** Admin Portal / Allocation

---

## Dual-Source Confirmation

| Source | Path | Status | Used For |
|--------|------|--------|----------|
| Visual memory INDEX.md | `visual-memory/admin/allocation/INDEX.md` | **FULL** (captured 2026-06-01, viewport 1920×900) | Selectors in Steps; UI structure for Expected Results; cited filename in Visual Evidence column |
| BRD/FRD | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Allocation.md` | **PRESENT** (243 lines, §1–§10.26 reconciled 2026-05-21) | Scenario context; business rules; requirement IDs in BRD Req ID column |

**Dual-source rule satisfied:** YES — both sources confirmed available before `manual-tester` was invoked. Neither was inferred or skipped.

---

## What Changed This Run

| Item | Action |
|------|--------|
| `manual-qa-repository/01-test-cases/admin/allocation/TestCases.md` | **CREATED** — 34 TCs (4 UI, 9 FUNC, 6 VAL, 3 BIZ, 3 NEG, 4 EDGE, +5 inferred type combos), Sheet 2 with 27 automation candidates, Sheet 3 bug template |
| `manual-qa-repository/01-test-cases/admin/allocation/test-data-spec.md` | **CREATED** — valid inputs + invalid/boundary inputs + preconditions + cleanup, all traced to BRD §/§10.x or INDEX.md form notes |
| `manual-qa-repository/01-test-cases/admin/allocation/review-report.md` | **CREATED** — Conditional approval; 79.4% visual coverage (just below 80% Approved threshold); 100% doc logic coverage; 0 LOGIC_GAP; 0 VISUAL_MISMATCH |
| `manual-qa-repository/01-test-cases/admin/allocation/doc-change-summary.md` | **CREATED** — this file |
| BRD/FRD source documents | **NO CHANGE** — this is a new TC batch run; sync-pipeline Step 2 not triggered |

---

## Per-Section Source Attribution

| BRD/FRD Section | Used By |
|-----------------|---------|
| §1 Purpose | UI_001 |
| §3 Campaign Types | FUNC_005, FUNC_006, FUNC_007 |
| §4 Key Business Rules (1–5) | VAL_008, BIZ_022, BIZ_023, FUNC_018, FUNC_019 |
| §5 Campaign Status Flow | FUNC_017, FUNC_018, FUNC_019, FUNC_020 |
| §6 Admin Workflow | UI_001–004, FUNC_005–007, FUNC_014–016 |
| §10.1 Default project | EDGE_033 |
| §10.2 commonPoolExcel | FUNC_007, NEG_026 |
| §10.3 XLSX error response | NEG_025 |
| §10.4 Rounds endpoint | FUNC_028 |
| §10.5 Allotments export | FUNC_029 |
| §10.6 Notify endpoint | FUNC_030 |
| §10.7 Update `action` field | FUNC_018, FUNC_019 (tolerated) |
| §10.16 2-min pre-start blackout | BIZ_022 |
| §10.17 Stale auto-FAILED | BIZ_024 |
| §10.18 Async Stop/Cancel via Python | FUNC_018 (caveat noted) |
| §10.19 20-min hold release | EDGE_031 |
| §10.20 Payment status release | EDGE_032 |
| §10.25 DYNAMIC 20-cap | NEG_027 |
| §10.26 PHYSICAL_EVENT asymmetry | EDGE_034 |

**INDEX.md sources used:**
- Page Headings (`h5` "Allocation", `h5` "New Allocation Campaign") → UI_001
- Form Required-fields table (5 selectors + Description textarea) → UI_002, VAL_009, VAL_010, VAL_011, VAL_012, VAL_013
- Filter Bar selectors → UI_003, FUNC_014, FUNC_015, FUNC_016
- Campaign Table column headers + empty-state text → UI_001
- Sidebar Navigation list → UI_004
- Form action buttons (Reset, Save Campaign) → FUNC_005–007, FUNC_021
- Ant Design Notes (chronology guard, async controls) → VAL_011, FUNC_014

---

## Gaps and Flags Raised

| Flag | Items | Action Owner |
|------|-------|--------------|
| Visual coverage 79.4% (below 80% Approved threshold) | 7 NO-VISUAL TCs | Tech Lead Agent — extend INDEX.md to cover Rounds/Export/Notify, OR QA Agent reclassifies edge cases to API/DB suites |
| Async Stop/Cancel timing per §10.18 | FUNC_018 | QA Agent — implement polling/Refresh pattern |
| Cross-module unit release (§10.19, §10.20) | EDGE_031, EDGE_032 | Towers module visual capture (separate INDEX.md) |
| Aspirational FAILED status per §10 KNOWN ISSUES | BIZ_024 | Documented in TC — outcome is "document observed state" |
| Cross-user cancel ownership (§10 KNOWN ISSUE) | NOT generated (per BRD instruction) | Flagged to Developer Agent in BRD §10 — re-evaluate after source fix |
| Double-booking race (§10 KNOWN ISSUE) | NOT generated as functional TC | BRD §10 marks as out-of-scope stress test |

---

## Phase 1 Verdict

**Status:** Conditional Approval (per review-report.md)
**Reason:** Visual coverage at 79.4% — 0.6% below Approved threshold. No LOGIC_GAP, no VISUAL_MISMATCH. All TCs in Sheet 2 (27) carry FULL visual evidence.
**Recommended next step:** QA Agent may proceed to execute the 27 automation-candidate TCs immediately. The 7 NO-VISUAL TCs remain manual-only until the visual gap is closed by Tech Lead Agent or they are reclassified to API/DB suites.
**No requirement gaps:** every TC has a BRD/FRD reference. No `GAP:` blocks raised; BRD/FRD is comprehensive for this module.

---

## Handoff

| Agent | Receives | Purpose |
|-------|----------|---------|
| QA Agent | `TestCases.md`, `test-data-spec.md`, `review-report.md` | Test execution + automation scaffolding (27 TCs) |
| Tech Lead Agent | This `doc-change-summary.md` (specifically the Gaps and Flags table) | Optional: expand visual-memory INDEX.md for Rounds/Export/Notify UIs to raise visual coverage above 80% |

No source code changes required from Developer Agent.
