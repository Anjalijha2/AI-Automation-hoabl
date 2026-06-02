# Test Case Review Report — Allocation — Admin Portal — 2026-06-02

**Reviewer skill:** test-case-reviewer
**TestCases under review:** `manual-qa-repository/01-test-cases/admin/allocation/TestCases.md`
**BRD/FRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Allocation.md`
**Visual memory:** `visual-memory/admin/allocation/INDEX.md` (CAPTURE_STATUS: FULL)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | 34 |
| Approved | 27 |
| Conditional (flagged) | 7 |
| Requires changes | 0 |
| Rejected | 0 |
| BRD/FRD coverage | 100% (all sections §1–§10.26 represented) |
| Visual coverage | 27/34 = **79.4%** (TCs with screenshot-backed Expected Results) |
| Doc logic coverage | 34/34 = **100%** (every Scenario references BRD/FRD section) |
| Visual status | **MIXED** — FULL evidence on form/list states; NO-VISUAL-EVIDENCE on 7 API-level / cross-module / unseen-UI cases |

**Visual coverage just below the 80% Approved threshold (79.4%).** Approval Gate verdict: **Conditional**. See "Approval" below for the recommended path forward.

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_ALLOC_FUNC_028 | Paginated rounds list UI for DYNAMIC campaign | NO-EVIDENCE | n/a | Tech Lead Agent: capture Rounds detail screen on a DYNAMIC campaign; update INDEX.md |
| TC_ALLOC_FUNC_029 | Allotments export download action | NO-EVIDENCE | n/a | Tech Lead Agent: capture Actions menu on a Completed campaign showing Export Allotments |
| TC_ALLOC_FUNC_030 | Notify Registrants action UI | NO-EVIDENCE | n/a | Tech Lead Agent: capture Actions menu on PHYSICAL_EVENT campaign showing Notify Registrants |
| TC_ALLOC_EDGE_031 | Unit HOLD→AVAILABLE after 20min (Towers cross-module) | NO-EVIDENCE | n/a | Cross-module — Towers module INDEX.md should cover; not blocking Allocation review |
| TC_ALLOC_EDGE_032 | Same as 031 (payment status release) | NO-EVIDENCE | n/a | Same — Towers/Buyer module evidence |
| TC_ALLOC_EDGE_033 | API-level default project fallback | NO-EVIDENCE | n/a | Inherently no UI screenshot — API/DB test, not e2e |
| TC_ALLOC_EDGE_034 | PHYSICAL_EVENT typology asymmetry | NO-EVIDENCE | n/a | Inherently no UI screenshot — backend asymmetry |

**Treatment:** All 7 `[NO-VISUAL-EVIDENCE]` TCs are correctly excluded from Sheet 2 (Automation Candidates). They remain in Sheet 1 as manual/exploratory cases.

---

## Logic Gaps

| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|
| (none) | — | — | All 34 TCs reference an explicit BRD §/§10.x section in the Scenario column |

**No LOGIC_GAP flags.** All scenarios derive purpose from BRD/FRD.

---

## Visual Mismatches

| TC_ID | Cited Filename | In INDEX.md? | Action |
|-------|---------------|--------------|--------|
| (none) | — | — | All cited filenames (`screenshot-desktop.png`) match the Screens table entry in INDEX.md |

**No VISUAL_MISMATCH flags.**

---

## BRD/FRD Coverage Matrix

| BRD Section | Covered By |
|------------|-----------|
| §1 Purpose | TC_ALLOC_UI_001 |
| §3 Campaign Types — Static | TC_ALLOC_FUNC_005 |
| §3 Campaign Types — Dynamic | TC_ALLOC_FUNC_006 |
| §3 Campaign Types — Physical Event | TC_ALLOC_FUNC_007, NEG_026 |
| §4 Rule 1 (3-min lead) | TC_ALLOC_VAL_008 |
| §4 Rule 2 (single active) | TC_ALLOC_BIZ_022 |
| §4 Rule 3 (tower prerequisite) | TC_ALLOC_BIZ_023 |
| §4 Rule 4 (post-campaign statuses) | Out of Allocation page scope — covered in Customers TCs |
| §4 Rule 5 (Stop vs Cancel) | TC_ALLOC_FUNC_018, FUNC_019 |
| §5 Status flow Upcoming→Active | TC_ALLOC_FUNC_017 |
| §5 Status flow Active→Completed | TC_ALLOC_FUNC_020 |
| §5 Status flow Active→Stopped | TC_ALLOC_FUNC_018 |
| §5 Status flow Upcoming→Cancelled | TC_ALLOC_FUNC_019 |
| §5 Status flow Active→Failed | Documented as aspirational per §10 known issue — see Constraints |
| §6.2 Admin workflow (page layout) | TC_ALLOC_UI_001, UI_002, UI_003, UI_004 |
| §6.3 Fill campaign form | TC_ALLOC_FUNC_005, VAL_008–012, VAL_013 |
| §6.4 Save Campaign | TC_ALLOC_FUNC_005, FUNC_006, FUNC_007, FUNC_021 |
| §6.5 Auto-Active | TC_ALLOC_FUNC_017 |
| §6.6 Monitor / filter | TC_ALLOC_FUNC_014, FUNC_015, FUNC_016 |
| §10.1 Default project fallback | TC_ALLOC_EDGE_033 |
| §10.2 PHYSICAL_EVENT commonPoolExcel | TC_ALLOC_FUNC_007, NEG_026 |
| §10.3 Excel error binary | TC_ALLOC_NEG_025 |
| §10.4 Rounds endpoint | TC_ALLOC_FUNC_028 |
| §10.5 Allotments export | TC_ALLOC_FUNC_029 |
| §10.6 Notify endpoint | TC_ALLOC_FUNC_030 |
| §10.7 Update with `action` field | Tolerated by FUNC_018, FUNC_019 (UI-driven, routing-agnostic) |
| §10.16 2-min pre-start blackout | TC_ALLOC_BIZ_022 |
| §10.17 Stale auto-FAILED | TC_ALLOC_BIZ_024 |
| §10.18 Stop/Cancel async via Python | Noted in TC_ALLOC_FUNC_018 Expected Result |
| §10.19 20-min hold release | TC_ALLOC_EDGE_031 |
| §10.20 Payment-status immediate release | TC_ALLOC_EDGE_032 |
| §10.25 DYNAMIC 20-cap | TC_ALLOC_NEG_027 |
| §10.26 PHYSICAL_EVENT asymmetry | TC_ALLOC_EDGE_034 |

**Explicitly NOT covered (by design — BRD §10 directives):**
- §10 KNOWN ISSUE `cancelUserAllocation` cross-user — BRD instructs QA not to write this test
- §10 KNOWN ISSUE `markAllocationCampaignFailed` destroy — observable proof impossible; documented in BIZ_024 caveat
- §10 KNOWN ISSUE double-booking race (§10 + §10.25 context) — flagged as stress test, OUT OF SCOPE per BRD
- §10.8 Tax computation, §10.9 Pricing, §10.10–§10.14 KYC/payment — belong to Customers/Booking module, not Allocation page

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_ALLOC_UI_001 | §1 + §6.2 | FULL | YES | Approved | — |
| TC_ALLOC_UI_002 | §6.2 | FULL | YES | Approved | — |
| TC_ALLOC_UI_003 | §6.2 | FULL | YES | Approved | — |
| TC_ALLOC_UI_004 | §6 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_005 | §6.3 + §6.4 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_006 | §3 + §6.3 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_007 | §3 + §10.2 | FULL | YES | Approved | — |
| TC_ALLOC_VAL_008 | §4 Rule 1 | FULL | YES | Approved | — |
| TC_ALLOC_VAL_009 | §6.3 | FULL | YES | Approved | — |
| TC_ALLOC_VAL_010 | §6.3 | FULL | YES | Approved | — |
| TC_ALLOC_VAL_011 | §6.3 chronology | FULL | YES | Approved | — |
| TC_ALLOC_VAL_012 | §6.3 | FULL | YES | Approved | — |
| TC_ALLOC_VAL_013 | INDEX.md charcount | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_014 | §6.6 + INDEX.md | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_015 | §6.6 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_016 | §6.6 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_017 | §6.4 + §5 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_018 | §5 + §4 Rule 5 | FULL | YES | Approved | Async per §10.18 noted |
| TC_ALLOC_FUNC_019 | §5 + §4 Rule 5 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_020 | §5 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_021 | INDEX.md form action | FULL | YES | Approved | — |
| TC_ALLOC_BIZ_022 | §4 Rule 2 + §10.16 | FULL | YES | Approved | — |
| TC_ALLOC_BIZ_023 | §4 Rule 3 | FULL | YES | Approved | — |
| TC_ALLOC_BIZ_024 | §10.17 | FULL | YES | Approved | Documents observed state |
| TC_ALLOC_NEG_025 | §10.3 | FULL | YES | Approved | — |
| TC_ALLOC_NEG_026 | §10.2 | FULL | YES | Approved | — |
| TC_ALLOC_NEG_027 | §10.25 | FULL | YES | Approved | — |
| TC_ALLOC_FUNC_028 | §10.4 | NO-EVIDENCE | YES | Conditional | Visual gap — capture Rounds UI |
| TC_ALLOC_FUNC_029 | §10.5 | NO-EVIDENCE | YES | Conditional | Visual gap — capture Export action |
| TC_ALLOC_FUNC_030 | §10.6 | NO-EVIDENCE | YES | Conditional | Visual gap — capture Notify action |
| TC_ALLOC_EDGE_031 | §10.19 | NO-EVIDENCE | YES | Conditional | Cross-module evidence (Towers) |
| TC_ALLOC_EDGE_032 | §10.20 | NO-EVIDENCE | YES | Conditional | Cross-module evidence (Towers/Buyer) |
| TC_ALLOC_EDGE_033 | §10.1 | NO-EVIDENCE | YES | Conditional | API-level — keep manual/API-suite only |
| TC_ALLOC_EDGE_034 | §10.26 | NO-EVIDENCE | YES | Conditional | Backend asymmetry — keep manual only |

---

## Approval

[ ] Approved — visual coverage ≥ 80% required; current is 79.4%
[x] **Conditional — Approved for execution with constraints listed below**
[ ] Rejected

### Conditional Approval Terms

1. **Sheet 1 (Manual TCs) — approved as-is** for manual execution. All 34 TCs have BRD/FRD traceability and explicit logic context.
2. **Sheet 2 (Automation Candidates) — 27 TCs approved for automation now.** All 27 carry FULL visual evidence.
3. **7 NO-VISUAL-EVIDENCE TCs — held back from Sheet 2** until either:
   - Tech Lead Agent extends INDEX.md to cover Rounds (§10.4), Export action (§10.5), Notify action (§10.6), and Actions menu (FUNC_018/019 use Actions menu — already screenshotted but row-level menu open state would strengthen evidence)
   - OR they are reclassified to API/DB suites (TC_ALLOC_EDGE_033, EDGE_034 are best-fit as API tests; EDGE_031, EDGE_032 belong in Towers module under cross-module suite)
4. **Visual coverage will rise to ≥ 80%** once any 1 of the 7 NO-VISUAL TCs gains a screenshot (28/34 = 82.4%), making the batch fully Approved-eligible.

### Hard-Gate Checks
- [x] No LOGIC_GAP — pass
- [x] No VISUAL_MISMATCH — pass
- [x] All TCs have BRD/FRD Req ID — pass
- [x] No `[NO-VISUAL-EVIDENCE]` TC in Sheet 2 — pass (excluded as required)
- [x] All TC_IDs follow `TC_<MODULE>_<TYPE>_<NNN>` format — pass
- [ ] Visual coverage ≥ 80% — 79.4% (just below — see Conditional Terms above)
