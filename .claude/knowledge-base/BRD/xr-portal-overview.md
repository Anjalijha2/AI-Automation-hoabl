# XR Portal — System Overview

**Document Type:** System Overview BRD
**Project:** XR Portal (HoABL Real Estate Platform)
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

XR Portal is a digital real estate sales platform built for House of Abhinandan Lodha (HoABL). It manages the complete journey of selling residential units in a large housing project — from the moment a buyer first expresses interest, through unit selection, payments, paperwork, and eventually physical possession of their home.

The platform replaces manual, paper-based sales processes with a controlled, auditable digital workflow that can handle thousands of buyers simultaneously, including live online unit selection events.

---

## 2. Who Uses This

The platform has four distinct groups of users, each with their own portal:

| Who | Role | Their Portal | What They Do |
|-----|------|-------------|--------------|
| Internal Operations Team | Admin | Admin Portal (`/admin`) | Manage everything — inventory, campaigns, customers, partners |
| Registered Buyers | Customer/Buyer | Customer Portal (separate app) | Select units, make payments, upload documents |
| Brokers and Agents | Channel Partner (CP) | CP Portal (`/` root) | Register buyers, track their clients, submit business plans |
| Sales Representatives | Sales Manager (SM) | SM Portal (`/sales-manager`) | Call buyers, conduct video meetings, record outcomes |

---

## 3. How the Portals Fit Together

All four portals share one underlying system. An action in one portal immediately affects what other users see.

**Example:** When an admin starts an allocation campaign, buyers immediately see the "Select Your Unit" button. When a buyer completes payment, the admin's dashboard updates the unit as sold.

```
One Shared Backend Database
        |
   ┌────┴────────────────┐
   │                     │
Admin Portal      Customer Portal
(Internal Team)   (Buyers)
   │                     │
CP Portal         SM Portal
(Brokers)         (Sales Reps)
```

---

## 4. The Project Being Sold

The platform is configured for a single residential project: **Xanadu** (also referred to as "GHNG" in registration codes).

| Feature | Detail |
|---------|--------|
| Total Towers | 18 towers |
| Unit Types | 1 Bed Growth Home (1BHK) · 2 Bed Growth Home · 2 Bed Rise Home · 2 Bed Peak Home |
| Registration Code Format | GHNG-XXXXXXXXXX-A (main) / GHNG-XXXXXXXXXX-B, -C... (additional) |
| Project Currency | Indian Rupee (INR) |

---

## 5. How the System Works — Plain English Summary

### Step 1 — A Buyer Registers

A buyer (or their broker) visits the customer portal. They fill in their preferences and pay a small registration fee. The system assigns them a unique registration number (e.g., GHNG-1000008563-A).

### Step 2 — Admin Creates an Allocation Campaign

The internal team sets up a "campaign" — a time window during which registered buyers can log in and choose their unit. The admin sets the start and end time, and the system opens to buyers at the scheduled moment.

### Step 3 — Live Unit Selection

When the campaign starts, buyers log in and see a grid of available units color-coded by availability. They click a unit, see the pricing, and press "Pay" to start booking.

### Step 4 — Payment and Confirmation

The system sends the buyer to an online payment gateway (Easebuzz or Razorpay). If the payment succeeds, the unit is locked as booked. If the buyer takes too long (over 20 minutes) or the payment fails, the unit is released back to the pool.

### Step 5 — KYC and Documentation

After booking, the buyer completes Know Your Customer (KYC) — uploading identity documents for themselves and any co-applicants (family members). Up to 4 people can be on a booking.

### Step 6 — Payment Schedule

Once KYC is submitted, the system generates a construction-linked payment schedule. The buyer must pay instalments as the building progresses through construction milestones.

### Step 7 — Possession

After all milestones are cleared and legal documentation is complete, the buyer receives possession of their unit.

---

## 6. Key Business Concepts

| Term | Plain English Meaning |
|------|----------------------|
| Registration | A buyer's formal expression of interest in buying a unit |
| Registration Number | Unique ID assigned to each registration (e.g. GHNG-1000000063-A) |
| Allocation Campaign | A timed event where buyers can select their unit |
| Unit | A specific apartment in a specific tower, floor, and position |
| Typology | The type/size of unit (1BHK, 2BHK options) |
| Booking | A unit that has been selected AND paid for |
| KYC | Know Your Customer — identity verification required after booking |
| Milestone Payment | Instalment payment tied to construction progress |
| Channel Partner (CP) | Licensed broker or agent who brings buyers to the project |
| HV Code | Unique identifier for a channel partner |
| JBP | Joint Business Plan — CP's commitment on sales targets and marketing |
| Sales Manager (SM) | Internal sales representative who calls and meets buyers |
| Allocation Status | Current state of a buyer's registration (Registered / Booked / Cancelled etc.) |
| Process Status | KYC and documentation stage (KYC Pending / KYC Completed) |

---

## 7. Portals and Their URLs

| Portal | URL | Who Accesses It |
|--------|-----|-----------------|
| Admin Portal | `https://uat-web.xrportal.in/admin` | Internal admin team |
| CP Portal | `https://uat-web.xrportal.in` (root) | Channel partners / brokers |
| SM Portal | `https://uat-web.xrportal.in/sales-manager` | Sales managers |
| Customer Portal | `https://uat.xrportal.in` | Registered buyers |

All portals use Mobile OTP authentication — no username/password.

---

## 8. Third-Party Systems Connected

The platform connects to several external services:

| Service | What It Does |
|---------|-------------|
| Easebuzz | Primary online payment gateway |
| Razorpay | Secondary online payment gateway |
| LeadSquared (LSQ) | CRM system — buyer activity is tracked here |
| Mavis | Property management ERP — unit master data comes from here |
| Easiloan | Home loan eligibility and application processing |
| Kaleyra | SMS and WhatsApp notifications to buyers |
| Microsoft Teams | Auto-generates meeting links for SM video calls with buyers |
| Azure Blob Storage | Stores uploaded documents (KYC, payment proofs) |

---

## 9. Technology Summary (Non-Technical)

The system has three main parts:
- **The websites** (what users see in their browser) — four separate applications for four user types
- **The server** (the logic engine) — handles all business rules, stores data
- **The real-time service** — manages live unit selection events (who's selecting which unit right now)

All data is stored in a database that keeps a complete history — nothing is ever permanently deleted.

---

## 10. Open Questions / Gaps

All known open questions across modules have been resolved as of 2026-05-10. See [Open Questions Master](Open-Questions/BRD-Open-Questions-Master.md) for the full resolved list.
