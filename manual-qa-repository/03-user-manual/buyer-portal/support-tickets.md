# Buyer Portal — Support Tickets User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URLs:** `https://uat.xrportal.in/support-tickets`, `/support-tickets/categories`, `/support-tickets/create`, `/support-tickets/:id`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Support-Tickets.md
**Last Updated:** 2026-05-22

---

## Overview

The Support Tickets section is your channel for raising any post-purchase issue, inquiry, or cancellation request. Every ticket you raise here is also created in **OS Ticket** (the developer's external ticketing system) via API — the support team handles the response in OS Ticket and the status sync back to this portal.

You only ever see **your own** tickets. Use the right category — it determines which team picks up the ticket and how it is reported internally.

---

## Page Layout (At a Glance)

1. **Tickets list** — your full history with status badges.
2. **New Ticket** button — opens the category picker + form.
3. **Ticket detail view** — opens when you tap a row; shows the conversation thread.

---

# Feature 1 — View Your Support Tickets

### What it does
Lists every support ticket you have raised, with category, description, status, and creation date.

### Preconditions
- You are logged in.

### How to use
1. From the navigation menu, tap **Support Tickets**.
2. Your ticket history loads.
3. Each row shows:
   - **Ticket ID** — unique reference number.
   - **Category** — GENERAL / CAR_PARKING / CANCELLATION / LOAN.
   - **Description** — brief summary you entered when raising the ticket.
   - **Status** — current state from the support team (synced from OS Ticket).
   - **Date Created** — when you raised the ticket.
4. Tap any row to open the full conversation and any responses from the support team.

### Result
You see your complete support history and can drill into any open ticket for the latest update.

---

# Feature 2 — Raise a New Support Ticket

### What it does
Creates a new ticket against your registration. The ticket is recorded in the portal and pushed to OS Ticket for handling by the support team.

### Preconditions
- You are logged in.

### How to use
1. On the Support Tickets page, click **New Ticket** / **Create Ticket**.
2. Select a **Category** (required):
   - **General** — questions or issues not covered by other categories.
   - **Car Parking** — parking-related concerns.
   - **Cancellation** — booking cancellation requests.
   - **Loan** — home loan related questions or issues.
3. Write a clear **Description** (required) of your concern. Include reference numbers (Registration No, Transaction ID, Unit) to help the team respond faster.
4. Click **Submit**.

### Result
- A new ticket is created with a unique Ticket ID.
- The ticket is pushed to OS Ticket via API.
- The ticket appears at the top of your list with status set by the support workflow.

### Category Reference
| Category | Backend value | Use for |
|----------|--------------|---------|
| General | `GENERAL` | Anything not in the other three categories |
| Car Parking | `CAR_PARKING` | Parking allocation / count / charges |
| Cancellation | `CANCELLATION` | You want to cancel your booking |
| Loan | `LOAN` | Home loan questions / disbursement issues |

### Validation rules
| Field | Rule |
|-------|------|
| Category | Required, must be one of GENERAL / CAR_PARKING / CANCELLATION / LOAN |
| Description | Required, free text |

---

# Feature 3 — Track Ticket Status and Conversation

### What it does
Opens the ticket detail view with the full conversation thread, including responses from the support team synced from OS Ticket.

### Preconditions
- You have raised at least one ticket.

### How to use
1. From the Support Tickets list, tap a ticket row.
2. The detail view opens with:
   - Ticket metadata (ID, category, status, dates).
   - Original description.
   - Conversation thread — your messages and support team responses.
3. Reply / add comments if the UI permits in your environment.

### Result
You have full visibility into the conversation. Status updates appear as the support team progresses the ticket.

### Note
The support team works in **OS Ticket** — responses sync back to this portal. There may be a brief delay between an OS Ticket update and what you see here.

---

# Feature 4 — Cancellation Requests via Tickets

### What it does
The official channel for requesting a booking cancellation. The buyer portal does **not** offer a self-service cancel button — you must raise a **CANCELLATION** ticket and the support / admin team processes the cancellation off-portal.

### Preconditions
- You have a booked unit and want to cancel.

### How to use
1. Click **New Ticket**.
2. Select category **Cancellation**.
3. Describe your reason for cancellation in the description box. Include:
   - Your **Registration Number**.
   - Your **Unit Number / Tower**.
   - Reason for cancellation.
   - Whether you have any pending payments or open transactions.
4. Click **Submit**.

### Result
- A CANCELLATION ticket is raised.
- The support / admin team contacts you to confirm the cancellation, walk you through refund timelines, and execute the cancellation in the Admin Portal.

### Warnings
- **Cancellations are not self-service** in the Buyer Portal. The ticket starts the process.
- **Refund timelines vary** based on whether you are Registered (₹999 refund), Booked (no automatic refund — admin-driven), or further along the journey.
- Once the admin executes the cancellation in the Admin Portal, the action is **permanent and irreversible**.

---

## Business Rules — Quick Lookup

1. You see **only your own tickets**.
2. Tickets sync to / from **OS Ticket** via API.
3. Status updates from the support team flow through OS Ticket sync.
4. Cancellation requests go through the **CANCELLATION** category — not a self-service button.
5. All four categories are tracked separately for support team reporting.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Ticket created in portal but not in OS Ticket | API call failed mid-flow | Wait for retry; if stuck >1 hour, raise a follow-up ticket |
| No response after several days | Support workload or your description lacks reference IDs | Add a comment with Registration No / Transaction ID to bump it |
| Status not updating | OS Ticket sync delay | Wait 30 minutes; refresh |
| Cannot find my old ticket | Filter / paging | Scroll or use page controls |
| Wrong category submitted | Category cannot be changed by buyer | Raise a comment in the ticket asking the team to re-categorise |
| Cancellation ticket status flips to Closed without action | Support team may have requested info you did not provide | Open the ticket, read latest comment, raise a new ticket if needed |
