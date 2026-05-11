# XR Portal — Master Knowledge Base Index

**Type:** Master Index / Dashboard
**Last Updated:** 2026-05-10
**Tags:** #index #master #status/complete

---

## What This Knowledge Base Is

This knowledge base is the **single source of truth** for the XR Portal real estate platform, reverse-engineered from the complete source code. It covers all portals, services, workflows, business rules, and integration points.

Use this index to navigate to any part of the system documentation. All documents use Obsidian cross-links for interconnected navigation.

**Target Audience:** QA Engineers, Business Analysts, Product Owners, Developers, Support Teams, and AI Agents.

**Platform Overview:** XR Portal (also referred to as HoABL Portal) is a real estate sales platform managing the full lifecycle from buyer registration through unit allocation, KYC, milestone payments, and possession for a residential project with 4 unit typologies.

---

## Portal BRDs

Start here to understand each user-facing application.

| Portal | URL Path | Primary Users | Document |
|--------|---------|---------------|---------|
| Admin Portal | `/admin` | Admin, SM Admin | [[Admin-Portal-BRD]] |
| SM Portal | `/sales-manager` | Sales Manager Admin, Sales Manager | [[SM-Portal-BRD]] |
| CP Portal | `/` (root) | Channel Partners | [[CP-Portal-BRD]] |
| Buyer Portal | Separate Next.js app | Registered Buyers | [[Buyer-Portal-BRD]] |

---

## Backend and Infrastructure BRDs

| Component | Description | Document |
|-----------|------------|---------|
| Backend Service | Node.js REST API — all business logic | [[Backend-Functional-BRD]] |
| CMS / Strapi | Headless CMS controlling dynamic config | [[CMS-Strapi-BRD]] |
| WebSocket Server | Python FastAPI real-time event server | [[Realtime-Events-BRD]] |

---

## Workflow Documentation

End-to-end flows for the most critical business processes.

| Workflow | Description | Document |
|----------|------------|---------|
| Allocation | All 3 campaign types: STATIC, DYNAMIC, PHYSICAL_EVENT | [[Allocation-Workflow]] |
| Registration | Buyer and CP-initiated registration + payment | [[Registration-Workflow]] |
| Payment | Registration payment, allocation payment, milestone payment, offline | [[Payment-Workflow]] |
| KYC | Document upload, LSQ sync, Mavis update, PDF generation | [[KYC-Workflow]] |

---

## Cross-Cutting Reference Documents

| Topic | Description | Document |
|-------|------------|---------|
| Roles and Permissions | All 5 roles, portal access matrix, feature-level permissions | [[Roles-and-Permissions]] |
| Status Flows | 12 status machines: Unit, Registration, Campaign, Payment, etc. | [[Unit-Status-Flow]] |
| Integrations | All 13 third-party integrations: LSQ, Mavis, Easebuzz, etc. | [[Integrations]] |
| Business Rules | 100+ rules organized by domain | [[Business-Rules]] |
| Glossary | Real estate and system terminology definitions | [[Glossary]] |

---

## System Architecture Summary

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Admin/SM/CP Frontend | React SPA (single app serves 3 portals) |
| Buyer Frontend | Next.js (separate application) |
| Backend API | Node.js with Express (ESM modules) |
| WebSocket Server | Python FastAPI |
| Primary Database | MySQL (Sequelize ORM, paranoid soft deletes) |
| Real-time Cache | Redis |
| File Storage | Azure Blob Storage |
| Background Jobs | Bull + Redis queue |
| PDF Generation | Puppeteer (headless Chrome) |

### URL Routing Logic

One React application serves three portals based on URL path:
- `/` and `/login` → CP Portal
- `/admin/*` → Admin Portal (role 1 and 4 only)
- `/sales-manager/*` → SM Portal (role 4 and 5 only)

### The 5 Roles

| ID | Role | Portal |
|----|------|--------|
| 1 | admin | Admin Portal |
| 2 | user (buyer) | Buyer Portal |
| 3 | cp (channel partner) | CP Portal |
| 4 | sales_manager_admin | SM Portal + Admin Portal |
| 5 | sales_manager | SM Portal |

---

## Core Business Flows (Summary)

### 1. Buyer Journey (Self-Registration)
```
Mobile OTP Login
  → Fill Registration Form (typology preference)
  → Pay Registration Fee
  → Wait for Allocation Campaign
  → Select Unit (STATIC) / Receive Unit Assignment (DYNAMIC)
  → Pay Booking Token (within 20 minutes)
  → Complete KYC + Document Upload
  → Payment Schedule Generated
  → Pay Construction Milestones as Project Progresses
  → Possession
```

### 2. CP-Assisted Buyer Journey
```
CP logs in → Registers buyer → Buyer pays registration fee
  → CP tracks buyer's progress
  → CP assists with KYC if needed
  → CP earns commission tracked via HV code and JBP
```

### 3. Admin Campaign Management
```
Admin creates campaign (type: STATIC / DYNAMIC / PHYSICAL_EVENT)
  → Sets towers, units, start time
  → Starts campaign (warmup loads all data into Redis)
  → Monitors live heatmap
  → Buyers connect via WebSocket and participate
  → Admin monitors bookings in real-time
  → Campaign ends (time expiry or admin stop)
  → Admin reviews and manages post-campaign activities
```

### 4. Sales Manager Callback Flow
```
Buyer requests callback
  → Auto-assigned to available SM (round-robin)
  → SM confirms time slot
  → Teams meeting link auto-generated
  → SM conducts video call
  → SM records outcome (one of 10 options)
  → Certain outcomes trigger VC_REQUEST offer discount
  → SM follows up based on outcome
```

---

## Key Business Rules (Quick Reference)

| Rule | Summary |
|------|---------|
| 20-minute hold | Units held for exactly 20 min during payment; auto-released on expiry |
| Webhook is truth | Payment status determined solely by gateway webhook, not browser return URL |
| KYC before schedule | Milestone payment schedule generated only after KYC is submitted |
| Campaign required for allocation | Buyers can only book units during active campaigns (or via admin pre-assignment) |
| CP customer isolation | CPs can only see and manage their own registered customers |
| SM request visibility | Standard SMs see only their own callbacks; SM Admin sees all |
| Audit trail immutable | All admin actions on sensitive data are logged and cannot be deleted |
| Soft deletes everywhere | No hard deletes — all records use deletedAt (Sequelize paranoid) |
| LSQ failures non-blocking | CRM sync failures queued for retry; do not block buyer-facing flows |
| Mavis = unit master source | Unit data originates from Mavis ERP; XR Portal syncs from it |

Full rules: [[Business-Rules]]

---

## Integration Map

| System | Purpose | Direction |
|--------|---------|-----------|
| LeadSquared (LSQ) | CRM — buyer activity tracking | Outbound |
| Mavis | ERP — unit master data and booking sync | Bidirectional |
| Easebuzz | Primary payment gateway | Bidirectional |
| Razorpay | Secondary payment gateway | Bidirectional |
| Easiloan | Home loan eligibility and applications | Bidirectional |
| Azure Blob | Document and file storage | Bidirectional |
| Kaleyra | SMS + WhatsApp notifications | Outbound |
| Microsoft Teams | Meeting link generation | Outbound |
| OS Ticket | Buyer support ticketing | Bidirectional |
| Strapi CMS | Dynamic configuration and content | Inbound |
| Python WebSocket Service | Real-time allocation event engine | Bidirectional (internal) |
| Redis | Real-time unit state cache | Bidirectional (internal) |
| Bull Queue | Background job processing | Internal |

Full details: [[Integrations]]

---

## Status Machines (Quick Reference)

| Entity | Statuses |
|--------|---------|
| Unit | AVAILABLE → HOLD → BOOKED; RESERVED; REFUGE; PREBOOKED; PBT |
| Registration | Open → Won → Lost → Refund |
| RegistrationUnit | WAITLIST → PREALLOCATED → ALLOCATED → HOLD → WINNER → REFUND |
| Allocation Campaign | NOT_STARTED → RUNNING → COMPLETED / STOPPED / FAILED / CANCELLED |
| Payment Transaction | initiated → pending → completed / failed / cancelled / dropped / bounced → refunded |
| Milestone Payment | pending → partial → paid |
| Callback Request | REQUESTED → SCHEDULED → CONFIRMED → COMPLETED (or RESCHEDULED) |
| JBP Cycle | OPEN → CLOSED |
| JBP Submission | ACTIVE → EXPIRED |
| Home Loan | null → pending → approved / rejected / admin_rejected |

Full details: [[Unit-Status-Flow]]

---

## Allocation Campaign Types

| Type | Mechanism | Unit Selection | Payment Timing |
|------|-----------|---------------|---------------|
| STATIC | Open event, all buyers see all units | Buyer selects | Must pay within 20 min of selection |
| DYNAMIC | Round-based, system assigns units | System assigns via round-robin | Must pay within round time window |
| PHYSICAL_EVENT | In-person, SM selects for buyer | SM selects | Online QR or offline manual |

Full details: [[Allocation-Workflow]]

---

## Admin Portal Modules

| Module | URL | Purpose |
|--------|-----|---------|
| Customer Management | `/admin/customers` | View, search, manage all registered buyers |
| Towers & Inventory | `/admin/towers` | Manage tower/floor/unit master data |
| Allocation Campaigns | `/admin/allocation` | Create and manage allocation events |
| Channel Partners | `/admin/channel-partners` | Manage CP accounts and hierarchy |
| Sales Managers | `/admin/sales-managers` | Manage SM accounts and assignments |
| Milestone Payments | `/admin/milestone` | Track construction payment milestones |
| Payment Transactions | `/admin/payment-transactions` | View all payment records |
| Offers | `/admin/offers` | Configure HOME_LOAN and VC_REQUEST offers |
| JBP Management | `/admin/jbp-management` | Manage CP Joint Business Plans |
| CMS / Config | `/admin/cms` | System configuration and content |

Full details: [[Admin-Portal-BRD]]

---

## Real-Time Event Architecture

During allocation campaigns, the platform runs a real-time event system:

```
Buyer Browser ←──WebSocket──→ Python FastAPI Server ←──→ Redis
                                      │
                                      │ (HTTP internal calls)
                                      ▼
                               Node.js Backend ←──→ MySQL
```

Key WebSocket messages:
- `pay_now_initiated` — buyer starts payment for a unit (STATIC)
- `proceed_to_pay` — buyer confirms payment intent (DYNAMIC)
- `tower_refresh` — broadcast when any unit status changes
- `unit_sold` — broadcast when a unit is successfully booked
- `reallocation_notification` — DYNAMIC only, when buyer's unit changes

Full details: [[Realtime-Events-BRD]]

---

## Project Typologies

| Name | Category |
|------|---------|
| 1 Bed Growth Home | 1BHK |
| 2 Bed Growth Home | 2BHK |
| 2 Bed Rise Home | 2BHK |
| 2 Bed Peak Home | 2BHK |

Typology drives unit assignment eligibility and pricing calculations.

---

## Document Index

### Portal BRDs
- [[Admin-Portal-BRD]] — Full Admin Portal documentation (Portals/Admin-Portal/)
- [[SM-Portal-BRD]] — Sales Manager Portal documentation (Portals/SM-Portal/)
- [[CP-Portal-BRD]] — Channel Partner Portal documentation (Portals/CP-Portal/)
- [[Buyer-Portal-BRD]] — Buyer Portal documentation (Portals/Buyer-Portal/)

### Backend and Services
- [[Backend-Functional-BRD]] — Node.js backend business logic (Backend/)
- [[CMS-Strapi-BRD]] — Strapi CMS content types and usage (CMS/)
- [[Realtime-Events-BRD]] — WebSocket server and real-time events (Realtime-Events/)

### Workflows
- [[Allocation-Workflow]] — All allocation campaign types (Workflows/)
- [[Registration-Workflow]] — Buyer registration process (Workflows/)
- [[Payment-Workflow]] — All payment flows (Workflows/)
- [[KYC-Workflow]] — Document collection and verification (Workflows/)

### Reference
- [[Roles-and-Permissions]] — Access control matrix (Roles-and-Permissions/)
- [[Unit-Status-Flow]] — All 12 status machines (Status-Flows/)
- [[Integrations]] — All 13 third-party systems (Integrations/)
- [[Business-Rules]] — 100+ domain business rules (Business-Rules/)
- [[Glossary]] — Terminology reference (Glossary/)

### QA-Specific Files (Flat Module Layer)
- `Module Index.md` (root) — QA module index with test coverage and selector file references
- `Open Questions.md` (root) and `Open-Questions/Open-Questions.md` — All open clarifications across all modules
- `Module - [Name].md` files (root) — Per-module QA detail: selectors, TC IDs, spec file paths, business rules confirmed by testing

### Sprint Records
- `Sprint-Records/Sprint-5-Overview.md` — Sprint 5 scope and gate status
- `Sprint-Records/Sprint-5-Pipeline-Status.md` — Sprint 5 pipeline gate status per module

---

## How to Use This Knowledge Base

**For QA Engineers:**
1. Start with the relevant Portal BRD for the module being tested
2. Check [[Business-Rules]] for validation rules and edge cases
3. Check [[Unit-Status-Flow]] for expected status transitions
4. Check [[Roles-and-Permissions]] for access control test cases
5. Check [[Integrations]] to understand which external systems need mocking/stubbing

**For Business Analysts:**
1. Use Portal BRDs to understand feature scope
2. Use Workflow documents for end-to-end process understanding
3. Use [[Glossary]] for terminology alignment
4. Use [[Business-Rules]] to validate acceptance criteria

**For Developers:**
1. Use [[Backend-Functional-BRD]] for service-level understanding
2. Use [[Integrations]] for integration contract reference
3. Use [[Unit-Status-Flow]] for valid state transitions
4. Use [[Realtime-Events-BRD]] for WebSocket protocol reference

**For Support Teams:**
1. Use [[Glossary]] for terminology
2. Use Portal BRDs for feature-level understanding
3. Use Workflow documents to trace buyer issues through the system

**For AI Agents:**
1. This entire knowledge base is structured for machine-readable consumption
2. Start with this Master Index to orient
3. Follow wikilinks (e.g. [[Admin-Portal-BRD]], [[Allocation-Workflow]]) to drill into specific domains
4. Business Rules are domain-organized for targeted querying
5. All status machines are in [[Unit-Status-Flow]]
