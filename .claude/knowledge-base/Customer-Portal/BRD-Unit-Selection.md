# Unit Selection (Allocation Experience) — BRD

> **Authoritative documents:**
> - [[Master-BRD/Workflows/BRD-Allocation-Workflow]] — Full allocation workflow BRD
> - [[Portals/Buyer-Portal/Feature-Specs/Feature-Spec - Allocation Experience]] — Buyer Portal feature spec
> - [[Master-BRD/Integrations/BRD-Realtime-Events]] — Real-time WebSocket flows (STATIC and DYNAMIC)

---

## Summary

Unit selection is the live allocation event where buyers select or are assigned a residential unit. The experience is powered by a real-time WebSocket connection — unit statuses update instantly across all connected buyers.

---

## Allocation Types

| Type | How Buyer Gets Unit |
|------|-------------------|
| STATIC | Buyer browses live unit grid and clicks a unit |
| DYNAMIC | System auto-assigns a unit (round-robin by band order) |
| PHYSICAL_EVENT | SM selects unit on buyer's behalf at site office |

---

## Unit Colour Codes (Live Heatmap)

| Colour | Status | Meaning |
|--------|--------|---------|
| White | AVAILABLE | Can be selected |
| Orange | HOLD | Another buyer in payment flow (max 20 min) |
| Red | BOOKED | Confirmed sold |
| Blue | RESERVED | Admin reserved — not available |

---

## Key Rules

| Rule | Detail |
|------|--------|
| 20-minute hold | Payment must complete before hold expires |
| Webhook confirms booking | Unit only turns Red after validated payment webhook |
| Registration required | Buyer must have paid registration to participate |
| WINNER status | Only status that confirms unit booking and gates KYC |

---

## Related Documents

- [[Master-BRD/Workflows/BRD-Allocation-Workflow]] — Full allocation workflow
- [[Master-BRD/Integrations/BRD-Realtime-Events]] — Real-time WebSocket detail
- [[Master-BRD/Status-Flows/BRD-Status-Flows]] — Unit and registration status transitions
- [[Portals/Buyer-Portal/Feature-Specs/Feature-Spec - Allocation Experience]] — Buyer-facing feature spec
