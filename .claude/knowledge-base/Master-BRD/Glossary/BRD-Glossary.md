# Glossary — BRD

**Type:** Platform Glossary and Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

This glossary defines every term, abbreviation, status value, and code used across the XR Portal. Use it when reading BRD documents, test cases, bug reports, or portal screens. Terms are grouped by domain for easy lookup.

---

## 2. Real Estate Domain Terms

| Term | Definition |
|------|-----------|
| **BSP** | Basic Sale Price — the price per square foot of carpet area. Starting point for all price calculations. |
| **FAV** | Final Agreement Value — the total amount the buyer is legally committed to pay. = Base Price + additions (floor rise, parking, amenities, GST) − offer discounts. |
| **Carpet Area** | The usable floor area inside a unit, measured in square feet. Used to compute Base Price (BSP × carpet area). |
| **Floor Rise** | A per-floor surcharge added to the unit price. Higher floors have higher floor rise charges. |
| **Typology** | The unit type — defined by the number of bedrooms: 1BHK, 2BHK, 3BHK, 4BHK. Each typology has its own BSP and milestone template. |
| **TDS** | Tax Deducted at Source — 1% of FAV, applicable only when FAV ≥ ₹50 lakh. Collected as part of the KYC process. |
| **SDR** | Stamp Duty and Registration — a government tax milestone due at a specific construction stage. |
| **Demand Letter** | Official notification to the buyer that a milestone payment is now due. Admin triggers it per construction stage. |
| **Handover** | Final construction milestone — when the buyer takes possession of the unit. |
| **Sanction Letter** | Pre-approval document from a bank confirming a buyer's home loan eligibility. Required for the self-financing path. |
| **NRI** | Non-Resident Indian — a buyer who is an Indian citizen living abroad. Requires additional processing at registration. |

---

## 3. Platform-Specific Terms

| Term | Definition |
|------|-----------|
| **Registration Number** | Unique identifier assigned to each buyer's registration. Format: `GHNG-XXXXXXXXXX`. Additional units in the same campaign get suffixes: `-A`, `-B`, `-C`. |
| **WINNER** | A buyer whose unit booking has been confirmed (payment webhook received and validated). Gates KYC, home loan, and milestone payment access. |
| **WAITLIST** | A buyer who participated in a campaign but was not allocated a unit. |
| **HV Code** | Home Visit code — a one-time-use code given to a buyer attending a physical allocation event. Used to link their in-person participation to their portal registration. |
| **RegistrationUnit** | The record linking a buyer registration to a specific unit. Created when a unit is allocated (Hold or Booked). |
| **JBP** | Joint Buyer Program — an arrangement where a buyer partners with a co-buyer for financing. Requires a 14-field form submission. |
| **Prospectus ID** | The buyer's identifier in LeadSquared (LSQ) CRM. Stored as `prospectId` on the user record. |
| **Opportunity ID** | The registration's identifier in LeadSquared. Stored as `opportunityId` on the Registration record. |
| **MilestonePaymentTracking** | Database record tracking payment progress for a single milestone. One record per milestone per buyer. Created when KYC is submitted. |
| **TypologyMilestone** | The admin-configured template defining milestone amounts and types for a given typology. Source of truth for generating buyer payment schedules. |
| **AOF** | Append-Only File — Redis persistence mode. Ensures allocation event state (holds, timers) survives a Redis restart. |
| **Cost Sheet** | A document showing the full price breakdown for a buyer's unit: BSP, carpet area, floor rise, parking, amenities, GST, offer discounts, FAV. |
| **Allocation Band** | In DYNAMIC allocation, units are grouped into bands (by tower/floor/configuration). The system assigns units band by band in a configured order. |

---

## 4. Status Reference

### 4a. Registration / Allocation Status

Computed automatically from the buyer's actual allocation outcome. Never manually set.

| Status | Meaning |
|--------|---------|
| `REGISTERED` | Registration payment confirmed. Campaign has not yet run, or buyer did not participate. |
| `NOT_PARTICIPATED` | Registration paid but buyer did not join the campaign session. |
| `WINNER` | At least one unit booking confirmed (RegistrationUnit with WINNER status). |
| `WAITLISTED` | Participated in campaign; no WINNER unit. |
| `CANCELLED` | Booking cancelled by admin. |

### 4b. Unit Status

| Status | Meaning | Heatmap Colour |
|--------|---------|---------------|
| `Available` | Unit can be selected by a buyer | White |
| `Hold` | Unit locked — buyer is in payment flow (max 20 min) | Orange |
| `Booked` | Unit confirmed sold — payment webhook validated | Red |
| `Reserved` | Unit manually reserved by admin — not available for selection | Blue |
| `Waitlisted` | Campaign ended; available units become waitlisted | Grey |

### 4c. Campaign Status

| Status | Meaning |
|--------|---------|
| `SCHEDULED` | Campaign configured, not yet live |
| `WARMUP` | DYNAMIC only — SMs entering buyer preferences before go-live |
| `LIVE` | Campaign active — buyers can select/be assigned units |
| `PAUSED` | Campaign temporarily paused by admin |
| `ENDED` | Campaign closed — allocation window no longer active |

### 4d. Payment / Transaction Status

| Status | Meaning |
|--------|---------|
| `pending` | Payment initiated, awaiting gateway webhook confirmation |
| `success` | Payment confirmed via validated gateway webhook |
| `failed` | Payment failed or rejected by gateway |
| `VERIFICATION` | Offline payment submitted, awaiting admin approval |
| `PAID` | Offline payment approved by admin |

### 4e. Milestone Payment Status

| Status | Meaning |
|--------|---------|
| `pending` | Amount due, no payment received |
| `partial` | Some payment received, balance remaining |
| `paid` | Full amount confirmed paid |

### 4f. JBP Status

| Status | Meaning |
|--------|---------|
| `PENDING` | JBP submitted, awaiting review |
| `APPROVED` | JBP approved by admin |
| `REJECTED` | JBP rejected by admin |

### 4g. Home Loan Approval Status

| Status | Meaning |
|--------|---------|
| `pending` | Application submitted, awaiting processing |
| `approved` | Approved via Easiloan bank flow |
| `admin_approved` | Manually approved by admin (self-financing path) |
| `admin_rejected` | Rejected by admin — excluded from home loan indicator in admin views |

### 4h. Support Ticket Status

| Status | Meaning |
|--------|---------|
| `OPEN` | Ticket created, awaiting team pickup |
| `IN_PROGRESS` | Support team actively working on it |
| `ACTION_REQUIRED` | Team needs more information from buyer |
| `RESOLVED` | Issue addressed |
| `CLOSED` | Ticket formally closed |

### 4i. KYC Tracking Flags

These Boolean flags track KYC and post-KYC sync progress per buyer:

| Flag | Meaning |
|------|---------|
| `isKycSubmitted` | KYC form submitted by buyer |
| `isKycVerified` | KYC verified by admin |
| `bookingTokenActivitySubmitted` | LSQ booking token activity created |
| `bookingFormActivitySubmitted` | LSQ booking form activity created |
| `bookingActivitySubmitted` | LSQ final booking activity created |
| `mavisBookingCreated` | Booking record created in Mavis ERP |
| `mavisUnitUpdated` | Unit status updated in Mavis |
| `mavisBookingFinalUpdated` | Mavis booking moved to Final status |

---

## 5. Role Reference

| Role | ID | Portal Access | Description |
|------|----|--------------|-------------|
| Admin | 1 | Admin Portal | Full access; manages all modules, campaigns, buyers |
| Buyer | 2 | Buyer Portal | Participates in allocation, KYC, payments, support |
| Channel Partner | 3 | CP Portal | Registers buyers, submits JBP, assists with KYC |
| SM Admin | 4 | Admin Portal (limited) | Sales Manager admin — manages SM users |
| Sales Manager | 5 | SM Portal | Handles callbacks, physical events, offline payments |

---

## 6. Allocation Type Reference

| Type | Description |
|------|-------------|
| **STATIC** | First-come-first-served. Buyer sees the live unit grid and selects their own unit. |
| **DYNAMIC** | Round-robin auto-assignment. Buyer does not pick — system assigns a unit from the next available band. SMs enter buyer preferences during WARMUP before campaign goes live. |
| **PHYSICAL_EVENT** | Walk-in event at the project site. SM assists buyer through all 3 allocation screens in person. |

---

## 7. Milestone Type Reference

| Milestone Key | Description |
|--------------|-------------|
| `BOOKING_AMOUNT` | Booking token payment — same amount as the allocation payment |
| `PERCENT` | Percentage of FAV due at this construction stage |
| `SDR` | Stamp Duty and Registration charge |
| `AMOUNT` | Fixed flat amount |
| `FIRST_DISBURSEMENT` | First home loan bank disbursement — credited when bank releases funds |
| `FIRST_DEMAND_PAYMENT` | First demand letter payment |

---

## 8. Payment Amount Type Reference

| Amount Type | Description |
|-------------|-------------|
| `registrationAmount` | Amount paid at registration |
| `bookingAmount` | Amount paid at allocation (booking token) |
| `milestoneAmount` | Amount due per construction milestone |
| `totalPaid` | Cumulative amount paid against a milestone |
| `balanceAmount` | Remaining amount due on a milestone (totalAmount − totalPaid) |

---

## 9. Offer Reference

| Offer | Trigger | Effect |
|-------|---------|--------|
| `EARLY_BIRD` | Admin manual application to eligible registrations | Discount off FAV |
| `HOME_LOAN` | Easiloan flow completed and bank-approved | Discount off FAV |
| `VC_REQUEST` | SM records `VC_DONE_PREFERENCE` or `VC_2_DONE` VC outcome | Discount off FAV |
| `SUBVENTION` | Admin-configured financing scheme | Discount off FAV |

---

## 10. VC Outcome Reference

| Outcome Code | Meaning | Triggers VC_REQUEST Offer? |
|-------------|---------|---------------------------|
| `VC_DONE_PREFERENCE` | Video call completed; buyer expressed unit preference | Yes |
| `VC_2_DONE` | Second video call completed | Yes |
| `NOT_PICKED` | Buyer did not answer | No |
| `BUSY` | Line was busy | No |
| `CALL_LATER` | Buyer asked to be called back | No |
| `SWITCHED_OFF` | Buyer's phone was off | No |
| `INVALID_NUMBER` | Number is not valid | No |
| `DISCONNECTED` | Call dropped | No |
| `VC_NOT_DONE` | Could not connect for video call | No |
| `NOT_INTERESTED` | Buyer declined | No |

---

## 11. Heatmap Colour Guide

Used on the unit grid during allocation events (Buyer Portal, SM Portal, Admin Portal):

| Colour | Unit Status | Meaning |
|--------|------------|---------|
| White | Available | Unit can be selected |
| Orange | Hold | Another buyer is in payment flow — reserved for up to 20 minutes |
| Red | Booked | Unit sold and confirmed |
| Blue | Reserved | Admin-reserved; not available for buyer selection |

---

## 12. Integration Abbreviations

| Abbreviation | Full Name | Purpose |
|-------------|-----------|---------|
| LSQ | LeadSquared | Sales CRM — tracks all buyer lifecycle events |
| Mavis | Mavis ERP | Property ERP — unit inventory, bookings, milestones |
| Easebuzz | Easebuzz | Primary payment gateway |
| Razorpay | Razorpay | Secondary payment gateway |
| Easiloan | Easiloan | Home loan aggregator — eligibility checks + bank offers |
| Azure Blob | Azure Blob Storage | Document and image storage |
| Kaleyra | Kaleyra | SMS and WhatsApp notification provider |
| Strapi | Strapi CMS | Content management — form fields, banners, project info |
| OS Ticket | OS Ticket | External open-source helpdesk ticketing system |
| Nurix | Nurix | In-portal voice call widget |

---

## 13. Registration Number Format

```
GHNG-XXXXXXXXXX
```

- `GHNG` — Project code prefix
- `XXXXXXXXXX` — 10-digit unique numeric sequence

**Multiple units in one campaign:**

```
GHNG-XXXXXXXXXX      ← First unit
GHNG-XXXXXXXXXX-A    ← Second unit
GHNG-XXXXXXXXXX-B    ← Third unit
GHNG-XXXXXXXXXX-C    ← Fourth unit
```

---

## 14. Easiloan Registration Number Suffixes

| Suffix | Path |
|--------|------|
| `-EL` | Easiloan (portal-assisted loan application) |
| `-SL` | Self (buyer declares their own financing) |

---

## 15. Typology Reference

| Code | Description |
|------|-------------|
| 1BHK | 1 bedroom, hall, kitchen |
| 2BHK | 2 bedroom, hall, kitchen |
| 3BHK | 3 bedroom, hall, kitchen |
| 4BHK | 4 bedroom, hall, kitchen |

Each typology has its own BSP, milestone template, and parking configuration.

---

## 16. Support Ticket Category Reference

| Category | Use For | Extra Fields |
|----------|---------|-------------|
| `GENERAL` | General queries, complaints | Note only |
| `CAR_PARKING` | Requesting a parking slot | Number of slots required |
| `CANCELLATION` | Requesting booking cancellation | Reason + 4 documents (Aadhaar, PAN, transaction proof, cancelled cheque) |
| `LOAN` | Home loan assistance or callback | Preferred 2-hour time slot, contact number |

---

## How to Use: Reading Status Badges and Heatmap

---

### Buyer: Understanding Your Status

When you log into the Buyer Portal, your **allocation status** tells you where you are in the journey:

| Status Shown | What It Means | What You Can Do Next |
|-------------|---------------|---------------------|
| Registered | You've paid registration. Campaign not yet run. | Wait for campaign to go live. |
| Not Participated | You missed the campaign window. | Contact your SM or admin. |
| Winner | Your unit booking is confirmed. | Complete KYC. |
| Waitlisted | You were in the campaign but no unit was assigned. | Wait — admin may run another campaign or contact you. |
| Cancelled | Your booking was cancelled. | Contact admin. |

---

### Buyer: Understanding the Heatmap During Allocation

When you are on the unit selection screen during a live allocation:

- **White unit** — Available. You can select it.
- **Orange unit** — Someone else is currently paying for it. It may become available again if their payment fails.
- **Red unit** — Sold. It's permanently booked by another buyer.
- **Blue unit** — Reserved by the developer. Not available.

> If you select a unit and it turns orange with your name, you have **20 minutes** to complete payment before the hold is released.

---

### Admin: Understanding Integration Flags

In the customer detail view, sync flag columns show integration health for each buyer. A `false` value means the sync failed and is awaiting retry:

| Flag | System | What to Do If False |
|------|--------|---------------------|
| `bookingTokenActivitySubmitted` | LSQ | Wait — cron retries every 10 min |
| `bookingFormActivitySubmitted` | LSQ | Wait — cron retries every 10 min |
| `bookingActivitySubmitted` | LSQ | Wait — cron retries every 10 min |
| `mavisBookingCreated` | Mavis | Wait — cron retries every 10 min |
| `mavisBookingFinalUpdated` | Mavis | Wait — cron retries every 10 min |

If any flag is still `false` after 30 minutes, escalate to technical support.

---

## 17. Related Documents

- [[BRD-Business-Rules]] — Full business rule reference by domain
- [[BRD-Integrations]] — Integration descriptions and failure handling
- [[BRD-Allocation-Workflow]] — Allocation flow with status transitions
- [[BRD-Payment-Workflow]] — Payment flow with transaction status reference
- [[BRD-KYC-Workflow]] — KYC flags and trigger events
- [[BRD-Buyer-Portal]] — Buyer Portal overview
- [[BRD-Admin-Portal]] — Admin Portal overview
