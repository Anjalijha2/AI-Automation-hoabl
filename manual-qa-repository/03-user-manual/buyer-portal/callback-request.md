# Buyer Portal — Callback Request User Guide

**Audience:** Buyer / Customer
**Portal:** Buyer Portal
**URLs:** `https://uat.xrportal.in/call-feedback`, `https://uat.xrportal.in/call-feedback/:code`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Callback-Request.md
**Last Updated:** 2026-05-22

---

## Overview

The Callback Request section lets you ask a Sales Manager to call you back or schedule a video call. Once you submit your request, the system assigns it to an available SM via **round-robin** (the SM whose `lastRequestAssignedAt` is oldest gets the next request) — so you do not need to pick an SM yourself.

After the call concludes, you receive an SMS / WhatsApp with a **token-authenticated feedback link** — clicking it lets you rate the call without needing to log in.

---

## Page Layout (At a Glance)

1. **Request form** — short form with optional description, preferred date, preferred time.
2. **Feedback link** — opens via the SMS/WhatsApp token URL after a call concludes.

---

# Feature 1 — Submit a Callback / Video Call Request

### What it does
Records your request for an SM to contact you. The request is linked to your registration and routed to an available SM by round-robin assignment.

### Preconditions
- You are logged in.

### How to use
1. Find the **Request Callback** or **Schedule VC** entry point — it may appear as:
   - A floating button on relevant pages.
   - A navigation menu item.
   - A CTA on the Home Dashboard.
2. Click it to open the request form.
3. Fill in (all fields optional):
   - **Request description** — describe what you'd like to discuss.
   - **Preferred date** — when you'd like the call.
   - **Preferred time** — preferred time slot.
4. Click **Submit**.

### Result
- The request is created with status **REQUESTED**.
- The system assigns it to an available SM via round-robin.
- You receive a notification once the SM schedules a time.

### Note
Even if you leave all three fields blank, the request submits — the SM will reach out using your registered mobile and your registration context. The optional fields just help the SM prepare.

---

# Feature 2 — Track Your Callback Request

### What it does
Shows the current state of any callback requests you've raised.

### Preconditions
- At least one callback request submitted.

### How to use
1. Navigate to the Callback / Support area of the portal.
2. View the list of past and current requests.
3. Each row shows the status (REQUESTED, SCHEDULED, COMPLETED) and timing if the SM has scheduled the call.

### Result
You always know whether the SM has picked up the request and when the call is scheduled.

### Status flow
| Status | Meaning |
|--------|---------|
| REQUESTED | You submitted; awaiting SM assignment / scheduling |
| SCHEDULED | SM has set a time — wait for the call |
| COMPLETED | Call done; both SM and your feedback received |

---

# Feature 3 — Submit Call Feedback (Token Link, No Login)

### What it does
After your call, the SM records their outcome, which generates a unique `buyerFeedbackToken`. Kaleyra sends you an SMS / WhatsApp with the link `/call-feedback/:code` — opening it lets you rate the call without logging in.

### Preconditions
- The SM has completed the call and submitted their own feedback.
- You have received the SMS / WhatsApp with the feedback URL.

### How to use
1. Open the SMS / WhatsApp from the developer / SM team.
2. Tap or click the feedback link — no login required.
3. The feedback form opens.
4. Select your **Call rating** (required).
5. Optionally add **Comments** in the text box.
6. Click **Submit**.

### Result
- `isBuyerFeedbackSubmitted = true` is set on the callback request.
- Combined with the SM's feedback, the request reaches **COMPLETED**.
- The SM team uses your rating + comments to improve service.

### Warnings
- **The token is single-use.** Once you submit feedback, the link is consumed — you cannot resubmit.
- The link may **expire** after a period of inactivity. Submit promptly after receiving the SMS.
- The link is tied to one specific call. If you have had multiple calls, you will receive multiple links.

---

## Business Rules — Quick Lookup

1. Callback requests are linked to your **registration**, not just your user.
2. SM assignment is **round-robin** — the SM with the oldest `lastRequestAssignedAt` gets the next request.
3. Only SMs with `isAvailable = true` are eligible to receive assignments.
4. Requests start with status **REQUESTED**.
5. Feedback link is **token-authenticated** — no login needed.
6. Token is **single-use** and **unique per request**.
7. Request reaches **COMPLETED** only when both SM and buyer feedback are recorded.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Submit button does nothing | Network drop | Retry; check connectivity |
| No SM contact after submission | All SMs marked unavailable | Wait; if 24+ hours, raise a Support Ticket (GENERAL) |
| Did not receive feedback SMS / WhatsApp | Kaleyra delivery delay or wrong mobile | Verify your registered mobile with your CP |
| Feedback link says "Invalid / Expired" | Token already used or expired | Contact CP — a new feedback opportunity must be triggered server-side |
| Submitted feedback but request still SCHEDULED | SM has not yet recorded their feedback | Wait — request flips to COMPLETED only when both sides submit |
| Cannot find the callback button | UI flag not enabled in your environment | Raise via Support Tickets or contact your CP |
