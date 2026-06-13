---
name: sync-and-update
description: 4-step pipeline sync: Tech Lead scans source → BA reads BRD/FRD → QA Manual TCs → QA Automation. Triggered when source-code changes detected.
---

# Skill: sync-and-update

**Called by**: Tech Lead Agent (initiates), BA Agent, QA Agent
**Inputs**: `sync/last-synced-commits.json`, `source-code/` git diff, `.claude/docs/hoabl-knowledge-base/`
**Outputs**: updated `locator-map.json`, `change-manifest.json`, `handoff-note.md`, updated TCs, healed specs

---

## Trigger Conditions

Run when any of:
- New commits in `source-code/` since `sync/last-synced-commits.json`
- BRD/FRD doc updated in `.claude/docs/hoabl-knowledge-base/`
- QA Agent reports selector failures (> 3 tests fail on same locator)
- User runs `npm run sync`

---

## 4-Step Pipeline

### Step 1 — Tech Lead: Locator Scan
```
1. Read sync/last-synced-commits.json → get last synced commit hash
2. git diff <last-hash>..HEAD source-code/ → identify changed components
3. Skip: source-code/strapi-src/**  (Strapi excluded)
4. For each changed component → update locators/<portal>/locator-map.json
5. Produce sync/change-manifest.json
6. Produce sync/handoff-note.md (what changed, which portals affected)
7. Update sync/last-synced-commits.json with new HEAD hash
```

### Step 2 — BA Agent: Requirement Cross-Check
```
1. Read change-manifest.json
2. Cross-reference against BRD/FRD in .claude/docs/hoabl-knowledge-base/
3. Flag: new UI element with no BRD coverage → raise clarification
4. Flag: removed element that BRD still references → raise clarification
5. If no gaps: produce sign-off note → QA Agent proceeds
6. If gaps: block until resolved
```

### Step 3 — QA Agent: TC Update
```
1. Read handoff-note.md + change-manifest.json
2. Identify affected TCs in manual-qa-repository/01-test-cases/
3. Update selectors in TC steps to match new locator-map.json values
4. If new BRD requirement: add new TC rows (BA sign-off required before automating)
5. Mark updated TCs in SPRINT_LOG.md
```

### Step 4 — QA Agent: Spec Healing
```
1. Run e2e-self-healer skill for each affected portal
2. Update POMs in automation-repository/pages/<portal>/
3. Re-run affected spec files: npm run test:e2e:<portal>
4. Generate report via generate-report skill
5. If still failing: escalate with diff report — do not self-approve
```

---

## change-manifest.json Schema

```json
{
  "generatedAt": "ISO-8601",
  "baseCommit": "sha",
  "headCommit": "sha",
  "portalsAffected": ["admin", "sales-manager"],
  "changes": [
    {
      "file": "source-code/admin-portal/src/components/BookingForm.jsx",
      "type": "modified",
      "elementsChanged": ["submitBtn", "amountInput"],
      "portal": "admin",
      "module": "bookings"
    }
  ]
}
```

---

## Constraints

- Strapi source excluded from all scans
- Step 2 gate is hard — QA cannot proceed to Step 3/4 without BA sign-off
- `sync/last-synced-commits.json` updated only after full pipeline completes
- New TCs added in Step 3 require BA sign-off before automation
- Never auto-close a clarification — wait for explicit user approval
