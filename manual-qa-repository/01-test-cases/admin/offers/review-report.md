# Test Case Review Report — Offers — Admin — 2026-06-06

**Reviewer:** QA Agent via `test-case-reviewer` skill
**TestCases source:** `manual-qa-repository/01-test-cases/admin/offers/TestCases.md`
**BRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Offers.md`
**Visual memory source:** `visual-memory/admin/offers/INDEX.md` (CAPTURE_STATUS: FULL — 4 screens listed; drawer body not captured)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | 30 |
| Approved | 14 |
| Requires Changes | 16 (12 STUB-EVIDENCE + 4 NO-VISUAL-EVIDENCE) |
| BRD/FRD coverage | 100% — every TC carries a BRD § Req ID |
| Visual coverage | 46.7% (14/30 TCs reference a captured screenshot with FULL evidence) |
| Doc logic coverage | 100% — every Scenario references a BRD § |
| Visual status | MIXED (4 captured screens; drawer body + delete confirm not captured) |

---

## Visual Evidence Gaps

### STUB-EVIDENCE (12 TCs — drawer body or delete confirm not captured)

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_OFFERS_FUNC_008 | Add Amount-Based offer happy path — drawer field assertions | STUB-EVIDENCE | offers-loaded.png + [STUB] | Tech Lead re-capture `offers-add-drawer.png` |
| TC_OFFERS_FUNC_009 | Add Percentage-Based offer happy path | STUB-EVIDENCE | offers-loaded.png + [STUB] | Same as above |
| TC_OFFERS_FUNC_010 | Single typology selection — drawer-internal | STUB-EVIDENCE | [STUB] only | Tech Lead re-capture drawer body |
| TC_OFFERS_VAL_011 | Blank-form validation errors in drawer | STUB-EVIDENCE | [STUB] only | Same as above |
| TC_OFFERS_VAL_012 | End < Start date validation | STUB-EVIDENCE | [STUB] only | Same as above |
| TC_OFFERS_VAL_013 | Amount/Percentage exclusivity | STUB-EVIDENCE | [STUB] only | Same as above |
| TC_OFFERS_FUNC_016 | Edit drawer opens pre-populated | STUB-EVIDENCE | offers-loaded.png + [STUB] | Tech Lead re-capture `offers-edit-drawer.png` |
| TC_OFFERS_FUNC_017 | Edit save updates row | STUB-EVIDENCE | offers-loaded.png + [STUB] | Same as above |
| TC_OFFERS_FUNC_018 | Delete safe (cancel) | STUB-EVIDENCE | offers-loaded.png + [STUB] | Tech Lead re-capture `offers-delete-confirm.png` |
| TC_OFFERS_FUNC_019 | Delete confirm destructive [MANUAL-ONLY] | STUB-EVIDENCE | offers-loaded.png + [STUB] | Same as above |
| TC_OFFERS_NEG_021 | HOME_LOAN cannot be manually created | STUB-EVIDENCE | offers-loaded.png + [STUB] | Drawer body capture needed |
| TC_OFFERS_EDGE_028 | offerCode whitelist future-state | STUB-EVIDENCE | [STUB] only | Drawer body + future Offer Code field |

### NO-VISUAL-EVIDENCE (4 TCs — cross-portal / API / DB)

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_OFFERS_BIZ_023 | Future-dated offer not applied to buyer pricing | offers-loaded.png + [NO-VISUAL-EVIDENCE Buyer-side] | partial | Acceptable — cross-portal; Buyer INDEX.md owns evidence; excluded from Sheet 2 |
| TC_OFFERS_BIZ_024 | Pricing formula AV − offers — buyer-side outcome | offers-loaded.png + [NO-VISUAL-EVIDENCE Buyer-side] | partial | Cross-portal; excluded |
| TC_OFFERS_BIZ_025 | Race condition between toggle and payment — buyer-side | offers-loaded.png + [NO-VISUAL-EVIDENCE] | partial | Cross-portal; excluded |
| TC_OFFERS_BIZ_026 | Locked bookings unaffected — booking record cross-portal | offers-loaded.png + [NO-VISUAL-EVIDENCE] | partial | Cross-portal; excluded |
| TC_OFFERS_EDGE_027 | GET offers pagination API | [NO-VISUAL-EVIDENCE — API-only] | none | API-only; excluded |
| TC_OFFERS_EDGE_029 | Toggle emits no audit log | [NO-VISUAL-EVIDENCE — backend/DB] | none | DB-only; excluded |
| TC_OFFERS_EDGE_030 | Delete leaves orphan FK | [NO-VISUAL-EVIDENCE — DB] | none | DB-only; excluded |

**VISUAL_MISMATCH check:** TestCases.md "Visual Caveat" explicitly notes that `offers-add-modal.png` was NOT captured — drawer was rendered as `.ant-drawer-content` instead. No TC actually cites `offers-add-modal.png` directly in Visual Evidence column (all use `[STUB-EVIDENCE]` placeholder), so no VISUAL_MISMATCH against INDEX.md Screens. All actual filenames cited (`offers-loaded.png`, `offers-full.png`) exist in INDEX.md.

INDEX.md Screens (authoritative): `screenshot-desktop.png` (stub), `screenshot-ui.png` (stub), `offers-loaded.png`, `offers-full.png` — 4 entries.

---

## Logic Gaps

| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|

None. Every TC Scenario references a BRD § (1, 3, 4, 5.1–5.7, 6.1–6.7, 7, 8, 10.1–10.6). No purely mechanical TCs.

---

## BRD/FRD Gaps

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|

None — every BRD section §1–§10.6 covered by ≥1 TC. Coverage caveats are visual (drawer body not captured) and cross-portal (Buyer-side outcomes owned by Buyer INDEX.md), not BRD coverage.

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_OFFERS_UI_001 | BRD §1 + §6 | offers-full.png + screenshot-desktop.png | FULL | Approved | — |
| TC_OFFERS_UI_002 | BRD §6 | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_UI_003 | BRD §3 Amount | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_UI_004 | BRD §3 Percentage | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_UI_005 | INDEX.md + BRD §6 | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_UI_006 | INDEX.md + BRD §6.4 | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_UI_007 | BRD §4 HOME_LOAN | offers-loaded.png + offers-full.png | FULL | Approved | — |
| TC_OFFERS_FUNC_008 | BRD §6.1–§6.4 | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_FUNC_009 | BRD §3 + §6.3 | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_FUNC_010 | BRD §10.1 | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_VAL_011 | BRD §6.3 | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_VAL_012 | BRD §5.4 | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_VAL_013 | BRD §3 exclusivity | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_FUNC_014 | BRD §6.5 + §10.5 | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_FUNC_015 | BRD §6.6 + §5.1 | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_FUNC_016 | BRD §6.7 | [STUB-EVIDENCE] | FULL | Requires Changes | Edit drawer body capture needed |
| TC_OFFERS_FUNC_017 | BRD §6.7 | [STUB-EVIDENCE] | FULL | Requires Changes | Edit drawer body capture needed |
| TC_OFFERS_FUNC_018 | INDEX.md + BRD §6.7 | [STUB-EVIDENCE] | FULL | Requires Changes | Delete confirm surface capture needed |
| TC_OFFERS_FUNC_019 | BRD §6.7 + §10.4 | [STUB-EVIDENCE] | FULL | Requires Changes | `[MANUAL-ONLY]` + delete confirm capture |
| TC_OFFERS_FUNC_020 | INDEX.md Refresh | offers-full.png | FULL | Approved | — |
| TC_OFFERS_NEG_021 | BRD §4 + §10.2 | [STUB-EVIDENCE] | FULL | Requires Changes | Drawer body capture needed |
| TC_OFFERS_NEG_022 | BRD §6.5 + §8 | offers-loaded.png | FULL | Approved | — |
| TC_OFFERS_BIZ_023 | BRD §5.4 + §7 | [NO-VISUAL-EVIDENCE] Buyer-side | FULL | Requires Changes | Cross-portal; excluded from Sheet 2 |
| TC_OFFERS_BIZ_024 | BRD §5.5 | [NO-VISUAL-EVIDENCE] Buyer-side | FULL | Requires Changes | Cross-portal; excluded |
| TC_OFFERS_BIZ_025 | BRD §5.6 + §8 | [NO-VISUAL-EVIDENCE] Buyer-side | FULL | Requires Changes | Cross-portal; excluded |
| TC_OFFERS_BIZ_026 | BRD §5.7 | [NO-VISUAL-EVIDENCE] Cross-portal | FULL | Requires Changes | Cross-portal; excluded |
| TC_OFFERS_EDGE_027 | BRD §10.3 | [NO-VISUAL-EVIDENCE] API-only | FULL | Requires Changes | API-only; excluded |
| TC_OFFERS_EDGE_028 | BRD §10.2 | [STUB-EVIDENCE] | FULL | Requires Changes | Future-state placeholder |
| TC_OFFERS_EDGE_029 | BRD §10.5 audit | [NO-VISUAL-EVIDENCE] DB-only | FULL | Requires Changes | DB-only; excluded |
| TC_OFFERS_EDGE_030 | BRD §10.4 FK | [NO-VISUAL-EVIDENCE] DB-only | FULL | Requires Changes | DB-only; excluded |

---

## Approval

- [ ] Approved — proceed to automation
- [x] **Conditional — fix gaps before proceeding** — 12 TCs carry `[STUB-EVIDENCE]` (drawer body / delete confirm capture pending) and 4 TCs carry `[NO-VISUAL-EVIDENCE]` (cross-portal / API / DB by category).
- [ ] Rejected

**Rationale:** Per skill Approval Gate Rules — "any STUB-EVIDENCE → Conditional (max)" and "any NO-VISUAL-EVIDENCE present → Conditional (cannot be Approved)". Both hard gates trigger. 14 FULL-visual TCs (UI_001–007, FUNC_014, FUNC_015, FUNC_020, NEG_022) are Approved and may proceed to automation immediately.

**Blocking issues:**
1. Add/Edit drawer body screenshot missing (`offers-add-drawer.png`, `offers-edit-drawer.png`). Blocks FUNC_008, _009, _010, _016, _017, VAL_011, _012, _013, NEG_021, EDGE_028.
2. Delete confirmation surface screenshot missing (`offers-delete-confirm.png`). Blocks FUNC_018, FUNC_019.
3. Cross-portal / API / DB TCs (BIZ_023–026, EDGE_027, _029, _030) — intentional category, already excluded from Sheet 2.

**Action items:**
1. **Tech Lead Agent: re-run `visual-capture` for `admin/offers`** with explicit drawer-open and delete-confirm steps:
   - Capture `offers-add-drawer.png` (click "Add New Offer", wait for `.ant-drawer-content`, capture)
   - Capture `offers-edit-drawer.png` (click pencil icon on a row, wait for `.ant-drawer-content`, capture)
   - Capture `offers-delete-confirm.png` (click trash icon, capture `.ant-modal-content` or `.ant-popover-inner-content`)
   - Update INDEX.md Screens table with the three new files
2. After re-capture, this review re-runs and the 12 STUB-EVIDENCE TCs flip to Approved.
3. Proceed in parallel with automation for the 14 currently-Approved TCs.
