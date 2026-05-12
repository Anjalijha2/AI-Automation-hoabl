# Customer (Buyer) Portal — Overview

> **Note:** This file is in a legacy folder structure. The current authoritative documents are:
> - [[Portals/Buyer-Portal/Buyer-Portal-BRD]] — Full Buyer Portal BRD
> - [[Master-BRD/Buyer-Portal/BRD-Buyer-Portal]] — Master BRD (client-readable)

---

## Buyer Portal (Summary)

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in`
**Auth method:** Mobile OTP (no password)
**Role:** user (role_id = 2)

### What Buyers Can Do

| Module | Access Condition |
|--------|----------------|
| Registration and Login | Always |
| Home Dashboard | After login |
| Allocation Experience | Active campaign + registered |
| KYC | After WINNER status |
| Home Loan | After KYC |
| Payment Schedule | After KYC |
| Unit Details | After WINNER |
| Support Tickets | After unit booking |
| Callback Request | After login |
| Work Progress | Always |
| Project Information | Always |

### Buyer Journey

1. Register → pay registration fee
2. Participate in allocation campaign → select or be assigned a unit
3. Complete payment → become WINNER
4. Complete KYC (documents for all applicants)
5. Pay construction-linked milestones
6. Receive possession

### Related Documents

- [[Portals/Buyer-Portal/Buyer-Portal-BRD]] — Full BRD
- [[Master-BRD/Buyer-Portal/BRD-Buyer-Portal]] — Master BRD
- [[Master-BRD/Workflows/BRD-Allocation-Workflow]] — Allocation workflow
- [[Master-BRD/Workflows/BRD-KYC-Workflow]] — KYC workflow
- [[Master-BRD/Workflows/BRD-Milestone-Payments]] — Payment schedule
