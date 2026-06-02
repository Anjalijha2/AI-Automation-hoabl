# Test Data Spec — Towers — Admin Portal

**Module:** Towers
**Portal:** Admin
**Environment:** UAT (`https://uat-web.xrportal.in/admin/towers`)
**Generated:** 2026-06-02

---

## Valid Inputs

This module is **read-only** (BRD §7 confirms no user input). All "valid inputs" are dataset preconditions in the source-of-truth DB, not form values.

| Field / Entity | Valid Values | Source / Notes |
|----------------|--------------|----------------|
| projectId | 2 (UAT non-prod) / 1 (production) | Env-derived per BRD §11.1; not client-overridable |
| Tower count | 18 (fixed) | BRD §6 Rule 6 — invariant for Xanadu project |
| Tower names | Crest, Triumph, Crown, Prestige, Horizon, Radiance, Aspire, Blossom, Pinnacle, Fortune, Bright, Grand, Dawn, Aura, Glory, Pride, Grace, Prime | INDEX.md §"Tower List" — click-order on UI |
| Tower active state | true / false | Toggled in Config (BRD §6 Rule 2). Baseline: 15 active, 3 inactive (Horizon, Pinnacle, Bright). |
| Unit status enum | AVAILABLE, SOLD, RESERVED, REFUGE, PBT, PAYING (orange) | Inferred from BRD §4 Zone 3 color codes + §11.3/§11.7 backend audit. Confirm enum names via DB inspection. |
| Unit cell positions per floor | up to 8 (positions 1..8) | INDEX.md §"Heatmap Grid" |
| Floor range | 1..35 (Crest) — descending top-to-bottom | INDEX.md §"Heatmap Grid" |
| Refuge unit positions | Floor positions 4 on floors 33, 28, 23, 18, 13, 8 → unit nos 3304, 2804, 2304, 1804, 1304, 804 | INDEX.md §"Heatmap Grid" (Crest example) |
| Unit-type legend (Crest) | Pos 1: 323 sq.ft. / 1 BHK Growth · Pos 2: 323 / 1 BHK Growth · Pos 3: 621 / 2 BHK Rise · Pos 4: 485 / 2 BHK Growth · Pos 5: 323 / 1 BHK Growth · Pos 6: 323 / 1 BHK Growth · Pos 7: 485 / 2 BHK Growth · Pos 8: 621 / 2 BHK Rise | INDEX.md §"Heatmap Grid" |
| Reference unit for drawer test | 3502 — Crest (BHK: "1 BHK Growth Home", Size: 323 sq.ft.) | BRD §4 Zone 4 example |
| Reference KPI baseline | Towers: Total 18 / Active 15 / Inactive 3. Units: Total 4708 / Sold 238 / Available 3729 / Disabled 738 | INDEX.md §"Headings & Page Structure" (UAT 2026-06-01) |

---

## Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error / Behaviour |
|-------|---------------|----------------------------|
| Tower click target (sold cell) | Click red unit | No panel opens; no error (by design, BRD §5.5) |
| Tower click target (orange cell) | Click orange/Paying-now unit | No panel opens; no error (BRD §6 Rule 5) |
| Tower click target (grey cell) | Click grey/REFUGE/RESERVED unit | No panel opens; no error (BRD §6 Rule 5) |
| Tower click target (REFUGE literal) | Click cell rendering literal "REFUGE" text (e.g. 804 Crest) | No panel opens (BRD §6 Rule 5 + INDEX.md §"Heatmap Grid") |
| Inactive tower selection | Click "Horizon (Inactive)" | Heatmap STILL loads (read-only view applies to inactive too) — covered by TC_TWR_NEG_025 |
| API isActive filter via GET body | non-boolean value (e.g. "yes", 1) | Server accepts only literal `true`/`false`; other values likely ignored or rejected. Anti-pattern flagged in BRD §11.2. |
| API isActive filter via GET body | Body stripped by HTTP client | Server returns all towers (no filter applied) — fragile design (BRD §11.2) |
| No-op tower toggle | updateTowerStatus called with current state | Audit log row is NOT written (BRD §11.6). QA must NOT assert audit row. |
| projectId override attempt | Client sends `projectId=99` in request | Ignored — server uses env-derived value (BRD §11.1) |
| Frontend write attempts | Any POST/PATCH from Towers page | None exist — page is read-only (BRD §6 Rule 1, §7) |

---

## Pre-conditions

### Auth
- Storage state: `automation-repository/fixtures/.auth/admin.json`
- Login: Mobile OTP — `8888888888` / `258369` (UAT)
- Role: Admin or Sales Manager Admin (BRD §2)
- API token: Bearer for admin role, scoped to projectId=2 on UAT

### Data
- DB must contain 18 towers for projectId=2
- At least 1 tower in Active state (default: 15)
- At least 1 tower in Inactive state (default: Horizon / Pinnacle / Bright)
- At least 1 unit per status: AVAILABLE, SOLD, RESERVED, REFUGE — required for color-encoding TCs
- At least 1 PAYING (orange) unit — required for TC_TWR_NEG_012 (may need to coordinate with sales-flow test fixture)
- Crest tower: floors 1..35, 8 units per floor (≈280 units total) — for heatmap structural assertions
- Unit 3502 (Crest) in AVAILABLE state at test start — required for drawer TC_TWR_FUNC_010 and pricing TC_TWR_INT_023

### Environment / Network
- WebSocket Python service reachable at `/broadcast-towers` endpoint for TC_TWR_API_031
- DB read access (Sequelize) for TC_TWR_DB_034, TC_TWR_DB_035
- Audit log table queryable for TC_TWR_API_032

### Cross-module fixtures
- Config write access for TC_TWR_INT_021 (tower toggle), TC_TWR_INT_022 (unit status), TC_TWR_INT_023 (unit cost)
- TC_TWR_XMOD_020 requires landing on Config first → deep link → Towers — fixture must seed Config row for target tower

---

## Cleanup / Teardown

| TC group | Cleanup action |
|----------|----------------|
| TC_TWR_INT_021 | Revert Aura tower toggle back to baseline Active state via Config |
| TC_TWR_INT_022 | Revert unit 3502 (Crest) back to AVAILABLE state via Config Unit Status upload |
| TC_TWR_INT_023 | Revert unit 3502 (Crest) basicPrice/totalUnitValue back to baseline via Config Unit Cost Update |
| TC_TWR_API_031 | None — WebSocket broadcast is fire-and-forget; verify mock received call, no state revert needed |
| All UI/FUNC/UI-UX TCs | None — read-only, no state change |
| All DB TCs | None — read-only queries |

**Idempotency note:** Per BRD §11.6, calling updateTowerStatus with the same state is a no-op (no audit log). Cleanup scripts that "restore baseline" should check current state first — re-setting the same state writes no row.

---

## Baseline Reference (UAT capture 2026-06-01)

Use these values as expected results for assertions where a screenshot is the source of truth:

```
KPI — Towers:   Total=18  Active=15  Inactive=3
KPI — Units:    Total=4708  Sold=238  Available=3729  Disabled=738
Default tower:  Crest (auto-selected on first load)
Crest units available (chip count): 84
Triumph units available (chip count): 223
Blossom units available (chip count): 0
Inactive towers (chip suffix): Horizon, Pinnacle, Bright
```

When live UAT data drifts from baseline, update this section + INDEX.md and re-run capture before re-assertion.
