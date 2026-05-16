---
name: e2e-self-healer
description: Detect broken locators after code changes and auto-repair them in spec files and locator map. Called by QA Agent on failure or Tech Lead Agent proactively on a breaking diff.
---

# Skill: e2e-self-healer

**Called by**: QA Agent (on E2E failure), Tech Lead Agent (proactively on breaking diff)
**Inputs**: failing spec file or broken locator key, source code diff
**Outputs**: healed spec file, updated locator map entry, diff report of changes made

---

## Trigger Conditions

- E2E test fails with `element not found` or locator mismatch error
- Tech Lead Agent detects breaking UI change in source diff
- Selector returns 0 elements on live portal

---

## Execution Steps

1. Identify broken locator — read error message and stack trace from `reports/results.json`
2. Read current `locators/<portal>/locator-map.json` entry for broken element
3. Read source code diff or navigate live portal via Playwright to find correct selector
4. Apply locator priority: `#id` → `[data-testid]` → `[aria-label]` → CSS → `:text()`
5. Update `locators/<portal>/locator-map.json` entry with healed selector + changelog entry
6. Update affected POM in `automation-repository/pages/<portal>/` to use new selector
7. Produce diff report

---

## Healing Priority

```
1. Is there a data-testid on the element now? → use it
2. Is there an aria-label? → use it
3. Is there a stable id? → use it
4. Is there a unique combination of role + name? → getByRole
5. Is there a unique text content? → getByText (last resort, document reason)
```

---

## Diff Report Format

```markdown
# Self-Healer Report — <Module> — <Date>

## Broken Locators Fixed
| Element Key | Old Selector | New Selector | Method | Reason |
|-------------|-------------|-------------|--------|--------|

## Files Modified
- `locators/<portal>/locator-map.json` — N entries updated
- `automation-repository/pages/<portal>/<Module>Page.js` — N locators updated

## Not Healed (requires manual review)
| Element Key | Issue | Action Required |
|-------------|-------|----------------|
```

---

## Constraints

- Never remove old selector — update in-place and append changelog
- Never hardcode selectors directly in spec files — only through POM
- If element not found on live portal at all → flag as unhealed, escalate to user
- Only heal selectors that exist in the live portal — do not guess
