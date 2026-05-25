# Test Cases — Payment Schedule
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Payment-Schedule.md

---

## Payment Schedule — Access & Generation

### BYR_PAY_001 — Payment Schedule accessible only post-KYC and WINNER

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Try `/paymentschedule` before KYC<br>2. Complete KYC<br>3. Retry |
| **Expected Result** | Pre-KYC: blocked / empty state. Post-KYC: schedule renders. |
| **Priority** | Critical |

---

### BYR_PAY_002 — Schedule generated based on selected payment plan

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Buyer's plan type (construction-linked / time-linked / down payment) known |
| **Test Steps** | 1. Inspect schedule structure |
| **Expected Result** | Milestone count and triggers reflect the buyer's selected plan type |
| **Priority** | High |

---

### BYR_PAY_003 — Schedule reachable from dashboard Pay > link

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | A milestone marked due, Pay > visible on dashboard |
| **Test Steps** | 1. Click Pay > on dashboard |
| **Expected Result** | Navigates to `/paymentschedule` with the due milestone visible/highlighted |
| **Priority** | High |

---

### BYR_PAY_004 — Schedule reachable from Unit Details

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Unit Details loaded |
| **Test Steps** | 1. Click embedded Payment Schedule link or scroll-anchor |
| **Expected Result** | Schedule accessible from Unit Details page |
| **Priority** | Medium |

---

## Payment Schedule — Milestone Display

### BYR_PAY_005 — Milestones listed in chronological order

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Schedule loaded |
| **Test Steps** | 1. Inspect milestone list order |
| **Expected Result** | Milestones rendered top-to-bottom in construction order |
| **Priority** | High |

---

### BYR_PAY_006 — Each milestone shows trigger label

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Schedule loaded |
| **Test Steps** | 1. Inspect each milestone card |
| **Expected Result** | Trigger description visible (e.g., "Foundation completion", "Plinth", "Slab N") |
| **Priority** | High |

---

### BYR_PAY_007 — Principal, GST, parking shown separately

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone with all 3 components |
| **Test Steps** | 1. Expand milestone breakdown |
| **Expected Result** | Principal, GST and Parking amounts shown as separate line items |
| **Priority** | High |

---

### BYR_PAY_008 — Total Amount Due = principal + GST + parking

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone visible |
| **Test Steps** | 1. Sum components<br>2. Compare to displayed total |
| **Expected Result** | Total equals computed sum within rounding tolerance |
| **Priority** | Critical |

---

### BYR_PAY_009 — Status badge "Pending" for unpaid milestones

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Unpaid milestone exists |
| **Test Steps** | 1. Inspect status |
| **Expected Result** | "Pending" badge (e.g., grey/amber) rendered |
| **Priority** | High |

---

### BYR_PAY_010 — Status badge "Partial" when partially paid

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone with paidAmount < total |
| **Test Steps** | 1. Inspect status |
| **Expected Result** | "Partial" badge with paid/outstanding breakdown |
| **Priority** | High |

---

### BYR_PAY_011 — Status badge "Paid" when fully settled

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone fully paid |
| **Test Steps** | 1. Inspect status |
| **Expected Result** | "Paid" badge (green) rendered; no Pay button |
| **Priority** | High |

---

### BYR_PAY_012 — Already Paid amount accurately shown

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone with partial payment |
| **Test Steps** | 1. Inspect Already Paid field |
| **Expected Result** | Matches actual paidAmount in DB |
| **Priority** | High |

---

### BYR_PAY_013 — Outstanding Balance = Total − Already Paid

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone partially paid |
| **Test Steps** | 1. Compute Total − Already Paid<br>2. Compare to Outstanding shown |
| **Expected Result** | Values match |
| **Priority** | Critical |

---

### BYR_PAY_014 — Home Loan disbursement amount shown per milestone

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Buyer has linked home loan |
| **Test Steps** | 1. Inspect "Bank disbursement" line on milestones |
| **Expected Result** | Amount expected from bank disbursement displayed per milestone |
| **Priority** | High |

---

### BYR_PAY_015 — Early bird discount shown if applicable

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Buyer eligible for early bird |
| **Test Steps** | 1. Inspect schedule summary |
| **Expected Result** | Early bird discount line visible and deducted from total |
| **Priority** | Medium |

---

## Payment Schedule — Pay Action & Demand Letters

### BYR_PAY_016 — Pay button visible only when milestone triggered

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Mix of triggered and non-triggered milestones |
| **Test Steps** | 1. Inspect each milestone |
| **Expected Result** | Pay button visible only when demand letter issued; hidden otherwise |
| **Priority** | Critical |

---

### BYR_PAY_017 — Click Pay opens Easebuzz gateway

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Triggered milestone with Pay button |
| **Test Steps** | 1. Click Pay |
| **Expected Result** | Easebuzz gateway opens in same or new window with correct amount and merchant info |
| **Priority** | Critical |

---

### BYR_PAY_018 — Gateway shows correct merchant (Impactum Lands Pvt Ltd)

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Easebuzz opened |
| **Test Steps** | 1. Inspect merchant field |
| **Expected Result** | Merchant = "Impactum Lands Private Limited" |
| **Priority** | High |

---

### BYR_PAY_019 — All payment methods listed

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Easebuzz opened |
| **Test Steps** | 1. Inspect tabs/options |
| **Expected Result** | Credit Card, Debit Card, UPI, NetBanking, Wallets all available |
| **Priority** | High |

---

### BYR_PAY_020 — Successful payment updates milestone to Paid

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Pay clicked, valid card/UPI used |
| **Test Steps** | 1. Complete payment<br>2. Reload schedule |
| **Expected Result** | Milestone shows Paid status; Outstanding = 0; receipt generated |
| **Priority** | Critical |

---

### BYR_PAY_021 — Demand letter accessible per milestone

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone triggered |
| **Test Steps** | 1. Click "View Demand Letter" or similar |
| **Expected Result** | Demand letter PDF opens with milestone details and due amount |
| **Priority** | High |

---

## Payment Schedule — Negative & Edge Cases

### BYR_PAY_022 — Test skipped on live UAT gateway

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | ENV = uat |
| **Test Steps** | 1. Attempt real payment in UAT |
| **Expected Result** | Test marked skip in automation (`test.skip(ENV==='uat')`) |
| **Priority** | Medium |

---

### BYR_PAY_023 — Failed payment leaves milestone Pending

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Pay clicked, gateway returns FAILURE |
| **Test Steps** | 1. Simulate failed payment |
| **Expected Result** | Milestone status stays Pending; error toast shown; retry possible |
| **Priority** | High |

---

### BYR_PAY_024 — Pay button hidden after full payment

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | Milestone fully paid |
| **Test Steps** | 1. Inspect milestone row |
| **Expected Result** | Pay button replaced by "Paid" badge or receipt link |
| **Priority** | High |

---

### BYR_PAY_025 — Buyer without home loan does not see bank disbursement line

| Field | Value |
|-------|-------|
| **Module** | BYR – Payment Schedule |
| **Pre-conditions** | No home loan linked |
| **Test Steps** | 1. Inspect milestone breakdown |
| **Expected Result** | Bank disbursement line not rendered |
| **Priority** | Medium |

---
