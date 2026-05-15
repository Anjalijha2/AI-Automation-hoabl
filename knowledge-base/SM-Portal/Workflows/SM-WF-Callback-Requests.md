# Callback Request Workflow — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Buyer Portal, SM Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

The Callback Request workflow enables buyers to request a scheduled video call with a Sales Manager. The system automatically assigns the request to an available SM, generates a Microsoft Teams meeting link, and tracks the call from scheduling through to outcome recording and buyer feedback.

Certain call outcomes automatically trigger a discount offer (`VC_REQUEST`) for the buyer.

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Buyer | Submits callback request, submits post-call feedback |
| Sales Manager | Receives request, schedules meeting, conducts call, records outcome |
| SM Admin | Can view all requests, manually reassign between SMs |
| System | Auto-assigns SM, generates Teams link, sends notifications, triggers VC_REQUEST offer |

---

## 3. Request Status Flow

```
REQUESTED → SCHEDULED → CONFIRMED → COMPLETED
                  ↘ RESCHEDULED (if time changes) → CONFIRMED → COMPLETED
```

---

## 4. VC Outcome Options (SM selects after call)

| Code | Meaning | Triggers VC_REQUEST Offer? |
|------|---------|--------------------------|
| VC_DONE_PREFERENCE | VC done — buyer expressed unit interest | Yes |
| VC_DONE_NO_PREFERENCE | VC done — no unit preference | No |
| FUTURE_SCHEDULED | Future meeting scheduled | No |
| FUTURE_RESCHEDULED | Future meeting rescheduled | No |
| MISSED_SCHEDULED_NC | Buyer missed the call | No |
| NOT_INTERESTED_LOST | Lead lost — buyer not interested | No |
| NEVER_CONNECTED | SM could not reach buyer | No |
| TL_LOST | Team lead determined lead is lost | No |
| VC_2_DONE | Second VC completed | Yes |
| CP_TO_DRIVE_PREFERENCE | CP is managing buyer's preference | No |

---

## 5. End-to-End Flow

1. Buyer clicks "Request Callback" in Buyer Portal
2. Buyer fills request: preferred time, optional description
3. System creates CallbackRequest (status = REQUESTED)
4. **System auto-assigns SM via round-robin** — SM with earliest `lastRequestAssignedAt` and `isAvailable = true` gets the request
5. SM sees new request in their SM Portal callback list
6. SM opens request, clicks **Schedule Meeting**, picks date/time
7. **Microsoft Teams meeting link auto-generated**; meeting invite sent to buyer and SM (with CC emails if specified)
8. Status → SCHEDULED; buyer notified via Kaleyra
9. SM optionally confirms the meeting → status → CONFIRMED
10. SM conducts the video call
11. SM clicks **Record Outcome**, selects vcOutcome from 10 options
12. If outcome = `VC_DONE_PREFERENCE` or `VC_2_DONE` → **VC_REQUEST offer discount created for buyer automatically**
13. SM submits internal feedback → `isSmFeedbackSubmitted = true`
14. System sends buyer a unique token URL (no login required) for feedback submission
15. Buyer clicks link, submits their rating → `isBuyerFeedbackSubmitted = true`
16. Request status → COMPLETED; VC outcome synced to LeadSquared CRM

---

## 6. Key Business Rules

1. **Round-robin is automatic:** SM assignment requires no admin action. The SM with the longest time since their last assignment gets the next request.
2. **isAvailable gate:** SM must have `isAvailable = true` to receive new assignments. Admin controls this flag on the SM's account.
3. **Teams link is auto-generated:** SM does not need to manually create a Teams meeting — the system creates and shares it.
4. **COMPLETED is final:** Once a request reaches COMPLETED status, it cannot be modified.
5. **VC_REQUEST offer:** Only `VC_DONE_PREFERENCE` and `VC_2_DONE` trigger the discount. Other outcomes do not.
6. **Buyer feedback is token-based:** The unique feedback link works without the buyer being logged in — it uses a `buyerFeedbackToken` for authentication.
7. **Rescheduling preserves history:** Previous meeting details are stored in a JSON array; full history is preserved.
8. **Buyer can have multiple requests:** One per registration or general (no limit enforced).
9. **SM Admin sees all requests:** Standard SM sees only their own; SM Admin sees all.

---

## How to Use: Callback Request Workflow

---

### Buyer: Requesting a Callback

**Step 1:** In the Buyer Portal, click **Request Callback** or **Schedule VC** (location may vary — may appear as a floating button or in the navigation).

**Step 2:** Enter your preferred date and time for the call, and optionally describe what you'd like to discuss.

**Step 3:** Click **Submit**. A Sales Manager will be assigned automatically and will contact you to confirm the meeting.

**What happens next:** You will receive a notification when the meeting is confirmed, with the date, time, and a Microsoft Teams link for the video call.

---

### Buyer: Submitting Call Feedback

**Step 1:** After your call, you will receive an SMS or WhatsApp message with a feedback link.

**Step 2:** Click the link (no login required). Rate the call and add any comments.

**Step 3:** Click **Submit**. Your feedback is recorded.

> **The link is unique and expires.** Submit feedback promptly after receiving the message.

---

### SM: Handling a Callback Request

**Step 1:** Log into the SM Portal. Your callback requests list shows all requests assigned to you.

**Step 2:** Click a REQUESTED row to open the detail drawer. Review the customer's details and their preferred call time.

**Step 3:** Click **Schedule Meeting**. Pick a date/time. The system auto-generates a Microsoft Teams meeting link — no manual action needed. Add CC email addresses if other team members should join.

**Step 4:** Click **Schedule**. Status updates to SCHEDULED. The buyer is notified.

**Step 5 (optional):** Click **Confirm Meeting** to move status to CONFIRMED.

**Step 6:** Conduct the video call.

**Step 7:** After the call, click **Record Outcome** and select the result from the 10 options.

> **If you select "VC Done with Preference":** A discount offer is automatically applied to the buyer's unit purchase. No manual action needed.

**Step 8:** Submit your internal feedback. The system sends the buyer a feedback link automatically.

---

## 7. Related Documents

- [[Callback-Request-Workflow]] — Technical workflow reference
- [[Feature-Spec - Callback Requests]] — SM Portal Feature-Spec
- [[Feature-Spec - Callback Request]] — Buyer Portal Feature-Spec
- [[BRD-SM-Portal]] — SM Portal module overview
- [[BRD-Offers]] — VC_REQUEST offer that may be triggered by this workflow
