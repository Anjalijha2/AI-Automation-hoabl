---
name: run-api-tests
description: Test all REST/WebSocket endpoints mapped to a module's FRD features. Base URL https://uat-api.xrportal.in/. Skip LSQ endpoints and endpoints not connected to any portal.
---

# Skill: run-api-tests

**Called by**: QA Agent
**Inputs**: module name, API base URL, FRD endpoint list
**Outputs**: status code assertions, schema validation, response time report, auth guard results

---

## Command

```bash
npm run test:api
# or specific module:
npx playwright test tests/api/<module>.api.spec.js --config automation-repository/playwright.config.js --project=api --workers=1
```

---

## Base URL

`https://uat-api.xrportal.in/`

---

## Coverage Requirements (per FRD endpoint)

### Positive
- [ ] Status code: correct 2xx per FRD spec
- [ ] Response schema: all documented fields present with correct types
- [ ] Response time: < documented SLA (or < 2000ms if not specified)
- [ ] Auth guard: authenticated request succeeds with valid token
- [ ] Data integrity: response data matches expected values

### Negative
- [ ] Invalid/expired token → 401 Unauthorized
- [ ] Missing required fields → 400 Bad Request with documented error schema
- [ ] Malformed payload → 400 Bad Request
- [ ] Unauthorized role → 403 Forbidden
- [ ] Not found → 404 (where documented)
- [ ] Rate limiting → 429 (if documented in FRD)

---

## Exclusions (hard rules)

- **LeadSquared (LSQ) endpoints**: excluded entirely — no calls, no assertions
- **Endpoints not integrated with any portal**: skip
- **Strapi admin API**: out of scope

---

## API Test Pattern

```javascript
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

test.describe('<Module> API — <FRD Section>', () => {
  let api;

  test.beforeAll(async () => {
    api = new ApiClient(process.env.API_BASE_URL || 'https://uat-api.xrportal.in');
  });

  test('TC_<MODULE>_API_001 — <REQ_ID> — GET /<endpoint> returns 200 with valid schema', async () => {
    const res = await api.get('/<endpoint>', { token: process.env.ADMIN_TOKEN });
    expect(res.status).toBe(200);
    expect(res.body).toMatchSchema(expectedSchema);
  });
});
```

---

## Constraints

- Every API test maps to a BRD/FRD requirement ID
- Schema validation mandatory — not just status code
- Auth token loaded from env — never hardcoded
