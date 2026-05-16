---
name: run-regression
description: Compare current run against locked baseline snapshots. Fails CI on any drift. Baseline updated only after reviewed and approved release.
---

# Skill: run-regression

**Called by**: QA Agent
**Inputs**: portal name, baseline snapshot path
**Outputs**: regression diff report (visual + assertion), list of broken flows

---

## Command

```bash
npm run test:regression:<portal>
# or:
npx playwright test tests/regression/<portal>/ --config automation-repository/playwright.config.js --project=regression --workers=1
```

---

## Behaviour

- Compares current screenshots against locked baselines in `tests/regression/<portal>/__snapshots__/`
- Fails immediately if any visual or assertion drift detected
- Priority: shared backend service flows tested first (data that crosses portals)
- `--update-snapshots` flag: used ONLY after reviewed and approved release

---

## Baseline Update Process

```
1. Release approved by stakeholders
2. QA Agent runs: npx playwright test --update-snapshots
3. Review diff — confirm only expected changes updated
4. Commit new baseline snapshots with release tag
```

---

## Constraints

- Never update baselines without explicit approval
- Baseline update must be a separate commit with clear message
- Any regression failure blocks pipeline until root-caused
