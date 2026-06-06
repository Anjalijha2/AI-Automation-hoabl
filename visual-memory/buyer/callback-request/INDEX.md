# Visual Memory — Buyer Portal / Callback Request

**Captured:** 2026-06-04 (manual screenshots — modal on Home Dashboard); re-verified 2026-06-06 via `scripts/capture-buyer-portal-all.js`
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/home — modal overlay)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `callback-schedule-modal.png` | "Schedule a Call" modal — empty form, initial open | 2026-06-04 |
| `callback-reschedule-modal.png` | "Reschedule Call" modal — after first call was scheduled | 2026-06-04 |
| `screenshot-desktop.png` | Home dashboard (modal trigger context) — desktop baseline | 2026-06-06 |
| `callback-modal-verify-2026-06-06.png` | "Reschedule Call" modal — verification re-capture (header shows "Call Requested" state) | 2026-06-06 |

---

## Key Structural Notes

### Page / Route
- **Not a separate page.** Callback Request is a modal dialog triggered from the Home Dashboard.
- **Entry point:** `button` in top-right header, text "Schedule a Call"
- **URL stays:** `https://uat.xrportal.in/home` — no route change on modal open
- Requires authentication — Home page requires auth

### Important Discovery
```
There is NO /call-feedback or dedicated callback page.
The callback feature lives entirely as a modal on /home.
Standard sidebar does NOT show a "Callback" link.
```

### Schedule a Call Modal

**Trigger selector:**
```
button   filter({ hasText: /schedule a call/i })   — top-right of home page header
```

**Modal structure:**
```
modal title: "Schedule a Call"
  Preferred Date & Time*:
    input (datetime picker)   pre-filled: "04 Jun 2026, 17:00"
    calendar icon ▥ on right

  Comment (optional):
    textarea   placeholder="Any specific query or message for the callback..."
    char counter: "0 / 200"   (maxlength=200)

  Buttons:
    button "Cancel"          — grey/white, closes modal
    button "Submit Request"  — green, submits callback
```

**Key selectors:**
```
button   filter({ hasText: /schedule a call/i })         — trigger button
div[role="dialog"]                                        — modal wrapper
h4 (or modal-title)   text: "Schedule a Call"
input[type="text"]                                        — datetime picker
textarea                                                  — comment field
button   filter({ hasText: /submit request/i })          — submit
button   filter({ hasText: /cancel/i })                  — cancel
```

### Reschedule Call Modal (Post-Submission State)

**State trigger:**
- After submitting a call request, header button changes to "Call Requested" (orange/amber color)
- Clicking "Call Requested" opens the Reschedule modal

**Trigger selector:**
```
button   filter({ hasText: /call requested/i })   — top-right header (post-submit state)
```

**Reschedule modal structure:**
```
modal title: "Reschedule Call"
  Preferred Date & Time*: datetime picker (same as Schedule modal)
  Comment (optional): textarea (same, prefillable)

  Buttons:
    button "Cancel"
    button "Reschedule"   — green
```

**Key selectors:**
```
button   filter({ hasText: /call requested/i })         — trigger (post-submit)
h4 (or modal-title)   text: "Reschedule Call"
button   filter({ hasText: /reschedule/i })             — submit button
```

### Header Button State Machine
```
State 1 (no call scheduled):   button text = "Schedule a Call"   (white/default)
State 2 (call submitted):      button text = "Call Requested"    (orange/amber badge)
```

### Navigation Sidebar (Home page context)
```
Home (active) | Registration | Allotment | Homeloan | Project | Work Progress | Logout
```

### Test Account Context
```
User: ishaaaaan karnik  (8888888888)
Home page shows: "Welcome, ishaaaaan karnik" in header
Call Requested button visible when a callback has already been scheduled
```
