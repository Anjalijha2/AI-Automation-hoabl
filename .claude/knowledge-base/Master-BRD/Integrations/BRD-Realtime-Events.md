# Real-Time Events (WebSocket Server) — BRD

**Type:** System Component Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Real-Time Events system powers the live allocation experience. It is a dedicated Python FastAPI server that maintains live connections with all buyers and admins during an allocation campaign, broadcasts unit status changes the moment they happen, and manages the 20-minute payment hold timer in Redis.

This document covers the detailed real-time flows for STATIC and DYNAMIC allocation types, message types, and what each actor sees in real time.

For a non-technical overview, see [[BRD-WebSocket]].

---

## 2. Three-Tier Architecture

| Component | Role |
|-----------|------|
| Python WebSocket Server | Holds all live connections; maintains Redis cache; broadcasts updates |
| Redis | In-memory store — unit statuses, hold timers, campaign state, registration data |
| Node.js Backend | Processes payments and admin actions; calls Python HTTP endpoints to trigger broadcasts |

Buyers never call Node.js for live data. All real-time updates flow through the WebSocket connection to Python.

---

## 3. Connection and Authentication

- WebSocket URL pattern: `ws://<host>/ws/:token`
- Token = buyer's JWT from the main backend, embedded in the URL
- Invalid token → connection rejected (close code 4001)
- Non-existent user → rejected (close code 4002)
- On connect: server sends `connection_established` with campaign type, allocation status

**Reconnection:** Portal retries up to 5 times at 3-second intervals. After 5 failures, a connection error is shown.

---

## 4. What Buyers Send (Client → Server Messages)

| Message | Purpose |
|---------|---------|
| `user_details` | Request own registration and allocation status |
| `towers` | Get all towers with unit availability summary |
| `tower_units` | Get the unit grid for a specific tower |
| `unit_details` | Get details of a specific unit |
| `pay_now_initiated` | Signal payment start — places unit on HOLD in Redis |
| `proceed_to_pay` | Confirm proceeding to payment (DYNAMIC) |

---

## 5. What Buyers Receive (Server → Client Messages)

| Message | Trigger | What Buyer Sees |
|---------|---------|----------------|
| `connection_established` | On connect | Campaign type, their current allocation status |
| `towers_response` | Reply to towers | All active towers with available unit counts |
| `tower_units_response` | Reply to tower_units | Floor-by-floor unit grid with colour codes |
| `unit_details_response` | Reply to unit_details | Full unit details with pricing |
| `tower_refresh` | Any unit status change | Unit ID, new status, updated available count |
| `unit_sold` | Another buyer books a unit | Masked buyer name, unit number, tower (privacy-safe) |
| `reallocation_notification` | DYNAMIC payment failure | New unit assigned, or MISSED/WAITLIST notification |
| `new_message` | Admin broadcasts | Custom text message from admin |

---

## 6. STATIC Allocation — Real-Time Flow

```
Campaign → RUNNING
    ↓
All buyers connect → receive connection_established
    ↓
Buyer requests tower list → sees all active towers
    ↓
Buyer selects tower → receives floor-by-floor unit grid (white/orange/red/blue)
    ↓
Buyer clicks a unit → sends pay_now_initiated
    ↓
Server: unit → HOLD in Redis | broadcasts tower_refresh to ALL (unit turns orange)
    ↓
Buyer completes payment on gateway
    ↓
Gateway webhook → Node.js validates → calls Python /update-payment-status

Payment SUCCESS:
  - Redis: unit → BOOKED, registration → WINNER
  - Broadcasts tower_refresh (unit turns red) to ALL buyers
  - Broadcasts unit_sold to ALL buyers EXCEPT winner
  - Sends user_details_response to winning buyer (confirms WINNER)

Payment FAILURE or 20-min timeout:
  - Redis: unit → AVAILABLE
  - Broadcasts tower_refresh (unit turns white) to ALL buyers
  - Unit available for other buyers again
```

---

## 7. DYNAMIC Allocation — Real-Time Flow

```
Campaign → RUNNING | Round 1 → RUNNING (timer starts, e.g., 20 min)
    ↓
System assigns one unit per buyer (round-robin by band and tower order)
    ↓
Each buyer receives user_details_response showing their assigned unit
    ↓
Buyer sees assigned unit → clicks "Proceed to Pay" → sends proceed_to_pay
    ↓
Buyer pays via gateway
    ↓
Payment SUCCESS → WINNER → unit_sold broadcast to all other buyers

Payment FAILURE:
  - System finds next available unit (same typology, next in band order)
  - If found: buyer reassigned → receives reallocation_notification (new unit)
  - If not found: buyer → WAITLIST → receives reallocation_notification (MISSED/WAITLIST)
  - Lost unit history recorded in Redis and AOF file

Round 1 timer expires → Round 2 starts
  - Remaining WAITLIST buyers from Round 1 get unit assignments in Round 2
  - Process repeats until all buyers are WINNER or WAITLIST with no more units
```

---

## 8. Unit Colour Codes (Heatmap)

| Colour | Status | Buyer Can Select? |
|--------|--------|-----------------|
| White | AVAILABLE | Yes |
| Orange | HOLD | No — someone else in payment flow |
| Red | BOOKED | No — confirmed sold |
| Blue | RESERVED | No — admin reserved |

---

## 9. Campaign Lifecycle Events (Called by Node.js → Python)

| HTTP Endpoint | When Called | What Happens |
|---------------|-------------|--------------|
| `POST /campaign/start` | Admin starts campaign | Warmup runs → Redis loaded → campaign RUNNING |
| `POST /campaign/stop` (graceful) | Admin stops DYNAMIC | Waits for current round to complete then stops |
| `POST /campaign/stop` (force) | Emergency stop | Stops immediately regardless of round state |
| `POST /update-payment-status` | Payment webhook confirmed | Redis updated → broadcasts triggered |
| `POST /units/status-sync` | Admin changes unit status | Redis updated → buyers see colour change |
| `POST /broadcast-registrations` | Registration data changes | Affected buyers receive updated status |
| `GET /broadcast-towers` | Admin updates tower data | All connected users receive fresh tower list |

---

## 10. Warmup Process

Before a campaign starts, all data is pre-loaded into Redis:

1. Campaign data and settings loaded
2. All towers and floor configurations loaded
3. All units with pricing and availability loaded
4. All registered buyers' data loaded
5. Unit allocation maps initialised
6. Campaign status set to RUNNING in Redis
7. Backend notified that warmup is complete

**Scheduled campaigns:** A Redis TTL key expires 1 minute before start time → triggers warmup automatically.

---

## 11. Redis Data During Allocation

Redis holds all live state needed for sub-millisecond reads during a campaign:

| Key Pattern | Stores |
|------------|--------|
| `events:{project_id}:allocation_campaign` | Current campaign ID, type, status |
| `events:{project_id}:tower:{tower_id}:units` | Floor-by-floor unit grid |
| `events:{project_id}:units:{unit_id}` | Individual unit data and status |
| `events:{project_id}:registration:{reg_no}` | Buyer registration status |
| `events:{project_id}:registration_unit_hold_mapping` | Active payment holds |
| `events:{project_id}:current_round` | DYNAMIC round status |
| `events:{project_id}:registration:{reg_no}:lost_units` | DYNAMIC lost unit history per buyer |

**AOF persistence:** Critical allocation decisions (WINNER assignments, lost units) are written to an Append-Only File. If Redis restarts, state can be recovered from AOF.

---

## 12. Role-Based Broadcast Behaviour

| Role | What They Receive |
|------|-----------------|
| Admin (role 1) | All tower data (active + inactive), all unit status changes, admin-only messages |
| Buyer/CP/SM | Active towers only; unit updates only when campaign is RUNNING |

---

## 13. Key Business Rules

1. Admin always receives all broadcasts regardless of campaign state.
2. Buyers only receive live unit updates when campaign is RUNNING.
3. DYNAMIC allocation uses strict round-robin by tower sequence and band order.
4. 20-minute hold is managed exclusively in Redis — not in the database.
5. `unit_sold` message masks the registration number for buyer privacy.
6. Campaign warmup must fully complete before campaign is marked RUNNING.
7. Python WebSocket server failure is non-blocking — Node.js operations continue; real-time updates lag until Python recovers.
8. All WebSocket messages from buyers are persisted to the database for full audit trail.

---

## How to Use: Real-Time System

---

### Admin: Before Starting a Campaign

1. Confirm allocation type is set correctly (STATIC/DYNAMIC/PHYSICAL_EVENT).
2. For DYNAMIC: verify band configuration in Strapi matches the unit structure.
3. Confirm Redis is healthy before starting. A Redis failure during campaign halts the event.
4. Start the campaign from the Admin Portal Allocation module.
5. Monitor the tower heatmap — you see all towers, including inactive ones. Buyers see only active towers.

**If the unit grid stops updating during a campaign:**
- Python WebSocket service or Redis may be down.
- Check with technical support before stopping the campaign.
- If you must stop: use graceful stop (DYNAMIC) or stop (STATIC) from the Admin Portal.

---

### Admin: Stopping a Campaign

- **STATIC:** Stop is immediate. All available units become Waitlisted.
- **DYNAMIC (Graceful):** System waits for the current round to finish. Recommended for normal shutdown.
- **DYNAMIC (Force):** Immediate stop. Use only in emergencies — buyers mid-payment may lose their unit.

---

### Buyer: During a Live Allocation

- The WebSocket connection establishes automatically when you load the allocation page.
- Unit grid updates in real time — no page refresh needed.
- If a unit turns orange: another buyer is paying for it. It may come back if their payment fails.
- When you click a unit, you have 20 minutes to complete payment. Watch the timer.
- **Connection dropped?** The portal retries automatically. If it fails after 5 attempts, refresh the page.

---

## 14. Related Documents

- [[BRD-WebSocket]] — Non-technical WebSocket overview
- [[BRD-Integrations]] — Python service and Redis in the integration map
- [[BRD-Allocation-Workflow]] — Full allocation campaign workflow
- [[BRD-Status-Flows]] — Unit and registration status transitions
