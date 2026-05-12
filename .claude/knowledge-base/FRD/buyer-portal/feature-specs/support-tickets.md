# Feature-Spec: Support Tickets

**Portal:** Buyer Portal
**URLs:** `/support-tickets`, `/support-tickets/categories`, `/support-tickets/create`, `/support-tickets/:id`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View Support Tickets

### 1.1 Objective

Allow buyers to view all support tickets they have raised and track their current status.

### 1.2 Preconditions

- Buyer must be logged in

### 1.3 Ticket List View

| Column | Description |
|--------|-------------|
| Ticket ID | Unique ticket reference number |
| Category | GENERAL / CAR_PARKING / CANCELLATION / LOAN |
| Description | Brief summary of the issue |
| Status | Current ticket status |
| Date Created | When the ticket was raised |

### 1.4 Business Rules

1. Buyers see only their own tickets
2. Tickets are synced with OS Ticket (external support system)
3. Status updates from the support team appear via the OS Ticket sync

---

## How to Use: Viewing Your Support Tickets

**Who does this:** Buyer

---

**Step 1 — Navigate to Support Tickets**

From the navigation menu, click **Support Tickets**. Your ticket history will load.

**Step 2 — Review open tickets**

Each row shows a ticket with its ID, category, description, and current status. Click any ticket to view the full conversation and any responses from the support team.

---

## Feature 2: Raise a New Support Ticket

### 2.1 Objective

Allow buyers to create a new support ticket for any post-purchase issue, inquiry, or cancellation request.

### 2.2 Ticket Categories

| Category | Use For |
|----------|---------|
| GENERAL | General inquiries or issues |
| CAR_PARKING | Parking-related concerns |
| CANCELLATION | Requests to cancel the unit booking |
| LOAN | Home loan related issues |

### 2.3 Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Category | Yes | Select the issue type |
| Description | Yes | Detailed description of the issue |

### 2.4 Business Rules

1. Ticket is assigned a unique ID on creation
2. Ticket is created in OS Ticket (external ticketing system) via API
3. Cancellation requests go through the CANCELLATION category
4. All categories are tracked separately for team reporting

### 2.5 System Actions on Submission

1. Ticket record created in the portal
2. OS Ticket API call creates a corresponding ticket in the external system
3. Buyer can view and track the ticket status

---

## How to Use: Raising a New Support Ticket

**Who does this:** Buyer, when they need assistance or want to raise a concern

---

**Step 1 — Click "New Ticket" or "Create Ticket"**

On the Support Tickets page, click the button to create a new ticket.

**Step 2 — Select a category**

Choose the category that best matches your issue:
- **General** — Questions or issues not covered by other categories
- **Car Parking** — Any parking-related concerns
- **Cancellation** — If you need to request a booking cancellation
- **Loan** — Home loan related questions or issues

**Step 3 — Describe your issue**

Write a clear description of your concern. Include any relevant reference numbers (Registration No, Transaction ID, etc.) to help the team respond faster.

**Step 4 — Submit**

Click **Submit**. Your ticket will be created with a unique ticket ID. You can track the status and responses from the Support Tickets list.

> **For booking cancellations:** Select the **Cancellation** category. The support team will guide you through the process and provide information about the refund timeline.
