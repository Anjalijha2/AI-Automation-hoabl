# SM Portal — Callback Requests User Guide

**Audience:** Sales Manager (role 5) / Sales Manager Admin (role 4)
**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager/callback-requests`
**Sources:** SM-BRD-SM-Portal.md · SM-FRD-SM-Portal.md · SM-FS-Callback-Requests.md
**Last Updated:** 2026-05-22

---

## Overview

The Callback Requests page is the default landing page for the SM Portal and the primary daily workspace for the sales team. It surfaces every customer-initiated callback / video-call request along with a KPI summary at the top, a searchable and filterable data table, and per-row actions to schedule a meeting, generate a Teams link, record the outcome of a video call, and collect feedback from the buyer.

Callback requests are auto-assigned to SMs in round-robin order based on `lastRequestAssignedAt` (the SM who was assigned least recently gets the next request). A Sales Manager Admin (role 4) can view all requests system-wide and can manually reassign a request to a different SM; a Sales Manager (role 5) sees only the requests assigned to them.

Recording a `VC_DONE_PREFERENCE` outcome may trigger the `VC_REQUEST` offer code, applying a discount on the customer's unit purchase. The `vcOutcome` value also syncs to LeadSquared (LSQ) as an activity update.

---

## Page Layout (At a Glance)

1. **KPI dashboard** (top row) — Total Assigned, Completed, Pending / Scheduled, Conversion rate indicators.
2. **Controls bar** — Search input, Filter, Refresh, "New Callback Request" button.
3. **Callback table** — one row per request; columns include Customer Name, Phone, Requested Date/Time, Status, Assigned SM, Meeting Link, VC Outcome, Actions.
4. **Sort and pagination** — column headers sortable; pagination at the bottom.
5. **Row click** — opens the right-side **View Detail** drawer with full request context and primary actions (Schedule Meeting, Confirm Meeting, Record Outcome).
6. **Bottom navigation** (mobile) — switches between Callback Requests, Towers, Physical Allocation.

---

# Feature 1 — KPI Dashboard

### What it does
Shows live aggregate metrics for the SM's workload (or the entire team, if signed in as Sales Manager Admin).

### Preconditions
- SM session is active.
- The page is the default landing route after login.

### How to use
1. Log in. The Callback Requests page loads automatically.
2. Read the KPI cards at the top:
   - **Total Requests Assigned** — every request currently in your assigned set (for SM Admin: all requests across all SMs).
   - **Completed Calls** — count of requests in `COMPLETED` status.
   - **Pending / Scheduled Calls** — count of requests in `REQUESTED`, `SCHEDULED`, `RESCHEDULED`, or `CONFIRMED`.
   - **Conversion Rate Indicators** — completed-to-assigned ratio and related sales conversion signals.

### Result
You have an at-a-glance picture of your callback workload, completion progress, and pending volume.

### Note
KPI totals reflect the current role context — Sales Manager sees their own counts only; Sales Manager Admin sees system-wide totals.

---

# Feature 2 — Callback Requests Table

### What it does
Lists every callback / video-call request in scope for the logged-in user, one row per request.

### Preconditions
- SM session active.

### How to use
1. Below the KPI cards, the table loads automatically.
2. Each row shows:
   - **Customer Name** — buyer who submitted the request.
   - **Phone Number** — buyer's registered mobile.
   - **Requested Date / Time** — buyer's preferred call slot.
   - **Status** — one of `REQUESTED`, `SCHEDULED`, `RESCHEDULED`, `CONFIRMED`, `COMPLETED`.
   - **Assigned SM** — the SM responsible for the request.
   - **Meeting Link** — Microsoft Teams URL (only after Schedule with Teams link generation).
   - **VC Outcome** — outcome recorded after the call (one of 10 codes; blank until recorded).
3. Click any row to open the right-side detail drawer (see Feature 9).

### Result
You can scan all requests in scope and identify which ones require action by status.

### Status reference
| Status | Meaning |
|--------|---------|
| `REQUESTED` | Buyer submitted the callback request; not yet scheduled |
| `SCHEDULED` | SM picked a date/time slot |
| `RESCHEDULED` | Time slot changed after initial scheduling |
| `CONFIRMED` | Both parties confirmed the meeting |
| `COMPLETED` | Call took place; VC outcome + feedback recorded |

### Warning
Once a request reaches `COMPLETED`, it cannot be modified or reopened.

---

# Feature 3 — Filters and Search

### What it does
Narrows the table to subsets matching a status, an assigned SM (SM Admin only), a date range, or a free-text query against customer name / phone / request ID.

### Preconditions
- Table has loaded.

### How to use
1. **Search:** type into the Search input above the table — filters by customer name, phone, or request ID as you type.
2. **Filter:** click the **Filter** button to open the filter panel and pick one or more of:
   - Status — `REQUESTED` / `SCHEDULED` / `RESCHEDULED` / `CONFIRMED` / `COMPLETED`.
   - Assigned SM (SM Admin only) — pick an SM from the dropdown.
   - Date range — filter by requested date.
3. Click **Apply** to narrow the table; click **Reset Filters** to clear all.

### Result
Only rows matching the active filters / search remain visible. Sorting and pagination continue to operate on the filtered subset.

### Note
KPI cards above the table reflect the full assigned set and do **not** recompute on filter — they show the underlying workload regardless of the visible filter.

---

# Feature 4 — Sort and Pagination

### What it does
Lets you reorder the table by column and move between pages.

### Preconditions
- Table has loaded.

### How to use
1. **Sort:** click any sortable column header (Customer Name, Requested Date/Time, Status, VC Outcome) to toggle ascending / descending.
2. **Pagination:**
   - Scroll to the bottom of the table.
   - Change page size via the dropdown (typically 10 / 20 / 50 / 100 per page).
   - Use page numbers or Previous / Next arrows to navigate.

### Result
You can browse large datasets efficiently and sort by the most operationally relevant column.

---

# Feature 5 — Assign / Reassign Request to SM (Sales Manager Admin only)

### What it does
Allows a Sales Manager Admin to manually reassign a callback request from one SM to another, overriding the round-robin assignment.

### Preconditions
- Logged-in user has role ID 4 (Sales Manager Admin).
- Target SM has `isAvailable = true`.

### How to use
1. Open the request from the table by clicking the row.
2. In the detail drawer, locate the **Assigned SM** field.
3. Click the SM name / change icon to open a dropdown of available SMs.
4. Select the target SM and confirm.

### Result
- `assignedTo` on the request is updated to the new SM's user ID.
- `lastRequestAssignedAt` is touched on the new SM's record.
- The request appears in the new SM's queue immediately.
- The previous SM's queue count decreases.

### Notes
- Round-robin auto-assignment uses `lastRequestAssignedAt` — manual reassignment updates this timestamp so the new SM is treated as "most recently assigned" for the round-robin order.
- A Sales Manager (role 5) does not see this control — reassignment is restricted to SM Admin.

---

# Feature 6 — Schedule Meeting (with optional Teams link)

### What it does
Confirms a date and time for the callback / VC and optionally auto-generates a Microsoft Teams meeting link. Adds optional CC email addresses to the meeting invite.

### Preconditions
- Request status = `REQUESTED` (or `SCHEDULED` / `RESCHEDULED` for a reschedule action).
- SM is assigned to the request.

### How to use
1. Open the request — the detail drawer slides in from the right.
2. Click **Schedule Meeting**. The `ScheduleMeetingModal` opens.
3. Fill in:
   - **Date** (required) — meeting date.
   - **Time** (required) — meeting time slot.
   - **Generate Teams Link** (optional toggle) — when ON, Microsoft Teams API creates the meeting and stores both `meetingLink` and `teamsMeetingId`.
   - **CC Email Addresses** (optional) — additional email recipients for the calendar invite.
4. Click **Schedule** to save.

### Result
- Status transitions from `REQUESTED` to `SCHEDULED`.
- If Teams link was requested: the Meeting Link column in the table now shows the Teams URL.
- The customer may be notified of the confirmed time slot.
- Previous meeting details (on reschedule) are preserved in the `previousMeetings` JSON array.

### Validations
- Date and time are both required — the **Schedule** button stays disabled until both are filled.
- Teams link generation is fully optional — the meeting can be scheduled without one.

### Warning
Re-scheduling an already-scheduled call uses the same modal but the resulting status is `RESCHEDULED` (not `SCHEDULED`). The original `meetingLink` and metadata are appended to `previousMeetings`.

---

# Feature 7 — Confirm Meeting

### What it does
Marks a scheduled or rescheduled meeting as confirmed by both parties before the call takes place.

### Preconditions
- Request status = `SCHEDULED` or `RESCHEDULED`.

### How to use
1. Open the `SCHEDULED` / `RESCHEDULED` request.
2. In the detail drawer, click **Confirm Meeting**. The `ConfirmMeetingModal` opens.
3. Click **Confirm** to proceed.

### Result
- Status moves to `CONFIRMED`.
- The request remains active until the call is held and outcome recorded.

### Note
This step is **optional** — calls can proceed directly from `SCHEDULED` / `RESCHEDULED` to `COMPLETED` (via Record Outcome) without ever passing through `CONFIRMED`.

---

# Feature 8 — Record VC Outcome and Submit SM Feedback

### What it does
After the call is held, the SM records the outcome of the video call and submits internal feedback. Recording the outcome triggers a buyer-feedback token URL to be sent to the customer via Kaleyra SMS / WhatsApp, and syncs the outcome to LeadSquared.

### Preconditions
- Meeting has taken place.
- Request is not already `COMPLETED`.

### How to use
1. Open the request from the table.
2. In the detail drawer, click **Record Outcome**. The `FeedbackDrawer` opens.
3. Select a **VC Outcome** (required) — one of 10 codes:

| Code | Label |
|------|-------|
| `VC_DONE_PREFERENCE` | VC Done with Preference (customer showed unit interest) |
| `VC_DONE_NO_PREFERENCE` | VC Done, No Preference |
| `FUTURE_SCHEDULED` | Future meeting scheduled |
| `FUTURE_RESCHEDULED` | Future meeting rescheduled |
| `MISSED_SCHEDULED_NC` | Missed Scheduled (No Connect) |
| `NOT_INTERESTED_LOST` | Not Interested, Lead Lost |
| `NEVER_CONNECTED` | Never Connected |
| `TL_LOST` | Team Lead Lost |
| `VC_2_DONE` | Second VC completed |
| `CP_TO_DRIVE_PREFERENCE` | CP will drive the preference selection |

4. (Optional) Use the **UnitPrefSelector** to link a unit preference to the feedback (relevant for `VC_DONE_PREFERENCE`).
5. Add internal feedback notes.
6. Click **Submit**.

### Result
- `vcOutcome` saved on the request and synced to LeadSquared via activity update.
- `isSmFeedbackSubmitted = true`.
- A unique `buyerFeedbackToken` URL is generated and sent to the buyer via Kaleyra SMS / WhatsApp.
- If the outcome is `VC_DONE_PREFERENCE`: the `VC_REQUEST` offer code may be applied to the customer's `RegistrationUnitOffer`, giving a discount on the unit purchase.

### Validations
- `vcOutcome` is required — the **Submit** button stays disabled until an outcome is selected.

### Important — when the request becomes COMPLETED
Both `isSmFeedbackSubmitted` and `isBuyerFeedbackSubmitted` must be `true` for the request to fully transition to `COMPLETED`. SM submission alone does not complete the request — the buyer must submit feedback via the token URL.

---

# Feature 9 — Buyer Feedback (Token URL — out-of-portal)

### What it does
After the SM submits VC outcome and feedback, the buyer receives a tokenised feedback URL via SMS / WhatsApp and submits their rating without needing to log in.

### Preconditions
- SM has submitted feedback (Feature 8) — token URL is dispatched at that moment.

### Flow
1. Buyer receives a Kaleyra SMS / WhatsApp message containing the unique feedback URL.
2. Buyer clicks the link — opens the feedback form (no portal login required; the token authenticates the session).
3. Buyer rates the call and submits.
4. `isBuyerFeedbackSubmitted = true`.
5. With both flags now true, the request status transitions to `COMPLETED`.

### Note
This sub-flow happens outside the SM Portal. SMs can monitor completion by watching the request status change to `COMPLETED` in the table.

---

# Feature 10 — Create New Callback Request

### What it does
Allows an SM to create a callback request on behalf of a customer — e.g., after a walk-in inquiry or proactive outreach to an existing buyer.

### Preconditions
- Customer must be registered in the system.
- SM is logged in.

### How to use
1. Click the **New Callback Request** button (top of the table, near the filter controls). The `CreateCallbackRequestDrawer` opens.
2. Fill in:
   - **Customer** (required) — search and select the registered customer by name, phone, or registration number.
   - **Preferred Date** (required).
   - **Preferred Time** (required).
   - **Notes** (optional) — context for the callback.
3. Click **Create**.

### Result
- A new request is created with status `REQUESTED`.
- Round-robin assignment runs — the request may go to any available SM (not necessarily the creator).
- Customer may be notified of the request creation.

### Note
Because round-robin selects the SM with the earliest `lastRequestAssignedAt`, the SM who creates the request will not necessarily be the SM who handles it.

---

# Feature 11 — View Detail Drawer

### What it does
Opens a right-side drawer containing the full context of a callback request and the primary action buttons (Schedule, Confirm, Record Outcome, Reassign).

### Preconditions
- Click any row in the table.

### How to use
1. Click anywhere on a row.
2. The drawer slides in from the right with:
   - Customer block — name, phone, registration number.
   - Request block — requested date / time, current status, assigned SM, created date.
   - Meeting block — meeting link (if Teams generated), CC emails, previous meeting history (`previousMeetings`).
   - Feedback block — vcOutcome (if recorded), SM feedback notes, buyer feedback status.
   - Action buttons — Schedule Meeting, Confirm Meeting, Record Outcome, Reassign (SM Admin only).
3. Use the close icon (top-right of drawer) or click outside to dismiss.

### Result
You see everything about the request in one place and can launch any next action without leaving the table.

---

# Feature 12 — Role Differences (Sales Manager vs Sales Manager Admin)

| Capability | Sales Manager (role 5) | Sales Manager Admin (role 4) |
|------------|------------------------|------------------------------|
| View own assigned requests | Yes | Yes |
| View all system-wide requests | No | Yes |
| KPI scope | Own counts only | System-wide counts |
| Filter by Assigned SM | No (only sees own) | Yes |
| Schedule meeting | Own requests | Any request |
| Confirm meeting | Own requests | Any request |
| Record VC outcome | Own requests | Any request |
| Create new callback request | Yes | Yes |
| Manually reassign a request | No | Yes |
| Receive auto-assignments | Yes (when `isAvailable = true`) | Yes (when `isAvailable = true`) |

### Note on `isAvailable`
The `isAvailable` flag on an SM record controls whether they are eligible to receive new round-robin assignments. This flag is controlled by Admin (in the Admin Portal SM management area), not by the SM themselves. SMs with `isAvailable = false` continue to see and action their existing requests but receive no new assignments.

---

## Field Reference — Quick Lookup

### Status transitions
| From | Action | To |
|------|--------|-----|
| `REQUESTED` | Schedule Meeting | `SCHEDULED` |
| `SCHEDULED` | Confirm Meeting | `CONFIRMED` |
| `SCHEDULED` | Re-schedule | `RESCHEDULED` |
| `RESCHEDULED` | Confirm Meeting | `CONFIRMED` |
| `SCHEDULED` / `RESCHEDULED` / `CONFIRMED` | Record Outcome + SM feedback + buyer feedback | `COMPLETED` |
| `COMPLETED` | — | (terminal — no further changes) |

### vcOutcome → side effect
| Outcome | Side effect |
|---------|-------------|
| `VC_DONE_PREFERENCE` | May trigger `VC_REQUEST` offer (unit purchase discount); creates `RegistrationUnitOffer` row |
| All outcomes | Synced to LeadSquared as activity update |
| All outcomes | Buyer feedback token URL dispatched via Kaleyra SMS / WhatsApp |

### Notifications dispatched
| Action | Buyer notification |
|--------|--------------------|
| Schedule Meeting (with Teams link) | Calendar invite to buyer email and CC emails |
| Confirm Meeting | None (internal status change only) |
| Record VC Outcome / Submit SM feedback | Kaleyra SMS + WhatsApp with buyer feedback token URL |
| Create new callback request | Customer may be notified of request creation |
| Manual reassignment | None (internal admin action) |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **Schedule** button disabled in modal | Date or time empty | Fill both required fields |
| **Submit** button disabled in feedback drawer | `vcOutcome` not selected | Pick one of the 10 outcomes |
| Request status still `SCHEDULED` after SM submits feedback | Buyer has not submitted feedback yet (only `isSmFeedbackSubmitted` is true) | Wait for buyer to click their token URL and submit — request will then auto-transition to `COMPLETED` |
| New callback request not appearing in your queue | Round-robin assigned it to another SM | Use SM Admin to reassign, or wait for next assignment cycle |
| You are not receiving new auto-assignments | `isAvailable = false` on your SM record | Contact admin to flip `isAvailable` to true |
| Teams link not generated | "Generate Teams Link" toggle was OFF in the modal | Reschedule with the toggle ON, or share an external meeting link manually |
| Cannot edit a `COMPLETED` request | Completed status is terminal by design | Create a new callback request if further action is needed |
| Sales Manager tab shows no Reassign control | Reassignment is restricted to SM Admin (role 4) | Ask an SM Admin to reassign |
| Filter panel shows no Assigned SM dropdown | You are a Sales Manager (role 5) — you only see your own requests | No fix needed; SM Admin sees the dropdown |
| Discount didn't apply for a `VC_DONE_PREFERENCE` outcome | `VC_REQUEST` offer may not be configured / eligible for the customer's project | Verify offer setup in Admin Portal → Offers; check `RegistrationUnitOffer` |
