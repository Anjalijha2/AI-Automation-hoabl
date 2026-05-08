# Automation QA Agent — Commands

## How Commands Work
Commands map to specific Playwright execution and script management actions. Some are npm scripts run directly. Others are internal validation and reporting actions. All phase completions are reported to BA Agent.

---

## Category 1 — Phase 1: Script Generation Commands

### /aqa:generate <module>
Generate Page Object Model and spec file for a module.
```bash
npm run automation:generate -- --module=<module>
```
```
Pre-condition: BA Agent has confirmed TCs are user-approved.
Actions:
1. Read docs/manual-test-cases/TC_<MODULE>.md (approved TCs only)
2. Read docs/selectors/<module>.json (all selectors)
3. Read src/base/BasePage.js (available helper methods)
4. Read src/constants/testData.js (credentials, URLs, timeouts)
5. Generate src/pages/<Module>Page.js (POM)
6. Generate tests/ui/<module>.spec.js (spec file)
7. Run self-validation checklist (see /aqa:validate)
8. Report to BA Agent: "Phase 1 complete — N specs generated, compiles clean"
```

### /aqa:generate:all
Generate scripts for all modules with approved TCs.
```bash
npm run automation:generate
```

### /aqa:validate <module>
Self-validate generated scripts before reporting Phase 1 complete.
```
Checklist:
[ ] All selectors loaded from docs/selectors/<module>.json — none hardcoded
[ ] Every test() starts with TC_ID + type code: "TC_<MODULE>_<TYPE>_NNN — description"
[ ] All TC_IDs from approved TC file are present in spec
[ ] No waitForTimeout without inline comment explaining why
[ ] All ENV skip guards have descriptive reason string
[ ] POM methods are atomic (one action per method)
[ ] File compiles: node --check tests/ui/<module>.spec.js
[ ] No console.log left in spec or POM files
[ ] beforeEach/afterEach hooks present if tests share state

Report: "Validation passed — all N checks green" or list failed checks
```

### /aqa:pom:update <module> <method>
Add or update a method in an existing Page Object.
```
Actions:
1. Read current src/pages/<Module>Page.js
2. Add/update specified method
3. Ensure selector is loaded from JSON (not hardcoded)
4. Re-run /aqa:validate <module>
5. Report: "POM updated — method <method> added/updated"
```

---

## Category 2 — Phase 2: Test Execution Commands

### /aqa:auth:setup
Refresh auth session before execution.
```bash
npm run auth:setup
npx playwright test --config config/playwright.config.js --project=auth-setup
```
```
When to run:
- Before first execution of a sprint
- After admin.json is deleted or corrupted
- When protected-page tests fail with unexpected redirect to /login
- When UAT credentials change
Output: src/fixtures/.auth/admin.json (git-ignored)
```

### /aqa:execute <module>
Execute tests for a specific module.
```bash
npm run execute -- --module=<module>
```
```
Pre-conditions:
1. spec file compiles (run /aqa:validate first)
2. src/fixtures/.auth/admin.json exists and is valid
Actions:
1. Run tests for <module>
2. Classify all results: PASS ✅ | FAIL ❌ | SKIP ⏭ (ENV guard ≠ failure)
3. Generate reports/html-report/
4. Generate reports/results.json
5. Write docs/execution/execution-summary.md (see format below)
6. Report to BA Agent: "Phase 2 complete — Pass: X | Fail: Y | Skip: Z"
```

### /aqa:execute:all
Run full regression suite.
```bash
npm run test:regression
```

### /aqa:execute:smoke
Run smoke suite (P0 tests only).
```bash
npm run test:smoke
```

### /aqa:execute:login
Run login tests standalone (no auth session needed).
```bash
npm run test:login
```

### /aqa:execute:positive
Run positive test cases only.
```bash
npm run test:login:positive
```

### /aqa:execute:negative
Run negative test cases only.
```bash
npm run test:login:negative
```

### /aqa:execute:chrome
Run full suite in Chromium.
```bash
npm run test:chrome
```

### /aqa:execute:firefox
Run full suite in Firefox.
```bash
npm run test:firefox
```

### /aqa:execute:webkit
Run full suite in WebKit/Safari.
```bash
npm run test:webkit
```

### /aqa:execute:all-browsers
Run all browser projects (1 worker, sequential).
```bash
npm run test:all
```

### /aqa:report
Open HTML test report in browser.
```bash
npm run report
```

### /aqa:summary:generate <module>
Generate execution summary markdown from results.json.
```
Format:
## Execution Summary — <MODULE> — <DATE>

| TC_ID | Type | Scenario | Status | Duration | Failure Layer | Error Detail |
|-------|------|----------|--------|----------|--------------|-------------|
| TC_LOGIN_NEG_005 | NEG | Invalid OTP | ✅ PASS | 1.8s | — | — |
| TC_ALLOC_INT_003 | INT | Alloc → Unit sync | ❌ FAIL | 2.1s | Integration | Timeout: .unit-status-badge |
| TC_ALLOC_E2E_003 | E2E | Payment gateway | ⏭ SKIP | — | — | ENV guard: UAT |

### Run Summary
Total: N | Pass: X | Fail: Y | Skip: Z (ENV)
Failure layers: UI: A | API: B | Integration: C | DB: D | Logic: E

Output: docs/execution/execution-summary.md
```

---

## Category 3 — Phase 3: Healing Analysis Commands

### /aqa:heal:analyze
Analyze all failures from latest execution (read-only).
```bash
npm run heal:analyze
```
```
Actions:
1. Read reports/results.json — identify all FAIL results
2. Read each affected spec file
3. Read docs/selectors/<module>.json for current selectors
4. Identify root cause category per failure:
   - Selector change | Dynamic rendering | Timing/race condition
   - Auth expiry | ENV difference | API schema change
   - State pollution | Compile error
5. Write healing-reports/script-failure-analysis.md
6. Write healing-reports/fix-recommendations.md
7. Update healing-reports/pattern-log.md
8. Report to BA Agent: "Phase 3 complete — N recommendations ready. No fixes applied."
```

### /aqa:heal:apply <fix_numbers>
Apply specific approved fixes from fix-recommendations.md.
```
Pre-condition: BA Agent has explicitly approved the listed fix numbers.
Actions:
1. Read healing-reports/fix-recommendations.md
2. Apply ONLY the approved fix numbers (no others)
3. For each fix:
   - Update the specified file with the specified change
   - Add inline comment: "// Healed: <fix description> — <date>"
4. Re-run /aqa:validate on all modified files
5. Report: "Fixes applied — changes: [list]. Ready for re-execution."
```

### /aqa:heal:pattern-report
Generate cross-sprint failure pattern analysis.
```
Actions:
1. Read healing-reports/pattern-log.md
2. Identify: most frequently broken selectors, most failing modules, systemic issues
3. Generate recommendations for dev team (e.g., "Add data-testid to all form elements")
4. Append pattern summary to pattern-log.md
5. Report to BA Agent: "Pattern analysis complete — [key findings]"
```

---

## Category 4 — Selector Management Commands

### /aqa:selectors:check <module>
Verify selector JSON is valid and complete.
```
Actions:
1. Read docs/selectors/<module>.json
2. Validate JSON syntax
3. Check all selectors referenced in spec file exist in JSON
4. Report: "Selector check passed" or list missing selectors
```

### /aqa:selectors:diff <module>
Compare current selectors against spec file usage.
```
Actions:
1. Parse all this.s.<key> references in tests/ui/<module>.spec.js and src/pages/<Module>Page.js
2. Compare against docs/selectors/<module>.json
3. Report: selectors used but not in JSON (need discovery) | selectors in JSON but unused (cleanup)
```

---

## Category 5 — ENV & Config Commands

### /aqa:env:check
Verify environment configuration before execution.
```
Actions:
1. Check .env file exists and BASE_URL is set
2. Check process.env.ENV is set (uat / staging / prod)
3. Check config/playwright.config.js is valid
4. Check src/fixtures/.auth/admin.json exists
5. Report: "ENV ready" or list missing items
```

### /aqa:config:projects
List all configured Playwright projects.
```
Projects:
- auth-setup    → tests/auth.setup.js          (no auth required)
- login-tests   → tests/ui/login.spec.js        (standalone)
- smoke         → tests/smoke/*.spec.js          (auth required)
- regression    → tests/ui/*.spec.js             (auth required)
- chromium      → all specs                      (cross-browser)
- firefox       → all specs                      (cross-browser)
- webkit        → all specs                      (cross-browser)
```

---

## Command Quick Reference

| Command | Phase | When to Use |
|---------|-------|------------|
| `/aqa:generate <module>` | P1 | BA Agent confirms TCs approved |
| `/aqa:generate:all` | P1 | All pending modules |
| `/aqa:validate <module>` | P1 | Before reporting Phase 1 complete |
| `/aqa:pom:update <module> <method>` | P1 | Add/fix POM method |
| `/aqa:auth:setup` | P2 | Before first run / session expired |
| `/aqa:execute <module>` | P2 | Run specific module tests |
| `/aqa:execute:all` | P2 | Full regression run |
| `/aqa:execute:smoke` | P2 | Quick sanity check |
| `/aqa:execute:chrome/firefox/webkit` | P2 | Cross-browser run |
| `/aqa:summary:generate <module>` | P2 | After execution completes |
| `/aqa:report` | P2 | Open HTML report |
| `/aqa:heal:analyze` | P3 | After bugs are logged |
| `/aqa:heal:apply <fix_numbers>` | P3 | After BA Agent approves fixes |
| `/aqa:heal:pattern-report` | P3 | Cross-sprint pattern analysis |
| `/aqa:selectors:check <module>` | P1/P3 | Verify selector JSON |
| `/aqa:selectors:diff <module>` | P1/P3 | Find selector gaps |
| `/aqa:env:check` | P2 | Before any execution |

---

## npm Scripts — Full Reference

```bash
# Auth
npm run auth:setup                  # Save session → src/fixtures/.auth/admin.json

# Automation generation
npm run automation:generate                         # All modules
npm run automation:generate -- --module=<module>    # Specific module

# Execution — agent wrapper
npm run execute                     # All tests
npm run execute:login               # Login only
npm run execute:customers           # Customers only

# Execution — Playwright direct
npm run test                        # Regression (headless, 1 worker)
npm run test:login                  # Login (headed, standalone)
npm run test:login:positive         # Login positive only
npm run test:login:negative         # Login negative only
npm run test:customers              # Customers (headed)
npm run test:regression             # Full regression (headed)
npm run test:smoke                  # Smoke suite (headed)
npm run test:headed                 # Regression (headed)
npm run test:chrome                 # Cross-browser Chromium
npm run test:firefox                # Cross-browser Firefox
npm run test:webkit                 # Cross-browser WebKit
npm run test:all                    # All projects (1 worker)
npm run report                      # Open HTML report

# Healing
npm run heal:analyze                # Read-only failure analysis
```
