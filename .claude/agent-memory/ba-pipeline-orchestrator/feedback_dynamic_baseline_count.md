---
name: Use Dynamic Baseline Counts for Mutable Data Modules
description: For modules with mutable table data (Offers, etc.), read count dynamically — don't pin a constant that breaks on test contamination
type: feedback
---

For modules with data that changes (creates, deletes during test runs), use a dynamic `beforeCount` pattern instead of pinning `const BASELINE_COUNT = 6`.

**Correct pattern (TC-005 style):**
```js
const beforeCount = await offers.getTotalCount();
// ... create item ...
expect(afterCount).toBe(beforeCount + 1);
// ... delete item (cleanup) ...
expect(finalCount).toBe(beforeCount);
```

**Why:** In Sprint 4 Offers, pinned `BASELINE_COUNT = 6` caused TC-012 to fail because a prior test run leaked 2 orphaned test offers (count became 8). The dynamic pattern survived re-runs without this fragility.

**How to apply:** Only pin counts for truly read-only data (e.g., Towers KPI baseline — physical tower count doesn't change day-to-day). For CRUD modules (Offers, Channel Partners search results, etc.), always read `beforeCount` at the start of each mutating test.
