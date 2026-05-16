# Agent Configuration

**Project:** XR Portal QA Framework — 4-Agent System
**Portals:** Admin, Sales Manager, Channel Partner, Buyer, API

---

## Agents

| Agent | File | Role |
|-------|------|------|
| BA Agent | `.claude/agents/ba_agent.md` | BRD/FRD interpretation, TC generation |
| Tech Lead Agent | `.claude/agents/tech_lead_agent.md` | Locator maps, source scanning, self-healing |
| QA Agent | `.claude/agents/qa_agent.md` | All test code, execution, manual QA artefacts |
| Developer Agent | `.claude/agents/developer_agent.md` | App source — explicit user invocation only |

---

## 13 Skills

| Skill | Called By |
|-------|-----------|
| `manual-tester` | BA Agent |
| `test-case-reviewer` | QA Agent |
| `locator-map-builder` | Tech Lead Agent |
| `e2e-self-healer` | QA Agent, Tech Lead Agent |
| `run-e2e` | QA Agent |
| `run-ui-ux` | QA Agent |
| `run-regression` | QA Agent |
| `run-cross-browser` | QA Agent |
| `run-api-tests` | QA Agent |
| `run-db-tests` | QA Agent |
| `generate-report` | QA Agent |
| `generate-user-manual` | QA Agent |
| `sync-and-update` | Tech Lead + QA Agent |

---

## Pipeline Gates

| Gate | Condition | Enforced By |
|------|-----------|-------------|
| Source scan → Locator update | source diff exists | Tech Lead Agent |
| Locator update → TC update | change-manifest.json signed off | BA Agent |
| TC design → Automation | BA sign-off on TestCases.xlsx | BA Agent |
| Spec gen → Execution | scripts compile clean | QA Agent |
| Execution → Bug log | results.json has failures | QA Agent |

---

## Portals & Auth

| Portal | URL | Session File |
|--------|-----|-------------|
| Admin | `https://uat-web.xrportal.in/admin` | `automation-repository/fixtures/.auth/admin.json` |
| Sales Manager | `https://uat-web.xrportal.in/sales-manager` | `automation-repository/fixtures/.auth/sales-manager.json` |
| Channel Partner | `https://uat-web.xrportal.in/` | `automation-repository/fixtures/.auth/channel-partner.json` |
| Buyer | `https://uat.xrportal.in/` | `automation-repository/fixtures/.auth/buyer.json` |

**Auth:** Mobile OTP — UAT static: `8888888888` / `258369`

---

## Rules

1. BA Agent starts every pipeline — no exceptions
2. No automation phase without BA sign-off on TCs
3. Locator maps owned exclusively by Tech Lead Agent
4. QA Agent owns all test code — Developer Agent never touches
5. Healing is read-only — fixes applied only after explicit user approval
6. LSQ excluded entirely. Strapi excluded from source scans.
