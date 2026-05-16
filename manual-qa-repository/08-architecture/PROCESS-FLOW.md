# Process Flow — XR Portal QA Framework

> End-to-end pipeline: AI-driven discovery → test case generation → automation → execution.
> Update when pipeline steps, scripts, or agents change.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                XR Portal QA — 3-Agent AI Pipeline                   │
│                                                                     │
│  BA ORCHESTRATOR                                                    │
│       │                                                             │
│       ├── XR MANUAL QA                                             │
│       │     Phase 1: Discovery → Phase 2: Screen Docs              │
│       │     Phase 3: Test Cases → Phase 4: Defect Logging          │
│       │                                                             │
│       └── AUTOMATION QA ENGINEER                                   │
│             Phase 1: Script Gen → Phase 2: Execution               │
│             Phase 3: Healing Analysis                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Sprint Execution Model

Each sprint covers one portal through three phases:

```
Phase 1: Portal Documentation
  → discover UI, document all screens (12 dimensions)
  → output: 03-user-manual/pages/<MODULE>.md

Phase 2: Manual Test Cases
  → design TCs across 15 types, BA sign-off required
  → output: 01-test-cases/<module>/TC_<MODULE>.md

Phase 3: Automation Scripts
  → generate Playwright specs from approved TCs
  → output: tests/e2e/<module>.spec.js
```

---

## Phase 0 — Authentication Setup

**Script:** `automation-repository/fixtures/auth.setup.js`  
**Command:** `npm run auth:setup`  
**Output:** `automation-repository/fixtures/.auth/admin.json`

Steps:
1. Navigate to `https://uat-web.xrportal.in/admin`
2. Enter mobile `8888888888`, submit OTP `258369`
3. Wait for customers/dashboard URL
4. Save full session to `admin.json`

---

## Phase 1 — Discovery Crawl

**Command:** `npm run discover`  
**Output:** `discovery/reports/`

---

## Phase 2 — Screen Documentation

**Command:** `npm run generate:report  # QA Agent calls generate-user-manual skill`  
**Output:** `manual-qa-repository/03-user-manual/pages/<MODULE>.md`

12 documentation dimensions per screen:
1. Purpose
2. Screen Elements
3. Workflows
4. UI States
5. Validations
6. API Calls
7. Auth Behaviour
8. Test Coverage
9. Screenshots
10. Known Issues
11. Related Pages
12. Change History

---

## Phase 3 — Test Case Design

**Command:** `# BA Agent → manual-tester skill → TestCases.xlsx`  
**Output:** `manual-qa-repository/01-test-cases/<module>/TC_<MODULE>.md`

15 TC types: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

**Gate:** BA sign-off required before Phase 4.

---

## Phase 4 — Script Generation

**Command:** `# QA Agent → scaffold specs from templates`  
**Output:** `tests/e2e/<module>.spec.js`, `automation-repository/pages/admin/<Module>Page.js`

---

## Phase 5 — Test Execution

**Command:** `npm run test:regression`  
**Output:** `reports/results.json`, `reports/html-report/`, `test-results/`

---

## Phase 6 — Defect Logging

**Command:** `# QA Agent → parse results.json → BUG_TRACKER.md`  
**Output:** `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`

---

## Phase 7 — Healing Analysis

**Command:** `# Tech Lead Agent → e2e-self-healer skill`  
**Output:** `healing-reports/fix-recommendations.md`

**Rule:** Read-only. Fixes applied only after explicit user approval.

---

## Phase 8 — Sprint Management

**Commands:** `npm run sprint:status` / `npm run sprint:update`  
**Output:** `SPRINT_LOG.md`, `TASK_TRACKER.md`, `test-coverage.md`, `CHANGELOG.md`

---

## Full Sequence (New Portal)

```
1.  npm run auth:setup
2.  npm run discover
3.  npm run generate:report  # QA Agent calls generate-user-manual skill         → 03-user-manual/pages/
4.  # BA Agent → manual-tester skill → TestCases.xlsx    → 01-test-cases/<module>/
5.  [BA sign-off on TCs]
6.  # QA Agent → scaffold specs from templates   → tests/e2e/
7.  npm run test:smoke            → smoke check
8.  npm run test:regression:admin       → full run
9.  # QA Agent → parse results.json → BUG_TRACKER.md           → 04-bug-reports/
10. # Tech Lead Agent → e2e-self-healer skill          → healing-reports/
11. npm run sprint:update         → SPRINT_LOG + TASK_TRACKER
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-16 | Rewritten for sprint-wise, portal-wise model with numbered folder structure |
