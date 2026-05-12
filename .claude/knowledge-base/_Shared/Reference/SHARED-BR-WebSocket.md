---
title: WebSocket System
category: Integrations
updated: 2026-05-11
---

# WebSocket System

## 1. Architecture Overview

3-tier real-time system:

```
React Frontend (Customer / SM / CP Portal)
        ↕  WebSocket (JWT-in-URL)
Python FastAPI WebSocket Server  ←→  Redis (unit state, campaign state)
        ↕  HTTP (internal)
Node.js Backend (admin API)
```

- **Python FastAPI** owns the WebSocket server and Redis state
- **Node.js** calls Python HTTP endpoints to trigger broadcasts (never opens a WS connection itself)
- **React** maintains one persistent WS connection per session; all real-time unit grid updates arrive through it

**Base URL:** `${WS_BASE_URL}` env var (e.g. `wss://uat-web.xrportal.in/backend/api/xanadu`)  
**Full WS path:** `/backend/api/xanadu/ws/{token}`

---

## 2. Connection Lifecycle (Frontend — WebSocketProvider.jsx)

### Connection Establishment

1. `WebSocketProvider` mounts → reads JWT from auth context
2. Opens `new WebSocket(${WS_BASE_URL}/${token})`
3. Python server verifies JWT, queries User from DB, closes DB session, calls `websocket.accept()`
4. Server sends `connection_established` message immediately
5. Client receives it → sets `isConnected = true`, requests towers

### Reconnection Logic

- Max attempts: **5**
- Delay between attempts: **3000ms**
- Trigger: `onclose` event where `event.code !== 1000`
- Counter resets on successful reconnection
- On exhausting 5 attempts: sets `connectionError` state

### State Exposed (useWebSocket hook consumers)

| State | Type | Description |
|-------|------|-------------|
| `socket` | WebSocket | Raw WS instance |
| `isConnected` | boolean | Connection live |
| `connectionError` | string\|null | Error after max retries |
| `towers` | array | Tower list from server |
| `activeTower` | object | Currently selected tower |
| `towerUnits` | object | Unit grid for active tower |
| `unitDetails` | object | Detail for selected unit |

---

## 3. Authentication

JWT passed as URL path segment — **not** as a header or query param.

```
wss://host/backend/api/xanadu/ws/<JWT_TOKEN>
```

Python server validates token in `TokenVerificationMiddleware` on all routes.

**WS-specific auth flow in `websocket_routes.py`:**
1. Extract token from path param
2. Verify JWT → get `user_id`
3. Query `User` from DB
4. Close DB session
5. On failure → close with code:
   - `4001` — invalid/expired token
   - `4002` — user not found in DB
   - `4003` — auth processing error
   - `4000` — internal server error

---

## 4. Client → Server Messages

All sent via helper functions in `messageRequests.js`. Every message includes `project_id` from env/context.

| Function | Message Type | Payload | Purpose |
|----------|-------------|---------|---------|
| `requestRegistrations(socket)` | `user_details` | `{type, project_id}` | Get user's registrations + allocation status |
| `requestAllocatedUnit(socket, regNo)` | `allocated_unit` | `{type, project_id, registration_number}` | Get unit allocated to a specific registration |
| `requestAllocatedUsers(socket, unitId)` | `allocated_unit` | `{type, project_id, unit_id}` | Get all users allocated to a unit (admin view) |
| `requestTowers(socket)` | `towers` | `{type, project_id}` | Get all tower list |
| `requestTowerUnits(socket, towerId)` | `tower_units` | `{type, project_id, tower_id}` | Get unit grid for a specific tower |
| `requestUnitDetail(socket, unitId)` | `unit_details` | `{type, project_id, unit_id}` | Get pricing + status detail for a unit |
| `requestProceedToPay(socket, regDetails[])` | `proceed_to_pay` | `{type, project_id, registration_detail: [{registration_number, unit_id}]}` | Initiate payment lock on unit |

---

## 5. Server → Client Messages

### Responses to client requests

| Type | Trigger | Payload Notes |
|------|---------|---------------|
| `connection_established` | On WS accept | User info + campaign `allocation_type` + `allocation_status` |
| `user_detail_response` | Reply to `user_details` | Registration list with statuses |
| `towers_response` | Reply to `towers` | All towers for project |
| `tower_units_response` | Reply to `tower_units` | Floor/unit grid for requested tower |
| `unit_details_response` | Reply to `unit_details` | Pricing, status, typology detail |
| `allocated_unit_response` | Reply to `allocated_unit` | Unit assigned to registration |

### Server-push (broadcast) messages

| Type | Source trigger | Who receives |
|------|---------------|-------------|
| `towers_response` | Node calls `GET /broadcast-towers` | STATIC+RUNNING → all users; else → admins only |
| `tower_units_response` | Node calls `POST /units/status-sync` | STATIC+RUNNING+active tower → all; else → admins only |
| `tower_refresh` | Payment success/failure (`POST /update-payment-status`) | STATIC → all connected users; DYNAMIC → admins only |
| `unit_sold` | Payment success (STATIC) | All users **except** the buyer |
| `user_detail_response` | Payment success | Buyer only (updated registration status) |

---

## 6. Campaign Access Control Middleware

Enforced server-side on every incoming message type.

**Always allowed** (no campaign required):
- `user_details`
- `towers`
- `tower_units`
- `proceed_to_pay`

**Requires RUNNING campaign:**
- `allocated_unit`
- `unit_details`
- `tower_refresh`-related requests

**Additional check for DYNAMIC campaigns:**
- Also validates current round status before allowing unit interaction messages

All messages (allowed or rejected) are stored to DB via `message_service.store_message()` for audit.

---

## 7. Python HTTP Endpoints (Called by Node.js)

Node.js `python.service.js` provides `get(url)`, `post(url, data)`, `put(url, data)`. Connection errors (ECONNREFUSED etc.) are logged but do **not** block the Node operation.

### `GET /broadcast-towers`

**Trigger:** Campaign state change; tower config change  
**Action:** Fetches towers from Redis → pushes `towers_response` to connected users  
**Targeting:**
- Campaign `STATIC` + status `RUNNING` → broadcast to **all** connected users
- Any other state → broadcast to **admins only** (`role_id = 1`)

---

### `POST /broadcast-registrations`

**Body:** `{ user_ids: [...] }`  
**Action:** Queries Redis for each user's registration state → pushes `user_detail_response` to each specified user  
**Targeting:** Specific user_ids only

---

### `POST /units/status-sync`

**Body:** `{ reserved: [unitIds], available: [unitIds] }`  
**Action:**
1. Updates Redis unit cache → sets unit status to `reserved` or `available`
2. Rebuilds affected tower grid in Redis
3. Broadcasts `tower_units_response`

**Targeting:**
- Campaign `STATIC` + status `RUNNING` + tower matches buyer's active tower → **all users**
- Otherwise → **admins only**

Node calls this on:
- Registration unit cancellation (refund, admin cancel)
- Unit status changes

---

### `POST /update-payment-status`

**Body:** `{ registration_number, unit_id, status: 'success'|'failure', ... }`

**STATIC campaign flow:**
1. `success` → mark unit sold in Redis + DB
2. Broadcast `tower_refresh` to **all** connected users (unit colour → red/sold)
3. Broadcast `unit_sold` to **all except buyer**
4. Send `user_detail_response` to **buyer only** (shows booking confirmed)

**DYNAMIC campaign flow:**
1. `success` → mark unit sold
2. Broadcast `tower_refresh` to **admins only**
3. Trigger reallocation for registration:
   - Round-robin assigns next available unit to buyer's registration
   - If no units available → set registration to `WAITLIST`
4. Send updated `user_detail_response` to buyer

**failure flow (both types):**
1. Release unit hold in Redis → unit returns to available
2. Broadcast `tower_refresh` to re-colour unit

---

### `POST /campaign/start`

**Body:** `{ campaign_id, allocation_type, scheduled_start_time? }`  
**Immediate start:** Triggers campaign warmup directly  
**Scheduled start:** Sets Redis TTL key `events:{project_id}:campaign:pre_warmup_trigger` → Redis key expiry event triggers warmup at scheduled time  

**Warmup process (CampaignWarmupService):**
- Loads all tower/unit/floor/registration data from DB into Redis
- Sets `events:{project_id}:allocation_campaign` → `{id, status:'RUNNING', allocation_type}`
- For DYNAMIC: initialises round state + sets `events:{project_id}:campaign:round_time` TTL key

---

### `POST /campaign/stop`

**Body:** `{ campaign_id, force?: boolean }`  
**STATIC:** Immediate stop — sets campaign status in Redis to `STOPPED`, broadcasts `towers_response` to all  
**DYNAMIC:**
- Default: graceful stop — sets `events:{project_id}:campaign:stop_after_round` flag → stops after current round completes
- `force: true` → immediate stop regardless of round state

---

### `GET /stats`

**Returns:** `{ connected_users: N, admin_connections: N, buyer_connections: N }`  
No broadcast — query only.

---

## 8. Redis Key Patterns

| Key | Type | Contents |
|-----|------|---------|
| `events:{project_id}:allocation_campaign` | Hash | `{id, status, allocation_type}` |
| `events:{project_id}:units:{unit_id}` | Hash | `{status, tower_id, floor_id, typology_id, ...}` |
| `events:{project_id}:tower:{tower_id}:units` | JSON | Floor/unit grid array (full tower layout) |
| `events:{project_id}:towers` | JSON | All towers list |
| `events:{project_id}:tower:config` | JSON | Tower active/inactive configuration |
| `events:{project_id}:registration:{reg_number}` | Hash | `{user_id, status, typology_id}` |
| `events:{project_id}:registration:{reg_number}:alloc` | String | Allocated `unit_id` |
| `events:{project_id}:registration:{reg_number}:lost_units` | List | DYNAMIC: units lost in previous rounds |
| `events:{project_id}:campaign:round` | String | Current round ID (DYNAMIC only) |
| `events:{project_id}:current_round` | Hash | `{round_status, round_number, ...}` |
| `events:{project_id}:campaign:round_time` | TTL key | Expiry → triggers round end (DYNAMIC) |
| `events:{project_id}:campaign:pre_warmup_trigger` | TTL key | Expiry → triggers campaign warmup |
| `events:{project_id}:campaign:stop_after_round` | String | Graceful stop flag (DYNAMIC) |
| `events:{project_id}:units:{unit_id}:alloc` | JSON | `[{registration_number, pay_now_initiated}]` |
| `events:{project_id}:registration_unit_hold_mapping` | Hash | Hold mapping (unit → registration) |
| `events:{project_id}:floors:{floor_id}` | Hash | `{floor_sequence, band_id}` |
| `events:{project_id}:meta` | Hash | `{tower_sequence, ...}` |
| `user:{user_id}:info` | Hash | `{first_name, last_name, email, phone}` |

**Persistence:** Redis configured with AOF (Append-Only File) for allocation event durability. Campaign events survive Redis restart.

---

## 9. Redis Key Expiry Scheduling

Python server startup launches `RedisListenerService` — listens on Redis keyspace notifications for `expired` events.

**Scheduled campaign start:**
1. Node calls `POST /campaign/start` with `scheduled_start_time`
2. Python sets `events:{project_id}:campaign:pre_warmup_trigger` with TTL = seconds until start
3. Redis fires keyspace notification on expiry
4. `RedisListenerService` catches it → triggers `CampaignWarmupService`
5. DB data loaded into Redis, campaign status set to `RUNNING`
6. WS broadcasts `towers_response` to all connected users

**DYNAMIC round end:**
1. Round timer key `events:{project_id}:campaign:round_time` set with TTL = round duration
2. On expiry → `RedisListenerService` triggers round-end logic
3. Units re-distributed, new round initialised, round counter incremented
4. If `stop_after_round` flag set → campaign stops instead of starting new round

---

## 10. Frontend State Management

### WebSocketProvider (context provider)

Location: `src/context/WebSocketProvider.jsx`  
Wraps entire app. All WS state centralised here.

**Auto-sequence on connect:**
1. Receive `connection_established`
2. Auto-call `requestTowers(socket)` 
3. On `towers_response` → if active tower set → auto-call `requestTowerUnits(socket, activeTowerId)`

**Tower units response guard:**
```js
if (response.towerId !== activeTowerRef.current.id) return; // ignore stale responses
```

**`tower_refresh` handler:**
- Does **not** replace full `towerUnits` state
- Patches only changed unit's status in existing state (in-place update)
- Prevents full grid re-render on single unit status change

### useWebSocket hook

Location: `src/websocket/useWebSocket.js`  
Consumers call `useWebSocket()` to get all state + action functions.

### Message senders

Location: `src/websocket/messageRequests.js`  
Pure functions — take `socket` as first arg, call `socket.send(JSON.stringify(payload))`.

### Constants

Location: `src/websocket/websocket.js`  
Exports `WS_BASE_URL` and message type string constants.

---

## 11. STATIC vs DYNAMIC Broadcast Differences

| Event | STATIC | DYNAMIC |
|-------|--------|---------|
| Campaign start | All users see towers immediately | Users see towers; round assignment controls unit access |
| Unit sold | `tower_refresh` + `unit_sold` → all users | `tower_refresh` → admins only; buyer gets reallocation |
| Campaign stop | Immediate; all users see closed state | Graceful (wait for round) or force |
| Tower grid broadcast | All connected users | Admins only (unless RUNNING) |

---

## 12. Close Codes

| Code | Meaning |
|------|---------|
| `1000` | Normal closure (campaign ended, user logged out) |
| `4001` | Invalid or expired JWT token |
| `4002` | User not found in DB |
| `4003` | Authentication processing error |
| `4000` | Internal server error |

Client-side: `code !== 1000` → schedule reconnect attempt.

---

## 13. Role-Based Broadcast Targeting

Python server identifies admins by `role_id = 1` on the connected user record.

**Admin receives:**
- All broadcast messages (always)
- `tower_refresh` in DYNAMIC campaigns
- Tower/unit updates outside RUNNING campaigns

**Buyer receives:**
- Unit grid updates during RUNNING STATIC campaigns
- Their own `user_detail_response` on payment events
- `unit_sold` for units sold by other buyers (STATIC)

---

## 14. Message Audit Trail

Every incoming client message stored to DB via:
```python
await message_service.store_message(user_id, project_id, message_type, payload)
```

Stored regardless of whether the message was processed or rejected by access control. Provides full audit trail of all WS activity per user per session.

---

## 15. Node.js → Python Error Handling

`python.service.js` catches connection errors:
- `ECONNREFUSED` — Python service down
- `ETIMEDOUT` — service unresponsive
- `ENOTFOUND` — DNS failure

Errors logged at service level. **Do not propagate as HTTP 500 to admin API callers** — Node operations (e.g. cancel registration) complete successfully even if the broadcast fails. Unit state in Redis may temporarily lag DB state until next explicit sync.
