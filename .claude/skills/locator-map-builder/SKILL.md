---
name: locator-map-builder
description: Build and maintain the Element Locator Map for a portal. Adds new elements, flags deprecated ones, never overwrites history. Owned by Tech Lead Agent.
---

# Skill: locator-map-builder

**Called by**: Tech Lead Agent only
**Inputs**: portal name, source code path, approved test case list
**Outputs**: updated `locators/<portal>/locator-map.json` with versioned changelog entry

---

## Trigger Conditions

- Sync pipeline Step 1 — source code changes detected
- New module introduced in a sprint
- Tech Lead Agent proactively scanning a diff

---

## Locator Priority Order (never skip steps)

1. `#id` — most stable, use if available
2. `[data-testid="..."]` — explicitly set for testing, highly preferred
3. `[aria-label="..."]` — accessibility attribute, stable
4. Specific CSS class + element combo (unique, not framework-generated)
5. `:text("...")` — last resort; document reason in `notes` field

---

## locator-map.json Schema

```json
{
  "portal": "admin",
  "version": "1.4",
  "last_updated": "YYYY-MM-DD",
  "modules": {
    "<module>": {
      "<elementKey>": {
        "selector": "<primary_selector>",
        "type": "data-testid | aria | css | id | text",
        "fallback": "<fallback_selector>",
        "aria_role": "<role>",
        "description": "what this element is",
        "deprecated": false,
        "added": "YYYY-MM-DD",
        "deprecated_on": null,
        "notes": ""
      }
    }
  },
  "changelog": [
    {
      "version": "1.4",
      "date": "YYYY-MM-DD",
      "changes": [
        { "module": "<module>", "key": "<elementKey>", "action": "added|updated|deprecated", "reason": "" }
      ]
    }
  ]
}
```

---

## Execution Steps

1. Read existing `locators/<portal>/locator-map.json`
2. Read source code changes from diff (Strapi excluded)
3. For each changed UI component:
   - New element → add new entry with priority-ordered selector
   - Changed element → update selector, append changelog entry
   - Removed element → set `"deprecated": true`, set `"deprecated_on"`, do NOT delete
4. Bump `version` field (minor bump for additions, patch for deprecations)
5. Append changelog entry with all changes
6. Write updated `locator-map.json`

---

## Rules

- Never delete any entry — only mark `"deprecated": true`
- Every update must include a changelog entry
- Verify selectors against live portal before committing
- `notes` field required when using `:text()` selector (explain why preferred selectors not available)
- One entry per UI element — no duplicates

---

## Constraints

- Strapi folder excluded from all scans always
- Locator map is the single source of truth for all selectors in the framework
- POMs consume this map — never hardcode selectors in POMs
