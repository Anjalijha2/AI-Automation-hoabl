# Coverage Matrix Template — Self-Audit Gate

Fill this BEFORE declaring any module complete (§4 of SKILL.md). Rows = every feature /
sub-feature found across screenshots + BRD/FRD/FS + user manual. Columns = the 11 dimensions.
Each cell = a generated Testcase_ID, or a one-line justified `N/A`.

## Template

```
Module: <portal> / <module>
Sources read: visual-memory/<portal>/<module>/INDEX.md · BRD §.. · FRD §.. · FS §.. · user-manual §..

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|-----------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| <feature A>           | ID    | ID     | ID      | N/A:.. | ID    | ...   | ...     | ...     | ...    | ...      | ...      |
| <feature B>           | ...   | ...    | ...     | ...    | ...   | ...   | ...     | ...     | ...    | ...      | ...      |
```

## Rules

- A cell is valid only if it holds a real Testcase_ID **or** a justified `N/A: <reason>`.
- An **unjustified-empty** cell means the module is NOT done — generate the missing case.
- `N/A` justifications must be specific: `N/A: read-only page, no form` is valid;
  `N/A: not needed` is NOT.
- Save the completed matrix to
  `manual-qa-repository/06-test-runs/<sprint>/coverage-matrix-<portal>-<module>.md`
  alongside the coverage-gap report from `scripts/coverage-report.js`.

## Worked fragment — Admin / Customers

```
| Feature              | 1 Pos        | 5 Neg            | 7 Notif          | 9 Auth        |
|----------------------|--------------|------------------|------------------|---------------|
| Page load / landing  | ADM_CUST_001 | —                | N/A: read-only   | TC_CUST_NEG_.. (no-session redirect) |
| Search by phone      | ADM_CUST_013 | ADM_CUST_037     | N/A: read action | —             |
| Cancel Unit          | TC_CUST_FUNC_042 | TC_CUST_NEG_.. | TC_CUST_NEG_091 (silent) | —    |
| Update Parking       | TC_CUST_FUNC_087 | TC_CUST_NEG_088/089 | TC_CUST_NEG_093 (silent) | — |
```

Every feature row must be traceable back to a screenshot and/or a BRD/FRD/FS section
(the Evidence Tag, §5).
