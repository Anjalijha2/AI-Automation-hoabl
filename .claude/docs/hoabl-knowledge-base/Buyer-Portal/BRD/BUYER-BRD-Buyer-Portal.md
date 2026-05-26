# Buyer Portal — BRD

**Portal:** Buyer / Customer Portal
**URL:** `https://uat.xrportal.in/`
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Buyer Portal is the customer-facing application for the complete end-to-end home buying journey — from first login through unit selection, KYC, home loan, and payment scheduling. It is built in Next.js and is mobile-first.

The portal's centrepiece is the allocation event, where buyers compete in real-time to select and book their preferred unit during a live campaign.

---

## 2. Who Uses This

| Role | Role ID | Description |
|------|---------|-------------|
| Buyer / User | 2 | Registered homebuyer |

Buyers cannot self-register. A Channel Partner or Admin must register them first.

---

## 3. Module List

| # | Module | URL |
|---|--------|-----|
| 1 | Registration and Login | `/` (login) |
| 2 | Home Dashboard | `/home` |
| 3 | Allocation Experience | `/alloted` |
| 4 | KYC | `/kyc` |
| 5 | Home Loan | `/homeloan` |
| 6 | Payment Schedule | `/paymentschedule` |
| 7 | Unit Details | `/allotted-units` |
| 8 | Project Information | `/project` |
| 9 | Support Tickets | `/support-tickets` |
| 10 | Callback Request | `/call-feedback` |
| 11 | Work Progress | `/work-progress` |

---

## 4. Key Business Rules

1. **Buyers cannot self-register:** A CP or Admin must create the buyer's registration before they can log in.
2. **Static OTP on UAT:** UAT login OTP is `147258`.
3. **T&C on first login:** Buyers must accept Terms and Conditions on their first login.
4. **T&C before payment:** During STATIC allocation, the Pay button is disabled until the buyer ticks the T&C checkbox (confirmed TC-CST-012).
5. **20-minute hold:** When a buyer initiates payment for a unit, the unit is held for 20 minutes. Failure to pay within this window releases the unit.
6. **Webhook is truth:** Payment status is determined by the gateway webhook, not the buyer's browser — a buyer who closes the browser mid-payment may still be marked as paid.
7. **WINNER is confirmed:** Only WINNER status means the unit is booked. WAITLIST, PREALLOCATED, ALLOCATED are all pre-payment states.
8. **KYC post-WINNER only:** KYC is only accessible after WINNER status is confirmed (unit payment completed).
9. **4-document KYC requirement:** All 4 documents (photo, PAN, Aadhaar front, Aadhaar back) are required per KYC applicant — partial submissions are rejected.
10. **Max 4 KYC applicants:** 1 primary + up to 3 co-applicants. Label shown at limit: "Max. 4 Applicants allowed."
11. **HOME_LOAN offer:** Completing the home loan flow via Easiloan may automatically apply a HOME_LOAN discount to the unit's Agreement Value.
12. **Cost sheet is frozen at allocation:** Offer changes after a confirmed booking do not affect the booked buyer's price.
13. **Referral tracking:** Buyers arriving via `/ref/:hvCode` have the referring CP's code captured for commission attribution.

---

## 5. Allocation Experience — STATIC Flow (Confirmed TC-CST-001 to TC-CST-016)

1. Buyer logs in (`https://uat.xrportal.in`) → enters mobile → receives OTP → verifies → lands on Home Dashboard
2. Home Dashboard: welcome message, registrations table shows Status = Available
3. Buyer clicks **Proceed to Confirm** → Allotment page → clicks **Book Now**
4. Buyer clicks **Select Unit >** → Unit Selection screen opens
5. Left panel: towers (Crest, Crown, Blossom, Pinnacle, Bright) with unit counts
6. Buyer clicks a tower → centre panel shows floor-by-floor grid
7. Buyer clicks a white (Available) unit → turns green (Selected)
8. Right panel shows: Unit No, BHK type, carpet size, agreement value, discounts, total price
9. Buyer clicks **Add** → returns to Allotment page with unit selected
10. T&C checkbox appears (unchecked) — **Pay button is DISABLED**
11. Buyer ticks T&C checkbox → Pay button enables
12. Buyer clicks **Confirmation Amount Pay Rs. 27,000** → Easebuzz gateway opens
13. Gateway: 5 payment methods (Card, UPI, NetBanking, Wallets), ~15 min timer
14. Payment completed → Payment Successful screen → green checkmark + unit + applicant details
15. Home Dashboard: Status = Booked, Process Status = "Complete KYC" (orange warning alert)
16. Campaign ends → Available registrations → Waitlisted; "Allocation window is closed for now." message

---

## 6. KYC Flow (Confirmed TC-CST-017 to TC-CST-023)

1. After payment, buyer clicks "Verify Details" for primary applicant
2. Primary applicant form auto-filled from registration — buyer verifies and submits
3. Buyer adds co-applicants (optional) — up to 3 additional; all 4 documents per co-applicant required
4. All applicant documents uploaded (photo, PAN, Aadhaar front/back) — all 4 mandatory
5. Buyer clicks Confirm → KYC Summary page loads with T&C checkbox
6. Buyer ticks T&C → clicks Confirm → KYC Submitted Successfully screen
7. Screen shows: Registration No | KYC Number | Unit | No. of Applicants; "Download your Unit Details" link

---

## 7. Real-Time Behaviour During Allocation

The Buyer Portal uses WebSocket connections for live allocation events:

| WebSocket Message (Received) | Description |
|------------------------------|-------------|
| `connection_established` | Campaign info confirmed |
| `towers_response` | All towers and unit availability |
| `tower_units_response` | Units for a specific tower |
| `unit_sold` | Another buyer just booked a unit |
| `reallocation_notification` | DYNAMIC: new unit assigned or missed |

| WebSocket Message (Sent) | Purpose |
|--------------------------|---------|
| `pay_now_initiated` | Buyer begins payment for a selected unit |
| `proceed_to_pay` | DYNAMIC: buyer proceeds with assigned unit payment |

---

## 8. Integrations

| Integration | Purpose |
|-------------|---------|
| Easebuzz | Primary payment gateway (allocation, registration) |
| Razorpay | Alternative payment gateway |
| Easiloan | Home loan eligibility and bank offers |
| LeadSquared (LSQ) | Lead/activity tracking, KYC document upload |
| Mavis | Unit and booking record creation |
| Kaleyra | WhatsApp notifications (NOT OTP) |
| Epinet | OTP SMS delivery for login <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js --> |
| Azure Blob Storage | KYC document uploads |
| OS Ticket | Support ticket management |
| WebSocket Server | Real-time allocation event communication |
| Strapi CMS | Project content (gallery, documents, videos) |

---

## 9. Related Documents

- [[Buyer-Portal-BRD]] — Full Buyer Portal business requirements
- [[Feature-Spec - Allocation Experience]] — STATIC, DYNAMIC, and post-campaign states
- [[Feature-Spec - KYC]] — 5-step KYC process with document requirements
- [[Feature-Spec - Home Loan]] — Easiloan integration and HOME_LOAN offer
- [[BRD-Allocation]] — Admin-side campaign creation and management
- [[Realtime-Events-BRD]] — WebSocket event details
- [[Payment-Workflow]] — End-to-end payment flow
