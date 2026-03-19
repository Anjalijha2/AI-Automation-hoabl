# Business Requirements Document — [Feature/Module Name]

> Copy this template and rename it (e.g., `BRD_CONFIG_MODULE.md`).
> Agent 7 (sprint-manager) reads all non-TEMPLATE .md files from this folder.
> Run: `npm run sprint:plan-brd`

---

## Overview
Brief description of what this BRD covers and why it is needed.

---

## Epic 1: [Epic Name]

High-level description of this epic (what business capability it represents).

### Feature 1.1: [Feature Name]

- As a [role], I want [capability] so that [benefit]
- Acceptance Criteria: [criterion 1]
- Acceptance Criteria: [criterion 2]

### Feature 1.2: [Another Feature]

- User Story: [description]
- Acceptance Criteria: [criterion]

---

## Epic 2: [Second Epic Name]

Description of this epic.

### Feature 2.1: [Feature Name]

- User Story: [description]
- Acceptance Criteria: [criterion]

---

## Notes

- Any constraints, dependencies, or out-of-scope items go here.
- UAT environment: https://uat-web.xrportal.in/admin

---

## Format Rules (for Agent 7 parser)

| Element | Markdown Syntax | Maps To |
|---------|----------------|---------|
| Epic | `## Epic Name` | Epic node |
| Feature | `### Feature Name` | Feature under current Epic |
| Story / AC | `- bullet text` | User story under current Feature |
| Description | Plain paragraph under `##` | Epic description |
