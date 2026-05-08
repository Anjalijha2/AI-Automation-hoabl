---
type: clarifications
tags: [questions, clarifications, all-modules]
updated: 2026-05-08
---

# Open Questions — All Modules

Single location for ALL unresolved questions. Check here before writing test cases.

**Format:** ID | Question | Impact | Status

---

## Offers

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-OFFERS-001 | Is search/filter planned for offers list page? | TC scope | ⏳ Open |
| Q-OFFERS-002 | Is Offer Name required to be unique system-wide? (Multiple "VC request" rows exist — suggests NOT unique) | Validation TC | ⏳ Open |
| Q-OFFERS-003 | Does toggling an offer OFF mid-allocation re-price customer's active selection immediately? | Critical integration TC | ⏳ Open |
| Q-OFFERS-004 | When offer End Date passes while customer is mid-booking with that offer applied — does system re-price or honor locked offer? | Edge case TC | ⏳ Open |
| ~~Q-OFFERS-005~~ | ~~Delete confirmation dialog text?~~ | ~~Delete TC~~ | ✅ Resolved — "Are you sure you want to delete this offer?" / "Yes, delete" |
| Q-OFFERS-006 | What full typology dropdown values are available? | Test data | ✅ Resolved — 1 Bed Growth Home / 2 Bed Growth Home / 2 Bed Peak Home / 2 Bed Rise Home (confirmed in TC-OFFERS-011) |

---

## Sales Managers

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-SM-001 | Is Email unique per Sales Manager? UAT data shows duplicate emails (load test seed). Does system reject duplicates at API level? | Validation TC | ⏳ Open |
| Q-SM-002 | Does Settings modal auto-save on toggle, or does it require an explicit Save/Update button click? | Settings TC | ⏳ Open |
| Q-SM-003 | What are all available Role dropdown values in Add SM modal? Only "Sales Manager" observed. | Test data | ⏳ Open |
| Q-SM-004 | What is the relationship between Sales Managers and Channel Partners? Can a CP also be an SM? | Integration test scope | ⏳ Open |
| Q-SM-005 | Are Settings changes (masking toggles) recorded in an audit log? | Security TC | ⏳ Open |
| Q-SM-006 | What is the merge key for SM bulk upload — if a row matches an existing SM by phone/email, does it update or create a duplicate? | Bulk upload TC | ⏳ Open |

---

## Payment Transactions

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-TXN-001 | Export format — CSV or XLSX? Does it export currently filtered records or all 10,000+? | Export TC | ⏳ Open |
| Q-TXN-002 | What Payment Type values exist beyond "Allocation"? (Milestone / Registration / KYC / etc.) | Filter TC scope | ⏳ Open |
| Q-TXN-003 | How are offline payments (Cheque/RTGS) entered into the system? Admin form on this page or in Customers? | Offline TC | ⏳ Open |
| Q-TXN-004 | If a gateway is disabled while a customer has an open payment session, are pending payment orders invalidated? | **CRITICAL** integration TC | ⏳ Open |
| Q-TXN-005 | Is there a guard preventing both Easebuzz and Razorpay from being disabled simultaneously? | **CRITICAL** config TC | ⏳ Open |
| Q-TXN-006 | What page size options exist in the page size dropdown beyond 10? | Pagination TC | ⏳ Open |
| Q-TXN-007 | When will the Transaction Detail view ("coming soon") be implemented? | Detail view TCs blocked | ⏳ Open |

---

## CMS Config (new sections)

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-CMS-001 | SM bulk upload — does it create new SMs, update existing, or both? What is the merge key (phone/email)? | SM bulk TC | ⏳ Open |
| Q-CMS-002 | Is "Max Preferences Per Unit" system-wide or per-campaign? And does "per unit" mean per-registration, per-unit-type, or total per customer? | Preference cap TC | ⏳ Open |
| Q-CMS-003 | Does Bulk Booking Cancellation auto-trigger a refund, or is refund a manual step? | **HIGH** domain rule | ⏳ Open |
| Q-CMS-004 | Does Bulk Registration Cancellation auto-trigger a refund for already-paid registrations? | **HIGH** domain rule | ⏳ Open |
| Q-CMS-005 | What are the valid Status values in Unit Status CSV? "AVAILABLE" confirmed — what is the other valid value? "RESERVED" assumed but not confirmed. | Unit Status TC | ⏳ Open |
| Q-CMS-006 | Is Allocation Status in Registration Status CSV case-sensitive? ("Allow" vs "allow" vs "ALLOW") | Validation TC | ⏳ Open |
| Q-CMS-007 | What are the column headers in Bulk Booking Cancellation sample CSV? | Cancellation TC | ⏳ Open |
| Q-CMS-008 | What are the column headers in Bulk Registration Cancellation sample CSV? | Cancellation TC | ⏳ Open |
| Q-CMS-009 | If Max Preferences Per Unit is reduced below a customer's already-selected count, are existing preferences invalidated or preserved? | Edge case TC | ⏳ Open |
| Q-CMS-010 | What is the error format for invalid rows in bulk uploads — per-row report, summary count, or generic toast? | Error handling TC | ⏳ Open |

---

## Channel Partners

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-CP-001 | What is the relationship between SM columns (SM Name/Email/Mobile) in CP table and the Sales Managers module? Are these auto-populated from SM assignments? | Integration test scope | ⏳ Open |
| Q-CP-002 | TC-CP-007 (Mark as Master) was removed — is this feature deferred or permanently out of scope? | Test scope | ⏳ Open |

---

## JBP Management

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-JBP-001 | What appears in the Submissions and Edit Requests tabs? These were not tested. | TC scope | ⏳ Open |
| Q-JBP-002 | Can a CP edit a submitted JBP entry after submission? Via "Edit Requests" tab? | Edit flow TC | ⏳ Open |

---

## Allocation

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| Q-ALLOC-001 | Easebuzz bot detection blocks automated payment — is there a test-mode or mock payment endpoint for UAT? | Payment flow TCs permanently ENV SKIP without this | ⏳ Open |
| Q-ALLOC-002 | TC-CST-009 skipped — no Sold units on UAT. Can the team seed a Sold unit for testing? | Sold unit TC | ⏳ Open |

---

## Config CMS (existing — BUG_010)

| ID | Issue | Status |
|----|-------|--------|
| BUG_010 | Registration Status → Submit without selecting file → no validation shown. Expected: error toast. Actual: silent. | 🔴 Open — dev fix needed |

---

## Priority for Resolution

**CRITICAL (block test case writing):**
1. Q-TXN-004 — gateway disable mid-session
2. Q-TXN-005 — no guard against disabling both gateways
3. Q-CMS-003 — bulk booking cancel refund trigger
4. Q-CMS-004 — bulk registration cancel refund trigger

**HIGH (needed before TC execution):**
5. Q-OFFERS-003 — toggle OFF re-prices mid-booking
6. Q-CMS-005 — Unit Status valid values
7. Q-ALLOC-001 — test-mode payment endpoint
