# Feature-Spec: Tower and Unit Heatmap

**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager/towers`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View Tower and Unit Inventory Heatmap

### 1.1 Objective

Allow Sales Managers to view a read-only visual heatmap of all towers and their unit availability, so they can guide customers about current inventory during sales conversations.

### 1.2 Scope

Read-only view. SMs can browse the heatmap but cannot change any unit status from this screen. The data reflects live inventory state.

### 1.3 Preconditions

- SM must be logged in
- At least one tower must be configured and active in the system

### 1.4 UI Elements

| Element | Description |
|---------|-------------|
| Tower list / sidebar | Shows all available towers and their names |
| Unit grid | Floor-by-floor grid showing all units with colour-coded availability |
| Unit status legend | Colour key for interpreting unit states |

### 1.5 Unit Colour Coding

| Colour | Unit Status | Meaning |
|--------|-------------|---------|
| White / Green | Available | Unit can be selected by a buyer |
| Orange | Hold / Proceeding to Pay | Another buyer is currently in payment flow |
| Red | Booked | Unit is confirmed sold |
| Blue | Reserved | Admin has placed a hold on this unit |

### 1.6 Business Rules

1. SMs can only view inventory — they cannot modify unit status from this screen
2. Inactive towers may be hidden from the SM view (admin controls which towers are active)
3. During an active allocation campaign, the heatmap updates in real-time via WebSocket
4. Outside of an active campaign, the view reflects the last known state from the database

### 1.7 Audit and Logging

- No write actions occur from this screen — no audit trail required

---

## How to Use: Viewing the Tower Inventory Heatmap

**Who does this:** Sales Manager, to check unit availability before or during a customer conversation

---

**Step 1 — Navigate to Towers**

From the bottom navigation bar (or side menu), tap or click **Towers**. You will see the tower and unit heatmap.

**Step 2 — Select a tower**

If multiple towers are listed, click the tower you want to view. The unit grid will load showing all floors and units.

**Step 3 — Read the colour codes**

Each unit box shows its status by colour:
<!-- FSD-CORRECTION 2026-05-25: colour map rewritten from source. Orange is commented out. Blue does not exist. // Source: common.service.js heatmap functions -->
- **Green (`#00FF00`)** — AVAILABLE, HOLD, PREBOOKED, RESERVED
- **Red (`#FF0000`)** — BOOKED, PBT
- **Grey (`#808080`)** — REFUGE, or NOT_AVAILABLE (synthetic padding)
- ~~**Orange**~~ — **NOT ACTIVE** (max-preferences highlight code is commented out in source)
- ~~**Blue**~~ — **Does not exist** in source colour mapping

**Step 4 — Use this information with customers**

You can use this live view to tell customers which units are still available, what floors have openings, and which areas are in high demand.

> **Note:** This view is read-only. To allocate a unit to a walk-in customer, use the Physical Allocation section instead.
