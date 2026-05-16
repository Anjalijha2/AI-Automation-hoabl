# Documentation Tracker

**Purpose:** Pipeline handoff tracker. Each row is one document. Agents update their own columns only. BA writes first, Manual QA second, Automation QA third.

**Last Updated:** _(agents update this on every write)_

---

## Tracker

| Document Name | Change Type | BA Status | BA Revoke Sent | Manual QA Status | Manual QA Revoke Sent | Automation QA Status | Last Updated | Notes |
|---|---|---|---|---|---|---|---|---|
| _(module/doc name)_ | _(see legend)_ | Not Started | No | Not Started | No | Not Started | _(date)_ | _(optional)_ |

---

## Column Definitions

| Column | Values | Set By | Rule |
|---|---|---|---|
| **Document Name** | any | BA | Name of BRD, FRD, screen doc, or any tracked document |
| **Change Type** | `New Feature` / `Logic Change` / `Bug Fix` / `No Change` | BA | Determines downstream action |
| **BA Status** | `Not Started` / `In Progress` / `Done` | BA | |
| **BA Revoke Sent** | `Yes` / `No` | Auto | Set to `Yes` when BA marks status → `Done` |
| **Manual QA Status** | `Not Started` / `Pending Review` / `In Progress` / `Done` / `Skipped` | Manual QA | Auto-set to `Pending Review` when BA Revoke Sent → `Yes` |
| **Manual QA Revoke Sent** | `Yes` / `No` | Auto | Set to `Yes` when Manual QA marks status → `Done` |
| **Automation QA Status** | `Not Started` / `Pending Review` / `In Progress` / `Done` / `Auto-Triggered` / `Skipped` | Automation QA | Auto-set per rules below |
| **Last Updated** | date | Any | Agent updates on every write |
| **Notes** | free text | Any | Clarifications, blockers, references |

---

## Handoff Rules (Agents Must Follow)

### When BA marks status → `Done`
1. Set `BA Revoke Sent` → `Yes`
2. Set `Manual QA Status` → `Pending Review`
3. If `Change Type` = `No Change` → set `Manual QA Status` → `Skipped`, `Automation QA Status` → `Skipped`

### When Manual QA marks status → `Done`
1. Set `Manual QA Revoke Sent` → `Yes`
2. Set `Automation QA Status` → `Pending Review`
3. If `Change Type` = `Logic Change` or `New Feature` → also set `Automation QA Status` → `Auto-Triggered`

### Automation QA on `Auto-Triggered`
- `Logic Change`: detect which existing scripts relate to this doc → update them
- `New Feature`: generate new automation scripts from the new manual test cases
- Mark `Automation QA Status` → `Done` when complete

---

## Change Type Reference

| Change Type | Manual QA Action | Automation QA Action |
|---|---|---|
| `New Feature` | Create new test cases from scratch | Generate new automation scripts |
| `Logic Change` | Update existing test cases for the feature | Update existing automation scripts |
| `Bug Fix` | Verify fix, update affected TCs if needed | Update / re-run affected scripts |
| `No Change` | Skip | Skip |
