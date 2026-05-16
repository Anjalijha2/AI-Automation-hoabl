# Smoke Test Checklist

**Purpose:** Quick sanity pass — verify core flows not broken after deploy  
**Runtime target:** < 10 minutes  
**Run before:** Any UAT regression cycle, after hotfix deploy

---

## Pre-conditions

- [ ] Auth session active (`npm run auth:setup` if needed)
- [ ] UAT environment accessible
- [ ] `automation-repository/fixtures/.auth/admin.json` present

---

## Checklist

### Authentication
- [ ] Login page loads at `/admin`
- [ ] OTP flow completes (mobile `8888888888` / OTP `258369`)
- [ ] Redirect to dashboard / customers after login

### Navigation
- [ ] Sidebar visible and all main menu items render
- [ ] Customers module loads
- [ ] Towers module loads
- [ ] Allocation module loads

### Customers
- [ ] Customer list renders (table with data)
- [ ] Search by mobile returns results
- [ ] Customer detail page opens

### Allocation
- [ ] Allocation list renders
- [ ] Filter by status works

### Towers
- [ ] Tower list renders
- [ ] Unit availability visible

---

## Run Command

```bash
npm run test:smoke
# or
npx playwright test tests/smoke/ --config automation-repository/playwright.config.js --project=smoke --headed --workers=1
```

---

## Pass Criteria

All checklist items pass. Zero critical failures. Warnings acceptable if non-blocking.
