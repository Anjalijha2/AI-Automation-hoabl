# Sprints

## Structure

Each sprint covers one portal end-to-end:

```
sprints/
└── sprint-<N>/
    └── <portal-name>/
        ├── 01-documentation/
        │   └── <PORTAL>.md          # 12-dimension screen doc
        ├── 02-test-cases/
        │   └── TC_<PORTAL>.md       # Manual test cases (all 15 types)
        ├── 03-selectors/
        │   └── <portal>.json        # Selector source of truth
        └── 04-execution/
            ├── execution-summary.md
            └── bug-report.md
```

## Execution Order (per sprint/portal)

1. **Portal Documentation** — discover UI, document all screens (12 dimensions)
2. **Manual Test Cases** — design TCs across 15 types, BA sign-off required
3. **Automation Scripts** — generate Playwright specs from approved TCs
4. **Execute + Report** — run suite, log bugs, heal failures

## Sprint Naming

- `sprint-01`, `sprint-02`, etc.
- Portal folder names: lowercase, hyphenated (e.g., `xr-admin`, `customer-portal`, `channel-partners`)
