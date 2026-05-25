# SM Portal — Tower Heatmap User Guide

**Audience:** Sales Manager (role 5) / Sales Manager Admin (role 4)
**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager/towers`
**Sources:** SM-BRD-SM-Portal.md · SM-FRD-SM-Portal.md · SM-FS-Tower-Heatmap.md
**Last Updated:** 2026-05-22

---

## Overview

The Tower Heatmap is a **read-only** visualisation of every tower's unit inventory. SMs use it to guide customer conversations — to show what's available, what's on hold, what's booked, and what's reserved — without ever needing to modify state. It mirrors the admin-side inventory view but excludes any write controls.

During an active allocation campaign, the heatmap refreshes in real time via WebSocket so the SM can see HOLDs and bookings as they happen. Outside of an active campaign, the view reflects the last persisted state from the database.

Note: inactive towers may be hidden from the SM view — Admin controls which towers are exposed to SMs.

---

## Page Layout (At a Glance)

1. **Tower list / sidebar** — every tower available in the current SM context, with its display name.
2. **Unit grid (heatmap)** — floor-by-floor grid for the selected tower; each unit is a coloured cell.
3. **Status legend** — colour key for unit status (Available / Hold / Booked / Reserved).
4. **No write controls** — there are no Edit, Reserve, Cancel, or Update buttons on this screen.

---

# Feature 1 — Open the Tower Heatmap

### What it does
Loads the Tower and Unit inventory heatmap.

### Preconditions
- SM session is active.
- At least one active tower is configured and exposed to SMs.

### How to use
1. From the bottom navigation bar (mobile) or side menu, tap or click **Towers**.
2. The Tower Heatmap screen loads with the tower list / sidebar on one side and the unit grid for the first (or last-selected) tower on the other.

### Result
You see the heatmap and can begin browsing towers and units.

### Note
If no towers are visible, the project may have all towers marked inactive or no tower may be exposed to the SM role. Contact admin to confirm.

---

# Feature 2 — Select a Tower

### What it does
Switches the unit grid to display the units of the chosen tower.

### Preconditions
- Heatmap is loaded.
- Multiple towers exist in the sidebar.

### How to use
1. In the tower list / sidebar, click the tower you want to view.
2. The unit grid reloads with that tower's floors and units.

### Result
The unit grid shows every floor and every unit for the selected tower, colour-coded by status.

---

# Feature 3 — Read the Unit Heatmap Colours

### What it does
Each unit cell is colour-coded so the SM can quickly identify availability at a glance.

### Preconditions
- A tower is selected and its unit grid is visible.

### How to use
1. Look at each unit cell in the grid.
2. Refer to the legend / cross-reference the colour codes:

| Colour | Status | Meaning |
|--------|--------|---------|
| White / Green | `AVAILABLE` | Unit can be selected by a buyer |
| Orange | `HOLD` (Proceeding to Pay) | Another buyer is currently in the payment flow (HOLD lasts up to 20 minutes) |
| Red | `BOOKED` | Unit is confirmed sold |
| Blue | `RESERVED` | Admin has placed a hold on this unit |

### Result
You can talk to the customer confidently about which units are open, which are in flight, and which are sold.

### Note
The colour palette is identical to the admin view — there is no SM-specific colour scheme.

---

# Feature 4 — Use the Heatmap with a Customer

### What it does
Supports the SM's customer-facing conversation by surfacing live availability data.

### Preconditions
- Heatmap is open and a tower is selected.

### How to use
1. Walk the customer through the tower selection — explain which towers are part of the project.
2. Show the floor-wise availability — identify which floors have the most open units, which face premium directions, etc.
3. Point out HOLD (orange) cells — these are units another buyer is currently paying for. Encourage the customer to act quickly on units they are interested in.
4. Avoid pitching Red (Booked) or Blue (Reserved) cells — those are not available.

### Result
The customer has a transparent view of inventory in real time, which supports decision-making during the sales conversation.

### Note
Tower Heatmap is **not** the same as Physical Allocation. To actually allocate a unit to a customer, you must use the Physical Allocation flow (separate module) — the heatmap is informational only.

---

# Feature 5 — Real-Time Updates (WebSocket)

### What it does
During an active allocation campaign, the heatmap updates in real time as other SMs / online buyers place HOLDs, complete bookings, or release units.

### Preconditions
- An allocation campaign is currently active for the project.
- WebSocket connection is healthy.

### How to use
No user action needed.
1. Keep the heatmap open during a campaign.
2. Watch cells change colour as events occur:
   - A unit going from White → Orange = someone has just placed a HOLD.
   - A unit going from Orange → Red = the HOLD payment succeeded; unit is now BOOKED.
   - A unit going from Orange → White = the HOLD payment timed out; unit returned to AVAILABLE.

### Result
The SM always has a live operational picture during an active campaign.

### Note
Outside of an active campaign, the heatmap shows the last-known database state and does not refresh automatically — you may need to reload the page to pick up out-of-campaign changes.

---

## Field Reference — Quick Lookup

### Unit status colour key
| Colour | Status | SM action available |
|--------|--------|----------------------|
| White / Green | `AVAILABLE` | View only |
| Orange | `HOLD` | View only |
| Red | `BOOKED` | View only |
| Blue | `RESERVED` | View only |

### Refresh behaviour
| Campaign state | Refresh mechanism |
|----------------|--------------------|
| Active allocation campaign | Real-time via WebSocket |
| No active campaign | Static (snapshot of last DB state) |

### Audit and logging
- **None.** The Tower Heatmap is fully read-only; no write actions occur from this screen, so no audit trail is generated for SM activity here.

---

## Role Differences

| Capability | Sales Manager (role 5) | Sales Manager Admin (role 4) |
|------------|------------------------|------------------------------|
| View tower list | Yes | Yes |
| View unit heatmap | Yes | Yes |
| Modify unit status | No (read-only) | No (read-only — use Admin Portal for write actions) |
| See inactive towers | No (typically hidden) | No (typically hidden — Admin Portal exposes all) |

Both SM and SM Admin see the same view in the SM Portal. To change unit status, both must use the Admin Portal (which is outside the scope of this user manual).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Tower list is empty | No towers active or none exposed to SM role | Contact admin to enable / expose at least one tower |
| Unit grid does not load after selecting a tower | Backend fetch failed | Refresh the page; if persistent, escalate |
| Heatmap does not update during active campaign | WebSocket connection lost | Refresh the page to re-establish the WebSocket |
| Heatmap stale outside of campaign | Static view by design — no auto-refresh outside campaigns | Refresh the page manually |
| Unit shows the wrong colour vs admin view | Cache lag or pending sync | Refresh page; if persistent, compare with Admin Portal and escalate |
| Cannot edit a unit | Tower Heatmap is read-only by design | Use the Admin Portal to make changes |
| Inactive tower I expected to see is missing | SM view hides inactive towers | Confirm with admin whether the tower should be active and exposed to SMs |
