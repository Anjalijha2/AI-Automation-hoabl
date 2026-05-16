# Manual QA Repository

**Project:** XR Portal Admin (`https://uat-web.xrportal.in/admin`)  
**Approach:** Sprint-wise · Portal-wise · AI-assisted  
**3-agent pipeline:** BA Orchestrator → Manual QA → Automation QA

---

## Folder Structure

```
manual-qa-repository/
├── test-cases/                    ← Manual TCs — structured by portal → module
│   ├── INDEX.md                   ← Master portal index
│   ├── admin-portal/              ← > Admin Portal
│   │   ├── INDEX.md
│   │   ├── login/TC_LOGIN.md
│   │   ├── customers/TC_CUSTOMERS.md
│   │   ├── config/TC_CONFIG.md
│   │   ├── allocation/TC_ALLOCATION.md
│   │   ├── towers/TC_TOWERS.md
│   │   ├── channel-partners/TC_CP.md
│   │   ├── jbp/TC_JBP.md
│   │   ├── offers/TC_OFFERS.md
│   │   └── admin-cms/TC_ADMIN_CMS.md
│   └── sales-manager-portal/      ← > Sales Manager Portal
│       ├── INDEX.md
│       ├── TC_CALLBACK.md
│       ├── TC_SM_TOWERS.md
│       └── TC_LEADS.md
│
├── testing-types/                 ← Smoke, regression, sanity, UAT sign-off, retesting, exploratory
├── user-manual/                   ← Admin guide + per-screen docs (12 dimensions)
├── bug-reports/                   ← BUG_TRACKER.md, per-bug files, metrics, templates
├── environments/                  ← UAT / DEV config, test accounts, ENV strategy
├── test-runs/                     ← Execution summaries per sprint per environment
├── execution/                     ← Run commands, ENV skip log, UAT vs DEV delta
├── architecture/                  ← Agent roles, process flow, framework config, QA strategy
├── templates/                     ← TC template, screen doc template, execution summary template
│
├── README.md                      ← This file
├── DASHBOARD.md                   ← Live project status dashboard
├── SPRINT_LOG.md                  ← Sprint history (all sprints)
├── TASK_TRACKER.md                ← Task status (in progress / pending / done)
├── CHANGELOG.md                   ← All changes by date
├── AGENT-CONFIG.md                ← Agent pipeline configuration
├── DOCUMENTATION-TRACKER.md      ← Pipeline handoff tracker (BA → Manual QA → Automation QA)
├── test-coverage.md               ← Coverage by portal + sprint
└── QA-METRICS.md                  ← Defect density, pass rates, trends
```

---

## Sprint Execution Order (Per Portal)

```
1. Portal Documentation    → user-manual/pages/<MODULE>.md
2. Manual Test Cases       → test-cases/<portal>/<module>/TC_<MODULE>.md  (BA sign-off required)
3. Automation Scripts      → tests/e2e/<module>.spec.js
4. Execute + Report        → test-runs/<env>/sprint-N/
```

---

## Quick Navigation

| Need | Go To |
|------|-------|
| Find test cases | [test-cases/INDEX.md](test-cases/INDEX.md) |
| Admin Portal TCs | [test-cases/admin-portal/INDEX.md](test-cases/admin-portal/INDEX.md) |
| Sales Manager TCs | [test-cases/sales-manager-portal/INDEX.md](test-cases/sales-manager-portal/INDEX.md) |
| Smoke checklist | [testing-types/smoke/SMOKE_CHECKLIST.md](testing-types/smoke/SMOKE_CHECKLIST.md) |
| Admin user guide | [user-manual/ADMIN-GUIDE.md](user-manual/ADMIN-GUIDE.md) |
| Bug tracker | [bug-reports/BUG_TRACKER.md](bug-reports/BUG_TRACKER.md) |
| Test accounts | [environments/test-accounts.md](environments/test-accounts.md) |
| Run commands | [execution/run-commands.md](execution/run-commands.md) |
| Agent roles | [architecture/AGENT-ROLES.md](architecture/AGENT-ROLES.md) |
| Process flow | [architecture/PROCESS-FLOW.md](architecture/PROCESS-FLOW.md) |
| TC template | [templates/TC_TEMPLATE.md](templates/TC_TEMPLATE.md) |
| Sprint log | [SPRINT_LOG.md](SPRINT_LOG.md) |
| Dashboard | [DASHBOARD.md](DASHBOARD.md) |

---

## TC_ID Convention

| Format | Source | Example |
|--------|--------|---------|
| `TC-MODULE-NNN` (hyphens) | Hand-written | `TC-LOGIN-001` |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_LOGIN_FUNC_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

---

## Bug ID Convention

Format: `BUG_NNN` (e.g. `BUG_001`, `BUG_010`)  
Next: **BUG_011**  
All bugs: [bug-reports/BUG_TRACKER.md](bug-reports/BUG_TRACKER.md)
