# Backend — BRD Summary

**Component:** Backend API Server
**Technology:** Node.js, Express, Sequelize ORM, MySQL
**Full Technical Spec:** [[backend-technical]]
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The backend is the central business logic engine for the XR Portal platform. It serves as the API layer connecting all portals (Admin, SM, CP, Buyer) and orchestrates:
- Authentication and authorization (JWT, OTP-based mobile login)
- Registration and allocation workflows
- Payment processing and reconciliation
- KYC data management
- Third-party integrations (CRM, ERP, Payment Gateways, SMS/WhatsApp)
- Scheduled automation tasks (cron jobs)
- Audit logging

---

## 2. User Roles

| Role ID | Role Name | Portal |
|---------|-----------|--------|
| 1 | admin | Admin Portal |
| 2 | user | Buyer Portal |
| 3 | cp | CP Portal |
| 4 | sales_manager_admin | SM Portal (elevated) |
| 5 | sales_manager | SM Portal |

---

## 3. Core Business Domains

| # | Domain | Key Responsibility |
|---|--------|--------------------|
| 1 | Authentication | Mobile OTP login, JWT issue, role-based access |
| 2 | Registration | Lead → Prospect → KYC-verified lifecycle |
| 3 | Allocation | Unit preference, hold timers, double-booking prevention |
| 4 | Payments | Demand letter generation, receipt, milestone tracking |
| 5 | KYC | Document upload, admin verification, status update |
| 6 | Channel Partners | RERA-verified CP login, booking on behalf, commission |
| 7 | Sales Managers | Callback handling, physical allocation, reassignment |
| 8 | Notifications | SMS, WhatsApp, email triggers on lifecycle events |
| 9 | Admin Config | Tower/unit setup, offers, CMS content management |
| 10 | Cron Jobs | Hold expiry cleanup, payment reminder triggers |

---

## 4. Key API Route Namespaces

| Namespace | Purpose |
|-----------|---------|
| `/admin/*` | Admin portal operations (role 1 or 4 required) |
| `/user/*` | Buyer portal operations (role 2 required) |
| `/cp/*` | Channel partner operations (role 3 required) |
| `/sales-manager/*` | SM portal operations (role 4 or 5 required) |
| `/public/*` | Unauthenticated endpoints (OTP request, project info) |

---

## 5. Key Business Rules

- All protected routes require valid JWT; tokens expire per session config
- OTP login uses static OTP `258369` on UAT; dynamic OTP in production
- Unit allocation enforces an atomic hold-then-confirm pattern to prevent double-booking
- Payment milestones trigger demand letters only after agreement is signed
- KYC must be verified before possession can be initiated
- CP bookings are restricted to the inventory pool assigned to that CP
- Hold timers are enforced by cron job; expired holds release units back to available pool

---

## 6. Integrations

| Integration | Purpose |
|-------------|---------|
| CRM (Kylas) | Lead sync, activity tracking |
| Payment Gateway | Online payment collection |
| SMS / WhatsApp | OTP delivery, booking confirmations, demand notices |
| Email Service | Document delivery, receipts |
| Azure Blob Storage | Document and media storage <!-- FSD-CORRECTION 2026-05-25: Azure Blob not AWS S3 // Source: azure-blob.service.js --> |

---

## 7. Related Docs

- Full technical spec: [[backend-technical]]
- Realtime events: [[realtime-events]]
- Integrations detail: [[integrations]]
- WebSocket: [[websocket]]
- Roles and permissions: [[roles-and-permissions]]
