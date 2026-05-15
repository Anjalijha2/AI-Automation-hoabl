# Support Ticket Workflow — BRD

**Type:** Cross-Portal Workflow
**Portals Involved:** Buyer Portal, Admin Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Support Ticket module allows registered buyers with an allocated unit to raise and track service requests. Tickets are created in the XR Portal and synced to OS Ticket (an external helpdesk system) where the support team manages resolution. Different ticket categories require different information from the buyer.

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Buyer | Creates ticket, provides details, tracks status |
| Support Team | Manages and resolves tickets in OS Ticket |
| System | Creates ticket in OS Ticket via API, syncs status updates back to Buyer Portal |

---

## 3. Ticket Categories and Required Fields

| Category | Use For | Extra Fields Required |
|----------|---------|----------------------|
| GENERAL | General queries or issues | Note (description) only |
| CAR_PARKING | Requesting a parking slot | Number of parking slots required |
| CANCELLATION | Requesting booking cancellation | Cancellation reason, Aadhaar card, PAN card, transaction proof, cancelled cheque |
| LOAN | Home loan assistance or callback | Preferred 2-hour time slot, contact number |

---

## 4. Ticket Status Flow

```
OPEN → IN_PROGRESS → ACTION_REQUIRED → RESOLVED → CLOSED
```

| Status | Meaning |
|--------|---------|
| OPEN | Ticket created, awaiting team pickup |
| IN_PROGRESS | Support team is actively working on it |
| ACTION_REQUIRED | Team needs more information from buyer |
| RESOLVED | Issue addressed by the support team |
| CLOSED | Ticket formally closed |

---

## 5. End-to-End Flow

1. Buyer logs into Buyer Portal → goes to Support Tickets
2. Buyer clicks to create a new ticket
3. Buyer selects category (GENERAL / CAR_PARKING / CANCELLATION / LOAN)
4. System shows additional fields based on category
5. Buyer fills in the note/description (required for all categories)
6. **For CANCELLATION:** Buyer uploads 4 documents (Aadhaar, PAN, transaction proof, cancelled cheque)
7. Buyer submits → system creates ticket in OS Ticket via API
8. Ticket appears in buyer's list with status OPEN
9. Support team manages the ticket in OS Ticket
10. Status updates sync back to the Buyer Portal
11. Buyer can view ticket history and current status at any time

---

## 6. Key Business Rules

1. **Booking required:** Buyer must have an active unit booking (`registrationUnitId`) to raise a ticket. Buyers who registered but have not booked cannot raise support tickets.
2. **Note is mandatory:** Description field required for all ticket categories.
3. **Cancellation ≠ auto-cancellation:** A CANCELLATION ticket initiates a manual review process — it does NOT automatically cancel the booking. Buyer must understand this distinction.
4. **CANCELLATION documents are required:** All 4 documents (Aadhaar, PAN, transaction proof, cancelled cheque) must be uploaded for a cancellation ticket. Stored in Azure Blob Storage.
5. **Project-scoped:** Tickets are linked to a specific project. Buyers can only raise tickets for projects they are registered in.
6. **Bidirectional OS Ticket sync:** Status updates made by the support team in OS Ticket sync back to the XR Portal.

---

## How to Use: Support Tickets

---

### Buyer: Raising a New Support Ticket

**Step 1:** In the Buyer Portal, navigate to **Support Tickets** from the menu.

**Step 2:** Click **New Ticket** (or **Create Ticket**).

**Step 3:** Select the category that matches your issue:
- **General** — for questions, complaints, or issues not in other categories
- **Car Parking** — to request a parking allocation
- **Cancellation** — to formally request cancellation of your unit booking
- **Loan** — for home loan assistance or to speak with someone about your loan

**Step 4:** Based on your category, additional fields will appear:

- *Car Parking:* Enter how many car parks you need
- *Loan:* Enter your preferred 2-hour time slot for a callback and your contact number
- *Cancellation:* Enter the reason for cancellation and upload all 4 required documents:
  - Aadhaar card (front and back or combined)
  - PAN card
  - Transaction proof (payment receipt for your booking)
  - Cancelled cheque (for refund processing)

**Step 5:** Write a clear description of your issue in the **Note** field (required).

**Step 6:** Click **Submit**. Your ticket is created with a unique ticket ID and will appear in your ticket list with status **OPEN**.

> **For cancellation tickets:** Submitting this ticket starts a manual review process. It does NOT cancel your booking immediately. A team member will contact you regarding next steps and the refund timeline.

---

### Buyer: Tracking Your Tickets

**Step 1:** Go to **Support Tickets** in the navigation.

**Step 2:** Your ticket list shows all tickets with their current status and last update.

**Step 3:** Click any ticket to view the full details and any responses or updates from the support team.

> **If your ticket shows ACTION_REQUIRED:** The support team needs more information from you. Check for any instructions or questions in the ticket and respond promptly.

---

## 7. Related Documents

- [[Support-Ticket-Module]] — Technical support ticket module reference
- [[Feature-Spec - Support Tickets]] — Buyer Portal Feature-Spec
- [[BRD-Buyer-Portal]] — Buyer Portal overview
- [[Integrations]] — OS Ticket integration details
