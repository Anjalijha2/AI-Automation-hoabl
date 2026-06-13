---
name: run-db-tests
description: Validate database state after portal actions. Query via Sequelize raw SQL in db/queries/. Never inline SQL in tests.
---

# Skill: run-db-tests

**Called by**: QA Agent
**Inputs**: module name, entity names, expected DB state from BRD/FRD
**Outputs**: row-level assertion results, data integrity report

---

## Command

```bash
npm run test:db
# or specific module:
npx playwright test tests/db/<module>.db.spec.js --config automation-repository/playwright.config.js --project=db --workers=1
```

---

## Coverage Requirements

### Post-Action State
- [ ] Record created with correct field values after form submit
- [ ] Record updated — changed fields match submitted values, unchanged fields untouched
- [ ] Record deleted — row absent from table, no orphaned FK rows
- [ ] Status transitions match BRD/FRD state machine

### Data Integrity
- [ ] FK relationships intact after create/update/delete
- [ ] Timestamps (created_at, updated_at) set correctly
- [ ] Null constraints respected — required fields not null
- [ ] Unique constraints respected — duplicate detection

### Negative
- [ ] Rejected payload leaves DB unchanged
- [ ] Partial failure rolls back entire transaction (if transactional)

---

## Query Pattern

```javascript
const { test, expect } = require('@playwright/test');
const { getBookingById } = require('../../db/queries/booking');

test('TC_<MODULE>_DB_001 — <REQ_ID> — record persisted after create', async () => {
  const record = await getBookingById(createdId);
  expect(record).not.toBeNull();
  expect(record.status).toBe('pending');
  expect(record.amount).toBe(expectedAmount);
});
```

---

## Constraints

- All DB queries live in `db/queries/<entity>.js` — never inline SQL in spec files
- Sequelize raw queries only — no ORM magic in QA layer
- DB credentials from env — never hardcoded
- Every DB test maps to a BRD/FRD requirement ID
- Clean up test records after assertions (delete created test rows)
