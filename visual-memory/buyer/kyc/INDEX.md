# Visual Memory — Buyer Portal / KYC

**Captured:** 2026-06-04 (updated — full KYC flow captured via manual screenshots); re-verified 2026-06-06 — direct `/kyc` (no `unitId` param) returns EMPTY_GATE (no headings, no form, no applicants table); flow only visible when navigated from Complete KYC button with `?unitId=<base64>`
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat.xrportal.in/kyc?unitId=<base64>)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `kyc-loaded.png` | KYC page — authenticated load (empty, no unitId param) | 2026-06-03 |
| `kyc-initial.png` | KYC page — extended wait (empty) | 2026-06-03 |
| `kyc-direct-load.png` | KYC Add Applicants — via direct URL with unitId | 2026-06-03 |
| `kyc-direct-full.png` | KYC Add Applicants — full page | 2026-06-03 |
| `kyc-form-via-button.png` | KYC Add Applicants — payment success banner + applicant table | 2026-06-03 |
| `kyc-form-via-button-full.png` | KYC Add Applicants — full page (via Complete KYC button) | 2026-06-03 |
| `kyc-form-scrolled.png` | KYC Add Applicants — scrolled | 2026-06-03 |
| `kyc-add-applicants.png` | KYC Add Applicants — 1004-Pride 2 Bed (GHNG-K) — full view | 2026-06-04 |
| `kyc-add-applicant-form.png` | Add Applicant drawer — personal details + document upload fields | 2026-06-04 |
| `kyc-summary-confirm.png` | KYC Summary/Confirm step — booking summary + T&C checkbox | 2026-06-04 |
| `kyc-submitted-success.png` | KYC Submitted Successfully — success state + Download Unit Details | 2026-06-04 |
| `kyc-booking-form-pdf.png` | Digital Booking Form PDF preview (browser print dialog) | 2026-06-04 |

---

## Key Structural Notes

### Page / Route
- **URL:** `https://uat.xrportal.in/kyc?unitId=<base64-encoded-unit-id>`
- Requires authentication — unauthenticated access redirects to `/`
- Direct `/kyc` (no params) → blank content area (no form shown)
- Correct access: via "Complete KYC" button on Home Dashboard OR Allotment page

### KYC Flow (4 Steps)
```
Step 1: Add Applicants   → Add applicant(s), click "Confirm"
Step 2: Add Applicant Form (drawer) → Fill personal + document upload per applicant
Step 3: Summary/Confirm  → Review booking details, tick T&C, click "Confirm"
Step 4: KYC Submitted Successfully → Success page with Download Unit Details link
```

---

### Step 1: Add Applicants

**URL example:** `uat.xrportal.in/kyc?unitId=OTc4NA==`

**Top banner (post-payment celebration):**
```
icon: ✓ (green confetti animation)
h2/h3: "Payment successful!"
text: "You're just one step away from your dream home. Confirm your Applicant details & Download your Booking form with all the details."
```

**Add Applicants section:**
```
h3: "Add Applicants"
warning: "Applicants can only be your blood relatives (parents, spouse, siblings, or children)."
  (orange/red warning icon + text)

Table header: "[unitNumber] - [towerName] - [type] ([size] sq.ft.)"
  Example: "1004 - Pride - 2 Bed Growth Home (485 sq.ft.)"

Table columns: Applicant | Relationship | Action

Row (primary applicant, always present):
  Applicant:     "[firstName] [lastName]"   e.g., "ishaaaaan karnik"
  Relationship:  "Self"
  Action:        "Verify Details" (link with orange person-icon) | 🗑️ (delete icon)

Footer: "Max. 4 Applicants allowed"
```

**Buttons:**
```
button "+ Add Applicant"          — green outline, adds new applicant row
button "< Go to Home"             — white outline, navigates back to /home
button "Confirm >"                — grey when validation incomplete, green when ready
```

**Key selectors:**
```
h3 or text: "Payment successful!"
h3 or text: "Add Applicants"
warning text: "Applicants can only be your blood relatives..."
button   filter({ hasText: /\+ add applicant/i })
button   filter({ hasText: /verify details/i })
button   filter({ hasText: /confirm/i })
button   filter({ hasText: /go to home/i })
text: "Max. 4 Applicants allowed"
```

---

### Step 2: Add Applicant Drawer Form

**Triggered by:** "Verify Details" link on applicant row

**Drawer title:** "Add Applicant" (with ✕ close button)

**Personal Details section:**
```
First Name*:           input (text)
Last Name*:            input (text)
Mobile Number*:        input (tel)
Email Address*:        input (email)
Full Current Address*: textarea
Pincode*:              input (text)
Relationship*:         select dropdown
  Options: Self | (blood relatives list)
```

**Upload Documents section:**
```
h4/h5: "Upload Documents"

Upload photograph*:      button "Upload"   — accepts: Photo
PAN Number*:             input (text)
Upload PAN Card*:        button "Upload"   — accepts: Pan Card
Aadhaar Number*:         input (text)
Aadhaar Card (Front)*:   button "Upload"   — accepts: Aadhaar Front
Aadhaar Card (Back)*:    button "Upload"   — accepts: Aadhaar Back
```

**Buttons:**
```
button "Cancel"    — closes drawer
button "Submit >"  — green, submits applicant details
```

**Key selectors:**
```
div[role="dialog"] (or drawer container)
input[placeholder*="First Name" i] or nth-of-type(1)
input[placeholder*="Last Name" i]
input[placeholder*="Mobile" i]
input[placeholder*="Email" i]
textarea (Full Current Address)
input[placeholder*="Pincode" i]
select (Relationship dropdown)
button   filter({ hasText: /upload/i }).nth(0)   — photograph
input[placeholder*="PAN" i]
button   filter({ hasText: /upload/i }).nth(1)   — PAN card
input[placeholder*="Aadhaar Number" i]
button   filter({ hasText: /upload/i }).nth(2)   — Aadhaar front
button   filter({ hasText: /upload/i }).nth(3)   — Aadhaar back
button   filter({ hasText: /submit/i })
button   filter({ hasText: /cancel/i })
```

**Test account data visible:**
```
First Name: ishaaaaan | Last Name: karnik
Mobile: 8888888888 | Email: ISHaaAAN.KARNIK@GMAIL.COM
Address: Naigon to boriwali | Pincode: 400060
Relationship: Self
PAN Number: BAJPC4350M | Aadhaar: 216167293627
```

---

### Step 3: Summary / Confirm

**URL example:** `uat.xrportal.in/kyc?unitId=OTc4Mw==`

**Top:** Same "Payment successful!" banner

**Summary section:**
```
h3: "Summary"

Table columns: Registration Details | Booking Number | Selected Unit | Applicant Details

Example row:
  Registration Details: "GHNG-1000008364-I" + date (2026-05-24 16:08:10)
  Booking Number:       "GHNG-1000008364-I-BKD"
  Selected Unit:        "1201 - Pride, 1 Bed Growth Home (323 sq.ft.)"
  Applicant Details:    "1 Applicant" (person icon) + "Edit" link
```

**Terms & Conditions:**
```
checkbox: "I confirm to HoABL Terms & Conditions and Privacy Policy"
  link text: "Terms & Conditions"
  link text: "Privacy Policy"
```

**Buttons:**
```
button "< Back"      — returns to Add Applicants step
button "Confirm >"   — grey until checkbox ticked, then green
```

**Key selectors:**
```
h3: "Summary"
table row with booking details
input[type="checkbox"]   — T&C confirmation
button   filter({ hasText: /confirm/i })
button   filter({ hasText: /back/i })
a   filter({ hasText: /terms & conditions/i })
```

---

### Step 4: KYC Submitted Successfully

**URL example:** `uat.xrportal.in/kyc?unitId=OTc4Mw==` (same URL, new state)

**Success state:**
```
icon: ✓ animated green badge (with animated dots/rays around it)
h2/h3: "KYC submitted successfully!"
text: "Congratulations you have completed the Growth Online Booking Process, Please download your Booking form with all the details."
```

**Summary table:**
```
Columns: Registration Number | KYC Number | Unit | No. of Applicants | Process Status

Example row:
  Registration Number: "GHNG-1000008364-I"
  KYC Number:          "GHNG-1000008364-I-KYC"
  Unit:                "1201 - Pride, 1 Bed Growth Home (323 sq.ft.)"
  No. of Applicants:   "1 Applicant" (person icon)
  Process Status:      "KYC Completed" (green ✓) + "Download your Unit Details" (link, PDF icon)
```

**Buttons:**
```
button "Go to Home >"   — green, returns to /home
```

**Download Unit Details:**
```
link/button: "Download your Unit Details"   — triggers PDF print dialog
  PDF title: "Digital Booking Form"
  PDF content: registration details, transaction IDs, unit number, tower name, applicant details
```

**Key selectors:**
```
h3 or text: "KYC submitted successfully!"
link   filter({ hasText: /download your unit details/i })
button   filter({ hasText: /go to home/i })
td   filter({ hasText: /KYC Completed/i })
```

---

### Navigation Sidebar
```
Home | Registration | Allotment | Homeloan | Project | Work Progress | Logout
```

### Test Account States (8888888888)
```
GHNG-1000008364-C → unit 1201-Glory → KYC Completed
GHNG-1000008364-I → unit 1201-Pride → KYC Completed (new, captured 2026-06-04)
GHNG-1000008364-J → unit 1004-Pride 2 Bed → Payment done, KYC pending
Multiple other registrations → Booked, KYC pending
```
