# Real-time Events — WebSocket Server BRD

**Component:** WebSocket / Real-time Event Server
**Technology:** Python FastAPI with WebSockets, Redis
**Last Updated:** 2026-05-10
**Sprint Reference:** BRD Reverse Engineering Sprint
**Tags:** #component/websocket #type/brd #status/complete

---

## Related Notes
- [[Allocation-Workflow]]
- [[Buyer-Portal-BRD]]
- [[Admin-Portal-BRD]]
- [[Backend-Functional-BRD]]

---

## 1. Overview

The WebSocket server is a dedicated Python FastAPI application that powers the real-time allocation experience. It manages live bidirectional communication between the buyer portal, admin portal, and the allocation event engine.

**Key Responsibilities:**
1. Maintain persistent WebSocket connections for all connected clients
2. Serve real-time unit availability data during allocation events
3. Broadcast unit status changes instantly to all connected users
4. Manage campaign start/stop lifecycle
5. Handle payment status updates and trigger real-time notifications
6. Support STATIC, DYNAMIC, and PHYSICAL_EVENT allocation types in real-time

---

## 2. Architecture

```
web-socket/
├── api/v1/endpoint/
│   ├── websocket_routes.py   → WebSocket connection endpoint
│   └── http_routes.py        → Internal HTTP API (called by Node.js backend)
├── core/
│   └── config.py             → Server configuration
├── sockets/
│   └── connection_manager.py → WebSocket connection pool management
├── services/
│   ├── websocket_message_service.py → Message handling logic
│   ├── warmup_service.py             → Pre-allocation data loading into Redis
│   └── message_service.py            → Message persistence
├── helpers/
│   ├── redis_manager.py      → Redis cache operations
│   ├── auth_helper.py        → JWT verification
│   └── aof_manager.py        → Append-only file for data durability
├── models/
│   └── models.py             → SQLAlchemy models (read-only mirror)
└── database/
    └── database.py           → DB session for read operations
```

---

## 3. Connection Architecture

### WebSocket Endpoint

**URL Pattern:** `ws://<host>/ws/:token`

- Token is the buyer's JWT from the main backend
- Server validates JWT on connection
- User ID and role are extracted from the token
- Invalid tokens → connection rejected with error code 4001/4003
- Non-existent users → connection rejected with error code 4002

### Connection Manager

Manages all active WebSocket connections in memory:
- Stores connection per user ID
- Tracks user role (role_id=1 for admin, others for buyers)
- Supports personal messages, group messages, and broadcast
- Provides connected users list and total connection count

### Connection Roles:
| Role ID | Behavior |
|---------|---------|
| 1 (Admin) | Receives all broadcast messages; sees all unit statuses |
| 2+ (Buyer/CP/SM) | Receives filtered broadcasts based on campaign type and status |

---

## 4. Message Types

### Messages Sent BY Buyer (Client → Server)

| Message Type | Required Fields | Purpose |
|-------------|----------------|---------|
| `user_details` | None | Request own registration and allocation status |
| `registration_details` | `registration_number` | Get status of a specific registration |
| `towers` | None | Get list of all towers and availability summary |
| `tower_units` | `tower_id` | Get unit grid for a specific tower |
| `tower_units_detailed` | `tower_id` | Get detailed unit data for a tower |
| `tower_info` | `tower_id` | Get tower-level information |
| `unit_details` | `unit_id` | Get details of a specific unit |
| `pay_now_initiated` | `unit_id`, `registration_number`, `initiated` | Signal payment initiation (places hold) |
| `proceed_to_pay` | `registration_detail` (array of {unit_id, registration_number}) | Confirm proceeding to payment |
| `allocated_users` | `unit_id` | Get list of users allocated to a unit (for DYNAMIC) |

### Messages Received BY Buyer (Server → Client)

| Message Type | Trigger | Content |
|-------------|---------|---------|
| `connection_established` | On WebSocket connect | User info, allocation type, allocation status |
| `user_details_response` | Reply to user_details | Registration list with allocation status per registration |
| `towers_response` | Reply to towers | All towers with unit count summary |
| `tower_units_response` | Reply to tower_units | Floor-by-floor unit grid with status and color |
| `tower_units_detailed_response` | Reply to tower_units_detailed | Detailed unit data |
| `tower_info_response` | Reply to tower_info | Tower metadata |
| `unit_details_response` | Reply to unit_details | Full unit details with pricing |
| `proceed_to_pay_response` | Reply to proceed_to_pay | Allocation confirmation or error |
| `allocated_users_response` | Reply to allocated_users | User list for a unit |
| `tower_refresh` | Unit status changes | tower_id, unit_id, new status, available count |
| `unit_sold` | Successful booking by any buyer | Masked buyer name, unit number, tower name |
| `reallocation_notification` | DYNAMIC payment failure | New unit allocated / MISSED / WAITLIST |
| `new_message` | Admin broadcast | Custom admin message |

---

## 5. Campaign Middleware (Access Control)

The WebSocket server enforces campaign state before processing most messages.

**Always-Allowed Messages (no campaign check):**
- `user_details`
- `towers`
- `tower_units`
- `proceed_to_pay`

**Campaign-Gated Messages (all others):**
- For STATIC / PHYSICAL_EVENT: campaign must be RUNNING
- For DYNAMIC: campaign must be RUNNING AND current round must be RUNNING
- If conditions not met: error response sent to the requesting user

This prevents buyers from accessing unit data before the event officially starts (warmup period protection).

---

## 6. HTTP API (Internal — Called by Node.js Backend)

The WebSocket server exposes internal HTTP endpoints that the main backend calls after completing database operations:

### POST `/send-message`
Send a custom message to a specific user.

### POST `/broadcast`
Broadcast a message to:
- All connected users
- Specific list of users
- All users except one (exclude_user)

### GET `/stats`
Get connected user count and server statistics.

### GET `/broadcast-towers`
Broadcast updated tower data to all users. Called after admin updates tower data.
- Admin users: Receive all towers (including inactive)
- Buyers (STATIC + RUNNING): Receive active towers only
- Buyers (DYNAMIC or not RUNNING): Skipped

### POST `/broadcast-registrations`
Send updated user_details_response to specific users. Called after payment status changes.

### POST `/units/status-sync`
Sync unit statuses between RESERVED and AVAILABLE. Called after admin reserves/releases units.
- Updates Redis tower units cache
- Broadcasts updated unit status to affected users

### POST `/update-payment-status`
Update unit and registration status after payment completion/failure.
- Updates Redis unit cache
- Updates Redis tower units cache
- Triggers appropriate broadcasts based on allocation type
- For DYNAMIC payment failures: triggers reallocation logic

### POST `/campaign/start`
Start an allocation campaign (immediate or scheduled).
- Immediate: Triggers warmup right away, sets campaign to RUNNING
- Scheduled: Creates TTL key that expires 1 minute before start (triggers warmup)

### POST `/campaign/stop`
Stop an allocation campaign.
- STATIC/PHYSICAL_EVENT: Stops immediately
- DYNAMIC (graceful): Waits for current round to complete
- DYNAMIC (force): Stops immediately (not recommended)

---

## 7. Redis Data Structure (Cache During Allocation)

All real-time data is stored in Redis during an allocation campaign for ultra-low latency:

| Redis Key Pattern | Data Stored |
|------------------|------------|
| `events:{project_id}:allocation_campaign` | Current campaign data (id, type, status) |
| `events:{project_id}:campaign:round` | Current round ID (DYNAMIC) |
| `events:{project_id}:current_round` | Current round data and status |
| `events:{project_id}:towers` | All towers with band_order info |
| `events:{project_id}:tower:{tower_id}:units` | Floor-by-floor unit grid for a tower |
| `events:{project_id}:units:{unit_id}` | Individual unit data |
| `events:{project_id}:floors:{floor_id}` | Floor data with band_id |
| `events:{project_id}:tower:config` | Tower is_active status per tower |
| `events:{project_id}:registration:{reg_no}` | Registration status data |
| `events:{project_id}:registration:{reg_no}:alloc` | Unit ID allocated to registration |
| `events:{project_id}:registration:{reg_no}:lost_units` | Lost unit history |
| `events:{project_id}:units:{unit_id}:alloc` | Registrations allocated to this unit |
| `events:{project_id}:registration_unit_hold_mapping` | Active payment holds |
| `events:{project_id}:meta` | Campaign metadata (tower_sequence, etc.) |
| `events:{project_id}:allocation_campaign_time` | TTL key for campaign end |
| `events:{project_id}:campaign:pre_warmup_trigger` | TTL key for scheduled warmup |
| `events:{project_id}:campaign:stop_after_round` | Flag to stop after current round |
| `user:{user_id}:info` | User name for unit_sold messages |
| `app:stats` | Server statistics |

---

## 8. Unit Color Scheme (Visual Heatmap)

Units are displayed with color coding in the buyer's tower view:

| Color | Status | show_disabled |
|-------|--------|--------------|
| #00FF00 (Green) | AVAILABLE | false |
| #FFA500 (Orange) | HOLD / Pay Now Initiated | true |
| #FF0000 (Red) | BOOKED | true |
| #0000FF (Blue) | RESERVED (admin hold) | true |

---

## 9. Warmup Process

Before a campaign starts, the warmup service pre-loads all necessary data into Redis.

**Warmup Steps:**
1. Load campaign data and settings
2. Load all towers and their configurations
3. Load all floors with band information
4. Load all units with pricing and availability
5. Load all registered buyers' registration data
6. Initialize unit allocation maps
7. Set campaign status to RUNNING in Redis
8. Notify backend that warmup is complete

**Warmup Triggers:**
- Immediate start: Warmup runs synchronously before campaign begins
- Scheduled start: A Redis TTL key (`pre_warmup_trigger`) is set to expire 1 minute before the scheduled start time → triggers warmup automatically

---

## 10. AOF (Append-Only File) Manager

The AOF manager provides data durability during allocation events:

**Purpose:** Persist critical allocation decisions to disk in addition to Redis (which is in-memory and volatile)

**What is persisted:**
- `initial_allotment` entries: When a buyer becomes WINNER (unit + registration mapping)
- `lost_unit` entries: When a unit is missed in DYNAMIC allocation

**Recovery:** If Redis is restarted during an event, AOF data can be replayed to restore state

---

## 11. Real-time Flows

### STATIC Allocation — Real-time Flow

```
Campaign → RUNNING
  ↓
WebSocket broadcasts: connection_established (with allocation_type=STATIC)
  ↓
Buyer requests towers → towers_response
  ↓
Buyer selects tower → tower_units_response (unit grid with colors)
  ↓
Buyer clicks a unit → pay_now_initiated sent by buyer
  ↓
Server places unit on HOLD, updates Redis
  ↓
Server broadcasts tower_refresh to ALL users
  ↓
Buyer initiates payment → Backend processes
  ↓
Payment SUCCESS:
  - Backend calls /update-payment-status (payment_status=true)
  - Redis: unit → BOOKED, registration → WINNER
  - Broadcasts tower_refresh (status=BOOKED) to ALL users
  - Broadcasts unit_sold to ALL users EXCEPT the buyer
  - Sends user_details_response to the winning buyer
  
Payment FAILURE:
  - Backend calls /update-payment-status (payment_status=false)
  - Redis: unit → AVAILABLE, registration → revert status
  - Broadcasts tower_refresh (status=AVAILABLE) to ALL users
```

### DYNAMIC Allocation — Real-time Flow

```
Campaign → RUNNING
  Round 1 → RUNNING (round timer starts, e.g., 20 min)
    ↓
Each buyer is assigned one unit (round-robin)
    ↓
WebSocket: user_details_response to each buyer (showing their allocated unit)
    ↓
Buyer sees their unit → clicks "Proceed to Pay"
    ↓
proceed_to_pay message sent
    ↓
Server validates and confirms allocation
    ↓
Buyer pays via gateway
    ↓
Backend calls /update-payment-status
    ↓
Payment SUCCESS → WINNER → unit_sold broadcast to others
    ↓
Payment FAILURE:
  - System finds next available unit (round-robin same typology)
  - If found: buyer gets new unit (ALLOCATED), reallocation_notification sent
  - If not found: buyer → WAITLIST
  - lost_unit appended to Redis and AOF
    ↓
Round ends (timer expires) → Round 2 starts
    ↓
Remaining WAITLIST buyers get assigned units in Round 2
```

---

## 12. Connection Lifecycle

```
Client connects → JWT verified → User validated
  ↓
ConnectionManager.connect(websocket, user_id, role_id)
  ↓
Campaign status checked → welcome message sent
  ↓
Bidirectional message loop
  ↓
Client disconnects → ConnectionManager.disconnect(websocket)
```

---

## 13. Error Handling

- Invalid message type → error response (does not disconnect)
- Missing required fields → error response with field name
- Campaign not running → error response (access denied)
- Round not running (DYNAMIC) → error response
- Internal server error → error message sent, connection maintained
- Unhandled exception → error logged, connection disconnected cleanly

---

## 14. Business Rules

1. Admin users (role_id=1) always receive broadcast updates regardless of campaign state
2. Buyers only receive updates when the campaign is RUNNING
3. DYNAMIC allocation always uses round-robin by tower sequence and band order
4. Payment hold is exclusively managed in Redis (20-minute window)
5. Unit color changes are broadcast in real-time to all connected users
6. The `unit_sold` message masks the registration number for privacy
7. Lost unit history is maintained per buyer (not just globally) for personalized DYNAMIC experience
8. Campaign warmup must complete before the campaign is marked RUNNING
9. AOF provides recovery capability if Redis is restarted during an event
10. The WebSocket server is stateless with respect to business logic — it delegates DB updates to the main backend
