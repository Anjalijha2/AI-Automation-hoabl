# Roles and Permissions — BRD

**Type:** Access Control Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

This document defines who can access what across the XR Portal platform. Every user belongs to exactly one role. The role determines which portal they can log into, which features they can use, and what data they can see.

---

## 2. Role Definitions

| Role ID | Role Name | Portal | Description |
|---------|-----------|--------|-------------|
| 1 | Admin | Admin Portal | Full system access — all modules, all data, all overrides |
| 2 | Buyer | Buyer Portal | Registered home buyer — own data only |
| 3 | Channel Partner (CP) | CP Portal | Registers buyers, submits JBP, assists with KYC |
| 4 | SM Admin | SM Portal + Admin Portal | Elevated sales manager — manages callback team operations |
| 5 | Sales Manager | SM Portal | Handles assigned callbacks, physical allocation, offline payments |

---

## 3. Portal Access

| Portal | URL | Who Can Access |
|--------|-----|---------------|
| Admin Portal | `/admin/*` | Admin (1), SM Admin (4) |
| SM Portal | `/sales-manager/*` | SM Admin (4), Sales Manager (5) |
| CP Portal | `/` (root) | Channel Partner (3) |
| Buyer Portal | `uat.xrportal.in` | Buyer (2) |

---

## 4. Admin Portal — Feature Access

| Feature | Admin (1) | SM Admin (4) |
|---------|-----------|-------------|
| View all customers | Yes | Yes |
| Manage towers and units | Yes | No |
| Create allocation campaigns | Yes | No |
| Manage channel partners | Yes | No |
| Manage sales managers | Yes | No |
| View milestone payments | Yes | Yes |
| View payment transactions | Yes | Yes |
| Manage offers | Yes | No |
| Manage JBP cycles | Yes | No |
| Access CMS | Yes | No |
| View audit logs | Yes | No |

---

## 5. SM Portal — Feature Access

| Feature | SM Admin (4) | SM (5) |
|---------|-------------|-------|
| View all callback requests | Yes | No — own only |
| Assign callback requests to SMs | Yes | No |
| View own callback requests | Yes | Yes |
| Record VC outcomes | Yes | Yes |
| Conduct physical allocation | Yes | Yes |
| View tower heatmap | Yes | Yes |
| Create callback requests | Yes | Yes |

---

## 6. CP Portal — Feature Access

| Feature | CP (3) |
|---------|-------|
| Register new customers | Yes |
| View own customers | Yes |
| View other CPs' customers | No |
| Submit JBP | Yes |
| Edit JBP (via request) | Yes |
| Assist buyer with KYC | Yes |
| Access project information | Yes |
| View unit inventory or heatmap | No |

---

## 7. Buyer Portal — Feature Access

| Feature | Buyer (2) |
|---------|----------|
| View own registrations | Yes |
| Participate in allocation campaign | Yes — if registration payment confirmed |
| View unit heatmap | Yes — during live campaign only |
| Complete KYC | Yes — after WINNER status |
| Apply for home loan | Yes — after KYC |
| View payment schedule | Yes — after KYC |
| Raise support tickets | Yes — after unit booking |
| Request callback with SM | Yes |
| View project information | Yes |

---

## 8. CP Hierarchy

CPs operate in a two-tier structure:

```
Master CP (Lead CP)
└── isLeadCp = true
└── Has Member CPs assigned under them

Member CP
└── isLeadCp = false
└── leadCpId links to their Master CP
└── smUserId links to their assigned Sales Manager
```

**Key rule:** A Member CP's registrations are attributed to the Member CP's `brokerId` — not the Master CP's.

---

## 9. Authentication Method by Role

| Role | Login Method |
|------|-------------|
| Buyer | Mobile OTP |
| Channel Partner | Mobile OTP |
| Admin | Email + password |
| SM Admin | Email + password (or OTP) |
| Sales Manager | Email + password (or OTP) |

- All sessions use JWT tokens with `user_id` and `role_id` embedded
- Expired JWT → redirect to login
- Invalid role for route → `AccessRestricted` screen shown

---

## 10. Data Visibility Rules

| Role | What They Can See |
|------|-----------------|
| Admin | All buyers, all registrations, all transactions — full project scope |
| SM Admin | All callback requests; customer view as needed for operations |
| Sales Manager | Only callback requests assigned to them |
| CP | Only customers they personally registered (`brokerId` match) |
| Buyer | Only their own registration, unit, KYC, payments, tickets |

---

## 11. WebSocket Role Behaviour During Allocation

During live allocation events, role controls what data a user receives:

| Role | Tower Broadcasts | Unit Status Updates | Admin-Only Messages |
|------|-----------------|--------------------|--------------------|
| Admin (1) | All towers — active and inactive | All status changes | Yes |
| All others (2–5) | Active towers only — STATIC campaigns | Only during RUNNING campaign | No |

---

## How to Use: Roles and Permissions

---

### Admin: Managing Access

**Adding a new Sales Manager:**
- Create user with role 5 (sales_manager) in the Sales Managers module
- SM can immediately access the SM Portal with their credentials
- To give elevated access (view all callbacks, manage team): change role to 4 (sm_admin)

**Restricting an SM from callbacks:**
- Set `isAvailable = false` on the SM's record — they will be excluded from round-robin assignment
- Do not delete the SM record — use `isActive = false` to soft-disable

**CP management:**
- Approve a CP to activate their account
- A CP's HV code (`hvCode`) is assigned at registration — it links walk-in buyers to the CP

---

### SM: Understanding Your Access

- You can only see callback requests assigned to you
- SM Admin can see all callback requests and reassign them
- You can conduct physical allocation for walk-in buyers
- You cannot modify customer registration data

---

### CP: Understanding Your Access

- You can only see leads you personally registered
- You cannot see what other CPs are doing
- If you are a Member CP, your Master CP can see your submissions
- You can assist buyers with KYC document uploads but you cannot submit on their behalf

---

### Buyer: Understanding Your Access

- You can only see your own data — no other buyer's information is ever visible
- Your access gates open progressively as you complete each step:
  - After registration payment: allocation access
  - After winning a unit: KYC access
  - After KYC: payment schedule and home loan access
  - After booking: support ticket access

---

## 12. Related Documents

- [[BRD-Admin-Overview]] — Admin Portal full feature list
- [[BRD-SM-Portal]] — SM Portal features
- [[BRD-CP-Portal]] — CP Portal features
- [[BRD-Buyer-Portal]] — Buyer Portal features
- [[BRD-Business-Rules]] — ADMIN-001 through ADMIN-006
