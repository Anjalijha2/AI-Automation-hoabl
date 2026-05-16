# Test Cases — Master Index

**Format:** `TC_MODULE_TYPE_NNN` (agent-generated) · `TC-MODULE-NNN` (hand-written)

---

## Portals

### > Admin Portal
| Module | File | Total TCs | BA Sign-off |
|--------|------|-----------|-------------|
| Login | [admin-portal/login/TC_LOGIN.md](admin-portal/login/TC_LOGIN.md) | 22 | ✅ |
| Customers | [admin-portal/customers/TC_CUSTOMERS.md](admin-portal/customers/TC_CUSTOMERS.md) | — | ⏳ |
| Config / CMS | [admin-portal/config/TC_CONFIG.md](admin-portal/config/TC_CONFIG.md) | — | ⏳ |
| Allocation | [admin-portal/allocation/TC_ALLOCATION.md](admin-portal/allocation/TC_ALLOCATION.md) | — | ⏳ |
| Towers | [admin-portal/towers/TC_TOWERS.md](admin-portal/towers/TC_TOWERS.md) | — | ⏳ |
| Channel Partners | [admin-portal/channel-partners/TC_CP.md](admin-portal/channel-partners/TC_CP.md) | — | ⏳ |
| JBP Management | [admin-portal/jbp/TC_JBP.md](admin-portal/jbp/TC_JBP.md) | — | ⏳ |
| Offers | [admin-portal/offers/TC_OFFERS.md](admin-portal/offers/TC_OFFERS.md) | — | ⏳ |
| Admin CMS | [admin-portal/admin-cms/TC_ADMIN_CMS.md](admin-portal/admin-cms/TC_ADMIN_CMS.md) | — | ⏳ |

### > Sales Manager Portal
| Module | File | Total TCs | BA Sign-off |
|--------|------|-----------|-------------|
| Callback Requests | [sales-manager-portal/TC_CALLBACK.md](sales-manager-portal/TC_CALLBACK.md) | — | ⏳ |
| Towers | [sales-manager-portal/TC_SM_TOWERS.md](sales-manager-portal/TC_SM_TOWERS.md) | — | ⏳ |
| Leads | [sales-manager-portal/TC_LEADS.md](sales-manager-portal/TC_LEADS.md) | — | ⏳ |

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
