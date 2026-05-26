# Registration Workflow

**Type:** End-to-End Workflow
**Last Updated:** 2026-05-10
**Tags:** #workflow/registration #status/complete

---

## Related Notes
- [[Buyer-Portal-BRD]]
- [[CP-Portal-BRD]]
- [[Admin-Portal-BRD]]
- [[Backend-Functional-BRD]]
- [[Payment-Workflow]]
- [[Unit-Status-Flow]]
- [[Integrations]]
- [[Business-Rules]]

---

## Overview

Registration is the process by which a buyer formally expresses interest in purchasing a unit and pays the registration fee. A successful registration creates a record in the system that qualifies the buyer to participate in allocation events. Registration can be initiated by the buyer directly or by a Channel Partner on behalf of a buyer.

---

## Registration Actors

| Actor | Action |
|-------|--------|
| Buyer | Self-registers via Buyer Portal |
| Channel Partner | Registers buyer via CP Portal on their behalf |
| Admin | Views, manages, and can approve/modify registrations |

---

## Registration Prerequisites

- Buyer must have a valid Indian mobile number (OTP-based authentication)
- Buyer must consent to terms and conditions
- Buyer must provide basic personal details (name, email, address)
- Buyer must select a typology (unit type preference)
- Payment must be made to complete registration

---

## End-to-End Registration Flow

### Path A: Buyer Self-Registration

```
1. BUYER AUTHENTICATION
   Buyer navigates to Buyer Portal
   Buyer enters mobile number
   OTP sent via **Epinet SMS** (NOT Kaleyra) <!-- FSD-CORRECTION 2026-05-25 // Source: communication.service.js -->
   Buyer enters OTP to authenticate
   System creates User record if first-time, or retrieves existing
   JWT token issued for session

2. REGISTRATION FORM
   Buyer fills registration form:
   - Personal details (name, date of birth, address)
   - Typology preference (1 Bed / 2 Bed / etc.)
   - Co-applicant details (optional)
   
   Form fields configured by Strapi CMS (content type: form/default-form-field)
   Client-side validation per field

3. CONSENT
   Buyer accepts terms and conditions
   isConsented = true set on User record

4. REGISTRATION RECORD CREATED
   Registration record created in database:
   - status = Open
   - paymentStatus = pending
   - projectId = current project
   - userId = buyer's user ID
   
   RegistrationUnit record created (draft state):
   - status = WAITLIST
   - apartment_type = buyer's typology preference
   - availableForAllocation = false (not yet eligible)

5. PAYMENT INITIATION
   Buyer proceeds to payment screen
   Registration amount displayed
   Buyer selects payment method
   
   PaymentTransaction created:
   - transactionType = 1 (Registration)
   - status = initiated
   - gateway = easebuzz (default)
   
   Buyer redirected to Easebuzz checkout (or Razorpay modal)

6. PAYMENT COMPLETION
   Gateway webhook received by backend
   Hash/signature validated
   
   On SUCCESS:
   - PaymentTransaction.status = completed
   - Registration.paymentStatus = success
   - Registration.status remains Open
   - RegistrationUnit.availableForAllocation = true
   
   On FAILURE:
   - PaymentTransaction.status = failed/dropped/etc.
   - Registration remains in paymentStatus = pending
   - Buyer can retry payment

7. LEADSQUARED SYNC
   New LSQ lead created if buyer not already in LSQ:
   - Buyer name, phone, email, source synced
   - prospectId stored on User record
   
   LSQ Registration Activity created:
   - Registration details and amount
   - opportunityId stored on Registration record
   - activityId stored on Registration record

8. WHATSAPP NOTIFICATION
   Registration confirmation WhatsApp message sent to buyer via Kaleyra
   Message includes registration number and next steps

9. PYTHON/WEBSOCKET NOTIFICATION
   Backend calls /broadcast-registrations
   Buyer's WebSocket connection (if active) receives updated user_details_response
```

### Path B: CP-Initiated Registration

```
1. CP AUTHENTICATION
   CP logs into CP Portal (mobile OTP — same mechanism as buyers)
   CP sees their dashboard with customer list

2. CP SEARCHES FOR BUYER
   CP searches existing customers by phone number
   If buyer not found: CP creates new buyer record (enters buyer's phone number)
   OTP sent to buyer's mobile to verify

3. BUYER VERIFICATION
   Buyer receives OTP and shares it with CP (or CP enters it on-site)
   Buyer's identity confirmed via OTP

4. REGISTRATION FORM (CP fills on behalf of buyer)
   CP fills buyer's personal details
   CP selects typology on behalf of buyer
   brokerId set on registration = CP's user ID
   
   The registration is tagged to the CP for:
   - Commission tracking
   - Customer visibility (CP can only see their own customers)
   - HV code attribution

5. PAYMENT
   Same payment flow as buyer self-registration
   CP facilitates the payment (buyer can pay directly or CP assists)

6. POST-REGISTRATION
   Same LSQ, Kaleyra, WebSocket sync as self-registration
   CP can now see this customer in their customer list
   SM assigned to the CP (smUserId) is notified of new registration
```

---

## Registration Status Lifecycle

```
Registration Created
├── paymentStatus = pending
└── status = Open
        │
        ▼ (payment success)
Registration Active
├── paymentStatus = success
├── status = Open
└── availableForAllocation = true
        │
        ▼ (unit booking confirmed)
Unit Booked
├── status = Won
└── RegistrationUnit.status = WINNER
        │
        ├── (cancellation requested)
        │       ▼
        │   status = Lost
        │       │
        │       ▼ (refund processed)
        │   status = Refund (excluded from default queries)
        │
        └── (KYC completed, payment schedule running)
            status = Won (remains Won through possession)
```

---

## Registration Record Fields

Key fields on the `registrations` table:

| Field | Description |
|-------|------------|
| `registrationNumber` | Unique system-generated ID |
| `status` | Open / Won / Lost / Refund |
| `paymentStatus` | pending / success / failed |
| `availableForAllocation` | Whether buyer can participate in campaigns |
| `projectId` | Which project this registration is for |
| `userId` | The buyer's user ID |
| `opportunityId` | LSQ opportunity ID |
| `activityId` | LSQ registration activity ID |
| `stage` | Free-text stage label (used for search) |

---

## Registration Unit Record (Created With Registration)

The `registration_units` table links a registration to a specific unit:

| Field | Description |
|-------|------------|
| `registrationNumber` | Matches registration |
| `status` | WAITLIST (initially) → changes through allocation lifecycle |
| `apartment_type` | Buyer's typology preference |
| `availableForAllocation` | Mirrors registration eligibility |
| `typology_id` | Numeric typology ID from UnitTypology table |
| `unitId` | Null until unit is allocated |
| `towerId` | Null until unit is allocated |

---

## Multiple Registrations

A buyer CAN have multiple registrations:
- One per project (different projects = different registrations)
- Multiple registrations for the same project are allowed (but only one should be active at a time)

The `withRefunded` scope on Registration allows admin queries to see all records including refunded ones. The default scope excludes Refund status records from all standard views.

---

## Registration Cancellation

```
1. Admin initiates cancellation (or buyer requests via support)
2. Registration.status = Lost
3. RegistrationUnit.status = REFUND
4. Unit released (if allocated): Unit.status = AVAILABLE
5. Refund amount calculated
6. Admin processes refund payment
7. Registration.status = Refund
8. LSQ updated with cancellation activity
9. Kaleyra notification to buyer
```

After status = Refund:
- Record excluded from all standard listing queries
- Only visible when admin explicitly uses `withRefunded` scope
- Buyer no longer sees this registration in their portal

---

## Registration Search and Listing

Admin can search registrations by:
- Buyer first name / last name
- Registration number
- Stage label

Default filters:
- Current project only (projectId filtered)
- Excludes Refund status (unless admin explicitly requests refunded records)
- Paginated results (default 10 per page)

CP can only see registrations where `brokerId` matches their own user ID.

---

## Allocation Status Computation

When displaying registrations to buyers, the system computes an `allocationStatus` field dynamically:

| Condition | Computed Status Shown |
|-----------|----------------------|
| Campaign not running AND registrationUnit.status = WAITLIST | WAITLIST |
| Campaign not running AND registrationUnit.status = WINNER/HOLD/REFUND | Shown as-is (terminal) |
| Campaign running (STATIC) | CHOOSE (buyer can select a unit) |
| Campaign running (DYNAMIC) AND unit allocated in Redis | ALLOCATED |
| Campaign running (DYNAMIC) AND no unit in Redis | WAITLIST |
| availableForAllocation = false | WAITLIST |

This computed status is NOT stored in the database — it is calculated per request based on Redis state and campaign status.

---

## Additional Units

The `isAdditionalUnit` flag on RegistrationUnit allows admin to mark a registration unit as an additional purchase (buyer buying more than one unit). This is tracked separately for reporting and commission purposes.

---

## Walk-In Source Tracking

The `WalkInSource` model tracks how walk-in buyers at physical events arrived (referral source, SM who brought them in, etc.). This data is captured during physical event registration and linked to the Registration record.
