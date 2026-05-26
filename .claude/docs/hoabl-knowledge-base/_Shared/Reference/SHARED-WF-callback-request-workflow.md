---
type: workflow
tags: [workflow, callback, sales-manager, video-call, vc-outcome]
updated: 2026-05-10
status: complete
---

# Callback Request Workflow

**Related:** [[SM-Portal-BRD]] | [[Buyer-Portal-BRD]] | [[Roles-and-Permissions]] | [[Integrations]]

---

## 1. What Is This?

A Callback Request is a buyer-initiated request to speak with a Sales Manager via a scheduled video call. The flow moves from buyer request → SM assignment → scheduling → call → outcome recording. Certain outcomes automatically trigger a discount offer for the buyer.

---

## 2. Data Model — CallbackRequest

| Field | Type | Description |
|-------|------|-------------|
| `userId` | FK | The buyer who made the request |
| `registrationId` | FK | Linked registration (optional — buyer may not yet be registered) |
| `managerId` | FK | Assigned Sales Manager |
| `requestedAt` | DATE | When the buyer requested the call |
| `description` | STRING(750) | Buyer's note or query |
| `status` | ENUM | Current state of the request — see status flow |
| `vcOutcome` | ENUM | SM's recorded outcome after the call |
| `meetingLink` | STRING(1000) | Microsoft Teams meeting URL (auto-generated) |
| `teamsMeetingId` | STRING(500) | Teams meeting ID |
| `isSmFeedbackSubmitted` | BOOLEAN | Whether SM has submitted their post-call feedback |
| `isBuyerFeedbackSubmitted` | BOOLEAN | Whether buyer has submitted post-call feedback |
| `ccEmails` | JSON | Additional email addresses CC'd on meeting invite |
| `previousMeetings` | JSON | History of rescheduled meeting details |
| `buyerFeedbackToken` | STRING(100) | Token for buyer feedback link (unauthenticated access) |

---

## 3. Status Flow

```
REQUESTED
  → SCHEDULED   (SM confirms a time slot)
  → RESCHEDULED (time changed after initial scheduling)
  → CONFIRMED   (both parties confirmed)
  → COMPLETED   (call done, outcome recorded)
```

---

## 4. VC Outcome Values (10 options)

SM records one of these outcomes after completing a call:

| Outcome Code | Meaning |
|-------------|---------|
| `VC_DONE_PREFERENCE` | Video call done — buyer expressed unit preference |
| `VC_DONE_NO_PREFERENCE` | Video call done — buyer has no preference yet |
| `FUTURE_SCHEDULED` | Call scheduled for a future date |
| `FUTURE_RESCHEDULED` | Call rescheduled to a future date |
| `MISSED_SCHEDULED_NC` | Buyer missed the scheduled call, no contact |
| `NOT_INTERESTED_LOST` | Buyer explicitly not interested — mark as lost |
| `NEVER_CONNECTED` | SM was never able to reach the buyer |
| `TL_LOST` | Team Lead determined the lead is lost |
| `VC_2_DONE` | Second video call completed |
| `CP_TO_DRIVE_PREFERENCE` | CP is driving the buyer's unit preference |

---

## 5. VC_REQUEST Offer Trigger

When `vcOutcome = 'VC_DONE_PREFERENCE'` or `'VC_2_DONE'`, the system automatically creates a `VC_REQUEST` offer discount for that buyer. This offer appears as a line-item discount during their unit selection in allocation.

This is the key business incentive: buyers who complete a video call with an SM and express a unit preference receive a discount as a reward.

---

## 6. Step-by-Step Flow

1. Buyer clicks "Request Callback" in Buyer Portal
2. Buyer selects preferred time slot and optionally adds a description
3. System creates `CallbackRequest` with status `REQUESTED`
4. System auto-assigns an available SM via **least-loaded algorithm** (round-robin disabled) <!-- FSD-CORRECTION 2026-05-25 // Source: callback-request-sm.service.js:338-349 -->
5. SM receives notification in SM Portal
6. SM confirms the time slot → status: `SCHEDULED`
7. System auto-generates a Microsoft Teams meeting link via Teams API
8. Meeting invite sent to buyer and SM (CC emails included if specified)
9. SM conducts the video call
10. SM records `vcOutcome` in SM Portal
11. If outcome triggers VC_REQUEST offer → discount created for buyer automatically
12. SM submits post-call feedback → `isSmFeedbackSubmitted: true`
13. Buyer optionally submits feedback via tokenized link → `isBuyerFeedbackSubmitted: true`
14. Request status → `COMPLETED`

---

## 7. Rescheduling

- Either party can request a reschedule
- Previous meeting details stored in `previousMeetings` JSON array (full history)
- Status moves to `RESCHEDULED`
- New Teams link generated for the new time slot

---

## 8. SM Portal View

- Standard SM (roleId=5): sees only their own assigned callback requests
- SM Admin (roleId=4): sees all callback requests across all SMs
- KPI dashboard shows: requests today, scheduled today, completed today, pending

---

## 9. Business Rules

1. SM assignment is automatic (least-loaded, NOT round-robin) <!-- FSD-CORRECTION 2026-05-25 // Source: callback-request-sm.service.js:338-349 --> — admin can reassign manually.
2. Teams meeting link is auto-generated on scheduling — not manual.
3. `VC_DONE_PREFERENCE` and `VC_2_DONE` are the only outcomes that trigger the VC_REQUEST offer discount.
4. Buyer feedback link uses a token (`buyerFeedbackToken`) — no login required for buyer to submit feedback.
5. Soft deletes apply to callback requests (`paranoid: true`).
6. A buyer can have multiple callback requests (one per registration or general).

---

## 10. Integration Points

| System | Role |
|--------|------|
| Microsoft Teams | Meeting link auto-generated on scheduling |
| Kaleyra (SMS/WhatsApp) | Notifications to buyer and SM at each status change |
| Offers Module | VC_REQUEST offer created on qualifying outcomes |
| LeadSquared (CRM) | Callback activity synced to buyer lead record |
| SM Portal | SM manages and records outcome |
| Buyer Portal | Buyer requests callback and submits feedback |
