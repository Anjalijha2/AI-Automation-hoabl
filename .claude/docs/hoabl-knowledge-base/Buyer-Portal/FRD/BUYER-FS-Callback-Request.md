# Feature-Spec: Callback Request

**Portal:** Buyer Portal
**URLs:** `/call-feedback`, `/call-feedback/:code`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Request a Callback or Video Call

### 1.1 Objective

Allow buyers to request a callback or schedule a video call with a Sales Manager directly from the portal.

### 1.2 Scope

Buyer-side request submission. Once submitted, the request is handled by the SM Portal workflow (least-loaded SM assignment → scheduling → call completion → feedback). <!-- FSD-CORRECTION 2026-05-25: round-robin disabled // Source: callback-request-sm.service.js:338-349 -->

### 1.3 Preconditions

- Buyer must be logged in

### 1.4 Callback Request Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Request description | No | Reason for the call or topic the buyer wants to discuss |
| Preferred date | No | When the buyer would like to be called |
| Preferred time | No | Preferred time slot |

### 1.5 Business Rules

1. Request is linked to the buyer's registration
2. <!-- FSD-CORRECTION 2026-05-25 --> System assigns via **least-loaded algorithm** (SM with fewest active requests). Round-robin code is **disabled** at `callback-request-sm.service.js:338-349`. // Source: callback-request-sm.service.js:338-349
3. SM must have `isAvailable = true` to receive assignments
4. Request starts with status REQUESTED
5. Buyer receives a notification when the SM schedules the meeting

---

## How to Use: Requesting a Callback

**Who does this:** Buyer, when they want to speak with a Sales Manager

---

**Step 1 — Click "Request Callback" or "Schedule VC"**

Look for the callback request button on the portal. It may appear as a floating button, a nav item, or on the Home Dashboard.

**Step 2 — Fill in your request**

Optionally describe what you'd like to discuss and enter your preferred date and time for the call.

**Step 3 — Submit**

Click **Submit**. The system will assign your request to an available Sales Manager. You will receive a notification once a time has been confirmed.

---

## Feature 2: Submit Call Feedback

### 2.1 Objective

Allow buyers to submit feedback after a completed call with their Sales Manager using a unique token-based feedback link (no login required).

### 2.2 Scope

Feedback is submitted via a unique URL sent to the buyer by SMS/WhatsApp after the SM records the call outcome. The buyer does not need to be logged in to submit feedback.

### 2.3 Preconditions

- SM must have completed the call and submitted their own feedback
- System must have generated a `buyerFeedbackToken` and sent it to the buyer's mobile

### 2.4 Feedback Form

| Field | Required | Description |
|-------|----------|-------------|
| Call rating | Yes | Rating of the call experience |
| Comments | No | Open feedback text |

### 2.5 Business Rules

1. Feedback URL is token-authenticated (`/call-feedback/:code`) — no login required
2. Token is unique per callback request — cannot be reused
3. Once buyer submits, `isBuyerFeedbackSubmitted = true` is set
4. Both SM and buyer feedback must be complete for the request to reach COMPLETED status

---

## How to Use: Submitting Call Feedback

**Who does this:** Buyer, after receiving a feedback request via SMS/WhatsApp

---

**Step 1 — Open the feedback link**

After your call with the Sales Manager, you will receive an SMS or WhatsApp message with a link. Click or tap the link — no login is required.

**Step 2 — Rate the call**

Select your rating for the call experience.

**Step 3 — Add comments (optional)**

If you have any additional feedback, type it in the comments box.

**Step 4 — Submit**

Click **Submit**. Your feedback has been recorded. The Sales Manager's team will use this to improve their service.

> **The link expires** — please submit your feedback promptly after receiving the message.
