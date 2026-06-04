# Visual Memory — Buyer Portal / Home Loan

**Captured:** 2026-06-04 (updated — full loan flow captured via manual screenshots)
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/homeloan)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `home-loan-loaded.png` | Home Loan landing — initial authenticated load (two loan-type cards) | 2026-06-03 |
| `home-loan-full.png` | Full-page final screenshot | 2026-06-03 |
| `homeloan-landing.png` | Home Loan landing — clear view of both option cards | 2026-06-04 |
| `homeloan-new-loan-salaried-form.png` | New Loan — Step 1 Loan Eligibility Check (Salaried selected, all fields + docs) | 2026-06-04 |
| `homeloan-preapproved-form.png` | Pre-Approved Loan — Upload Sanction Letter form | 2026-06-04 |
| `homeloan-self-employed-form.png` | New Loan — Step 1 Loan Eligibility Check (Self-Employed selected, different fields) | 2026-06-04 |
| `homeloan-step2-offers-nodata.png` | New Loan — Step 2 Loan Offers & Review (No data / Easiloan empty state) | 2026-06-04 |
| `homeloan-step2-offers-nodata-scrolled.png` | New Loan — Step 2 documents section scrolled | 2026-06-04 |
| `homeloan-step2-no-offer-toast.png` | New Loan — Step 2 validation toast "Please select a loan offer to proceed." | 2026-06-04 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/homeloan`
- Requires authentication — unauthenticated access redirects to `/`

### Page Heading
```
h5/h2: "Homeloan"
```

### Marketing Panel (left side)
```
text: "Seamless Support For Home Loan"
text: "Experience a hassle-free financing journey with guided assistance at every step."
image: house illustration
footer disclaimer: "The House of Abhinandan Lodha was established in 2020 and is not, in any manner, associated with 'Lodha' or 'Lodha Group.'"
```

### Landing Page — Loan Type Selection

**Prompt text:**
```
"Choose the option that best describes your loan requirement:"
```

**Two option cards (click to select):**
```
Card 1:
  icon: document-with-plus
  h6: "I want to apply for a new loan"
  description: "Complete the full application process with eligibility check"

Card 2:
  icon: document-with-check
  h6: "I have a pre-approved loan"
  description: "Upload your sanction letter from the bank and proceed quickly"
```

**Key selectors (landing):**
```
h5 or h2: "Homeloan"
div (card)   filter({ hasText: /I want to apply for a new loan/i })
div (card)   filter({ hasText: /I have a pre-approved loan/i })
```
No form-submit buttons on landing — card click navigates to sub-flow.

---

### Sub-flow A: New Loan — Loan Eligibility Check (Step 1 of 2)

**Step indicator:**
```
Step 1 (active): "Loan Eligibility Check"   — green circle with "1"
Step 2 (inactive): "Loan Offers & Review"   — grey circle with "2"
```

**Personal Details section:**
```
h5: "Personal Details"

PAN Number*:
  input[type="text"]   placeholder="ENTER PAN NUMBER"

Employment Type*:
  radio: "Salaried"      — green (default selected)
  radio: "Self-Employed"

Monthly Net Family Income (₹)*:
  input with -/+ stepper   default: 30000

Monthly Outgoing EMI (₹)*:
  input with -/+ stepper   default: 0
```

**Documents section:**
```
h5: "Documents"

PAN Card*:                    button "Upload"
Aadhaar Card (Front)*:        button "Upload"
Aadhaar Card (Back)*:         button "Upload"
Bank Statements (last 6 months): button "Upload"   (not required*)
ITR/Form 16 (last 2 years):   button "Upload"   (not required*)
Salary Slips (last 3 months): button "Upload"   (not required*)
```

**Buttons:**
```
button "< Back"    — returns to landing
button "Submit >"  — green, submits eligibility check
```

**Key selectors (Step 1 new loan):**
```
text: "Loan Eligibility Check"
text: "Personal Details"
input[placeholder*="PAN" i]
input[type="radio"]   filter({name: /employment/i})   — salaried/self-employed
input (monthly income stepper)
input (monthly EMI stepper)
button   filter({ hasText: /upload/i }).nth(0)  — PAN Card upload
button   filter({ hasText: /upload/i }).nth(1)  — Aadhaar Front upload
button   filter({ hasText: /upload/i }).nth(2)  — Aadhaar Back upload
button   filter({ hasText: /upload/i }).nth(3)  — Bank Statements
button   filter({ hasText: /upload/i }).nth(4)  — ITR/Form 16
button   filter({ hasText: /upload/i }).nth(5)  — Salary Slips
button   filter({ hasText: /submit/i })
button   filter({ hasText: /back/i })
```

**Employment type variants:**

**Salaried** (default — captured `homeloan-new-loan-salaried-form.png`):
```
Monthly Net Family Income (₹)*   stepper
Monthly Outgoing EMI (₹)*        stepper
Documents: PAN Card*, Aadhaar Front*, Aadhaar Back*, Bank Statements (last 6 months),
           ITR/Form 16 (last 2 years), Salary Slips (last 3 months)
```

**Self-Employed** (captured `homeloan-self-employed-form.png`):
```
Annual Profit (₹)*          stepper (replaces Monthly Net Family Income)
Annual Turnover (₹)*         stepper (ADDITIONAL field — not in Salaried)
Monthly Outgoing EMI (₹)*   stepper (same as Salaried)
Documents: PAN Card*, Aadhaar Front*, Aadhaar Back*, Bank Statements (last 12 months),
           ITR (last 3 years), Balance Sheet & P&L (last 3 years CA certified)
NOTE: No Salary Slips. Bank Statements = 12 months (vs 6 for Salaried). ITR = 3 years (vs 2).
```

Key Self-Employed selectors:
```
input[type="radio"] (Self-Employed selected — green dot)
input (Annual Profit stepper)
input (Annual Turnover stepper)
input (Monthly Outgoing EMI stepper)
button   filter({ hasText: /upload/i }).nth(3)   — Bank Statements
button   filter({ hasText: /upload/i }).nth(4)   — ITR
button   filter({ hasText: /upload/i }).nth(5)   — Balance Sheet & P&L
```

---

---

### Sub-flow A: New Loan — Step 2: Loan Offers & Review

**Step indicator:**
```
Step 1: ✓ completed (green checkmark circle)
Step 2: "2 Loan Offers & Review" (active, green circle)
```

**Loan Offers table ("Personal Details" section):**
```
Columns: Preference | Bank | Loan Amount | Rate of Interest | Monthly EMI | Loan Duration
Table: horizontally scrollable
Empty state: empty-box icon + "No data"
  Displayed when Easiloan API returns no matching offers
```

**Validation toast (when no offer selected, clicking Save Details):**
```
Toast: "⚠️ Please select a loan offer to proceed."   — yellow/orange warning
Position: top-center of page
```

**Documents section (carried forward from Step 1):**
```
All documents uploaded in Step 1 are visible here with filenames.
Additional upload slots remain available.

Salaried documents shown:
  PAN Card*: "Pan Document - 1"
  Aadhaar Card*: "Aadhar Document - 1", "Aadhar Document - 2"
  Bank Statements (last 12 months): Upload + uploaded filenames
  ITR (last 3 years): Upload + "ITR/Form 16 - 1"
  Balance Sheet & P&L (last 3 years CA certified): Upload + "Balance Sheet and P&L - 1"
```

**Button:**
```
button "Save Details >"   — green (disabled-effect if no offer selected)
```

**Key selectors (Step 2):**
```
text: "Loan Offers & Review"
table (offers table) — may be empty with "No data" state
div   filter({ hasText: /no data/i })   — empty state
div (toast)   filter({ hasText: /please select a loan offer/i })   — validation
button   filter({ hasText: /save details/i })
```

---

### Sub-flow B: Pre-Approved Loan

**Page heading:** Same "Homeloan" heading + marketing panel

**Content:**
```
h5 or label: "Upload Sanction Letter*"
file upload dropzone:
  icon: ↑ (upload arrow)
  text: "Upload your File or drag and drop"
  text: "Accepted Formats: .pdf, .png, .jpg, .jpeg (10MB Max)"
info note: "Please ensure the sanction letter is clear and contains all bank details, loan amount, and terms."
  (ⓘ icon before text)
```

**Buttons:**
```
button "< Back"    — returns to landing
button "Proceed >" — green, submits sanction letter
```

**Key selectors (pre-approved):**
```
text: "Upload Sanction Letter"
input[type="file"]   — file upload input
div (dropzone)   filter({ hasText: /upload your file/i })
text: "Accepted Formats: .pdf, .png, .jpg, .jpeg (10MB Max)"
button   filter({ hasText: /proceed/i })
button   filter({ hasText: /back/i })
```

---

### Navigation Sidebar
```
Home | Registration | Allotment | Homeloan (active) | Project | Work Progress | Logout
```

### Loan Flow Summary
```
/homeloan landing:
  → "I want to apply for a new loan"  → Loan Eligibility Check form (Step 1 of 2)
     → Step 1: Personal Details + Documents → Submit → Step 2: Loan Offers & Review
  → "I have a pre-approved loan"       → Upload Sanction Letter → Proceed
```
