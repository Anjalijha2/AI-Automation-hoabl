# BF-006 — Sales Manager Assignment Flow

**Type:** Business Flow
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

This document maps how callback requests are assigned to Sales Managers and how the subsequent video call (VC) flow — scheduling, outcome recording, and offer triggering — works end-to-end.

---

## 2. Actors

| Actor | Role |
|-------|------|
| Buyer | Submits callback request |
| System | Assigns request to SM via **least-loaded algorithm** (round-robin disabled) <!-- FSD-CORRECTION 2026-05-25 // Source: callback-request-sm.service.js:338-349 --> |
| Sales Manager | Schedules meeting, records VC outcome |
| Microsoft Teams | Auto-generates meeting link |
| Kaleyra | Sends WhatsApp/SMS notifications to buyer |

---

## 3. End-to-End Flow

```
Buyer
  │
  └─ Submits callback request in Buyer Portal
     (optional: specifies preferred time slot)

System
  │
  ├─ Finds all active, available SMs (isActive = true, isAvailable = true)
  ├─ Sorts by lastRequestAssignedAt ASC (oldest last assignment first)
  └─ Assigns to the SM at the top of the list
     Updates that SM's lastRequestAssignedAt = NOW()

CallbackRequest status → REQUESTED

SM (in SM Portal)
  │
  ├─ Sees request in their callback queue
  ├─ Clicks "Schedule Meeting"
  │   Selects date and time slot
  │
System
  │
  ├─ Creates Microsoft Teams meeting (auto-generated link)
  │   Stores: meetingLink, teamsMeetingId on CallbackRequest
  │
  └─ Sends WhatsApp to buyer: meeting scheduled with link and time

CallbackRequest status → SCHEDULED → CONFIRMED

SM conducts video call

SM (after call)
  │
  └─ Records VC outcome (one of 10 options):

     VC_DONE_PREFERENCE ──► triggers VC_REQUEST offer discount on buyer's unit
     VC_2_DONE          ──► triggers VC_REQUEST offer discount on buyer's unit
     NOT_PICKED         ──► no offer triggered
     BUSY               ──► no offer triggered
     CALL_LATER         ──► no offer triggered
     SWITCHED_OFF       ──► no offer triggered
     INVALID_NUMBER     ──► no offer triggered
     DISCONNECTED       ──► no offer triggered
     VC_NOT_DONE        ──► no offer triggered
     NOT_INTERESTED     ──► no offer triggered

CallbackRequest status → COMPLETED

System (if outcome = VC_DONE_PREFERENCE or VC_2_DONE)
  │
  └─ Creates RegistrationUnitOffer record for VC_REQUEST offer
     Offer discount reflected in buyer's Cost Sheet / FAV

System
  │
  └─ Sends buyer feedback link via SMS/WhatsApp
     Buyer can rate the experience via token-based URL
```

---

## 4. Round-Robin Assignment Rules

- Only SMs with `isActive = true` AND `isAvailable = true` are eligible
- SM Admin (role_id = 4) can be in the pool; standard SM (role_id = 5) also eligible
- Sorted by `lastRequestAssignedAt` ascending — SM with the oldest assignment gets the next request
- If no SMs are available: request queued or escalated (admin notified)
- SM cannot manually claim or reassign requests — only SM Admin can reassign

---

## 5. Teams Meeting Failure Handling

If Microsoft Teams link generation fails:
- Callback request is still created and assigned
- SM can manually create a Teams meeting as a fallback
- `meetingLink` remains null; buyer notified without a link

---

## 6. Rescheduling

```
SCHEDULED → RESCHEDULED (SM changes time) → SCHEDULED → CONFIRMED → COMPLETED
```

- SM can reschedule before the meeting time
- Each reschedule generates a new Teams meeting link
- Buyer notified of updated time via WhatsApp/SMS

---

## 7. Key Business Rules

| Rule | Detail |
|------|--------|
| Round-robin by lastRequestAssignedAt | Ensures fair distribution across all available SMs |
| Only 2 of 10 outcomes trigger offer | VC_DONE_PREFERENCE and VC_2_DONE only |
| Teams link is optional | SM can still conduct call without auto-generated link |
| Feedback token is single-use | Buyer feedback URL is token-based and expires after use |
| Outcome must be recorded | SM Portal requires outcome recording to mark request COMPLETED |

---

## 8. Related Documents

- [[Master-BRD/Workflows/BRD-Callback-Request-Workflow]] — Full callback workflow BRD
- [[Master-BRD/SM-Portal/BRD-SM-Portal]] — SM Portal overview
- [[Master-BRD/Integrations/BRD-Integrations]] — Microsoft Teams and Kaleyra integration
- [[Master-BRD/Business-Rules/BRD-Business-Rules]] — SM-001 through SM-005
- [[Portals/SM-Portal/Feature-Specs/Feature-Spec - Callback Requests]] — SM Portal feature spec
