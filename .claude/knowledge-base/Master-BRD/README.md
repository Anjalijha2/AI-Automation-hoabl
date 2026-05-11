# XR Portal — Master BRD Repository

**Project:** XR Portal (HoABL Real Estate Platform)
**Version:** 1.0
**Created:** 2026-05-11
**Status:** Complete — all modules documented

---

## What This Repository Is

This is the complete Business Requirements Document (BRD) library for the XR Portal real estate platform. Every section is written in plain English for non-technical readers — no programming language or technical jargon.

The XR Portal manages the full lifecycle of a residential property sale: from the first time a buyer registers interest, through unit selection, payments, KYC documentation, and all the way to possession.

---

## Quick Navigation

### Start Here

- [System Overview](XR-Portal-Overview.md) — What the platform does, who uses it, and how it fits together

### Admin Portal (Internal Operations Team)

| Document | What It Covers |
|----------|---------------|
| [Admin Portal Overview](Admin-Portal/BRD-Admin-Overview.md) | Who uses admin, navigation, role access |
| [Login](Admin-Portal/BRD-Login.md) | How admins authenticate |
| [Customers](Admin-Portal/BRD-Customers.md) | Customer registration dashboard, filters, cancellations |
| [Towers](Admin-Portal/BRD-Towers.md) | Tower and unit inventory view |
| [Config / CMS](Admin-Portal/BRD-Config-CMS.md) | System configuration, bulk operations |
| [Channel Partners](Admin-Portal/BRD-Channel-Partners.md) | Broker/agent account management |
| [Sales Managers](Admin-Portal/BRD-Sales-Managers.md) | Sales team management |
| [JBP Management](Admin-Portal/BRD-JBP-Management.md) | Channel partner commitment tracking |
| [Allocation](Admin-Portal/BRD-Allocation.md) | Unit selection campaign management |
| [Offers](Admin-Portal/BRD-Offers.md) | Discount offer configuration |
| [Payment Transactions](Admin-Portal/BRD-Payment-Transactions.md) | Payment ledger and gateway config |

### Customer Portal (Buyers)

| Document | What It Covers |
|----------|---------------|
| [Customer Portal Overview](Customer-Portal/BRD-Customer-Overview.md) | Buyer journey, portal purpose |
| [Customer Login](Customer-Portal/BRD-Customer-Login.md) | How buyers authenticate |
| [Customer Dashboard](Customer-Portal/BRD-Customer-Dashboard.md) | Buyer home page and registration status |
| [Unit Selection](Customer-Portal/BRD-Unit-Selection.md) | How buyers choose their unit |
| [Payment Flow](Customer-Portal/BRD-Payment-Flow.md) | Booking payment, confirmation amount |
| [KYC](Customer-Portal/BRD-KYC.md) | Identity verification and document upload |
| [Milestone Payments](Customer-Portal/BRD-Milestone-Payments.md) | Construction-linked payment schedule |

### CP Portal (Channel Partners / Brokers)

| Document | What It Covers |
|----------|---------------|
| [CP Portal Overview](CP-Portal/BRD-CP-Overview.md) | Channel partner portal purpose and access |
| [CP Login](CP-Portal/BRD-CP-Login.md) | How CPs authenticate |
| [JBP Submission](CP-Portal/BRD-CP-JBP-Submission.md) | Joint Business Plan commitment form |

### End-to-End Business Flows

| Document | What It Covers |
|----------|---------------|
| [Allocation Campaign Lifecycle](Business-Flows/BF-001-Allocation-Campaign-Lifecycle.md) | How an allocation event runs start to finish |
| [Customer Booking Flow](Business-Flows/BF-002-Customer-Booking-Flow.md) | Full buyer journey from registration to booking |
| [Payment Transaction Flow](Business-Flows/BF-003-Payment-Transaction-Flow.md) | How payments are processed and recorded |
| [Offer Discount Flow](Business-Flows/BF-004-Offer-Discount-Flow.md) | How offers are applied to unit pricing |
| [CP JBP Commitment Flow](Business-Flows/BF-005-CP-JBP-Commitment-Flow.md) | How CPs submit their business plan commitments |
| [Sales Manager Assignment Flow](Business-Flows/BF-006-Sales-Manager-Assignment-Flow.md) | How sales managers are assigned and manage customers |

### Open Questions

| Document | What It Covers |
|----------|---------------|
| [Open Questions Master](Open-Questions/BRD-Open-Questions-Master.md) | All unresolved and resolved questions |

---

## How the Portals Relate

```
Admin Portal          Customer Portal         CP Portal
(Internal Team)  ←→   (Buyers)           ←→  (Brokers)
     │                     │                      │
     └─────────────────────┴──────────────────────┘
                           │
                    Shared Backend
                  (All data in one system)
```

- **Admins** set up campaigns, manage inventory, and monitor all activity
- **Buyers** participate in campaigns, select units, make payments, complete KYC
- **Channel Partners** register buyers, track commissions, and submit JBP plans

---

## Key Business Rules (Summary)

1. A buyer can only book a unit during an active allocation campaign
2. A unit is held for 20 minutes after a buyer starts payment — released if not completed
3. Payment is confirmed by the bank gateway, not by browser — partial or failed payments do not book units
4. KYC must be submitted before the milestone payment schedule is generated
5. Channel partners can only see their own registered customers
6. Only one active allocation campaign can run at a time
7. Soft deletes are used throughout — no records are ever permanently erased

---

## Document Standards

Every module BRD in this repository follows this 10-section structure:
1. Purpose
2. Who Uses This
3. How to Access
4. Screen Layout
5. Feature Walkthrough
6. Business Rules
7. Validations
8. Dependencies
9. User Journey Map
10. Open Questions / Gaps
