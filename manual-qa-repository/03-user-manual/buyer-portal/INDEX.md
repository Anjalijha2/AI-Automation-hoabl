# Buyer Portal — User Manual Index

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/`
**Audience:** Buyer / Customer
**Auth:** Mobile OTP — UAT: Mobile `8888888888` / OTP `147258`
**Last Updated:** 2026-05-22

---

## Overview

The Buyer Portal is the customer-facing application for the end-to-end home-buying journey on the XR Portal platform. It is mobile-first (Next.js) and uses mobile OTP for authentication — there is no password. Buyers cannot self-register; a Channel Partner or Admin must create the registration first.

This index links to user guides for all 11 modules of the Buyer Portal, in the order a typical buyer will encounter them.

---

## Modules

| # | Module | URL | Guide |
|---|--------|-----|-------|
| 1 | Registration and Login | `/` (login) | [registration-login.md](./registration-login.md) |
| 2 | Home Dashboard | `/home` | [home-dashboard.md](./home-dashboard.md) |
| 3 | Project Information | `/project` | [project-information.md](./project-information.md) |
| 4 | Allocation Experience | `/alloted` | [allocation-experience.md](./allocation-experience.md) |
| 5 | Unit Details | `/allotted-units` | [unit-details.md](./unit-details.md) |
| 6 | Payment Schedule | `/paymentschedule` | [payment-schedule.md](./payment-schedule.md) |
| 7 | KYC | `/kyc` | [kyc.md](./kyc.md) |
| 8 | Home Loan | `/homeloan` | [home-loan.md](./home-loan.md) |
| 9 | Callback Request | `/call-feedback` | [callback-request.md](./callback-request.md) |
| 10 | Support Tickets | `/support-tickets` | [support-tickets.md](./support-tickets.md) |
| 11 | Work Progress | `/work-progress` | [work-progress.md](./work-progress.md) |

---

## Typical Journey

```
Registration & Login  →  Home Dashboard  →  Project Information (browse anytime)
                                ↓
                       Allocation Experience  →  (Pay via Easebuzz)
                                ↓
                       KYC (5 steps)  →  Unit Details unlocked
                                ↓
                       Payment Schedule (milestone payments)
                                ↓
                       Home Loan (optional — unlocks HOME_LOAN discount)
                                ↓
                       Work Progress (track construction throughout)
                                ↓
                       Callback Request / Support Tickets (anytime help)
```

---

## Key Business Rules (Portal-Wide)

1. **Buyers cannot self-register** — a CP or Admin must register them first.
2. **Mobile OTP only** — no password. UAT OTP is `147258`.
3. **T&C on first login** is mandatory.
4. **T&C before payment** during STATIC allocation — Pay button disabled until ticked.
5. **20-minute hold** on a selected unit; payment must complete in this window.
6. **Webhook is the source of truth** for payment status — not the browser.
7. **WINNER status only** means the booking is confirmed.
8. **KYC is gated by WINNER** — only accessible after unit payment confirmed.
9. **All 4 KYC documents per applicant** are mandatory.
10. **Max 4 applicants** per registration (1 primary + 3 co-applicants, blood relatives only).
11. **Cost sheet is frozen at allocation** — later offer changes do not affect booked buyers.
12. **HOME_LOAN discount** may apply after completing the Home Loan flow.

---

## Source References

- Portal BRD: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md`
- Module FRDs: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-*.md`
- Test Cases: `manual-qa-repository/01-test-cases/buyer-portal/<module>/TC_*.md`
