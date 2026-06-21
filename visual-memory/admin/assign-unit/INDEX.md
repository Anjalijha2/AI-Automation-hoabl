# Admin Portal — Assign Unit modal

**Portal:** Admin · **Module:** Customers (Assign Unit / offline unit assignment)
**CAPTURE_STATUS:** FULL
**Captured:** 2026-06-21 (Playwright headless, system Chrome, 1920×1080)
**Entry point:** Customers table → a **Registered** row (no unit allotted) → three-dot (⋯) menu → **Assign Unit**. (Booked rows do NOT show this item — they show Unit Swap / Update Parking instead.)

## Screenshots
| File | State |
|------|-------|
| `assign-unit-modal.png` | Assign Unit modal, empty (Submit disabled) |

## Modal structure (live DOM)
Title: **"Assign Unit"**. Header shows **Registration Number** (read-only).

| Field | Control | Notes |
|---|---|---|
| Select Tower | AntD select (`rc_select_1`) — virtualized | Options: Aspire, Aura, Blossom, Bright, Crest, Crown, Dawn, Fortune, Glory, Grace… |
| Select Unit | AntD select (`rc_select_2`) — virtualized | Populates **after** a Tower is chosen (async); lists AVAILABLE/RESERVED units |
| Payment Method | AntD select (`rc_select_3`) | NEFT / Cheque / Cash / Credit Card / Debit Card / UPI |
| Transaction Date & Time | text + AntD picker | placeholder "Select Transaction Date & Time" |
| Transaction ID | text input | placeholder "Enter Transaction ID" |
| Transaction Amount | `.ant-input-number-input` | placeholder "Enter Amount" (booking amount; must be > 0) |
| Payment Proof (Optional) | file input | "Upload Payment Proof (Optional)" — Image or PDF, max 5MB |
| **Submit** | `button:has-text('Assign Unit')` | **disabled until** Tower+Unit+Method+Date+TxnID+Amount provided |

## Key Structural Notes
- The 3 selects are AntD **virtualized** dropdowns (`rc-virtual-list`) — options are covered for a normal click; drive via combobox + keyboard (ArrowDown/Enter) or by typing to filter.
- **Submit is disabled** on an empty/invalid form (verified — basis for TC_CUST_NEG_120).
- Assign Unit is **absent** from Booked rows' menus (basis for TC_CUST_NEG_122 — no second unit).
- Unlike the Milestone Offline-Payment proof (images only), Assign-Unit proof accepts **Image OR PDF** and is **optional**.

## Locators
`locators/admin/locator-map.json` → `customers`: `assignUnitMenuItem`, `assignUnitModal`,
`assignUnitAmountInput`, `assignUnitTransactionIdInput`, `assignUnitTransactionDateInput`,
`assignUnitProofInput`, `assignUnitSubmitBtn` (added 1.9.2).

## Tests
`tests/e2e/admin/customers.spec.js` → "Goal 12 — Assign Unit":
- **TC_CUST_NEG_120** ✅ — Submit blocked until mandatory fields filled (read-only)
- **TC_CUST_NEG_122** ✅ — Assign Unit not offered on Booked rows (read-only)
- **TC_CUST_FUNC_120** — destructive happy-path (needs ALLOW_DESTRUCTIVE + a tower with available units; dependent-select hardening pending)
- **TC_CUST_NEG_121 / FUNC_129** — fixme (concurrency / multi-sub-registration fixtures)
