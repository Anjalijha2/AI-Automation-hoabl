# Test Cases — Tower and Unit Heatmap
**Portal:** Sales Manager Portal
**BRD Reference:** SM-FS-Tower-Heatmap.md
**FSD Reference:** `manual-qa-repository/03-user-manual/sm-portal/fsd-tower-heatmap.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- Towers + unit heatmap is **shared cross-role** via `GET /api/v1/towers` and `GET /api/v1/towers/:towerId/units` — accessible to `user`, `admin`, `sales_manager_admin`, `sales_manager`.
- Real-time unit-status broadcast is via Python service `/units/status-sync` (admin) and WebSocket on client.
- Status writes go through `Tower.update(hooks:false)` → AuditLog → Redis cache → Python broadcast (fire-and-forget).

---

## Navigation & Page Load

### SM_HMP_001 — Towers page loads at /sales-manager/towers

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | SM logged in; at least one tower configured and active |
| **Type** | UI |
| **Test Steps** | 1. From bottom nav or side menu click Towers<br>2. Wait for page load |
| **Expected Result** | URL changes to /sales-manager/towers; page renders without errors |
| **Priority** | Critical |

---

### SM_HMP_002 — Tower list sidebar renders all active towers

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | On /sales-manager/towers; multiple active towers exist |
| **Type** | UI |
| **Test Steps** | 1. Inspect tower list/sidebar<br>2. Count towers listed |
| **Expected Result** | All active towers shown with names; inactive towers hidden per BR 1.6.2 |
| **Priority** | High |

---

### SM_HMP_003 — Selecting a tower loads its unit grid

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower list visible |
| **Type** | FUNC |
| **Test Steps** | 1. Click on a tower name e.g. Crest<br>2. Wait for unit grid render |
| **Expected Result** | Unit grid loads showing all floors and units for the selected tower |
| **Priority** | Critical |

---

### SM_TH_012 — Unauthenticated user redirected to login when accessing /sales-manager/towers

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Security |
| **BRD/FRD Req** | FS 1.3 / global auth gate |
| **Pre-conditions** | No SM JWT in browser storage |
| **Type** | NEG |
| **Test Steps** | 1. Open /sales-manager/towers directly<br>2. Observe redirect |
| **Expected Result** | User redirected to /sales-manager login; towers/units API not called; no inventory leaked |
| **Priority** | Critical |

---

### SM_TH_013 — Loading state shown while tower list is fetching

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | SM logged in; network throttled to Slow 3G |
| **Type** | UI |
| **Test Steps** | 1. Throttle network in DevTools<br>2. Navigate to /sales-manager/towers<br>3. Observe sidebar during the GET /api/v1/towers request |
| **Expected Result** | A loading skeleton or spinner shown in the tower list area until the response arrives; no blank/broken layout |
| **Priority** | Medium |

---

### SM_TH_014 — Empty state shown when no active towers configured

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **BRD/FRD Req** | FS 1.6.2 / FS 1.3 |
| **Pre-conditions** | All towers in DB marked inactive |
| **Type** | UI |
| **Test Steps** | 1. SM logs in<br>2. Navigate to /sales-manager/towers<br>3. Inspect the tower list and grid areas |
| **Expected Result** | Friendly empty-state message such as "No towers available" displayed; no broken UI; no JS errors |
| **Priority** | High |

---

### SM_TH_015 — Tower list is scrollable when many towers configured

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / UI |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | 10+ active towers configured |
| **Type** | UI |
| **Test Steps** | 1. Navigate to towers page<br>2. Try scrolling the tower list sidebar<br>3. Click on a tower at the bottom of the list |
| **Expected Result** | Sidebar scrolls smoothly; all towers reachable via scroll; bottom tower selectable and loads its grid |
| **Priority** | Medium |

---

### SM_TH_016 — Default tower auto-selected on first load

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **BRD/FRD Req** | FS 1.4 / FRD Module 2 |
| **Pre-conditions** | SM logged in; multiple active towers |
| **Type** | UI |
| **Test Steps** | 1. Navigate to /sales-manager/towers<br>2. Inspect which tower is selected by default<br>3. Verify the unit grid loaded |
| **Expected Result** | First active tower (or last-viewed tower from session/local storage if persisted) is selected by default and its grid loaded; no manual click required to see units |
| **Priority** | Medium |

---

## Unit Status Colour Coding

### SM_HMP_004 — Available units display in white/green colour

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; units with AVAILABLE status exist |
| **Type** | UI |
| **Test Steps** | 1. Locate an AVAILABLE unit on the grid<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in white or green per FS 1.5 legend |
| **Priority** | High |

---

### SM_HMP_005 — Held units display in orange

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; at least one unit in HOLD status |
| **Type** | UI |
| **Test Steps** | 1. Locate a unit on hold<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in orange indicating "Proceeding to Pay" hold state |
| **Priority** | High |

---

### SM_HMP_006 — Booked units display in red

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; BOOKED units exist |
| **Type** | UI |
| **Test Steps** | 1. Locate a BOOKED unit<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in red indicating confirmed sale |
| **Priority** | High |

---

### SM_HMP_007 — Reserved units display in blue

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; admin has reserved at least one unit |
| **Type** | UI |
| **Test Steps** | 1. Locate a reserved unit<br>2. Inspect its colour |
| **Expected Result** | Unit cell renders in blue indicating admin reservation |
| **Priority** | Medium |

---

### SM_HMP_008 — Unit status legend visible on screen

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | On towers page with unit grid loaded |
| **Type** | UI |
| **Test Steps** | 1. Locate the legend area<br>2. Verify all 4 status colours documented |
| **Expected Result** | Legend shows: White/Green = Available, Orange = Hold, Red = Booked, Blue = Reserved |
| **Priority** | Medium |

---

## Read-Only Behaviour & Real-Time Sync

### SM_HMP_009 — SM cannot modify unit status from heatmap

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Tower selected; unit grid loaded |
| **Type** | BIZ |
| **Test Steps** | 1. Click on an AVAILABLE unit<br>2. Right-click or long-press unit<br>3. Inspect for any edit/action controls |
| **Expected Result** | No edit, book, hold, or status-change controls present; view is read-only per BR 1.6.1 |
| **Priority** | Critical |

---

### SM_HMP_010 — Unit grid updates in real-time during active campaign

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **Pre-conditions** | Active allocation campaign running; SM viewing the heatmap |
| **Type** | INT |
| **Test Steps** | 1. Keep heatmap open<br>2. Have another user/admin place a unit on HOLD<br>3. Observe SM view |
| **Expected Result** | Unit colour transitions to orange without page refresh via WebSocket per BR 1.6.3 |
| **Priority** | High |

---

### SM_TH_017 — Outside active campaign, view reflects last-known DB state (no WebSocket)

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap |
| **BRD/FRD Req** | FS 1.6.4 |
| **Pre-conditions** | No active allocation campaign; SM viewing the heatmap |
| **Type** | BIZ |
| **Test Steps** | 1. SM opens /sales-manager/towers<br>2. Inspect WebSocket connections in DevTools<br>3. Wait 60s and observe units |
| **Expected Result** | Unit colours reflect the most recent DB state; no live updates flowing; WebSocket may be inactive or idle — view matches BR 1.6.4 |
| **Priority** | High |

---

### SM_TH_018 — POST/PATCH from SM Portal to /towers/:id is rejected with 403

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Security |
| **BRD/FRD Req** | FS 1.6.1 (read-only) |
| **Pre-conditions** | Valid SM JWT (roleId=5); known tower ID |
| **Type** | NEG |
| **Test Steps** | 1. Using DevTools or Postman with the SM JWT, call PATCH /api/v1/towers/:id with a status change payload<br>2. Inspect response |
| **Expected Result** | API returns 403 Forbidden (or 404 if route not exposed to SM); no DB write occurs; heatmap remains unchanged |
| **Priority** | Critical |

---

### SM_TH_019 — WebSocket reconnects automatically after transient network drop

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Real-Time |
| **BRD/FRD Req** | FS 1.6.3 / FSD WebSocket via Python /units/status-sync |
| **Pre-conditions** | Active campaign; heatmap open with live updates working |
| **Type** | INT |
| **Test Steps** | 1. In DevTools, set network to Offline for 10s<br>2. Set network back to Online<br>3. Have an admin change a unit status<br>4. Observe SM heatmap |
| **Expected Result** | After reconnect, the latest unit status changes propagate to the SM heatmap; no need to refresh the page; no stale-state lock |
| **Priority** | High |

---

### SM_TH_020 — Switching between towers preserves live-update subscription

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Real-Time |
| **BRD/FRD Req** | FS 1.6.3 |
| **Pre-conditions** | Active campaign; multiple active towers |
| **Type** | INT |
| **Test Steps** | 1. View Tower A; admin changes a unit status in Tower A → observe update<br>2. Click Tower B in sidebar<br>3. Admin changes a unit status in Tower B → observe update |
| **Expected Result** | Live updates flow for the currently-viewed tower; switching towers does not break the WebSocket subscription; updates for Tower B arrive in real time |
| **Priority** | High |

---

### SM_TH_021 — No audit log entry written when SM merely views the heatmap

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Audit |
| **BRD/FRD Req** | FS 1.7 |
| **Pre-conditions** | SM logged in |
| **Type** | DB |
| **Test Steps** | 1. Note current latest audit_log row<br>2. SM navigates to /sales-manager/towers and clicks several towers<br>3. Query audit_logs for any new entries from this SM in that timeframe |
| **Expected Result** | No new audit_log rows from this SM (read-only screen — no write events recorded), confirming BR 1.7 |
| **Priority** | Medium |

---

### SM_TH_022 — Unit status broadcast race — UI reconciles to final DB state on reload

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Real-Time |
| **BRD/FRD Req** | FSD §3 (Tower.update hooks:false → Redis cache → Python broadcast fire-and-forget) |
| **Pre-conditions** | Active campaign; rapid sequence of status changes possible on a specific unit |
| **Type** | EDGE |
| **Test Steps** | 1. Have admin rapidly change a unit AVAILABLE → HOLD → BOOKED within 2 seconds<br>2. Observe heatmap during the burst<br>3. Refresh the page after the dust settles |
| **Expected Result** | Final state on refresh matches the DB final state (BOOKED). Intermediate WebSocket frames may arrive in different order but reload reconciles to the canonical DB value. |
| **Priority** | High |

---

## [FSD-CORRECTION] New TCs — Tower Heatmap source-verified

### SM_HMP_FSD_011 — [FSD-CORRECTION] Heatmap endpoint shared across user/admin/sm-admin/sm roles

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Security |
| **BRD/FRD Req** | FSD Towers §2 endpoint 11-12 |
| **Pre-conditions** | Valid JWT for each role |
| **Type** | BIZ |
| **Test Steps** | 1. Call `GET /api/v1/towers` and `GET /api/v1/towers/:towerId/units` with each of user/admin/sm-admin/sm JWTs |
| **Expected Result** | All four roles get 200. Endpoint is `protect`-gated and shared. Behavior may vary by `?action=` query param. |
| **Priority** | Medium |

---

## General

### SM_TH_023 — [FSD-CORRECTION] Green colour covers AVAILABLE / HOLD / PREBOOKED / RESERVED per source

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / UI |
| **BRD/FRD Req** | FSD §3 colour mapping (common.service.js heatmap functions) |
| **Pre-conditions** | Tower with units in AVAILABLE, HOLD, PREBOOKED, RESERVED states |
| **Type** | UI |
| **Test Steps** | 1. Inspect unit cells of each state in the grid<br>2. Read the computed CSS background-color |
| **Expected Result** | All four states render as `#00FF00` (green) per source — confirms FSD-CORRECTION colour map (orange/blue colours from old BRD do NOT exist in source). |
| **Priority** | High |

---

### SM_TH_024 — [FSD-CORRECTION] Grey colour applied to REFUGE and synthetic NOT_AVAILABLE padding cells

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / UI |
| **BRD/FRD Req** | FSD §3 colour mapping |
| **Pre-conditions** | Tower with REFUGE floor and missing/padded units |
| **Type** | UI |
| **Test Steps** | 1. Locate REFUGE units in the grid<br>2. Locate any NOT_AVAILABLE / padding cells<br>3. Inspect their colour |
| **Expected Result** | Both REFUGE and NOT_AVAILABLE padding cells render in grey `#808080`; this matches the source-verified colour map. |
| **Priority** | Medium |

---

### SM_TH_025 — Heatmap renders correctly on tablet viewport (768x1024)

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Responsive |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | SM logged in; DevTools viewport set to 768x1024 |
| **Type** | UI |
| **Test Steps** | 1. Open /sales-manager/towers in tablet viewport<br>2. Inspect sidebar, grid, legend<br>3. Click a tower to load grid |
| **Expected Result** | All elements visible without horizontal scroll on the page itself; unit cells readable; legend visible; tower selection works |
| **Priority** | Medium |

---

### SM_TH_026 — Hover/tap on a unit cell shows unit number tooltip

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / UI |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | Tower selected; unit grid loaded |
| **Type** | UI |
| **Expected Result** | Hovering (desktop) or tapping (mobile) a unit shows a tooltip/popover with at least the unit number and current status — supports BR 1.1 (guide customers on availability). |
| **Test Steps** | 1. Hover over a unit cell (desktop) or tap (mobile)<br>2. Inspect the tooltip content |
| **Priority** | Medium |

---

### SM_TH_027 — Tower grid handles 50+ floors without layout breaking

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / UI / Scale |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | A tower with 50+ floors configured |
| **Type** | UI |
| **Test Steps** | 1. Load the large tower in heatmap<br>2. Scroll the grid<br>3. Inspect rendering performance in DevTools |
| **Expected Result** | All floors render without layout breaks; smooth scroll (< 16ms per frame); no overlapping unit cells; legend remains visible |
| **Priority** | Medium |

---

### SM_TH_028 — Logout from towers page clears WebSocket subscription

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Session |
| **BRD/FRD Req** | FS 1.6.3 / session lifecycle |
| **Pre-conditions** | Active campaign; SM viewing heatmap with live updates connected |
| **Type** | INT |
| **Test Steps** | 1. Open DevTools → Network → WS tab and verify the WebSocket is open<br>2. Click Logout<br>3. Observe the WebSocket state |
| **Expected Result** | WebSocket connection closes (status 1000 or 1001) on logout; no leaked subscription after JWT cleared |
| **Priority** | High |

---

### SM_TH_029 — Heatmap API uses ?action= query param to scope response shape

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / API |
| **BRD/FRD Req** | FSD Towers §2 (action query) |
| **Pre-conditions** | Valid SM JWT; known tower ID |
| **Type** | API |
| **Test Steps** | 1. Call GET /api/v1/towers/:towerId/units (no action)<br>2. Call GET /api/v1/towers/:towerId/units?action=heatmap<br>3. Compare payload shapes |
| **Expected Result** | The `?action=heatmap` variant returns the slim heatmap shape (id, status, colour); the default returns a richer payload; behaviour matches FSD note that "behavior may vary by ?action= query param" |
| **Priority** | Medium |

---

### SM_TH_030 — Direct access to /sales-manager/towers/:invalidId shows graceful error

| Field | Value |
|-------|-------|
| **Module** | SM – Tower Heatmap / Edge |
| **BRD/FRD Req** | FS 1.4 |
| **Pre-conditions** | SM logged in |
| **Type** | EDGE |
| **Test Steps** | 1. Navigate directly to /sales-manager/towers/9999999 (non-existent tower)<br>2. Observe page state |
| **Expected Result** | Page renders the sidebar with valid towers; a friendly "Tower not found" message replaces the grid area; no JS crash |
| **Priority** | Medium |

---
