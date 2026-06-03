# Doc Change Summary — Admin / Login — 2026-06-03

**Phase:** BA Agent Phase 1 — fresh dual-source TC batch
**Module:** Admin Portal / Login
**Trigger:** User-initiated re-run under the new dual-source pipeline. Visual memory now FULL (12 screens). Legacy single-source artefacts at `manual-qa-repository/01-test-cases/admin-portal/login/` are superseded by this new path (`manual-qa-repository/01-test-cases/admin/login/`).

---

## Dual-Source Confirmation

| Source | Path | Status | Used For |
|--------|------|--------|----------|
| Visual memory INDEX.md | `visual-memory/admin/login/INDEX.md` | **FULL** (12 screens captured 2026-05-17 @ 1920×900 + extras) | Selectors in Steps; UI structure for Expected Results; cited filenames in Visual Evidence column |
| BRD | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Login.md` | **PRESENT** (196 lines, §1–§11.6; §11 backend reconciliation 2026-05-21) | Scenario context; business rules; requirement IDs in BRD Req ID column; KNOWN ISSUE markers |

**Dual-source rule satisfied:** YES — both sources confirmed available before `manual-tester` execution. No selector or step inferred from BRD prose; no business rule inferred from screenshots.

---

## Visual Memory Status (per sync-pipeline Step 2 contract)

| Affected module | Visual memory status | BRD/FRD status | Dual-source confirmed |
|-----------------|---------------------|----------------|----------------------|
| `admin/login` | **YES (FULL — 12 screens)** | YES | YES |

No `VISUAL_GATE_BLOCK` raised. No `DOC_MISSING` raised.

---

## Path Migration

| Old (deprecated, superseded) | New (canonical) |
|------------------------------|-----------------|
| `manual-qa-repository/01-test-cases/admin-portal/login/TC_LOGIN.md` | `manual-qa-repository/01-test-cases/admin/login/TestCases.md` |
| `manual-qa-repository/01-test-cases/admin-portal/login/TC_LOGIN.xlsx` | (consolidated `TestCases-AdminPortal.xlsx` owned by QA Agent in Step 3) |
| `manual-qa-repository/01-test-cases/admin-portal/login/test-data-spec.md` | `manual-qa-repository/01-test-cases/admin/login/test-data-spec.md` |
| — | `manual-qa-repository/01-test-cases/admin/login/review-report.md` (NEW) |
| — | `manual-qa-repository/01-test-cases/admin/login/doc-change-summary.md` (NEW — this file) |

Old `admin-portal/login/` files are NOT deleted (per CLAUDE.md Constraint 10 — archival not deletion). Recommend QA Agent move them to `manual-qa-repository/01-test-cases/archived/admin-portal/login/` on Sprint sign-off.

---

## What Changed This Run

| Artefact | Action | Notes |
|----------|--------|-------|
| `manual-qa-repository/01-test-cases/admin/login/TestCases.md` | **CREATED** | 30 TCs, 23 automation candidates, 83.3 % visual coverage, 12/12 screens referenced |
| `manual-qa-repository/01-test-cases/admin/login/test-data-spec.md` | **CREATED** | Master credentials, validation matrix (1-for-1 with BRD §7), API field-name table from INDEX.md, env skip-guard table |
| `manual-qa-repository/01-test-cases/admin/login/review-report.md` | **CREATED** | APPROVED verdict; BRD coverage 100 %; visual coverage 83.3 % |
| `manual-qa-repository/01-test-cases/admin/login/doc-change-summary.md` | **CREATED** | This file |
| BRD source (`ADMIN-BRD-Login.md`) | **NO CHANGE** | Read-only consumption; no requirement updates needed this batch |
| Visual memory INDEX.md | **NOT MODIFIED** | Tech Lead Agent's domain; BA consumes only |
| Legacy `admin-portal/login/` artefacts | **NOT MODIFIED, NOT DELETED** | Superseded; archival pending QA Agent |

---

## Coverage Snapshot

| Metric | Value | Threshold | Verdict |
|--------|-------|-----------|---------|
| Total TCs | 30 | — | — |
| BRD section coverage | §1, §4–§7, §9, §11.1–§11.6 (100 %) | 100 % | PASS |
| Visual coverage | 83.3 % | ≥ 80 % | PASS |
| Doc logic coverage | 100 % | 100 % | PASS |
| Captured screens referenced | 12 / 12 | All used | PASS |
| Automation candidates | 23 | — | — |
| `[MANUAL-ONLY]` TCs | 6 | — | Documented + excluded from Sheet 2 |
| `[KNOWN-DEFECT]` TCs | 1 (EDGE_002 — BRD §11 logout no-op) | — | Must NOT run as passing case |

---

## Open Visual Gaps (handed back to Tech Lead Agent)

| Gap | TC blocked from automation | Action |
|-----|---------------------------|--------|
| Revoked-user error toast not captured (BRD §11.4 "Your access to the portal has been revoked") | TC_LOGIN_NEG_002 | Tech Lead Agent: seed revoked admin, capture error state, append to INDEX.md |
| Logout UI surface + post-logout state not captured | TC_LOGIN_EDGE_002 | Tech Lead Agent: capture logout entry in sidebar + redirect target |

Neither blocks Approval — both TCs are explicitly `[NO-VISUAL-EVIDENCE]` and excluded from Sheet 2.

---

## Requirement Gaps (BA-flagged)

**None.** All BRD §1–§11.6 sections have at least one mapped TC. KNOWN issues (BRD §11 logout no-op, §11.1 no backend cooldown) are documented under EDGE_002 / EDGE_001 / NEG_004 respectively — they are tracking TCs against documented defects, not requirement gaps.

---

## Downstream Handoff

| Recipient | What to do |
|-----------|-----------|
| **Tech Lead Agent** | (a) Verify `locators/admin/locator-map.json` `login` section matches the 8 documented selectors from INDEX.md Key Structural Notes; (b) capture the 2 open visual gaps; (c) confirm POM `automation-repository/pages/admin/LoginPage.js` reads from locator map |
| **QA Agent** | (a) Consolidate `TestCases.md` rows into `manual-qa-repository/07-execution/TestCases-AdminPortal.xlsx`; (b) scaffold / update `tests/e2e/admin/login.spec.js`, `tests/ui-ux/admin/login.spec.js`, `tests/regression/admin/login.spec.js`, `tests/cross-browser/admin/login.spec.js` from Sheet 2; (c) mark `[MANUAL-ONLY]` TCs in execution tracker; (d) move legacy `admin-portal/login/` files to `archived/` on Sprint sign-off |
| **Developer Agent (user-explicit only)** | BRD §11 KNOWN ISSUE — implement server-side JWT invalidation on `POST /auth/logout` (blacklist / cookie clear). Until then EDGE_002 stays as expected-fail tracking |
