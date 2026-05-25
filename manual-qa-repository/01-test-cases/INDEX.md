# Test Cases — Master Index

**Format:** `TC_MODULE_TYPE_NNN` (agent-generated) · `TC-MODULE-NNN` (hand-written)

---

## Portals

### > Admin Portal (476 TCs)
| Module | File | Total TCs | BA Sign-off |
|--------|------|-----------|-------------|
| Login | [admin-portal/login/TC_LOGIN.md](admin-portal/login/TC_LOGIN.md) | 40 | ⏳ |
| Customers | [admin-portal/customers/TC_CUSTOMERS.md](admin-portal/customers/TC_CUSTOMERS.md) | 85 | ⏳ |
| Config / CMS | [admin-portal/config/TC_CONFIG.md](admin-portal/config/TC_CONFIG.md) | 50 | ⏳ |
| Allocation | [admin-portal/allocation/TC_ALLOCATION.md](admin-portal/allocation/TC_ALLOCATION.md) | 35 | ⏳ |
| Towers | [admin-portal/towers/TC_TOWERS.md](admin-portal/towers/TC_TOWERS.md) | 38 | ⏳ |
| Channel Partners | [admin-portal/channel-partners/TC_CHANNEL_PARTNERS.md](admin-portal/channel-partners/TC_CHANNEL_PARTNERS.md) | 42 | ⏳ |
| JBP Management | [admin-portal/jbp/TC_JBP.md](admin-portal/jbp/TC_JBP.md) | 40 | ⏳ |
| Offers | [admin-portal/offers/TC_OFFERS.md](admin-portal/offers/TC_OFFERS.md) | 36 | ⏳ |
| Admin CMS | [admin-portal/admin-cms/TC_ADMIN_CMS.md](admin-portal/admin-cms/TC_ADMIN_CMS.md) | 35 | ⏳ |
| Sales Managers | [admin-portal/sales-managers/TC_SALES_MANAGERS.md](admin-portal/sales-managers/TC_SALES_MANAGERS.md) | 40 | ⏳ |
| Payment Transactions | [admin-portal/payment-transactions/TC_PAYMENT_TRANSACTIONS.md](admin-portal/payment-transactions/TC_PAYMENT_TRANSACTIONS.md) | 35 | ⏳ |

### > Sales Manager Portal (171 TCs)
| Module | File | Total TCs | BA Sign-off |
|--------|------|-----------|-------------|
| Login | [sm-portal/login/TC_LOGIN.md](sm-portal/login/TC_LOGIN.md) | 8 | ⏳ |
| Callback Requests | [sm-portal/callback-requests/TC_CALLBACK_REQUESTS.md](sm-portal/callback-requests/TC_CALLBACK_REQUESTS.md) | 134 | ⏳ |
| Physical Allocation | [sm-portal/physical-allocation/TC_PHYSICAL_ALLOCATION.md](sm-portal/physical-allocation/TC_PHYSICAL_ALLOCATION.md) | 19 | ⏳ |
| Tower Heatmap | [sm-portal/tower-heatmap/TC_TOWER_HEATMAP.md](sm-portal/tower-heatmap/TC_TOWER_HEATMAP.md) | 10 | ⏳ |

### > Buyer Portal (324 TCs)
| Module | File | Total TCs | BA Sign-off |
|--------|------|-----------|-------------|
| Registration / Login | [buyer-portal/registration-login/TC_LOGIN.md](buyer-portal/registration-login/TC_LOGIN.md) | 27 | ⏳ |
| Home Dashboard | [buyer-portal/home-dashboard/TC_HOME_DASHBOARD.md](buyer-portal/home-dashboard/TC_HOME_DASHBOARD.md) | 32 | ⏳ |
| Project Information | [buyer-portal/project-information/TC_PROJECT_INFORMATION.md](buyer-portal/project-information/TC_PROJECT_INFORMATION.md) | 24 | ⏳ |
| Unit Details | [buyer-portal/unit-details/TC_UNIT_DETAILS.md](buyer-portal/unit-details/TC_UNIT_DETAILS.md) | 26 | ⏳ |
| Allocation Experience | [buyer-portal/allocation-experience/TC_ALLOCATION_EXPERIENCE.md](buyer-portal/allocation-experience/TC_ALLOCATION_EXPERIENCE.md) | 43 | ⏳ |
| Payment Schedule | [buyer-portal/payment-schedule/TC_PAYMENT_SCHEDULE.md](buyer-portal/payment-schedule/TC_PAYMENT_SCHEDULE.md) | 25 | ⏳ |
| KYC | [buyer-portal/kyc/TC_KYC.md](buyer-portal/kyc/TC_KYC.md) | 35 | ⏳ |
| Home Loan | [buyer-portal/home-loan/TC_HOME_LOAN.md](buyer-portal/home-loan/TC_HOME_LOAN.md) | 30 | ⏳ |
| Callback Request | [buyer-portal/callback-request/TC_CALLBACK_REQUEST.md](buyer-portal/callback-request/TC_CALLBACK_REQUEST.md) | 32 | ⏳ |
| Support Tickets | [buyer-portal/support-tickets/TC_SUPPORT_TICKETS.md](buyer-portal/support-tickets/TC_SUPPORT_TICKETS.md) | 29 | ⏳ |
| Work Progress | [buyer-portal/work-progress/TC_WORK_PROGRESS.md](buyer-portal/work-progress/TC_WORK_PROGRESS.md) | 21 | ⏳ |

### > Channel Partner Portal (163 TCs)
| Module | File | Total TCs | BA Sign-off |
|--------|------|-----------|-------------|
| Login | [cp-portal/login/TC_LOGIN.md](cp-portal/login/TC_LOGIN.md) | 25 | ⏳ |
| Customer Registration | [cp-portal/customer-registration/TC_CUSTOMER_REGISTRATION.md](cp-portal/customer-registration/TC_CUSTOMER_REGISTRATION.md) | 29 | ⏳ |
| Leads Management | [cp-portal/leads-management/TC_LEADS_MANAGEMENT.md](cp-portal/leads-management/TC_LEADS_MANAGEMENT.md) | 25 | ⏳ |
| KYC Assistance | [cp-portal/kyc-assistance/TC_KYC_ASSISTANCE.md](cp-portal/kyc-assistance/TC_KYC_ASSISTANCE.md) | 30 | ⏳ |
| JBP Submission | [cp-portal/jbp-submission/TC_JBP_SUBMISSION.md](cp-portal/jbp-submission/TC_JBP_SUBMISSION.md) | 27 | ⏳ |
| Project Information | [cp-portal/project-information/TC_PROJECT_INFORMATION.md](cp-portal/project-information/TC_PROJECT_INFORMATION.md) | 27 | ⏳ |

---

## Summary

| Portal | Modules | Total TCs |
|--------|---------|-----------|
| Admin | 11 | 476 |
| Sales Manager | 4 | 171 |
| Buyer | 11 | 324 |
| Channel Partner | 6 | 163 |
| **TOTAL** | **32** | **1,134** |

---

## TC Type Codes

| Code | Type | Code | Type |
|------|------|------|------|
| `UI` | UI / Layout | `NEG` | Negative |
| `FUNC` | Functional | `EDGE` | Edge Case |
| `VAL` | Validation | `XMOD` | Cross-Module |
| `E2E` | End-to-End | `DC` | Data Consistency |
| `API` | API Contract | `WF` | Workflow |
| `DB` | Database | `BIZ` | Business Rule |
| `INT` | Integration | `REG` | Regression |
| `EXP` | Exploratory | | |

---

## Sign-off Legend

- ✅ Approved — automation can proceed
- ⏳ Pending — awaiting BA review
- ❌ Rejected — needs rework
