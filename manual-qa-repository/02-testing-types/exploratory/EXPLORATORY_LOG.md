# Exploratory Testing Log

**Purpose:** Unscripted testing to find defects outside scripted TCs  
**Approach:** Charter-based — define scope, time-box, log findings

---

## Charters

| Charter | Module | Tester | Time-box | Date | Findings |
|---------|--------|--------|----------|------|----------|
| — | — | — | — | — | — |

---

## Charter Template

```
Charter: <title>
Module: <module>
Goal: Explore <area> looking for <risk>
Time-box: 60 min
Environment: UAT

Findings:
- <observation>
- <potential bug>

Notes: <anything unexpected>
```

---

## Findings to Bug Pipeline

If exploratory session finds a bug:
1. Log in `04-bug-reports/BUG_TRACKER.md` with next available BUG_NNN
2. Link charter row to BUG_NNN in Findings column
3. If reproducible with automation → add TC to relevant `01-test-cases/` file
