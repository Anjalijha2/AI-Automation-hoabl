# Test Cases — Callback Request
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Callback-Request.md

---

## Callback — Entry & Modal Open

### BYR_CB_001 — Request Callback button visible on portal

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Look for Request Callback button on dashboard / floating CTA |
| **Expected Result** | Button visible and clickable |
| **Priority** | High |

---

### BYR_CB_002 — Click Request Callback opens modal

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Button visible |
| **Test Steps** | 1. Click Request Callback |
| **Expected Result** | Modal/dialog opens with form fields |
| **Priority** | Critical |

---

### BYR_CB_003 — Modal title clearly identifies feature

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Inspect modal title |
| **Expected Result** | Title reads "Request Callback" or "Schedule VC" |
| **Priority** | Medium |

---

### BYR_CB_004 — Backdrop click does not accidentally submit

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Click backdrop outside modal |
| **Expected Result** | Modal either closes or stays — never submits |
| **Priority** | Medium |

---

## Callback — Form Fields

### BYR_CB_005 — Description field is optional

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Inspect Description field; check for required asterisk |
| **Expected Result** | No asterisk; field marked optional |
| **Priority** | Medium |

---

### BYR_CB_006 — Description supports multiline input

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Type a multi-line description |
| **Expected Result** | Textarea accepts newlines; height grows or scrolls |
| **Priority** | Low |

---

### BYR_CB_007 — Description character limit enforced

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Paste text exceeding 500 chars |
| **Expected Result** | Input capped at the configured limit; counter updates |
| **Priority** | Medium |

---

### BYR_CB_008 — Preferred date field present

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Inspect form |
| **Expected Result** | Date input visible with calendar icon |
| **Priority** | High |

---

### BYR_CB_009 — Click date opens calendar picker

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Date input visible |
| **Test Steps** | 1. Click date input |
| **Expected Result** | Calendar widget opens |
| **Priority** | High |

---

### BYR_CB_010 — Past dates greyed out / unselectable

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Calendar open |
| **Test Steps** | 1. Try selecting yesterday's date |
| **Expected Result** | Past dates disabled / not clickable |
| **Priority** | High |

---

### BYR_CB_011 — Today and future dates selectable

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Calendar open |
| **Test Steps** | 1. Click today<br>2. Click date 5 days ahead |
| **Expected Result** | Both selectable and highlight on click |
| **Priority** | High |

---

### BYR_CB_012 — Preferred time field present

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Inspect time input/picker |
| **Expected Result** | Time picker (hour:minute) visible |
| **Priority** | High |

---

### BYR_CB_013 — Time picker selects hour and minute

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Time picker open |
| **Test Steps** | 1. Select hour 14<br>2. Select minute 30 |
| **Expected Result** | Both values reflected in input as "14:30" or similar format |
| **Priority** | High |

---

## Callback — Submission

### BYR_CB_014 — Submit button visible

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Inspect Submit button |
| **Expected Result** | Submit CTA rendered at bottom of modal |
| **Priority** | High |

---

### BYR_CB_015 — Submit with all fields blank still succeeds (per FS — all optional)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open, no fields filled |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Request submitted per spec (all fields are optional in BUYER-FS-Callback-Request §1.4) |
| **Priority** | Medium |

---

### BYR_CB_016 — Submit with all fields filled succeeds

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal with description, date and time entered |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Modal closes; success toast/banner shown; request created with status REQUESTED |
| **Priority** | Critical |

---

### BYR_CB_017 — Request linked to current registration

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submission complete |
| **Test Steps** | 1. Inspect backend record |
| **Expected Result** | CallbackRequest row created and tied to buyer's registrationId |
| **Priority** | High |

---

### BYR_CB_018 — Round-robin assigns to available SM

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submission complete, at least one SM with `isAvailable = true` |
| **Test Steps** | 1. Verify SM assignment |
| **Expected Result** | Request assigned to SM with earliest `lastRequestAssignedAt`; that SM's `lastRequestAssignedAt` updated |
| **Priority** | Critical |

---

### BYR_CB_019 — Request shows status REQUESTED initially

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submission complete |
| **Test Steps** | 1. Inspect request status |
| **Expected Result** | Status = REQUESTED |
| **Priority** | High |

---

### BYR_CB_020 — Buyer notified when SM schedules the meeting

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | SM schedules call on SM Portal |
| **Test Steps** | 1. Check buyer notification channel (SMS/WhatsApp/in-app) |
| **Expected Result** | Notification received with scheduled time |
| **Priority** | High |

---

## Callback — Cancel / Close

### BYR_CB_021 — X (close icon) closes modal without submitting

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open with some data entered |
| **Test Steps** | 1. Click X |
| **Expected Result** | Modal closes; no API call; no record created |
| **Priority** | High |

---

### BYR_CB_022 — Cancel button (if present) closes without submit

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open with some data |
| **Test Steps** | 1. Click Cancel |
| **Expected Result** | Modal closes; no submission |
| **Priority** | Medium |

---

### BYR_CB_023 — ESC key closes modal

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Test Steps** | 1. Press ESC |
| **Expected Result** | Modal closes |
| **Priority** | Low |

---

## Callback — Feedback Flow (Token-Based)

### BYR_CB_024 — Feedback URL accessible without login

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | SM completed call and submitted feedback; buyerFeedbackToken generated |
| **Test Steps** | 1. Open `/call-feedback/<token>` in a fresh browser (no session) |
| **Expected Result** | Feedback page renders without requiring login |
| **Priority** | Critical |

---

### BYR_CB_025 — Feedback URL with invalid token shows error

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Random/invalid token |
| **Test Steps** | 1. Open `/call-feedback/<bad-token>` |
| **Expected Result** | "Invalid or expired link" message; no form rendered |
| **Priority** | High |

---

### BYR_CB_026 — Feedback URL token cannot be reused

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback already submitted with token |
| **Test Steps** | 1. Reopen same token URL |
| **Expected Result** | Token marked used; "already submitted" message shown |
| **Priority** | High |

---

### BYR_CB_027 — Call rating field mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback page open |
| **Test Steps** | 1. Try Submit without rating |
| **Expected Result** | Validation error; submission blocked |
| **Priority** | Critical |

---

### BYR_CB_028 — Comments field optional

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback page open |
| **Test Steps** | 1. Submit with rating but no comments |
| **Expected Result** | Submission succeeds |
| **Priority** | Medium |

---

### BYR_CB_029 — Submission sets isBuyerFeedbackSubmitted = true

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback submitted |
| **Test Steps** | 1. Inspect backend flag |
| **Expected Result** | `isBuyerFeedbackSubmitted = true` persisted |
| **Priority** | High |

---

### BYR_CB_030 — Request reaches COMPLETED when both feedbacks submitted

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | SM feedback already complete + buyer feedback just submitted |
| **Test Steps** | 1. Verify request status |
| **Expected Result** | Status = COMPLETED |
| **Priority** | High |

---

## Callback — Negative & Edge Cases

### BYR_CB_031 — No SM available rejects request gracefully

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | All SMs have `isAvailable = false` |
| **Test Steps** | 1. Submit callback request |
| **Expected Result** | Either queued without assignment or error returned; buyer sees clear message |
| **Priority** | Medium |

---

### BYR_CB_032 — Modal data persists if user toggles browser tabs briefly

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal with partial data |
| **Test Steps** | 1. Switch tabs<br>2. Return |
| **Expected Result** | Modal still open with data intact |
| **Priority** | Low |

---
