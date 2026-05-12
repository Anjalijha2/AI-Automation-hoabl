# Milestone Payments — BRD

> **Authoritative documents:**
> - [[Master-BRD/Workflows/BRD-Milestone-Payments]] — Full Master BRD (client-readable, with How to Use per actor)
> - [[Workflows/Milestone-Payments]] — Technical workflow reference

---

## Summary

Milestone payments are construction-linked instalments a buyer pays after booking a unit and completing KYC. Each milestone corresponds to a construction stage. The system tracks how much is due, paid, and outstanding per buyer.

---

## Key Rules

| Rule | Detail |
|------|--------|
| KYC required first | Payment schedule only generated after KYC submission |
| Partial payments allowed | Buyer can pay in multiple tranches |
| Amounts frozen | Calculated at KYC time — not retroactively changed |
| Offline payments | SM records → admin approves → milestone credited |
| Reconciliation cron | Runs every 5 min to catch missed gateway webhooks |
| Mavis sync | Every confirmed payment synced to Mavis ERP |

---

## Milestone Status Flow

```
pending → partial → paid
```

---

## Related Documents

- [[Master-BRD/Workflows/BRD-Milestone-Payments]] — Full milestone BRD
- [[Portals/Buyer-Portal/Feature-Specs/Feature-Spec - Payment Schedule]] — Buyer Portal feature spec
- [[Master-BRD/Workflows/BRD-KYC-Workflow]] — KYC triggers schedule generation
- [[Master-BRD/Workflows/BRD-Payment-Workflow]] — Payment gateway context
