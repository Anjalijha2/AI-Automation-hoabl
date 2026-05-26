# Feature-Spec: Callback Requests Management

**Portal:** Sales Manager Portal
**URL:** `https://uat-web.xrportal.in/sales-manager/callback-requests`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View Callback Requests

### 1.1 Objective

Allow Sales Managers to view all customer callback and video call requests assigned to them, including key details and current status.

### 1.2 Scope

Default landing page after SM login. SM Admin can see all requests system-wide; SM sees only their own assigned requests.

### 1.3 Preconditions

- SM must be logged in
- Requests are auto-assigned from the system when customers submit callback requests

### 1.4 Table Columns

| Column | Description |
|--------|-------------|
| Customer Name | Name of the buyer who submitted the request |
| Phone Number | Buyer's registered mobile |
| Requested Date/Time | When the buyer wants to be called |
| Status | Current request status (REQUESTED / SCHEDULED / RESCHEDULED / CONFIRMED / COMPLETED) |
| Assigned SM | Which SM is handling this request |
| Meeting Link | Microsoft Teams link (if generated) |
| VC Outcome | Outcome recorded after the call |

### 1.5 Request Status Values

| Status | Meaning |
|--------|---------|
| REQUESTED | Buyer submitted the callback request |
| SCHEDULED | SM confirmed a time slot |
| RESCHEDULED | Time slot changed after initial scheduling |
| CONFIRMED | Both parties confirmed the meeting |
| COMPLETED | Call took place and outcome recorded — **NOTE: COMPLETED state is effectively unreachable in current backend** <!-- FSD-CORRECTION 2026-05-25: service catches ENUM truncation and falls back to CONFIRMED at callback-request-sm.service.js:78-87 --> |

### 1.6 KPI Cards

The top of the screen shows aggregate metrics:
- Total requests assigned
- Completed calls count
- Pending/scheduled calls count
- Conversion rate indicators

### 1.7 Business Rules

1. SM sees only their own requests by default
2. SM Admin can view and reassign requests between SMs
3. Once COMPLETED, a request cannot be modified
4. <!-- FSD-CORRECTION 2026-05-25 --> Requests assigned via **least-loaded algorithm** (fewest active requests). Round-robin code is **disabled** at `callback-request-sm.service.js:338-349`. When SM Admin creates a request, `managerId` = their own ID (no auto-distribute). // Source: callback-request-sm.service.js:338-349
5. SM must have `isAvailable = true` to receive new assignments

### 1.8 Audit and Logging

- All status changes are timestamped
- VC outcome is synced to LeadSquared CRM

---

## How to Use: Viewing Callback Requests

**Who does this:** Sales Manager

---

**Step 1 — Log in and land on Callback Requests**

After logging in, you are taken directly to the Callback Requests screen. This is your main workspace.

**Step 2 — Review the KPI cards**

At the top, summary cards show how many total requests are assigned to you, how many are completed, and how many are still pending.

**Step 3 — Browse the requests table**

Each row shows a customer's name, phone, their preferred call time, the current status, and your meeting link if one was generated. Click any row to open the detail drawer for that request.

---

## Feature 2: Schedule a Meeting

### 2.1 Objective

Allow the SM to confirm a date and time for the customer callback or video call, optionally generating a Microsoft Teams meeting link automatically.

### 2.2 Preconditions

- Request must be in REQUESTED status
- SM must be assigned to the request

### 2.3 Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Date | Yes | Date of the meeting |
| Time | Yes | Time slot for the call |
| Generate Teams Link | No | Toggle to auto-create a Microsoft Teams meeting |
| CC Email Addresses | No | Additional email addresses to invite to the meeting |

### 2.4 Validations and Business Rules

1. Date and time are required — cannot schedule without specifying both
2. Teams link is optional — SM can schedule without generating one
3. CC email addresses can be added to the meeting invite
4. On scheduling, status changes from REQUESTED to SCHEDULED
5. Meeting link (if generated) is stored and displayed in the table

### 2.5 System Actions

1. `ScheduleMeetingModal` opens with date/time picker
2. If Teams link requested: Microsoft Teams API creates the meeting and stores the link
3. Status updated to SCHEDULED
4. Customer may be notified of the confirmed time slot

---

## How to Use: Scheduling a Meeting

**Who does this:** Sales Manager

---

**Step 1 — Open the request**

Click on a customer row in the Callback Requests table to open the detail drawer.

**Step 2 — Click "Schedule Meeting"**

The Schedule Meeting modal will open. Pick the date and time for the call.

**Step 3 — Optional: Generate a Teams meeting link**

Toggle the option to auto-create a Microsoft Teams meeting. The link will be generated and added to the request automatically.

**Step 4 — Add CC emails (optional)**

If other team members should be included, add their email addresses in the CC field.

**Step 5 — Confirm**

Click **Schedule** to save. The request status will update to **SCHEDULED** and the customer will see the confirmed time.

---

## Feature 3: Confirm a Meeting

### 3.1 Objective

Mark a scheduled meeting as confirmed by both parties before the call takes place.

### 3.2 Preconditions

- Request must be in SCHEDULED or RESCHEDULED status

### 3.3 Business Rules

1. Confirming moves the status from SCHEDULED to CONFIRMED
2. This step is optional — calls can proceed without explicit confirmation

---

## How to Use: Confirming a Meeting

**Who does this:** Sales Manager

---

**Step 1 — Open a SCHEDULED request**

Click the row to open the detail drawer.

**Step 2 — Click "Confirm Meeting"**

A confirmation modal will appear. Click **Confirm** to proceed.

The status updates to **CONFIRMED**, indicating both parties are aligned for the meeting.

---

## Feature 4: Record VC Outcome

### 4.1 Objective

After a call is completed, the SM records the outcome of the video call and submits their internal feedback.

### 4.2 Preconditions

- Meeting must have taken place
- Request must not already be in COMPLETED status

### 4.3 VC Outcome Options

| Code | Label |
|------|-------|
| VC_DONE_PREFERENCE | VC Done with Preference (customer showed unit interest) |
| VC_DONE_NO_PREFERENCE | VC Done, No Preference |
| FUTURE_SCHEDULED | Future meeting scheduled |
| FUTURE_RESCHEDULED | Future meeting rescheduled |
| MISSED_SCHEDULED_NC | Missed Scheduled (No Connect) |
| NOT_INTERESTED_LOST | Not Interested, Lead Lost |
| NEVER_CONNECTED | Never Connected |
| TL_LOST | Team Lead Lost |
| VC_2_DONE | Second VC completed |
| CP_TO_DRIVE_PREFERENCE | CP will drive the preference selection |

### 4.4 Validations and Business Rules

1. VC outcome selection is required before feedback can be submitted
2. Selecting `VC_DONE_PREFERENCE` may trigger the `VC_REQUEST` offer code for the customer (a unit purchase discount)
3. VC outcome syncs to LeadSquared CRM via activity update
4. After SM submits feedback, system sends a unique buyer feedback token URL to the customer via SMS/WhatsApp
5. Both `isSmFeedbackSubmitted` and `isBuyerFeedbackSubmitted` must be true for the request to be fully COMPLETED

### 4.5 System Actions

1. `FeedbackDrawer` opens with outcome selector and feedback form
2. SM selects vcOutcome, adds feedback text, and submits
3. Outcome is recorded and synced to LeadSquared
4. Buyer feedback token URL is generated and sent to the customer
5. `isSmFeedbackSubmitted = true` is set

---

## How to Use: Recording a VC Outcome

**Who does this:** Sales Manager, after completing a call

---

**Step 1 — Open the request**

Click the row for the call you just completed.

**Step 2 — Click "Record Outcome"**

The Feedback drawer will open.

**Step 3 — Select the VC Outcome**

Choose the outcome that best describes the call result from the 10 options (e.g., "VC Done with Preference" if the customer expressed unit interest).

**Step 4 — Submit feedback**

Add any internal notes and click **Submit**. Your feedback is recorded internally.

**Result:** The system automatically sends a feedback link to the customer so they can rate the call. Once the customer submits their feedback, the request moves to **COMPLETED** status.

> **Tip:** If you select "VC Done with Preference," the system may automatically apply a discount offer to the customer's unit purchase.

---

## Feature 5: Create New Callback Request

### 5.1 Objective

Allow an SM to create a callback request on behalf of a customer (e.g., after a walk-in inquiry).

### 5.2 Preconditions

- Customer must be registered in the system
- SM must be logged in

### 5.3 Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Customer | Yes | Search and select registered customer |
| Preferred Date | Yes | When the customer would like to be called |
| Preferred Time | Yes | Time slot preference |
| Notes | No | Additional context for the call |

### 5.4 Business Rules

1. The new request is created with status REQUESTED
2. Round-robin assignment applies — may be assigned to any available SM
3. Customer is notified of the request creation

---

## How to Use: Creating a New Callback Request

**Who does this:** Sales Manager, for walk-in customers or proactive outreach

---

**Step 1 — Click "New Callback Request"**

On the Callback Requests screen, click the button to create a new request.

**Step 2 — Find the customer**

Search for the customer by name, phone, or registration number and select them.

**Step 3 — Enter the preferred time**

Select the date and time when the customer wants to be contacted.

**Step 4 — Submit**

Click **Create**. The request is created with status **REQUESTED** and will be assigned to an available Sales Manager.
