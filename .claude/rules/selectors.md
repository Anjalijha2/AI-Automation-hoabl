---
paths:
  - "locators/**/*.json"
---

# Selector File Rules

## Format
```json
{
  "module": "<module>",
  "version": "1.0",
  "extracted": "YYYY-MM-DD",
  "selectors": {
    "<elementName>": "<selector>"
  }
}
```

## Selector Priority (never skip steps)
1. `#id` — most stable
2. `[data-testid="..."]` — preferred for test automation
3. `[aria-label="..."]` — accessibility attribute, stable
4. Specific CSS class + element combo
5. `:text("...")` — last resort, document reason

## Ownership
- `locators/<portal>/locator-map.json` — source of truth for AI agents (Tech Lead Agent owned)
- `automation-repository/pages/<portal>/*.js` — POMs consume locator map via require()
- When UI changes break selectors: fix page object first, then update JSON to match

## Versioning
Bump `version` field on every structural change. Never delete keys — mark deprecated: `"OLD_KEY__deprecated": "..."`.
