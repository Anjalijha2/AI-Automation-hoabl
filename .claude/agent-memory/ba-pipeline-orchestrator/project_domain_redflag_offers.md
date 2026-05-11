---
name: Domain Red Flags — Offers and Transactions modules
description: Critical domain red flags discovered during Sprint 5 BRD analysis for Offers, Transactions, CMS
type: project
---

RED FLAGS identified during Sprint 5 BRD analysis (2026-05-08):

1. OFFERS — Toggle OFF mid-allocation: No confirmation dialog when toggling an offer OFF. Admin can accidentally deactivate an active offer during a live allocation campaign, changing prices for customers mid-booking. Risk: HIGH.

2. OFFERS — Offer End Date expiry mid-booking: If offer end date passes while customer is in booking flow, behavior is undefined (does system re-price or honor the locked offer?). CLARIFICATION-OFFERS-004 raised.

3. TRANSACTIONS — Gateway disable mid-campaign: The Payment Gateway Configuration dialog allows disabling Easebuzz or Razorpay with no warning about active campaigns. If disabled mid-booking, customer payments will fail. Risk: CRITICAL.

4. TRANSACTIONS — Both gateways disabled: No guard observed preventing admin from disabling BOTH gateways simultaneously, which would make online payment impossible. Risk: CRITICAL. CLARIFICATION-TXN-005 raised.

5. CMS — Unit Cost Update during active campaign: Bulk price update takes effect immediately with no draft/preview. If executed during live allocation, customer unit selection prices change in real-time. Risk: HIGH.

6. CMS — Bulk Booking Cancellation without refund: Cancelling bookings via bulk CSV may not auto-trigger refund. CLARIFICATION-CMS-003 raised. Domain Red Flag: cancellation without refund trigger.

7. CMS — Bulk Registration Cancellation scope: Cancels ALL unit sub-registrations (A through G) under a parent registration. Scope is broad. Extra confirmation should be required. Raised as test case concern.

8. CMS — Customer Actions Card during active campaign: Enabling additional registrations mid-campaign could allow customers to generate new preferences beyond originally planned inventory allocation.

**How to apply:** When Manual QA agent writes test cases for these modules, all 8 red flags must have dedicated test cases. When Automation QA scripts are written, these must be included as negative/edge test cases.
