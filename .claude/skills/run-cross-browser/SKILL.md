---
name: run-cross-browser
description: Run full E2E suite across Chrome, Firefox, and Edge (webkit). Produces per-browser pass/fail report.
---

# Skill: run-cross-browser

**Called by**: QA Agent
**Inputs**: portal name, module name
**Outputs**: per-browser pass/fail report, browser-specific failure details with reproduction steps

---

## Commands

```bash
npm run test:chrome   # Chromium
npm run test:firefox  # Firefox
npm run test:webkit   # WebKit / Safari-equivalent
```

---

## Browser Matrix

| Browser | Playwright Project | Priority |
|---------|-------------------|----------|
| Chrome (Chromium) | `chromium` | Primary |
| Firefox | `firefox` | Secondary |
| Edge / Safari (WebKit) | `webkit` | Secondary |

---

## Execution Rules

- Run Chrome first — it is the primary and most stable
- Firefox and WebKit run sequentially, not in parallel
- `--workers=1` for all browser runs
- Report browser-specific failures with exact reproduction steps

---

## Report Format Per Browser

```markdown
## Browser: <browser> — <portal>/<module>

| TC_ID | Status | Duration | Failure Details |
|-------|--------|----------|----------------|

### Browser-Specific Issues
- [issue]: [reproduction steps] [expected] [actual]
```
