# Channel Partner (CP) Portal — Business Requirements Document

**Portal:** Channel Partner / Growth Partner Portal
**Project:** XR Portal (HoABL Real Estate Platform)
**URL:** `/` (root, after CP login)
**Last Updated:** 2026-05-10 (enriched with step-by-step customer registration flow, validations, NRI handling)
**Sprint Reference:** BRD Reverse Engineering Sprint
**Tags:** #portal/cp #type/brd #status/enriched

---

## Related Notes
- [[Roles-and-Permissions]]
- [[Registration-Workflow]]
- [[Module - JBP Management]]
- [[KYC-Workflow]]
- [[Admin-Portal-BRD]]
- [[Module - Channel Partners]]

---

## 1. Portal Overview

The Channel Partner Portal (also called the Growth Partner Portal) is the interface used by channel partners (real estate brokers and agencies) who bring customer leads to the XR Portal platform. CPs use this portal to:

- Register new customers (buyers) under their referral code
- Track the status of their referred customers
- Submit and manage their Joint Business Plans (JBP)
- Access project information and marketing materials

This portal shares the same codebase as the SM Portal but is served at the root URL path (`/`) and accessible to users with role ID 3 (CP). The CP has a separate login page at `/login`.

---

## 2. User Types

| Role | Role ID | Description |
|------|---------|-------------|
| CP (Channel Partner) | 3 | Registered growth partner who refers buyers |

CPs are further classified:
- **Lead CP (Master CP):** `isLeadCp = true` — a senior CP who may manage member CPs
- **Member CP:** A CP associated with a master CP via `leadCpId`

---

## 3. Business Purpose

The CP Portal serves as a bridge between the developer (XR/HoABL) and the buyer market through a network of channel partners. Its purpose is to:

1. Allow CPs to formally register interested buyers into the system
2. Provide CPs visibility into the status of their referred customers
3. Capture CPs' business commitments through the JBP process
4. Give CPs access to project information needed for sales pitches

---

## 4. Module List

```
CP Portal
├── 1. Dashboard (Customer Registration and Tracking)
├── 2. Leads Management
├── 3. JBP (Joint Business Plan) Submission
├── 4. KYC Assistance
└── 5. Project Information
    ├── 5a. Project Overview
    ├── 5b. About the Project
    ├── 5c. Gallery
    ├── 5d. Amenities
    ├── 5e. Documents
    ├── 5f. Key Points
    └── 5g. Videos
```

---

## 5. Module Details

---

### Module 1: Dashboard — Customer Registration and Tracking

**Purpose:** Central hub for CPs to register new buyers and see the status of all customers they have referred.

**Screen:** `/dashboard`

**Registration Form Fields (RegisterForm):**
- Customer first name, last name
- Mobile number (with country code)
- Email address
- Purchase purpose (e.g., investment, own use)
- Home loan intent (yes/no)
- Budget amount
- Preferred floor range (min to max)
- Undertaking agreement (customer must agree to T&C — UndertakingContent)
- Walk-in source (how the customer came — CP link, walk-in, etc.)

**Customer Table Columns:**
- Customer name
- Registration number
- Unit allocated (if any)
- Allocation status
- KYC completion
- Payment status

**Actors:** CP

**Functional Flow:**
1. CP logs in and lands on the Dashboard
2. CP views all customers they have registered (filtered by their broker ID)
3. CP can initiate new customer registration by filling the RegisterForm
4. System creates a new Registration record linked to the CP's brokerId
5. System generates a unique registration number
6. Customer is notified (WhatsApp/SMS)
7. CP can track the customer's progress through the table

**Registration Validation Rules:**
- Mobile number must be valid (Indian format or with country code for NRI)
- Email is validated
- Purchase purpose is required
- Undertaking/consent must be accepted before submission
- Duplicate check: same phone/email should not register twice for the same project

**Step-by-Step: CP Registering a New Customer**
1. CP logs in at `/login` with mobile OTP
2. CP is redirected to `/dashboard` after successful login
3. CP sees the customer table with all customers they have registered
4. CP clicks "Register Customer" or similar button to open RegisterForm
5. CP fills in customer details:
   - First Name, Last Name (required)
   - Mobile Number with country code (required; Indian format for domestic, international for NRI)
   - Email address (required, validated format)
   - Purchase Purpose (required — e.g., investment, own use)
   - Home Loan Intent: Yes or No (required)
   - Budget Amount (required)
   - Preferred Floor Range: minimum and maximum floor numbers
   - Walk-in Source (how the customer came to know about the project)
6. Customer must agree to Undertaking/T&C (UndertakingContent) — checkbox is required before submission
7. CP clicks Submit
8. System validates: mobile and email must not already exist for this project (duplicate check)
9. On success:
   - New Registration record created with status = Open, paymentStatus = pending
   - Registration number generated (format: GHNG-XXXXXXXXXX)
   - `brokerId` set to CP's user ID
   - `walkInSourceXrCode` set to CP's hvCode
   - `availableForAllocation` defaults to true
   - Customer notified via SMS/WhatsApp (Kaleyra)
10. New customer appears in CP's dashboard table

**Registration Number Format (confirmed from test data):**
Format: `GHNG-XXXXXXXXXX` (10 digits after hyphen)
Additional unit registrations add a suffix: `GHNG-XXXXXXXXXX-A`, `-B`, `-C`, etc.

**Customer Table Columns:**
Customer Name | Registration Number | Unit Allocated | Allocation Status | KYC Completion | Payment Status

**Allocation Status Values visible to CP:**
WAITLIST | PREALLOCATED | ALLOCATED | WINNER | HOLD | REFUND

**Validations:**
- Mobile number must be valid Indian format (10 digits) or international format with country code for NRI
- Email must follow standard email format
- Duplicate check: if same mobile OR email already exists for a registration in this project, submission is rejected
- T&C/Undertaking consent checkbox is mandatory — form cannot be submitted without it
- Purchase purpose is required — no default

**NRI Customer Handling:**
- NRI customers use `nriIndianPhone` field for their Indian contact number
- International country code is supported in the mobile number field
- NRI flag affects OTP channel selection

**Business Rules:**
- When a CP registers a customer, the registration record has `brokerId` = CP's user ID
- The `walkInSourceXrCode` is set to the CP's hvCode
- Registrations start with status = Open and paymentStatus = pending
- The `availableForAllocation` flag defaults to true
- CP can only see customers they registered (brokerId match)

---

### Module 2: Leads Management

**Purpose:** View and manage leads assigned to the CP for follow-up.

**Screen:** `/leads`

**Key Data:**
- Lead name, contact details
- Lead source
- Lead status/stage from LSQ (LeadSquared CRM)
- Last activity

**Actors:** CP

**Functional Flow:**
1. CP views leads assigned in LeadSquared
2. CP tracks follow-up activity
3. CP can convert a lead to a registration from this screen

**Business Rules:**
- Lead data is synced from LeadSquared CRM
- CPs see only their own leads (filtered by assignee)

---

### Module 3: JBP (Joint Business Plan) Submission

**Purpose:** CPs submit their quarterly/periodic business plans committing to marketing activities and booking targets.

**Screens:** `/jbp`, `/jbp/*`

**JBP Form Fields (JbpForm):**
- Manpower count committed
- Investment range (budget range for marketing spend)
- Inserts required (print marketing collateral count)
- Standees required
- Kiosk required
- Telecallers count required
- SMS blast count (volume)
- WhatsApp blast count (volume)
- Growth Hub participation (boolean)
- Registration commitment (number of registrations the CP commits to)
- Net booking commitment (number of bookings committed)
- Brokerage amount expectation
- Activities planned (JSON: list of marketing activities with dates)
- Digital channels (JSON: social media, paid ads, SEO, etc.)

**JBP Submission Flow:**
1. CP opens JBP page
2. System shows available open JBP cycles
3. CP fills in the JBP form (JbpForm component)
4. CP submits the plan
5. System creates a JbpSubmission record (status = ACTIVE, version = 1)
6. CP sees a Thank You page (Thankyou component)
7. If CP needs to edit the plan, they submit an edit request (JbpEditRequestForm)
8. Admin reviews and approves/rejects the edit request
9. If approved, a new version of the submission is created

**JBP Edit Request Flow:**
- CP submits an edit request with the changes they want to make
- Request is stored in jbp_edit_requests table
- Admin reviews via the admin portal (ReviewEditRequestModal)
- On approval, the submission is updated (version increments)
- Old version is marked EXPIRED

**Business Rules:**
- One active JBP submission per CP per cycle
- Editing requires admin approval — CPs cannot self-edit after submission
- Cycle must be OPEN for submissions to be accepted
- JBP submissions are version-tracked

---

### Module 4: KYC Assistance

**Purpose:** CP assists the customer in completing the KYC form after unit allocation.

**Screen:** `/kyc`

**KYC Form Fields:**
- Primary applicant details: Full name, date of birth, PAN, Aadhaar, address, occupation, income
- Co-applicant details (same fields, repeatable for multiple co-applicants — DynamicAddUnitFields)
- Document uploads: Aadhaar front, Aadhaar back, PAN card, passport photo

**Functional Flow:**
1. After a customer is allocated a unit, CP can access the KYC form on their behalf
2. CP enters primary applicant details
3. CP adds co-applicants if needed
4. CP uploads scanned documents to Azure Blob Storage
5. CP submits the KYC form
6. System updates `isKycSubmitted = true` on the registration unit
7. System uploads documents to LeadSquared
8. KYC PDF is generated and stored

**Business Rules:**
- KYC can only be submitted after unit allocation is confirmed
- Documents are stored in Azure Blob Storage with organized naming conventions
- Maximum file size and format restrictions apply to document uploads
- E-verification via OTP can be completed to confirm authenticity (eVerificationCompleted flag)

---

### Module 5: Project Information

**Purpose:** Give CPs access to project marketing materials and information to support their sales conversations.

**Screens:**
- `/project` → Project overview with tabs
- `/project1/about` → About the project
- `/project1/gallery` → Photo gallery
- `/project1/amenities` → Amenities list
- `/project1/documents` → RERA and project documents
- `/project1/keyPoints` → Key selling points
- `/project1/videos` → Video tours

**Content Source:** Strapi CMS (fetched via backend API)

**Actors:** CP

**Functional Flow:**
1. CP navigates to project info section
2. System fetches project content from Strapi
3. CP browses photos, amenities, documents, videos
4. CP can share project information links with prospective buyers

**Business Rules:**
- Content is managed by admin via CMS
- Documents section includes RERA registration documents for legal compliance
- All content is read-only for CPs

---

## 6. Navigation Structure

```
/ (CP Portal root, redirects to /dashboard after login)
├── /dashboard/*        → Customer list and registration
├── /leads/*            → Lead management
├── /jbp/*              → JBP submission and tracking
│   ├── /jbp            → JBP form/current submission
│   └── /jbp/thank-you  → Submission confirmation
├── /kyc/*              → KYC form for allocated customers
└── /project1/*         → Project information
    ├── /project1/about
    ├── /project1/gallery
    ├── /project1/amenities
    ├── /project1/documents
    ├── /project1/keyPoints
    └── /project1/videos
```

---

## 7. Authentication

- CP login page at `/login` (root-level public route)
- Mobile OTP-based authentication
- JWT token stored in session
- Role ID 3 (CP) required for access

**CP Registration Completion:**
- CPs must complete their registration profile (isCpRegistrationCompleted = true) before accessing the portal
- An incomplete registration redirects the CP to complete their profile (RegisterCp component)

---

## 8. CP Hierarchy and Referral Tracking

**Master CP vs Member CP:**
- Master CP (`isLeadCp = true`) can have multiple Member CPs under them
- Member CPs are linked to their Master CP via `leadCpId`
- `masterHvCode` stores the Master CP's HV code for quick lookup

**Referral Link:**
- Each CP has a unique `hvCode` (HV Code)
- Buyers who register through a CP's referral link have `walkInSourceXrCode` = CP's hvCode
- This tracks which CP gets credit for a registration/booking

**Commission Tracking:**
- Commission logic exists at the transaction level (`cpId` on PaymentTransaction)
- `cpId` being present on a transaction indicates it was via CP referral

---

## 9. Integration Points

| Integration | Purpose |
|-------------|---------|
| LeadSquared (LSQ) | Lead data sync, KYC document upload |
| Azure Blob Storage | Document storage for KYC uploads |
| Kaleyra | SMS/WhatsApp notifications to customers |
| Strapi CMS | Project content fetching |

---

## 10. Edge Cases

- CP attempts to register a customer already in the system → duplicate detection must fire
- CP's RERA number expires → access restrictions should apply
- Customer's undertaking agreement must be captured and stored as legal proof
- NRI customers have special phone number format (nriIndianPhone field)

---

## 11. Notifications

CPs and their customers receive notifications at key milestones:
- Registration confirmation
- Allocation campaign start
- Unit allocation success
- KYC submission confirmation
- Payment receipt
