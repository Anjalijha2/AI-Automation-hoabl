# Glossary — XR Portal

**Type:** Glossary
**Last Updated:** 2026-05-10
**Tags:** #glossary #domain/all #status/complete

---

## Related Notes
- [[Backend-Functional-BRD]]
- [[Unit-Status-Flow]]
- [[Roles-and-Permissions]]
- [[Business-Rules]]

---

## Real Estate Domain Terms

| Term | Definition |
|------|-----------|
| **Super Built-Up Area** | Total area including the unit's carpet area plus proportionate share of common areas (lobbies, lift shafts, staircases). Used for pricing. |
| **Carpet Area** | The actual usable floor area inside the unit walls. Always less than super built-up area. |
| **Saleable Area** | Equivalent to super built-up area in this context. The area used to calculate the base price. |
| **Floor Rise** | An additional premium charged per floor. Higher floors cost more. Stored per unit as a fixed amount. |
| **Facing Premium** | Extra cost for units facing a preferred direction (garden view, main road, east-facing). Stored in `premiumCharge`. |
| **Base Price** | The fundamental per-unit price before any premiums or charges. Stored as `basicPrice` on the unit. |
| **FAV (Full Agreement Value)** | The total agreed price of the unit — base price + all premiums + charges. Used as the basis for calculating the booking token amount when `allocationCalcType = PERCENT`. |
| **Agreement Value** | Same as FAV. The value that goes into the sale agreement document. |
| **Booking Token Amount** | The initial payment made when a buyer confirms a unit. A percentage or fixed amount of FAV. Stored as `allocationAmount` on the unit. |
| **Demand Letter** | A formal payment request issued to buyers when a construction milestone is reached. Triggers milestone payment tracking. |
| **Construction-Linked Plan** | A payment structure where buyers pay instalments tied to construction completion stages rather than calendar dates. |
| **Possession** | The handover of the completed unit to the buyer. Final stage of the real estate transaction. |
| **OC (Occupation Certificate)** | Government certificate confirming the building is safe for occupation. Required before possession. |
| **CC (Completion Certificate)** | Certificate confirming construction is complete as per approved plans. |
| **Registry / Registration of Unit** | Legal registration of the property in the buyer's name at the sub-registrar's office. Milestone `ml-rou`. |
| **Stamp Duty** | Government tax levied on the property registration document. Included in the `ml-rou` milestone. |
| **TDS (Tax Deducted at Source)** | 1% tax deducted on property purchases above the threshold value. Tracked as milestone `ml-tds`. |
| **Snag List** | List of defects or incomplete items identified during pre-possession inspection. |
| **Typology** | The unit configuration type — e.g., 1BHK, 2BHK, Villa. In XR Portal: 1 Bed Growth Home, 2 Bed Growth Home, 2 Bed Rise Home, 2 Bed Peak Home. |
| **Tower** | A residential building within the project. Contains floors and units. |
| **Floor** | One level within a tower. Contains multiple units. |
| **Band** | A group of floors within a tower sharing similar pricing or allocation priority. Used in DYNAMIC allocation round-robin. |
| **Band Order** | The sequence in which bands are offered to buyers during DYNAMIC allocation. Configured in Strapi CMS. |
| **Tower Sequence** | The order in which towers are traversed during DYNAMIC allocation round-robin assignment. |
| **RERA** | Real Estate Regulatory Authority. Government body regulating real estate in India. Channel partners must have valid RERA registration. |
| **Heatmap** | Visual representation of unit availability in a tower grid. Green = available, Orange = on hold, Red = booked, Blue = reserved. |

---

## System-Specific Terms

| Term | Definition |
|------|-----------|
| **XR Portal** | The full platform — includes Admin Portal, SM Portal, CP Portal, Buyer Portal, and supporting backend/WebSocket services. Also called HoABL Portal. |
| **Admin Portal** | Web application at `/admin` for administrative staff to manage the full system. |
| **SM Portal** | Web application at `/sales-manager` for Sales Managers to handle callback requests and physical allocation. |
| **CP Portal** | Web application at the root `/` for Channel Partners to register customers and submit JBPs. |
| **Buyer Portal** | Separate Next.js application for home buyers to track their purchase, complete KYC, and participate in allocation. |
| **Registration** | A buyer's formal expression of interest — a record created when a buyer pays the registration amount. Prerequisite for participating in allocation. |
| **Registration Number** | Unique system-generated identifier for each registration. Primary key used across WebSocket, Redis, and all integrations. |
| **RegistrationUnit** | The database record linking a specific registration to a specific unit. Created when a unit is allocated or pre-allocated. |
| **Allocation Campaign** | An admin-created event during which registered buyers can select and book units. Can be STATIC, DYNAMIC, or PHYSICAL_EVENT. |
| **STATIC Campaign** | Open allocation event — all eligible buyers browse and select units simultaneously. First to pay wins. |
| **DYNAMIC Campaign** | Round-based allocation — system auto-assigns units to buyers per round using round-robin algorithm. |
| **PHYSICAL_EVENT Campaign** | In-person event where Sales Managers select units on behalf of walk-in customers. |
| **Warmup** | The pre-campaign data loading process. Loads all towers, floors, units, and registrations into Redis before the campaign goes live. |
| **Hold** | A 20-minute reservation placed on a unit when a buyer initiates payment. Prevents other buyers from taking the same unit. |
| **WINNER** | Status of a registration unit after payment is confirmed. The buyer has successfully booked the unit. |
| **WAITLIST** | Status of a registration when no unit is assigned. Buyer is waiting for their turn. |
| **ALLOCATED** | Status of a registration unit in DYNAMIC allocation when a unit has been assigned but not yet paid for. |
| **PREALLOCATED** | Status when admin manually assigns a unit to a buyer outside of a campaign. |
| **BOOKED** | Status of a unit in the unit master table after payment is confirmed. |
| **AVAILABLE** | Status of a unit that can be selected by buyers. |
| **RESERVED** | Admin-set status for a unit held for a specific buyer outside the campaign system. Shows as blue on heatmap. |
| **REFUGE** | Permanent unit designation — removed from sales inventory permanently (e.g., model apartments, utility spaces). |
| **Round-Robin** | Algorithm used in DYNAMIC allocation to fairly distribute units among buyers based on tower sequence and band order. |
| **AOF (Append-Only File)** | Disk-based log written during allocation events for data durability. Records all WINNER events and lost unit events. Used for Redis recovery. |
| **HV Code** | High Value code — unique identifier assigned to each Channel Partner. Used for tracking and commission attribution. |
| **masterHvCode** | For Member CPs, the HV code of their parent Master CP. Used for hierarchical commission tracking. |
| **JBP (Joint Business Plan)** | Quarterly business commitment plan submitted by Channel Partners. Includes marketing spend, manpower, and booking commitments. |
| **JBP Cycle** | A defined period (usually quarterly) during which CPs submit and fulfil their JBPs. Has OPEN or CLOSED status. |
| **Lead CP (Master CP)** | A Channel Partner who has Member CPs under them. `isLeadCp = true`. |
| **Member CP** | A Channel Partner who reports to a Master CP. `leadCpId` points to the Master CP. |
| **Callback Request** | A scheduled video call between a Sales Manager and a buyer. Lifecycle: REQUESTED → SCHEDULED → CONFIRMED → COMPLETED. |
| **VC (Video Call)** | The actual call between SM and buyer as part of the callback request process. SM records the outcome after the call. |
| **VC Outcome** | One of 10 predefined outcomes recorded by SM after a VC. Certain outcomes trigger the VC_REQUEST discount offer. |
| **MasterConfig** | Key-value configuration store in the database. Typed values (string/number/boolean/json/date etc.) control system behavior without code changes. |
| **Strapi CMS** | Headless content management system used to configure dynamic content and allocation parameters (band order, tower sequence, form fields). |
| **LSQ / LeadSquared** | CRM (Customer Relationship Management) system. All buyer activities synced to LSQ for sales team visibility. |
| **Mavis** | Property ERP system. Source of truth for unit master data. All bookings must exist in both XR Portal and Mavis. |
| **Easebuzz** | Primary payment gateway. Uses hash-redirect flow with HMAC SHA-512 validation. |
| **Razorpay** | Secondary payment gateway. Uses order-based SDK flow. |
| **Easiloan** | FinTech platform for home loan eligibility checks and bank application submission. |
| **Kaleyra** | Communication platform for SMS and WhatsApp messages. |
| **OS Ticket** | External open-source support ticketing system. Buyer tickets are mirrored here. |
| **Azure Blob** | Cloud file storage for all documents (KYC docs, payment proofs, unit images). |
| **Redis** | In-memory cache used for real-time unit availability data during allocation events. |
| **WebSocket** | Bidirectional real-time communication protocol used during allocation events. Buyers, admins, and SMs connect via WebSocket to receive live unit status updates. |
| **Booking Number** | Unique identifier for a booking, used in Mavis integration. Format differs between production and non-production environments. |
| **opportunityId** | LSQ identifier for a registration opportunity. Stored on the Registration record. |
| **prospectId** | LSQ identifier for a buyer/lead. Stored on the User record. |
| **activityId** | LSQ identifier for a specific activity (registration, KYC, booking). Stored on RegistrationUnit. |
| **Paranoid Mode** | Sequelize feature where records are soft-deleted (deletedAt timestamp set) rather than hard-deleted. All major entities use this. |
| **paymentSource** | Field on PaymentTransaction indicating who initiated the payment: `user` (buyer online) or `admin` (offline manual). |
| **isOffline** | Flag on PaymentTransaction indicating a cash/cheque/bank transfer payment that requires admin approval. |
| **bookingTokenActivitySubmitted** | Flag confirming the LSQ Booking Token Activity has been synced after unit payment confirmation. Required before KYC can be initiated. |

---

## Status Terms

| Term | Domain | Meaning |
|------|--------|---------|
| `Open` | Registration | Active registration, payment success, eligible for allocation |
| `Won` | Registration | Buyer has successfully booked a unit |
| `Lost` | Registration | Cancellation requested |
| `Refund` | Registration | Refund processed; excluded from default queries |
| `AVAILABLE` | Unit | Unit is open for selection |
| `HOLD` | Unit | Unit is reserved for 20 minutes during payment |
| `BOOKED` | Unit | Unit is confirmed booked by a buyer |
| `RESERVED` | Unit | Admin hold for a specific buyer (not time-limited) |
| `REFUGE` | Unit | Permanently removed from sales |
| `PREBOOKED` | Unit | Pre-booking state before official campaign |
| `PBT` | Unit | Pre-booking token state |
| `WAITLIST` | RegistrationUnit | No unit assigned |
| `PREALLOCATED` | RegistrationUnit | Admin pre-assigned unit before campaign |
| `ALLOCATED` | RegistrationUnit | Unit assigned in DYNAMIC, payment pending |
| `WINNER` | RegistrationUnit | Payment confirmed, unit secured |
| `HOLD` | RegistrationUnit | Payment in progress (mirrors unit hold) |
| `REFUND` | RegistrationUnit | Unit refunded after cancellation |
| `RUNNING` | AllocationCampaign | Campaign actively accepting buyers |
| `NOT_STARTED` | AllocationCampaign | Campaign configured but not yet started |
| `COMPLETED` | AllocationCampaign | Campaign finished normally |
| `STOPPED` | AllocationCampaign | Campaign stopped by admin |
| `FAILED` | AllocationCampaign | Campaign encountered an error |
| `CANCELLED` | AllocationCampaign | Campaign cancelled before starting |
| `pending` | PaymentTransaction | Payment submitted, awaiting confirmation |
| `completed` | PaymentTransaction | Payment confirmed by gateway |
| `failed` | PaymentTransaction | Payment failed |
| `dropped` | PaymentTransaction | Connection dropped during payment |
| `bounced` | PaymentTransaction | Bank rejection |
| `refunded` | PaymentTransaction | Refund processed |
| `pending` | MilestonePayment | Not yet paid |
| `partial` | MilestonePayment | Partially paid |
| `paid` | MilestonePayment | Fully paid |
| `OPEN` | JBPCycle | Active cycle accepting JBP submissions |
| `CLOSED` | JBPCycle | Cycle closed, no new submissions |
| `ACTIVE` | JBPSubmission | Current active version of a JBP |
| `EXPIRED` | JBPSubmission | Superseded by a newer version |

---

## Role Terms

| Term | Role ID | Portal | Description |
|------|---------|--------|-------------|
| **Admin** | 1 | Admin Portal | Full system access |
| **User / Buyer** | 2 | Buyer Portal | Registered home buyer |
| **CP / Channel Partner** | 3 | CP Portal | Sales agent/broker |
| **SM Admin / Sales Manager Admin** | 4 | SM Portal + Admin Portal | Elevated SM with admin access |
| **SM / Sales Manager** | 5 | SM Portal | Standard sales manager |

---

## Milestone Keys

| Key | Full Name | Stage |
|-----|-----------|-------|
| `ml-or` | On Registration | Registration payment |
| `ml-ual` | Unit Allocation | Booking token payment |
| `ml-hcf` | Home Confirmation | Construction milestone |
| `ml-rou` | Registration of Unit | Stamp duty / registry |
| `ml-tds` | TDS | Tax deduction |

---

## Payment Amount Types

| Constant | Meaning |
|----------|---------|
| `FULL_PRINCIPAL` | Full principal amount without GST |
| `HALF_PRINCIPAL` | Half of the principal amount |
| `GST_ONLY` | Only the GST component |
| `FULL_PRINCIPAL_GST` | Full principal + GST |
| `HALF_PRINCIPAL_GST` | Half principal + GST |

---

## Allocation Calculation Types

| Value | Meaning |
|-------|---------|
| `PERCENT` | Booking token = FAV × allocationPercent / 100 |
| `AMOUNT` | Booking token = fixed allocationAmount value |

---

## Unit Color Codes (Heatmap)

| Color | Hex | Status |
|-------|-----|--------|
| Green | #00FF00 | AVAILABLE |
| Orange | #FFA500 | HOLD (payment in progress) |
| Red | #FF0000 | BOOKED |
| Blue | #0000FF | RESERVED (admin hold) |

---

## Project Typologies

The project has 4 unit typologies:

| Typology Name | Short Form |
|--------------|-----------|
| 1 Bed Growth Home | 1BHK |
| 2 Bed Growth Home | 2BHK (Growth) |
| 2 Bed Rise Home | 2BHK (Rise) |
| 2 Bed Peak Home | 2BHK (Peak) |

The typology drives which units a buyer can be allocated during DYNAMIC campaigns and which pricing applies.
