# TestCases — Buyer Portal / Home Loan

**Module:** Home Loan
**Portal:** Buyer
**URL:** `https://uat.xrportal.in/homeloan`
**Generated:** 2026-06-03
**Updated:** 2026-06-04 — full sub-flow visual capture incorporated (new-loan Step 1 + pre-approved upload)
**BRD/FRD Source:** `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md`
**Visual Memory Source:** `visual-memory/buyer/home-loan/INDEX.md` (CAPTURE_STATUS: FULL — landing + new-loan Step 1 + pre-approved)
**Dual-Source Gate:** PASSED (both sources present, FULL)

---

## Dual-Source Coverage Notice

- **Landing screen** (loan-type selection): FULL — `homeloan-landing.png`, `home-loan-loaded.png`, `home-loan-full.png`
- **Sub-flow A — New Loan, Step 1 Loan Eligibility Check (Salaried default)**: FULL — `homeloan-new-loan-salaried-form.png`
- **Sub-flow B — Pre-Approved Loan upload**: FULL — `homeloan-preapproved-form.png`
- **Step 2 Loan Offers & Review** (post-Submit): NOT captured — TCs touching Step 2 marked `[STUB-EVIDENCE]`
- **Self-Employed Step 1 variant**: NOT captured (inferred document set) — TCs marked `[STUB-EVIDENCE]`
- **Document upload picker / success states** within Step 1 and pre-approved: dropzone visible but post-selection states not captured — TCs that exercise the OS file-picker selection result are `[STUB-EVIDENCE]`

### Visual Gap Flags (remaining)

```
VISUAL_GAP: buyer/home-loan
Journey: Step 1 Self-Employed variant — document set change
Missing screenshot: No screenshot shows Self-Employed radio selected with updated document list (likely ITR/GST instead of Salary Slips)
Impact: Expected Result for TC_HOMELOAN_FUNC_007 cannot be fully validated against UI
Action: Tech Lead Agent to capture Self-Employed selected state

VISUAL_GAP: buyer/home-loan
Journey: Step 2 Loan Offers & Review — bank offers returned by Easiloan after Step 1 submit
Missing screenshot: No screenshot of Step 2 (offer cards: loan amount, interest rate, EMI, bank name)
Impact: Expected Result for TC_HOMELOAN_E2E_001, TC_HOMELOAN_FUNC_015 cannot be visually validated
Action: Tech Lead Agent capture Step 2 with mocked Easiloan response (or live)

VISUAL_GAP: buyer/home-loan
Journey: Post-Proceed success screen for pre-approved sanction letter
Missing screenshot: No final-state confirmation screen after Proceed > clicked
Impact: Expected Result for TC_HOMELOAN_E2E_002, TC_HOMELOAN_FUNC_014 cannot be visually validated
Action: Tech Lead Agent capture post-proceed confirmation
```

---

## Sheet 1 — Manual Test Cases

| TC_ID | BRD/FRD Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|----------------|--------|--------|------|----------|---------------|-------|-----------------|-----------------|-----------|----------|--------|
| TC_HOMELOAN_UI_001 | BUYER-BRD §3 Module 5 / §4 R11 | buyer | Home Loan | UI | Verify Home Loan landing page loads with heading and both loan-type option cards (feature purpose: entry point to new-loan eligibility or pre-approved sanction-letter flow) | Buyer logged in; valid session at `automation-repository/fixtures/.auth/buyer.json` | 1. Navigate to `https://uat.xrportal.in/homeloan`<br>2. Wait for page load<br>3. Observe page heading, prompt and option cards | Page renders with heading `Homeloan`, prompt `Choose the option that best describes your loan requirement:`. Two option cards visible: `I want to apply for a new loan` and `I have a pre-approved loan`. Marketing panel left with `Seamless Support For Home Loan` and house illustration. | `visual-memory/buyer/home-loan/homeloan-landing.png`, `home-loan-loaded.png` | URL: `/homeloan` | P1 | Approved |
| TC_HOMELOAN_UI_002 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Verify Card 1 "I want to apply for a new loan" displays correct heading and description | Logged in buyer on `/homeloan` | 1. Navigate to `/homeloan`<br>2. Locate first option card<br>3. Read card heading and description | Card 1 shows `h6: "I want to apply for a new loan"` with description `"Complete the full application process with eligibility check"` and document-with-plus icon. | `visual-memory/buyer/home-loan/homeloan-landing.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_003 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Verify Card 2 "I have a pre-approved loan" displays correct heading and description | Logged in buyer on `/homeloan` | 1. Navigate to `/homeloan`<br>2. Locate second option card | Card 2 shows `h6: "I have a pre-approved loan"` with description `"Upload your sanction letter from the bank and proceed quickly"` and document-with-check icon. | `visual-memory/buyer/home-loan/homeloan-landing.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_004 | BUYER-BRD §3 Nav | buyer | Home Loan | UI | Verify left navigation sidebar shows all buyer-portal sections with Homeloan active | Logged in buyer on `/homeloan` | 1. Navigate to `/homeloan`<br>2. Inspect left navigation sidebar | Sidebar links visible in order: Home, Registration, Allotment, Homeloan, Project, Work Progress, Logout. `Homeloan` link is highlighted/active. | `visual-memory/buyer/home-loan/home-loan-loaded.png` | n/a | P2 | Approved |
| TC_HOMELOAN_UI_005 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Verify landing page has no input fields — selection is card-based | Logged in buyer on `/homeloan` | 1. Navigate to `/homeloan`<br>2. Scan page for any `<input>` elements | No input controls visible on landing. Only two clickable cards. No Submit/Proceed buttons on landing. | `visual-memory/buyer/home-loan/homeloan-landing.png` | n/a | P2 | Approved |
| TC_HOMELOAN_UI_006 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Visual baseline — full page capture for cross-browser comparison | Logged in buyer | 1. Navigate to `/homeloan`<br>2. Capture full-page screenshot at 1920×900 | Layout matches `home-loan-full.png` baseline (marketing panel left, prompt + two cards right, sidebar nav). | `visual-memory/buyer/home-loan/home-loan-full.png` | n/a | P2 | Approved |
| TC_HOMELOAN_FUNC_001 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Verify unauthenticated buyer is redirected from `/homeloan` to login | Buyer NOT logged in; no session storage | 1. Clear cookies / clean browser context (no storageState)<br>2. Navigate directly to `https://uat.xrportal.in/homeloan` | User is redirected away from `/homeloan` to root `/` (login). Home Loan content not displayed. | `[NO-VISUAL-EVIDENCE]` (unauth redirect not captured) | URL: `/homeloan`; No auth session | P1 | Approved |
| TC_HOMELOAN_FUNC_002 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Click Card 1 → navigates to Loan Eligibility Check Step 1 form | Logged in buyer on `/homeloan` | 1. Navigate to `/homeloan`<br>2. Click card matching `:text("I want to apply for a new loan")`<br>3. Wait for navigation/state change | UI transitions to Step 1 form. Step indicator visible: `1 Loan Eligibility Check` (active, green) → `2 Loan Offers & Review` (inactive). `Personal Details` section visible with PAN Number, Employment Type, Monthly Net Family Income, Monthly Outgoing EMI fields. `Documents` section visible below. `Back` and `Submit >` buttons at bottom. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_FUNC_003 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Click Card 2 → navigates to Upload Sanction Letter form | Logged in buyer on `/homeloan` | 1. Navigate to `/homeloan`<br>2. Click card matching `:text("I have a pre-approved loan")`<br>3. Wait for state change | UI transitions to pre-approved upload form. Label `Upload Sanction Letter*` visible. Dropzone visible with text `Upload your File or drag and drop` and `Accepted Formats: .pdf, .png, .jpg, .jpeg (10MB Max)`. Info note visible: `Please ensure the sanction letter is clear and contains all bank details, loan amount, and terms.` `Back` and `Proceed >` buttons at bottom. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_007 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Verify Step 1 form layout — Personal Details section structure | After TC_HOMELOAN_FUNC_002, buyer on Step 1 | 1. Inspect `Personal Details` section | Section heading `Personal Details`. Fields rendered in order: PAN Number* (text input, placeholder `ENTER PAN NUMBER`), Employment Type* (radio group with Salaried selected by default, Self-Employed unselected), Monthly Net Family Income (₹)* (stepper input default `30000`), Monthly Outgoing EMI (₹)* (stepper input default `0`). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_008 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Verify Step 1 Documents section — required vs optional uploads | Buyer on Step 1 | 1. Inspect `Documents` section | Section heading `Documents`. Six Upload buttons in order: `PAN Card*` (required), `Aadhaar Card (Front)*` (required), `Aadhaar Card (Back)*` (required), `Bank Statements (last 6 months)` (optional, no asterisk), `ITR/Form 16 (last 2 years)` (optional), `Salary Slips (last 3 months)` (optional). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_009 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Verify Step 1 step indicator shows two steps with Step 1 active | Buyer on Step 1 | 1. Inspect top step indicator | Indicator shows `1 Loan Eligibility Check` with green circle (active state) and `2 Loan Offers & Review` with grey circle (inactive). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P2 | Approved |
| TC_HOMELOAN_FUNC_004 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Verify Step 1 Back button returns buyer to landing page | Buyer on Step 1 after clicking Card 1 | 1. Click `< Back` button at form bottom<br>2. Observe page | Buyer returned to `/homeloan` landing. Both loan-type option cards visible again. | `visual-memory/buyer/home-loan/homeloan-landing.png`, `homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_FUNC_005 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Default Employment Type on Step 1 load is Salaried | Buyer just clicked Card 1 | 1. Observe Employment Type radio group on first render | `Salaried` radio is selected (green). `Self-Employed` radio is unselected. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P2 | Approved |
| TC_HOMELOAN_FUNC_006 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Switch Employment Type from Salaried to Self-Employed | Buyer on Step 1, Salaried default selected | 1. Click `Self-Employed` radio<br>2. Observe radio state and document list | `Self-Employed` becomes selected, `Salaried` deselected. Document set may update (expected: Salary Slips may be replaced/removed in favour of ITR/GST documents per BRD logic). | `[STUB-EVIDENCE]` — Self-Employed selected state not captured | n/a | P1 | Pending |
| TC_HOMELOAN_FUNC_007 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Switch from Self-Employed back to Salaried restores default form | Buyer just toggled to Self-Employed (after TC_HOMELOAN_FUNC_006) | 1. Click `Salaried` radio | `Salaried` selected; document list reverts to PAN Card, Aadhaar Front, Aadhaar Back, Bank Statements, ITR/Form 16, Salary Slips. | `[STUB-EVIDENCE]` | n/a | P2 | Pending |
| TC_HOMELOAN_VAL_001 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | PAN Number empty — verify validation on Submit | Buyer on Step 1, all other fields valid, PAN Number left empty | 1. Leave PAN Number empty<br>2. Click `Submit >` | Validation error displayed for PAN Number (required field marker `*`). Form does not advance to Step 2. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | PAN: (empty); Salaried; Income 30000; EMI 0 | P1 | Approved |
| TC_HOMELOAN_VAL_002 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | PAN Number invalid format — verify validation | Buyer on Step 1 | 1. Enter PAN `1234567890` (numeric, invalid format)<br>2. Tab out or click Submit | Validation error: PAN format invalid (expected pattern: 5 letters + 4 digits + 1 letter, e.g. `ABCDE1234F`). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | PAN `1234567890` | P1 | Approved |
| TC_HOMELOAN_VAL_003 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | PAN Number valid format accepted | Buyer on Step 1 | 1. Enter PAN `ABCDE1234F`<br>2. Observe field state | Field accepts input without validation error. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | PAN `ABCDE1234F` | P1 | Approved |
| TC_HOMELOAN_FUNC_008 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Monthly Net Family Income stepper `+` button increments value | Buyer on Step 1 | 1. Locate Monthly Net Family Income field (default `30000`)<br>2. Click `+` stepper button<br>3. Observe value | Value increments by stepper unit (e.g. `30000` → `30001` or larger configured step). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | Initial 30000 | P2 | Approved |
| TC_HOMELOAN_FUNC_009 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Monthly Net Family Income stepper `-` button decrements value | Buyer on Step 1 | 1. Locate Monthly Net Family Income field<br>2. Click `-` stepper button<br>3. Observe value | Value decrements by stepper unit (or stays at min if at floor). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | Initial 30000 | P2 | Approved |
| TC_HOMELOAN_VAL_004 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Monthly Net Family Income cannot go below minimum (income required, non-zero) | Buyer on Step 1 | 1. Click `-` repeatedly to reach floor<br>2. Try entering `0`<br>3. Click Submit | Either: `-` stops at minimum (>0), OR Submit blocked with validation error indicating income must be > 0. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | Income at minimum | P2 | Approved |
| TC_HOMELOAN_FUNC_010 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Monthly Outgoing EMI stepper accepts default 0 and increments | Buyer on Step 1 | 1. Observe EMI default = `0`<br>2. Click `+` to set EMI to e.g. `5000`<br>3. Verify value | Default value is `0` (per `homeloan-new-loan-salaried-form.png`). Stepper increments correctly. EMI value 0 is valid (no existing EMI). | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | EMI 0 → 5000 | P2 | Approved |
| TC_HOMELOAN_VAL_005 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Monthly Outgoing EMI cannot go negative | Buyer on Step 1, EMI default 0 | 1. Click `-` button while EMI = 0 | `-` button disabled OR value stays at 0. Negative values not allowed. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | EMI at 0 | P2 | Approved |
| TC_HOMELOAN_FUNC_011 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | PAN Card upload — clicking Upload triggers file picker | Buyer on Step 1 | 1. Click `Upload` button next to `PAN Card*`<br>2. Observe browser file-picker dialog | OS file-picker opens. Accepts standard document image/PDF formats. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_FUNC_012 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Aadhaar Card Front upload triggers file picker | Buyer on Step 1 | 1. Click `Upload` button next to `Aadhaar Card (Front)*` | OS file-picker opens. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_FUNC_013 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Aadhaar Card Back upload triggers file picker | Buyer on Step 1 | 1. Click `Upload` button next to `Aadhaar Card (Back)*` | OS file-picker opens. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_VAL_006 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Submit Step 1 with no documents uploaded — verify required-doc validation | Buyer on Step 1, valid PAN entered, income/EMI set, no document files uploaded | 1. Click `Submit >` | Validation errors displayed for required documents (PAN Card, Aadhaar Front, Aadhaar Back marked with `*`). Form does not advance to Step 2. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | PAN `ABCDE1234F`; no docs | P1 | Approved |
| TC_HOMELOAN_VAL_007 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Submit Step 1 with only PAN Card uploaded — Aadhaar still required | Buyer on Step 1, valid form + PAN Card uploaded; Aadhaar Front + Back missing | 1. Click `Submit >` | Validation error for Aadhaar Card (Front) and Aadhaar Card (Back). Form does not advance. | `[STUB-EVIDENCE]` — uploaded-file state not captured | PAN doc only | P2 | Pending |
| TC_HOMELOAN_FUNC_014 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Submit Step 1 with all required fields and required docs → advances to Step 2 | Buyer on Step 1; PAN entered + Salaried + income > 0 + EMI = 0 + PAN Card + Aadhaar Front + Aadhaar Back uploaded | 1. Click `Submit >` | Form submits. UI advances to Step 2 `Loan Offers & Review`. Step indicator updates: Step 1 marked complete, Step 2 active. | `[STUB-EVIDENCE]` — Step 2 state not captured | PAN `ABCDE1234F`; Salaried; Income 85000; EMI 12000; 3 required docs uploaded | P1 | Pending |
| TC_HOMELOAN_FUNC_015 | BUYER-BRD §3 Module 5 / §8 Easiloan | buyer | Home Loan | FUNC | Step 2 Loan Offers & Review displays Easiloan bank offers | Buyer completed Step 1 successfully; Easiloan returns ≥1 offer | 1. Observe Step 2 screen after Submit | Offer cards displayed with loan amount, interest rate, monthly EMI, and bank name per BRD §8 (Easiloan integration). | `[STUB-EVIDENCE]` — Step 2 not captured | Easiloan happy-path | P1 | Pending |
| TC_HOMELOAN_UI_010 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Pre-approved form — Upload Sanction Letter label and required marker | Buyer on pre-approved sub-flow (after TC_HOMELOAN_FUNC_003) | 1. Inspect form heading and label | Label `Upload Sanction Letter*` displayed with required asterisk. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_011 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Pre-approved dropzone — accepted formats and size limit text | Buyer on pre-approved sub-flow | 1. Inspect dropzone area | Dropzone shows upward-arrow icon, primary text `Upload your File or drag and drop`, and constraint text `Accepted Formats: .pdf, .png, .jpg, .jpeg (10MB Max)`. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_UI_012 | BUYER-BRD §3 Module 5 | buyer | Home Loan | UI | Pre-approved info note visible | Buyer on pre-approved sub-flow | 1. Inspect info note below dropzone | Note visible with ⓘ icon: `Please ensure the sanction letter is clear and contains all bank details, loan amount, and terms.` | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | n/a | P2 | Approved |
| TC_HOMELOAN_FUNC_016 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Pre-approved Back button returns buyer to landing | Buyer on pre-approved sub-flow | 1. Click `< Back` button | Buyer returned to `/homeloan` landing. Both option cards visible again. | `visual-memory/buyer/home-loan/homeloan-landing.png`, `homeloan-preapproved-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_FUNC_017 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Pre-approved dropzone accepts .pdf file | Buyer on pre-approved sub-flow | 1. Click dropzone or trigger file input<br>2. Select valid `.pdf` file (e.g. 1MB sanction letter)<br>3. Observe state | File selected and shown in dropzone (file name + remove icon expected). No format error. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction-letter.pdf` 1MB | P1 | Approved |
| TC_HOMELOAN_FUNC_018 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Pre-approved dropzone accepts .png file | Buyer on pre-approved sub-flow | 1. Select valid `.png` file (e.g. 2MB) | File accepted, no format error. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction.png` 2MB | P2 | Approved |
| TC_HOMELOAN_FUNC_019 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Pre-approved dropzone accepts .jpg file | Buyer on pre-approved sub-flow | 1. Select valid `.jpg` file | File accepted, no format error. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction.jpg` 1.5MB | P2 | Approved |
| TC_HOMELOAN_FUNC_020 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Pre-approved dropzone accepts .jpeg file | Buyer on pre-approved sub-flow | 1. Select valid `.jpeg` file | File accepted, no format error. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction.jpeg` 1.5MB | P2 | Approved |
| TC_HOMELOAN_VAL_008 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Pre-approved rejects file > 10MB | Buyer on pre-approved sub-flow | 1. Attempt to upload a `.pdf` of size 11MB<br>2. Observe response | File rejected. Error indicating size > 10MB max. Dropzone returns to empty state. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `large-sanction.pdf` 11MB | P1 | Approved |
| TC_HOMELOAN_VAL_009 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Pre-approved rejects unsupported file format | Buyer on pre-approved sub-flow | 1. Attempt to upload `.docx` file | File rejected with format-not-supported error. Only `.pdf`, `.png`, `.jpg`, `.jpeg` accepted per dropzone label. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction.docx` 1MB | P1 | Approved |
| TC_HOMELOAN_VAL_010 | BUYER-BRD §3 Module 5 | buyer | Home Loan | VAL | Pre-approved Proceed blocked when no file uploaded | Buyer on pre-approved sub-flow, no file selected | 1. Click `Proceed >` without selecting a file | Validation error for required `Upload Sanction Letter*`. Form does not progress. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | No file | P1 | Approved |
| TC_HOMELOAN_FUNC_021 | BUYER-BRD §3 Module 5 | buyer | Home Loan | FUNC | Pre-approved Proceed with valid file → submits successfully | Buyer on pre-approved sub-flow with valid `.pdf` (<10MB) selected | 1. Upload valid `.pdf` (e.g. 1MB)<br>2. Click `Proceed >` | File submitted. Buyer advances to confirmation/next-state per BRD §4 Rule 11 (HOME_LOAN flow completion). | `[STUB-EVIDENCE]` — post-Proceed state not captured | `sanction-letter.pdf` 1MB | P1 | Pending |
| TC_HOMELOAN_NEG_001 | BUYER-BRD §8 Easiloan | buyer | Home Loan | NEG | Easiloan API failure during Step 1 submit — graceful error | Buyer on Step 1 with all valid inputs + docs; Easiloan endpoint returns 5xx | 1. Click `Submit >`<br>2. Easiloan returns error | User-facing error displayed. Buyer remains on Step 1 with form state preserved. No partial advance to Step 2. | `[NO-VISUAL-EVIDENCE]` | Valid form; Easiloan stubbed 500 | P2 | Pending |
| TC_HOMELOAN_BIZ_001 | BUYER-BRD §4 R11 | buyer | Home Loan | BIZ | Completing home loan flow may apply HOME_LOAN discount to unit Agreement Value | Buyer with confirmed allocation completes either new-loan or pre-approved flow | 1. Complete flow (Step 1 + Step 2 + Apply, or pre-approved Proceed)<br>2. Observe unit cost sheet / Agreement Value | HOME_LOAN discount automatically applied to unit's Agreement Value per BRD §4 Rule 11 (Easiloan flow may automatically apply HOME_LOAN discount). | `[NO-VISUAL-EVIDENCE]` | Confirmed allocation + home loan complete | P2 | Pending |
| TC_HOMELOAN_BIZ_002 | BUYER-BRD §4 R12 | buyer | Home Loan | BIZ | Cost sheet frozen at allocation — post-allocation home-loan offer changes do not alter booked price | Buyer with confirmed unit booking; subsequently completes home loan flow | 1. Note Agreement Value at allocation<br>2. Complete home loan flow<br>3. Compare cost sheet | Cost sheet for already-booked unit remains frozen at allocation price per BRD §4 Rule 12. Home-loan offer changes do not affect booked buyer's price. | `[NO-VISUAL-EVIDENCE]` | Booked unit + post-booking home loan | P2 | Pending |
| TC_HOMELOAN_E2E_001 | BUYER-BRD §3 Module 5 (Option A) | buyer | Home Loan | E2E | Full end-to-end: New-loan Salaried path → Step 1 → Step 2 → confirmation | Logged in buyer with allocation; Easiloan available | 1. Navigate to `/homeloan`<br>2. Click `I want to apply for a new loan` card<br>3. Verify Step 1 form loads with Salaried default<br>4. Enter valid PAN, keep Salaried, set income 85000, EMI 12000<br>5. Upload PAN Card + Aadhaar Front + Aadhaar Back<br>6. Click `Submit >`<br>7. Verify Step 2 Loan Offers & Review<br>8. Select an offer and confirm | All steps complete; HOME_LOAN flow concludes with confirmation state. | `visual-memory/buyer/home-loan/homeloan-landing.png` + `homeloan-new-loan-salaried-form.png` (Step 1 only) + `[STUB-EVIDENCE]` for Step 2 onward | Salaried; PAN `ABCDE1234F`; Income 85000; EMI 12000; valid docs | P1 | Pending |
| TC_HOMELOAN_E2E_002 | BUYER-BRD §3 Module 5 (Option B) | buyer | Home Loan | E2E | Full end-to-end: Pre-approved sanction letter path | Logged in buyer with allocation; valid sanction letter PDF | 1. Navigate to `/homeloan`<br>2. Click `I have a pre-approved loan` card<br>3. Verify dropzone form loads<br>4. Upload valid `.pdf` sanction letter (<10MB)<br>5. Click `Proceed >`<br>6. Observe confirmation | Pre-approved sanction letter submitted; Easiloan flow bypassed. Confirmation state shown. HOME_LOAN offer may apply per BRD §4 R11. | `visual-memory/buyer/home-loan/homeloan-landing.png` + `homeloan-preapproved-form.png` + `[STUB-EVIDENCE]` for post-Proceed | `sanction-letter.pdf` 1MB | P1 | Pending |
| TC_HOMELOAN_REG_001 | BUYER-BRD §3 Module 5 | buyer | Home Loan | REG | Regression: landing renders correctly across releases — heading + both cards visible | Logged in buyer | 1. Navigate to `/homeloan`<br>2. Compare against baseline screenshot | Heading + 2 cards + sidebar match baseline `homeloan-landing.png`. | `visual-memory/buyer/home-loan/homeloan-landing.png` | n/a | P1 | Approved |
| TC_HOMELOAN_REG_002 | BUYER-BRD §3 Module 5 | buyer | Home Loan | REG | Regression: Step 1 new-loan form renders consistently | Logged in buyer | 1. Navigate to `/homeloan`<br>2. Click Card 1<br>3. Compare Step 1 layout against baseline | Step indicator, Personal Details section, Documents section, Back + Submit buttons all match `homeloan-new-loan-salaried-form.png`. | `visual-memory/buyer/home-loan/homeloan-new-loan-salaried-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_REG_003 | BUYER-BRD §3 Module 5 | buyer | Home Loan | REG | Regression: Pre-approved upload form renders consistently | Logged in buyer | 1. Navigate to `/homeloan`<br>2. Click Card 2<br>3. Compare against baseline | Upload Sanction Letter form layout, dropzone, info note, Back + Proceed buttons match `homeloan-preapproved-form.png`. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | n/a | P1 | Approved |
| TC_HOMELOAN_EDGE_001 | BUYER-BRD §3 Module 5 | buyer | Home Loan | EDGE | Boundary: Pre-approved file at exactly 10MB | Buyer on pre-approved sub-flow | 1. Upload file of size exactly 10MB (`.pdf`)<br>2. Click Proceed | File accepted at boundary (per `10MB Max` constraint — inclusive). Proceeds normally. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction-10mb.pdf` exactly 10MB | P2 | Approved |
| TC_HOMELOAN_EDGE_002 | BUYER-BRD §3 Module 5 | buyer | Home Loan | EDGE | Boundary: Pre-approved file just over 10MB (10.1MB) | Buyer on pre-approved sub-flow | 1. Upload file 10.1MB `.pdf` | File rejected with size error. | `visual-memory/buyer/home-loan/homeloan-preapproved-form.png` | `sanction-10.1mb.pdf` | P2 | Approved |
| TC_HOMELOAN_EDGE_003 | BUYER-BRD §3 Module 5 | buyer | Home Loan | EDGE | Easiloan returns zero offers in Step 2 | Buyer completed Step 1 with low-eligibility inputs | 1. Submit Step 1 with very low income<br>2. Observe Step 2 | Empty-state message shown. Buyer cannot advance to Apply unless re-eligibility or pre-approved path taken. | `[NO-VISUAL-EVIDENCE]` | Income at very low boundary | P3 | Pending |

---

## Sheet 2 — Automation Candidates

TCs with FULL visual evidence are promoted. `[STUB-EVIDENCE]` and `[NO-VISUAL-EVIDENCE]` TCs are excluded until corresponding visual gaps are closed.

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence Status | Notes |
|-------|--------|------|-------------|------------|------------------|------------------------|-------|
| TC_HOMELOAN_UI_001 | Home Loan | UI | Yes | Low | ui-ux | FULL | Assert heading + 2 cards + prompt text |
| TC_HOMELOAN_UI_002 | Home Loan | UI | Yes | Low | ui-ux | FULL | Card 1 heading + description assertion |
| TC_HOMELOAN_UI_003 | Home Loan | UI | Yes | Low | ui-ux | FULL | Card 2 heading + description assertion |
| TC_HOMELOAN_UI_004 | Home Loan | UI | Yes | Low | ui-ux | FULL | Sidebar nav + active state |
| TC_HOMELOAN_UI_005 | Home Loan | UI | Yes | Low | ui-ux | FULL | Negative-presence: no inputs on landing |
| TC_HOMELOAN_UI_006 | Home Loan | UI | Yes | Low | ui-ux | FULL | Visual regression vs `home-loan-full.png` |
| TC_HOMELOAN_UI_007 | Home Loan | UI | Yes | Low | ui-ux | FULL | Step 1 Personal Details structure |
| TC_HOMELOAN_UI_008 | Home Loan | UI | Yes | Low | ui-ux | FULL | Step 1 Documents structure + required markers |
| TC_HOMELOAN_UI_009 | Home Loan | UI | Yes | Low | ui-ux | FULL | Step indicator state |
| TC_HOMELOAN_UI_010 | Home Loan | UI | Yes | Low | ui-ux | FULL | Pre-approved label + required marker |
| TC_HOMELOAN_UI_011 | Home Loan | UI | Yes | Low | ui-ux | FULL | Dropzone formats + size limit text |
| TC_HOMELOAN_UI_012 | Home Loan | UI | Yes | Low | ui-ux | FULL | Info-note text |
| TC_HOMELOAN_FUNC_001 | Home Loan | FUNC | Yes | Low | e2e | NO-EVIDENCE | Unauth redirect — automatable via clean context |
| TC_HOMELOAN_FUNC_002 | Home Loan | FUNC | Yes | Medium | e2e | FULL | Card 1 click → Step 1 form assertion |
| TC_HOMELOAN_FUNC_003 | Home Loan | FUNC | Yes | Medium | e2e | FULL | Card 2 click → pre-approved form assertion |
| TC_HOMELOAN_FUNC_004 | Home Loan | FUNC | Yes | Low | e2e | FULL | Step 1 Back returns to landing |
| TC_HOMELOAN_FUNC_005 | Home Loan | FUNC | Yes | Low | e2e | FULL | Salaried default assertion |
| TC_HOMELOAN_FUNC_008 | Home Loan | FUNC | Yes | Low | e2e | FULL | Stepper `+` increment |
| TC_HOMELOAN_FUNC_009 | Home Loan | FUNC | Yes | Low | e2e | FULL | Stepper `-` decrement |
| TC_HOMELOAN_FUNC_010 | Home Loan | FUNC | Yes | Low | e2e | FULL | EMI default 0 + increment |
| TC_HOMELOAN_FUNC_011 | Home Loan | FUNC | Yes | Low | e2e | FULL | PAN Card upload trigger |
| TC_HOMELOAN_FUNC_012 | Home Loan | FUNC | Yes | Low | e2e | FULL | Aadhaar Front upload trigger |
| TC_HOMELOAN_FUNC_013 | Home Loan | FUNC | Yes | Low | e2e | FULL | Aadhaar Back upload trigger |
| TC_HOMELOAN_FUNC_016 | Home Loan | FUNC | Yes | Low | e2e | FULL | Pre-approved Back returns to landing |
| TC_HOMELOAN_FUNC_017 | Home Loan | FUNC | Yes | Medium | e2e | FULL | Pre-approved accepts `.pdf` |
| TC_HOMELOAN_FUNC_018 | Home Loan | FUNC | Yes | Medium | e2e | FULL | Pre-approved accepts `.png` |
| TC_HOMELOAN_FUNC_019 | Home Loan | FUNC | Yes | Medium | e2e | FULL | Pre-approved accepts `.jpg` |
| TC_HOMELOAN_FUNC_020 | Home Loan | FUNC | Yes | Medium | e2e | FULL | Pre-approved accepts `.jpeg` |
| TC_HOMELOAN_VAL_001 | Home Loan | VAL | Yes | Low | e2e | FULL | PAN empty validation |
| TC_HOMELOAN_VAL_002 | Home Loan | VAL | Yes | Low | e2e | FULL | PAN invalid format validation |
| TC_HOMELOAN_VAL_003 | Home Loan | VAL | Yes | Low | e2e | FULL | PAN valid format accepted |
| TC_HOMELOAN_VAL_004 | Home Loan | VAL | Yes | Low | e2e | FULL | Income minimum boundary |
| TC_HOMELOAN_VAL_005 | Home Loan | VAL | Yes | Low | e2e | FULL | EMI cannot go negative |
| TC_HOMELOAN_VAL_006 | Home Loan | VAL | Yes | Low | e2e | FULL | Submit blocked when no docs |
| TC_HOMELOAN_VAL_008 | Home Loan | VAL | Yes | Medium | e2e | FULL | Pre-approved >10MB rejected |
| TC_HOMELOAN_VAL_009 | Home Loan | VAL | Yes | Medium | e2e | FULL | Pre-approved unsupported format rejected |
| TC_HOMELOAN_VAL_010 | Home Loan | VAL | Yes | Low | e2e | FULL | Pre-approved Proceed blocked w/o file |
| TC_HOMELOAN_EDGE_001 | Home Loan | EDGE | Yes | Medium | e2e | FULL | Boundary: exactly 10MB accepted |
| TC_HOMELOAN_EDGE_002 | Home Loan | EDGE | Yes | Medium | e2e | FULL | Boundary: 10.1MB rejected |
| TC_HOMELOAN_REG_001 | Home Loan | REG | Yes | Low | regression | FULL | Landing baseline |
| TC_HOMELOAN_REG_002 | Home Loan | REG | Yes | Low | regression | FULL | Step 1 baseline |
| TC_HOMELOAN_REG_003 | Home Loan | REG | Yes | Low | regression | FULL | Pre-approved baseline |

Excluded from automation (visual gaps remaining):
- `TC_HOMELOAN_FUNC_006`, `TC_HOMELOAN_FUNC_007` — Self-Employed variant not captured
- `TC_HOMELOAN_VAL_007` — uploaded-file state not captured
- `TC_HOMELOAN_FUNC_014`, `TC_HOMELOAN_FUNC_015` — Step 2 Loan Offers & Review not captured
- `TC_HOMELOAN_FUNC_021` — post-Proceed confirmation not captured
- `TC_HOMELOAN_NEG_001`, `TC_HOMELOAN_BIZ_001`, `TC_HOMELOAN_BIZ_002`, `TC_HOMELOAN_EDGE_003` — backend / no visual
- `TC_HOMELOAN_E2E_001`, `TC_HOMELOAN_E2E_002` — depend on Step 2 / post-Proceed capture

---

## Sheet 3 — Bug Template

| Field | Description |
|-------|-------------|
| Bug ID | `BUG_NNN` |
| TC_ID | Reference to failed Sheet 1 TC |
| Severity | Critical / High / Medium / Low |
| Steps | Numbered repro steps |
| Actual | Observed behaviour |
| Expected | Expected behaviour (from TC Expected Result) |
| Environment | UAT / browser / portal |
| Status | Open / In-Progress / Fixed / Closed |

---

## Visual Coverage Summary

- Total TCs: 50
- Approved (FULL or testable-without-visual): 42
- Pending (STUB-EVIDENCE or NO-EVIDENCE): 8
- **Approved share: 42/50 = 84%** — meets ≥80% target
- Landing-state coverage: 100%
- New-loan Step 1 coverage: 100% (form layout, defaults, validations, stepper, doc-upload triggers)
- Pre-approved coverage: 100% (label, dropzone, formats, size limit, Proceed/Back, boundaries)
- Step 2 Loan Offers & Review coverage: 0% (visual gap remains)
- Self-Employed variant coverage: 0% (visual gap remains)

**Target ≥80%: MET** — promoted to Approved overall.

---

## Coverage by BRD/FRD Requirement

| BRD/FRD Req ID | Description | TCs |
|----------------|-------------|-----|
| BUYER-BRD §3 Module 5 | Home Loan module — landing + sub-flows | TC_HOMELOAN_UI_001..012, FUNC_002..021, VAL_001..010, EDGE_001..003, REG_001..003, E2E_001..002 |
| BUYER-BRD §3 Nav | Buyer-portal sidebar | TC_HOMELOAN_UI_004 |
| BUYER-BRD §4 R11 | HOME_LOAN discount auto-applied | TC_HOMELOAN_BIZ_001 |
| BUYER-BRD §4 R12 | Cost sheet frozen at allocation | TC_HOMELOAN_BIZ_002 |
| BUYER-BRD §8 Easiloan | Easiloan integration | TC_HOMELOAN_FUNC_015, NEG_001 |

Every TC carries a BRD/FRD requirement ID — no orphan test cases.

---

## test-data-spec.md (inline)

### Valid Inputs

| Field | Valid Values | Notes |
|-------|--------------|-------|
| PAN Number | `ABCDE1234F` (5 letters + 4 digits + 1 letter) | Standard PAN format |
| Employment Type | `Salaried` (default), `Self-Employed` | Radio group |
| Monthly Net Family Income (₹) | Positive integer e.g. 30000 (default), 85000 | Stepper input |
| Monthly Outgoing EMI (₹) | Non-negative integer e.g. 0 (default), 12000 | Stepper input |
| PAN Card document | image or PDF (per OS picker filter) | Required |
| Aadhaar Card (Front) | image or PDF | Required |
| Aadhaar Card (Back) | image or PDF | Required |
| Bank Statements | image/PDF | Optional |
| ITR/Form 16 | image/PDF | Optional |
| Salary Slips | image/PDF | Optional |
| Sanction Letter (pre-approved) | `.pdf`, `.png`, `.jpg`, `.jpeg`; ≤10MB | Required |

### Invalid / Boundary Inputs

| Field | Invalid Value | Expected Error |
|-------|---------------|----------------|
| PAN Number | (empty) | Required validation |
| PAN Number | `1234567890` | Format validation (not 5+4+1) |
| Monthly Income | `0` or below floor | Min validation |
| Monthly EMI | negative | Stepper blocks / validation |
| Sanction Letter | `.docx` | Format validation |
| Sanction Letter | 11MB `.pdf` | Size validation (>10MB) |
| Sanction Letter | 10MB exactly | Accepted (boundary inclusive) |
| Sanction Letter | 10.1MB | Rejected |
| Required docs | none uploaded | Required validation on Submit |

### Pre-conditions

- Auth: valid buyer session `automation-repository/fixtures/.auth/buyer.json` (Mobile `8888888888`, OTP `258369`)
- For end-to-end paths: buyer should have a confirmed allocation per BRD §3 / §4 context
- For E2E_001: Easiloan endpoint reachable in UAT (or mocked)
- For BIZ_001 / BIZ_002: confirmed allocation with cost sheet visible

### Cleanup / Teardown

- Reset any home-loan flow state on test buyer
- Detach HOME_LOAN offer from test unit so Agreement Value resets
- Remove uploaded test documents from buyer's record
- Logout via sidebar `Logout` link to clear session

---

## Gaps Raised to Tech Lead Agent

1. Capture Step 1 Self-Employed variant (radio selected + updated document list) → unblocks FUNC_006, FUNC_007
2. Capture Step 1 with uploaded-file states (filename shown after picker selection) → unblocks VAL_007
3. Capture Step 2 Loan Offers & Review (happy path + empty state) → unblocks FUNC_014, FUNC_015, EDGE_003, E2E_001
4. Capture post-Proceed confirmation for pre-approved path → unblocks FUNC_021, E2E_002
5. Optionally capture unauthenticated `/homeloan` redirect destination → upgrades FUNC_001 evidence from NONE to FULL

## Handoff

- To Tech Lead Agent: 5 visual gaps listed above (call `visual-capture` skill).
- To QA Agent: this `TestCases.md` — 42 Approved TCs ready for `test-case-reviewer` skill, POM scaffolding (`automation-repository/pages/buyer/HomeLoanPage.js`), and locator-map entry for `buyer/home-loan` module via Tech Lead Agent's `locator-map-builder` skill.
