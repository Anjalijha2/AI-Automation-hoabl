# Payment Flow — BRD

> **Authoritative documents:**
> - [[Master-BRD/Workflows/BRD-Payment-Workflow]] — Full Master BRD (client-readable, with How to Use per actor)
> - [[Workflows/Payment-Workflow]] — Technical workflow reference

---

## Summary

XR Portal supports online payments (Easebuzz / Razorpay) and offline payments (NEFT / Cheque / Cash). Payment status is only confirmed via validated gateway webhook — browser return URL is never trusted.

---

## Payment Types

| Type | Gateway | Who Initiates |
|------|---------|--------------|
| Registration payment | Easebuzz / Razorpay | Buyer |
| Allocation (booking) payment | Easebuzz / Razorpay | Buyer / SM (Physical Event) |
| Milestone payment | Easebuzz / Razorpay | Buyer |
| Offline payment | N/A | SM records → Admin approves |

---

## Payment Status Flow

```
initiated → pending → completed
                  └──► failed / cancelled / dropped / bounced
completed ──► refunded
```

---

## Key Rules

| Rule | Detail |
|------|--------|
| Webhook is source of truth | Browser redirect never updates payment status |
| HMAC validation | Easebuzz webhook validated via SHA-512 hash |
| At-least-one gateway | Cannot disable both Easebuzz and Razorpay simultaneously |
| Reconciliation cron | Runs every 5–15 min to catch missed webhooks |
| 20-min hold | Unit held during allocation payment — released on failure/timeout |

---

## Related Documents

- [[Master-BRD/Workflows/BRD-Payment-Workflow]] — Full payment workflow BRD
- [[Master-BRD/Integrations/BRD-Integrations]] — Easebuzz and Razorpay integration detail
- [[Master-BRD/Admin-Portal/BRD-Payment-Transactions]] — Admin payment transactions module
