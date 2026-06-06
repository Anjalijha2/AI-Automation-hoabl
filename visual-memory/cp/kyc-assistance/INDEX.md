# Visual Memory — CP Portal / KYC Assistance

**Captured:** 2026-06-06 (UPDATED — full-page + dropdown options + Submit-disabled gating fully captured)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/kyc)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | KYC form — Firm + Contact + Additional Details (above-fold, pre-filled state) — historical baseline | 2026-06-03 |
| `kyc-loaded-full.png` | KYC page — **full-page** screenshot. Empty form session showing all sections in order: Firm Details, Contact Details, Additional Details, KYC Document Upload, plus Cancel + Submit footer | 2026-06-06 |
| `kyc-above-fold.png` | KYC viewport (top) — empty form: Firm Details + Contact Details visible | 2026-06-06 |
| `kyc-documents-section.png` | Mid-page viewport — Additional Details + start of KYC Document Upload section | 2026-06-06 |
| `kyc-below-fold-submit.png` | Bottom viewport — KYC Document Upload section (PAN Card / GST / MAHA RERA Certificate uploads) + Cancel + **Submit (disabled)** footer | 2026-06-06 |
| `kyc-business-region-dropdown.png` | Business Region ant-select dropdown OPEN — shows 3 options: **MMR**, **Pune**, **BGLR** | 2026-06-06 |
| `kyc-validation-errors.png` | Post-Submit-click viewport — **Submit remains disabled** (no inline errors appear; the button is `disabled=true` at DOM level, so click is a no-op when required fields are empty). Cancel button visible (active). | 2026-06-06 |
| `kyc-validation-full.png` | Full-page version of the post-Submit-click state — confirms no error styling applied to any field; the form gates submission entirely at the button (disabled) level | 2026-06-06 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat-web.xrportal.in/kyc`
- Requires authentication (redirects to `/login` when unauthenticated)
- Page is **CP self-KYC** (Channel Partner submits their own firm-level KYC). Per FRD `CP-FS-KYC-Assistance.md` §1.2, this is the ONLY KYC flow in the CP portal — buyer-KYC-on-behalf is a buyer-portal flow.

### Page Heading
```
h2: "KYC"
```
Document title: `HoABL | Growth Channel Partner Portal`

### Page Structure (section headers, top to bottom)
1. **Firm Details**          (green band header)
2. **Contact Details**       (green band header)
3. **Additional Details**    (green band header)
4. **KYC Document Upload**   (green band header)
5. Footer row: `[Cancel]`  ...  `[Submit]`

`document.body.scrollHeight = 1589px` at 1920×900 viewport (form sits above fold + ~700px below).

### Form Inputs (verified via DOM dump, 9 typed inputs + 1 select + 3 file inputs)

**Firm Details**
```
input[name="orgName"]   placeholder="Enter Name"           label: "Firm Name *"
input[name="address"]   placeholder="Enter Full Address"   label: "Firm Address *"
.ant-select             label: "Business Region *"         (3 options: MMR, Pune, BGLR)
```

**Contact Details**
```
input[name="ownerName"] placeholder="Enter Name"           label: "Growth Partner Owner Name *"
input[name="email"]     placeholder="Enter Email ID"       label: "Email ID *"            (type=text, not type=email)
input[name="phone"]     placeholder="Enter Mobile Number"  label: "Phone Number *"        (type=text, not type=tel)
```

**Additional Details**
```
input[name="officePincode"] placeholder="Enter Pin Code"    label: "Pin Code Office *"
input[name="panNumber"]     placeholder="Enter PAN Number"  label: "PAN Number *"
input[name="reraNumber"]    placeholder="Enter RERA Number" label: "RERA Number"   (optional — no asterisk)
```

**KYC Document Upload** (3 uploads — NOT 4 as the buyer-KYC BRD describes)
```
"PAN Card"               — ant-upload-select button labelled "Upload" + upload icon
"GST"                    — ant-upload-select button labelled "Upload" + upload icon
"MAHA RERA Certificate"  — ant-upload-select button labelled "Upload" + upload icon
```

Each upload renders as `<div class="ant-upload ant-upload-select">` wrapping an `<input type="file" name="file">` (3 hidden file inputs in DOM, one per document slot). No `accept` attribute observed on the file inputs — client does not constrain MIME types.

### Action Buttons (footer)
```
button:has-text("Cancel")   class: ant-btn-default ant-btn-variant-outlined btn-book-outline   (enabled)
button:has-text("Submit")   class: ant-btn-submit btn-book-solid                                disabled=true (default)
```

**Submit button gating (critical UX behaviour, verified 2026-06-06):**
- On a fresh empty form, **Submit is `disabled=true`** at the DOM level.
- Clicking the disabled Submit button has NO effect — no toast, no inline error, no navigation.
- The form does NOT show per-field validation errors on Submit click. Instead, the button itself is gated until all required fields (`orgName`, `address`, `Business Region`, `ownerName`, `email`, `phone`, `officePincode`, `panNumber`) have non-empty values. `reraNumber` is optional.
- Document uploads are NOT required to enable Submit (verified — Submit can become enabled with text fields filled even if no docs uploaded). However, per FRD §1.5/§1.7-4, "all 4 documents per applicant are mandatory" — that rule applies to **buyer KYC** flow, not CP self-KYC. CP self-KYC submission with empty doc uploads is allowed at the UI level. **Flag for product clarification.**

### Business Region Dropdown — Options (verified 2026-06-06)
```
.ant-select   selector for Business Region field
Open trigger: click the .ant-select-selector inside the .ant-form-item with label "Business Region *"
Options (3): MMR | Pune | BGLR
DOM: .ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option
```

These map to HoABL's 3 sales regions: Mumbai Metropolitan Region (MMR), Pune, Bengaluru (BGLR).

### Validation Behaviour Summary
| Trigger | Observed Behaviour |
|---|---|
| Submit click with empty form | Disabled button — click is a no-op. No toast. No inline errors. |
| Submit click with partial fill | Disabled button — same as empty. |
| Cancel click | (Not yet captured — likely navigates back to /dashboard) |

**There is NO visible client-side validation error styling on the form.** Validation is enforced via the disabled-Submit pattern.

### Pre-fill Behaviour
- 2026-06-03 baseline (`screenshot-desktop.png`) showed all fields pre-filled with test CP data (`GP test name`, `gp@test.test`, `Test CP`, `testcp@gmail.com`, `8888888888`, `400056`, `TTTTT7777Y`).
- 2026-06-06 fresh capture showed an EMPTY form for the same CP (`HV00025808`).
- **Hypothesis:** The form pre-fills only when the CP's KYC record is in a draft/in-review state with previously-entered values. After a refresh or partial reset (e.g., admin-triggered re-KYC), fields may reset to empty even for the same user. Confirm by checking `GET /api/v1/cp/kyc` response body in network panel.

### KYC Status Indicator (outside this page)
```
On /dashboard top-right: button "Your KYC is in review"   — blue/navy + shield icon
  Visible while CP KYC pending admin approval. Disappears once approved.
```

### Module Context (FRD-aligned)
- Per `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md`:
  - Module name "KYC Assistance" = **CP's own (firm-level) KYC onboarding**, NOT customer KYC.
  - Backend endpoint: `POST /api/v1/cp/registration` — **UNAUTHENTICATED** (security gap flagged in FSD-CORRECTION 2026-05-25).
  - GET endpoint for current values: `/api/v1/cp/kyc` (read, authenticated).
  - Sections 1.5/1.6 ("4 documents per applicant", "max 4 applicants") describe a buyer-KYC flow that has NO backend endpoint in the CP portal — those rules do NOT apply here.

### Navigation Sidebar (4 nav items + Logout)
```
Home   → /dashboard
KYC    → /kyc   (active when on this page — green tile background)
JBP    → /jbp
Leads  → /leads
Logout → bottom of sidebar
```

### Test Account Data (active session 2026-06-06)
```
CP: GP test name (HV00025808)
Mobile: 8888888888    OTP: 147258
KYC Status: In Review (per dashboard header indicator)
```

### Selectors Reference
```
heading              page.getByRole('heading', { name: /^KYC$/i, level: 2 })
firmName             page.locator('input[name="orgName"]')
firmAddress          page.locator('input[name="address"]')
businessRegion       page.locator('.ant-form-item').filter({ hasText: /business region/i }).locator('.ant-select-selector')
businessRegionOption page.locator('.ant-select-item-option').filter({ hasText: /^(MMR|Pune|BGLR)$/ })
ownerName            page.locator('input[name="ownerName"]')
email                page.locator('input[name="email"]')
phone                page.locator('input[name="phone"]')
officePincode        page.locator('input[name="officePincode"]')
panNumber            page.locator('input[name="panNumber"]')
reraNumber           page.locator('input[name="reraNumber"]')
panCardUpload        page.locator('.ant-form-item').filter({ hasText: /^PAN Card$/ }).locator('input[type="file"]')
gstUpload            page.locator('.ant-form-item').filter({ hasText: /^GST$/ }).locator('input[type="file"]')
maharreraUpload      page.locator('.ant-form-item').filter({ hasText: /MAHA RERA Certificate/i }).locator('input[type="file"]')
cancelBtn            page.getByRole('button', { name: /^Cancel$/ })
submitBtn            page.getByRole('button', { name: /^Submit$/ })   // disabled until all required fields filled
```

### Sidecar Files
- `_kyc-dom-inspect.json`     — full DOM dump: 12 inputs, 1 select, 9 upload nodes, 5 buttons (incl. 3 Logout from responsive nav)
- `_kyc-region-options.json`  — Business Region dropdown options dump (3 items)
- `_kyc-capture-results.json` — capture run log
