# Visual Memory — CP Portal / JBP Submission

**Captured:** 2026-06-05 (UPDATED — cycle is now OPEN in UAT; full form + tabs captured with fresh session)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/jbp)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | JBP Dashboard — Closed Cycle (May 2026, "Cycle has Closed") — historical baseline | 2026-06-03 |
| `jbp-loaded.png` | JBP Dashboard fully loaded — current cycle "Automation JBP" June 2026 ACTIVE, "Your Status: Not Submitted" with "Add New JBP Entry" button | 2026-06-05 |
| `jbp-current-cycle-tab.png` | "Current Cycle Entry" tab active — content shows "No submission for current cycle" + "Add New JBP Entry" button (since cycle is OPEN and CP has not yet submitted) | 2026-06-05 |
| `jbp-open-cycle-form.png` | JBP submission form revealed after clicking "Add New JBP Entry" — 44 input fields total (Brokerage select + text inputs + checkboxes + radio groups + Enter Count text input). Heading "JBP Form - Automation JBP" | 2026-06-05 |
| `jbp-form-validation.png` | After clicking Submit with empty form — captures validation state | 2026-06-05 |
| `jbp-form-filled.png` | Form populated with test data via JS injection (DOM-level input value events fired, NOT actually submitted) | 2026-06-05 |
| `jbp-history-tab.png` | "JBP History" tab — captures 8 past-submission rows | 2026-06-05 |
| `jbp-edit-requests-tab.png` | "Edit Requests" tab — captures empty state (0 rows; no past edit requests for this CP) | 2026-06-05 |

---

## JBP Cycle State (as of 2026-06-05)

**OPEN.** Active cycle:
- Cycle Name: `Automation JBP`
- Period: `June 2026`
- Status badge: `ACTIVE` (green/orange pill, replaces the "CLOSED" red pill from prior captures)
- Closes on: `30th June 2026`
- CP's status: `Not Submitted`

This is a different cycle than the 2026-06-03 baseline (which was "test JBP / May 2026 / CLOSED").

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/jbp`
- Requires authentication

### Page Heading
```
h2: "JBP Dashboard"
h4: "Current Cycle - Automation JBP"
```

### Current Cycle Card
```
heading: "Current Cycle - [cycleName]"   e.g., "Current Cycle - Automation JBP"
date pill: "[Month Year]"   e.g., "June 2026"
status badge: "ACTIVE" (when open) | "CLOSED" (when closed)
text: "Closes on: [date]"   e.g., "Closes on: 30th June 2026"
text: "Your Status: [status]"
  Values: Not Submitted | Submitted | Approved | Rejected
```

### Tabs (verified)
```
"Current Cycle Entry"   — default active
"JBP History"
"Edit Requests"
```

Each tab text appears twice in DOM (mobile + desktop responsive copies).

**Key selectors:**
```
.ant-tabs-tab :has-text("Current Cycle Entry")
.ant-tabs-tab :has-text("JBP History")
.ant-tabs-tab :has-text("Edit Requests")
```

### Current Cycle Entry Tab — Empty State (cycle OPEN, no submission yet)
```
text: "No submission for current cycle"
button: "Add New JBP Entry"   — primary CTA, opens form on click
```

### Current Cycle Entry Tab — Form (post "Add New JBP Entry")

Page navigates/reveals the JBP submission form (inline, NOT in a modal — `modalPresent=false` per DOM inspect). URL stays at `/jbp`.

**Heading:** `h2: "JBP Form - Automation JBP"`

**Form fields (44 inputs total, observed via DOM dump — see `_jbp-form-inspect.json`):**
- 1 × ant-select dropdown: `input[placeholder="Select Brokerage"]` (Brokerage selector with `rc_select_0` combobox pattern)
- 1 × text input (no placeholder)
- 20 × checkbox inputs (likely a multi-select grid — e.g., project selection or scheme acknowledgements)
- 18 × radio inputs grouped into 9 radio-groups (names: `:rt:`, `:ru:`, `:rv:`, `:r10:`, `:r11:`, `:r12:`, `:r13:`, `:r14:` — 2 options each; likely Yes/No or A/B questions per section)
- 1 × text input: `input[placeholder="Enter Count"]` (numeric count field)

**Action buttons (form footer):**
```
"Back to Dashboard"
"Submit"
```

**Caveat:** Field labels did not surface in the DOM dump because the inputs do not use `aria-label` and their associated `<label>` elements are not direct DOM siblings within `.ant-form-item` containers. To extract human-readable field labels, additional DOM walking is needed (CSS `.ant-form-item-label`). Visible label text is captured in the screenshot.

### Form Validation Behaviour
- Clicking "Submit" with empty form: captured in `jbp-form-validation.png`. Antd-typical behaviour expected (red error messages under required fields).

### Form Filled Behaviour
- `jbp-form-filled.png` shows form populated via JS-injected values on `input` + `textarea`. Only ~2 effective inputs were populated by the script (because most are checkboxes/radios which the JS skipped, and the text inputs already had values OR were controlled by React state that ignored direct value assignment). For a real user fill, click-driven interactions are required. **NOT submitted** — DO NOT clean up unless user accepts test submission.

### JBP History Tab
```
8 rows captured (past JBP submissions for this CP).
Each row likely shows: Cycle | Submitted Date | Status (Approved/Rejected/etc) | Actions
```

See `jbp-history-tab.png` for column structure and row data.

### Edit Requests Tab
```
0 rows — empty state (no edit requests filed yet by this CP).
```

See `jbp-edit-requests-tab.png` for empty-state UI.

### Business Rules
```
One submission per CP per cycle | Cycle must be OPEN to submit
Post-submit edits: admin-reviewed edit request flow (via "Edit Requests" tab)
Approved edits: version incremented, old = EXPIRED
```

### Navigation Sidebar
```
Home → /dashboard | KYC → /kyc | JBP (active) → /jbp | Leads → /leads | Logout
```

### Sidecar Files
- `_jbp-dom-inspect.json` — initial dashboard inspection (cycle state, tabs, headings)
- `_jbp-form-inspect.json` — form inspection (all 44 input fields, headings, buttons, modal state)
