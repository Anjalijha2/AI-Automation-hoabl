# WebSocket Real-Time System — BRD

**Type:** Integration Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The WebSocket system delivers real-time unit availability updates to all connected buyers during an allocation campaign. Without it, buyers would need to manually refresh to see which units are available, sold, or held — making a competitive live allocation event impossible.

---

## 2. Architecture (Non-Technical Summary)

Three components work together:

| Component | Role |
|-----------|------|
| Python WebSocket Server | Maintains live connections with all buyers and admins; holds live unit grid in Redis; broadcasts updates |
| Redis | In-memory store of all unit states, campaign status, hold timers — much faster than the database for real-time reads |
| Node.js Backend | After processing any payment or admin action, calls Python to trigger broadcasts to connected users |

Buyers never call Node.js for real-time data — all live updates flow through the WebSocket connection to Python.

---

## 3. What Buyers See in Real-Time

| Event | Visual Change in Buyer Portal |
|-------|------------------------------|
| Another buyer selects a unit | Unit turns **orange** (hold — payment in progress) |
| Another buyer pays successfully | Unit turns **red** (booked) + "unit sold" notification |
| A held unit is released (payment failed or timed out) | Unit turns **white** (available again) |
| Campaign goes live | Tower grid appears; Book Now button activates |
| Campaign ends | "Allocation window is closed" message; all Available → Waitlisted |

---

## 4. Unit Colour Codes (Live Heatmap)

| Colour | Meaning |
|--------|---------|
| White | Available — can be selected |
| Orange | On hold — another buyer is in the payment flow (up to 20 min) |
| Red | Booked — sold and confirmed |
| Blue | Reserved by admin |

---

## 5. STATIC vs DYNAMIC Broadcast Differences

| Event | STATIC | DYNAMIC |
|-------|--------|---------|
| Unit sold | All buyers see it go red instantly | Only admins see grid update; buyer gets reallocation |
| Campaign start | All buyers see towers immediately | All buyers see towers; unit access controlled by round |
| Campaign stop | All users see closed state | Graceful (wait for round) or admin force-stop |

---

## 6. Key Business Rules

1. **JWT in WebSocket URL:** Authentication is handled via the buyer's JWT token embedded in the WebSocket URL. Invalid or expired tokens are rejected with close code 4001.
2. **Reconnection:** If connection drops, the portal automatically retries up to 5 times at 3-second intervals. After 5 failures, a connection error is shown.
3. **20-minute hold via Redis:** Unit hold timers are managed in Redis. A cron releases holds older than 20 minutes. Redis AOF (append-only file) persistence means hold state survives a Redis restart.
4. **Python failure is non-blocking:** If the Python WebSocket service is down, Node.js operations (payments, admin actions) complete successfully. The unit grid update may lag until Python recovers.
5. **All messages are audited:** Every incoming WebSocket message (from any buyer) is stored to the database, providing a full audit trail of all real-time activity.
6. **Role-based targeting:** Admin (role 1) receives all broadcast messages. Buyers receive only updates relevant to their session (their STATIC unit grid, their WINNER confirmation).

---

## How to Use: WebSocket System

---

### Buyer: During a Live Allocation Event

The WebSocket connection is established automatically when you log in during an active campaign. You do not need to take any action.

**What to expect:**
- The unit grid loads automatically when you reach the unit selection screen
- Units change colour in real time as other buyers select and pay for them
- If another buyer books a unit while you are looking at it, it will turn red instantly
- If your payment fails or you take too long, your held unit turns white and becomes available to others again

**If the grid stops updating:** You may have lost the WebSocket connection. Try refreshing the page. The portal will reconnect automatically in most cases.

---

### Admin: Monitoring During a Live Allocation

Admins receive all real-time broadcasts — including updates during DYNAMIC campaigns that buyers do not see.

You can monitor the live state of all units from the Towers module in the Admin Portal. The colours reflect the same real-time state as the buyer's grid.

**If tower grid is not updating:** The Python WebSocket service or Redis may be experiencing issues. Check with technical support if the state appears frozen. Do not stop a campaign without confirming the actual state first.

---

## 7. Related Documents

- [[WebSocket]] — Technical WebSocket system reference (architecture, message types, Redis keys)
- [[BRD-Integrations]] — Integration overview including Python service and Redis
- [[BRD-Allocation-Workflow]] — Allocation workflow that drives WebSocket events
- [[Feature-Spec - Allocation Experience]] — Buyer-facing unit selection and real-time experience
