---
type: module
tags: [module, support, tickets, os-ticket, buyer-portal]
updated: 2026-05-10
status: complete
---

# Support Ticket Module

**Related:** [[Buyer-Portal-BRD]] | [[Integrations]] | [[Roles-and-Permissions]]

---

## 1. What Is This?

The Support Ticket module allows registered buyers to raise service requests related to their booking. Tickets are routed through **OS Ticket** (a third-party helpdesk integration). The system captures structured data depending on the ticket category — different categories require different information from the buyer.

---

## 2. Data Model — SupportTicket

| Field | Type | Description |
|-------|------|-------------|
| `userId` | FK | Buyer raising the ticket |
| `projectId` | FK | Project the ticket is related to |
| `registrationUnitId` | FK | Specific booking/unit the ticket relates to |
| `osTicketId` | STRING(50) | Ticket ID in OS Ticket system |
| `ticketNumber` | STRING(50) | Human-readable ticket reference number |
| `category` | ENUM | Ticket type — see categories below |
| `status` | ENUM | Current resolution state |
| `note` | TEXT | Buyer's description of the issue (required) |
| `numberOfParkings` | INTEGER | Car parking count (CAR_PARKING category only, default 0) |
| `timeSlot` | STRING(50) | Preferred callback time (LOAN category only) |
| `contactNumber` | STRING(20) | Contact number for callback (LOAN category) |
| `reasonOfCancellation` | STRING(100) | Reason (CANCELLATION category only) |
| `aadharCard` | STRING(200) | Document URL (CANCELLATION category) |
| `panCard` | STRING(200) | Document URL (CANCELLATION category) |
| `transactionProof` | STRING(200) | Payment proof URL (CANCELLATION category) |
| `cancelledCheque` | STRING(200) | Cancelled cheque URL (CANCELLATION category) |

---

## 3. Ticket Categories

| Category | Use Case | Extra Fields Required |
|----------|----------|-----------------------|
| `GENERAL` | General query or issue | Note only |
| `CAR_PARKING` | Request for car parking slot | `numberOfParkings` |
| `CANCELLATION` | Request to cancel booking | `reasonOfCancellation`, `aadharCard`, `panCard`, `transactionProof`, `cancelledCheque` |
| `LOAN` | Request for loan callback / assistance | `timeSlot`, `contactNumber` |

---

## 4. Ticket Status Flow

```
OPEN
  → IN_PROGRESS   (support team has picked up the ticket)
  → ACTION_REQUIRED (waiting for buyer to provide more info)
  → RESOLVED      (issue addressed)
  → CLOSED        (ticket formally closed)
```

---

## 5. Step-by-Step — Creating a Ticket (Buyer Journey)

1. Buyer logs into Buyer Portal and navigates to Support section
2. Buyer selects ticket category (GENERAL / CAR_PARKING / CANCELLATION / LOAN)
3. System shows additional fields based on category:
   - **CAR_PARKING**: asks "How many car parks do you need?"
   - **LOAN**: asks for preferred 2-hour time slot and contact number
   - **CANCELLATION**: asks for cancellation reason and document uploads (Aadhar, PAN, transaction proof, cancelled cheque)
4. Buyer fills in the note (required for all categories)
5. Buyer submits ticket
6. System creates ticket in OS Ticket via API
7. Ticket appears in buyer's ticket list with status `OPEN`
8. Buyer can view ticket history and status updates

---

## 6. Business Rules

1. Ticket must be linked to an active `registrationUnitId` — buyer must have a booking to raise a ticket.
2. Ticket is project-scoped — `projectId` is mandatory. Buyer can only raise tickets for projects they are registered in.
3. `note` field is required for all ticket categories.
4. `numberOfParkings` defaults to 0 — for CAR_PARKING tickets, this must be set to a positive integer.
5. CANCELLATION tickets require document uploads (Aadhar, PAN, transaction proof, cancelled cheque) — these are stored in Azure Blob Storage and the URL is saved.
6. OS Ticket integration is bidirectional — status updates in OS Ticket sync back to the portal.
7. No hard deletes — but unlike most other models, `SupportTicket` does not use `paranoid` (no `deletedAt`) per the model definition.

---

## 7. Domain Red Flags

| Flag | Severity | Description |
|------|----------|-------------|
| Cancellation ticket ≠ auto-cancel | HIGH | Raising a CANCELLATION ticket does NOT automatically cancel the booking. It initiates a manual review process. Buyer must understand this distinction. |
| No ticket without booking | MEDIUM | Buyer who registered but has no unit allocation cannot raise a support ticket (registrationUnitId required). |

---

## 8. Integration Points

| System | Role |
|--------|------|
| OS Ticket | External helpdesk system — tickets created and tracked here |
| Azure Blob Storage | Document uploads (Aadhar, PAN, proofs) stored here |
| Buyer Portal | Buyer creates and views tickets |
| Kaleyra (SMS/WhatsApp) | Notifications on ticket status changes |
