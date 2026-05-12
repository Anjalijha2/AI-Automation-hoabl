# Open Questions — Master BRD

> **Full resolved Q&A:** [[Open-Questions/Open-Questions]]

---

## Status

**All 30 open questions resolved as of 2026-05-10.** No outstanding ambiguities remain.

---

## Summary by Module

| Module | Questions | Status |
|--------|-----------|--------|
| Offers | 6 (Q-OFFERS-001 to 006) | All resolved |
| Sales Managers | 6 (Q-SM-001 to 006) | All resolved |
| Payment Transactions | 7 (Q-TXN-001 to 007) | All resolved |
| CMS Config | 10 (Q-CMS-001 to 010) | All resolved |
| Channel Partners | 2 (Q-CP-001 to 002) | All resolved |
| JBP Management | 2 (Q-JBP-001 to 002) | Partially resolved (JBP-001 needs active submission to test) |
| Allocation | 2 (Q-ALLOC-001 to 002) | All resolved |

---

## Key Resolved Decisions (High Impact)

| Question | Decision |
|---------|---------|
| Q-TXN-004 | Disabling a gateway does NOT invalidate open payment sessions |
| Q-TXN-005 | At-least-one-gateway guard IS enforced (bulk update path only) |
| Q-CMS-003 | Bulk Booking Cancellation does NOT auto-trigger a financial refund |
| Q-CMS-004 | Bulk Registration Cancellation does NOT trigger a financial refund |
| Q-OFFERS-003 | Offer toggle takes effect immediately — no session-level price lock |
| Q-OFFERS-004 | No price lock on mid-booking offer expiry — live check every time |
| Q-ALLOC-001 | Easebuzz has a test environment — default is `test` in config |
| Q-ALLOC-002 | No admin shortcut to set unit = BOOKED; requires full allocation flow |
| Q-TXN-007 | Transaction Detail view is deferred (TODO-commented in code) |
| Q-SM-005 | SM masking toggle changes are NOT audit-logged |

---

## Open Bug (from Q&A)

| Bug ID | Description | Status |
|--------|-------------|--------|
| BUG_010 | Registration Status CSV — submit without selecting file → silent failure (no validation toast) | Open — dev fix needed |

---

## Related Documents

- [[Open-Questions/Open-Questions]] — Full Q&A with code-level evidence
- [[Master-BRD/Business-Rules/BRD-Business-Rules]] — Rules confirmed by these Q&As
