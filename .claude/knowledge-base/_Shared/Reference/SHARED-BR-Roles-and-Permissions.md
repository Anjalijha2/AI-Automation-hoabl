# Roles and Permissions

**Type:** Access Control Documentation
**Last Updated:** 2026-05-10
**Tags:** #roles #permissions #access-control #status/complete

---

## Related Notes
- [[Admin-Portal-BRD]]
- [[SM-Portal-BRD]]
- [[CP-Portal-BRD]]
- [[Buyer-Portal-BRD]]
- [[Backend-Functional-BRD]]

---

## 1. Role Definitions

| Role ID | Role Name | Portal | Description |
|---------|-----------|--------|-------------|
| 1 | admin | Admin Portal | Full system access |
| 2 | user | Buyer Portal | Registered home buyer |
| 3 | cp | CP Portal | Channel Partner / Growth Partner |
| 4 | sales_manager_admin | SM Portal | Elevated sales manager with admin-like permissions |
| 5 | sales_manager | SM Portal | Standard sales manager |

---

## 2. Portal Access Matrix

| Portal | URL | Allowed Roles |
|--------|-----|--------------|
| Admin Portal | `/admin/*` | 1 (admin), 4 (sm_admin) |
| SM Portal | `/sales-manager/*` | 4 (sm_admin), 5 (sales_manager) |
| CP Portal | `/` (root) | 3 (cp) |
| Buyer Portal | Buyer app | 2 (user) |

---

## 3. Feature-Level Permission Rules

### Admin Portal Features

| Feature | Admin (1) | SM Admin (4) |
|---------|-----------|-------------|
| View customers | Yes | Yes |
| Manage towers/units | Yes | No |
| Create allocation campaigns | Yes | No |
| Manage channel partners | Yes | No |
| Manage sales managers | Yes | No |
| View milestone payments | Yes | Yes |
| View payment transactions | Yes | Yes |
| Manage offers | Yes | No |
| Manage JBP cycles | Yes | No |
| Access CMS | Yes | No |
| Audit log access | Yes | No |

### SM Portal Features

| Feature | SM Admin (4) | SM (5) |
|---------|-------------|-------|
| View all callback requests | Yes | No (own only) |
| Assign callback requests | Yes | No |
| View own callback requests | Yes | Yes |
| Conduct physical allocation | Yes | Yes |
| View tower heatmap | Yes | Yes |
| Record VC outcomes | Yes | Yes |
| Create callback requests | Yes | Yes |

### CP Portal Features

| Feature | CP (3) |
|---------|-------|
| Register new customers | Yes |
| View own customers only | Yes |
| View other CPs' customers | No |
| Submit JBP | Yes |
| Edit JBP (via request) | Yes |
| Access project information | Yes |
| Assist with KYC | Yes |
| View inventory/heatmap | No |

### Buyer Portal Features

| Feature | User (2) |
|---------|---------|
| View own registrations | Yes |
| Participate in allocation | Yes (if eligible) |
| View unit heatmap | Yes (during campaign) |
| Complete KYC | Yes |
| Apply for home loan | Yes |
| View payment schedule | Yes |
| Raise support tickets | Yes |
| Request callback | Yes |
| View project information | Yes |

---

## 4. Role Hierarchy in User Model

```
Admin (1)
├── Can manage all users
├── Can see all customers
└── Full portal access

Sales Manager Admin (4)
├── Can see all callback requests
└── Can manage sales team operations

Sales Manager (5)
└── Handles own assigned requests only

CP (3)
├── Linked to Master CP (isLeadCp=false) or IS Master CP (isLeadCp=true)
└── Can only see customers they registered (brokerId match)

User (2) — Buyer
└── Can only see their own registration data
```

---

## 5. CP Hierarchy

```
Master CP (Lead CP)
└── isLeadCp = true
└── Can have Member CPs under them (leadCpId = Master CP's user ID)

Member CP
└── isLeadCp = false
└── leadCpId references their Master CP
└── masterHvCode stores Master CP's HV code
└── smUserId references assigned Sales Manager
```

---

## 6. Authentication Mechanism

- **Buyer/CP:** Mobile OTP-based (no password)
- **Admin/SM:** Email + password (or mobile OTP, based on implementation)
- **JWT Tokens:** All portals use JWT for session management
- **Token Payload:** Contains user_id and role_id at minimum
- **Token Expiry:** Configured per environment
- **Password Hashing:** bcrypt with salt rounds = 10

---

## 7. WebSocket Role Behavior

During allocation campaigns, role determines broadcast behavior:

| Role | Tower Broadcast |  Unit Status Updates | Admin-Only Messages |
|------|----------------|---------------------|-------------------|
| Admin (1) | All towers (active + inactive) | All status changes | Yes |
| Buyer/CP/SM (2,3,4,5) | Active towers only (STATIC campaign) | Only when campaign RUNNING | No |

---

## 8. RBAC (Role-Based Access Control) Implementation

The system uses two tables for fine-grained permissions:
- `permissions`: Defines individual permissions (action on module)
- `role_permissions`: Maps which permissions belong to which role
- `modules`: Defines system modules
- `actions`: Defines possible actions

This provides a database-driven RBAC system where permissions can be adjusted without code changes.

---

## 9. Access Restriction Handling

- Unauthorized route access → `AccessRestricted` component shown (admin portal)
- Buyer with no registration → prompted to register
- CP with incomplete registration → redirected to complete profile
- Expired JWT → redirect to login page
- Rate limiting → 429 Too Many Requests error
