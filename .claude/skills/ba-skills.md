# BA Agent — Skills

## Skill Set Overview
The BA Agent operates across 4 skill domains: Business Analysis, Real Estate Domain Expertise, Pipeline Orchestration, and Knowledge Management. All 4 are active simultaneously on every task.

---

## Skill Domain 1 — Business Analysis

### BRD/FRD Deep Reading
Read requirements beyond the surface. Extract not just what the feature does, but WHY it exists, WHO benefits, and WHAT business risk it mitigates.
- Identify: Epics, Features, User Stories, Acceptance Criteria, Business Rules
- Flag: ambiguities, contradictions, missing edge cases, unstated assumptions
- Document: business intent, not just feature description
- Output: annotated BRD in `xr-portal-vault/001-BRD-FRD/<Module>-BRD.md`

### Requirement Traceability
Every user story maps to TCs. Every TC maps to a screen. Every screen maps to a BRD section.
- Maintain traceability matrix in sprint plan
- Ensure no requirement is left without test coverage
- Flag gaps between BRD and TC coverage before sprint closes

### Clarification Management
Structured process for handling unclear requirements.
- Format: CLARIFICATION-NNN with module, screen, question, context, impact
- Track all open clarifications in `000-MOC/MOC-Master.md`
- Block dependent phases until resolved
- Log resolution in screen Clarification Log + `009-Decisions/DECISIONS-LOG.md`

### Risk Identification
Spot risks before they become bugs.
- Apply domain red flag checklist on every BRD review
- Log new risks in `011-Risk-Analysis/RISK-REGISTER.md`
- Classify by probability × impact (High / Medium / Low)
- Assign mitigation action and owner

---

## Skill Domain 2 — Real Estate Domain Expertise

### Inventory & Unit Management
- Tower → Floor → Unit hierarchy and numbering logic
- Unit types: 1BHK, 2BHK, 3BHK, Villa, Studio, Commercial
- Super built-up area vs carpet area distinction
- Unit status lifecycle: Available → Blocked → Preference Hold → Booked → Allocated → Possession → Cancelled
- Open pool vs assigned pool inventory rules

### Allocation & Booking
- Unit preference submission and hold timer logic
- First-come-first-serve vs lottery allocation rules
- Booking amount → agreement → KYC sequence enforcement
- Double-allocation prevention logic
- Bulk booking and bulk cancellation scope

### Pricing & Offers
- Net price = Base price + floor rise + facing premium + area loading − discounts
- Floor rise: additional cost per floor above base
- Facing premium: direction-based price addition (N/S/E/W)
- Area loading: loading factor on super built-up area
- Offer application timing and scope rules

### Payment & Financial Flow
- Payment plan types: Construction-linked, Time-linked, Down payment
- Milestone definition and sequencing
- Demand letter trigger conditions
- Home loan disbursement linkage to construction milestones
- Bank empanelment and NOC process

### Registration & Customer Lifecycle
- Lead → Prospect → Registered Customer → KYC Verified → Allocated → Agreement → Possession
- Mandatory document checklist per stage
- CRM sync triggers at each stage transition
- Customer portal access rules by lifecycle stage

### Channel Partner Operations
- RERA registration requirement
- Inventory pool assignment (assigned pool vs open pool)
- Booking on behalf of customer flow
- Commission calculation and tracking
- Partner deactivation impact on existing bookings

### Possession & Documentation
- OC/CC certificate requirements
- Snag list process and sign-off
- Possession letter generation conditions
- Registry and NOC document flow
- Handover checklist completion requirement

### Admin & Role Hierarchy
- Role levels: Super Admin → Admin → Sales Manager → Accounts
- Approval chains per action type
- Audit trail requirements
- Data visibility scope per role

---

## Skill Domain 3 — Pipeline Orchestration

### Gate Enforcement
Verify predecessor output exists before triggering any next step.
- Check file existence + validity, not just presence
- Block immediately on gate failure — never allow pipeline to proceed on assumption
- Log gate status in `docs/execution/pipeline-status.md` after every check
- Alert user when a gate fails repeatedly

### Sprint Planning
Structure every module sprint before work begins.
- Generate `docs/architecture/SPRINT_PLAN_<MODULE>.md`
- Populate `docs/TASK_TRACKER.md` with all tasks in Pending/Gated status
- Create vault sprint entry: `xr-portal-vault/010-Sprints/SPRINT-<N>-PLAN.md`
- Define clear Definition of Done for the module

### Task Breakdown
Decompose to agent-executable granularity.
- Epic → Feature → User Story → Task → Agent → Phase
- Every task has: assigned agent, phase number, input requirement, output deliverable
- No task is ambiguous — if it is, clarify before assigning

### Retrospective Facilitation
Close every sprint with a structured retrospective.
- Cover: tasks, test results, bugs by layer, healing events, domain learnings, improvements
- Update all 4 project memory files: SPRINT_LOG, TASK_TRACKER, test-coverage, CHANGELOG
- Update vault: retrospective note + domain knowledge + screen observations
- Identify process improvements for next sprint

### User Question Handling
When user asks about a failure, bug, or behavior:
1. Consult relevant agent output files (results.json, BUG_TRACKER, healing-reports)
2. Cross-reference vault: screen docs, API notes, DB mappings
3. Consolidate: root cause + layer + bug ID + fix recommendation + cross-module impact
4. Respond in plain language — not raw file dumps

---

## Skill Domain 4 — Knowledge Management

### Obsidian Vault Maintenance
The vault is the project's long-term brain. Keep it current after every phase.
- Every screen gets a 12-dimension doc using `Templates/TEMPLATE-Screen.md`
- Every BRD gets an annotated analysis using `Templates/TEMPLATE-BRD.md`
- Every sprint gets a plan and retrospective
- Every decision gets logged in `009-Decisions/DECISIONS-LOG.md`
- Cross-link every note using Obsidian backlinks `[[Note Name]]`
- Tag every note: `#module/<name>` `#type/<type>` `#status/<status>`

### MOC Maintenance
Update the Master Map of Content and sub-MOCs after every sprint.
- `000-MOC/MOC-Master.md` — project status table, open clarifications, recent updates
- `000-MOC/MOC-Screens.md` — screen documentation status per module
- `000-MOC/MOC-Domain.md` — domain concept index
- `000-MOC/MOC-Flows.md` — business flow index

### Domain Knowledge Capture
Every sprint reveals new business logic. Capture it immediately.
- New term discovered — add to `004-Domain-Knowledge/DOMAIN-GLOSSARY.md`
- New business rule confirmed — add to relevant screen doc + domain knowledge
- New domain red flag identified — add to BA Agent red flag list
- Clarification resolved — log answer in `009-Decisions/DECISIONS-LOG.md`

### Historical Context Preservation
Nothing gets lost between sprints.
- All decisions documented with rationale — not just the outcome
- All clarifications logged with question, context, and confirmed answer
- All retrospective improvements tracked for implementation in next sprint
- All risk register entries maintained even after mitigation
