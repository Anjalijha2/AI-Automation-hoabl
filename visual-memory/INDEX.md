# Visual Memory — XR Portal QA Framework

All screenshots captured at **1920×900** (desktop full-screen) unless noted.
Used as: baseline references for selectors, layout, and regression comparison.

**Legend:**

- `FULL` — complete capture with DOM inspection and Key Structural Notes
- `STUB` — screenshots exist, structural notes pending (run visual-capture to upgrade)
- `MISSING` — no screenshots or INDEX.md (BA Agent will block TC generation)
- `DEPRECATED` — module removed from frontend; screenshots retained for history, BA Agent must not generate TCs

---

## Admin Portal (https://uat-web.xrportal.in/admin)

| Module               | Index                                                                      | Status |
| -------------------- | -------------------------------------------------------------------------- | ------ |
| Login                | [admin/login/INDEX.md](admin/login/INDEX.md)                               | FULL   |
| Admin CMS            | [admin/admin-cms/INDEX.md](admin/admin-cms/INDEX.md)                       | STUB   |
| Allocation           | [admin/allocation/INDEX.md](admin/allocation/INDEX.md)                     | STUB   |
| Channel Partners     | [admin/channel-partners/INDEX.md](admin/channel-partners/INDEX.md)         | STUB   |
| Config               | [admin/config/INDEX.md](admin/config/INDEX.md)                             | STUB   |
| Customers            | [admin/customers/INDEX.md](admin/customers/INDEX.md)                       | STUB   |
| JBP Management       | [admin/jbp/INDEX.md](admin/jbp/INDEX.md)                                   | STUB   |
| Offers               | [admin/offers/INDEX.md](admin/offers/INDEX.md)                             | STUB   |
| Payment Transactions | [admin/payment-transactions/INDEX.md](admin/payment-transactions/INDEX.md) | STUB   |
| Sales Managers       | [admin/sales-managers/INDEX.md](admin/sales-managers/INDEX.md)             | STUB   |
| Towers               | [admin/towers/INDEX.md](admin/towers/INDEX.md)                             | STUB   |

## Buyer Portal (https://uat.xrportal.in/)

**2026-06-06:** Buyer-portal status sync — all 10 active modules verified FULL (DOM inspection + structural notes already present from 2026-06-03/04 captures + 2026-06-06 re-verification via `scripts/capture-buyer-portal-all.js`). Support Tickets marked DEPRECATED (removed from frontend, screenshots retained). Buyer-portal OTP is `147258`. Authenticated landing is `/home`; sidebar exposes 6 nav items: Home, Registration, Allotment, Homeloan, Project, Work Progress (+ Logout). Data-gated modules (allocation-experience, kyc, payment-schedule) captured against test account 8888888888 / ishaaaaan karnik which has 11 registrations across Waitlisted / Refunded / Booked-KYC-Completed / Booked-KYC-Pending / Available states — every visible gate state is documented in the per-module INDEX.md.

| Module                | Index                                                                        | Status     |
| --------------------- | ---------------------------------------------------------------------------- | ---------- |
| Registration & Login  | [buyer/registration-login/INDEX.md](buyer/registration-login/INDEX.md)       | FULL       |
| Home Dashboard        | [buyer/home-dashboard/INDEX.md](buyer/home-dashboard/INDEX.md)               | FULL       |
| Allocation Experience | [buyer/allocation-experience/INDEX.md](buyer/allocation-experience/INDEX.md) | FULL       |
| Callback Request      | [buyer/callback-request/INDEX.md](buyer/callback-request/INDEX.md)           | FULL       |
| Home Loan             | [buyer/home-loan/INDEX.md](buyer/home-loan/INDEX.md)                         | FULL       |
| KYC                   | [buyer/kyc/INDEX.md](buyer/kyc/INDEX.md)                                     | FULL       |
| Payment Schedule      | [buyer/payment-schedule/INDEX.md](buyer/payment-schedule/INDEX.md)           | FULL       |
| Project Information   | [buyer/project-information/INDEX.md](buyer/project-information/INDEX.md)     | FULL       |
| Support Tickets       | [buyer/support-tickets/INDEX.md](buyer/support-tickets/INDEX.md)             | DEPRECATED |
| Unit Details          | [buyer/unit-details/INDEX.md](buyer/unit-details/INDEX.md)                   | FULL       |
| Work Progress         | [buyer/work-progress/INDEX.md](buyer/work-progress/INDEX.md)                 | FULL       |

## Channel Partner Portal (https://uat-web.xrportal.in/)

**2026-06-05:** CP-portal OTP is `147258` (NOT `258369` — that's Admin/SM). Fresh storageState generated; 4 modules upgraded to FULL.

| Module                | Index                                                                  | Status |
| --------------------- | ---------------------------------------------------------------------- | ------ |
| Login                 | [cp/login/INDEX.md](cp/login/INDEX.md)                                 | FULL   |
| Customer Registration | [cp/customer-registration/INDEX.md](cp/customer-registration/INDEX.md) | FULL   |
| JBP Submission        | [cp/jbp-submission/INDEX.md](cp/jbp-submission/INDEX.md)               | FULL   |
| KYC Assistance        | [cp/kyc-assistance/INDEX.md](cp/kyc-assistance/INDEX.md)               | STUB   |
| Leads Management      | [cp/leads-management/INDEX.md](cp/leads-management/INDEX.md)           | FULL   |
| Project Information   | [cp/project-information/INDEX.md](cp/project-information/INDEX.md)     | STUB   |

## Sales Manager Portal (https://uat-web.xrportal.in/sales-manager)

**2026-06-05:** SM-portal OTP is `258369` (same as Admin). Full capture done — all 4 modules upgraded to FULL. SM login URL is `/sales-manager` itself (not `/sales-manager/login`). Default authenticated landing is `/sales-manager/callback-requests`. Sidebar exposes 3 nav items: Callback Requests, Towers, Allocation.

**2026-06-05 (modal/drawer expansion):** Callback Requests upgraded with full interactive-overlay coverage — Create Callback drawer (3 states: initial / searched / buyer-selected / validation), Callback Request Details drawer (3 tabs: Callback Request / Feedback / Callback History), more-menu dropdown, Capture VC Outcome modal + outcome dropdown (10 vcOutcome codes captured), Status column filter, and empty state. Architectural finding: the originally-asked "Schedule Meeting", "Confirm Meeting" and "Feedback" flows are all subsumed by a single "Capture VC Outcome" modal driven from the row's more menu — there is no separate Schedule/Confirm modal in current UI.

**2026-06-06 (Physical Allocation active-campaign refresh):** Active Physical Event campaign now seeded in UAT (`id=295`, name="Test New Physical Campaign", status=RUNNING, 2026-06-06 → 2026-06-14). Six new states captured: landing-with-active-campaign, search-form crop, search-with-empty-result (typed query), search-with-no-result (ZZNOTFOUND), checkout direct-nav (redirects per source guard), KYC direct-nav (blank — requires location.state.customerContext). Three states (`customer-selected`, `checkout-unit-selected`, `confirmation`) remain unreachable: search API returns `data: []` for every query against campaign 295 — no buyer registrations have been seeded against the campaign, so the Select-button path is blocked. Confirmation is intentionally not captured (irreversible action).

| Module              | Index                                                              | Status |
| ------------------- | ------------------------------------------------------------------ | ------ |
| Login               | [sm/login/INDEX.md](sm/login/INDEX.md)                             | FULL   |
| Callback Requests   | [sm/callback-requests/INDEX.md](sm/callback-requests/INDEX.md)     | FULL   |
| Physical Allocation | [sm/physical-allocation/INDEX.md](sm/physical-allocation/INDEX.md) | FULL   |
| Tower Heatmap       | [sm/tower-heatmap/INDEX.md](sm/tower-heatmap/INDEX.md)             | FULL   |
