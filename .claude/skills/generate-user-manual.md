---
name: generate-user-manual
description: Generate or update screen-level user manual pages from locator map + BRD/FRD. Covers all 12 documentation dimensions.
---

# Skill: generate-user-manual

**Called by**: QA Agent
**Inputs**: portal name, module name, `locators/<portal>/locator-map.json`, BRD/FRD section
**Outputs**: `manual-qa-repository/03-user-manual/pages/<PORTAL>/<MODULE>.md`

---

## Command

```bash
node automation-repository/utils/generate-user-manual.js --portal=<portal> --module=<module>
```

---

## 12 Documentation Dimensions

Every screen doc must cover all 12:

1. **Screen Purpose** — what business function this screen serves (from BRD)
2. **Entry Points** — how users reach this screen (URL, nav menu item, button)
3. **UI Elements Inventory** — table: element, type, label, required/optional, purpose
4. **Form Fields** — validation rules, allowed values, format per FRD
5. **Actions & Buttons** — each CTA: what it does, preconditions, outcome
6. **States** — loading, empty, error, success, disabled states
7. **Data Display** — tables/lists: columns, sort, filter, pagination behaviour
8. **Workflows** — step-by-step happy paths documented from BRD user stories
9. **Business Rules** — constraints from BRD/FRD (e.g. "cannot book if balance < amount")
10. **Error Messages** — exact text per FRD, trigger condition, resolution
11. **Permissions** — which roles see/can use this screen
12. **Selectors Reference** — key locators from `locator-map.json` for this module

---

## Output Format

```markdown
# <MODULE> — <Portal> Portal

## 1. Screen Purpose
...

## 2. Entry Points
...

## 3. UI Elements Inventory
| Element | Type | Label | Required | Purpose |
|---------|------|-------|----------|---------|

...
```

---

## Constraints

- Source of truth: BRD/FRD in `.claude/docs/hoabl-knowledge-base/`
- Never invent UI details not in BRD/FRD or locator map
- If locator-map.json missing for portal, flag in output and generate without section 12
- Update existing page doc (don't overwrite — merge new dimensions)
- One file per screen/module — `<MODULE>.md` in SCREAMING_SNAKE_CASE
