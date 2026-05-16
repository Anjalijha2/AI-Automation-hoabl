# QA Strategy — XR Portal Admin

**Project:** XR Portal Admin  
**Approach:** Sprint-wise · Portal-wise · AI-assisted

---

## Strategy Overview

Each portal module goes through a standardized 3-phase QA pipeline:

1. **Documentation** — understand the UI, extract selectors, document all screens
2. **Test Design** — create comprehensive manual TCs (15 types), BA sign-off
3. **Automation** — generate Playwright scripts, execute, report, heal

---

## Testing Pyramid

```
        /\
       /E2E\         → Cross-module flows, critical user journeys
      /------\
     / Func   \      → Feature-level functional tests per module
    /----------\
   / Unit/API   \    → API contract tests, data validation
  /--------------\
 /   Smoke/Sanity \  → Quick health checks per deploy
```

---

## Coverage Goals

| Module | Target Coverage | Current |
|--------|----------------|---------|
| Login | 100% automatable TCs | 0% (spec pending) |
| Customers | 85% | 0% |
| Towers | 85% | 0% |
| Allocation | 85% | 0% |
| Channel Partners | 80% | 0% |
| JBP | 80% | 0% |
| Offers | 80% | 0% |
| Config/CMS | 75% | 0% |

---

## Risk-Based Priority

| Priority | Modules | Rationale |
|----------|---------|-----------|
| P0 | Login, Allocation | Core flow — system unusable if broken |
| P1 | Customers, Towers | Primary business operations |
| P2 | Channel Partners, JBP, Offers | Revenue-affecting |
| P3 | Config/CMS | Back-office content |

---

## Defect Management

- Bugs logged: `04-bug-reports/BUG_TRACKER.md`
- Severity: P0 (blocker) → P3 (minor)
- Resolution SLA: P0 same day, P1 next sprint, P2/P3 backlog
- Next bug ID: `BUG_011`

---

## Tools

| Tool | Version | Use |
|------|---------|-----|
| Playwright | 1.58.2 | Automation + runner |
| Claude Code | Latest | AI agent pipeline |
| GitHub Actions | — | CI |
