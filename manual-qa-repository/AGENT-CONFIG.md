# Agent Configuration

**Project:** XR Portal Admin QA Pipeline  
**Setup:** Antigravity Multi-Agent (3 sessions)

---

## Sessions

| Session Name | System Prompt | Subagent | Role |
|-------------|--------------|---------|------|
| `XR — BA Agent` | `.claude/docs/agent-prompts/ba-agent.md` | `ba-pipeline-orchestrator.md` | Orchestrator |
| `XR — Manual QA` | `.claude/docs/agent-prompts/manual-qa-agent.md` | `xr-manual-qa.md` | Discovery + TCs + Bugs |
| `XR — Automation QA` | `.claude/docs/agent-prompts/automation-qa-agent.md` | `automation-qa-engineer.md` | Scripts + Execution + Healing |

---

## Pipeline Gates

| Gate | Condition | Enforced By |
|------|-----------|-------------|
| Discovery → Screen Docs | discovery report exists | BA Orchestrator |
| Screen Docs → TCs | page docs written | BA Orchestrator |
| TCs → Automation | BA sign-off on TC file | BA Orchestrator |
| Automation → Execution | scripts generated and reviewed | BA Orchestrator |
| Execution → Defects | results.json has failures | BA Orchestrator |

---

## Memory Locations

| Agent | Memory Path |
|-------|------------|
| BA Pipeline Orchestrator | `.claude/agent-memory/ba-pipeline-orchestrator/` |
| Automation QA Engineer | `.claude/agent-memory/automation-qa-engineer/` |
| XR Manual QA | `.claude/agent-memory/xr-manual-qa/` |

---

## Target Portal

- **URL:** `https://uat-web.xrportal.in/admin`
- **Auth:** Mobile OTP — static UAT: `8888888888` / `258369`
- **Session file:** `automation-repository/fixtures/.auth/admin.json`

---

## Rules

1. Always start from BA Agent — entry point for all pipeline work
2. No Manual QA phase starts without BA gate approval
3. No Automation QA starts without BA sign-off on TCs
4. Healing analysis is read-only — fixes applied only after explicit user approval
5. Never overwrite existing spec files without explicit approval
